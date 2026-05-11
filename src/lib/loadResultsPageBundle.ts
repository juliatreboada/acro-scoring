import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import type { ScoringPerformance, RoutineResult } from '@/components/scoring/types'
import type { TeamClubInfo } from '@/lib/clubTrophyRanking'
import { computeOpenCombinadosActaFromRows, type OpenCombinadosActaData } from '@/lib/openCombinadosBracket'
import { isOpenCombinadosCompetitionName } from '@/lib/openCombinadosCompetition'

export type ResultsPageCompetitionMeta = {
  name: string
  location: string | null
  start_date: string | null
  end_date: string | null
  /** Public URL for print header (admin “Logo” upload, `competition-posters` bucket). */
  logo_url: string | null
  open_combinados_enabled?: boolean
}

export type ResultsPageBundle = {
  competition: ResultsPageCompetitionMeta | null
  performances: ScoringPerformance[]
  results: Record<string, RoutineResult>
  clubAvatarByTeam: Record<string, string | null>
  /** Per team: club id/name/avatar for club-level rankings (e.g. Trofeo Gondomar). */
  teamClubInfo: Record<string, TeamClubInfo>
  agSortOrder: Record<string, number>
  openCombinadosActa: OpenCombinadosActaData | null
}

/**
 * Shared loader for `/results/[id]` (public) — same shapes as the page state.
 */
export async function loadResultsPageBundle(
  supabase: SupabaseClient<Database>,
  competitionId: string,
): Promise<ResultsPageBundle> {
  const empty: ResultsPageBundle = {
    competition: null,
    performances: [],
    results: {},
    clubAvatarByTeam: {},
    teamClubInfo: {},
    agSortOrder: {},
    openCombinadosActa: null,
  }

  const { data: comp } = await supabase
    .from('competitions')
    .select('name, location, start_date, end_date, open_combinados_enabled, logo_url')
    .eq('id', competitionId)
    .single()

  if (!comp) return empty

  const openCombinadosEnabled =
    isOpenCombinadosCompetitionName(comp.name) || Boolean(comp.open_combinados_enabled)

  const competition: ResultsPageCompetitionMeta = {
    name: comp.name,
    location: comp.location,
    start_date: comp.start_date,
    end_date: comp.end_date,
    logo_url: comp.logo_url ?? null,
    open_combinados_enabled: openCombinadosEnabled,
  }

  const [sessionsRes, ageGroupRulesRes, mergeGroupsRes] = await Promise.all([
    supabase
      .from('sessions')
      .select('id, age_group, category, routine_type, ranking_merge_group_id')
      .eq('competition_id', competitionId),
    supabase.from('age_group_rules').select('id, age_group, sort_order, ruleset'),
    supabase.from('ranking_merge_groups').select('id, label_es, label_en').eq('competition_id', competitionId),
  ])
  const sessions = sessionsRes.data
  const agRules = ageGroupRulesRes.data ?? []
  const mergeById = Object.fromEntries((mergeGroupsRes.data ?? []).map((m) => [m.id, m]))
  const agLabelMap = Object.fromEntries(agRules.map((r) => [r.id, r.age_group]))
  const agSortOrder = Object.fromEntries(agRules.map((r) => [r.age_group, r.sort_order ?? 0]))

  if (!sessions?.length) {
    return { competition, performances: [], results: {}, clubAvatarByTeam: {}, teamClubInfo: {}, agSortOrder, openCombinadosActa: null }
  }

  const sessionIds = sessions.map((s) => s.id)

  const [ordersRes, resultsRes, entriesRes] = await Promise.all([
    supabase
      .from('session_orders')
      .select('session_id, team_id, position')
      .in('session_id', sessionIds)
      .order('position'),
    supabase
      .from('routine_results')
      .select('session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status')
      .in('session_id', sessionIds),
    supabase
      .from('competition_entries')
      .select('team_id, dropped_out, gymnast_display')
      .eq('competition_id', competitionId),
  ])

  const orders = ordersRes.data ?? []
  const rawRes = resultsRes.data ?? []
  const entries = entriesRes.data ?? []

  const teamIds = [...new Set(orders.map((o) => o.team_id))]
  const { data: teams } =
    teamIds.length > 0
      ? await supabase.from('teams').select('id, gymnast_display, club_id').in('id', teamIds)
      : { data: [] }

  const entryDisplayMap = Object.fromEntries(entries.map(e => [e.team_id, (e as any).gymnast_display as string | null]))
  const teamMap = Object.fromEntries((teams ?? []).map((t) => [t.id, entryDisplayMap[t.id] ?? t.gymnast_display]))

  const clubIds = [
    ...new Set(
      (teams ?? [])
        .map((t) => (t as { club_id?: string }).club_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  ]
  const { data: clubs } =
    clubIds.length > 0
      ? await supabase.from('clubs').select('id, club_name, avatar_url').in('id', clubIds)
      : { data: [] }
  const clubMeta = Object.fromEntries(
    (clubs ?? []).map((c) => [
      c.id,
      {
        name: (c as { club_name?: string }).club_name ?? '',
        avatar: c.avatar_url ?? null,
      },
    ]),
  )
  const teamClubAvatars: Record<string, string | null> = {}
  const teamClubInfo: Record<string, TeamClubInfo> = {}
  for (const t of teams ?? []) {
    const clubId = (t as { club_id?: string }).club_id
    if (clubId) {
      const meta = clubMeta[clubId]
      teamClubAvatars[t.id] = meta?.avatar ?? null
      teamClubInfo[t.id] = {
        clubId,
        clubName: meta?.name ?? '',
        clubAvatar: meta?.avatar ?? null,
      }
    } else {
      teamClubAvatars[t.id] = null
    }
  }

  const sessionMap = Object.fromEntries(sessions.map((s) => [s.id, s]))
  const dropoutSet = new Set(entries.filter((e) => e.dropped_out).map((e) => e.team_id))

  const perfs: ScoringPerformance[] = orders.map((o) => {
    const session = sessionMap[o.session_id]
    const mgId = session?.ranking_merge_group_id ?? null
    const mg = mgId ? mergeById[mgId] : null
    return {
      id: `${o.session_id}_${o.team_id}`,
      teamId: o.team_id,
      position: o.position,
      gymnasts: teamMap[o.team_id] ?? '',
      ageGroup: agLabelMap[session?.age_group ?? ''] ?? session?.age_group ?? '',
      category: session?.category ?? '',
      routineType: session?.routine_type ?? '',
      skipped: dropoutSet.has(o.team_id),
      elements: [],
      rankingMergeGroupId: mgId ?? undefined,
      mergeLabelEs: mg?.label_es ?? undefined,
      mergeLabelEn: mg?.label_en ?? undefined,
    }
  })

  const results: Record<string, RoutineResult> = {}
  for (const r of rawRes) {
    const perfId = `${r.session_id}_${r.team_id}`
    results[perfId] = {
      performanceId: perfId,
      eScore: r.e_score ?? 0,
      aScore: r.a_score ?? 0,
      difScore: r.dif_score ?? 0,
      difPenalty: r.dif_penalty ?? 0,
      cjpPenalty: r.cjp_penalty ?? 0,
      finalScore: r.final_score ?? 0,
      status: r.status as 'provisional' | 'approved',
    }
  }

  let openCombinadosActa: OpenCombinadosActaData | null = null
  if (openCombinadosEnabled) {
    const { data: mappings } = await supabase
      .from('open_combinados_phase_sessions')
      .select('phase_key,session_id')
      .eq('competition_id', competitionId)
    if ((mappings ?? []).length > 0) {
      openCombinadosActa = computeOpenCombinadosActaFromRows(
        (mappings ?? []) as Array<{ phase_key: any; session_id: string }>,
        (rawRes ?? []) as Array<{ session_id: string; team_id: string; final_score: number | null }>,
      )
    }
  }

  return {
    competition,
    performances: perfs,
    results,
    clubAvatarByTeam: teamClubAvatars,
    teamClubInfo,
    agSortOrder,
    openCombinadosActa,
  }
}
