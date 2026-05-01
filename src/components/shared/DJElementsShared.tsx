'use client'

import { useState } from 'react'
import type { Lang } from '../scoring/types'
import type { TsElement, ElementType } from '../scoring/types'
import type { ElementFlag, ElementFlags } from '../scoring/types'
import { DEFAULT_FLAG } from '../scoring/types'
import { MAX_RETRIES } from '@/lib/scoringRules'
export { MAX_RETRIES } from '@/lib/scoringRules'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    done: 'Done', notDone: 'Not done', tf: 'TF',
    srNotDone: 'SR not done', forbidden: 'Forbidden', noSupport: 'No support',
    note: 'Note…', addRetry: 'Add retry', retry: 'Retry',
    difficulty: 'D', elementLabel: 'Element description…', isStatic: 'Static',
    incorrectTs: 'Incorrect TS', incorrectTsNote: '−0.3 · order or element differs from declared',
    noElements: 'No elements in tariff sheet', noElementsNote: 'You can submit immediately',
    addElement: '+ Add unlisted element',
    submit: 'Submit', difficultyTotal: 'Difficulty', djPenalty: 'DJ Penalty',
    scoreHint: 'Enter difficulty and penalty',
  },
  es: {
    done: 'Realizado', notDone: 'No realizado', tf: 'FT',
    srNotDone: 'SR no realizado', forbidden: 'Prohibido', noSupport: 'Sin apoyo',
    note: 'Nota…', addRetry: 'Añadir reintento', retry: 'Reintento',
    difficulty: 'D', elementLabel: 'Descripción del elemento…', isStatic: 'Estático',
    incorrectTs: 'TS incorrecta', incorrectTsNote: '−0.3 · orden o elemento difiere de lo declarado en TS',
    noElements: 'No hay elementos en la hoja de tarifa', noElementsNote: 'Puedes enviar directamente',
    addElement: '+ Añadir elemento no listado',
    submit: 'Enviar', difficultyTotal: 'Dificultad', djPenalty: 'Pen. DJ',
    scoreHint: 'Introduce dificultad y penalización',
  },
}

// ─── element config ───────────────────────────────────────────────────────────

export type ElementConfig = {
  showTf: boolean
  tfMax: number
  autoNotDoneAt: number
  showNoSupport: boolean
}

export function getElementConfig(element: TsElement): ElementConfig {
  const type = element.elementType ?? 'balance'
  if (type === 'dynamic') return { showTf: false, tfMax: 0, autoNotDoneAt: Infinity, showNoSupport: true }
  if (type === 'individual' || type === 'motion') {
    if (type === 'individual' && element.isStatic) return { showTf: true, tfMax: 2, autoNotDoneAt: 2, showNoSupport: false }
    return { showTf: false, tfMax: 0, autoNotDoneAt: Infinity, showNoSupport: false }
  }
  return { showTf: true, tfMax: 3, autoNotDoneAt: 3, showNoSupport: false }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

export function calcElementPenalty(flag: ElementFlag): number {
  let p = 0
  p += flag.tfCount * 0.3
  if (flag.srNotDone) p += 1.0
  if (flag.forbiddenElement) p += 1.0
  if (flag.landingWithoutSupport) p += 0.5
  return p
}

export function calcDJTotals(
  elements: TsElement[],
  extraElements: TsElement[],
  flags: ElementFlags,
  incorrectTs: boolean
): { difficulty: number; penalty: number } {
  const all = [...elements, ...extraElements]
  let difficulty = 0
  let penalty = incorrectTs ? 0.3 : 0
  for (const el of all) {
    const mainFlag = flags[`${el.id}:1`]
    if (mainFlag?.isDone === true) difficulty += el.difficultyValue
    for (let r = 1; r <= MAX_RETRIES + 1; r++) {
      const f = flags[`${el.id}:${r}`]
      if (f) penalty += calcElementPenalty(f)
    }
  }
  return {
    difficulty: parseFloat(difficulty.toFixed(2)),
    penalty: parseFloat(penalty.toFixed(1)),
  }
}

export function maxAttemptInFlags(elementId: string, flags: ElementFlags): number {
  let max = 1
  for (let r = 2; r <= MAX_RETRIES + 1; r++) {
    if (`${elementId}:${r}` in flags) max = r
  }
  return max
}

// ─── tiny primitives ──────────────────────────────────────────────────────────

export function Toggle({ active, onToggle, label, color = 'red' }: {
  active: boolean; onToggle: () => void; label: string; color?: 'red' | 'amber' | 'blue'
}) {
  const colorMap = {
    red:   { on: 'bg-red-500 text-white border-red-500',   off: 'bg-white text-slate-500 border-slate-200 hover:border-slate-300' },
    amber: { on: 'bg-amber-400 text-white border-amber-400', off: 'bg-white text-slate-500 border-slate-200 hover:border-slate-300' },
    blue:  { on: 'bg-blue-500 text-white border-blue-500',  off: 'bg-white text-slate-500 border-slate-200 hover:border-slate-300' },
  }
  return (
    <button onClick={onToggle} className={['px-2.5 py-1 rounded-lg text-xs font-medium border transition-all', active ? colorMap[color].on : colorMap[color].off].join(' ')}>
      {label}
    </button>
  )
}

export function TfCounter({ value, onChange, max }: { value: number; onChange: (v: number) => void; max: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max + 1 }, (_, n) => n).map((n) => (
        <button key={n} onClick={() => onChange(n)}
          className={['w-8 h-7 rounded-lg text-xs font-bold border transition-all',
            value === n ? (n === 0 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-red-500 text-white border-red-500') : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300',
          ].join(' ')}>
          {n}
        </button>
      ))}
    </div>
  )
}

// ─── incorrect TS toggle ──────────────────────────────────────────────────────

export function IncorrectTsToggle({ active, onToggle, lang }: {
  active: boolean; onToggle: () => void; lang: Lang
}) {
  const t = T[lang]
  return (
    <button onClick={onToggle}
      className={['flex items-start gap-3 w-full px-3 py-2.5 rounded-xl border text-left transition-all', active ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'].join(' ')}>
      <div className={['w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center', active ? 'bg-red-500 border-red-500' : 'border-slate-300'].join(' ')}>
        {active && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
      </div>
      <div>
        <p className={['text-sm font-medium', active ? 'text-red-700' : 'text-slate-600'].join(' ')}>{t.incorrectTs} <span className="font-normal text-xs ml-1">−0.3</span></p>
        <p className="text-xs text-slate-400 mt-0.5">{t.incorrectTsNote}</p>
      </div>
    </button>
  )
}

// ─── DJ flag row ──────────────────────────────────────────────────────────────

export function DJFlagRow({ flag, elementId, attemptNumber, flags, lang, config, onChange, onOpenRetry }: {
  flag: ElementFlag
  elementId: string
  attemptNumber: number
  flags: ElementFlags
  lang: Lang
  config: ElementConfig
  onChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
}) {
  const t = T[lang]
  const [showNote, setShowNote] = useState(false)
  const maxAttempt = maxAttemptInFlags(elementId, flags)
  const canAddRetry = attemptNumber === maxAttempt && maxAttempt <= MAX_RETRIES

  function patch(p: Partial<ElementFlag>) { onChange(elementId, attemptNumber, p) }

  return (
    <div className={attemptNumber > 1 ? 'pl-3 border-l-2 border-slate-200 mt-2' : ''}>
      {attemptNumber > 1 && <p className="text-xs text-slate-400 mb-1.5">{t.retry} {attemptNumber - 1}</p>}

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <button onClick={() => patch({ isDone: flag.isDone === true ? null : true })}
          className={['px-2.5 py-1 rounded-lg text-xs font-medium border transition-all', flag.isDone === true ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'].join(' ')}>
          ✓ {t.done}
        </button>
        <button onClick={() => patch({ isDone: flag.isDone === false ? null : false })}
          className={['px-2.5 py-1 rounded-lg text-xs font-medium border transition-all', flag.isDone === false ? 'bg-amber-400 text-white border-amber-400' : 'bg-white text-slate-400 border-slate-200 hover:border-amber-300 hover:text-amber-600'].join(' ')}>
          ✗ {t.notDone}
        </button>
        {config.showTf && (
          <>
            <span className="text-xs text-slate-400">{t.tf}:</span>
            <TfCounter value={flag.tfCount} max={config.tfMax} onChange={(v) => patch({ tfCount: v })} />
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <Toggle active={flag.srNotDone} onToggle={() => patch({ srNotDone: !flag.srNotDone })} label={t.srNotDone} color="red" />
        {config.showNoSupport && <Toggle active={flag.landingWithoutSupport} onToggle={() => patch({ landingWithoutSupport: !flag.landingWithoutSupport })} label={t.noSupport} color="red" />}
        <Toggle active={flag.forbiddenElement} onToggle={() => patch({ forbiddenElement: !flag.forbiddenElement })} label={t.forbidden} color="red" />
        <button onClick={() => setShowNote((v) => !v)} className="px-2.5 py-1 rounded-lg text-xs border border-dashed border-slate-200 text-slate-400 hover:border-slate-300">
          {showNote ? '✕' : '+ note'}
        </button>
      </div>

      {showNote && (
        <input type="text" value={flag.note} onChange={(e) => patch({ note: e.target.value })} placeholder={t.note}
          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-400 placeholder:text-slate-300 mb-1" />
      )}

      {canAddRetry && (
        <button onClick={() => onOpenRetry(elementId, maxAttempt + 1)} className="text-xs text-blue-500 hover:text-blue-700 underline underline-offset-2">
          + {t.addRetry}
        </button>
      )}
    </div>
  )
}

// ─── DJ element row (card wrapper) ───────────────────────────────────────────

export function DJElementRow({ element, flags, lang, onChange, onOpenRetry, isExtra, onLabelChange, onTypeChange }: {
  element: TsElement
  flags: ElementFlags
  lang: Lang
  onChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  isExtra?: boolean
  onLabelChange?: (id: string, label: string) => void
  onTypeChange?: (id: string, type: ElementType, isStatic?: boolean) => void
}) {
  const t = T[lang]
  const config = getElementConfig(element)
  const maxAttempt = maxAttemptInFlags(element.id, flags)
  const mainFlag = flags[`${element.id}:1`] ?? DEFAULT_FLAG
  const isDone = mainFlag.isDone

  return (
    <div className={['border rounded-xl p-3 bg-white transition-colors', isDone === false ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'].join(' ')}>
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xs text-slate-400 font-mono w-5 shrink-0 mt-0.5">{isExtra ? '✱' : element.position}</span>
        {isExtra && onLabelChange ? (
          <input type="text" value={element.label} onChange={(e) => onLabelChange(element.id, e.target.value)} placeholder={t.elementLabel}
            className="text-sm font-medium text-slate-700 flex-1 leading-snug border-b border-dashed border-slate-300 focus:outline-none focus:border-slate-500 bg-transparent placeholder:text-slate-300" />
        ) : (
          <span className={['text-sm font-medium flex-1 leading-snug', isDone === false ? 'line-through text-slate-400' : 'text-slate-700'].join(' ')}>
            {element.label}
          </span>
        )}
        {!isExtra && (
          <span className={['text-xs px-1.5 py-0.5 rounded font-mono shrink-0', isDone === false ? 'bg-amber-100 text-amber-400' : 'bg-slate-100 text-slate-500'].join(' ')}>
            {t.difficulty} {element.difficultyValue.toFixed(2)}
          </span>
        )}
      </div>

      {isExtra && onTypeChange && (
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {(['balance', 'mount', 'dynamic', 'individual', 'motion'] as ElementType[]).map((type) => (
            <button key={type} onClick={() => onTypeChange(element.id, type)}
              className={['px-2.5 py-1 rounded-lg text-xs font-medium border transition-all capitalize', element.elementType === type ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'].join(' ')}>
              {type}
            </button>
          ))}
          {element.elementType === 'individual' && (
            <button onClick={() => onTypeChange(element.id, 'individual', !element.isStatic)}
              className={['px-2.5 py-1 rounded-lg text-xs font-medium border transition-all', element.isStatic ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'].join(' ')}>
              {t.isStatic}
            </button>
          )}
        </div>
      )}

      {Array.from({ length: maxAttempt }, (_, i) => i + 1).map((attempt) => {
        const flag = flags[`${element.id}:${attempt}`] ?? DEFAULT_FLAG
        return (
          <DJFlagRow key={attempt} flag={flag} elementId={element.id} attemptNumber={attempt}
            flags={flags} lang={lang} config={config} onChange={onChange} onOpenRetry={onOpenRetry} />
        )
      })}
    </div>
  )
}

// ─── dual keypad (phone DJ) ───────────────────────────────────────────────────

export function DualKeypad({ lang, onSubmit }: {
  lang: Lang
  onSubmit: (difficulty: number, penalty: number) => void
}) {
  const t = T[lang]
  const [focused, setFocused] = useState<'d' | 'p'>('d')
  const [dInput, setDInput] = useState('')
  const [pInput, setPInput] = useState('')

  const dScore = dInput === '' ? null : parseFloat(dInput)
  const pScore = pInput === '' ? null : parseFloat(pInput)
  const dValid = dScore !== null && !isNaN(dScore) && dScore >= 0
  const pValid = pScore !== null && !isNaN(pScore) && pScore >= 0
  const canSubmit = dValid && pValid

  function handleKey(key: string) {
    const maxDecimals = focused === 'd' ? 2 : 1
    const setInput = focused === 'd' ? setDInput : setPInput
    const input = focused === 'd' ? dInput : pInput
    if (key === '⌫') { setInput((p) => p.slice(0, -1)); return }
    if (key === '.') {
      if (input === '' || input.includes('.')) return
      setInput((p) => p + '.'); return
    }
    const next = input + key
    if (input === '0' && key !== '.') return
    const dotIdx = next.indexOf('.')
    if (dotIdx !== -1 && next.length - dotIdx > maxDecimals + 1) return
    setInput(next)
  }

  const keys = [['7','8','9'],['4','5','6'],['1','2','3'],['.','0','⌫']]

  return (
    <div className="px-4 pb-4">
      <p className="text-xs text-slate-400 text-center mb-3">{t.scoreHint}</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {(['d', 'p'] as const).map((field) => {
          const val = field === 'd' ? dInput : pInput
          const label = field === 'd' ? t.difficultyTotal : t.djPenalty
          const isFocused = focused === field
          return (
            <button key={field} onClick={() => setFocused(field)}
              className={['rounded-2xl py-4 text-center transition-all border-2', isFocused ? 'border-slate-800 bg-white shadow-sm' : 'border-transparent bg-slate-100'].join(' ')}>
              <p className="text-xs text-slate-400 mb-1">{label}</p>
              <p className={['text-3xl font-bold tabular-nums', val ? 'text-slate-800' : 'text-slate-300'].join(' ')}>{val || '—'}</p>
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {keys.flat().map((key) => (
          <button key={key} onClick={() => handleKey(key)}
            className={['py-5 rounded-2xl text-xl font-semibold transition-all active:scale-95',
              key === '⌫' ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-white text-slate-800 shadow-sm hover:bg-slate-50 border border-slate-100'].join(' ')}>
            {key}
          </button>
        ))}
      </div>
      <button disabled={!canSubmit} onClick={() => canSubmit && onSubmit(dScore!, pScore!)}
        className={['w-full py-4 rounded-2xl font-bold text-lg transition-all', canSubmit ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed'].join(' ')}>
        {canSubmit ? `${t.submit} · D ${dScore!.toFixed(2)}  −${pScore!.toFixed(1)}` : t.submit}
      </button>
    </div>
  )
}

// ─── phone DJ elements list ───────────────────────────────────────────────────

export function PhoneDJElementsList({ lang, elements, extraElements, flags, incorrectTs,
  onFlagChange, onOpenRetry, onAddElement, onLabelChange, onTypeChange, onToggleIncorrectTs, onSubmit }: {
  lang: Lang
  elements: TsElement[]
  extraElements: TsElement[]
  flags: ElementFlags
  incorrectTs: boolean
  onFlagChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  onAddElement: () => void
  onLabelChange: (id: string, label: string) => void
  onTypeChange: (id: string, type: ElementType, isStatic?: boolean) => void
  onToggleIncorrectTs: () => void
  onSubmit: (difficulty: number, penalty: number) => void
}) {
  const t = T[lang]
  const allElements = [...elements, ...extraElements]
  const { difficulty, penalty } = calcDJTotals(elements, extraElements, flags, incorrectTs)

  return (
    <div className="px-4 space-y-2 pb-4">
      <IncorrectTsToggle active={incorrectTs} onToggle={onToggleIncorrectTs} lang={lang} />
      {allElements.length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          <p className="font-medium text-sm">{t.noElements}</p>
          <p className="text-xs mt-1">{t.noElementsNote}</p>
        </div>
      ) : (
        allElements.map((el) => (
          <DJElementRow key={el.id} element={el} flags={flags} lang={lang} onChange={onFlagChange}
            onOpenRetry={onOpenRetry} isExtra={el.id.startsWith('extra-')}
            onLabelChange={onLabelChange} onTypeChange={onTypeChange} />
        ))
      )}
      <button onClick={onAddElement} className="w-full py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 hover:border-slate-300 transition-all">
        {t.addElement}
      </button>
      <button onClick={() => onSubmit(difficulty, penalty)} className="w-full py-4 rounded-2xl font-bold text-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all">
        {t.submit} · D {difficulty.toFixed(2)}  −{penalty.toFixed(1)}
      </button>
    </div>
  )
}
