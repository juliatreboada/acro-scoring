'use client'

import React from 'react'
import type { Lang } from '../scoring/types'
import type { PenaltyState } from '../scoring/types'
import { calcCjpPenalty } from '../scoring/types'
import { CJP_PENALTY_CATEGORIES, cjpCategoryContrib } from '@/lib/scoringRules'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: { penaltyTotal: 'Total penalty' },
  es: { penaltyTotal: 'Total penalización' },
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

  function patch(p: Partial<PenaltyState>) {
    onChange({ ...state, ...p })
  }

  const rows = CJP_PENALTY_CATEGORIES.map((cat) => {
    const rawVal = state[cat.id as keyof PenaltyState]
    const contrib = cjpCategoryContrib(cat, rawVal as number | boolean)
    const label = lang === 'en' ? cat.labelEn : cat.labelEs
    const unit = lang === 'en' ? cat.unitEn : cat.unitEs

    let input: React.ReactNode
    if (cat.input.kind === 'seconds' || cat.input.kind === 'counter') {
      input = <Counter value={rawVal as number} onChange={(v) => patch({ [cat.id]: v } as Partial<PenaltyState>)} />
    } else if (cat.input.kind === 'select') {
      input = (
        <div className="flex gap-1 flex-wrap">
          {cat.input.options.map((v) => (
            <button key={v} onClick={() => patch({ [cat.id]: v } as Partial<PenaltyState>)}
              className={['w-9 py-1 rounded-lg text-xs font-bold border transition-all', (rawVal as number) === v ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'].join(' ')}>
              {v.toFixed(1)}
            </button>
          ))}
        </div>
      )
    } else {
      input = (
        <button onClick={() => patch({ [cat.id]: !(rawVal as boolean) } as Partial<PenaltyState>)}
          className={['px-3 py-1 rounded-lg text-xs font-medium border transition-all', rawVal ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-200 hover:border-red-300'].join(' ')}>
          {rawVal ? '✓' : '—'}
        </button>
      )
    }

    return { label, unit, contrib, input }
  })

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
