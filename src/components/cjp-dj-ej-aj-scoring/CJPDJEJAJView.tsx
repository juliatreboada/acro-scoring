'use client'

import { useState, useEffect, useRef } from 'react'
import type { Performance, Lang } from '../aj-scoring/types'
import type { TsElement, ElementType, Deductions } from '../ej-scoring/types'
import type { ElementFlag, ElementFlags } from '../dj-scoring/types'
import { DEFAULT_FLAG } from '../dj-scoring/types'
import type { PanelJudge, MockPerf, JudgeScore, RoutineResult, PenaltyState } from '../cjp/types'
import { calcCjpPenalty, DEFAULT_PENALTY } from '../cjp/types'
import { PenaltyPanel } from '../shared/CJPPenaltyPanel'
import AJScoringPanel from '../shared/AJScoringPanel'
import DJModeSelector, { type DJPhoneMode } from '../shared/DJModeSelector'
import CJPTabletShell from '../shared/CJPTabletShell'
import { getElementConfig, calcDJTotals, DualKeypad, PhoneDJElementsList } from '../shared/DJElementsShared'
import { calcEJScore, DJEJTabContent, EJKeypad } from '../shared/DJEJElementsShared'
import CheckIcon from '../shared/CheckIcon'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    waiting: 'Waiting for performance…',
    waitingSub: 'The panel chief has not opened a routine yet.',
    cjp: 'CJP',
    dj: 'DJ',
    ej: 'EJ',
    aj: 'AJ',
    cjpTab: 'CJP — Penalties',
    djEjTab: 'DJ+EJ — Elements',
    djTab: 'DJ — Difficulty',
    ejTab: 'EJ — Execution',
    ajTab: 'AJ — Score',
    cjpPenalty: 'CJP Penalty',
    submit: 'Submit',
    submitted: 'Scores submitted',
    difficultyTotal: 'Difficulty',
    djPenalty: 'DJ Penalty',
    ejScore: 'EJ Score',
  },
  es: {
    waiting: 'Esperando actuación…',
    waitingSub: 'El juez coordinador no ha abierto ninguna rutina todavía.',
    cjp: 'CJP',
    dj: 'DJ',
    ej: 'EJ',
    aj: 'AJ',
    cjpTab: 'CJP — Penalizaciones',
    djEjTab: 'DJ+EJ — Elementos',
    djTab: 'DJ — Dificultad',
    ejTab: 'EJ — Ejecución',
    ajTab: 'AJ — Puntuación',
    cjpPenalty: 'Pen. CJP',
    submit: 'Enviar',
    submitted: 'Puntuaciones enviadas',
    difficultyTotal: 'Dificultad',
    djPenalty: 'Pen. DJ',
    ejScore: 'Nota EJ',
  },
}

// ─── phone view (4 tabs: CJP | DJ | EJ | AJ) ─────────────────────────────────

function PhoneView({ perf, lang, mode, elements, extraElements, flags, incorrectTs, penaltyState,
  onFlagChange, onOpenRetry, onAddElement, onLabelChange, onTypeChange, onToggleIncorrectTs,
  onPenaltyChange, onSubmit }: {
  perf: Performance
  lang: Lang
  mode: DJPhoneMode
  elements: TsElement[]
  extraElements: TsElement[]
  flags: ElementFlags
  incorrectTs: boolean
  penaltyState: PenaltyState
  onFlagChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  onAddElement: () => void
  onLabelChange: (id: string, label: string) => void
  onTypeChange: (id: string, type: ElementType, isStatic?: boolean) => void
  onToggleIncorrectTs: () => void
  onPenaltyChange: (p: PenaltyState) => void
  onSubmit: (difficulty: number, djPenalty: number, ejScore: number, ajScore: number, cjpPenalty: number) => void
}) {
  const t = T[lang]
  const [tab, setTab] = useState<'cjp' | 'dj' | 'ej' | 'aj'>('cjp')
  const [djSubmitted, setDjSubmitted] = useState<{ difficulty: number; penalty: number } | null>(null)
  const [ejSubmitted, setEjSubmitted] = useState<number | null>(null)
  const [ajSubmitted, setAjSubmitted] = useState<number | null>(null)
  const [cjpSubmitted, setCjpSubmitted] = useState(false)
  const cjpPenalty = calcCjpPenalty(penaltyState)

  function tryFireSubmit(
    dj: { difficulty: number; penalty: number } | null,
    ej: number | null,
    aj: number | null,
    cjp: boolean
  ) {
    if (dj && ej !== null && aj !== null && cjp) {
      onSubmit(dj.difficulty, dj.penalty, ej, aj, calcCjpPenalty(penaltyState))
    }
  }

  function handleDJSubmit(difficulty: number, penalty: number) {
    const val = { difficulty, penalty }
    setDjSubmitted(val)
    tryFireSubmit(val, ejSubmitted, ajSubmitted, cjpSubmitted)
  }

  function handleEJSubmit(score: number) {
    setEjSubmitted(score)
    tryFireSubmit(djSubmitted, score, ajSubmitted, cjpSubmitted)
  }

  function handleAJSubmit(score: number) {
    setAjSubmitted(score)
    tryFireSubmit(djSubmitted, ejSubmitted, score, cjpSubmitted)
  }

  function handleCJPSubmit() {
    setCjpSubmitted(true)
    tryFireSubmit(djSubmitted, ejSubmitted, ajSubmitted, true)
  }

  return (
    <div>
      {/* tab switcher */}
      <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1 mx-4 mb-4">
        {(['cjp', 'dj', 'ej', 'aj'] as const).map((tabId) => (
          <button key={tabId} onClick={() => setTab(tabId)}
            className={['flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
              tab === tabId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
            {tabId === 'cjp' ? t.cjp : tabId === 'dj' ? t.dj : tabId === 'ej' ? t.ej : t.aj}
            {tabId === 'cjp' && cjpSubmitted && <CheckIcon />}
            {tabId === 'dj' && djSubmitted && <CheckIcon />}
            {tabId === 'ej' && ejSubmitted !== null && <CheckIcon />}
            {tabId === 'aj' && ajSubmitted !== null && <CheckIcon />}
          </button>
        ))}
      </div>

      {/* CJP tab */}
      {tab === 'cjp' && (
        cjpSubmitted ? (
          <div className="px-4 pb-8 flex flex-col items-center gap-4 pt-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{t.submitted}</p>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">{t.cjpPenalty}</p>
              <p className="text-4xl font-bold text-orange-500 tabular-nums">
                {cjpPenalty > 0 ? `−${cjpPenalty.toFixed(1)}` : '0'}
              </p>
            </div>
          </div>
        ) : (
          <div className="pb-4">
            <div className="border border-slate-200 rounded-xl mx-4 overflow-hidden mb-4">
              <PenaltyPanel state={penaltyState} onChange={onPenaltyChange} lang={lang} />
            </div>
            <div className="px-4">
              <button onClick={handleCJPSubmit}
                className="w-full py-4 rounded-2xl font-bold text-lg bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition-all">
                {t.submit} {t.cjpPenalty}{cjpPenalty > 0 ? ` · −${cjpPenalty.toFixed(1)}` : ' · 0'}
              </button>
            </div>
          </div>
        )
      )}

      {/* DJ tab */}
      {tab === 'dj' && (
        djSubmitted ? (
          <div className="px-4 pb-8 flex flex-col items-center gap-4 pt-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{t.submitted}</p>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-1">{t.difficultyTotal}</p>
                <p className="text-4xl font-bold text-slate-800 tabular-nums">{djSubmitted.difficulty.toFixed(2)}</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-1">{t.djPenalty}</p>
                <p className="text-4xl font-bold text-red-500 tabular-nums">−{djSubmitted.penalty.toFixed(1)}</p>
              </div>
            </div>
          </div>
        ) : mode === 'keypad' ? (
          <DualKeypad lang={lang} onSubmit={handleDJSubmit} />
        ) : (
          <PhoneDJElementsList lang={lang} elements={elements} extraElements={extraElements} flags={flags}
            incorrectTs={incorrectTs} onFlagChange={onFlagChange} onOpenRetry={onOpenRetry}
            onAddElement={onAddElement} onLabelChange={onLabelChange} onTypeChange={onTypeChange}
            onToggleIncorrectTs={onToggleIncorrectTs} onSubmit={handleDJSubmit} />
        )
      )}

      {/* EJ tab */}
      {tab === 'ej' && (
        ejSubmitted !== null ? (
          <div className="px-4 pb-8 flex flex-col items-center gap-4 pt-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{t.submitted}</p>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">{t.ejScore}</p>
              <p className="text-4xl font-bold text-sky-600 tabular-nums">{ejSubmitted.toFixed(1)}</p>
            </div>
          </div>
        ) : (
          <EJKeypad lang={lang} onSubmit={handleEJSubmit} />
        )
      )}

      {/* AJ tab */}
      {tab === 'aj' && (
        ajSubmitted !== null ? (
          <div className="px-4 pb-8 flex flex-col items-center gap-4 pt-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{t.submitted}</p>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">{t.ajTab}</p>
              <p className="text-4xl font-bold text-blue-600 tabular-nums">{ajSubmitted.toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto">
            <AJScoringPanel lang={lang} perfId={perf.id} onSubmit={handleAJSubmit} />
          </div>
        )
      )}
    </div>
  )
}

// ─── tablet layout ────────────────────────────────────────────────────────────

function TabletLayout({
  lang, performances, currentPerfId, panelJudges, judgeScores, results,
  elements, extraElements, flags, deductions, incorrectTs, penaltyStates,
  onFlagChange, onLock, onOpenRetry, onAddElement, onLabelChange, onTypeChange,
  onToggleIncorrectTs, onPenaltyChange, onOpen, onSkip,
  onSubmitDJScore, onSubmitEJScore, onSubmitAJScore, onSubmit, onReopenScore, onEditScore,
}: {
  lang: Lang
  performances: MockPerf[]
  currentPerfId: string | null
  panelJudges: PanelJudge[]
  judgeScores: Record<string, JudgeScore[]>
  results: Record<string, RoutineResult>
  elements: TsElement[]
  extraElements: TsElement[]
  flags: ElementFlags
  deductions: Deductions
  incorrectTs: boolean
  penaltyStates: Record<string, PenaltyState>
  onFlagChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  onLock: (elementId: string, attemptNumber: number, value: number) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  onAddElement: () => void
  onLabelChange: (id: string, label: string) => void
  onTypeChange: (id: string, type: ElementType, isStatic?: boolean) => void
  onToggleIncorrectTs: () => void
  onPenaltyChange: (perfId: string, p: PenaltyState) => void
  onOpen: (perfId: string) => void
  onSkip?: (perfId: string) => void
  onSubmitDJScore?: (perfId: string, difficulty: number, djPenalty: number) => void
  onSubmitEJScore?: (perfId: string, ejScore: number) => void
  onSubmitAJScore?: (perfId: string, score: number) => void
  onSubmit?: (status: 'provisional' | 'approved', result: RoutineResult) => void
  onReopenScore?: (perfId: string, panelJudgeId: string | 'all') => void
  onEditScore?: (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
}) {
  const t = T[lang]
  const [rightTab, setRightTab] = useState<'cjp' | 'djej' | 'aj'>('cjp')
  const [djEjSubmitted, setDjEjSubmitted] = useState<Record<string, boolean>>({})
  const [ajSubmitted, setAjSubmitted] = useState<Record<string, boolean>>({})

  function handleDJEJSubmit(perfId: string) {
    const { difficulty, penalty } = calcDJTotals(elements, extraElements, flags, incorrectTs)
    const ejScore = calcEJScore(deductions)
    setDjEjSubmitted((prev) => ({ ...prev, [perfId]: true }))
    onSubmitDJScore?.(perfId, difficulty, penalty)
    onSubmitEJScore?.(perfId, ejScore)
  }

  return (
    <CJPTabletShell
      lang={lang} performances={performances} currentPerfId={currentPerfId}
      panelJudges={panelJudges} judgeScores={judgeScores} results={results}
      penaltyStates={penaltyStates} onOpen={onOpen} onSkip={onSkip}
      onSubmit={onSubmit} onReopenScore={onReopenScore}
      onEditScore={onEditScore}
      renderRightPanel={(activePerfId, _isReviewMode) => {
        const penalty = activePerfId ? (penaltyStates[activePerfId] ?? DEFAULT_PENALTY) : DEFAULT_PENALTY
        const isDJEJSubmitted = activePerfId ? !!djEjSubmitted[activePerfId] : false
        const isAJSubmitted = activePerfId ? !!ajSubmitted[activePerfId] : false
        const { difficulty: djDifficulty, penalty: djPenaltyVal } = calcDJTotals(elements, extraElements, flags, incorrectTs)
        const ejScore = calcEJScore(deductions)

        return (
          <>
            {/* tab header */}
            <div className="px-3 pt-2.5 pb-0 border-b border-slate-200 shrink-0">
              <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1">
                {(['cjp', 'djej', 'aj'] as const).map((tabId) => (
                  <button key={tabId} onClick={() => setRightTab(tabId)}
                    className={['flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
                      rightTab === tabId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
                    {tabId === 'cjp' ? t.cjpTab : tabId === 'djej' ? t.djEjTab : t.ajTab}
                    {tabId === 'djej' && isDJEJSubmitted && (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                    )}
                    {tabId === 'aj' && isAJSubmitted && (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* tab content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {rightTab === 'cjp' ? (
                activePerfId ? (
                  <PenaltyPanel state={penalty} onChange={(p) => onPenaltyChange(activePerfId, p)} lang={lang} />
                ) : (
                  <div className="flex items-center justify-center h-32 text-slate-300 text-sm">{t.waiting}</div>
                )
              ) : rightTab === 'djej' ? (
                !activePerfId ? (
                  <div className="flex items-center justify-center h-32 text-slate-300 text-sm">{t.waiting}</div>
                ) : (
                  <DJEJTabContent
                    lang={lang}
                    elements={elements}
                    extraElements={extraElements}
                    flags={flags}
                    deductions={deductions}
                    incorrectTs={incorrectTs}
                    onFlagChange={onFlagChange}
                    onLock={onLock}
                    onOpenRetry={onOpenRetry}
                    onAddElement={onAddElement}
                    onLabelChange={onLabelChange}
                    onTypeChange={onTypeChange}
                    onToggleIncorrectTs={onToggleIncorrectTs}
                    onSubmit={() => handleDJEJSubmit(activePerfId)}
                    isSubmitted={isDJEJSubmitted}
                    djDifficulty={djDifficulty}
                    djPenalty={djPenaltyVal}
                    ejScore={ejScore}
                  />
                )
              ) : !activePerfId ? (
                <div className="flex items-center justify-center h-32 text-slate-300 text-sm">{t.waiting}</div>
              ) : (
                <div className="py-3">
                  <AJScoringPanel
                    lang={lang}
                    perfId={activePerfId}
                    onSubmit={(score) => {
                      setAjSubmitted((prev) => ({ ...prev, [activePerfId]: true }))
                      onSubmitAJScore?.(activePerfId, score)
                    }}
                  />
                </div>
              )}
            </div>
          </>
        )
      }}
    />
  )
}

// ─── props & main component ───────────────────────────────────────────────────

export type CJPDJEJAJViewProps = {
  lang: Lang
  performances: MockPerf[]
  currentPerfId: string | null
  panelJudges: PanelJudge[]
  judgeScores: Record<string, JudgeScore[]>
  results: Record<string, RoutineResult>
  elements: TsElement[]
  onOpen: (perfId: string) => void
  onSkip?: (perfId: string) => void
  onSubmitDJScore?: (perfId: string, difficulty: number, djPenalty: number) => void
  onSubmitEJScore?: (perfId: string, ejScore: number) => void
  onSubmitAJScore?: (perfId: string, score: number) => void
  onSubmit?: (status: 'provisional' | 'approved', result: RoutineResult) => void
  onReopenScore?: (perfId: string, panelJudgeId: string | 'all') => void
  onEditScore?: (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
  onPhoneSubmit?: (difficulty: number, djPenalty: number, ejScore: number, ajScore: number, cjpPenalty: number) => void
}

export default function CJPDJEJAJView({
  lang, performances, currentPerfId, panelJudges, judgeScores, results, elements,
  onOpen, onSkip, onSubmitDJScore, onSubmitEJScore, onSubmitAJScore, onSubmit, onReopenScore, onEditScore, onPhoneSubmit,
}: CJPDJEJAJViewProps) {
  const [flags, setFlags] = useState<ElementFlags>({})
  const [deductions, setDeductions] = useState<Deductions>({})
  const [extraElements, setExtraElements] = useState<TsElement[]>([])
  const [incorrectTs, setIncorrectTs] = useState(false)
  const [penaltyStates, setPenaltyStates] = useState<Record<string, PenaltyState>>({})
  const [djPhoneMode, setDjPhoneMode] = useState<DJPhoneMode | null>(null)

  const prevPerfId = useRef<string | null>(null)
  const currentPerf = performances.find((p) => p.id === currentPerfId) ?? null

  useEffect(() => {
    if (currentPerfId !== prevPerfId.current) {
      const initial: ElementFlags = {}
      elements.forEach((el) => { initial[`${el.id}:1`] = { ...DEFAULT_FLAG } })
      setFlags(initial)
      setDeductions({})
      setIncorrectTs(false)
      setExtraElements([])
      prevPerfId.current = currentPerfId ?? null
    }
  }, [currentPerfId, elements])

  function getPenaltyState(perfId: string): PenaltyState { return penaltyStates[perfId] ?? DEFAULT_PENALTY }
  function setPenaltyState(perfId: string, p: PenaltyState) { setPenaltyStates((prev) => ({ ...prev, [perfId]: p })) }

  function handleFlagChange(elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) {
    const key = `${elementId}:${attemptNumber}`
    const element = [...elements, ...extraElements].find((el) => el.id === elementId)
    const config = element ? getElementConfig(element) : null
    setFlags((prev) => {
      const current = prev[key] ?? DEFAULT_FLAG
      const updated = { ...current, ...patch }
      if (config && patch.tfCount !== undefined) {
        if (patch.tfCount >= config.autoNotDoneAt) updated.isDone = false
        else if (patch.tfCount > 0) updated.isDone = true
      }
      return { ...prev, [key]: updated }
    })
  }

  function handleLock(elementId: string, attemptNumber: number, value: number) {
    const key = `${elementId}:${attemptNumber}`
    setDeductions((prev) => ({ ...prev, [key]: { value, locked: true } }))
  }

  function handleOpenRetry(elementId: string, nextAttemptNumber: number) {
    setFlags((prev) => ({ ...prev, [`${elementId}:${nextAttemptNumber}`]: { ...DEFAULT_FLAG } }))
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
    setExtraElements((prev) => prev.map((el) => el.id === id ? { ...el, elementType: type, isStatic: isStatic ?? el.isStatic } : el))
  }

  const currentPenaltyState = currentPerfId ? getPenaltyState(currentPerfId) : DEFAULT_PENALTY

  return (
    <>
      {/* ── phone ── */}
      <div className="md:hidden">
        {!currentPerf ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-slate-700">{T[lang].waiting}</p>
            <p className="text-sm text-slate-400">{T[lang].waitingSub}</p>
          </div>
        ) : djPhoneMode === null ? (
          <DJModeSelector lang={lang} onSelect={setDjPhoneMode} />
        ) : (
          <PhoneView
            perf={currentPerf as Performance}
            lang={lang}
            mode={djPhoneMode}
            elements={elements}
            extraElements={extraElements}
            flags={flags}
            incorrectTs={incorrectTs}
            penaltyState={currentPenaltyState}
            onFlagChange={handleFlagChange}
            onOpenRetry={handleOpenRetry}
            onAddElement={handleAddElement}
            onLabelChange={handleLabelChange}
            onTypeChange={handleTypeChange}
            onToggleIncorrectTs={() => setIncorrectTs((v) => !v)}
            onPenaltyChange={(p) => currentPerfId && setPenaltyState(currentPerfId, p)}
            onSubmit={(d, dj, ej, aj, cjp) => onPhoneSubmit?.(d, dj, ej, aj, cjp)}
          />
        )}
      </div>

      {/* ── tablet / desktop ── */}
      <div className="hidden md:block">
        <TabletLayout
          lang={lang}
          performances={performances}
          currentPerfId={currentPerfId}
          panelJudges={panelJudges}
          judgeScores={judgeScores}
          results={results}
          elements={elements}
          extraElements={extraElements}
          flags={flags}
          deductions={deductions}
          incorrectTs={incorrectTs}
          penaltyStates={penaltyStates}
          onFlagChange={handleFlagChange}
          onLock={handleLock}
          onOpenRetry={handleOpenRetry}
          onAddElement={handleAddElement}
          onLabelChange={handleLabelChange}
          onTypeChange={handleTypeChange}
          onToggleIncorrectTs={() => setIncorrectTs((v) => !v)}
          onPenaltyChange={setPenaltyState}
          onOpen={onOpen}
          onSkip={onSkip}
          onSubmitDJScore={onSubmitDJScore}
          onSubmitEJScore={onSubmitEJScore}
          onSubmitAJScore={onSubmitAJScore}
          onSubmit={onSubmit}
          onReopenScore={onReopenScore}
          onEditScore={onEditScore}
        />
      </div>
    </>
  )
}
