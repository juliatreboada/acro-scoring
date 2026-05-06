'use client'

import { useState } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Json } from '@/lib/database.types'
import { RJ_PENALTY_CATEGORIES, calcRJPenalty } from './scoringRulesRG'

const T = {
  en: {
    title:   'RJ Penalties',
    total:   'Total penalty',
    manual:  'Manual penalty (temp.)',
    coming:  'Penalty categories coming soon — paste them into scoringRulesRG.ts',
  },
  es: {
    title:   'Penalizaciones RJ',
    total:   'Penalización total',
    manual:  'Penalización manual (provisional)',
    coming:  'Categorías de penalización próximamente — añádelas en scoringRulesRG.ts',
  },
}

type PenaltyState = Record<string, number | boolean>
const DEFAULT_STATE: PenaltyState = {}

export function RJPenaltyGrid({ lang, ruleset, onChange }: {
  lang: Lang
  ruleset?: 'Individual' | 'Group'
  onChange: (total: number, detail: Json) => void
}) {
  const t = T[lang]
  const [state, setState] = useState<PenaltyState>(DEFAULT_STATE)
  const [manualValue, setManualValue] = useState(0)

  const visibleCategories = RJ_PENALTY_CATEGORIES.filter(
    cat => !ruleset || cat.group === 'both' || cat.group === ruleset.toLowerCase()
  )
  const hasCategories = visibleCategories.length > 0
  const categoryTotal = calcRJPenalty(state, ruleset)
  const total = hasCategories ? categoryTotal : manualValue

  function handleManual(v: number) {
    setManualValue(v)
    onChange(v, { manual: v } as Json)
  }

  function handleCategory(id: string, value: number | boolean) {
    const next = { ...state, [id]: value }
    setState(next)
    onChange(calcRJPenalty(next), next as unknown as Json)
  }

  if (!hasCategories) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t.title}</p>
        <p className="text-xs text-slate-300 italic">{t.coming}</p>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">{t.manual}</label>
          <input
            type="number" min={0} step={0.1} value={manualValue}
            onChange={e => handleManual(parseFloat(e.target.value) || 0)}
            className="w-20 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-slate-700">{t.total}</span>
          <span className="text-xl font-bold text-red-600 tabular-nums">−{total.toFixed(1)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t.title}</p>
      <div className="space-y-2">
        {visibleCategories.map(cat => {
          const label = lang === 'es' ? cat.label_es : cat.label_en
          const val = state[cat.id]
          if (cat.type === 'bool') {
            const checked = val === true
            return (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={checked}
                  onChange={e => handleCategory(cat.id, e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600" />
                <span className="text-sm text-slate-700 flex-1">{label}</span>
                <span className="text-xs font-semibold text-red-500 tabular-nums">−{cat.value.toFixed(1)}</span>
              </label>
            )
          }
          // count
          const count = (val as number) ?? 0
          return (
            <div key={cat.id} className="flex items-center gap-3">
              <span className="text-sm text-slate-700 flex-1">{label}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleCategory(cat.id, Math.max(0, count - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all">−</button>
                <span className="w-5 text-center text-sm font-semibold tabular-nums">{count}</span>
                <button onClick={() => handleCategory(cat.id, count + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all">+</button>
                <span className="text-xs font-semibold text-red-500 tabular-nums w-10 text-right">
                  −{(count * cat.value).toFixed(1)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between bg-slate-800 text-white rounded-xl px-4 py-3">
        <span className="text-sm font-semibold">{t.total}</span>
        <span className="text-xl font-bold tabular-nums">−{total.toFixed(1)}</span>
      </div>
    </div>
  )
}
