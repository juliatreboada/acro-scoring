'use client'

import { useState } from 'react'
import type { Performance, Lang } from '../types'
import type { TsElement, ElementType, Deductions } from '../types'
import type { PanelJudge, ScoringPerformance, JudgeScore, RoutineResult, PenaltyState, ScoreDetail } from '../types'
import { calcCjpPenalty, DEFAULT_PENALTY } from '../types'
import { PenaltyPanel } from '../../shared/CJPPenaltyPanel'
import AJScoringPanel from '../../shared/AJScoringPanel'
import CJPTabletShell from '../../shared/CJPTabletShell'
import { calcEJScore, EJKeypad, EJElementRow } from '../../shared/DJEJElementsShared'
import CheckIcon from '../../shared/CheckIcon'
import { useDJScoring } from '@/hooks/useDJScoring'
import { usePenaltyStates } from '@/hooks/usePenaltyStates'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    waiting: 'Waiting for performance…',
    waitingSub: 'The panel chief has not opened a routine yet.',
    cjp: 'CJP',
    ej: 'EJ',
    aj: 'AJ',
    cjpTab: 'CJP — Penalties',
    ejTab: 'EJ — Execution',
    ajTab: 'AJ — Score',
    cjpPenalty: 'CJP Penalty',
    submit: 'Submit',
    submitted: 'Scores submitted',
    ejScore: 'EJ Score',
  },
  es: {
    waiting: 'Esperando actuación…',
    waitingSub: 'El juez coordinador no ha abierto ninguna rutina todavía.',
    cjp: 'CJP',
    ej: 'EJ',
    aj: 'AJ',
    cjpTab: 'CJP — Penalizaciones',
    ejTab: 'EJ — Ejecución',
    ajTab: 'AJ — Puntuación',
    cjpPenalty: 'Pen. CJP',
    submit: 'Enviar',
    submitted: 'Puntuaciones enviadas',
    ejScore: 'Nota EJ',
  },
}

// ─── phone view (CJP | EJ | [AJ]) ────────────────────────────────────────────

function PhoneView({ perf, lang, ejMode, includeAJ, elements, extraElements, deductions, penaltyState,
  onLock, onAddElement, onLabelChange, onTypeChange,
  onPenaltyChange, onSubmit }: {
  perf: Performance
  lang: Lang
  ejMode: 'elements' | 'keyboard'
  includeAJ: boolean
  elements: TsElement[]
  extraElements: TsElement[]
  deductions: Deductions
  penaltyState: PenaltyState
  onLock: (elementId: string, attemptNumber: number, value: number) => void
  onAddElement: () => void
  onLabelChange: (id: string, label: string) => void
  onTypeChange: (id: string, type: ElementType, isStatic?: boolean) => void
  onPenaltyChange: (p: PenaltyState) => void
  onSubmit: (ejScore: number, ajScore: number, cjpPenalty: number) => void
}) {
  const t = T[lang]
  const [tab, setTab] = useState<'cjp' | 'ej' | 'aj'>('cjp')
  const [ejSubmitted, setEjSubmitted] = useState<number | null>(null)
  const [ajSubmitted, setAjSubmitted] = useState<number | null>(null)
  const [cjpSubmitted, setCjpSubmitted] = useState(false)
  const cjpPenalty = calcCjpPenalty(penaltyState)
  const ejScore = calcEJScore(deductions)

  function tryFireSubmit(ej: number | null, aj: number | null, cjp: boolean) {
    if (!cjp || ej === null) return
    if (includeAJ) {
      if (aj === null) return
      onSubmit(ej, aj, calcCjpPenalty(penaltyState))
    } else {
      onSubmit(ej, 0, calcCjpPenalty(penaltyState))
    }
  }

  function handleEJSubmit(score: number) {
    setEjSubmitted(score)
    tryFireSubmit(score, includeAJ ? ajSubmitted : null, cjpSubmitted)
  }

  function handleAJSubmit(score: number) {
    setAjSubmitted(score)
    tryFireSubmit(ejSubmitted, score, cjpSubmitted)
  }

  function handleCJPSubmit() {
    setCjpSubmitted(true)
    tryFireSubmit(ejSubmitted, includeAJ ? ajSubmitted : null, true)
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

  const ajContent = ajSubmitted !== null ? (
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

  const phoneTabs = (includeAJ ? ['cjp', 'ej', 'aj'] : ['cjp', 'ej']) as ('cjp' | 'ej' | 'aj')[]

  return (
    <div>
      <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1 mx-4 mb-4">
        {phoneTabs.map((tabId) => (
          <button key={tabId} onClick={() => setTab(tabId)}
            className={['flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
              tab === tabId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
            {tabId === 'cjp' ? t.cjp : tabId === 'ej' ? t.ej : t.aj}
            {tabId === 'cjp' && cjpSubmitted && <CheckIcon />}
            {tabId === 'ej' && ejSubmitted !== null && <CheckIcon />}
            {tabId === 'aj' && ajSubmitted !== null && <CheckIcon />}
          </button>
        ))}
      </div>

      {tab === 'cjp' && cjpContent}

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

      {includeAJ && tab === 'aj' && ajContent}
    </div>
  )
}

// ─── tablet layout ────────────────────────────────────────────────────────────

function TabletLayout({
  lang, performances, rankingPerformances, currentPerfId, panelJudges, judgeScores, results,
  elements, extraElements, deductions, penaltyStates,
  ejMode, includeAJ,
  onLock, onAddElement, onLabelChange, onTypeChange,
  onPenaltyChange, onOpen, onSkip,
  onSubmitEJScore, onSubmitAJScore, onSubmit, onReopenScore, onEditScore,
}: {
  lang: Lang
  performances: ScoringPerformance[]
  rankingPerformances?: ScoringPerformance[]
  currentPerfId: string | null
  panelJudges: PanelJudge[]
  judgeScores: Record<string, JudgeScore[]>
  results: Record<string, RoutineResult>
  elements: TsElement[]
  extraElements: TsElement[]
  deductions: Deductions
  penaltyStates: Record<string, PenaltyState>
  ejMode: 'elements' | 'keyboard'
  includeAJ: boolean
  onLock: (elementId: string, attemptNumber: number, value: number) => void
  onAddElement: () => void
  onLabelChange: (id: string, label: string) => void
  onTypeChange: (id: string, type: ElementType, isStatic?: boolean) => void
  onPenaltyChange: (perfId: string, p: PenaltyState) => void
  onOpen: (perfId: string) => void
  onSkip?: (perfId: string) => void
  onSubmitEJScore?: (perfId: string, ejScore: number) => void
  onSubmitAJScore?: (perfId: string, score: number) => void
  onSubmit?: (status: 'provisional' | 'approved', result: RoutineResult) => void
  onReopenScore?: (perfId: string, panelJudgeId: string | 'all') => void
  onEditScore?: (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
}) {
  const t = T[lang]
  const [rightTab, setRightTab] = useState<'cjp' | 'ej' | 'aj'>('cjp')
  const [ejSubmitted, setEjSubmitted] = useState<Record<string, number>>({})
  const [ajSubmitted, setAjSubmitted] = useState<Record<string, boolean>>({})

  const checkIcon = (
    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )

  return (
    <CJPTabletShell
      lang={lang} performances={performances} rankingPerformances={rankingPerformances} currentPerfId={currentPerfId}
      panelJudges={panelJudges} judgeScores={judgeScores} results={results}
      penaltyStates={penaltyStates} onOpen={onOpen} onSkip={onSkip}
      onSubmit={onSubmit} onReopenScore={onReopenScore}
      onEditScore={onEditScore}
      renderRightPanel={(activePerfId, _isReviewMode) => {
        const penalty = activePerfId ? (penaltyStates[activePerfId] ?? DEFAULT_PENALTY) : DEFAULT_PENALTY
        const isEJSubmitted = activePerfId ? ejSubmitted[activePerfId] != null : false
        const isAJSubmitted = activePerfId ? !!ajSubmitted[activePerfId] : false
        const ejScore = calcEJScore(deductions)

        const noPerf = <div className="flex items-center justify-center h-32 text-slate-300 text-sm">{t.waiting}</div>
        const cjpContent = activePerfId
          ? <PenaltyPanel state={penalty} onChange={(p) => onPenaltyChange(activePerfId, p)} lang={lang} />
          : noPerf
        const ajContent = !activePerfId ? noPerf : (
          <div className="py-3">
            <AJScoringPanel lang={lang} perfId={activePerfId}
              onSubmit={(score) => {
                setAjSubmitted((prev) => ({ ...prev, [activePerfId]: true }))
                onSubmitAJScore?.(activePerfId, score)
              }} />
          </div>
        )

        const tabletTabs = (includeAJ ? ['cjp', 'ej', 'aj'] : ['cjp', 'ej']) as ('cjp' | 'ej' | 'aj')[]

        return (
          <>
            <div className="px-3 pt-2.5 pb-0 border-b border-slate-200 shrink-0">
              <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1">
                {tabletTabs.map((tabId) => (
                  <button key={tabId} onClick={() => setRightTab(tabId)}
                    className={['flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
                      rightTab === tabId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
                    {tabId === 'cjp' ? t.cjpTab : tabId === 'ej' ? t.ejTab : t.ajTab}
                    {tabId === 'ej' && isEJSubmitted && checkIcon}
                    {tabId === 'aj' && isAJSubmitted && checkIcon}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {rightTab === 'cjp' && cjpContent}

              {rightTab === 'ej' && (
                !activePerfId ? noPerf :
                isEJSubmitted ? (
                  <div className="flex flex-col items-center gap-3 py-10 px-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div className="text-center"><p className="text-xs text-slate-400 mb-1">{t.ejScore}</p><p className="text-2xl font-bold text-sky-600 tabular-nums">{ejSubmitted[activePerfId]!.toFixed(1)}</p></div>
                  </div>
                ) : ejMode === 'keyboard' ? (
                  <EJKeypad lang={lang} onSubmit={(s) => {
                    setEjSubmitted((prev) => ({ ...prev, [activePerfId]: s }))
                    onSubmitEJScore?.(activePerfId, s)
                  }} />
                ) : (
                  <div className="p-3 space-y-2">
                    {[...elements, ...extraElements].map((el) => (
                      <EJElementRow key={el.id} element={el} deductions={deductions} lang={lang} onLock={onLock}
                        onLabelChange={el.id.startsWith('extra-') ? onLabelChange : undefined} />
                    ))}
                    <button onClick={() => {
                      setEjSubmitted((prev) => ({ ...prev, [activePerfId]: ejScore }))
                      onSubmitEJScore?.(activePerfId, ejScore)
                    }}
                      className="w-full py-3 rounded-xl font-bold text-base bg-sky-500 hover:bg-sky-600 active:scale-95 text-white transition-all">
                      {t.submit} · {t.ejScore} {ejScore.toFixed(1)}
                    </button>
                  </div>
                )
              )}

              {includeAJ && rightTab === 'aj' && ajContent}
            </div>
          </>
        )
      }}
    />
  )
}

// ─── props & main component ───────────────────────────────────────────────────

export type CJPEJAJViewProps = {
  lang: Lang
  performances: ScoringPerformance[]
  rankingPerformances?: ScoringPerformance[]
  currentPerfId: string | null
  panelJudges: PanelJudge[]
  judgeScores: Record<string, JudgeScore[]>
  results: Record<string, RoutineResult>
  elements: TsElement[]
  ejMode?: 'elements' | 'keyboard'
  /** When false, only CJP + EJ (e.g. `/cjp-ej`). Default true. */
  includeAJ?: boolean
  onOpen: (perfId: string) => void
  onSkip?: (perfId: string) => void
  onSubmitEJScore?: (perfId: string, ejScore: number) => void
  onSubmitAJScore?: (perfId: string, score: number) => void
  onSubmit?: (status: 'provisional' | 'approved', result: RoutineResult) => void
  onReopenScore?: (perfId: string, panelJudgeId: string | 'all') => void
  onEditScore?: (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
  onPhoneSubmit?: (ejScore: number, ajScore: number, cjpPenalty: number) => void
}

export default function CJPEJAJView({
  lang, performances, rankingPerformances, currentPerfId, panelJudges, judgeScores, results, elements,
  ejMode = 'elements',
  includeAJ = true,
  onOpen, onSkip, onSubmitEJScore, onSubmitAJScore, onSubmit, onReopenScore, onEditScore, onPhoneSubmit,
}: CJPEJAJViewProps) {
  const { extraElements, deductions,
    handleLock, handleAddElement, handleLabelChange, handleTypeChange } = useDJScoring(elements, currentPerfId)

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
            perf={currentPerf as Performance}
            lang={lang}
            ejMode={ejMode}
            includeAJ={includeAJ}
            elements={elements}
            extraElements={extraElements}
            deductions={deductions}
            penaltyState={currentPenaltyState}
            onLock={handleLock}
            onAddElement={handleAddElement}
            onLabelChange={handleLabelChange}
            onTypeChange={handleTypeChange}
            onPenaltyChange={(p) => currentPerfId && setPenaltyState(currentPerfId, p)}
            onSubmit={(ej, aj, cjp) => onPhoneSubmit?.(ej, aj, cjp)}
          />
        )}
      </div>

      {/* ── tablet / desktop ── */}
      <div className="hidden md:block">
        <TabletLayout
          lang={lang}
          performances={performances}
          rankingPerformances={rankingPerformances}
          currentPerfId={currentPerfId}
          panelJudges={panelJudges}
          judgeScores={judgeScores}
          results={results}
          elements={elements}
          extraElements={extraElements}
          deductions={deductions}
          penaltyStates={penaltyStates}
          ejMode={ejMode}
          includeAJ={includeAJ}
          onLock={handleLock}
          onAddElement={handleAddElement}
          onLabelChange={handleLabelChange}
          onTypeChange={handleTypeChange}
          onPenaltyChange={setPenaltyState}
          onOpen={onOpen}
          onSkip={onSkip}
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
