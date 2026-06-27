import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export type OpenCombinadosPhaseKey =
  | 'qualification_open'
  | 'qualification_combinados'
  | 'open_quarter'
  | 'open_semi'
  | 'open_final'
  | 'combinados_semi'
  | 'combinados_final'

export type BracketConfig = {
  combinadosSemiCount: number
  combinadosFinalCount: number
  openQuarterCount: number
  openSemiCount: number
  openFinalCount: number
}

export type RankedTeam = {
  teamId: string
  score: number
  rank: number
  balanceScore?: number
  dynamicScore?: number
}

export type OpenCombinadosActaData = {
  openQualification: RankedTeam[]
  combinadosQualification: RankedTeam[]
  openQuarter?: RankedTeam[]
  openSemi?: RankedTeam[]
  openFinal?: RankedTeam[]
  combinadosSemi?: RankedTeam[]
  combinadosFinal?: RankedTeam[]
  bracketConfig?: BracketConfig | null
}

export type SessionMapRow = {
  phase_key: OpenCombinadosPhaseKey
  session_id: string
}

export type ResultRow = {
  session_id: string
  team_id: string
  final_score: number | null
}

function rankTeams(raw: Array<{ teamId: string; score: number }>): RankedTeam[] {
  const sorted = [...raw].sort((a, b) => b.score - a.score || a.teamId.localeCompare(b.teamId))
  return sorted.map((r, idx) => ({ ...r, rank: idx + 1 }))
}

function getSessionForPhase(rows: SessionMapRow[], phase: OpenCombinadosPhaseKey): string | null {
  return rows.find((r) => r.phase_key === phase)?.session_id ?? null
}

function getSessionsForPhase(rows: SessionMapRow[], phase: OpenCombinadosPhaseKey): string[] {
  return rows.filter((r) => r.phase_key === phase).map((r) => r.session_id)
}

function scoreBySession(results: ResultRow[], sessionId: string | null): Map<string, number> {
  if (!sessionId) return new Map()
  const m = new Map<string, number>()
  for (const r of results) {
    if (r.session_id !== sessionId) continue
    m.set(r.team_id, r.final_score ?? 0)
  }
  return m
}

// Sums scores for a team across all provided sessions (used for multi-session qualification phases).
function scoreByPhase(results: ResultRow[], sessionIds: string[]): Map<string, number> {
  const idSet = new Set(sessionIds)
  const m = new Map<string, number>()
  for (const r of results) {
    if (!idSet.has(r.session_id)) continue
    m.set(r.team_id, (m.get(r.team_id) ?? 0) + (r.final_score ?? 0))
  }
  return m
}

// mappings contains only advancement phases (open_quarter, open_semi, open_final,
// combinados_semi, combinados_final). Qualification is computed automatically from
// all results whose session is NOT an advancement session.
export function computeOpenCombinadosActaFromRows(
  mappings: SessionMapRow[],
  results: ResultRow[],
  openTeamIds: Set<string>,
  combinadosTeamIds: Set<string>,
  sessionRoutineTypes?: Record<string, string>,
): OpenCombinadosActaData {
  const advSessionIds = new Set(mappings.map((m) => m.session_id))

  // Qualification results = everything not in an advancement session
  const openQual = new Map<string, number>()
  const combQual = new Map<string, number>()
  const openBalance = new Map<string, number>()
  const openDynamic = new Map<string, number>()
  for (const r of results) {
    if (advSessionIds.has(r.session_id)) continue
    const score = r.final_score ?? 0
    if (openTeamIds.has(r.team_id)) {
      openQual.set(r.team_id, (openQual.get(r.team_id) ?? 0) + score)
      if (sessionRoutineTypes) {
        const rt = sessionRoutineTypes[r.session_id]
        if (rt === 'Balance') openBalance.set(r.team_id, score)
        else if (rt === 'Dynamic') openDynamic.set(r.team_id, score)
      }
    } else if (combinadosTeamIds.has(r.team_id)) {
      combQual.set(r.team_id, (combQual.get(r.team_id) ?? 0) + score)
    }
  }

  const openQualification = rankTeams([...openQual.entries()].map(([teamId, score]) => ({ teamId, score }))).map(
    (rt) => ({
      ...rt,
      ...(openBalance.has(rt.teamId) ? { balanceScore: openBalance.get(rt.teamId) } : {}),
      ...(openDynamic.has(rt.teamId) ? { dynamicScore: openDynamic.get(rt.teamId) } : {}),
    }),
  )
  const combinadosQualification = rankTeams([...combQual.entries()].map(([teamId, score]) => ({ teamId, score })))

  const openQuarter = rankTeams([...scoreBySession(results, getSessionForPhase(mappings, 'open_quarter')).entries()].map(([teamId, score]) => ({ teamId, score })))
  const openSemi = rankTeams([...scoreBySession(results, getSessionForPhase(mappings, 'open_semi')).entries()].map(([teamId, score]) => ({ teamId, score })))
  const openFinal = rankTeams([...scoreBySession(results, getSessionForPhase(mappings, 'open_final')).entries()].map(([teamId, score]) => ({ teamId, score })))
  const combinadosSemi = rankTeams([...scoreBySession(results, getSessionForPhase(mappings, 'combinados_semi')).entries()].map(([teamId, score]) => ({ teamId, score })))
  const combinadosFinal = rankTeams([...scoreBySession(results, getSessionForPhase(mappings, 'combinados_final')).entries()].map(([teamId, score]) => ({ teamId, score })))

  return {
    openQualification,
    combinadosQualification,
    openQuarter: openQuarter.length ? openQuarter : undefined,
    openSemi: openSemi.length ? openSemi : undefined,
    openFinal: openFinal.length ? openFinal : undefined,
    combinadosSemi: combinadosSemi.length ? combinadosSemi : undefined,
    combinadosFinal: combinadosFinal.length ? combinadosFinal : undefined,
  }
}

export async function advancePhaseSessionOrders(
  supabase: SupabaseClient<Database>,
  params: {
    phaseMappings: SessionMapRow[]
    sourceRanking: RankedTeam[]
    targetPhaseKey: OpenCombinadosPhaseKey
    count: number
    openChoicesByTeam?: Record<string, 'Balance' | 'Dynamic' | 'Combined'> // validation only
    forbidRoutineFromPhase?: Record<string, 'Balance' | 'Dynamic' | 'Combined'> // validation only
  },
): Promise<{ error: string | null; assignedTeams: string[] }> {
  // Top N qualified, then reversed so rank 1 performs last (standard gymnastics order)
  const qualified = params.sourceRanking.slice(0, Math.max(0, params.count)).reverse()
  const targetSessionId = getSessionForPhase(params.phaseMappings, params.targetPhaseKey)
  if (!targetSessionId) return { error: 'Missing target phase session mapping', assignedTeams: [] }

  const { error: clearErr } = await supabase.from('session_orders').delete().eq('session_id', targetSessionId)
  if (clearErr) return { error: clearErr.message, assignedTeams: [] }

  const inserts: Array<{ session_id: string; team_id: string; position: number }> = []
  for (let i = 0; i < qualified.length; i++) {
    const q = qualified[i]
    const routine: 'Balance' | 'Dynamic' | 'Combined' = params.openChoicesByTeam?.[q.teamId] ?? 'Combined'
    const forbidden = params.forbidRoutineFromPhase?.[q.teamId]
    if (forbidden && routine === forbidden) return { error: `Invalid OPEN semi routine for team ${q.teamId}`, assignedTeams: [] }
    inserts.push({ session_id: targetSessionId, team_id: q.teamId, position: i + 1 })
  }

  if (inserts.length) {
    const { error: insertErr } = await supabase.from('session_orders').insert(inserts)
    if (insertErr) return { error: insertErr.message, assignedTeams: [] }
  }
  return { error: null, assignedTeams: qualified.map((q) => q.teamId) }
}

export function resolveRoutineTypeForTeamInSession(params: {
  sessionId: string
  sessionRoutineType: 'Balance' | 'Dynamic' | 'Combined'
  teamId: string
  mappings: SessionMapRow[]
  openChoicesByPhaseAndTeam: Record<string, Record<string, 'Balance' | 'Dynamic' | 'Combined'>>
}): 'Balance' | 'Dynamic' | 'Combined' {
  const phaseKey = params.mappings.find((m) => m.session_id === params.sessionId)?.phase_key
  if (!phaseKey || !phaseKey.startsWith('open_')) return params.sessionRoutineType
  const teamChoice = params.openChoicesByPhaseAndTeam[phaseKey]?.[params.teamId]
  return teamChoice ?? params.sessionRoutineType
}
