'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Session, SessionOrder, Team, CompetitionEntry } from '@/components/admin/types'
import { advancePhaseSessionOrders, computeOpenCombinadosActaFromRows, type OpenCombinadosPhaseKey } from '@/lib/openCombinadosBracket'

type Props = {
  lang: 'es' | 'en'
  competitionId: string
  sessions: Session[]
  sessionOrders: SessionOrder[]
  teams: Team[]
  entries: CompetitionEntry[]
}

const PHASES: Array<{ key: OpenCombinadosPhaseKey; label: string; routine: 'Balance' | 'Dynamic' | 'Combined'; group: 'OPEN' | 'COMBINADOS' }> = [
  { key: 'qualification_open_balance', label: 'OPEN Qualification (Balance)', routine: 'Balance', group: 'OPEN' },
  { key: 'qualification_open_dynamic', label: 'OPEN Qualification (Dynamic)', routine: 'Dynamic', group: 'OPEN' },
  { key: 'qualification_combinados_combined', label: 'COMBINADOS Qualification (Combined)', routine: 'Combined', group: 'COMBINADOS' },
  { key: 'open_quarter', label: 'OPEN Quarter (single mixed session)', routine: 'Combined', group: 'OPEN' },
  { key: 'open_semi', label: 'OPEN Semi (single mixed session)', routine: 'Combined', group: 'OPEN' },
  { key: 'open_final', label: 'OPEN Final (single mixed session)', routine: 'Combined', group: 'OPEN' },
  { key: 'combinados_semi_combined', label: 'COMBINADOS Semi (Combined)', routine: 'Combined', group: 'COMBINADOS' },
  { key: 'combinados_final_combined', label: 'COMBINADOS Final (Combined)', routine: 'Combined', group: 'COMBINADOS' },
]

export default function OpenCombinadosTab({ competitionId, sessions, sessionOrders, teams, entries }: Props) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [cfg, setCfg] = useState({ combinados_semi_count: 0, combinados_final_count: 12, open_quarter_count: 0, open_semi_count: 12, open_final_count: 8 })
  const [mapByPhase, setMapByPhase] = useState<Record<string, string>>({})
  const [openQuarterChoices, setOpenQuarterChoices] = useState<Record<string, 'Balance' | 'Dynamic' | 'Combined'>>({})
  const [openSemiChoices, setOpenSemiChoices] = useState<Record<string, 'Balance' | 'Dynamic' | 'Combined'>>({})
  const [openFinalChoices, setOpenFinalChoices] = useState<Record<string, 'Balance' | 'Dynamic' | 'Combined'>>({})

  async function load() {
    setLoading(true)
    const [cfgRes, mapRes, choicesRes] = await Promise.all([
      supabase.from('open_combinados_bracket_config').select('*').eq('competition_id', competitionId).maybeSingle(),
      supabase.from('open_combinados_phase_sessions').select('phase_key,session_id').eq('competition_id', competitionId),
      supabase.from('open_combinados_open_team_choices').select('phase_key,team_id,selected_routine_type').eq('competition_id', competitionId),
    ])
    if (cfgRes.data) setCfg(cfgRes.data)
    const m: Record<string, string> = {}
    for (const r of mapRes.data ?? []) m[r.phase_key] = r.session_id
    setMapByPhase(m)
    const quarter: Record<string, 'Balance' | 'Dynamic' | 'Combined'> = {}
    const semi: Record<string, 'Balance' | 'Dynamic' | 'Combined'> = {}
    const final: Record<string, 'Balance' | 'Dynamic' | 'Combined'> = {}
    for (const c of choicesRes.data ?? []) {
      if (c.phase_key === 'open_quarter') quarter[c.team_id] = c.selected_routine_type as 'Balance' | 'Dynamic' | 'Combined'
      if (c.phase_key === 'open_semi') semi[c.team_id] = c.selected_routine_type as 'Balance' | 'Dynamic' | 'Combined'
      if (c.phase_key === 'open_final') final[c.team_id] = c.selected_routine_type as 'Balance' | 'Dynamic' | 'Combined'
    }
    setOpenQuarterChoices(quarter)
    setOpenSemiChoices(semi)
    setOpenFinalChoices(final)
    setLoading(false)
  }

  useEffect(() => { void load() }, [competitionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const teamById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams])
  const activeTeamIds = useMemo(() => new Set(entries.filter((e) => !e.dropped_out).map((e) => e.team_id)), [entries])
  const phaseRows = useMemo(() => Object.entries(mapByPhase).map(([phase_key, session_id]) => ({ phase_key: phase_key as OpenCombinadosPhaseKey, session_id })), [mapByPhase])

  async function saveConfig() {
    await supabase.from('open_combinados_bracket_config').upsert({ competition_id: competitionId, ...cfg })
  }

  async function assignPhaseSession(phaseKey: OpenCombinadosPhaseKey, sessionId: string, group: 'OPEN' | 'COMBINADOS', routine: 'Balance' | 'Dynamic' | 'Combined') {
    await supabase.from('open_combinados_phase_sessions').upsert({ competition_id: competitionId, phase_key: phaseKey, session_id: sessionId, group_key: group, routine_type: routine }, { onConflict: 'competition_id,phase_key' })
    setMapByPhase((prev) => ({ ...prev, [phaseKey]: sessionId }))
  }

  async function saveChoice(phase: 'open_quarter' | 'open_semi' | 'open_final', teamId: string, routine: 'Balance' | 'Dynamic' | 'Combined') {
    await supabase.from('open_combinados_open_team_choices').upsert({ competition_id: competitionId, phase_key: phase, team_id: teamId, selected_routine_type: routine }, { onConflict: 'competition_id,phase_key,team_id' })
  }

  async function runAdvance(from: 'qualification_open' | 'qualification_combinados' | 'open_quarter' | 'open_semi' | 'combinados_semi') {
    const sessionIds = Object.values(mapByPhase)
    if (!sessionIds.length) return
    const { data: rawRes } = await supabase.from('routine_results').select('session_id,team_id,final_score').in('session_id', sessionIds)
    const acta = computeOpenCombinadosActaFromRows(phaseRows, rawRes ?? [])
    if (from === 'qualification_open') {
      await advancePhaseSessionOrders(supabase, {
        phaseMappings: phaseRows,
        sourceRanking: acta.openQualification,
        targetPhaseKey: 'open_quarter',
        count: cfg.open_quarter_count || Math.floor(acta.openQualification.length / 2),
        openChoicesByTeam: openQuarterChoices,
      })
    }
    if (from === 'qualification_combinados') {
      await advancePhaseSessionOrders(supabase, {
        phaseMappings: phaseRows,
        sourceRanking: acta.combinadosQualification,
        targetPhaseKey: 'combinados_semi_combined',
        count: cfg.combinados_semi_count || Math.floor(acta.combinadosQualification.length / 2),
      })
    }
    if (from === 'open_quarter') {
      await advancePhaseSessionOrders(supabase, {
        phaseMappings: phaseRows,
        sourceRanking: acta.openQuarter ?? [],
        targetPhaseKey: 'open_semi',
        count: cfg.open_semi_count,
        openChoicesByTeam: openSemiChoices,
        forbidRoutineFromPhase: openQuarterChoices,
      })
    }
    if (from === 'open_semi') {
      await advancePhaseSessionOrders(supabase, {
        phaseMappings: phaseRows,
        sourceRanking: acta.openSemi ?? [],
        targetPhaseKey: 'open_final',
        count: cfg.open_final_count,
        openChoicesByTeam: openFinalChoices,
      })
    }
    if (from === 'combinados_semi') {
      await advancePhaseSessionOrders(supabase, {
        phaseMappings: phaseRows,
        sourceRanking: acta.combinadosSemi ?? [],
        targetPhaseKey: 'combinados_final_combined',
        count: cfg.combinados_final_count,
      })
    }
  }

  const quarterQualified = useMemo(() => {
    const ids = new Set((sessionOrders.filter((o) => o.session_id === mapByPhase.open_quarter).map((o) => o.team_id)))
    return [...ids].filter((id) => activeTeamIds.has(id))
  }, [sessionOrders, mapByPhase, activeTeamIds])
  const semiQualified = useMemo(() => {
    const ids = new Set((sessionOrders.filter((o) => o.session_id === mapByPhase.open_semi).map((o) => o.team_id)))
    return [...ids].filter((id) => activeTeamIds.has(id))
  }, [sessionOrders, mapByPhase, activeTeamIds])
  const finalQualified = useMemo(() => {
    const ids = new Set((sessionOrders.filter((o) => o.session_id === mapByPhase.open_final).map((o) => o.team_id)))
    return [...ids].filter((id) => activeTeamIds.has(id))
  }, [sessionOrders, mapByPhase, activeTeamIds])

  const requiredMappings: OpenCombinadosPhaseKey[] = [
    'qualification_open_balance',
    'qualification_open_dynamic',
    'qualification_combinados_combined',
    'open_quarter',
    'open_semi',
    'open_final',
    'combinados_semi_combined',
    'combinados_final_combined',
  ]
  const mappedCount = requiredMappings.filter((k) => Boolean(mapByPhase[k])).length
  const mappingComplete = mappedCount === requiredMappings.length

  if (loading) return <div className="text-sm text-slate-500">Loading bracket config...</div>

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">Bracket setup flow</p>
        <p className="text-xs text-slate-600 mt-1">
          1) Map sessions, 2) save counts, 3) set OPEN routine choices, 4) run generation actions in order.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Step 1 · Phase session mapping</p>
            <p className="text-xs text-slate-500 mt-0.5">Assign one session for each phase before generating progression.</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${mappingComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {mappedCount}/{requiredMappings.length} mapped
          </span>
        </div>
        <div className="p-4 space-y-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">OPEN</p>
            {PHASES.filter((p) => p.group === 'OPEN').map((p) => (
              <div key={p.key} className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-2 items-center">
                <span className="text-sm text-slate-700">{p.label}</span>
                <select className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm" value={mapByPhase[p.key] ?? ''} onChange={(e) => assignPhaseSession(p.key, e.target.value, p.group, p.routine)}>
                  <option value="">Select session</option>
                  {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">COMBINADOS</p>
            {PHASES.filter((p) => p.group === 'COMBINADOS').map((p) => (
              <div key={p.key} className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-2 items-center">
                <span className="text-sm text-slate-700">{p.label}</span>
                <select className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm" value={mapByPhase[p.key] ?? ''} onChange={(e) => assignPhaseSession(p.key, e.target.value, p.group, p.routine)}>
                  <option value="">Select session</option>
                  {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-800">Step 2 · Advancement counts</p>
          <p className="text-xs text-slate-500 mt-0.5">Adjust qualifiers per phase when participation differs from defaults.</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(cfg).map(([k, v]) => (
              <label key={k} className="text-xs text-slate-600">
                {k}
                <input className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm" type="number" value={v} onChange={(e) => setCfg((prev) => ({ ...prev, [k]: Number(e.target.value) }))} />
              </label>
            ))}
          </div>
          <button className="px-3.5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors" onClick={saveConfig}>Save counts</button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-800">Step 3 · OPEN routine choices</p>
          <p className="text-xs text-slate-500 mt-0.5">Set each team routine type inside mixed OPEN sessions.</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Quarter: {quarterQualified.length}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Semi: {semiQualified.length}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Final: {finalQualified.length}</span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-700">OPEN quarter choices</div>
            {quarterQualified.length === 0 ? (
              <p className="px-3 py-3 text-sm text-slate-400">No qualified teams yet. Generate OPEN quarter first.</p>
            ) : quarterQualified.map((teamId, idx) => (
              <div key={teamId} className={`flex items-center justify-between gap-2 px-3 py-2 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                <span className="text-sm text-slate-700">{teamById[teamId]?.gymnast_display ?? teamId}</span>
                <select
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm"
                  value={openQuarterChoices[teamId] ?? 'Combined'}
                  onChange={async (e) => {
                    const r = e.target.value as 'Balance' | 'Dynamic' | 'Combined'
                    setOpenQuarterChoices((prev) => ({ ...prev, [teamId]: r }))
                    await saveChoice('open_quarter', teamId, r)
                  }}
                >
                  <option value="Balance">Balance</option>
                  <option value="Dynamic">Dynamic</option>
                  <option value="Combined">Combined</option>
                </select>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-700">OPEN semi choices (must differ from quarter)</div>
            {semiQualified.length === 0 ? (
              <p className="px-3 py-3 text-sm text-slate-400">No semi-qualified teams yet. Generate OPEN semi after quarter scores.</p>
            ) : semiQualified.map((teamId, idx) => (
              <div key={teamId} className={`flex items-center justify-between gap-2 px-3 py-2 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                <span className="text-sm text-slate-700">{teamById[teamId]?.gymnast_display ?? teamId}</span>
                <select
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm"
                  value={openSemiChoices[teamId] ?? 'Combined'}
                  onChange={async (e) => {
                    const r = e.target.value as 'Balance' | 'Dynamic' | 'Combined'
                    if (openQuarterChoices[teamId] && openQuarterChoices[teamId] === r) return
                    setOpenSemiChoices((prev) => ({ ...prev, [teamId]: r }))
                    await saveChoice('open_semi', teamId, r)
                  }}
                >
                  <option value="Balance" disabled={openQuarterChoices[teamId] === 'Balance'}>Balance</option>
                  <option value="Dynamic" disabled={openQuarterChoices[teamId] === 'Dynamic'}>Dynamic</option>
                  <option value="Combined" disabled={openQuarterChoices[teamId] === 'Combined'}>Combined</option>
                </select>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-700">OPEN final choices</div>
            {finalQualified.length === 0 ? (
              <p className="px-3 py-3 text-sm text-slate-400">No final-qualified teams yet. Generate OPEN final after semi scores.</p>
            ) : finalQualified.map((teamId, idx) => (
              <div key={teamId} className={`flex items-center justify-between gap-2 px-3 py-2 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                <span className="text-sm text-slate-700">{teamById[teamId]?.gymnast_display ?? teamId}</span>
                <select
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm"
                  value={openFinalChoices[teamId] ?? 'Combined'}
                  onChange={async (e) => {
                    const r = e.target.value as 'Balance' | 'Dynamic' | 'Combined'
                    setOpenFinalChoices((prev) => ({ ...prev, [teamId]: r }))
                    await saveChoice('open_final', teamId, r)
                  }}
                >
                  <option value="Balance">Balance</option>
                  <option value="Dynamic">Dynamic</option>
                  <option value="Combined">Combined</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-800">Step 4 · Advance bracket</p>
          <p className="text-xs text-slate-500 mt-0.5">Run actions in progression order after scores are available.</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-2">
            <button className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors text-left" onClick={() => runAdvance('qualification_open')}>
              Generate OPEN quarter
              <span className="block text-xs text-slate-200 font-normal mt-0.5">From OPEN qualification totals</span>
            </button>
            <button className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors text-left" onClick={() => runAdvance('qualification_combinados')}>
              Generate COMBINADOS semi
              <span className="block text-xs text-slate-200 font-normal mt-0.5">From COMBINADOS qualification totals</span>
            </button>
            <button className="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-600 transition-colors text-left" onClick={() => runAdvance('open_quarter')}>
              Generate OPEN semi
              <span className="block text-xs text-slate-200 font-normal mt-0.5">Enforces different routine than quarter</span>
            </button>
            <button className="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-600 transition-colors text-left" onClick={() => runAdvance('open_semi')}>
              Generate OPEN final
              <span className="block text-xs text-slate-200 font-normal mt-0.5">From OPEN semi ranking</span>
            </button>
            <button className="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-600 transition-colors text-left md:col-span-2" onClick={() => runAdvance('combinados_semi')}>
              Generate COMBINADOS final
              <span className="block text-xs text-slate-200 font-normal mt-0.5">From COMBINADOS semi ranking</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
