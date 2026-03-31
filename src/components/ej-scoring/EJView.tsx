'use client'

import { useState, useEffect, useRef } from 'react'
import type { Performance, Lang, Deductions, TsElement } from './types'
import type { PanelJudge, JudgeScore, RoutineResult } from '../cjp/types'
import ScoreBoard from '../shared/ScoreBoard'

// ─── constants ────────────────────────────────────────────────────────────────

const DEDUCTION_VALUES = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
const MAX_RETRIES = 3 // max retry attempts per element (on top of main = attempt 1)

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    waiting: 'Waiting for performance…',
    waitingSub: 'The panel chief has not opened a routine yet.',
    pdfPlaceholder: 'Tariff Sheet PDF',
    pdfNote: 'PDF will appear here once uploaded',
    noElements: 'No elements in tariff sheet',
    noElementsNote: 'You can submit a score of 10.0',
    difficulty: 'D',
    addRetry: 'Add retry',
    retry: 'Retry',
    addElement: '+ Add unlisted element',
    elementLabel: 'Element description…',
    submit: 'Submit score',
    submitted: 'Score submitted',
    waitingOtherScores: 'Waiting for your other scores…',
    scoreHint: '0.0 – 10.0 · 1 decimal place',
    balance: 'Balance',
    dynamic: 'Dynamic',
    combined: 'Combined',
  },
  es: {
    waiting: 'Esperando actuación…',
    waitingSub: 'El juez coordinador no ha abierto ninguna rutina todavía.',
    pdfPlaceholder: 'PDF Hoja de Tarifa',
    pdfNote: 'El PDF aparecerá aquí una vez subido',
    noElements: 'No hay elementos en la hoja de tarifa',
    noElementsNote: 'Puedes enviar una puntuación de 10.0',
    difficulty: 'D',
    addRetry: 'Añadir reintento',
    retry: 'Reintento',
    addElement: '+ Añadir elemento no listado',
    elementLabel: 'Descripción del elemento…',
    submit: 'Enviar puntuación',
    submitted: 'Puntuación enviada',
    waitingOtherScores: 'Esperando tus otras puntuaciones…',
    scoreHint: '0.0 – 10.0 · 1 decimal',
    balance: 'Equilibrio',
    dynamic: 'Dinámico',
    combined: 'Combinado',
  },
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function calcScore(deductions: Deductions): number {
  const total = Object.values(deductions)
    .filter((d) => d.locked)
    .reduce((sum, d) => sum + d.value, 0)
  return parseFloat(Math.max(0, 10 - total).toFixed(1))
}

function calcTotalDeductions(deductions: Deductions): number {
  return parseFloat(
    Object.values(deductions)
      .filter((d) => d.locked)
      .reduce((sum, d) => sum + d.value, 0)
      .toFixed(1)
  )
}

function isElementFullyScored(elementId: string, deductions: Deductions): boolean {
  // main attempt must be locked
  if (!deductions[`${elementId}:1`]?.locked) return false
  // every open retry slot must also be locked
  for (let r = 2; r <= MAX_RETRIES + 1; r++) {
    const slot = deductions[`${elementId}:${r}`]
    if (slot !== undefined && !slot.locked) return false
  }
  return true
}

function allElementsScored(elements: TsElement[], extraElements: TsElement[], deductions: Deductions): boolean {
  const all = [...elements, ...extraElements]
  if (all.length === 0) return true
  return all.every((el) => isElementFullyScored(el.id, deductions))
}

// returns the highest open retry number for an element (1 = only main exists)
function maxAttemptNumber(elementId: string, deductions: Deductions): number {
  let max = 1
  for (let r = 2; r <= MAX_RETRIES + 1; r++) {
    if (`${elementId}:${r}` in deductions) max = r
  }
  return max
}

// ─── sub-components ───────────────────────────────────────────────────────────

function PerformanceHeader({ perf, lang, score, totalDeductions }: {
  perf: Performance
  lang: Lang
  score: number
  totalDeductions: number
}) {
  const t = T[lang]
  const routineLabel = { Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined }[perf.routineType] ?? perf.routineType
  return (
    <div className="bg-slate-800 text-white px-4 py-3 rounded-xl mb-4">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
          #{perf.position} · {perf.ageGroup} · {perf.category} · {routineLabel}
        </span>
        <div className="flex items-center gap-3">
          {totalDeductions > 0 && (
            <span className="text-xs text-red-400 tabular-nums">−{totalDeductions.toFixed(1)}</span>
          )}
          <span className="text-xl font-bold tabular-nums">{score.toFixed(1)}</span>
        </div>
      </div>
      <p className="text-lg font-semibold leading-tight">{perf.gymnasts}</p>
    </div>
  )
}

function DeductionRow({ elementId, attemptNumber, deductions, onLock }: {
  elementId: string
  attemptNumber: number
  deductions: Deductions
  onLock: (elementId: string, attemptNumber: number, value: number) => void
}) {
  const key = `${elementId}:${attemptNumber}`
  const state = deductions[key]
  const isLocked = state?.locked ?? false

  return (
    <div className="flex gap-1 flex-wrap">
      {DEDUCTION_VALUES.map((val) => {
        const isSelected = isLocked && state?.value === val
        const isZero = val === 0
        return (
          <button
            key={val}
            disabled={isLocked}
            onClick={() => !isLocked && onLock(elementId, attemptNumber, val)}
            className={[
              'px-2 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 min-w-[36px] text-center active:scale-95',
              isSelected && isZero ? 'bg-emerald-500 text-white' : '',
              isSelected && !isZero ? 'bg-red-500 text-white' : '',
              !isLocked && isZero ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer' : '',
              !isLocked && !isZero ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer' : '',
              isLocked && !isSelected ? 'bg-slate-100 text-slate-300 border border-slate-100 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {val === 0 ? '0' : `-${val.toFixed(1).replace('0.', '.')}`}
          </button>
        )
      })}
    </div>
  )
}

function ElementRow({ element, deductions, lang, onLock, onOpenRetry, isExtra, onLabelChange }: {
  element: TsElement
  deductions: Deductions
  lang: Lang
  onLock: (elementId: string, attemptNumber: number, value: number) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  isExtra?: boolean
  onLabelChange?: (id: string, label: string) => void
}) {
  const t = T[lang]
  const mainLocked = deductions[`${element.id}:1`]?.locked ?? false
  const maxAttempt = maxAttemptNumber(element.id, deductions)
  const lastAttemptLocked = deductions[`${element.id}:${maxAttempt}`]?.locked ?? false
  const canAddRetry = mainLocked && lastAttemptLocked && maxAttempt <= MAX_RETRIES // attempts 1..MAX_RETRIES+1

  return (
    <div className="border border-slate-100 rounded-xl p-3 bg-white">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xs text-slate-400 font-mono w-5 shrink-0 mt-0.5">
          {isExtra ? '✱' : element.position}
        </span>
        {isExtra && onLabelChange ? (
          <input
            type="text"
            value={element.label}
            onChange={(e) => onLabelChange(element.id, e.target.value)}
            placeholder={t.elementLabel}
            className="text-sm font-medium text-slate-700 flex-1 leading-snug border-b border-dashed border-slate-300 focus:outline-none focus:border-slate-500 bg-transparent placeholder:text-slate-300"
          />
        ) : (
          <span className="text-sm font-medium text-slate-700 flex-1 leading-snug">{element.label}</span>
        )}
        {!isExtra && (
          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0">
            {t.difficulty} {element.difficultyValue.toFixed(2)}
          </span>
        )}
      </div>

      {/* main deduction */}
      <DeductionRow elementId={element.id} attemptNumber={1} deductions={deductions} onLock={onLock} />

      {/* retry rows */}
      {Array.from({ length: maxAttempt - 1 }, (_, i) => i + 2).map((attempt) => (
        <div key={attempt} className="mt-2 pl-3 border-l-2 border-slate-200">
          <p className="text-xs text-slate-400 mb-1.5">{t.retry} {attempt - 1}</p>
          <DeductionRow elementId={element.id} attemptNumber={attempt} deductions={deductions} onLock={onLock} />
        </div>
      ))}

      {/* add retry */}
      {canAddRetry && (
        <button
          onClick={() => onOpenRetry(element.id, maxAttempt + 1)}
          className="mt-2 text-xs text-blue-500 hover:text-blue-700 underline underline-offset-2"
        >
          + {t.addRetry}
        </button>
      )}
    </div>
  )
}

// ─── numeric keypad (phone) ───────────────────────────────────────────────────

function NumericKeypad({ lang, perf, onSubmit }: {
  lang: Lang
  perf: Performance
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
    <div className="px-4 pb-8">
      <PerformanceHeader
        perf={perf} lang={lang}
        score={isValid ? score! : 10}
        totalDeductions={isValid ? parseFloat((10 - score!).toFixed(1)) : 0}
      />
      <p className="text-xs text-slate-400 text-center mb-2">{t.scoreHint}</p>
      <div className="bg-slate-100 rounded-2xl py-5 text-center mb-4">
        <span className={['text-5xl font-bold tabular-nums tracking-tight', input ? 'text-slate-800' : 'text-slate-300'].join(' ')}>
          {input || '—'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {keys.flat().map((key) => (
          <button
            key={key}
            onClick={() => handleKey(key)}
            className={[
              'py-5 rounded-2xl text-xl font-semibold transition-all active:scale-95',
              key === '⌫'
                ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                : 'bg-white text-slate-800 shadow-sm hover:bg-slate-50 border border-slate-100',
            ].join(' ')}
          >
            {key}
          </button>
        ))}
      </div>
      <button
        disabled={!isValid}
        onClick={() => isValid && onSubmit(score!)}
        className={[
          'w-full py-4 rounded-2xl font-bold text-lg transition-all',
          isValid ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed',
        ].join(' ')}
      >
        {isValid ? `${t.submit} · ${score!.toFixed(1)}` : t.submit}
      </button>
    </div>
  )
}

// ─── tablet layout ────────────────────────────────────────────────────────────

function TabletLayout({ perf, lang, elements, extraElements, deductions, onLock, onOpenRetry, onAddElement, onLabelChange, onSubmit, tsUrl }: {
  perf: Performance
  lang: Lang
  elements: TsElement[]
  extraElements: TsElement[]
  deductions: Deductions
  onLock: (elementId: string, attemptNumber: number, value: number) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  onAddElement: () => void
  onLabelChange: (id: string, label: string) => void
  onSubmit: () => void
  tsUrl?: string | null
}) {
  const t = T[lang]
  const score = calcScore(deductions)
  const totalDed = calcTotalDeductions(deductions)
  const canSubmit = allElementsScored(elements, extraElements, deductions)
  const allElements = [...elements, ...extraElements]

  return (
    <div className="flex gap-4 h-full">
      {/* TS PDF */}
      {tsUrl ? (
        <iframe src={tsUrl} className="flex-1 rounded-2xl border border-slate-200 bg-white min-h-0" title={t.pdfPlaceholder} />
      ) : (
        <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white text-slate-400 min-h-0">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M9 17h4" />
          </svg>
          <p className="font-medium">{t.pdfPlaceholder}</p>
          <p className="text-xs">{t.pdfNote}</p>
        </div>
      )}

      {/* element list */}
      <div className="w-96 flex flex-col gap-3 min-h-0">
        <PerformanceHeader perf={perf} lang={lang} score={score} totalDeductions={totalDed} />

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {allElements.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="font-medium text-sm">{t.noElements}</p>
              <p className="text-xs mt-1">{t.noElementsNote}</p>
            </div>
          ) : (
            allElements.map((el) => (
              <ElementRow
                key={el.id}
                element={el}
                deductions={deductions}
                lang={lang}
                onLock={onLock}
                onOpenRetry={onOpenRetry}
                isExtra={el.id.startsWith('extra-')}
                onLabelChange={onLabelChange}
              />
            ))
          )}

          <button
            onClick={onAddElement}
            className="w-full py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 hover:border-slate-300 transition-all"
          >
            {t.addElement}
          </button>
        </div>

        <button
          disabled={!canSubmit}
          onClick={onSubmit}
          className={[
            'w-full py-4 rounded-2xl font-bold text-lg transition-all shrink-0',
            canSubmit ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed',
          ].join(' ')}
        >
          {canSubmit ? `${t.submit} · ${score.toFixed(1)}` : t.submit}
        </button>
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

type EJViewProps = {
  currentPerf: Performance | null
  lang: Lang
  elements: TsElement[]
  onSubmit?: (score: number) => void
  // scoreboard props (multi-role)
  waitingForOtherScores?: boolean
  judgeScores?: JudgeScore[]
  panelJudges?: PanelJudge[]
  result?: RoutineResult | null
}

export default function EJView({ currentPerf, lang, elements, onSubmit, waitingForOtherScores, judgeScores, panelJudges, result }: EJViewProps) {
  const t = T[lang]
  const [deductions, setDeductions] = useState<Deductions>({})
  const [extraElements, setExtraElements] = useState<TsElement[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submittedScore, setSubmittedScore] = useState<number | null>(null)
  const prevPerfId = useRef<string | null>(null)

  useEffect(() => {
    if (currentPerf?.id !== prevPerfId.current) {
      setDeductions({})
      setExtraElements([])
      setSubmitted(false)
      setSubmittedScore(null)
      prevPerfId.current = currentPerf?.id ?? null
    }
  }, [currentPerf?.id])

  function handleLock(elementId: string, attemptNumber: number, value: number) {
    const key = `${elementId}:${attemptNumber}`
    setDeductions((prev) => ({ ...prev, [key]: { value, locked: true } }))
  }

  function handleOpenRetry(elementId: string, nextAttemptNumber: number) {
    const key = `${elementId}:${nextAttemptNumber}`
    setDeductions((prev) => ({ ...prev, [key]: { value: 0, locked: false } }))
  }

  function handleAddElement() {
    const id = `extra-${Date.now()}`
    setExtraElements((prev) => [...prev, { id, position: 0, label: '', difficultyValue: 0 }])
  }

  function handleLabelChange(id: string, label: string) {
    setExtraElements((prev) => prev.map((el) => el.id === id ? { ...el, label } : el))
  }

  function handleSubmitTablet() {
    const score = calcScore(deductions)
    setSubmittedScore(score)
    setSubmitted(true)
    onSubmit?.(score)
  }

  function handleSubmitPhone(score: number) {
    setSubmittedScore(score)
    setSubmitted(true)
    onSubmit?.(score)
  }

  // ── waiting ──
  if (!currentPerf) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        </div>
        <p className="text-xl font-semibold text-slate-700">{t.waiting}</p>
        <p className="text-sm text-slate-400">{t.waitingSub}</p>
      </div>
    )
  }

  // ── submitted ──
  if (submitted && submittedScore !== null) {
    return (
      <div className="overflow-y-auto px-4 py-8 space-y-6 max-w-lg mx-auto">
        {/* confirmation */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">{t.submitted}</p>
          <p className="text-6xl font-bold text-slate-800">{submittedScore.toFixed(1)}</p>
        </div>

        {/* waiting for other roles */}
        {waitingForOtherScores && (
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.65-3.65L20 7M4 17l1.35 1.65A9 9 0 0020 15" />
            </svg>
            <p className="text-sm">{t.waitingOtherScores}</p>
          </div>
        )}

        {/* panel scoreboard */}
        {judgeScores && panelJudges && (
          <ScoreBoard judgeScores={judgeScores} panelJudges={panelJudges} result={result} lang={lang} />
        )}
      </div>
    )
  }

  return (
    <>
      <div className="md:hidden">
        <NumericKeypad lang={lang} perf={currentPerf} onSubmit={handleSubmitPhone} />
      </div>
      <div className="hidden md:block h-full px-4 pb-4">
        <TabletLayout
          perf={currentPerf}
          lang={lang}
          elements={elements}
          extraElements={extraElements}
          deductions={deductions}
          onLock={handleLock}
          onOpenRetry={handleOpenRetry}
          onAddElement={handleAddElement}
          onLabelChange={handleLabelChange}
          onSubmit={handleSubmitTablet}
          tsUrl={currentPerf?.tsUrl}
        />
      </div>
    </>
  )
}
