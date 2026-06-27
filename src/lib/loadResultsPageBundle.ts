import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import type { ScoringPerformance, RoutineResult } from '@/components/scoring/types'
import type { TeamClubInfo } from '@/lib/clubTrophyRanking'
import { computeOpenCombinadosActaFromRows, type OpenCombinadosActaData } from '@/lib/openCombinadosBracket'
import { isOpenCombinadosCompetitionName } from '@/lib/openCombinadosCompetition'
import { ageGroupLabel, type AgeGroupRule } from '@/components/admin/types'

export type ResultsPageCompetitionMeta = {
  name: string
  status: Database['public']['Enums']['competition_status']
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
  teamPhotoByTeam: Record<string, string | null>
  agSortOrder: Record<string, number>
  openCombinadosActa: OpenCombinadosActaData | null
}

/**
 * Shared loader for `/results/[id]` (public) — same shapes as the page state.
 */
export async function loadResultsPageBundle(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<ResultsPageBundle> {
  const empty: ResultsPageBundle = {
    competition: null,
    performances: [],
    results: {},
    clubAvatarByTeam: {},
    teamClubInfo: {},
    teamPhotoByTeam: {},
    agSortOrder: {},
    openCombinadosActa: null,
  }

  const { data: comp } = await supabase
    .from('competitions')
    .select('id, name, status, location, start_date, end_date, open_combinados_enabled, logo_url')
    .eq('slug', slug)
    .single()

  if (!comp) return empty

  const competitionId = comp.id
  const openCombinadosEnabled =
    isOpenCombinadosCompetitionName(comp.name) || Boolean(comp.open_combinados_enabled)

  const competition: ResultsPageCompetitionMeta = {
    name: comp.name,
    status: comp.status,
    location: comp.location,
    start_date: comp.start_date,
    end_date: comp.end_date,
    logo_url: comp.logo_url ?? null,
    open_combinados_enabled: openCombinadosEnabled,
  }

  const [sessionsRes, ageGroupRulesRes, mergeGroupsRes] = await Promise.all([
    supabase
      .from('sessions')
      .select('id, age_group, category, routine_type, ranking_merge_group_id, bracket_phase')
      .eq('competition_id', competitionId),
    supabase.from('age_group_rules').select('id, age_group, level, sort_order, ruleset, sport_type, routine_count'),
    supabase.from('ranking_merge_groups').select('id, label_es, label_en').eq('competition_id', competitionId),
  ])
  const sessions = sessionsRes.data
  const agRules = ageGroupRulesRes.data ?? []
  const mergeById = Object.fromEntries((mergeGroupsRes.data ?? []).map((m) => [m.id, m]))
  const agLabelMap = Object.fromEntries(agRules.map((r) => [r.id, ageGroupLabel(r as unknown as AgeGroupRule)]))
  const agSortOrder = Object.fromEntries(agRules.map((r) => [ageGroupLabel(r as unknown as AgeGroupRule), r.sort_order ?? 0]))

  if (!sessions?.length) {
    return { competition, performances: [], results: {}, clubAvatarByTeam: {}, teamClubInfo: {}, teamPhotoByTeam: {}, agSortOrder, openCombinadosActa: null }
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

  const teamIds = [...new Set([...orders.map((o) => o.team_id), ...rawRes.map((r) => r.team_id)])]
  const { data: teams } =
    teamIds.length > 0
      ? await supabase.from('teams').select('id, gymnast_display, club_id, age_group, photo_url').in('id', teamIds)
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
  const teamPhotoByTeam: Record<string, string | null> = {}
  for (const t of teams ?? []) {
    const clubId = (t as { club_id?: string }).club_id
    teamPhotoByTeam[t.id] = (t as { photo_url?: string | null }).photo_url ?? null
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
    // Classify active teams into OPEN (routine_count >= 2) vs COMBINADOS (routine_count === 1)
    const agRuleById = Object.fromEntries(agRules.map((r) => [r.id, r as unknown as { routine_count: number }]))
    const activeEntryIds = new Set(entries.filter((e) => !e.dropped_out).map((e) => e.team_id))
    const openTeamIds = new Set<string>()
    const combinadosTeamIds = new Set<string>()
    for (const t of teams ?? []) {
      if (!activeEntryIds.has(t.id)) continue
      const rule = agRuleById[(t as unknown as { age_group: string }).age_group]
      if (!rule) continue
      if (rule.routine_count >= 2) openTeamIds.add(t.id)
      else combinadosTeamIds.add(t.id)
    }

    // Derive advancement phase mappings from sessions.bracket_phase (source of truth).
    // open_combinados_phase_sessions is a legacy table that may not have bracket sessions.
    const QUAL_KEYS = new Set(['qualification_open', 'qualification_combinados'])
    const advMappings = (sessions ?? [])
      .filter((s) => {
        const bp = (s as unknown as { bracket_phase?: string | null }).bracket_phase
        return bp && !QUAL_KEYS.has(bp)
      })
      .map((s) => ({
        phase_key: (s as unknown as { bracket_phase: string }).bracket_phase as any,
        session_id: s.id,
      }))

    const sessionRoutineTypeMap = Object.fromEntries(sessions.map((s) => [s.id, s.routine_type]))
    const [bracketCfgRes] = await Promise.all([
      supabase.from('open_combinados_bracket_config').select('*').eq('competition_id', competitionId).maybeSingle(),
    ])
    const cfg = bracketCfgRes.data
    openCombinadosActa = {
      ...computeOpenCombinadosActaFromRows(
        advMappings,
        (rawRes ?? []) as Array<{ session_id: string; team_id: string; final_score: number | null }>,
        openTeamIds,
        combinadosTeamIds,
        sessionRoutineTypeMap,
      ),
      bracketConfig: cfg ? {
        combinadosSemiCount:  cfg.combinados_semi_count  ?? 0,
        combinadosFinalCount: cfg.combinados_final_count ?? 0,
        openQuarterCount:     cfg.open_quarter_count     ?? 0,
        openSemiCount:        cfg.open_semi_count        ?? 0,
        openFinalCount:       cfg.open_final_count       ?? 0,
      } : null,
    }
  }

  return {
    competition,
    performances: perfs,
    results,
    clubAvatarByTeam: teamClubAvatars,
    teamClubInfo,
    teamPhotoByTeam,
    agSortOrder,
    openCombinadosActa,
  }
}
