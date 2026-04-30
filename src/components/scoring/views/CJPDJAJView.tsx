'use client'

import { useState } from 'react'
import type { Performance, Lang } from '../types'
import type { TsElement, ElementType } from '../types'
import type { ElementFlag, ElementFlags } from '../types'
import type { PanelJudge, ScoringPerformance, JudgeScore, RoutineResult, PenaltyState, ScoreDetail } from '../types'
import { calcCjpPenalty, DEFAULT_PENALTY } from '../types'
import { PenaltyPanel } from '../../shared/CJPPenaltyPanel'
import AJScoringPanel from '../../shared/AJScoringPanel'
import CJPTabletShell from '../../shared/CJPTabletShell'
import { calcDJTotals, DualKeypad, PhoneDJElementsList } from '../../shared/DJElementsShared'
import { DJTabContent } from '../../shared/DJEJElementsShared'
import CheckIcon from '../../shared/CheckIcon'
import { useDJScoring } from '@/hooks/useDJScoring'
import { usePenaltyStates } from '@/hooks/usePenaltyStates'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    waiting: 'Waiting for performance…',
    waitingSub: 'The panel chief has not opened a routine yet.',
    cjp: 'CJP',
    dj: 'DJ',
    aj: 'AJ',
    cjpTab: 'CJP — Penalties',
    djTab: 'DJ — Elements',
    ajTab: 'AJ — Score',
    cjpPenalty: 'CJP Penalty',
    submit: 'Submit',
    submitted: 'Scores submitted',
    difficultyTotal: 'Difficulty',
    djPenalty: 'DJ Penalty',
  },
  es: {
    waiting: 'Esperando actuación…',
    waitingSub: 'El juez coordinador no ha abierto ninguna rutina todavía.',
    cjp: 'CJP',
    dj: 'DJ',
    aj: 'AJ',
    cjpTab: 'CJP — Penalizaciones',
    djTab: 'DJ — Elementos',
    ajTab: 'AJ — Puntuación',
    cjpPenalty: 'Pen. CJP',
    submit: 'Enviar',
    submitted: 'Puntuaciones enviadas',
    difficultyTotal: 'Dificultad',
    djPenalty: 'Pen. DJ',
  },
}

// ─── phone view (3 tabs: CJP | DJ | AJ) ──────────────────────────────────────

function PhoneView({ perf, lang, djMode, elements, extraElements, flags, incorrectTs, penaltyState,
  onFlagChange, onOpenRetry, onAddElement, onLabelChange, onTypeChange, onToggleIncorrectTs,
  onPenaltyChange, onSubmit }: {
  perf: Performance
  lang: Lang
  djMode: 'elements' | 'keyboard'
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
  onSubmit: (difficulty: number, djPenalty: number, ajScore: number, cjpPenalty: number) => void
}) {
  const t = T[lang]
  const [tab, setTab] = useState<'cjp' | 'dj' | 'aj'>('cjp')
  const [djSubmitted, setDjSubmitted] = useState<{ difficulty: number; penalty: number } | null>(null)
  const [ajSubmitted, setAjSubmitted] = useState<number | null>(null)
  const [cjpSubmitted, setCjpSubmitted] = useState(false)
  const cjpPenalty = calcCjpPenalty(penaltyState)

  function tryFireSubmit(dj: { difficulty: number; penalty: number } | null, aj: number | null, cjp: boolean) {
    if (dj && aj !== null && cjp) {
      onSubmit(dj.difficulty, dj.penalty, aj, calcCjpPenalty(penaltyState))
    }
  }

  function handleDJSubmit(difficulty: number, penalty: number) {
    const val = { difficulty, penalty }
    setDjSubmitted(val)
    tryFireSubmit(val, ajSubmitted, cjpSubmitted)
  }

  function handleAJSubmit(score: number) {
    setAjSubmitted(score)
    tryFireSubmit(djSubmitted, score, cjpSubmitted)
  }

  function handleCJPSubmit() {
    setCjpSubmitted(true)
    tryFireSubmit(djSubmitted, ajSubmitted, true)
  }

  return (
    <div>
      {/* tab switcher */}
      <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1 mx-4 mb-4">
        {(['cjp', 'dj', 'aj'] as const).map((tabId) => (
          <button key={tabId} onClick={() => setTab(tabId)}
            className={['flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5',
              tab === tabId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
            {tabId === 'cjp' ? t.cjp : tabId === 'dj' ? t.dj : t.aj}
            {tabId === 'cjp' && cjpSubmitted && <CheckIcon />}
            {tabId === 'dj' && djSubmitted && <CheckIcon />}
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
        ) : djMode === 'keyboard' ? (
          <DualKeypad lang={lang} onSubmit={handleDJSubmit} />
        ) : (
          <PhoneDJElementsList lang={lang} elements={elements} extraElements={extraElements} flags={flags}
            incorrectTs={incorrectTs} onFlagChange={onFlagChange} onOpenRetry={onOpenRetry}
            onAddElement={onAddElement} onLabelChange={onLabelChange} onTypeChange={onTypeChange}
            onToggleIncorrectTs={onToggleIncorrectTs} onSubmit={handleDJSubmit} />
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
  elements, extraElements, flags, penaltyStates, incorrectTs,
  onFlagChange, onOpenRetry, onAddElement, onLabelChange, onTypeChange,
  onToggleIncorrectTs, onPenaltyChange, onOpen, onSkip,
  onSubmitDJScore, onSubmitAJScore, onSubmit, onReopenScore, onEditScore,
}: {
  lang: Lang
  performances: ScoringPerformance[]
  currentPerfId: string | null
  panelJudges: PanelJudge[]
  judgeScores: Record<string, JudgeScore[]>
  results: Record<string, RoutineResult>
  elements: TsElement[]
  extraElements: TsElement[]
  flags: ElementFlags
  penaltyStates: Record<string, PenaltyState>
  incorrectTs: boolean
  onFlagChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  onAddElement: () => void
  onLabelChange: (id: string, label: string) => void
  onTypeChange: (id: string, type: ElementType, isStatic?: boolean) => void
  onToggleIncorrectTs: () => void
  onPenaltyChange: (perfId: string, p: PenaltyState) => void
  onOpen: (perfId: string) => void
  onSkip?: (perfId: string) => void
  onSubmitDJScore?: (perfId: string, difficulty: number, djPenalty: number, detail: ScoreDetail) => void
  onSubmitAJScore?: (perfId: string, score: number) => void
  onSubmit?: (status: 'provisional' | 'approved', result: RoutineResult) => void
  onReopenScore?: (perfId: string, panelJudgeId: string | 'all') => void
  onEditScore?: (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
}) {
  const t = T[lang]
  const [rightTab, setRightTab] = useState<'cjp' | 'dj' | 'aj'>('cjp')
  const [djSubmitted, setDjSubmitted] = useState<Record<string, boolean>>({})
  const [ajSubmitted, setAjSubmitted] = useState<Record<string, boolean>>({})

  return (
    <CJPTabletShell
      lang={lang} performances={performances} currentPerfId={currentPerfId}
      panelJudges={panelJudges} judgeScores={judgeScores} results={results}
      penaltyStates={penaltyStates} onOpen={onOpen} onSkip={onSkip}
      onSubmit={onSubmit} onReopenScore={onReopenScore}
      onEditScore={onEditScore}
      renderRightPanel={(activePerfId, _isReviewMode) => {
        const penalty = activePerfId ? (penaltyStates[activePerfId] ?? DEFAULT_PENALTY) : DEFAULT_PENALTY
        const isDJSubmitted = activePerfId ? !!djSubmitted[activePerfId] : false
        const isAJSubmitted = activePerfId ? !!ajSubmitted[activePerfId] : false
        const { difficulty: djDifficulty, penalty: djPenaltyVal } = calcDJTotals(elements, extraElements, flags, incorrectTs)

        return (
          <>
            {/* tab header */}
            <div className="px-3 pt-2.5 pb-0 border-b border-slate-200 shrink-0">
              <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1">
                {(['cjp', 'dj', 'aj'] as const).map((tabId) => (
                  <button key={tabId} onClick={() => setRightTab(tabId)}
                    className={['flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
                      rightTab === tabId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
                    {tabId === 'cjp' ? t.cjpTab : tabId === 'dj' ? t.djTab : t.ajTab}
                    {tabId === 'dj' && isDJSubmitted && (
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
              ) : rightTab === 'dj' ? (
                !activePerfId ? (
                  <div className="flex items-center justify-center h-32 text-slate-300 text-sm">{t.waiting}</div>
                ) : (
                  <DJTabContent
                    lang={lang} elements={elements} extraElements={extraElements}
                    flags={flags} incorrectTs={incorrectTs}
                    onFlagChange={onFlagChange} onOpenRetry={onOpenRetry}
                    onAddElement={onAddElement} onLabelChange={onLabelChange} onTypeChange={onTypeChange}
                    onToggleIncorrectTs={onToggleIncorrectTs}
                    onSubmit={() => {
                      setDjSubmitted((prev) => ({ ...prev, [activePerfId]: true }))
                      onSubmitDJScore?.(activePerfId, djDifficulty, djPenaltyVal, { djFlags: flags, djExtraElements: extraElements, djIncorrectTs: incorrectTs })
                    }}
                    isSubmitted={isDJSubmitted}
                    djDifficulty={djDifficulty}
                    djPenalty={djPenaltyVal}
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

export type CJPDJAJViewProps = {
  lang: Lang
  performances: ScoringPerformance[]
  currentPerfId: string | null
  panelJudges: PanelJudge[]
  judgeScores: Record<string, JudgeScore[]>
  results: Record<string, RoutineResult>
  elements: TsElement[]
  djMode?: 'elements' | 'keyboard'
  onOpen: (perfId: string) => void
  onSkip?: (perfId: string) => void
  onSubmitDJScore?: (perfId: string, difficulty: number, djPenalty: number, detail: ScoreDetail) => void
  onSubmitAJScore?: (perfId: string, score: number) => void
  onSubmit?: (status: 'provisional' | 'approved', result: RoutineResult) => void
  onReopenScore?: (perfId: string, panelJudgeId: string | 'all') => void
  onEditScore?: (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
  onPhoneSubmit?: (difficulty: number, djPenalty: number, ajScore: number, cjpPenalty: number) => void
}

export default function CJPDJAJView({
  lang, performances, currentPerfId, panelJudges, judgeScores, results, elements,
  djMode = 'elements', onOpen, onSkip, onSubmitDJScore, onSubmitAJScore, onSubmit, onReopenScore, onEditScore, onPhoneSubmit,
}: CJPDJAJViewProps) {
  const { flags, extraElements, incorrectTs,
    handleFlagChange, handleOpenRetry,
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
          <PhoneView perf={currentPerf as Performance} lang={lang} djMode={djMode}
            elements={elements} extraElements={extraElements} flags={flags} incorrectTs={incorrectTs}
            penaltyState={currentPenaltyState} onFlagChange={handleFlagChange}
            onOpenRetry={handleOpenRetry} onAddElement={handleAddElement}
            onLabelChange={handleLabelChange} onTypeChange={handleTypeChange}
            onToggleIncorrectTs={toggleIncorrectTs}
            onPenaltyChange={(p) => currentPerfId && setPenaltyState(currentPerfId, p)}
            onSubmit={(d, dj, aj, cjp) => onPhoneSubmit?.(d, dj, aj, cjp)} />
        )}
      </div>

      {/* ── tablet / desktop ── */}
      <div className="hidden md:block">
        <TabletLayout lang={lang} performances={performances} currentPerfId={currentPerfId}
          panelJudges={panelJudges} judgeScores={judgeScores} results={results}
          elements={elements} extraElements={extraElements} flags={flags}
          penaltyStates={penaltyStates} incorrectTs={incorrectTs}
          onFlagChange={handleFlagChange} onOpenRetry={handleOpenRetry}
          onAddElement={handleAddElement} onLabelChange={handleLabelChange}
          onTypeChange={handleTypeChange} onToggleIncorrectTs={toggleIncorrectTs}
          onPenaltyChange={setPenaltyState} onOpen={onOpen} onSkip={onSkip}
          onSubmitDJScore={onSubmitDJScore} onSubmitAJScore={onSubmitAJScore}
          onSubmit={onSubmit} onReopenScore={onReopenScore}
          onEditScore={onEditScore} />
      </div>
    </>
  )
}
