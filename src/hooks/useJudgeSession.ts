'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useProfile } from '@/contexts/ProfileContext'
import type { PanelJudge, MockPerf, JudgeScore, RoutineResult, PenaltyState } from '@/components/cjp/types'
import type { SessionStatus } from '@/components/judge/JudgeSession'

// ─── types ────────────────────────────────────────────────────────────────────

export type JudgeSessionData = {
  loading:       boolean
  sessionId:     string | null
  sessionStatus: SessionStatus
  currentPerfId: string | null
  currentPerf:   MockPerf | null
  assignedRoles: PanelJudge[]
  panelJudges:   PanelJudge[]
  performances:  MockPerf[]
  judgeScores:   Record<string, JudgeScore[]>
  results:       Record<string, RoutineResult>
  djMethod:      string | null
  ejMethod:      string | null
  handleOpen:              (perfId: string) => Promise<void>
  handleSkip:              (perfId: string) => void
  handleCJPSubmit:         (status: 'provisional' | 'approved', result: RoutineResult, penaltyDetail?: PenaltyState | null) => Promise<void>
  handleReopenScore:       (perfId: string, panelJudgeId: string | 'all') => Promise<void>
  handleJudgeScoreSubmit:  (score: JudgeScore) => Promise<void>
  handleEditScore:         (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useJudgeSession(): JudgeSessionData {
  const supabase = useMemo(() => createClient(), []) // eslint-disable-line react-hooks/exhaustive-deps
  const router = useRouter()
  const { activeProfile } = useProfile()
  const [loading,       setLoading]       = useState(true)
  const [sessionId,     setSessionId]     = useState<string | null>(null)
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('waiting')
  const [currentPerfId, setCurrentPerfId] = useState<string | null>(null)
  const [assignedRoles, setAssignedRoles] = useState<PanelJudge[]>([])
  const [panelJudges,   setPanelJudges]   = useState<PanelJudge[]>([])
  const [performances,  setPerformances]  = useState<MockPerf[]>([])
  const [judgeScores,   setJudgeScores]   = useState<Record<string, JudgeScore[]>>({})
  const [results,       setResults]       = useState<Record<string, RoutineResult>>({})
  const [djMethod,      setDjMethod]      = useState<string | null>(null)
  const [ejMethod,      setEjMethod]      = useState<string | null>(null)

  const sessionIdRef = useRef<string | null>(null)
  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])

  // ── #8: prevent back navigation while in an active session ───────────────────
  useEffect(() => {
    if (!sessionId) return
    window.history.pushState(null, '', window.location.href)
    function handlePopState() {
      window.history.pushState(null, '', window.location.href)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [sessionId])

  // ── initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (!activeProfile) return
      const { data: judge } = await supabase
        .from('judges').select('id').eq('id', activeProfile.id).single()
      if (!judge) { setLoading(false); return }

      const { data: spjs } = await supabase
        .from('section_panel_judges')
        .select('id, section_id, panel_id, role, role_number')
        .eq('judge_id', judge.id)
      if (!spjs?.length) { setLoading(false); return }

      const sectionIds = [...new Set(spjs.map(s => s.section_id))]
      const panelIds   = [...new Set(spjs.map(s => s.panel_id))]

      const { data: allSessions } = await supabase
        .from('sessions')
        .select('id, name, status, section_id, panel_id, competition_id, current_team_id, age_group, category, routine_type, dj_method, ej_method')
        .in('section_id', sectionIds)
        .in('panel_id',   panelIds)

      if (!allSessions?.length) { setLoading(false); return }

      const spjPairs = new Set(spjs.map(s => `${s.section_id}|${s.panel_id}`))
      const mySessions = allSessions.filter(s => spjPairs.has(`${s.section_id}|${s.panel_id}`))
      if (!mySessions.length) { setLoading(false); return }

      const session = mySessions.find(s => s.status === 'active') ?? mySessions[0]

      const mySpjsForSession = spjs.filter(
        s => s.section_id === session.section_id && s.panel_id === session.panel_id
      )

      const { data: allSpjs } = await supabase
        .from('section_panel_judges')
        .select('id, judge_id, role, role_number')
        .eq('section_id', session.section_id)
        .eq('panel_id',   session.panel_id)

      const judgeIds = [...new Set((allSpjs ?? []).filter(s => s.judge_id).map(s => s.judge_id as string))]
      const [judgesRes, ordersRes, scoresRes, resultsRes, rulesRes] = await Promise.all([
        judgeIds.length > 0
          ? supabase.from('judges').select('id, full_name').in('id', judgeIds)
          : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
        supabase.from('session_orders').select('position, team_id').eq('session_id', session.id).order('position'),
        supabase.from('scores').select('*').eq('session_id', session.id),
        supabase.from('routine_results').select('*').eq('session_id', session.id),
        supabase.from('age_group_rules').select('id, age_group, ruleset'),
      ])

      const agLabels: Record<string, string> = Object.fromEntries(
        ((rulesRes.data ?? []) as unknown as { id: string; age_group: string; ruleset: string }[])
          .map(r => [r.id, `${r.age_group} (${r.ruleset})`])
      )

      const judgeNameMap: Record<string, string> = Object.fromEntries(
        (judgesRes.data ?? []).map(j => [j.id, j.full_name])
      )

      const builtPanelJudges: PanelJudge[] = (allSpjs ?? []).map(s => ({
        id:         s.id,
        name:       s.judge_id ? (judgeNameMap[s.judge_id] ?? '—') : '—',
        role:       s.role as PanelJudge['role'],
        roleNumber: s.role_number,
      }))

      const builtAssignedRoles: PanelJudge[] = mySpjsForSession.map(s => ({
        id:         s.id,
        name:       judgeNameMap[judge.id] ?? '—',
        role:       s.role as PanelJudge['role'],
        roleNumber: s.role_number,
      }))

      // If no starting order saved yet, fall back to all registered teams for this session
      let orderedEntries: { team_id: string; position: number }[] = (ordersRes.data ?? []).map(o => ({
        team_id: o.team_id, position: o.position,
      }))

      if (orderedEntries.length === 0) {
        const { data: entries } = await supabase
          .from('competition_entries')
          .select('team_id')
          .eq('competition_id', (session as any).competition_id)
          .eq('dropped_out', false)
        const { data: fallbackTeams } = (entries ?? []).length > 0
          ? await supabase.from('teams')
              .select('id')
              .in('id', (entries ?? []).map(e => e.team_id))
              .eq('age_group', session.age_group)
              .eq('category', session.category)
          : { data: [] as { id: string }[] }
        orderedEntries = (fallbackTeams ?? []).map((t, i) => ({ team_id: t.id, position: i + 1 }))
      }

      const teamIds = orderedEntries.map(o => o.team_id)
      const [teamsRes, musicRes, elementsRes] = await Promise.all([
        teamIds.length > 0
          ? supabase.from('teams').select('id, gymnast_display, age_group, category').in('id', teamIds)
          : Promise.resolve({ data: [] as { id: string; gymnast_display: string; age_group: string; category: string }[] }),
        teamIds.length > 0
          ? supabase.from('routine_music')
              .select('team_id, ts_path')
              .eq('competition_id', (session as any).competition_id)
              .eq('routine_type', session.routine_type)
              .in('team_id', teamIds)
          : Promise.resolve({ data: [] as { team_id: string; ts_path: string | null }[] }),
        teamIds.length > 0
          ? supabase.from('ts_elements')
              .select('id, team_id, position, label, element_type, is_static, difficulty_value')
              .eq('competition_id', (session as any).competition_id)
              .eq('routine_type', session.routine_type)
              .in('team_id', teamIds)
              .order('position')
          : Promise.resolve({ data: [] as { id: string; team_id: string; position: number; label: string; element_type: string; is_static: boolean; difficulty_value: number }[] }),
      ])

      const teamMap: Record<string, { gymnast_display: string; age_group: string; category: string }> =
        Object.fromEntries((teamsRes.data ?? []).map(t => [t.id, t]))

      const tsUrlMap: Record<string, string | null> = Object.fromEntries(
        ((musicRes.data ?? []) as { team_id: string; ts_path: string | null }[])
          .map(m => [m.team_id, m.ts_path ?? null])
      )

      const elementsMap: Record<string, import('@/components/ej-scoring/types').TsElement[]> = {}
      for (const el of (elementsRes.data ?? []) as { id: string; team_id: string; position: number; label: string; element_type: string; is_static: boolean; difficulty_value: number }[]) {
        if (!elementsMap[el.team_id]) elementsMap[el.team_id] = []
        elementsMap[el.team_id].push({
          id:              el.id,
          position:        el.position,
          label:           el.label,
          elementType:     el.element_type as import('@/components/ej-scoring/types').ElementType,
          isStatic:        el.is_static,
          difficultyValue: el.difficulty_value,
        })
      }

      const builtPerfs: MockPerf[] = orderedEntries.map(o => ({
        id:          `${session.id}_${o.team_id}`,
        teamId:      o.team_id,
        position:    o.position,
        gymnasts:    teamMap[o.team_id]?.gymnast_display ?? '',
        ageGroup:    agLabels[teamMap[o.team_id]?.age_group ?? session.age_group] ?? teamMap[o.team_id]?.age_group ?? session.age_group,
        category:    teamMap[o.team_id]?.category  ?? session.category,
        routineType: session.routine_type,
        skipped:     false,
        tsUrl:       tsUrlMap[o.team_id] ?? null,
        elements:    elementsMap[o.team_id] ?? [],
      }))

      const builtJudgeScores: Record<string, JudgeScore[]> = {}
      for (const s of (scoresRes.data ?? [])) {
        const perfId = `${s.session_id}_${s.team_id}`
        if (!builtJudgeScores[perfId]) builtJudgeScores[perfId] = []
        builtJudgeScores[perfId].push({
          panelJudgeId: s.section_panel_judge_id,
          ejScore:      s.ej_score,
          ajScore:      s.aj_score,
          djDifficulty: s.dj_difficulty,
          djPenalty:    s.dj_penalty,
          cjpPenalty:   s.cjp_penalty,
        })
      }

      const builtResults: Record<string, RoutineResult> = {}
      for (const r of (resultsRes.data ?? [])) {
        const perfId = `${r.session_id}_${r.team_id}`
        builtResults[perfId] = {
          performanceId: perfId,
          eScore:        r.e_score      ?? 0,
          aScore:        r.a_score      ?? 0,
          difScore:      r.dif_score    ?? 0,
          difPenalty:    r.dif_penalty  ?? 0,
          cjpPenalty:    r.cjp_penalty  ?? 0,
          finalScore:    r.final_score  ?? 0,
          status:        r.status,
        }
      }

      const currentPerfIdVal = session.current_team_id
        ? `${session.id}_${session.current_team_id}`
        : null

      setSessionId(session.id)
      setSessionStatus(session.status as SessionStatus)
      setCurrentPerfId(currentPerfIdVal)
      setAssignedRoles(builtAssignedRoles)
      setPanelJudges(builtPanelJudges)
      setPerformances(builtPerfs)
      setJudgeScores(builtJudgeScores)
      setResults(builtResults)
      setDjMethod((session as any).dj_method ?? null)
      setEjMethod((session as any).ej_method ?? null)
      setLoading(false)
    }
    load()
  }, [activeProfile?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Realtime ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return

    const sessionCh = supabase
      .channel(`js-session-${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'sessions',
        filter: `id=eq.${sessionId}`,
      }, (payload) => {
        const row = payload.new as { status: SessionStatus; current_team_id: string | null }
        setSessionStatus(row.status)
        if (row.status === 'finished') {
          router.push('/judge')
          return
        }
        const newPerfId = row.current_team_id ? `${sessionId}_${row.current_team_id}` : null
        setCurrentPerfId(newPerfId)
        if (newPerfId) setJudgeScores(prev => prev[newPerfId] ? prev : { ...prev, [newPerfId]: [] })
      })
      .subscribe()

    const scoresCh = supabase
      .channel(`js-scores-${sessionId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'scores',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const row = payload.new as {
          session_id: string; team_id: string; section_panel_judge_id: string
          ej_score: number | null; aj_score: number | null
          dj_difficulty: number | null; dj_penalty: number | null; cjp_penalty: number | null
        }
        const perfId = `${row.session_id}_${row.team_id}`
        const incoming: JudgeScore = {
          panelJudgeId: row.section_panel_judge_id,
          ejScore:      row.ej_score,
          ajScore:      row.aj_score,
          djDifficulty: row.dj_difficulty,
          djPenalty:    row.dj_penalty,
          cjpPenalty:   row.cjp_penalty,
        }
        setJudgeScores(prev => ({
          ...prev,
          [perfId]: [...(prev[perfId] ?? []).filter(s => s.panelJudgeId !== incoming.panelJudgeId), incoming],
        }))
      })
      .subscribe()

    const resultsCh = supabase
      .channel(`js-results-${sessionId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'routine_results',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const row = payload.new as {
          session_id: string; team_id: string
          e_score: number | null; a_score: number | null
          dif_score: number | null; dif_penalty: number | null; cjp_penalty: number | null
          final_score: number | null; status: 'provisional' | 'approved'
        }
        const perfId = `${row.session_id}_${row.team_id}`
        setResults(prev => ({
          ...prev,
          [perfId]: {
            performanceId: perfId,
            eScore:     row.e_score     ?? 0,
            aScore:     row.a_score     ?? 0,
            difScore:   row.dif_score   ?? 0,
            difPenalty: row.dif_penalty ?? 0,
            cjpPenalty: row.cjp_penalty ?? 0,
            finalScore: row.final_score ?? 0,
            status:     row.status,
          },
        }))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(sessionCh)
      supabase.removeChannel(scoresCh)
      supabase.removeChannel(resultsCh)
    }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── handlers ─────────────────────────────────────────────────────────────────

  async function handleOpen(perfId: string) {
    if (!sessionId) return
    const teamId = perfId.replace(`${sessionId}_`, '')
    await supabase.from('sessions').update({ current_team_id: teamId }).eq('id', sessionId)
    setCurrentPerfId(perfId)
    setJudgeScores(prev => prev[perfId] ? prev : { ...prev, [perfId]: [] })
  }

  function handleSkip(perfId: string) {
    setPerformances(prev => prev.map(p => p.id === perfId ? { ...p, skipped: true } : p))
  }

  async function handleCJPSubmit(status: 'provisional' | 'approved', result: RoutineResult, penaltyDetail?: PenaltyState | null) {
    if (!sessionId) return
    const teamId = result.performanceId.replace(`${sessionId}_`, '')

    // Capture DJ element flags so the TV page can display penalty reasons
    // (scores table is auth-restricted; we denormalize here at submit time).
    const djJudgeIds = panelJudges.filter(j => j.role === 'DJ').map(j => j.id)
    let djPenaltyDetail: import('@/lib/database.types').Json | null = null
    if (djJudgeIds.length > 0) {
      const { data: djScores } = await supabase
        .from('scores')
        .select('dj_flags')
        .in('section_panel_judge_id', djJudgeIds)
        .eq('session_id', sessionId)
        .eq('team_id', teamId)
        .not('dj_flags', 'is', null)
      djPenaltyDetail = djScores?.[0]?.dj_flags ?? null
    }

    await supabase.from('routine_results').upsert({
      session_id: sessionId, team_id: teamId,
      e_score: result.eScore, a_score: result.aScore,
      dif_score: result.difScore, dif_penalty: result.difPenalty,
      cjp_penalty: result.cjpPenalty, final_score: result.finalScore, status,
      cjp_penalty_detail: penaltyDetail ?? null,
      dj_penalty_detail:  djPenaltyDetail,
    }, { onConflict: 'session_id,team_id' })
    setResults(prev => ({ ...prev, [result.performanceId]: result }))
  }

  async function handleReopenScore(perfId: string, panelJudgeId: string | 'all') {
    if (!sessionId) return
    const teamId = perfId.replace(`${sessionId}_`, '')
    if (panelJudgeId === 'all') {
      await supabase.from('scores').delete().eq('session_id', sessionId).eq('team_id', teamId)
      await supabase.from('routine_results').delete().eq('session_id', sessionId).eq('team_id', teamId)
      setJudgeScores(prev => ({ ...prev, [perfId]: [] }))
    } else {
      await supabase.from('scores').delete()
        .eq('session_id', sessionId).eq('team_id', teamId).eq('section_panel_judge_id', panelJudgeId)
      setJudgeScores(prev => ({
        ...prev,
        [perfId]: (prev[perfId] ?? []).filter(s => s.panelJudgeId !== panelJudgeId),
      }))
    }
    setResults(prev => { const next = { ...prev }; delete next[perfId]; return next })
  }

  async function handleJudgeScoreSubmit(score: JudgeScore) {
    if (!sessionId || !currentPerfId) return
    const teamId = currentPerfId.replace(`${sessionId}_`, '')
    await supabase.from('scores').upsert({
      session_id: sessionId, team_id: teamId,
      section_panel_judge_id: score.panelJudgeId,
      ej_score: score.ejScore, aj_score: score.ajScore,
      dj_difficulty: score.djDifficulty, dj_penalty: score.djPenalty, cjp_penalty: score.cjpPenalty,
      dj_flags: score.detail?.djFlags ?? null,
      dj_extra_elements: score.detail?.djExtraElements ?? null,
      dj_incorrect_ts: score.detail?.djIncorrectTs ?? null,
      ej_deductions: score.detail?.ejDeductions ?? null,
      ej_extra_elements: score.detail?.ejExtraElements ?? null,
    }, { onConflict: 'session_id,team_id,section_panel_judge_id' })
    // Re-fetch all scores for this performance to catch any submitted in the
    // race window between initial page load and real-time subscription setup
    const { data: latest } = await supabase.from('scores')
      .select('section_panel_judge_id,ej_score,aj_score,dj_difficulty,dj_penalty,cjp_penalty')
      .eq('session_id', sessionId)
      .eq('team_id', teamId)
    if (latest) {
      const perfId = currentPerfId
      setJudgeScores(prev => ({
        ...prev,
        [perfId]: latest.map((s: any) => ({
          panelJudgeId: s.section_panel_judge_id,
          ejScore:      s.ej_score,
          ajScore:      s.aj_score,
          djDifficulty: s.dj_difficulty,
          djPenalty:    s.dj_penalty,
          cjpPenalty:   s.cjp_penalty,
        })),
      }))
    }
  }

  function handleEditScore(
    perfId: string, panelJudgeId: string,
    field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number,
  ) {
    setJudgeScores(prev => ({
      ...prev,
      [perfId]: (prev[perfId] ?? []).map(s => s.panelJudgeId === panelJudgeId ? { ...s, [field]: value } : s),
    }))
  }

  const currentPerf = currentPerfId ? (performances.find(p => p.id === currentPerfId) ?? null) : null

  return {
    loading, sessionId, sessionStatus, currentPerfId, currentPerf,
    assignedRoles, panelJudges, performances, judgeScores, results,
    djMethod, ejMethod,
    handleOpen, handleSkip, handleCJPSubmit, handleReopenScore,
    handleJudgeScoreSubmit, handleEditScore,
  }
}
