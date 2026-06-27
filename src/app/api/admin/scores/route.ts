import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import {
  computeResult,
  computeRGResult,
  type JudgeScore,
  type PanelJudge,
} from '@/components/scoring/types'

const supabaseAdmin = getSupabaseAdmin()

type ScoreRow = {
  sectionPanelJudgeId: string
  ejScore?: number | null
  ajScore?: number | null
  djDifficulty?: number | null
  djPenalty?: number | null
  cjpPenalty?: number | null
  dbScore?: number | null
}

async function getAuthedClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  )
}

async function assertCanManageCompetitionScores(userId: string, competitionId: string) {
  const supabase = await getAuthedClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('auth_id', userId)
  if (!profiles?.length) return false
  if (profiles.some((p) => p.role === 'super_admin' || p.role === 'admin')) return true
  const { data: comp } = await supabase
    .from('competitions')
    .select('admin_id')
    .eq('id', competitionId)
    .single()
  return !!comp && profiles.some((p) => p.id === comp.admin_id)
}

function parseOptionalNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : null
}

async function publishRoutineResult(
  sessionId: string,
  teamId: string,
  competitionId: string,
  resultStatus: 'provisional' | 'approved',
) {
  const [{ data: session }, { data: comp }] = await Promise.all([
    supabaseAdmin
      .from('sessions')
      .select('id, section_id, panel_id')
      .eq('id', sessionId)
      .single(),
    supabaseAdmin
      .from('competitions')
      .select('sport_type')
      .eq('id', competitionId)
      .single(),
  ])
  if (!session || !comp) throw new Error('Session or competition not found')

  const { data: spjs } = await supabaseAdmin
    .from('section_panel_judges')
    .select('id, role, role_number')
    .eq('section_id', session.section_id)
    .eq('panel_id', session.panel_id)

  const { data: scoreRows } = await supabaseAdmin
    .from('scores')
    .select('section_panel_judge_id,ej_score,aj_score,dj_difficulty,dj_penalty,cjp_penalty,db_score')
    .eq('session_id', sessionId)
    .eq('team_id', teamId)

  const panelJudges: PanelJudge[] = (spjs ?? []).map((s) => ({
    id: s.id,
    name: '',
    role: s.role as PanelJudge['role'],
    roleNumber: s.role_number,
  }))

  const judgeScores: JudgeScore[] = (scoreRows ?? []).map((s) => ({
    panelJudgeId: s.section_panel_judge_id,
    ejScore: s.ej_score,
    ajScore: s.aj_score,
    djDifficulty: s.dj_difficulty,
    djPenalty: s.dj_penalty,
    cjpPenalty: s.cjp_penalty,
    dbScore: s.db_score,
  }))

  const perfId = `${sessionId}_${teamId}`
  const isRg = comp.sport_type === 'rg'

  if (isRg) {
    const rjJudge = panelJudges.find((j) => j.role === 'RJ')
    const rjRow = rjJudge ? judgeScores.find((s) => s.panelJudgeId === rjJudge.id) : null
    const rjPenalty = rjRow?.cjpPenalty ?? 0
    const result = computeRGResult(perfId, judgeScores, panelJudges, rjPenalty, resultStatus)
    const { error } = await supabaseAdmin.from('routine_results').upsert({
      session_id: sessionId,
      team_id: teamId,
      e_score: result.eScore,
      a_score: result.aScore,
      da_score: result.daScore ?? 0,
      db_score: result.dbScore ?? 0,
      rj_penalty: result.rjPenalty ?? 0,
      final_score: result.finalScore,
      dif_score: null,
      dif_penalty: null,
      cjp_penalty: null,
      status: resultStatus,
    }, { onConflict: 'session_id,team_id' })
    if (error) throw error
    return
  }

  const cjpJudge = panelJudges.find((j) => j.role === 'CJP')
  const cjpRow = cjpJudge ? judgeScores.find((s) => s.panelJudgeId === cjpJudge.id) : null
  const cjpPenalty = cjpRow?.cjpPenalty ?? 0
  const result = computeResult(perfId, judgeScores, panelJudges, cjpPenalty, resultStatus)

  const djJudgeIds = panelJudges.filter((j) => j.role === 'DJ').map((j) => j.id)
  let djPenaltyDetail: Database['public']['Tables']['routine_results']['Insert']['dj_penalty_detail'] = null
  if (djJudgeIds.length > 0) {
    const { data: djScores } = await supabaseAdmin
      .from('scores')
      .select('dj_flags')
      .in('section_panel_judge_id', djJudgeIds)
      .eq('session_id', sessionId)
      .eq('team_id', teamId)
      .not('dj_flags', 'is', null)
    djPenaltyDetail = djScores?.[0]?.dj_flags ?? null
  }

  const { error } = await supabaseAdmin.from('routine_results').upsert({
    session_id: sessionId,
    team_id: teamId,
    e_score: result.eScore,
    a_score: result.aScore,
    dif_score: result.difScore,
    dif_penalty: result.difPenalty,
    cjp_penalty: result.cjpPenalty,
    final_score: result.finalScore,
    status: resultStatus,
    dj_penalty_detail: djPenaltyDetail,
  }, { onConflict: 'session_id,team_id' })
  if (error) throw error
}

async function syncTvStateForPublishedResult(
  competitionId: string,
  sessionId: string,
  teamId: string,
  resultStatus: 'provisional' | 'approved',
) {
  const { error } = await supabaseAdmin.from('tv_state').upsert({
    competition_id: competitionId,
    session_id: sessionId,
    team_id: teamId,
    revealed: resultStatus === 'approved',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'competition_id' })
  if (error) throw error
}

// POST /api/admin/scores — upsert judge scores for one team in one session (admin / comp-admin)
export async function POST(req: NextRequest) {
  const supabase = await getAuthedClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    competitionId?: string
    sessionId?: string
    teamId?: string
    scores?: ScoreRow[]
    /** @deprecated use queueOnTv — kept for older clients */
    publishResult?: boolean
    queueOnTv?: boolean
    resultStatus?: 'provisional' | 'approved'
  }

  const { competitionId, sessionId, teamId, scores, publishResult, queueOnTv, resultStatus } = body
  if (!competitionId || !sessionId || !teamId || !scores?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!(await assertCanManageCompetitionScores(user.id, competitionId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('id, competition_id')
    .eq('id', sessionId)
    .single()
  if (!session || session.competition_id !== competitionId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
  }

  const rows = scores
    .map((s) => ({
      session_id: sessionId,
      team_id: teamId,
      section_panel_judge_id: s.sectionPanelJudgeId,
      ej_score: parseOptionalNumber(s.ejScore),
      aj_score: parseOptionalNumber(s.ajScore),
      dj_difficulty: parseOptionalNumber(s.djDifficulty),
      dj_penalty: parseOptionalNumber(s.djPenalty),
      cjp_penalty: parseOptionalNumber(s.cjpPenalty),
      db_score: parseOptionalNumber(s.dbScore),
      updated_at: new Date().toISOString(),
    }))
    .filter((r) =>
      r.ej_score != null ||
      r.aj_score != null ||
      r.dj_difficulty != null ||
      r.dj_penalty != null ||
      r.cjp_penalty != null ||
      r.db_score != null,
    )

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No scores to save' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('scores')
    .upsert(rows, { onConflict: 'session_id,team_id,section_panel_judge_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Always compute + upsert routine_results so public results, rankings, and judge CJP see finals.
  const status = resultStatus ?? 'approved'
  const shouldQueueTv = queueOnTv ?? publishResult ?? false
  try {
    await publishRoutineResult(sessionId, teamId, competitionId, status)
    if (shouldQueueTv) {
      await syncTvStateForPublishedResult(competitionId, sessionId, teamId, status)
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to publish result'
    return NextResponse.json({ error: msg, saved: rows.length }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    saved: rows.length,
    published: true,
    queuedOnTv: shouldQueueTv,
    resultStatus: status,
  })
}
