'use client'

import { useState, useEffect, useRef } from 'react'
import type { Performance, Lang, TsElement, ElementType, ElementFlag, ElementFlags } from './types'
import { DEFAULT_FLAG } from './types'
import type { PanelJudge, JudgeScore, RoutineResult } from '../cjp/types'
import ScoreBoard from '../shared/ScoreBoard'

const MAX_RETRIES = 3

// ─── element config ───────────────────────────────────────────────────────────

type ElementConfig = {
  showTf: boolean
  tfMax: number        // 2 for individual static, 3 for balance
  autoNotDoneAt: number // TF count that triggers auto not-done
  showNoSupport: boolean
}

function getElementConfig(element: TsElement): ElementConfig {
  const type = element.elementType ?? 'balance' // safe default

  if (type === 'dynamic') {
    return { showTf: false, tfMax: 0, autoNotDoneAt: Infinity, showNoSupport: true }
  }
  if (type === 'individual' || type === 'motion') {
    if (type === 'individual' && element.isStatic) {
      return { showTf: true, tfMax: 2, autoNotDoneAt: 2, showNoSupport: false }
    }
    return { showTf: false, tfMax: 0, autoNotDoneAt: Infinity, showNoSupport: false }
  }
  // balance + mount
  return { showTf: true, tfMax: 3, autoNotDoneAt: 3, showNoSupport: false }
}

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    waiting: 'Waiting for performance…',
    waitingSub: 'The panel chief has not opened a routine yet.',
    pdfPlaceholder: 'Tariff Sheet PDF',
    pdfNote: 'PDF will appear here once uploaded',
    noElements: 'No elements in tariff sheet',
    noElementsNote: 'You can submit immediately',
    difficulty: 'D',
    done: 'Done',
    notDone: 'Not done',
    tf: 'TF',
    srNotDone: 'SR not done',
    forbidden: 'Forbidden',
    noSupport: 'No support',
    note: 'Note…',
    addRetry: 'Add retry',
    retry: 'Retry',
    addElement: '+ Add unlisted element',
    elementLabel: 'Element description…',
    isStatic: 'Static',
    incorrectTs: 'Incorrect TS',
    incorrectTsNote: '−0.3 · order or element differs from declared',
    difficultyTotal: 'Difficulty',
    penaltyTotal: 'Penalty',
    submit: 'Submit',
    submitted: 'Score submitted',
    waitingOtherScores: 'Waiting for your other scores…',
    scoreHint: 'Enter difficulty and penalty',
    balance: 'Balance',
    mount: 'Mount',
    dynamic: 'Dynamic',
    individual: 'Individual',
    motion: 'Motion',
    combined: 'Combined',
  },
  es: {
    waiting: 'Esperando actuación…',
    waitingSub: 'El juez coordinador no ha abierto ninguna rutina todavía.',
    pdfPlaceholder: 'PDF Hoja de Tarifa',
    pdfNote: 'El PDF aparecerá aquí una vez subido',
    noElements: 'No hay elementos en la hoja de tarifa',
    noElementsNote: 'Puedes enviar directamente',
    difficulty: 'D',
    done: 'Realizado',
    notDone: 'No realizado',
    tf: 'FT',
    srNotDone: 'SR no realizado',
    forbidden: 'Prohibido',
    noSupport: 'Sin apoyo',
    note: 'Nota…',
    addRetry: 'Añadir reintento',
    retry: 'Reintento',
    addElement: '+ Añadir elemento no listado',
    elementLabel: 'Descripción del elemento…',
    isStatic: 'Estático',
    incorrectTs: 'TS incorrecta',
    incorrectTsNote: '−0.3 · orden o elemento difiere de lo declarado en TS',
    difficultyTotal: 'Dificultad',
    penaltyTotal: 'Penalización',
    submit: 'Enviar',
    submitted: 'Puntuación enviada',
    waitingOtherScores: 'Esperando tus otras puntuaciones…',
    scoreHint: 'Introduce dificultad y penalización',
    balance: 'Balance',
    mount: 'Mount',
    dynamic: 'Dinámico',
    individual: 'Individual',
    motion: 'Motion',
    combined: 'Combinado',
  },
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function calcElementPenalty(flag: ElementFlag): number {
  let p = 0
  p += flag.tfCount * 0.3
  if (flag.srNotDone) p += 1.0
  if (flag.forbiddenElement) p += 1.0
  if (flag.landingWithoutSupport) p += 0.5
  return p
}

function calcTotals(
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
    // difficulty: count element only when explicitly marked done
    if (mainFlag?.isDone === true) {
      difficulty += el.difficultyValue
    }
    // penalties: sum across all attempt slots
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

function maxAttemptNumber(elementId: string, flags: ElementFlags): number {
  let max = 1
  for (let r = 2; r <= MAX_RETRIES + 1; r++) {
    if (`${elementId}:${r}` in flags) max = r
  }
  return max
}

// ─── sub-components ───────────────────────────────────────────────────────────

function PerformanceHeader({ perf, lang, difficulty, penalty }: {
  perf: Performance
  lang: Lang
  difficulty: number
  penalty: number
}) {
  const t = T[lang]
  const routineLabel = { Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined }[perf.routineType] ?? perf.routineType
  return (
    <div className="bg-slate-800 text-white px-4 py-3 rounded-xl mb-3">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
          #{perf.position} · {perf.ageGroup} · {perf.category} · {routineLabel}
        </span>
        <div className="flex items-center gap-3 text-sm font-bold tabular-nums">
          <span className="text-emerald-400">D {difficulty.toFixed(2)}</span>
          {penalty > 0 && <span className="text-red-400">−{penalty.toFixed(1)}</span>}
        </div>
      </div>
      <p className="text-lg font-semibold leading-tight">{perf.gymnasts}</p>
    </div>
  )
}

function Toggle({ active, onToggle, labelOff, labelOn, color = 'red' }: {
  active: boolean
  onToggle: () => void
  labelOff: string
  labelOn: string
  color?: 'red' | 'amber' | 'blue'
}) {
  const colorMap = {
    red: { on: 'bg-red-500 text-white border-red-500', off: 'bg-white text-slate-500 border-slate-200 hover:border-slate-300' },
    amber: { on: 'bg-amber-400 text-white border-amber-400', off: 'bg-white text-slate-500 border-slate-200 hover:border-slate-300' },
    blue: { on: 'bg-blue-500 text-white border-blue-500', off: 'bg-white text-slate-500 border-slate-200 hover:border-slate-300' },
  }
  return (
    <button
      onClick={onToggle}
      className={[
        'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
        active ? colorMap[color].on : colorMap[color].off,
      ].join(' ')}
    >
      {active ? labelOn : labelOff}
    </button>
  )
}

function TfCounter({ value, onChange, max }: { value: number; onChange: (v: number) => void; max: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max + 1 }, (_, n) => n).map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={[
            'w-8 h-7 rounded-lg text-xs font-bold border transition-all',
            value === n
              ? n === 0 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-red-500 text-white border-red-500'
              : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300',
          ].join(' ')}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function FlagRow({ flag, elementId, attemptNumber, flags, lang, config, onChange, onOpenRetry }: {
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
  const maxAttempt = maxAttemptNumber(elementId, flags)
  const canAddRetry = attemptNumber === maxAttempt && maxAttempt <= MAX_RETRIES

  function patch(p: Partial<ElementFlag>) {
    onChange(elementId, attemptNumber, p)
  }

  return (
    <div className={attemptNumber > 1 ? 'pl-3 border-l-2 border-slate-200 mt-2' : ''}>
      {attemptNumber > 1 && (
        <p className="text-xs text-slate-400 mb-1.5">{t.retry} {attemptNumber - 1}</p>
      )}

      {/* done / not done + TF */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <button
          onClick={() => patch({ isDone: flag.isDone === true ? null : true })}
          className={[
            'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
            flag.isDone === true
              ? 'bg-emerald-500 text-white border-emerald-500'
              : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-300 hover:text-emerald-600',
          ].join(' ')}
        >
          ✓ {t.done}
        </button>
        <button
          onClick={() => patch({ isDone: flag.isDone === false ? null : false })}
          className={[
            'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
            flag.isDone === false
              ? 'bg-amber-400 text-white border-amber-400'
              : 'bg-white text-slate-400 border-slate-200 hover:border-amber-300 hover:text-amber-600',
          ].join(' ')}
        >
          ✗ {t.notDone}
        </button>
        {config.showTf && (
          <>
            <span className="text-xs text-slate-400">{t.tf}:</span>
            <TfCounter
              value={flag.tfCount}
              max={config.tfMax}
              onChange={(v) => patch({ tfCount: v })}
            />
          </>
        )}
      </div>

      {/* penalty flags: SR, no support, forbidden (always last) */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <Toggle
          active={flag.srNotDone}
          onToggle={() => patch({ srNotDone: !flag.srNotDone })}
          labelOff={t.srNotDone}
          labelOn={t.srNotDone}
          color="red"
        />
        {config.showNoSupport && (
          <Toggle
            active={flag.landingWithoutSupport}
            onToggle={() => patch({ landingWithoutSupport: !flag.landingWithoutSupport })}
            labelOff={t.noSupport}
            labelOn={t.noSupport}
            color="red"
          />
        )}
        <Toggle
          active={flag.forbiddenElement}
          onToggle={() => patch({ forbiddenElement: !flag.forbiddenElement })}
          labelOff={t.forbidden}
          labelOn={t.forbidden}
          color="red"
        />
        <button
          onClick={() => setShowNote((v) => !v)}
          className="px-2.5 py-1 rounded-lg text-xs border border-dashed border-slate-200 text-slate-400 hover:border-slate-300"
        >
          {showNote ? '✕' : '+ note'}
        </button>
      </div>

      {showNote && (
        <input
          type="text"
          value={flag.note}
          onChange={(e) => patch({ note: e.target.value })}
          placeholder={t.note}
          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-400 placeholder:text-slate-300 mb-1"
        />
      )}

      {canAddRetry && (
        <button
          onClick={() => onOpenRetry(elementId, maxAttempt + 1)}
          className="text-xs text-blue-500 hover:text-blue-700 underline underline-offset-2"
        >
          + {t.addRetry}
        </button>
      )}
    </div>
  )
}

function ElementRow({ element, flags, lang, onChange, onOpenRetry, isExtra, onLabelChange, onTypeChange }: {
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
  const maxAttempt = maxAttemptNumber(element.id, flags)
  const mainFlag = flags[`${element.id}:1`] ?? DEFAULT_FLAG
  const isDone = mainFlag.isDone

  return (
    <div className={[
      'border rounded-xl p-3 bg-white transition-colors',
      isDone === false ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100',
    ].join(' ')}>
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xs text-slate-400 font-mono w-5 shrink-0 mt-0.5">{isExtra ? '✱' : element.position}</span>
        {isExtra && onLabelChange ? (
          <input
            type="text"
            value={element.label}
            onChange={(e) => onLabelChange(element.id, e.target.value)}
            placeholder={t.elementLabel}
            className="text-sm font-medium text-slate-700 flex-1 leading-snug border-b border-dashed border-slate-300 focus:outline-none focus:border-slate-500 bg-transparent placeholder:text-slate-300"
          />
        ) : (
          <span className={['text-sm font-medium flex-1 leading-snug', !isDone ? 'line-through text-slate-400' : 'text-slate-700'].join(' ')}>
            {element.label}
          </span>
        )}
        {!isExtra && (
          <span className={['text-xs px-1.5 py-0.5 rounded font-mono shrink-0', isDone === false ? 'bg-amber-100 text-amber-400' : 'bg-slate-100 text-slate-500'].join(' ')}>
            {t.difficulty} {element.difficultyValue.toFixed(2)}
          </span>
        )}
      </div>

      {/* type selector for extra elements */}
      {isExtra && onTypeChange && (
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {(['balance', 'mount', 'dynamic', 'individual', 'motion'] as ElementType[]).map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(element.id, type)}
              className={[
                'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all capitalize',
                element.elementType === type
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400',
              ].join(' ')}
            >
              {type}
            </button>
          ))}
          {element.elementType === 'individual' && (
            <button
              onClick={() => onTypeChange(element.id, 'individual', !element.isStatic)}
              className={[
                'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                element.isStatic
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300',
              ].join(' ')}
            >
              {t.isStatic}
            </button>
          )}
        </div>
      )}

      {Array.from({ length: maxAttempt }, (_, i) => i + 1).map((attempt) => {
        const flag = flags[`${element.id}:${attempt}`] ?? DEFAULT_FLAG
        return (
          <FlagRow
            key={attempt}
            flag={flag}
            elementId={element.id}
            attemptNumber={attempt}
            flags={flags}
            lang={lang}
            config={config}
            onChange={onChange}
            onOpenRetry={onOpenRetry}
          />
        )
      })}
    </div>
  )
}

// ─── phone keypad ─────────────────────────────────────────────────────────────

function DualKeypad({ lang, perf, onSubmit }: {
  lang: Lang
  perf: Performance
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
    <div className="px-4 pb-8">
      <PerformanceHeader perf={perf} lang={lang} difficulty={dScore ?? 0} penalty={pScore ?? 0} />
      <p className="text-xs text-slate-400 text-center mb-3">{t.scoreHint}</p>

      {/* D / P selector */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {(['d', 'p'] as const).map((field) => {
          const val = field === 'd' ? dInput : pInput
          const label = field === 'd' ? t.difficultyTotal : t.penaltyTotal
          const isFocused = focused === field
          return (
            <button
              key={field}
              onClick={() => setFocused(field)}
              className={[
                'rounded-2xl py-4 text-center transition-all border-2',
                isFocused ? 'border-slate-800 bg-white shadow-sm' : 'border-transparent bg-slate-100',
              ].join(' ')}
            >
              <p className="text-xs text-slate-400 mb-1">{label}</p>
              <p className={['text-3xl font-bold tabular-nums', val ? 'text-slate-800' : 'text-slate-300'].join(' ')}>
                {val || '—'}
              </p>
            </button>
          )
        })}
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
        disabled={!canSubmit}
        onClick={() => canSubmit && onSubmit(dScore!, pScore!)}
        className={[
          'w-full py-4 rounded-2xl font-bold text-lg transition-all',
          canSubmit ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed',
        ].join(' ')}
      >
        {canSubmit ? `${t.submit} · D ${dScore!.toFixed(2)}  −${pScore!.toFixed(1)}` : t.submit}
      </button>
    </div>
  )
}

// ─── tablet layout ────────────────────────────────────────────────────────────

function TabletLayout({ perf, lang, elements, extraElements, flags, incorrectTs, onChange, onOpenRetry, onAddElement, onLabelChange, onTypeChange, onToggleIncorrectTs, onSubmit, tsUrl }: {
  perf: Performance
  lang: Lang
  elements: TsElement[]
  extraElements: TsElement[]
  flags: ElementFlags
  incorrectTs: boolean
  onChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  onAddElement: () => void
  onLabelChange: (id: string, label: string) => void
  onTypeChange: (id: string, type: ElementType, isStatic?: boolean) => void
  onToggleIncorrectTs: () => void
  onSubmit: () => void
  tsUrl?: string | null
}) {
  const t = T[lang]
  const { difficulty, penalty } = calcTotals(elements, extraElements, flags, incorrectTs)
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
      <div className="w-[420px] flex flex-col gap-3 min-h-0">
        <PerformanceHeader perf={perf} lang={lang} difficulty={difficulty} penalty={penalty} />

        {/* routine-level: incorrect TS */}
        <button
          onClick={onToggleIncorrectTs}
          className={[
            'flex items-start gap-3 px-3 py-2.5 rounded-xl border text-left transition-all',
            incorrectTs ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300',
          ].join(' ')}
        >
          <div className={['w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center', incorrectTs ? 'bg-red-500 border-red-500' : 'border-slate-300'].join(' ')}>
            {incorrectTs && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </div>
          <div>
            <p className={['text-sm font-medium', incorrectTs ? 'text-red-700' : 'text-slate-600'].join(' ')}>{t.incorrectTs} <span className="font-normal text-xs ml-1">−0.3</span></p>
            <p className="text-xs text-slate-400 mt-0.5">{t.incorrectTsNote}</p>
          </div>
        </button>

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
                flags={flags}
                lang={lang}
                onChange={onChange}
                onOpenRetry={onOpenRetry}
                isExtra={el.id.startsWith('extra-')}
                onLabelChange={onLabelChange}
                onTypeChange={onTypeChange}
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
          onClick={onSubmit}
          className="w-full py-4 rounded-2xl font-bold text-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all shrink-0"
        >
          {t.submit} · D {difficulty.toFixed(2)}  −{penalty.toFixed(1)}
        </button>
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

type DJViewProps = {
  currentPerf: Performance | null
  lang: Lang
  elements: TsElement[]
  onSubmit?: (difficulty: number, penalty: number) => void
  // scoreboard props (multi-role)
  waitingForOtherScores?: boolean
  judgeScores?: JudgeScore[]
  panelJudges?: PanelJudge[]
  result?: RoutineResult | null
}

export default function DJView({ currentPerf, lang, elements, onSubmit, waitingForOtherScores, judgeScores, panelJudges, result }: DJViewProps) {
  const t = T[lang]
  const [flags, setFlags] = useState<ElementFlags>({})
  const [incorrectTs, setIncorrectTs] = useState(false)
  const [extraElements, setExtraElements] = useState<TsElement[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submittedDifficulty, setSubmittedDifficulty] = useState<number | null>(null)
  const [submittedPenalty, setSubmittedPenalty] = useState<number | null>(null)
  const prevPerfId = useRef<string | null>(null)

  // initialise flags for elements when performance opens
  useEffect(() => {
    if (currentPerf?.id !== prevPerfId.current) {
      const initial: ElementFlags = {}
      elements.forEach((el) => {
        initial[`${el.id}:1`] = { ...DEFAULT_FLAG }
      })
      setFlags(initial)
      setIncorrectTs(false)
      setExtraElements([])
      setSubmitted(false)
      setSubmittedDifficulty(null)
      setSubmittedPenalty(null)
      prevPerfId.current = currentPerf?.id ?? null
    }
  }, [currentPerf?.id, elements])

  function handleChange(elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) {
    const key = `${elementId}:${attemptNumber}`
    const element = [...elements, ...extraElements].find((el) => el.id === elementId)
    const config = element ? getElementConfig(element) : null

    setFlags((prev) => {
      const current = prev[key] ?? DEFAULT_FLAG
      const updated = { ...current, ...patch }

      // auto-set isDone based on TF value
      if (config && patch.tfCount !== undefined) {
        if (patch.tfCount >= config.autoNotDoneAt) {
          updated.isDone = false
        } else if (patch.tfCount > 0) {
          updated.isDone = true
        }
      }

      return { ...prev, [key]: updated }
    })
  }

  function handleOpenRetry(elementId: string, nextAttemptNumber: number) {
    const key = `${elementId}:${nextAttemptNumber}`
    setFlags((prev) => ({ ...prev, [key]: { ...DEFAULT_FLAG } }))
  }

  function handleAddElement() {
    const id = `extra-${Date.now()}`
    setExtraElements((prev) => [...prev, { id, position: 0, label: '', difficultyValue: 0 }])
    setFlags((prev) => ({ ...prev, [`${id}:1`]: { ...DEFAULT_FLAG } }))
  }

  function handleLabelChange(id: string, label: string) {
    setExtraElements((prev) => prev.map((el) => el.id === id ? { ...el, label } : el))
  }

  function handleTypeChange(id: string, type: ElementType, isStatic?: boolean) {
    setExtraElements((prev) =>
      prev.map((el) => el.id === id ? { ...el, elementType: type, isStatic: isStatic ?? el.isStatic } : el)
    )
  }

  function handleSubmitTablet() {
    const { difficulty, penalty } = calcTotals(elements, extraElements, flags, incorrectTs)
    setSubmittedDifficulty(difficulty)
    setSubmittedPenalty(penalty)
    setSubmitted(true)
    onSubmit?.(difficulty, penalty)
  }

  function handleSubmitPhone(difficulty: number, penalty: number) {
    setSubmittedDifficulty(difficulty)
    setSubmittedPenalty(penalty)
    setSubmitted(true)
    onSubmit?.(difficulty, penalty)
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
  if (submitted && submittedDifficulty !== null && submittedPenalty !== null) {
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
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-slate-400 mb-1">{t.difficultyTotal}</p>
              <p className="text-4xl font-bold text-slate-800 tabular-nums">{submittedDifficulty.toFixed(2)}</p>
            </div>
            <div className="w-px h-12 bg-slate-200" />
            <div>
              <p className="text-xs text-slate-400 mb-1">{t.penaltyTotal}</p>
              <p className="text-4xl font-bold text-red-500 tabular-nums">−{submittedPenalty.toFixed(1)}</p>
            </div>
          </div>
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
        <DualKeypad lang={lang} perf={currentPerf} onSubmit={handleSubmitPhone} />
      </div>
      <div className="hidden md:block h-full px-4 pb-4">
        <TabletLayout
          perf={currentPerf}
          lang={lang}
          elements={elements}
          extraElements={extraElements}
          flags={flags}
          incorrectTs={incorrectTs}
          onChange={handleChange}
          onOpenRetry={handleOpenRetry}
          onAddElement={handleAddElement}
          onLabelChange={handleLabelChange}
          onTypeChange={handleTypeChange}
          onToggleIncorrectTs={() => setIncorrectTs((v) => !v)}
          onSubmit={handleSubmitTablet}
          tsUrl={currentPerf?.tsUrl}
        />
      </div>
    </>
  )
}
