'use client'

import React from 'react'
import type { Lang } from '../aj-scoring/types'
import type { PenaltyState } from '../cjp/types'
import { calcCjpPenalty } from '../cjp/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    penaltyTotal: 'Total penalty',
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
      '× 0.1 / sec', 'select', '0.5', '0.5', '× 0.1 each', '× 0.5 each',
      '0.3', '0.3', '× 0.1 each', '0.3', '0.5', '0.5', '0.3', '× 1.0 each',
    ],
  },
  es: {
    penaltyTotal: 'Total penalización',
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
      '× 0.1 / seg', 'seleccionar', '0.5', '0.5', '× 0.1 cada vez', '× 0.5 cada vez',
      '0.3', '0.3', '× 0.1 cada vez', '0.3', '0.5', '0.5', '0.3', '× 1.0 cada vez',
    ],
  },
}

// ─── counter ──────────────────────────────────────────────────────────────────

function Counter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm font-bold flex items-center justify-center">−</button>
      <span className="w-6 text-center text-sm font-bold tabular-nums text-slate-700">{value}</span>
      <button onClick={() => onChange(value + 1)} className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm font-bold flex items-center justify-center">+</button>
    </div>
  )
}

// ─── penalty panel ────────────────────────────────────────────────────────────

export function PenaltyPanel({ state, onChange, lang }: {
  state: PenaltyState
  onChange: (p: PenaltyState) => void
  lang: Lang
}) {
  const t = T[lang]
  const total = calcCjpPenalty(state)
  const P2_OPTIONS = [0, 0.1, 0.3, 0.5, 1.0]

  function patch(p: Partial<PenaltyState>) {
    onChange({ ...state, ...p })
  }

  const rows: { label: string; unit: string; contrib: number; input: React.ReactNode }[] = [
    {
      label: t.penLabels[0], unit: t.penUnits[0], contrib: state.p1Seconds * 0.1,
      input: <Counter value={state.p1Seconds} onChange={(v) => patch({ p1Seconds: v })} />,
    },
    {
      label: t.penLabels[1], unit: t.penUnits[1], contrib: state.p2Value,
      input: (
        <div className="flex gap-1 flex-wrap">
          {P2_OPTIONS.map((v) => (
            <button key={v} onClick={() => patch({ p2Value: v })}
              className={['w-9 py-1 rounded-lg text-xs font-bold border transition-all', state.p2Value === v ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'].join(' ')}>
              {v.toFixed(1)}
            </button>
          ))}
        </div>
      ),
    },
    ...([
      { key: 'p3' as const, val: 0.5, li: 2 },
      { key: 'p4' as const, val: 0.5, li: 3 },
    ].map(({ key, val, li }) => ({
      label: t.penLabels[li], unit: t.penUnits[li], contrib: state[key] ? val : 0,
      input: (
        <button onClick={() => patch({ [key]: !state[key] })}
          className={['px-3 py-1 rounded-lg text-xs font-medium border transition-all', state[key] ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-200 hover:border-red-300'].join(' ')}>
          {state[key] ? '✓' : '—'}
        </button>
      ),
    }))),
    {
      label: t.penLabels[4], unit: t.penUnits[4], contrib: state.p5Count * 0.1,
      input: <Counter value={state.p5Count} onChange={(v) => patch({ p5Count: v })} />,
    },
    {
      label: t.penLabels[5], unit: t.penUnits[5], contrib: state.p6Count * 0.5,
      input: <Counter value={state.p6Count} onChange={(v) => patch({ p6Count: v })} />,
    },
    ...([
      { key: 'p7' as const, val: 0.3, li: 6 },
      { key: 'p8' as const, val: 0.3, li: 7 },
    ].map(({ key, val, li }) => ({
      label: t.penLabels[li], unit: t.penUnits[li], contrib: state[key] ? val : 0,
      input: (
        <button onClick={() => patch({ [key]: !state[key] })}
          className={['px-3 py-1 rounded-lg text-xs font-medium border transition-all', state[key] ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-200 hover:border-red-300'].join(' ')}>
          {state[key] ? '✓' : '—'}
        </button>
      ),
    }))),
    {
      label: t.penLabels[8], unit: t.penUnits[8], contrib: state.p9Count * 0.1,
      input: <Counter value={state.p9Count} onChange={(v) => patch({ p9Count: v })} />,
    },
    ...([
      { key: 'p10' as const, val: 0.3, li: 9 },
      { key: 'p11' as const, val: 0.5, li: 10 },
      { key: 'p12' as const, val: 0.5, li: 11 },
      { key: 'p13' as const, val: 0.3, li: 12 },
    ].map(({ key, val, li }) => ({
      label: t.penLabels[li], unit: t.penUnits[li], contrib: state[key] ? val : 0,
      input: (
        <button onClick={() => patch({ [key]: !state[key] })}
          className={['px-3 py-1 rounded-lg text-xs font-medium border transition-all', state[key] ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-200 hover:border-red-300'].join(' ')}>
          {state[key] ? '✓' : '—'}
        </button>
      ),
    }))),
    {
      label: t.penLabels[13], unit: t.penUnits[13], contrib: state.p14Count * 1.0,
      input: <Counter value={state.p14Count} onChange={(v) => patch({ p14Count: v })} />,
    },
  ]

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {rows.map((row, i) => (
          <div key={i} className={['flex items-center gap-3 px-3 py-2.5', row.contrib > 0 ? 'bg-red-50' : 'bg-white'].join(' ')}>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-600 leading-snug">{row.label}</p>
              <p className="text-xs text-slate-400">{row.unit}</p>
            </div>
            <div className="shrink-0">{row.input}</div>
            <span className={['text-xs font-bold tabular-nums w-8 text-right shrink-0', row.contrib > 0 ? 'text-red-500' : 'text-slate-300'].join(' ')}>
              {row.contrib > 0 ? `−${row.contrib.toFixed(1)}` : '—'}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border-t border-slate-200 shrink-0">
        <span className="text-sm font-semibold text-slate-600">{t.penaltyTotal}</span>
        <span className={['text-sm font-bold tabular-nums', total > 0 ? 'text-red-500' : 'text-slate-400'].join(' ')}>
          {total > 0 ? `−${total.toFixed(1)}` : '0'}
        </span>
      </div>
    </div>
  )
}
