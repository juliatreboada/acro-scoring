'use client'

import { useState } from 'react'
import type { Lang } from '@/components/scoring/types'

const T = {
  en: { submit: 'Confirm', score: 'Score', hint1: '0.0 – 10.0', hint2: '0.00 – 10.00' },
  es: { submit: 'Confirmar', score: 'Nota', hint1: '0.0 – 10.0', hint2: '0.00 – 10.00' },
}

const KEYS = [['7','8','9'],['4','5','6'],['1','2','3'],['.','0','⌫']]

// inverted=true → user enters deduction, stored value = 10 − entered (for E judge)
export function RGNumericKeyboard({ lang, maxDecimals = 1, inverted = false, onSubmit }: {
  lang: Lang
  maxDecimals?: 1 | 2
  inverted?: boolean
  onSubmit: (value: number) => void
}) {
  const t = T[lang]
  const [input, setInput] = useState('')

  const parsed = input === '' ? null : parseFloat(input)
  const isValid = parsed !== null && !isNaN(parsed) && parsed >= 0 && parsed <= 10

  const displayedValue = isValid ? parsed : 0
  const storedValue    = inverted ? 10 - displayedValue : displayedValue

  function handleKey(key: string) {
    if (key === '⌫') { setInput(p => p.slice(0, -1)); return }
    if (key === '.') {
      if (input === '' || input.includes('.')) return
      setInput(p => p + '.')
      return
    }
    const next = input + key
    if (input === '0' && key !== '.') return
    const dotIdx = next.indexOf('.')
    if (dotIdx !== -1 && next.length - dotIdx > maxDecimals) return
    const val = parseFloat(next)
    if (!isNaN(val) && val > 10) return
    setInput(next)
  }

  return (
    <div className="px-4 pb-6">
      <p className="text-xs text-slate-400 text-center mb-2">{maxDecimals === 2 ? t.hint2 : t.hint1}</p>

      {/* display */}
      <div className="bg-slate-100 rounded-2xl py-5 text-center mb-2">
        <span className={['text-5xl font-bold tabular-nums tracking-tight', input ? 'text-slate-800' : 'text-slate-300'].join(' ')}>
          {input || '—'}
        </span>
      </div>

      {/* inverted: show the stored score below the entered value */}
      {inverted && isValid && (
        <p className="text-center text-sm text-slate-500 mb-3">
          {t.score}: <span className="font-bold text-slate-800 tabular-nums">{storedValue.toFixed(maxDecimals)}</span>
        </p>
      )}

      {/* keypad */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {KEYS.flat().map(key => (
          <button key={key} onClick={() => handleKey(key)}
            className={[
              'py-5 rounded-2xl text-xl font-semibold transition-all active:scale-95',
              key === '⌫'
                ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                : 'bg-white text-slate-800 shadow-sm hover:bg-slate-50 border border-slate-100',
            ].join(' ')}>
            {key}
          </button>
        ))}
      </div>

      <button
        disabled={!isValid}
        onClick={() => isValid && onSubmit(inverted ? storedValue : displayedValue)}
        className={[
          'w-full py-4 rounded-2xl font-bold text-lg transition-all',
          isValid
            ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white'
            : 'bg-slate-100 text-slate-300 cursor-not-allowed',
        ].join(' ')}>
        {isValid
          ? `${t.submit} · ${storedValue.toFixed(maxDecimals)}`
          : t.submit}
      </button>
    </div>
  )
}
