import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export type OpenCombinadosPhaseKey =
  | 'qualification_open_balance'
  | 'qualification_open_dynamic'
  | 'qualification_combinados_combined'
  | 'open_quarter'
  | 'open_semi'
  | 'open_final'
  | 'combinados_semi_combined'
  | 'combinados_final_combined'

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
}

export type OpenCombinadosActaData = {
  openQualification: RankedTeam[]
  combinadosQualification: RankedTeam[]
  openQuarter?: RankedTeam[]
  openSemi?: RankedTeam[]
  openFinal?: RankedTeam[]
  combinadosSemi?: RankedTeam[]
  combinadosFinal?: RankedTeam[]
}

export type SessionMapRow = {
  phase_key: OpenCombinadosPhaseKey
  session_id: string
}

type ResultRow = {
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

function scoreBySession(results: ResultRow[], sessionId: string | null): Map<string, number> {
  if (!sessionId) return new Map()
  const m = new Map<string, number>()
  for (const r of results) {
    if (r.session_id !== sessionId) continue
    m.set(r.team_id, r.final_score ?? 0)
  }
  return m
}

export function computeOpenCombinadosActaFromRows(
  mappings: SessionMapRow[],
  results: ResultRow[],
): OpenCombinadosActaData {
  const openBal = scoreBySession(results, getSessionForPhase(mappings, 'qualification_open_balance'))
  const openDyn = scoreBySession(results, getSessionForPhase(mappings, 'qualification_open_dynamic'))
  const combQ = scoreBySession(results, getSessionForPhase(mappings, 'qualification_combinados_combined'))

  const openQualification = rankTeams(
    [...new Set([...openBal.keys(), ...openDyn.keys()])].map((teamId) => ({
      teamId,
      score: (openBal.get(teamId) ?? 0) + (openDyn.get(teamId) ?? 0),
    })),
  )
  const combinadosQualification = rankTeams(
    [...combQ.entries()].map(([teamId, score]) => ({ teamId, score })),
  )

  const openQuarter = rankTeams([...scoreBySession(results, getSessionForPhase(mappings, 'open_quarter')).entries()].map(([teamId, score]) => ({ teamId, score })))
  const openSemi = rankTeams([...scoreBySession(results, getSessionForPhase(mappings, 'open_semi')).entries()].map(([teamId, score]) => ({ teamId, score })))
  const openFinal = rankTeams([...scoreBySession(results, getSessionForPhase(mappings, 'open_final')).entries()].map(([teamId, score]) => ({ teamId, score })))
  const combinadosSemi = rankTeams(
    [...scoreBySession(results, getSessionForPhase(mappings, 'combinados_semi_combined')).entries()].map(
      ([teamId, score]) => ({ teamId, score }),
    ),
  )
  const combinadosFinal = rankTeams(
    [...scoreBySession(results, getSessionForPhase(mappings, 'combinados_final_combined')).entries()].map(
      ([teamId, score]) => ({ teamId, score }),
    ),
  )

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
  const qualified = params.sourceRanking.slice(0, Math.max(0, params.count))
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
