'use client'

import { useState } from 'react'
import type { Performance, Lang } from '../aj-scoring/types'
import type { TsElement, ElementType, Deductions } from '../ej-scoring/types'
import type { ElementFlag, ElementFlags } from '../dj-scoring/types'
import type { PanelJudge, MockPerf, JudgeScore, RoutineResult, PenaltyState, ScoreDetail } from '../cjp/types'
import { calcCjpPenalty, DEFAULT_PENALTY } from '../cjp/types'
import { PenaltyPanel } from '../shared/CJPPenaltyPanel'
import CJPTabletShell from '../shared/CJPTabletShell'
import { calcDJTotals, DualKeypad, PhoneDJElementsList } from '../shared/DJElementsShared'
import { calcEJScore, DJEJTabContent, EJKeypad, EJElementRow } from '../shared/DJEJElementsShared'
import CheckIcon from '../shared/CheckIcon'
import { useDJScoring } from '@/hooks/useDJScoring'
import { usePenaltyStates } from '@/hooks/usePenaltyStates'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    waiting: 'Waiting for performance…',
    waitingSub: 'The panel chief has not opened a routine yet.',
    cjp: 'CJP',
    dj: 'DJ',
    ej: 'EJ',
    cjpTab: 'CJP — Penalties',
    djEjTab: 'DJ+EJ — Elements',
    djTab: 'DJ — Difficulty',
    ejTab: 'EJ — Execution',
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
    cjpTab: 'CJP — Penalizaciones',
    djEjTab: 'DJ+EJ — Elementos',
    djTab: 'DJ — Dificultad',
    ejTab: 'EJ — Ejecución',
    cjpPenalty: 'Pen. CJP',
    submit: 'Enviar',
    submitted: 'Puntuaciones enviadas',
    difficultyTotal: 'Dificultad',
    djPenalty: 'Pen. DJ',
    ejScore: 'Nota EJ',
  },
}

// ─── phone view (combined when both=elements, else 3 tabs: CJP | DJ | EJ) ──────

function PhoneView({ lang, djMode, ejMode, elements, extraElements, flags, deductions, incorrectTs, penaltyState,
  onFlagChange, onLock, onOpenRetry, onAddElement, onLabelChange, onTypeChange, onToggleIncorrectTs,
  onPenaltyChange, onSubmit }: {
  lang: Lang
  djMode: 'elements' | 'keyboard'
  ejMode: 'elements' | 'keyboard'
  elements: TsElement[]
  extraElements: TsElement[]
  flags: ElementFlags
  deductions: Deductions
  incorrectTs: boolean
  penaltyState: PenaltyState
  onFlagChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  onLock: (elementId: string, attemptNumber: number, value: number) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  onAddElement: () => void
  onLabelChange: (id: string, label: string) => void
  onTypeChange: (id: string, type: ElementType, isStatic?: boolean) => void
  onToggleIncorrectTs: () => void
  onPenaltyChange: (p: PenaltyState) => void
  onSubmit: (difficulty: number, djPenalty: number, ejScore: number, cjpPenalty: number) => void
}) {
  const t = T[lang]
  const bothElements = djMode === 'elements' && ejMode === 'elements'
  const [combinedTab, setCombinedTab] = useState<'cjp' | 'djej'>('cjp')
  const [tab, setTab] = useState<'cjp' | 'dj' | 'ej'>('cjp')
  const [djSubmitted, setDjSubmitted] = useState<{ difficulty: number; penalty: number } | null>(null)
  const [ejSubmitted, setEjSubmitted] = useState<number | null>(null)
  const [cjpSubmitted, setCjpSubmitted] = useState(false)
  const cjpPenalty = calcCjpPenalty(penaltyState)
  const { difficulty: djDifficulty, penalty: djPenaltyVal } = calcDJTotals(elements, extraElements, flags, incorrectTs)
  const ejScore = calcEJScore(deductions)

  function tryFireSubmit(dj: { difficulty: number; penalty: number } | null, ej: number | null, cjp: boolean) {
    if (dj && ej !== null && cjp) {
      onSubmit(dj.difficulty, dj.penalty, ej, calcCjpPenalty(penaltyState))
    }
  }

  function handleDJEJSubmit() {
    const djVal = { difficulty: djDifficulty, penalty: djPenaltyVal }
    setDjSubmitted(djVal)
    setEjSubmitted(ejScore)
    tryFireSubmit(djVal, ejScore, cjpSubmitted)
  }

  function handleDJSubmit(difficulty: number, penalty: number) {
    const val = { difficulty, penalty }
    setDjSubmitted(val)
    tryFireSubmit(val, ejSubmitted, cjpSubmitted)
  }

  function handleEJSubmit(score: number) {
    setEjSubmitted(score)
    tryFireSubmit(djSubmitted, score, cjpSubmitted)
  }

  function handleCJPSubmit() {
    setCjpSubmitted(true)
    tryFireSubmit(djSubmitted, ejSubmitted, true)
  }

  const cjpContent = cjpSubmitted ? (
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

  if (bothElements) {
    return (
      <div>
        <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1 mx-4 mb-4">
          {(['cjp', 'djej'] as const).map((tabId) => (
            <button key={tabId} onClick={() => setCombinedTab(tabId)}
              className={['flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5',
                combinedTab === tabId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
              {tabId === 'cjp' ? t.cjp : `${t.dj}+${t.ej}`}
              {tabId === 'cjp' && cjpSubmitted && <CheckIcon />}
              {tabId === 'djej' && djSubmitted !== null && ejSubmitted !== null && <CheckIcon />}
            </button>
          ))}
        </div>
        {combinedTab === 'cjp' && cjpContent}
        {combinedTab === 'djej' && (
          <DJEJTabContent
            lang={lang} elements={elements} extraElements={extraElements}
            flags={flags} deductions={deductions} incorrectTs={incorrectTs}
            onFlagChange={onFlagChange} onLock={onLock} onOpenRetry={onOpenRetry}
            onAddElement={onAddElement} onLabelChange={onLabelChange} onTypeChange={onTypeChange}
            onToggleIncorrectTs={onToggleIncorrectTs}
            onSubmit={handleDJEJSubmit}
            isSubmitted={djSubmitted !== null && ejSubmitted !== null}
            djDifficulty={djDifficulty} djPenalty={djPenaltyVal} ejScore={ejScore}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1 mx-4 mb-4">
        {(['cjp', 'dj', 'ej'] as const).map((tabId) => (
          <button key={tabId} onClick={() => setTab(tabId)}
            className={['flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5',
              tab === tabId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
            {tabId === 'cjp' ? t.cjp : tabId === 'dj' ? t.dj : t.ej}
            {tabId === 'cjp' && cjpSubmitted && <CheckIcon />}
            {tabId === 'dj' && djSubmitted && <CheckIcon />}
            {tabId === 'ej' && ejSubmitted !== null && <CheckIcon />}
          </button>
        ))}
      </div>

      {tab === 'cjp' && cjpContent}

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
        ) : djMode === 'keyboard' ? (
          <DualKeypad lang={lang} onSubmit={handleDJSubmit} />
        ) : (
          <PhoneDJElementsList lang={lang} elements={elements} extraElements={extraElements} flags={flags}
            incorrectTs={incorrectTs} onFlagChange={onFlagChange} onOpenRetry={onOpenRetry}
            onAddElement={onAddElement} onLabelChange={onLabelChange} onTypeChange={onTypeChange}
            onToggleIncorrectTs={onToggleIncorrectTs} onSubmit={handleDJSubmit} />
        )
      )}

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
        ) : ejMode === 'keyboard' ? (
          <EJKeypad lang={lang} onSubmit={handleEJSubmit} />
        ) : (
          <div className="px-4 space-y-2 pb-4">
            {[...elements, ...extraElements].map((el) => (
              <EJElementRow key={el.id} element={el} deductions={deductions} lang={lang} onLock={onLock}
                onLabelChange={el.id.startsWith('extra-') ? onLabelChange : undefined} />
            ))}
            <button onClick={() => handleEJSubmit(ejScore)}
              className="w-full py-4 rounded-2xl font-bold text-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white transition-all">
              {t.submit} · {t.ejScore} {ejScore.toFixed(1)}
            </button>
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
  onSubmitDJScore, onSubmitEJScore, onSubmit, onReopenScore, onEditScore,
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
  onSubmitDJScore?: (perfId: string, difficulty: number, djPenalty: number, detail: ScoreDetail) => void
  onSubmitEJScore?: (perfId: string, ejScore: number) => void
  onSubmit?: (status: 'provisional' | 'approved', result: RoutineResult) => void
  onReopenScore?: (perfId: string, panelJudgeId: string | 'all') => void
  onEditScore?: (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
}) {
  const t = T[lang]
  const [rightTab, setRightTab] = useState<'cjp' | 'djej'>('cjp')
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})

  function handleDJEJSubmit(perfId: string) {
    const { difficulty, penalty } = calcDJTotals(elements, extraElements, flags, incorrectTs)
    const ejScore = calcEJScore(deductions)
    setSubmitted((prev) => ({ ...prev, [perfId]: true }))
    onSubmitDJScore?.(perfId, difficulty, penalty, { djFlags: flags, djExtraElements: extraElements, djIncorrectTs: incorrectTs })
    onSubmitEJScore?.(perfId, ejScore)
  }

  return (
    <CJPTabletShell
      lang={lang}
      performances={performances}
      currentPerfId={currentPerfId}
      panelJudges={panelJudges}
      judgeScores={judgeScores}
      results={results}
      penaltyStates={penaltyStates}
      onOpen={onOpen}
      onSkip={onSkip}
      onSubmit={onSubmit}
      onReopenScore={onReopenScore}
      onEditScore={onEditScore}
      renderRightPanel={(activePerfId, _isReviewMode) => {
        const penalty = activePerfId ? (penaltyStates[activePerfId] ?? DEFAULT_PENALTY) : DEFAULT_PENALTY
        const isSubmitted = activePerfId ? !!submitted[activePerfId] : false
        const { difficulty: djDifficulty, penalty: djPenaltyVal } = calcDJTotals(elements, extraElements, flags, incorrectTs)
        const ejScore = calcEJScore(deductions)

        return (
          <>
            {/* tab header */}
            <div className="px-3 pt-2.5 pb-0 border-b border-slate-200 shrink-0">
              <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1">
                <button onClick={() => setRightTab('cjp')}
                  className={['flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all', rightTab === 'cjp' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
                  {t.cjpTab}
                </button>
                <button onClick={() => setRightTab('djej')}
                  className={['flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1', rightTab === 'djej' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
                  {t.djEjTab}
                  {isSubmitted && (
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                  )}
                </button>
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
              ) : !activePerfId ? (
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
                  isSubmitted={isSubmitted}
                  djDifficulty={djDifficulty}
                  djPenalty={djPenaltyVal}
                  ejScore={ejScore}
                />
              )}
            </div>
          </>
        )
      }}
    />
  )
}

// ─── props & main component ───────────────────────────────────────────────────

export type CJPDJEJViewProps = {
  lang: Lang
  performances: MockPerf[]
  currentPerfId: string | null
  panelJudges: PanelJudge[]
  judgeScores: Record<string, JudgeScore[]>
  results: Record<string, RoutineResult>
  elements: TsElement[]
  djMode?: 'elements' | 'keyboard'
  ejMode?: 'elements' | 'keyboard'
  onOpen: (perfId: string) => void
  onSkip?: (perfId: string) => void
  onSubmitDJScore?: (perfId: string, difficulty: number, djPenalty: number, detail: ScoreDetail) => void
  onSubmitEJScore?: (perfId: string, ejScore: number) => void
  onSubmit?: (status: 'provisional' | 'approved', result: RoutineResult) => void
  onReopenScore?: (perfId: string, panelJudgeId: string | 'all') => void
  onEditScore?: (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
  onPhoneSubmit?: (difficulty: number, djPenalty: number, ejScore: number, cjpPenalty: number) => void
}

export default function CJPDJEJView({
  lang, performances, currentPerfId, panelJudges, judgeScores, results, elements,
  djMode = 'elements', ejMode = 'elements',
  onOpen, onSkip, onSubmitDJScore, onSubmitEJScore, onSubmit, onReopenScore, onEditScore, onPhoneSubmit,
}: CJPDJEJViewProps) {
  const { flags, extraElements, incorrectTs, deductions,
    handleFlagChange, handleLock, handleOpenRetry,
    handleAddElement, handleLabelChange, handleTypeChange,
    toggleIncorrectTs } = useDJScoring(elements, currentPerfId)

  const { penaltyStates, getPenaltyState, setPenaltyState } = usePenaltyStates()

  const currentPerf = performances.find((p) => p.id === currentPerfId) ?? null
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
        ) : (
          <PhoneView
            lang={lang}
            djMode={djMode}
            ejMode={ejMode}
            elements={elements}
            extraElements={extraElements}
            flags={flags}
            deductions={deductions}
            incorrectTs={incorrectTs}
            penaltyState={currentPenaltyState}
            onFlagChange={handleFlagChange}
            onLock={handleLock}
            onOpenRetry={handleOpenRetry}
            onAddElement={handleAddElement}
            onLabelChange={handleLabelChange}
            onTypeChange={handleTypeChange}
            onToggleIncorrectTs={toggleIncorrectTs}
            onPenaltyChange={(p) => currentPerfId && setPenaltyState(currentPerfId, p)}
            onSubmit={(d, dj, ej, cjp) => onPhoneSubmit?.(d, dj, ej, cjp)}
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
          onToggleIncorrectTs={toggleIncorrectTs}
          onPenaltyChange={setPenaltyState}
          onOpen={onOpen}
          onSkip={onSkip}
          onSubmitDJScore={onSubmitDJScore}
          onSubmitEJScore={onSubmitEJScore}
          onSubmit={onSubmit}
          onReopenScore={onReopenScore}
          onEditScore={onEditScore}
        />
      </div>
    </>
  )
}
