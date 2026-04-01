'use client'

import React, { useState, useEffect } from 'react'
import type { Lang } from '../aj-scoring/types'
import type { PanelJudge, MockPerf, JudgeScore, RoutineResult, PenaltyState } from './types'
import { calcCjpPenalty, droppedIndices, computeResult, DEFAULT_PENALTY } from './types'
import { categoryLabel } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    noPerf: 'No performance open',
    noPerfSub: 'Select a performance from the list to open it.',
    open: 'Open',
    skip: 'Skip',
    skipped: 'Skipped',
    final: 'Final',
    prov: 'Prov.',
    backToLive: 'Back to live',
    reviewing: 'Reviewing',
    ej: 'EJ',
    aj: 'AJ',
    dj: 'DJ',
    avg: 'Avg',
    djDif: 'DJ Dif.',
    djPen: 'DJ Pen.',
    cjpPen: 'CJP Pen.',
    reopenAll: 'Re-open all',
    reopen: 'Re-open',
    editScore: 'Edit score',
    updateProv: 'Update provisional',
    penalties: 'CJP Penalties',
    penaltyTotal: 'Total penalty',
    submitProv: 'Submit provisional',
    submitFinal: 'Submit final',
    confirmFinal: 'Confirm final',
    nextPerf: 'Next performance',
    ranking: 'Ranking',
    rankCol: '#',
    teamCol: 'Team',
    scoreE: 'E',
    scoreA: 'A',
    scoreD: 'D',
    scorePen: 'Pen.',
    scoreTotal: 'Total',
    balance: 'Balance',
    dynamic: 'Dynamic',
    combined: 'Combined',
    penLabels: [
      'Duration of music over the time limit',
      'Difference in heights',
      'Poor Sportsmanship on the Field of Play',
      'Music infringements (e.g. inappropriate lyrics)',
      'Stepping over the boundary line',
      'Landing / falling outside the boundary',
      'Starting before the music or ending before/after the music',
      'Failure to observe publicity rules (National ID not visible)',
      'Adjustment of attire / loss of accessories',
      'All other attire infringements',
      'Forbidden or immodest attire',
      'Markings on mat (exception MG Balance and Combined)',
      'Indecent positions',
      'Coach present on the floor',
    ],
    penUnits: [
      '× 0.1 / sec',
      'select',
      '0.5',
      '0.5',
      '× 0.1 each',
      '× 0.5 each',
      '0.3',
      '0.3',
      '× 0.1 each',
      '0.3',
      '0.5',
      '0.5',
      '0.3',
      '× 1.0 each',
    ],
  },
  es: {
    noPerf: 'No hay actuación abierta',
    noPerfSub: 'Selecciona una actuación de la lista para abrirla.',
    open: 'Abrir',
    skip: 'Saltar',
    skipped: 'Saltada',
    final: 'Final',
    prov: 'Prov.',
    backToLive: 'Volver al directo',
    reviewing: 'Revisando',
    ej: 'EJ',
    aj: 'AJ',
    dj: 'DJ',
    avg: 'Media',
    djDif: 'DJ Dif.',
    djPen: 'DJ Pen.',
    cjpPen: 'Pen. CJP',
    reopenAll: 'Reabrir todo',
    reopen: 'Reabrir',
    editScore: 'Editar puntuación',
    updateProv: 'Actualizar provisional',
    penalties: 'Penalizaciones CJP',
    penaltyTotal: 'Total penalización',
    submitProv: 'Enviar provisional',
    submitFinal: 'Enviar final',
    confirmFinal: 'Confirmar final',
    nextPerf: 'Siguiente actuación',
    ranking: 'Clasificación',
    rankCol: '#',
    teamCol: 'Equipo',
    scoreE: 'E',
    scoreA: 'A',
    scoreD: 'D',
    scorePen: 'Pen.',
    scoreTotal: 'Total',
    balance: 'Equilibrio',
    dynamic: 'Dinámico',
    combined: 'Combinado',
    penLabels: [
      'Duración de la música por encima del límite de tiempo',
      'Diferencia de alturas entre los deportistas',
      'Conducta antideportiva en el campo de juego',
      'Infracciones musicales (p.ej. letras inapropiadas)',
      'Pisar fuera de la línea de límite',
      'Aterrizaje / caída fuera del límite',
      'Comenzar antes de la música o terminar antes/después',
      'Incumplimiento de normas publicitarias (identificación nacional no visible)',
      'Ajuste del atuendo / pérdida de accesorios',
      'Cualquier otra infracción de atuendo',
      'Atuendo prohibido o indecente',
      'Marcas en la colchoneta (excepción GM Equilibrio y Combinado)',
      'Posiciones indecentes',
      'Entrenador presente en el suelo',
    ],
    penUnits: [
      '× 0.1 / seg',
      'seleccionar',
      '0.5',
      '0.5',
      '× 0.1 cada vez',
      '× 0.5 cada vez',
      '0.3',
      '0.3',
      '× 0.1 cada vez',
      '0.3',
      '0.5',
      '0.5',
      '0.3',
      '× 1.0 cada vez',
    ],
  },
}

// ─── penalty table ────────────────────────────────────────────────────────────

function Counter({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm font-bold flex items-center justify-center"
      >−</button>
      <span className="w-6 text-center text-sm font-bold tabular-nums text-slate-700">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm font-bold flex items-center justify-center"
      >+</button>
    </div>
  )
}

function PenaltyTable({ state, onChange, lang, readonly, hideHeader }: {
  state: PenaltyState
  onChange: (p: PenaltyState) => void
  lang: Lang
  readonly: boolean
  hideHeader?: boolean
}) {
  const t = T[lang]
  const total = calcCjpPenalty(state)
  const [open, setOpen] = useState(true)

  function patch(patch: Partial<PenaltyState>) {
    onChange({ ...state, ...patch })
  }

  const P2_OPTIONS = [0, 0.1, 0.3, 0.5, 1.0]

  const rows: { label: string; unit: string; contrib: number; input: React.ReactNode }[] = [
    {
      label: t.penLabels[0], unit: t.penUnits[0],
      contrib: state.p1Seconds * 0.1,
      input: readonly ? <span className="tabular-nums text-sm">{state.p1Seconds}s</span>
        : <Counter value={state.p1Seconds} onChange={(v) => patch({ p1Seconds: v })} />,
    },
    {
      label: t.penLabels[1], unit: t.penUnits[1],
      contrib: state.p2Value,
      input: readonly ? <span className="tabular-nums text-sm">{state.p2Value.toFixed(1)}</span>
        : (
          <div className="flex gap-1">
            {P2_OPTIONS.map((v) => (
              <button key={v} onClick={() => patch({ p2Value: v })}
                className={['w-9 py-1 rounded-lg text-xs font-bold border transition-all', state.p2Value === v ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'].join(' ')}
              >{v.toFixed(1)}</button>
            ))}
          </div>
        ),
    },
    ...[
      { key: 'p3' as const, val: 0.5, li: 2 },
      { key: 'p4' as const, val: 0.5, li: 3 },
    ].map(({ key, val, li }) => ({
      label: t.penLabels[li], unit: t.penUnits[li],
      contrib: state[key] ? val : 0,
      input: readonly ? <span className="tabular-nums text-sm">{state[key] ? val.toFixed(1) : '—'}</span>
        : (
          <button onClick={() => patch({ [key]: !state[key] })}
            className={['px-3 py-1 rounded-lg text-xs font-medium border transition-all', state[key] ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-200 hover:border-red-300'].join(' ')}
          >{state[key] ? '✓' : '—'}</button>
        ),
    })),
    {
      label: t.penLabels[4], unit: t.penUnits[4],
      contrib: state.p5Count * 0.1,
      input: readonly ? <span className="tabular-nums text-sm">{state.p5Count}×</span>
        : <Counter value={state.p5Count} onChange={(v) => patch({ p5Count: v })} />,
    },
    {
      label: t.penLabels[5], unit: t.penUnits[5],
      contrib: state.p6Count * 0.5,
      input: readonly ? <span className="tabular-nums text-sm">{state.p6Count}×</span>
        : <Counter value={state.p6Count} onChange={(v) => patch({ p6Count: v })} />,
    },
    ...[
      { key: 'p7' as const, val: 0.3, li: 6 },
      { key: 'p8' as const, val: 0.3, li: 7 },
    ].map(({ key, val, li }) => ({
      label: t.penLabels[li], unit: t.penUnits[li],
      contrib: state[key] ? val : 0,
      input: readonly ? <span className="tabular-nums text-sm">{state[key] ? val.toFixed(1) : '—'}</span>
        : (
          <button onClick={() => patch({ [key]: !state[key] })}
            className={['px-3 py-1 rounded-lg text-xs font-medium border transition-all', state[key] ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-200 hover:border-red-300'].join(' ')}
          >{state[key] ? '✓' : '—'}</button>
        ),
    })),
    {
      label: t.penLabels[8], unit: t.penUnits[8],
      contrib: state.p9Count * 0.1,
      input: readonly ? <span className="tabular-nums text-sm">{state.p9Count}×</span>
        : <Counter value={state.p9Count} onChange={(v) => patch({ p9Count: v })} />,
    },
    ...[
      { key: 'p10' as const, val: 0.3, li: 9 },
      { key: 'p11' as const, val: 0.5, li: 10 },
      { key: 'p12' as const, val: 0.5, li: 11 },
      { key: 'p13' as const, val: 0.3, li: 12 },
    ].map(({ key, val, li }) => ({
      label: t.penLabels[li], unit: t.penUnits[li],
      contrib: state[key] ? val : 0,
      input: readonly ? <span className="tabular-nums text-sm">{state[key] ? val.toFixed(1) : '—'}</span>
        : (
          <button onClick={() => patch({ [key]: !state[key] })}
            className={['px-3 py-1 rounded-lg text-xs font-medium border transition-all', state[key] ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-200 hover:border-red-300'].join(' ')}
          >{state[key] ? '✓' : '—'}</button>
        ),
    })),
    {
      label: t.penLabels[13], unit: t.penUnits[13],
      contrib: state.p14Count * 1.0,
      input: readonly ? <span className="tabular-nums text-sm">{state.p14Count}×</span>
        : <Counter value={state.p14Count} onChange={(v) => patch({ p14Count: v })} />,
    },
  ]

  const activeRows = rows.filter((r) => r.contrib > 0)

  if (hideHeader) {
    return (
      <div className="divide-y divide-slate-100">
        {rows.map((row, i) => (
          <div key={i} className={['flex items-center gap-3 px-3 py-2.5', row.contrib > 0 ? 'bg-red-50' : 'bg-white'].join(' ')}>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-600 leading-snug">{row.label}</p>
              <p className="text-xs text-slate-400">{row.unit}</p>
            </div>
            <div className="shrink-0">{row.input}</div>
            <span className={['text-xs font-bold tabular-nums w-8 text-right', row.contrib > 0 ? 'text-red-500' : 'text-slate-300'].join(' ')}>
              {row.contrib > 0 ? `−${row.contrib.toFixed(1)}` : '—'}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 sticky bottom-0 border-t border-slate-200">
          <span className="text-sm font-semibold text-slate-600">{t.penaltyTotal}</span>
          <span className={['text-sm font-bold tabular-nums', total > 0 ? 'text-red-500' : 'text-slate-400'].join(' ')}>
            {total > 0 ? `−${total.toFixed(1)}` : '0'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">{t.penalties}</span>
        <div className="flex items-center gap-2">
          {total > 0 && <span className="text-sm font-bold text-red-500 tabular-nums">−{total.toFixed(1)}</span>}
          <svg className={['w-4 h-4 text-slate-400 transition-transform', open ? 'rotate-180' : ''].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <div key={i} className={['flex items-center gap-3 px-3 py-2', row.contrib > 0 ? 'bg-red-50' : 'bg-white'].join(' ')}>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-600 leading-snug">{row.label}</p>
                <p className="text-xs text-slate-400">{row.unit}</p>
              </div>
              <div className="shrink-0">{row.input}</div>
              <span className={['text-xs font-bold tabular-nums w-8 text-right', row.contrib > 0 ? 'text-red-500' : 'text-slate-300'].join(' ')}>
                {row.contrib > 0 ? `−${row.contrib.toFixed(1)}` : '—'}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50">
            <span className="text-sm font-semibold text-slate-600">{t.penaltyTotal}</span>
            <span className={['text-sm font-bold tabular-nums', total > 0 ? 'text-red-500' : 'text-slate-400'].join(' ')}>
              {total > 0 ? `−${total.toFixed(1)}` : '0'}
            </span>
          </div>
        </div>
      )}

      {!open && activeRows.length > 0 && (
        <div className="px-3 py-1.5 flex flex-wrap gap-1.5 bg-white border-t border-slate-100">
          {activeRows.map((r, i) => (
            <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
              −{r.contrib.toFixed(1)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── score grid ───────────────────────────────────────────────────────────────

function ScoreGrid({ scores, panelJudges, isCJP, lang, locked, onReopen, onEditScore }: {
  scores: JudgeScore[]
  panelJudges: PanelJudge[]
  isCJP: boolean
  lang: Lang
  locked?: boolean
  onReopen: (panelJudgeId: string | 'all') => void
  onEditScore?: (panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
}) {
  const t = T[lang]

  const ejJudges = panelJudges.filter((j) => j.role === 'EJ').sort((a, b) => a.roleNumber - b.roleNumber)
  const ajJudges = panelJudges.filter((j) => j.role === 'AJ').sort((a, b) => a.roleNumber - b.roleNumber)
  const djJudges = panelJudges.filter((j) => j.role === 'DJ').sort((a, b) => a.roleNumber - b.roleNumber)

  const ejVals = ejJudges.map((j) => scores.find((s) => s.panelJudgeId === j.id)?.ejScore)
  const ajVals = ajJudges.map((j) => scores.find((s) => s.panelJudgeId === j.id)?.ajScore)

  const ejNums = ejVals.filter((v): v is number => v != null)
  const ajNums = ajVals.filter((v): v is number => v != null)

  const ejDropped = droppedIndices(ejNums)
  const ajDropped = droppedIndices(ajNums)

  const ejAvg = ejNums.length > 0
    ? ejNums.filter((_, i) => !ejDropped.has(i)).reduce((s, v) => s + v, 0) / (ejNums.length - ejDropped.size || 1)
    : null
  const ajAvg = ajNums.length > 0
    ? ajNums.filter((_, i) => !ajDropped.has(i)).reduce((s, v) => s + v, 0) / (ajNums.length - ajDropped.size || 1)
    : null

  const djScore = djJudges.map((j) => scores.find((s) => s.panelJudgeId === j.id)).find(Boolean)
  const anyScore = scores.length > 0
  const canReopen = isCJP && !locked
  const canEdit = isCJP && !locked && !!onEditScore

  type EditField = 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty'
  const [editState, setEditState] = useState<{ judgeId: string; field: EditField; value: string } | null>(null)

  function startEdit(judgeId: string, field: EditField, currentVal: number) {
    setEditState({ judgeId, field, value: String(currentVal) })
  }

  function commitEdit() {
    if (!editState || !onEditScore) return
    const num = parseFloat(editState.value)
    if (!isNaN(num) && num >= 0) onEditScore(editState.judgeId, editState.field, num)
    setEditState(null)
  }

  const EditInput = () => (
    <div className="flex items-center gap-1">
      <input
        type="number" min="0" step="0.1"
        value={editState!.value}
        onChange={(e) => setEditState((prev) => prev ? { ...prev, value: e.target.value } : prev)}
        onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditState(null) }}
        className="w-14 text-xs font-mono text-slate-800 border border-blue-300 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
        autoFocus
      />
      <button onClick={commitEdit} className="w-5 h-5 rounded text-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center text-xs font-bold">✓</button>
      <button onClick={() => setEditState(null)} className="w-5 h-5 rounded text-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center text-xs">✗</button>
    </div>
  )

  const PencilIcon = () => (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )

  function ScoreCell({ value, dropped }: { value: number | null | undefined; dropped?: boolean }) {
    if (value == null) return <span className="text-slate-300">—</span>
    return (
      <span className={['tabular-nums font-mono text-sm', dropped ? 'line-through text-slate-300' : 'text-slate-800'].join(' ')}>
        {value}
      </span>
    )
  }

  const maxCols = Math.max(ejJudges.length, ajJudges.length, djJudges.length > 0 ? 2 : 1)

  const ReopenBtn = ({ judgeId }: { judgeId: string }) => (
    <button onClick={() => onReopen(judgeId)} title={t.reopen}
      className="w-5 h-5 rounded text-slate-300 hover:text-amber-500 hover:bg-amber-50 transition-colors flex items-center justify-center">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.65-3.65L20 7M4 17l1.35 1.65A9 9 0 0020 15" />
      </svg>
    </button>
  )

  const EditBtn = ({ judgeId, field, value }: { judgeId: string; field: EditField; value: number }) => (
    <button onClick={() => startEdit(judgeId, field, value)} title={t.editScore}
      className="w-5 h-5 rounded text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center">
      <PencilIcon />
    </button>
  )

  const tdBase = 'px-3 py-2 border-t border-slate-100 align-top'
  const tdLabel = `${tdBase} text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap`
  const tdScore = `${tdBase} border-l border-slate-100`
  const tdEmpty = `${tdBase} border-l border-slate-100 text-slate-300 text-xs`
  const tdAvg  = `${tdBase} border-l border-slate-200 whitespace-nowrap`

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {canReopen && anyScore && (
        <div className="flex justify-end px-3 py-1.5 bg-slate-50 border-b border-slate-200">
          <button onClick={() => onReopen('all')}
            className="text-xs text-amber-500 hover:text-amber-700 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.65-3.65L20 7M4 17l1.35 1.65A9 9 0 0020 15" />
            </svg>
            {t.reopenAll}
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <tbody>

            {/* ── EJ row ── */}
            <tr>
              <td className={tdLabel}>{t.ej}</td>
              {ejJudges.map((j, i) => {
                const isEditing = editState?.judgeId === j.id && editState?.field === 'ejScore'
                return (
                  <td key={j.id} className={tdScore}>
                    <div className="text-[10px] text-slate-400 mb-0.5 truncate">EJ{j.roleNumber} {j.name}</div>
                    {isEditing ? <EditInput /> : (
                      <div className="flex items-center gap-1">
                        <ScoreCell value={ejVals[i]} dropped={ejDropped.has(i)} />
                        {canReopen && ejVals[i] != null && <ReopenBtn judgeId={j.id} />}
                        {canEdit && ejVals[i] != null && <EditBtn judgeId={j.id} field="ejScore" value={ejVals[i]!} />}
                      </div>
                    )}
                  </td>
                )
              })}
              {Array.from({ length: maxCols - ejJudges.length }).map((_, i) => (
                <td key={`ej-e-${i}`} className={tdEmpty}>—</td>
              ))}
              <td className={tdAvg}>
                <div className="text-[10px] text-slate-400 mb-0.5">{t.avg}</div>
                <span className="font-bold tabular-nums text-slate-600">
                  {ejAvg != null ? ejAvg.toFixed(3) : '—'}
                </span>
              </td>
            </tr>

            {/* ── AJ row ── */}
            <tr>
              <td className={tdLabel}>{t.aj}</td>
              {ajJudges.map((j, i) => {
                const isEditing = editState?.judgeId === j.id && editState?.field === 'ajScore'
                return (
                  <td key={j.id} className={tdScore}>
                    <div className="text-[10px] text-slate-400 mb-0.5 truncate">AJ{j.roleNumber} {j.name}</div>
                    {isEditing ? <EditInput /> : (
                      <div className="flex items-center gap-1">
                        <ScoreCell value={ajVals[i]} dropped={ajDropped.has(i)} />
                        {canReopen && ajVals[i] != null && <ReopenBtn judgeId={j.id} />}
                        {canEdit && ajVals[i] != null && <EditBtn judgeId={j.id} field="ajScore" value={ajVals[i]!} />}
                      </div>
                    )}
                  </td>
                )
              })}
              {Array.from({ length: maxCols - ajJudges.length }).map((_, i) => (
                <td key={`aj-e-${i}`} className={tdEmpty}>—</td>
              ))}
              <td className={tdAvg}>
                <div className="text-[10px] text-slate-400 mb-0.5">{t.avg}</div>
                <span className="font-bold tabular-nums text-slate-600">
                  {ajAvg != null ? ajAvg.toFixed(3) : '—'}
                </span>
              </td>
            </tr>

            {/* ── DJ row ── */}
            {djJudges.map((j) => {
              const s = scores.find((sc) => sc.panelJudgeId === j.id)
              const isEditingDif = editState?.judgeId === j.id && editState?.field === 'djDifficulty'
              const isEditingPen = editState?.judgeId === j.id && editState?.field === 'djPenalty'
              return (
                <tr key={j.id}>
                  <td className={tdLabel}>{t.dj}</td>
                  {/* Col 1: Difficulty */}
                  <td className={tdScore}>
                    <div className="text-[10px] text-slate-400 mb-0.5 truncate">DJ{j.roleNumber} {j.name}</div>
                    {isEditingDif ? <EditInput /> : (
                      <div className="flex items-center gap-1">
                        <ScoreCell value={s?.djDifficulty} />
                        {canReopen && s?.djDifficulty != null && <ReopenBtn judgeId={j.id} />}
                        {canEdit && s?.djDifficulty != null && <EditBtn judgeId={j.id} field="djDifficulty" value={s.djDifficulty!} />}
                      </div>
                    )}
                  </td>
                  {/* Col 2: Penalty */}
                  <td className={tdScore}>
                    <div className="text-[10px] text-slate-400 mb-0.5">{t.djPen}</div>
                    {isEditingPen ? <EditInput /> : (
                      <div className="flex items-center gap-1">
                        <ScoreCell value={s?.djPenalty != null ? -s.djPenalty : null} />
                        {canEdit && s?.djPenalty != null && <EditBtn judgeId={j.id} field="djPenalty" value={s.djPenalty!} />}
                      </div>
                    )}
                  </td>
                  {Array.from({ length: maxCols - 2 }).map((_, i) => (
                    <td key={`dj-e-${i}`} className={tdEmpty}>—</td>
                  ))}
                  <td className={tdAvg + ' text-slate-300'}>—</td>
                </tr>
              )
            })}

          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── score preview ────────────────────────────────────────────────────────────

function ScorePreview({ scores, panelJudges, cjpPenalty, lang }: {
  scores: JudgeScore[]
  panelJudges: PanelJudge[]
  cjpPenalty: number
  lang: Lang
}) {
  const t = T[lang]

  const ejJudges = panelJudges.filter((j) => j.role === 'EJ')
  const ajJudges = panelJudges.filter((j) => j.role === 'AJ')
  const djJudges = panelJudges.filter((j) => j.role === 'DJ')

  const ejNums = ejJudges.map((j) => scores.find((s) => s.panelJudgeId === j.id)?.ejScore).filter((v): v is number => v != null)
  const ajNums = ajJudges.map((j) => scores.find((s) => s.panelJudgeId === j.id)?.ajScore).filter((v): v is number => v != null)
  const djScore = djJudges.map((j) => scores.find((s) => s.panelJudgeId === j.id)).find(Boolean)

  if (ejNums.length === 0 && ajNums.length === 0 && !djScore) return null

  const ejDropped = droppedIndices(ejNums)
  const ajDropped = droppedIndices(ajNums)

  const ejAvg = ejNums.length > 0
    ? ejNums.filter((_, i) => !ejDropped.has(i)).reduce((s, v) => s + v, 0) / (ejNums.length - ejDropped.size || 1)
    : 0
  const ajAvg = ajNums.length > 0
    ? ajNums.filter((_, i) => !ajDropped.has(i)).reduce((s, v) => s + v, 0) / (ajNums.length - ajDropped.size || 1)
    : 0

  const difScore = djScore?.djDifficulty ?? 0
  const difPenalty = djScore?.djPenalty ?? 0
  const total = Math.max(0, ejAvg * 2 + ajAvg + difScore - difPenalty - cjpPenalty)

  return (
    <div className="bg-slate-800 text-white rounded-xl p-4">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mb-3">
        <span>E <span className="text-slate-200 font-mono tabular-nums">{(ejAvg * 2).toFixed(3)}</span></span>
        <span>A <span className="text-slate-200 font-mono tabular-nums">{ajAvg.toFixed(3)}</span></span>
        <span>D <span className="text-slate-200 font-mono tabular-nums">{difScore.toFixed(2)}</span></span>
        {difPenalty > 0 && <span>DJ Pen <span className="text-red-400 font-mono tabular-nums">−{difPenalty.toFixed(1)}</span></span>}
        {cjpPenalty > 0 && <span>CJP Pen <span className="text-red-400 font-mono tabular-nums">−{cjpPenalty.toFixed(1)}</span></span>}
      </div>
      <div className="text-right">
        <p className="text-4xl font-bold tabular-nums">{total.toFixed(3)}</p>
      </div>
    </div>
  )
}

// ─── ranking table ────────────────────────────────────────────────────────────

function RankingTable({ performances, results, lang, selectedPerfId, onSelectPerf }: {
  performances: MockPerf[]
  results: Record<string, RoutineResult>
  lang: Lang
  selectedPerfId?: string | null
  onSelectPerf?: (perfId: string) => void
}) {
  const t = T[lang]

  const scored = Object.values(results)
  if (scored.length === 0) return null

  const routineLabel = (rt: string) =>
    ({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined }[rt] ?? rt)

  const groupKey = (p: MockPerf) => `${p.ageGroup}||${p.category}||${p.routineType}`
  const groupLabel = (p: MockPerf) => `${p.ageGroup} · ${categoryLabel(p.category, lang)} · ${routineLabel(p.routineType)}`

  const perfById = Object.fromEntries(performances.map((p) => [p.id, p]))

  // unique groups that have results, in the order they appear in the performance list
  const groupOrder: string[] = []
  for (const p of performances) {
    const k = groupKey(p)
    if (!groupOrder.includes(k) && results[p.id]) groupOrder.push(k)
  }

  const [activeTab, setActiveTab] = useState<string>(groupOrder[groupOrder.length - 1] ?? '')

  // auto-select the newest tab when a new group appears
  useEffect(() => {
    if (groupOrder.length > 0) setActiveTab(groupOrder[groupOrder.length - 1])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupOrder.length])

  const currentTab = groupOrder.includes(activeTab) ? activeTab : groupOrder[groupOrder.length - 1]

  const rowsForTab = performances
    .filter((p) => groupKey(p) === currentTab && results[p.id])
    .sort((a, b) => (results[b.id]?.finalScore ?? 0) - (results[a.id]?.finalScore ?? 0))

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{t.ranking}</p>
        {groupOrder.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            {groupOrder.map((k) => {
              const perf = performances.find((p) => groupKey(p) === k)
              return (
                <button key={k} onClick={() => setActiveTab(k)}
                  className={['px-2.5 py-1 rounded-lg text-xs font-medium transition-all', currentTab === k ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'].join(' ')}
                >
                  {perf ? groupLabel(perf) : k}
                </button>
              )
            })}
          </div>
        )}
        {groupOrder.length === 1 && (
          <p className="text-xs text-slate-600 font-medium">
            {performances.find((p) => groupKey(p) === groupOrder[0]) ? groupLabel(performances.find((p) => groupKey(p) === groupOrder[0])!) : ''}
          </p>
        )}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {[t.rankCol, t.teamCol, t.scoreE, t.scoreA, t.scoreD, t.scorePen, t.scoreTotal, ''].map((h, i) => (
              <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rowsForTab.map((perf, rank) => {
            const r = results[perf.id]!
            const totalPen = r.difPenalty + r.cjpPenalty
            const isSelected = selectedPerfId === perf.id
            return (
              <tr
                key={perf.id}
                onClick={() => onSelectPerf?.(perf.id)}
                className={[
                  'transition-colors',
                  onSelectPerf ? 'cursor-pointer' : '',
                  isSelected ? 'bg-blue-50' : 'hover:bg-slate-50',
                ].join(' ')}
              >
                <td className="px-3 py-2 font-bold text-slate-500">{rank + 1}</td>
                <td className="px-3 py-2 font-medium text-slate-800 max-w-[160px] truncate">{perf.gymnasts}</td>
                <td className="px-3 py-2 tabular-nums font-mono text-slate-700">{(r.eScore * 2).toFixed(3)}</td>
                <td className="px-3 py-2 tabular-nums font-mono text-slate-700">{r.aScore.toFixed(3)}</td>
                <td className="px-3 py-2 tabular-nums font-mono text-slate-700">{r.difScore.toFixed(2)}</td>
                <td className="px-3 py-2 tabular-nums font-mono">
                  <span className={totalPen > 0 ? 'text-red-500' : 'text-slate-300'}>
                    {totalPen > 0 ? `−${totalPen.toFixed(1)}` : '—'}
                  </span>
                </td>
                <td className="px-3 py-2 tabular-nums font-bold text-slate-800">{r.finalScore.toFixed(3)}</td>
                <td className="px-3 py-2">
                  <span className={['text-xs font-medium px-2 py-0.5 rounded-full', r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'border border-amber-300 text-amber-600'].join(' ')}>
                    {r.status === 'approved' ? t.final : t.prov}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export type CJPViewProps = {
  isCJP: boolean
  lang: Lang
  panelJudges: PanelJudge[]
  performances: MockPerf[]
  currentPerfId: string | null
  judgeScores: Record<string, JudgeScore[]>
  results: Record<string, RoutineResult>
  onOpen: (perfId: string) => void
  onSkip: (perfId: string) => void
  onSubmit: (status: 'provisional' | 'approved', result: RoutineResult) => void
  onReopenScore: (perfId: string, panelJudgeId: string | 'all') => void
  onEditScore?: (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
}

export default function CJPView({
  isCJP, lang, panelJudges, performances,
  currentPerfId, judgeScores, results,
  onOpen, onSkip, onSubmit, onReopenScore, onEditScore,
}: CJPViewProps) {
  const t = T[lang]
  const [penaltyStates, setPenaltyStates] = useState<Record<string, PenaltyState>>({})
  const [reviewPerfId, setReviewPerfId] = useState<string | null>(null)
  const [leftOpen, setLeftOpen] = useState(true)
  const [viewTab, setViewTab] = useState<'scores' | 'ts'>('scores')

  const routineLabel = (rt: string) =>
    ({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined }[rt] ?? rt)

  function getPenalty(perfId: string): PenaltyState {
    return penaltyStates[perfId] ?? DEFAULT_PENALTY
  }

  function setPenalty(perfId: string, p: PenaltyState) {
    setPenaltyStates((prev) => ({ ...prev, [perfId]: p }))
  }

  const currentPerf = performances.find((p) => p.id === currentPerfId) ?? null
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const currentResult = currentPerfId ? results[currentPerfId] ?? null : null
  const currentPenalty = currentPerfId ? getPenalty(currentPerfId) : DEFAULT_PENALTY
  const cjpPenalty = calcCjpPenalty(currentPenalty)

  // review mode
  const reviewPerf = reviewPerfId ? performances.find((p) => p.id === reviewPerfId) ?? null : null
  const reviewScores = reviewPerfId ? (judgeScores[reviewPerfId] ?? []) : []
  const reviewResult = reviewPerfId ? results[reviewPerfId] ?? null : null
  const reviewPenalty = reviewPerfId ? getPenalty(reviewPerfId) : DEFAULT_PENALTY
  const reviewCjpPenalty = calcCjpPenalty(reviewPenalty)

  const nextPending = performances.find(
    (p) => !p.skipped && !results[p.id] && p.id !== currentPerfId
  )

  function handleSubmit(status: 'provisional' | 'approved') {
    if (!currentPerfId) return
    const result = computeResult(currentPerfId, currentScores, panelJudges, cjpPenalty, status)
    onSubmit(status, result)
  }

  function handleConfirmFinalFromReview() {
    if (!reviewPerfId) return
    const result = computeResult(reviewPerfId, reviewScores, panelJudges, reviewCjpPenalty, 'approved')
    onSubmit('approved', result)
  }

  function handleUpdateProvisional() {
    if (!reviewPerfId) return
    const result = computeResult(reviewPerfId, reviewScores, panelJudges, reviewCjpPenalty, 'provisional')
    onSubmit('provisional', result)
  }

  function handleRankingRowClick(perfId: string) {
    // clicking the currently open live perf → no review needed
    if (perfId === currentPerfId) {
      setReviewPerfId(null)
      return
    }
    setReviewPerfId((prev) => prev === perfId ? null : perfId)
  }

  const isReviewMode = reviewPerfId !== null && reviewPerfId !== currentPerfId

  return (
    <div className="flex gap-0 h-[calc(100vh-60px)]">
      {/* ── left panel: performance list ── */}
      <div className={['border-r border-slate-200 bg-white flex flex-col min-h-0 transition-all duration-200', leftOpen ? 'w-64' : 'w-9'].join(' ')}>
        <div className="px-2 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          {leftOpen && <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Performances</p>}
          <button
            onClick={() => setLeftOpen(o => !o)}
            className="ml-auto p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            title={leftOpen ? 'Collapse' : 'Expand'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {leftOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />}
            </svg>
          </button>
        </div>
        <div className={['flex-1 overflow-y-auto', leftOpen ? '' : 'hidden'].join(' ')}>
          {performances.map((perf) => {
            const result = results[perf.id]
            const isCurrent = perf.id === currentPerfId
            const canOpen = isCJP && !perf.skipped && !result && !isCurrent
            const canSkip = isCJP && !perf.skipped && !result

            return (
              <div
                key={perf.id}
                className={[
                  'group px-3 py-2.5 border-b border-slate-100 transition-colors',
                  isCurrent ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-50',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs text-slate-400 font-mono shrink-0">{perf.position}</span>
                      <span className="text-xs font-medium text-slate-700 truncate">{perf.gymnasts}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-slate-400">{routineLabel(perf.routineType)}</span>
                      {perf.skipped && (
                        <span className="text-xs bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">{t.skipped}</span>
                      )}
                      {result && (
                        <span className={['text-xs px-1.5 py-0.5 rounded-full font-medium', result.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'border border-slate-300 text-slate-500'].join(' ')}>
                          {result.status === 'approved' ? t.final : t.prov} {result.finalScore.toFixed(3)}
                        </span>
                      )}
                    </div>
                  </div>
                  {isCJP && (
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canOpen && (
                        <button onClick={() => onOpen(perf.id)}
                          title={t.open}
                          className="w-6 h-6 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </button>
                      )}
                      {canSkip && (
                        <button onClick={() => onSkip(perf.id)}
                          title={t.skip}
                          className="w-6 h-6 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── center panel ── */}
      <div className="flex-1 flex flex-col min-h-0">

        {/* ── tab bar (only when a perf is active or in review) ── */}
        {(currentPerf || isReviewMode) && (
          <div className="flex border-b border-slate-200 bg-white shrink-0">
            {(['scores', 'ts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setViewTab(tab)}
                className={[
                  'px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors border-b-2 -mb-px',
                  viewTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600',
                ].join(' ')}
              >
                {tab === 'scores' ? (lang === 'es' ? 'Puntuaciones' : 'Scores') : 'TS'}
              </button>
            ))}
          </div>
        )}

        {/* ── TS tab ── */}
        {viewTab === 'ts' && (currentPerf || isReviewMode) && (() => {
          const activePerf = isReviewMode ? reviewPerf : currentPerf
          return activePerf?.tsUrl ? (
            <iframe src={activePerf.tsUrl} className="flex-1 min-h-0 w-full border-0" title="TS" />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-300">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M9 17h4" />
              </svg>
              <p className="text-sm font-medium">{lang === 'es' ? 'Sin PDF de hoja de tarifa' : 'No tariff sheet PDF'}</p>
            </div>
          )
        })()}

        {/* ── scores tab ── */}
        {(viewTab === 'scores' || !(currentPerf || isReviewMode)) && (
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">

            {/* ── review mode ── */}
            {isReviewMode && reviewPerf ? (
              <>
                {/* review header */}
                <div className="bg-slate-700 text-white px-4 py-2 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wide">
                      {t.reviewing} · #{reviewPerf.position} · {reviewPerf.ageGroup} · {categoryLabel(reviewPerf.category, lang)} · {routineLabel(reviewPerf.routineType)}
                    </span>
                    <button
                      onClick={() => setReviewPerfId(null)}
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors shrink-0 ml-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      {t.backToLive}
                    </button>
                  </div>
                  <p className="text-sm font-semibold mt-0.5">{reviewPerf.gymnasts}</p>
                </div>

                <ScoreGrid
                  scores={reviewScores}
                  panelJudges={panelJudges}
                  isCJP={isCJP}
                  lang={lang}
                  locked={reviewResult?.status === 'approved'}
                  onReopen={(id) => {
                    onReopenScore(reviewPerfId!, id)
                    onOpen(reviewPerfId!)
                    setReviewPerfId(null)
                  }}
                  onEditScore={reviewResult?.status === 'provisional' && onEditScore
                    ? (judgeId, field, value) => onEditScore(reviewPerfId!, judgeId, field, value)
                    : undefined
                  }
                />

                <ScorePreview
                  scores={reviewScores}
                  panelJudges={panelJudges}
                  cjpPenalty={reviewCjpPenalty}
                  lang={lang}
                />

                {isCJP && reviewResult?.status === 'provisional' && (
                  <div className="flex gap-2">
                    <button onClick={handleUpdateProvisional}
                      className="flex-1 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:border-slate-400 hover:bg-slate-50 active:scale-95 transition-all">
                      {t.updateProv}
                    </button>
                    <button onClick={handleConfirmFinalFromReview}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 active:scale-95 transition-all">
                      ✓ {t.confirmFinal}
                    </button>
                  </div>
                )}

                {isCJP && reviewResult?.status === 'approved' && (
                  <div className="py-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-center">
                    <span className="text-sm font-semibold text-emerald-700">✓ {t.final} · {reviewResult.finalScore.toFixed(3)}</span>
                  </div>
                )}
              </>
            ) : (
              /* ── live scoring mode ── */
              !currentPerf ? (
                <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-slate-600">{t.noPerf}</p>
                  <p className="text-sm text-slate-400">{t.noPerfSub}</p>
                </div>
              ) : (
                <>
                  {/* performance header — compact */}
                  <div className="bg-slate-800 text-white px-4 py-2 rounded-xl">
                    <span className="text-xs text-slate-400 uppercase tracking-wide">
                      #{currentPerf.position} · {currentPerf.ageGroup} · {categoryLabel(currentPerf.category, lang)} · {routineLabel(currentPerf.routineType)}
                    </span>
                    <p className="text-sm font-semibold mt-0.5">{currentPerf.gymnasts}</p>
                  </div>

                  <ScoreGrid
                    scores={currentScores}
                    panelJudges={panelJudges}
                    isCJP={isCJP}
                    lang={lang}
                    locked={currentResult?.status === 'approved'}
                    onReopen={(id) => onReopenScore(currentPerfId!, id)}
                  />

                  <ScorePreview
                    scores={currentScores}
                    panelJudges={panelJudges}
                    cjpPenalty={cjpPenalty}
                    lang={lang}
                  />

                  {isCJP && (
                    <div className="space-y-2">
                      {!currentResult && (
                        <div className="flex gap-2">
                          <button onClick={() => handleSubmit('provisional')}
                            className="flex-1 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:border-slate-400 hover:bg-slate-50 active:scale-95 transition-all">
                            {t.submitProv}
                          </button>
                          <button onClick={() => handleSubmit('approved')}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 active:scale-95 transition-all">
                            ✓ {t.submitFinal}
                          </button>
                        </div>
                      )}
                      {currentResult?.status === 'provisional' && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-center">
                            <span className="text-sm font-medium text-slate-500">{t.prov} · {currentResult.finalScore.toFixed(3)}</span>
                          </div>
                          <button onClick={() => handleSubmit('approved')}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 active:scale-95 transition-all">
                            ✓ {t.confirmFinal}
                          </button>
                        </div>
                      )}
                      {currentResult?.status === 'approved' && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 py-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-center">
                            <span className="text-sm font-semibold text-emerald-700">✓ {t.final} · {currentResult.finalScore.toFixed(3)}</span>
                          </div>
                          {nextPending && (
                            <button onClick={() => onOpen(nextPending.id)}
                              className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              {t.nextPerf}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )
            )}

            {/* ranking */}
            <RankingTable
              performances={performances}
              results={results}
              lang={lang}
              selectedPerfId={isReviewMode ? reviewPerfId : currentPerfId}
              onSelectPerf={handleRankingRowClick}
            />
          </div>
        )}
      </div>

      {/* ── right panel: CJP penalties ── */}
      <div className="w-72 border-l border-slate-200 bg-white flex flex-col min-h-0">
        <div className="px-3 py-2.5 border-b border-slate-200 shrink-0">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.penalties}</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {(isReviewMode ? reviewPerf : currentPerf) ? (
            <PenaltyTable
              state={isReviewMode ? reviewPenalty : currentPenalty}
              onChange={(p) => {
                const id = isReviewMode ? reviewPerfId! : currentPerfId!
                setPenalty(id, p)
              }}
              lang={lang}
              readonly={
                isReviewMode
                  ? reviewResult?.status === 'approved' || !isCJP
                  : !isCJP || currentResult?.status === 'approved'
              }
              hideHeader
            />
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-xs text-slate-300">{t.noPerfSub}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
