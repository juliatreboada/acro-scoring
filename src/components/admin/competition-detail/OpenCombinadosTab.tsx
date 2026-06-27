'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { AgeGroupRule, Panel, Section, Session, SessionOrder, Team, CompetitionEntry } from '@/components/admin/types'
import { ageGroupLabel, categoryLabel } from '@/components/admin/types'
import {
  advancePhaseSessionOrders,
  computeOpenCombinadosActaFromRows,
  type OpenCombinadosPhaseKey,
  type ResultRow,
  type SessionMapRow,
} from '@/lib/openCombinadosBracket'

type Props = {
  lang: 'es' | 'en'
  competitionId: string
  sessions: Session[]
  sessionOrders: SessionOrder[]
  teams: Team[]
  entries: CompetitionEntry[]
  ageGroupRules: AgeGroupRule[]
  panels: Panel[]
  sections: Section[]
  onReloadSessionOrders?: () => Promise<void>
}

// phase key → { group, source round label for the advance button }
const ADVANCE_TARGETS: Record<string, { target: OpenCombinadosPhaseKey; group: 'OPEN' | 'COMBINADOS'; round: string }> = {
  qualification_open:      { target: 'open_quarter',     group: 'OPEN',       round: 'Quarter-Finals' },
  qualification_combinados:{ target: 'combinados_semi',  group: 'COMBINADOS', round: 'Semi-Finals'   },
  open_quarter:            { target: 'open_semi',        group: 'OPEN',       round: 'Semi-Finals'   },
  open_semi:               { target: 'open_final',       group: 'OPEN',       round: 'Final'         },
  combinados_semi:         { target: 'combinados_final', group: 'COMBINADOS', round: 'Final'         },
}

export default function OpenCombinadosTab({ competitionId, sessions, sessionOrders, teams, entries, ageGroupRules, panels, sections, lang, onReloadSessionOrders }: Props) {
  const supabase = createClient()

  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [advancing, setAdvancing]   = useState<string | null>(null)
  const [advError, setAdvError]     = useState<string | null>(null)

  const [cfg, setCfg] = useState({
    combinados_semi_count:  0,
    combinados_final_count: 8,
    open_quarter_count:     0,
    open_semi_count:        12,
    open_final_count:       8,
  })
  const [liveResults, setLiveResults] = useState<ResultRow[]>([])
  const [openQuarterChoices, setOpenQuarterChoices] = useState<Record<string, 'Balance' | 'Dynamic' | 'Combined'>>({})
  const [openSemiChoices,    setOpenSemiChoices]    = useState<Record<string, 'Balance' | 'Dynamic' | 'Combined'>>({})
  const [openFinalChoices,   setOpenFinalChoices]   = useState<Record<string, 'Balance' | 'Dynamic' | 'Combined'>>({})
  const [droppedOutIds, setDroppedOutIds] = useState<Set<string>>(
    () => new Set(entries.filter(e => e.dropped_out).map(e => e.team_id))
  )

  // advMap is derived directly from sessions.bracket_phase — no DB fetch needed.
  const advMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const s of sessions) {
      if (s.bracket_phase) map[s.bracket_phase] = s.id
    }
    return map
  }, [sessions])

  // ── Data fetching ─────────────────────────────────────────────────────────

  async function fetchResults(): Promise<ResultRow[]> {
    const allIds = sessions.map((s) => s.id)
    if (!allIds.length) return []
    const { data } = await supabase
      .from('routine_results')
      .select('session_id,team_id,final_score')
      .in('session_id', allIds)
    return (data ?? []) as ResultRow[]
  }

  async function load() {
    setLoading(true)
    const [cfgRes, choicesRes, results] = await Promise.all([
      supabase.from('open_combinados_bracket_config').select('*').eq('competition_id', competitionId).maybeSingle(),
      supabase.from('open_combinados_open_team_choices').select('phase_key,team_id,selected_routine_type').eq('competition_id', competitionId),
      fetchResults(),
    ])

    if (cfgRes.data) setCfg((prev) => ({ ...prev, ...cfgRes.data }))

    const quarter: Record<string, 'Balance' | 'Dynamic' | 'Combined'> = {}
    const semi:    Record<string, 'Balance' | 'Dynamic' | 'Combined'> = {}
    const final:   Record<string, 'Balance' | 'Dynamic' | 'Combined'> = {}
    for (const c of choicesRes.data ?? []) {
      if (c.phase_key === 'open_quarter') quarter[c.team_id] = c.selected_routine_type as 'Balance' | 'Dynamic' | 'Combined'
      if (c.phase_key === 'open_semi')    semi[c.team_id]    = c.selected_routine_type as 'Balance' | 'Dynamic' | 'Combined'
      if (c.phase_key === 'open_final')   final[c.team_id]   = c.selected_routine_type as 'Balance' | 'Dynamic' | 'Combined'
    }
    setOpenQuarterChoices(quarter)
    setOpenSemiChoices(semi)
    setOpenFinalChoices(final)
    setLiveResults(results)
    setLoading(false)
  }

  async function refreshResults() {
    setRefreshing(true)
    setLiveResults(await fetchResults())
    setRefreshing(false)
  }

  useEffect(() => { void load() }, [competitionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived state ─────────────────────────────────────────────────────────

  const teamById      = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams])
  const entryByTeam   = useMemo(() => Object.fromEntries(entries.map((e) => [e.team_id, e])), [entries])
  const activeTeamIds = useMemo(() => new Set(entries.filter((e) => !droppedOutIds.has(e.team_id)).map((e) => e.team_id)), [entries, droppedOutIds])
  const agRuleMap     = useMemo(() => Object.fromEntries(ageGroupRules.map((r) => [r.id, r])), [ageGroupRules])
  const agLabelMap    = useMemo(() => Object.fromEntries(ageGroupRules.map((r) => [r.id, ageGroupLabel(r)])), [ageGroupRules])

  const { openTeamIds, combinadosTeamIds } = useMemo(() => {
    const open = new Set<string>()
    const comb = new Set<string>()
    for (const team of teams) {
      if (!activeTeamIds.has(team.id)) continue
      const rule = agRuleMap[team.age_group]
      if (!rule) continue
      if (rule.routine_count >= 2) open.add(team.id)
      else comb.add(team.id)
    }
    return { openTeamIds: open, combinadosTeamIds: comb }
  }, [teams, agRuleMap, activeTeamIds])

  const phaseRows = useMemo((): SessionMapRow[] =>
    Object.entries(advMap)
      .filter(([, sid]) => Boolean(sid))
      .map(([phase_key, session_id]) => ({ phase_key: phase_key as OpenCombinadosPhaseKey, session_id })),
  [advMap])

  const acta = useMemo(
    () => computeOpenCombinadosActaFromRows(phaseRows, liveResults, openTeamIds, combinadosTeamIds),
    [phaseRows, liveResults, openTeamIds, combinadosTeamIds],
  )

  // Balance / Dynamic breakdown per OPEN team (qualification sessions = not in advMap)
  const openBreakdown = useMemo(() => {
    const advIds = new Set(Object.values(advMap).filter(Boolean))
    const bd: Record<string, { balance: number; dynamic: number }> = {}
    for (const r of liveResults) {
      if (advIds.has(r.session_id) || !openTeamIds.has(r.team_id)) continue
      const session = sessions.find((s) => s.id === r.session_id)
      const rtype = session?.routine_type
      if (!bd[r.team_id]) bd[r.team_id] = { balance: 0, dynamic: 0 }
      if (rtype === 'Balance') bd[r.team_id].balance += r.final_score ?? 0
      else if (rtype === 'Dynamic') bd[r.team_id].dynamic += r.final_score ?? 0
    }
    return bd
  }, [advMap, liveResults, openTeamIds, sessions])

  const quarterQualified = useMemo(() => {
    const ids = new Set(sessionOrders.filter((o) => o.session_id === advMap.open_quarter).map((o) => o.team_id))
    return [...ids].filter((id) => activeTeamIds.has(id))
  }, [sessionOrders, advMap, activeTeamIds])
  const semiQualified = useMemo(() => {
    const ids = new Set(sessionOrders.filter((o) => o.session_id === advMap.open_semi).map((o) => o.team_id))
    return [...ids].filter((id) => activeTeamIds.has(id))
  }, [sessionOrders, advMap, activeTeamIds])
  const finalQualified = useMemo(() => {
    const ids = new Set(sessionOrders.filter((o) => o.session_id === advMap.open_final).map((o) => o.team_id))
    return [...ids].filter((id) => activeTeamIds.has(id))
  }, [sessionOrders, advMap, activeTeamIds])

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function saveConfig() {
    await supabase.from('open_combinados_bracket_config').upsert({ competition_id: competitionId, ...cfg })
  }

  async function toggleDropout(teamId: string) {
    const entry = entryByTeam[teamId]
    if (!entry) return
    const nowDropped = !droppedOutIds.has(teamId)
    setDroppedOutIds(prev => {
      const next = new Set(prev)
      if (nowDropped) next.add(teamId)
      else next.delete(teamId)
      return next
    })
    await supabase.from('competition_entries').update({ dropped_out: nowDropped }).eq('id', entry.id)
  }

  async function saveChoice(phase: 'open_quarter' | 'open_semi' | 'open_final', teamId: string, routine: 'Balance' | 'Dynamic' | 'Combined') {
    await supabase.from('open_combinados_open_team_choices').upsert(
      { competition_id: competitionId, phase_key: phase, team_id: teamId, selected_routine_type: routine },
      { onConflict: 'competition_id,phase_key,team_id' },
    )
  }

  async function runAdvance(from: 'qualification_open' | 'qualification_combinados' | 'open_quarter' | 'open_semi' | 'combinados_semi') {
    setAdvancing(from)
    setAdvError(null)
    try {
      const { target, round } = ADVANCE_TARGETS[from]

      const targetSessionId = advMap[target]
      if (!targetSessionId) {
        setAdvError(`No hay sesión para "${round}". Créala primero en la pestaña Estructura como fase bracket.`)
        return
      }

      const freshResults = await fetchResults()
      setLiveResults(freshResults)
      const freshActa = computeOpenCombinadosActaFromRows(phaseRows, freshResults, openTeamIds, combinadosTeamIds)

      let result: { error: string | null; assignedTeams: string[] }
      if (from === 'qualification_open') {
        result = await advancePhaseSessionOrders(supabase, {
          phaseMappings: phaseRows,
          sourceRanking: freshActa.openQualification,
          targetPhaseKey: 'open_quarter',
          count: cfg.open_quarter_count || Math.floor(freshActa.openQualification.length / 2),
          openChoicesByTeam: openQuarterChoices,
        })
      } else if (from === 'qualification_combinados') {
        result = await advancePhaseSessionOrders(supabase, {
          phaseMappings: phaseRows,
          sourceRanking: freshActa.combinadosQualification,
          targetPhaseKey: 'combinados_semi',
          count: cfg.combinados_semi_count || Math.floor(freshActa.combinadosQualification.length / 2),
        })
      } else if (from === 'open_quarter') {
        result = await advancePhaseSessionOrders(supabase, {
          phaseMappings: phaseRows,
          sourceRanking: freshActa.openQuarter ?? [],
          targetPhaseKey: 'open_semi',
          count: cfg.open_semi_count,
          openChoicesByTeam: openSemiChoices,
          forbidRoutineFromPhase: openQuarterChoices,
        })
      } else if (from === 'open_semi') {
        result = await advancePhaseSessionOrders(supabase, {
          phaseMappings: phaseRows,
          sourceRanking: freshActa.openSemi ?? [],
          targetPhaseKey: 'open_final',
          count: cfg.open_final_count,
          openChoicesByTeam: openFinalChoices,
        })
      } else {
        result = await advancePhaseSessionOrders(supabase, {
          phaseMappings: phaseRows,
          sourceRanking: freshActa.combinadosSemi ?? [],
          targetPhaseKey: 'combinados_final',
          count: cfg.combinados_final_count,
        })
      }

      if (result.error) setAdvError(result.error)
      else await onReloadSessionOrders?.()
    } finally {
      setAdvancing(null)
    }
  }

  if (loading) return <div className="text-sm text-slate-500">Loading bracket config...</div>

  const openQualCutoff  = cfg.open_quarter_count > 0    ? cfg.open_quarter_count    : Math.floor(acta.openQualification.length / 2)
  const combSemiCutoff  = cfg.combinados_semi_count > 0 ? cfg.combinados_semi_count : Math.floor(acta.combinadosQualification.length / 2)

  // Which bracket phases are still missing a session
  const missingPhases = (['open_quarter', 'open_semi', 'open_final', 'combinados_semi', 'combinados_final'] as const)
    .filter((k) => !advMap[k])

  return (
    <div className="space-y-6">

      {/* Info banner */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 space-y-1">
        <p className="text-sm font-semibold text-slate-800">Cómo funciona este bracket</p>
        <p className="text-xs text-slate-600">
          <strong>OPEN</strong> — grupos de edad con routine_count ≥ 2 (Balance + Dinámico). Clasificación = B+D total, calculado automáticamente de todas las sesiones de la competición.
          Los mejores van a Cuartos → Semis → Final (cada equipo elige rutina en cada ronda).
        </p>
        <p className="text-xs text-slate-600">
          <strong>COMBINADOS</strong> — grupos con routine_count = 1 (Combinado). Clasificación = puntuación combinada. La mitad mejor → Semis → Final.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Equipos OPEN: <strong>{openTeamIds.size}</strong> · Equipos COMBINADOS: <strong>{combinadosTeamIds.size}</strong>
        </p>
      </div>

      {/* Missing sessions warning */}
      {missingPhases.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-1">
          <p className="text-sm font-semibold text-amber-800">Sesiones de bracket pendientes de crear</p>
          <p className="text-xs text-amber-700">
            Ve a la pestaña <strong>Estructura</strong>, pulsa &quot;+ Añadir sesión&quot; y elige <em>Fase bracket</em> para crear:
          </p>
          <ul className="text-xs text-amber-700 list-disc list-inside mt-1 space-y-0.5">
            {missingPhases.map((k) => (
              <li key={k}>{k === 'open_quarter' ? 'OPEN Cuartos de Final' : k === 'open_semi' ? 'OPEN Semifinal' : k === 'open_final' ? 'OPEN Final' : k === 'combinados_semi' ? 'COMBINADOS Semifinal' : 'COMBINADOS Final'}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Step 1: Advancement counts ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-800">Paso 1 · Equipos que avanzan</p>
          <p className="text-xs text-slate-500 mt-0.5">Cuántos equipos pasan de cada fase. 0 = automático (la mitad de los participantes).</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(
              [
                ['open_quarter_count',     cfg.open_quarter_count,     'OPEN Cuartos'],
                ['open_semi_count',        cfg.open_semi_count,        'OPEN Semis'],
                ['open_final_count',       cfg.open_final_count,       'OPEN Final'],
                ['combinados_semi_count',  cfg.combinados_semi_count,  'COMB. Semis'],
                ['combinados_final_count', cfg.combinados_final_count, 'COMB. Final'],
              ] as [keyof typeof cfg, number, string][]
            ).map(([k, v, label]) => (
              <label key={k} className="text-xs text-slate-600">
                {label}
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
                  value={v}
                  onChange={(e) => setCfg((prev) => ({ ...prev, [k]: Number(e.target.value) }))}
                />
              </label>
            ))}
          </div>
          <button
            className="px-3.5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            onClick={saveConfig}
          >
            Guardar
          </button>
        </div>
      </div>

      {/* ── Step 2: Live qualification rankings ────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Paso 2 · Rankings de clasificación</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculados automáticamente de todos los resultados de la competición. Los equipos sobre la línea discontinua avanzan.
            </p>
          </div>
          <button
            onClick={refreshResults}
            disabled={refreshing}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}>
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
            </svg>
            {refreshing ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>

        {advError && (
          <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            Error: {advError}
          </div>
        )}

        <div className="p-4 grid md:grid-cols-2 gap-6">

          {/* OPEN */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-blue-800">Clasificación OPEN</p>
              <span className="text-xs text-blue-600 font-medium">{acta.openQualification.length} / {openTeamIds.size} equipos</span>
            </div>
            {acta.openQualification.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4 text-center border border-slate-200 rounded-lg">
                Sin puntuaciones aún — pulsa Actualizar cuando estén las sesiones puntuadas
              </p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-2 py-1.5 text-center w-7">#</th>
                      <th className="px-2 py-1.5 text-left">Equipo</th>
                      <th className="px-2 py-1.5 text-left hidden sm:table-cell">Categoría</th>
                      <th className="px-2 py-1.5 text-right">B</th>
                      <th className="px-2 py-1.5 text-right">D</th>
                      <th className="px-2 py-1.5 text-right font-bold">Total</th>
                      <th className="px-2 py-1.5 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {acta.openQualification.map((r, idx) => {
                      const team = teamById[r.teamId]
                      const bd = openBreakdown[r.teamId]
                      const advances = idx < openQualCutoff
                      const isDropped = droppedOutIds.has(r.teamId)
                      return (
                        <Fragment key={r.teamId}>
                          {idx === openQualCutoff && (
                            <tr>
                              <td colSpan={7} className="bg-red-50 border-y border-dashed border-red-300 text-center text-red-400 text-[10px] py-0.5">
                                ── no avanza ({acta.openQualification.length - openQualCutoff} equipo{acta.openQualification.length - openQualCutoff !== 1 ? 's' : ''}) ──
                              </td>
                            </tr>
                          )}
                          <tr className={isDropped ? 'bg-red-50 opacity-60' : advances ? 'bg-blue-50/40' : 'opacity-60'}>
                            <td className="px-2 py-1.5 text-center font-bold text-blue-700">{r.rank}</td>
                            <td className="px-2 py-1.5 font-semibold text-slate-800">
                              {team?.gymnast_display ?? r.teamId}
                              {isDropped && <span className="ml-1.5 text-[10px] font-normal text-red-500 uppercase tracking-wide">baja</span>}
                            </td>
                            <td className="px-2 py-1.5 text-slate-600 hidden sm:table-cell">{agLabelMap[team?.age_group ?? ''] ?? '—'}</td>
                            <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{bd ? bd.balance.toFixed(3) : '—'}</td>
                            <td className="px-2 py-1.5 text-right tabular-nums text-slate-700">{bd ? bd.dynamic.toFixed(3) : '—'}</td>
                            <td className="px-2 py-1.5 text-right font-bold tabular-nums text-slate-800">{r.score.toFixed(3)}</td>
                            <td className="px-2 py-1.5 text-center">
                              <button
                                onClick={() => void toggleDropout(r.teamId)}
                                title={isDropped ? 'Reactivar equipo' : 'Declarar baja'}
                                className={['w-6 h-6 rounded flex items-center justify-center transition-colors', isDropped ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'text-slate-300 hover:bg-red-50 hover:text-red-500'].join(' ')}
                              >
                                {isDropped
                                  ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                                  : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                }
                              </button>
                            </td>
                          </tr>
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {/* Advance card — OPEN Quarter Finals */}
            <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-xs font-bold text-blue-800">Cuartos de Final OPEN</p>
                  <p className="text-xs text-blue-600">
                    Top{' '}
                    <input
                      type="number" min={1}
                      className="w-10 rounded border border-blue-300 bg-white px-1 py-0.5 text-xs tabular-nums text-blue-800 font-semibold mx-0.5"
                      value={cfg.open_quarter_count || ''}
                      placeholder="½"
                      onChange={(e) => setCfg((p) => ({ ...p, open_quarter_count: Number(e.target.value) }))}
                    />{' '}
                    de {acta.openQualification.length} equipos clasificados
                  </p>
                </div>
                {!advMap.open_quarter ? (
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                    Crea primero la sesión <strong>OPEN Cuartos</strong> en la pestaña Estructura
                  </span>
                ) : (
                  <button
                    onClick={() => void runAdvance('qualification_open')}
                    disabled={advancing === 'qualification_open' || acta.openQualification.length === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {advancing === 'qualification_open'
                      ? 'Generando…'
                      : <><span>↗</span> Asignar a Cuartos OPEN</>}
                  </button>
                )}
              </div>
              {acta.openQualification.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {acta.openQualification.slice(0, openQualCutoff).map((r) => (
                    <span key={r.teamId} className="inline-flex items-center gap-1 text-xs bg-white border border-blue-200 rounded-full px-2 py-0.5 text-blue-900 font-medium">
                      <span className="text-blue-400 font-mono text-[10px]">{r.rank}</span>
                      {teamById[r.teamId]?.gymnast_display ?? r.teamId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COMBINADOS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-violet-800">Clasificación COMBINADOS</p>
              <span className="text-xs text-violet-600 font-medium">{acta.combinadosQualification.length} / {combinadosTeamIds.size} equipos</span>
            </div>
            {acta.combinadosQualification.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4 text-center border border-slate-200 rounded-lg">
                Sin puntuaciones aún — pulsa Actualizar cuando estén las sesiones puntuadas
              </p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-violet-50">
                    <tr>
                      <th className="px-2 py-1.5 text-center w-7">#</th>
                      <th className="px-2 py-1.5 text-left">Equipo</th>
                      <th className="px-2 py-1.5 text-left hidden sm:table-cell">Categoría</th>
                      <th className="px-2 py-1.5 text-right font-bold">Puntos</th>
                      <th className="px-2 py-1.5 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {acta.combinadosQualification.map((r, idx) => {
                      const team = teamById[r.teamId]
                      const advances = idx < combSemiCutoff
                      const isDropped = droppedOutIds.has(r.teamId)
                      return (
                        <Fragment key={r.teamId}>
                          {idx === combSemiCutoff && (
                            <tr>
                              <td colSpan={5} className="bg-red-50 border-y border-dashed border-red-300 text-center text-red-400 text-[10px] py-0.5">
                                ── no avanza ({acta.combinadosQualification.length - combSemiCutoff} equipo{acta.combinadosQualification.length - combSemiCutoff !== 1 ? 's' : ''}) ──
                              </td>
                            </tr>
                          )}
                          <tr className={isDropped ? 'bg-red-50 opacity-60' : advances ? 'bg-violet-50/40' : 'opacity-60'}>
                            <td className="px-2 py-1.5 text-center font-bold text-violet-700">{r.rank}</td>
                            <td className="px-2 py-1.5 font-semibold text-slate-800">
                              {team?.gymnast_display ?? r.teamId}
                              {isDropped && <span className="ml-1.5 text-[10px] font-normal text-red-500 uppercase tracking-wide">baja</span>}
                            </td>
                            <td className="px-2 py-1.5 text-slate-600 hidden sm:table-cell">{agLabelMap[team?.age_group ?? ''] ?? '—'}</td>
                            <td className="px-2 py-1.5 text-right font-bold tabular-nums text-slate-800">{r.score.toFixed(3)}</td>
                            <td className="px-2 py-1.5 text-center">
                              <button
                                onClick={() => void toggleDropout(r.teamId)}
                                title={isDropped ? 'Reactivar equipo' : 'Declarar baja'}
                                className={['w-6 h-6 rounded flex items-center justify-center transition-colors', isDropped ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'text-slate-300 hover:bg-red-50 hover:text-red-500'].join(' ')}
                              >
                                {isDropped
                                  ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                                  : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                }
                              </button>
                            </td>
                          </tr>
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {/* Advance card — COMBINADOS Semi-Finals */}
            <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-xs font-bold text-violet-800">Semifinal COMBINADOS</p>
                  <p className="text-xs text-violet-600">
                    Top{' '}
                    <input
                      type="number" min={1}
                      className="w-10 rounded border border-violet-300 bg-white px-1 py-0.5 text-xs tabular-nums text-violet-800 font-semibold mx-0.5"
                      value={cfg.combinados_semi_count || ''}
                      placeholder="½"
                      onChange={(e) => setCfg((p) => ({ ...p, combinados_semi_count: Number(e.target.value) }))}
                    />{' '}
                    de {acta.combinadosQualification.length} equipos clasificados
                  </p>
                </div>
                {!advMap.combinados_semi ? (
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                    Crea primero la sesión <strong>COMBINADOS Semis</strong> en la pestaña Estructura
                  </span>
                ) : (
                  <button
                    onClick={() => void runAdvance('qualification_combinados')}
                    disabled={advancing === 'qualification_combinados' || acta.combinadosQualification.length === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {advancing === 'qualification_combinados'
                      ? 'Generando…'
                      : <><span>↗</span> Asignar a Semis COMBINADOS</>}
                  </button>
                )}
              </div>
              {acta.combinadosQualification.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {acta.combinadosQualification.slice(0, combSemiCutoff).map((r) => (
                    <span key={r.teamId} className="inline-flex items-center gap-1 text-xs bg-white border border-violet-200 rounded-full px-2 py-0.5 text-violet-900 font-medium">
                      <span className="text-violet-400 font-mono text-[10px]">{r.rank}</span>
                      {teamById[r.teamId]?.gymnast_display ?? r.teamId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Step 3: OPEN routine choices ───────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-800">Paso 3 · Elección de rutina OPEN</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Cada equipo elige qué rutina realiza en cada ronda de avance OPEN.
            La elección de Semis debe ser distinta a la de Cuartos.
          </p>
        </div>
        <div className="p-4 space-y-4">
          {([
            { label: 'Cuartos de Final',                          teams: quarterQualified, choices: openQuarterChoices, setChoices: setOpenQuarterChoices, phase: 'open_quarter' as const, disabledFrom: undefined as Record<string, 'Balance' | 'Dynamic' | 'Combined'> | undefined },
            { label: 'Semifinal (debe diferir de Cuartos)',       teams: semiQualified,    choices: openSemiChoices,    setChoices: setOpenSemiChoices,    phase: 'open_semi' as const,    disabledFrom: openQuarterChoices },
            { label: 'Final',                                     teams: finalQualified,   choices: openFinalChoices,   setChoices: setOpenFinalChoices,   phase: 'open_final' as const,   disabledFrom: undefined as Record<string, 'Balance' | 'Dynamic' | 'Combined'> | undefined },
          ] as const).map(({ label, teams, choices, setChoices, phase, disabledFrom }) => (
            <div key={phase} className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-3 py-2 bg-blue-50 border-b border-slate-100 text-sm font-semibold text-blue-800">
                {label} <span className="font-normal text-blue-500 ml-1">({teams.length} equipos)</span>
              </div>
              {teams.length === 0 ? (
                <p className="px-3 py-3 text-sm text-slate-400">Sin equipos clasificados aún — genera esta ronda primero.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Equipo</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 hidden sm:table-cell">Categoría</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 hidden sm:table-cell">Grupo de edad</th>
                      <th className="px-3 py-2 text-right font-semibold text-slate-600">Rutina</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((teamId, idx) => {
                      const team = teamById[teamId]
                      return (
                        <tr key={teamId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="px-3 py-2 font-medium text-slate-800">{team?.gymnast_display ?? teamId}</td>
                          <td className="px-3 py-2 text-slate-500 hidden sm:table-cell">{team ? categoryLabel(team.category, 'es') : '—'}</td>
                          <td className="px-3 py-2 text-slate-500 hidden sm:table-cell">{agLabelMap[team?.age_group ?? ''] ?? '—'}</td>
                          <td className="px-3 py-2 text-right">
                            <select
                              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 font-medium"
                              value={choices[teamId] ?? ''}
                              onChange={async (e) => {
                                const r = e.target.value as 'Balance' | 'Dynamic' | 'Combined'
                                if (disabledFrom?.[teamId] === r) return
                                setChoices((prev) => ({ ...prev, [teamId]: r }))
                                await saveChoice(phase, teamId, r)
                              }}
                            >
                              <option value="">— elegir —</option>
                              <option value="Balance"  disabled={disabledFrom?.[teamId] === 'Balance'}>Balance</option>
                              <option value="Dynamic"  disabled={disabledFrom?.[teamId] === 'Dynamic'}>Dinámico</option>
                              <option value="Combined" disabled={disabledFrom?.[teamId] === 'Combined'}>Combinado</option>
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Step 4: Generate advancement rounds ───────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-800">Paso 4 · Generar rondas de avance</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Ejecuta después de que estén los resultados de cada ronda. Las sesiones deben existir previamente (créalas en Estructura como &quot;Fase bracket&quot;).
          </p>
        </div>
        <div className="p-4">
          <div className="grid md:grid-cols-2 gap-2">
            <button
              onClick={() => void runAdvance('open_quarter')}
              disabled={advancing === 'open_quarter' || !advMap.open_semi}
              className="px-3 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors text-left"
              title={!advMap.open_semi ? 'Crea la sesión "OPEN Semifinal" en Estructura primero' : undefined}
            >
              {advMap.open_semi ? '↺ ' : ''}Cuartos → OPEN Semifinal
              <span className="block text-xs text-blue-200 font-normal mt-0.5">Top {cfg.open_semi_count} de resultados Cuartos</span>
            </button>
            <button
              onClick={() => void runAdvance('combinados_semi')}
              disabled={advancing === 'combinados_semi' || !advMap.combinados_final}
              className="px-3 py-2 rounded-lg bg-violet-700 text-white text-sm font-semibold hover:bg-violet-800 disabled:opacity-50 transition-colors text-left"
              title={!advMap.combinados_final ? 'Crea la sesión "COMBINADOS Final" en Estructura primero' : undefined}
            >
              {advMap.combinados_final ? '↺ ' : ''}COMBINADOS Semis → Final
              <span className="block text-xs text-violet-200 font-normal mt-0.5">Top {cfg.combinados_final_count} de resultados Semis COMBINADOS</span>
            </button>
            <button
              onClick={() => void runAdvance('open_semi')}
              disabled={advancing === 'open_semi' || !advMap.open_final}
              className="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-600 disabled:opacity-50 transition-colors text-left md:col-span-2"
              title={!advMap.open_final ? 'Crea la sesión "OPEN Final" en Estructura primero' : undefined}
            >
              {advMap.open_final ? '↺ ' : ''}OPEN Semis → Final
              <span className="block text-xs text-slate-300 font-normal mt-0.5">Top {cfg.open_final_count} de resultados OPEN Semis</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
