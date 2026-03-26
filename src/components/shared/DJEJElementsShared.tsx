'use client'

import { useState } from 'react'
import type { Lang } from '../aj-scoring/types'
import type { TsElement, ElementType, Deductions } from '../ej-scoring/types'
import type { ElementFlag, ElementFlags } from '../dj-scoring/types'
import { DEFAULT_FLAG } from '../dj-scoring/types'
import {
  MAX_RETRIES, ElementConfig, getElementConfig, maxAttemptInFlags,
  Toggle, TfCounter, calcDJTotals, IncorrectTsToggle, DJElementRow,
} from './DJElementsShared'

export const DEDUCTION_VALUES = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    done: 'Done', notDone: 'Not done', tf: 'TF',
    srNotDone: 'SR not done', forbidden: 'Forbidden', noSupport: 'No support',
    note: 'Note…', addRetry: 'Add retry', retry: 'Retry',
    djLabel: 'DJ', ejLabel: 'EJ', deduction: 'Deduction',
    difficulty: 'D', elementLabel: 'Element description…', isStatic: 'Static',
    noElements: 'No elements in tariff sheet', noElementsNote: 'You can submit immediately',
    addElement: '+ Add unlisted element',
    submit: 'Submit', difficultyTotal: 'Difficulty', djPenalty: 'DJ Penalty', ejScore: 'EJ Score',
    ejHint: 'EJ score (0.0 – 10.0)',
    incorrectTs: 'Incorrect TS', incorrectTsNote: '−0.3 · order or element differs from declared',
  },
  es: {
    done: 'Realizado', notDone: 'No realizado', tf: 'FT',
    srNotDone: 'SR no realizado', forbidden: 'Prohibido', noSupport: 'Sin apoyo',
    note: 'Nota…', addRetry: 'Añadir reintento', retry: 'Reintento',
    djLabel: 'DJ', ejLabel: 'EJ', deduction: 'Deducción',
    difficulty: 'D', elementLabel: 'Descripción del elemento…', isStatic: 'Estático',
    noElements: 'No hay elementos en la hoja de tarifa', noElementsNote: 'Puedes enviar directamente',
    addElement: '+ Añadir elemento no listado',
    submit: 'Enviar', difficultyTotal: 'Dificultad', djPenalty: 'Pen. DJ', ejScore: 'Nota EJ',
    ejHint: 'Nota EJ (0.0 – 10.0)',
    incorrectTs: 'TS incorrecta', incorrectTsNote: '−0.3 · orden o elemento difiere de lo declarado en TS',
  },
}

// ─── helpers ──────────────────────────────────────────────────────────────────

export function calcEJScore(deductions: Deductions): number {
  const total = Object.values(deductions)
    .filter((d) => d.locked)
    .reduce((sum, d) => sum + d.value, 0)
  return parseFloat(Math.max(0, 10 - total).toFixed(1))
}

export function maxAttemptInDeductions(elementId: string, deductions: Deductions): number {
  let max = 1
  for (let r = 2; r <= MAX_RETRIES + 1; r++) {
    if (`${elementId}:${r}` in deductions) max = r
  }
  return max
}

// ─── combined attempt row (DJ flags + EJ deduction) ──────────────────────────

export function CombinedAttemptRow({ flag, elementId, attemptNumber, flags, deductions, lang, config, onFlagChange, onLock, onOpenRetry }: {
  flag: ElementFlag
  elementId: string
  attemptNumber: number
  flags: ElementFlags
  deductions: Deductions
  lang: Lang
  config: ElementConfig
  onFlagChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  onLock: (elementId: string, attemptNumber: number, value: number) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
}) {
  const t = T[lang]
  const [showNote, setShowNote] = useState(false)
  const maxAttempt = maxAttemptInFlags(elementId, flags)
  const canAddRetry = attemptNumber === maxAttempt && maxAttempt <= MAX_RETRIES
  const dedKey = `${elementId}:${attemptNumber}`
  const dedState = deductions[dedKey]
  const dedLocked = dedState?.locked ?? false

  function patch(p: Partial<ElementFlag>) { onFlagChange(elementId, attemptNumber, p) }

  return (
    <div className={attemptNumber > 1 ? 'pl-3 border-l-2 border-slate-200 mt-2' : ''}>
      {attemptNumber > 1 && <p className="text-xs text-slate-400 mb-1.5">{t.retry} {attemptNumber - 1}</p>}

      {/* DJ section */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t.djLabel}</p>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
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
        <div className="flex flex-wrap gap-1.5">
          <Toggle active={flag.srNotDone} onToggle={() => patch({ srNotDone: !flag.srNotDone })} label={t.srNotDone} color="red" />
          {config.showNoSupport && <Toggle active={flag.landingWithoutSupport} onToggle={() => patch({ landingWithoutSupport: !flag.landingWithoutSupport })} label={t.noSupport} color="red" />}
          <Toggle active={flag.forbiddenElement} onToggle={() => patch({ forbiddenElement: !flag.forbiddenElement })} label={t.forbidden} color="red" />
          <button onClick={() => setShowNote((v) => !v)} className="px-2.5 py-1 rounded-lg text-xs border border-dashed border-slate-200 text-slate-400 hover:border-slate-300">
            {showNote ? '✕' : '+ note'}
          </button>
        </div>
        {showNote && (
          <input type="text" value={flag.note} onChange={(e) => patch({ note: e.target.value })} placeholder={t.note}
            className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-400 placeholder:text-slate-300 mt-1.5" />
        )}
      </div>

      {/* EJ section */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-sky-500 uppercase tracking-wider mb-1.5">{t.ejLabel} · {t.deduction}</p>
        <div className="flex gap-1 flex-wrap">
          {DEDUCTION_VALUES.map((val) => {
            const isSelected = dedLocked && dedState?.value === val
            const isZero = val === 0
            return (
              <button key={val} disabled={dedLocked} onClick={() => !dedLocked && onLock(elementId, attemptNumber, val)}
                className={['px-2 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 min-w-[36px] text-center active:scale-95',
                  isSelected && isZero ? 'bg-emerald-500 text-white' : '',
                  isSelected && !isZero ? 'bg-red-500 text-white' : '',
                  !dedLocked && isZero ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer' : '',
                  !dedLocked && !isZero ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer' : '',
                  dedLocked && !isSelected ? 'bg-slate-100 text-slate-300 border border-slate-100 cursor-not-allowed' : '',
                ].join(' ')}>
                {val === 0 ? '0' : `-${val.toFixed(1).replace('0.', '.')}`}
              </button>
            )
          })}
        </div>
      </div>

      {canAddRetry && (
        <button onClick={() => onOpenRetry(elementId, maxAttempt + 1)} className="text-xs text-blue-500 hover:text-blue-700 underline underline-offset-2">
          + {t.addRetry}
        </button>
      )}
    </div>
  )
}

// ─── combined element card ────────────────────────────────────────────────────

export function CombinedElementRow({ element, flags, deductions, lang, onFlagChange, onLock, onOpenRetry, isExtra, onLabelChange, onTypeChange }: {
  element: TsElement
  flags: ElementFlags
  deductions: Deductions
  lang: Lang
  onFlagChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  onLock: (elementId: string, attemptNumber: number, value: number) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  isExtra?: boolean
  onLabelChange?: (id: string, label: string) => void
  onTypeChange?: (id: string, type: ElementType, isStatic?: boolean) => void
}) {
  const t = T[lang]
  const config = getElementConfig(element)
  const maxAttempt = Math.max(maxAttemptInFlags(element.id, flags), maxAttemptInDeductions(element.id, deductions))
  const mainFlag = flags[`${element.id}:1`] ?? DEFAULT_FLAG
  const isDone = mainFlag.isDone

  return (
    <div className={['border rounded-xl p-3 bg-white transition-colors', isDone === false ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'].join(' ')}>
      <div className="flex items-start gap-2 mb-3">
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
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
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
          <CombinedAttemptRow key={attempt} flag={flag} elementId={element.id} attemptNumber={attempt}
            flags={flags} deductions={deductions} lang={lang} config={config}
            onFlagChange={onFlagChange} onLock={onLock} onOpenRetry={onOpenRetry} />
        )
      })}
    </div>
  )
}

// ─── EJ keypad (phone) ────────────────────────────────────────────────────────

export function EJKeypad({ lang, onSubmit }: {
  lang: Lang
  onSubmit: (score: number) => void
}) {
  const t = T[lang]
  const [input, setInput] = useState('')
  const score = input === '' ? null : parseFloat(input)
  const isValid = score !== null && !isNaN(score) && score >= 0 && score <= 10

  function handleKey(key: string) {
    if (key === '⌫') { setInput((p) => p.slice(0, -1)); return }
    if (key === '.') {
      if (input === '' || input.includes('.')) return
      setInput((p) => p + '.'); return
    }
    const next = input + key
    if (input === '0' && key !== '.') return
    const dotIdx = next.indexOf('.')
    if (dotIdx !== -1 && next.length - dotIdx > 2) return
    const parsed = parseFloat(next)
    if (!isNaN(parsed) && parsed > 10) return
    setInput(next)
  }

  const keys = [['7','8','9'],['4','5','6'],['1','2','3'],['.','0','⌫']]

  return (
    <div className="px-4 pb-4">
      <p className="text-xs text-slate-400 text-center mb-2">{t.ejHint}</p>
      <div className="bg-slate-100 rounded-2xl py-5 text-center mb-4">
        <span className={['text-5xl font-bold tabular-nums tracking-tight', input ? 'text-slate-800' : 'text-slate-300'].join(' ')}>{input || '—'}</span>
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
      <button disabled={!isValid} onClick={() => isValid && onSubmit(score!)}
        className={['w-full py-4 rounded-2xl font-bold text-lg transition-all', isValid ? 'bg-sky-500 hover:bg-sky-600 active:scale-95 text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed'].join(' ')}>
        {isValid ? `${t.submit} · E ${score!.toFixed(1)}` : t.submit}
      </button>
    </div>
  )
}

// ─── EJ-only element row (tablet, for EJAJView) ──────────────────────────────

export function EJElementRow({ element, deductions, lang, onLock }: {
  element: TsElement
  deductions: Deductions
  lang: Lang
  onLock: (elementId: string, attemptNumber: number, value: number) => void
}) {
  const t = T[lang]
  const dedKey = `${element.id}:1`
  const dedState = deductions[dedKey]
  const dedLocked = dedState?.locked ?? false

  return (
    <div className={['border rounded-xl p-3 bg-white transition-colors', dedLocked ? 'border-slate-100' : 'border-slate-200'].join(' ')}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-slate-400 font-mono shrink-0">{element.position > 0 ? element.position : '✱'}</span>
        <span className="text-sm font-medium text-slate-700 flex-1 leading-snug">{element.label || '—'}</span>
        {dedLocked && (
          <span className={['text-sm font-bold tabular-nums shrink-0', dedState!.value === 0 ? 'text-emerald-500' : 'text-red-500'].join(' ')}>
            {dedState!.value === 0 ? '0' : `−${dedState!.value.toFixed(1)}`}
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-sky-500 uppercase tracking-wider mb-1.5">{t.ejLabel} · {t.deduction}</p>
      <div className="flex gap-1 flex-wrap">
        {DEDUCTION_VALUES.map((val) => {
          const isSelected = dedLocked && dedState?.value === val
          const isZero = val === 0
          return (
            <button key={val} disabled={dedLocked} onClick={() => !dedLocked && onLock(element.id, 1, val)}
              className={[
                'px-2 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 min-w-[36px] text-center active:scale-95',
                isSelected && isZero ? 'bg-emerald-500 text-white' : '',
                isSelected && !isZero ? 'bg-red-500 text-white' : '',
                !dedLocked && isZero ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer' : '',
                !dedLocked && !isZero ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer' : '',
                dedLocked && !isSelected ? 'bg-slate-100 text-slate-300 border border-slate-100 cursor-not-allowed' : '',
              ].join(' ')}>
              {val === 0 ? '0' : `-${val.toFixed(1).replace('0.', '.')}`}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── tablet DJ+EJ elements panel content ────────────────────────────────────
// Used in the right-panel tab of CJPDJEJView and CJPDJEJAJView

export function DJEJTabContent({ lang, elements, extraElements, flags, deductions, incorrectTs,
  onFlagChange, onLock, onOpenRetry, onAddElement, onLabelChange, onTypeChange, onToggleIncorrectTs,
  onSubmit, isSubmitted, djDifficulty, djPenalty, ejScore }: {
  lang: Lang
  elements: TsElement[]
  extraElements: TsElement[]
  flags: ElementFlags
  deductions: Deductions
  incorrectTs: boolean
  onFlagChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  onLock: (elementId: string, attemptNumber: number, value: number) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  onAddElement: () => void
  onLabelChange: (id: string, label: string) => void
  onTypeChange: (id: string, type: ElementType, isStatic?: boolean) => void
  onToggleIncorrectTs: () => void
  onSubmit: () => void
  isSubmitted: boolean
  djDifficulty: number
  djPenalty: number
  ejScore: number
}) {
  const t = T[lang]
  const allElements = [...elements, ...extraElements]

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 px-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide text-center">{t.submit}</p>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">{t.difficultyTotal}</p>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">{djDifficulty.toFixed(2)}</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">{t.djPenalty}</p>
            <p className="text-2xl font-bold text-red-500 tabular-nums">−{djPenalty.toFixed(1)}</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">{t.ejScore}</p>
            <p className="text-2xl font-bold text-sky-600 tabular-nums">{ejScore.toFixed(1)}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-2">
      <IncorrectTsToggle active={incorrectTs} onToggle={onToggleIncorrectTs} lang={lang} />
      {allElements.length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          <p className="text-sm font-medium">{t.noElements}</p>
          <p className="text-xs mt-1">{t.noElementsNote}</p>
        </div>
      ) : (
        allElements.map((el) => (
          <CombinedElementRow key={el.id} element={el} flags={flags} deductions={deductions} lang={lang}
            onFlagChange={onFlagChange} onLock={onLock} onOpenRetry={onOpenRetry}
            isExtra={el.id.startsWith('extra-')} onLabelChange={onLabelChange} onTypeChange={onTypeChange} />
        ))
      )}
      <button onClick={onAddElement} className="w-full py-2 rounded-xl text-sm text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 hover:border-slate-300 transition-all">
        {t.addElement}
      </button>
      <button onClick={onSubmit} className="w-full py-3 rounded-xl font-bold text-base bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all">
        {t.submit} · D {djDifficulty.toFixed(2)}  −{djPenalty.toFixed(1)}  E {ejScore.toFixed(1)}
      </button>
    </div>
  )
}

// ─── tablet DJ-only elements panel content ───────────────────────────────────
// Used in the right-panel tab of CJPDJView and CJPDJAJView

export function DJTabContent({ lang, elements, extraElements, flags, incorrectTs,
  onFlagChange, onOpenRetry, onAddElement, onLabelChange, onTypeChange, onToggleIncorrectTs,
  onSubmit, isSubmitted, djDifficulty, djPenalty }: {
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
  onSubmit: () => void
  isSubmitted: boolean
  djDifficulty: number
  djPenalty: number
}) {
  const t = T[lang]
  const allElements = [...elements, ...extraElements]

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 px-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide text-center">{t.submit}</p>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">{t.difficultyTotal}</p>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">{djDifficulty.toFixed(2)}</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">{t.djPenalty}</p>
            <p className="text-2xl font-bold text-red-500 tabular-nums">−{djPenalty.toFixed(1)}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-2">
      <IncorrectTsToggle active={incorrectTs} onToggle={onToggleIncorrectTs} lang={lang} />
      {allElements.length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          <p className="text-sm font-medium">{t.noElements}</p>
          <p className="text-xs mt-1">{t.noElementsNote}</p>
        </div>
      ) : (
        allElements.map((el) => (
          <DJElementRow key={el.id} element={el} flags={flags} lang={lang} onChange={onFlagChange}
            onOpenRetry={onOpenRetry} isExtra={el.id.startsWith('extra-')}
            onLabelChange={onLabelChange} onTypeChange={onTypeChange} />
        ))
      )}
      <button onClick={onAddElement} className="w-full py-2 rounded-xl text-sm text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 hover:border-slate-300 transition-all">
        {t.addElement}
      </button>
      <button onClick={onSubmit} className="w-full py-3 rounded-xl font-bold text-base bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all">
        {t.submit} · D {djDifficulty.toFixed(2)}  −{djPenalty.toFixed(1)}
      </button>
    </div>
  )
}
