'use client'

import { useState, useEffect } from 'react'
import type { Performance, Lang, TsElement } from './types'
import type { ElementFlag, ElementFlags, Deductions } from './types'
import type { PanelJudge, ScoringPerformance, JudgeScore, RoutineResult, PenaltyState, ScoreDetail } from './types'
import { calcCjpPenalty, DEFAULT_PENALTY } from './types'
import CJPTabletShell, { ScoreGrid } from './CJPTabletShell'
import { PenaltyPanel } from '../shared/CJPPenaltyPanel'
import { calcDJTotals, srPenaltyForAgeGroup, DualKeypad as DJDualKeypad, PhoneDJElementsList } from './DJElementsShared'
import { calcEJScore, DJEJTabContent, DJTabContent, EJKeypad, EJElementRow, CombinedElementRow } from './DJEJElementsShared'
import AJScoringPanel from './AJScoringPanel'
import { ScoringPerformanceHeader } from '../shared/ScoringPerformanceHeader'
import { RoleTabBar } from '../shared/RoleTabBar'
import { SubmittedScoreCard } from '../shared/SubmittedScoreCard'
import CheckIcon from '../shared/CheckIcon'
import { useDJScoring } from '@/hooks/useDJScoring'
import { usePenaltyStates } from '@/hooks/usePenaltyStates'
import { useEJScoring } from '@/hooks/useEJScoring'
import CJPView from './views/CJPView'
import DJView from './views/DJView'
import EJView from './views/EJView'
import AJView from './views/AJView'
import { useT } from '@/lib/useT'

// ─── types ────────────────────────────────────────────────────────────────────

export type ScoringRole = 'CJP' | 'DJ' | 'EJ' | 'AJ'

export type ScoringViewProps = {
  roles: ScoringRole[]
  lang: Lang

  // CJP shell props (used when 'CJP' in roles)
  performances?: ScoringPerformance[]
  rankingPerformances?: ScoringPerformance[]
  currentPerfId?: string | null
  panelJudges?: PanelJudge[]
  judgeScores?: Record<string, JudgeScore[]>
  results?: Record<string, RoutineResult>
  onOpen?: (perfId: string) => void
  onSkip?: (perfId: string) => void
  onCJPSubmit?: (status: 'provisional' | 'approved', result: RoutineResult, penaltyDetail?: PenaltyState | null) => void
  onReopenScore?: (perfId: string, panelJudgeId: string | 'all') => void
  onUnpublishResult?: (perfId: string) => void
  onEditScore?: (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
  onSubmitDJScore?: (perfId: string, difficulty: number, penalty: number, detail: ScoreDetail) => void
  onSubmitEJScore?: (perfId: string, score: number) => void
  onSubmitAJScore?: (perfId: string, score: number) => void

  // Non-CJP / solo view props
  currentPerf?: Performance | null
  elements?: TsElement[]
  djMode?: 'elements' | 'keyboard'
  ejMode?: 'elements' | 'keyboard'
  onDJSubmit?: (difficulty: number, penalty: number, detail: ScoreDetail) => void
  onEJSubmit?: (score: number, detail: ScoreDetail) => void
  onAJSubmit?: (score: number) => void

  // Non-CJP: state restoration after refresh
  myDJSubmittedScore?: { difficulty: number; penalty: number } | null
  myEJSubmittedScore?: number | null
  myAJSubmittedScore?: number | null

  // Non-CJP: scoreboard props (solo views pass these through)
  waitingForOtherScores?: boolean
  result?: RoutineResult | null
  singleJudgeScores?: JudgeScore[]
  mySubmittedEJScore?: number | null
}

// ─── shared waiting screen ────────────────────────────────────────────────────

function WaitingScreen({ lang }: { lang: Lang }) {
  const t = useT('ScoringView', lang)
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

// ─── check indicator (for tablet tabs) ───────────────────────────────────────

function TabCheck() {
  return (
    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}

// ─── submitted DJ card ────────────────────────────────────────────────────────

function SubmittedDJCard({ dj, lang }: { dj: { difficulty: number; penalty: number }; lang: Lang }) {
  const t = useT('ScoringView', lang)
  return (
    <div className="px-4 pb-8 flex flex-col items-center gap-4 pt-4">
      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-1">{t.difficultyTotal}</p>
          <p className="text-4xl font-bold text-slate-800 tabular-nums">{dj.difficulty.toFixed(2)}</p>
        </div>
        <div className="w-px h-10 bg-slate-200" />
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-1">{t.djPenalty}</p>
          <p className="text-4xl font-bold text-red-500 tabular-nums">−{dj.penalty.toFixed(1)}</p>
        </div>
      </div>
    </div>
  )
}

// ─── CJP phone panel ─────────────────────────────────────────────────────────
// Renders phone tab bar + content for CJP-containing multi-role views

type CJPPhoneTab = 'cjp' | 'dj' | 'ej' | 'aj' | 'djej'

function CJPPhonePanel({
  lang, hasDJ, hasEJ, hasAJ, djMode, ejMode,
  perf, penaltyState, elements, extraElements, flags, deductions, incorrectTs,
  onPenaltyChange, onFlagChange, onLock, onOpenRetry, onAddElement, onLabelChange, onTypeChange, onToggleIncorrectTs,
}: {
  lang: Lang; hasDJ: boolean; hasEJ: boolean; hasAJ: boolean
  djMode: 'elements' | 'keyboard'; ejMode: 'elements' | 'keyboard'
  perf: Performance; penaltyState: PenaltyState
  elements: TsElement[]; extraElements: TsElement[]
  flags: ElementFlags; deductions: Deductions; incorrectTs: boolean
  onPenaltyChange: (p: PenaltyState) => void
  onFlagChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  onLock: (elementId: string, attemptNumber: number, value: number) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  onAddElement: () => void
  onLabelChange: (id: string, label: string) => void
  onTypeChange: (id: string, type: string, isStatic?: boolean) => void
  onToggleIncorrectTs: () => void
}) {
  const t = useT('ScoringView', lang)
  const bothElements = hasDJ && hasEJ && djMode === 'elements' && ejMode === 'elements'
  const cjpPenalty = calcCjpPenalty(penaltyState)
  const { difficulty: djDifficulty, penalty: djPenaltyVal } = calcDJTotals(elements, extraElements, flags, incorrectTs, srPenaltyForAgeGroup(perf.ageGroup), perf.missingIndividualSR ?? false)
  const ejScoreVal = calcEJScore(deductions)

  const [cjpSubmitted, setCjpSubmitted] = useState(false)
  const [djSubmitted, setDjSubmitted] = useState<{ difficulty: number; penalty: number } | null>(null)
  const [ejSubmitted, setEjSubmitted] = useState<number | null>(null)
  const [ajSubmitted, setAjSubmitted] = useState<number | null>(null)

  // Determine tabs
  const tabs: CJPPhoneTab[] = ['cjp']
  if (bothElements) {
    if (hasDJ && hasEJ) tabs.push('djej')
  } else {
    if (hasDJ) tabs.push('dj')
    if (hasEJ) tabs.push('ej')
  }
  if (hasAJ) tabs.push('aj')

  const [tab, setTab] = useState<CJPPhoneTab>(tabs[0])

  const tabLabel = (id: CJPPhoneTab) => {
    if (id === 'cjp') return t.cjp
    if (id === 'dj') return t.dj
    if (id === 'ej') return t.ej
    if (id === 'aj') return t.aj
    return `${t.dj}+${t.ej}`
  }

  const isTabSubmitted = (id: CJPPhoneTab) => {
    if (id === 'cjp') return cjpSubmitted
    if (id === 'dj') return djSubmitted !== null
    if (id === 'ej') return ejSubmitted !== null
    if (id === 'aj') return ajSubmitted !== null
    return djSubmitted !== null && ejSubmitted !== null
  }

  const cjpContent = cjpSubmitted ? (
    <div className="px-4 pb-8 flex flex-col items-center gap-4 pt-4">
      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
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
        <button onClick={() => setCjpSubmitted(true)}
          className="w-full py-4 rounded-2xl font-bold text-lg bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition-all">
          {t.submit} {t.cjpPenalty}{cjpPenalty > 0 ? ` · −${cjpPenalty.toFixed(1)}` : ' · 0'}
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1 mx-4 mb-4">
        {tabs.map((id) => (
          <button key={id} onClick={() => setTab(id)}
            className={['flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5',
              tab === id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
            {tabLabel(id)}
            {isTabSubmitted(id) && <CheckIcon />}
          </button>
        ))}
      </div>

      {tab === 'cjp' && cjpContent}

      {tab === 'djej' && (
        <DJEJTabContent
          lang={lang} elements={elements} extraElements={extraElements}
          flags={flags} deductions={deductions} incorrectTs={incorrectTs}
          onFlagChange={onFlagChange} onLock={onLock} onOpenRetry={onOpenRetry}
          onAddElement={onAddElement} onLabelChange={onLabelChange} onTypeChange={onTypeChange as never}
          onToggleIncorrectTs={onToggleIncorrectTs}
          onSubmit={() => { setDjSubmitted({ difficulty: djDifficulty, penalty: djPenaltyVal }); setEjSubmitted(ejScoreVal) }}
          isSubmitted={djSubmitted !== null && ejSubmitted !== null}
          djDifficulty={djDifficulty} djPenalty={djPenaltyVal} ejScore={ejScoreVal}
        />
      )}

      {tab === 'dj' && (
        djSubmitted ? <SubmittedDJCard dj={djSubmitted} lang={lang} /> :
        djMode === 'keyboard' ? (
          <DJDualKeypad lang={lang} onSubmit={(d, p) => setDjSubmitted({ difficulty: d, penalty: p })} />
        ) : (
          <PhoneDJElementsList lang={lang} elements={elements} extraElements={extraElements} flags={flags}
            incorrectTs={incorrectTs} ageGroup={perf.ageGroup} missingIndividualSR={perf.missingIndividualSR ?? false} onFlagChange={onFlagChange} onOpenRetry={onOpenRetry}
            onAddElement={onAddElement} onLabelChange={onLabelChange} onTypeChange={onTypeChange as never}
            onToggleIncorrectTs={onToggleIncorrectTs}
            onSubmit={(d, p) => setDjSubmitted({ difficulty: d, penalty: p })} />
        )
      )}

      {tab === 'ej' && (
        ejSubmitted !== null ? (
          <SubmittedScoreCard label={t.ejScore} score={ejSubmitted} color="text-sky-600" decimals={1} />
        ) : ejMode === 'keyboard' ? (
          <EJKeypad lang={lang} onSubmit={setEjSubmitted} />
        ) : (
          <div className="px-4 space-y-2 pb-4">
            {[...elements, ...extraElements].map((el) => (
              <EJElementRow key={el.id} element={el} deductions={deductions} lang={lang} onLock={onLock}
                onLabelChange={el.id.startsWith('extra-') ? onLabelChange : undefined} />
            ))}
            <button onClick={() => setEjSubmitted(ejScoreVal)}
              className="w-full py-4 rounded-2xl font-bold text-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white transition-all">
              {t.submit} · {t.ejScore} {ejScoreVal.toFixed(1)}
            </button>
          </div>
        )
      )}

      {tab === 'aj' && (
        ajSubmitted !== null ? (
          <SubmittedScoreCard label={t.ajScore} score={ajSubmitted} color="text-blue-600" decimals={2} />
        ) : (
          <div className="overflow-y-auto">
            <AJScoringPanel lang={lang} perfId={perf.id} onSubmit={setAjSubmitted} />
          </div>
        )
      )}
    </div>
  )
}

// ─── CJP tablet right panel ───────────────────────────────────────────────────

type CJPTabletTab = 'cjp' | 'dj' | 'ej' | 'aj' | 'djej'

function CJPTabletRightPanel({
  lang, activePerfId, hasDJ, hasEJ, hasAJ,
  penaltyState, onPenaltyChange,
  elements, extraElements, flags, deductions, incorrectTs,
  onFlagChange, onLock, onOpenRetry, onAddElement, onLabelChange, onTypeChange, onToggleIncorrectTs,
  onDJSubmit, onEJSubmit, onAJSubmit,
  ageGroup = '',
  missingIndividualSR = false,
}: {
  lang: Lang; activePerfId: string | null
  hasDJ: boolean; hasEJ: boolean; hasAJ: boolean
  penaltyState: PenaltyState; onPenaltyChange: (p: PenaltyState) => void
  elements: TsElement[]; extraElements: TsElement[]
  flags: ElementFlags; deductions: Deductions; incorrectTs: boolean
  ageGroup?: string
  missingIndividualSR?: boolean
  onFlagChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  onLock: (elementId: string, attemptNumber: number, value: number) => void
  onOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  onAddElement: () => void
  onLabelChange: (id: string, label: string) => void
  onTypeChange: (id: string, type: string, isStatic?: boolean) => void
  onToggleIncorrectTs: () => void
  onDJSubmit?: (perfId: string, difficulty: number, penalty: number, detail: ScoreDetail) => void
  onEJSubmit?: (perfId: string, score: number) => void
  onAJSubmit?: (perfId: string, score: number) => void
}) {
  const t = useT('ScoringView', lang)
  const combineDJEJ = hasDJ && hasEJ

  const tabs: CJPTabletTab[] = ['cjp', ...(combineDJEJ ? ['djej' as CJPTabletTab] : [
    ...(hasDJ ? ['dj' as CJPTabletTab] : []),
    ...(hasEJ ? ['ej' as CJPTabletTab] : []),
  ]), ...(hasAJ ? ['aj' as CJPTabletTab] : [])]

  const [activeTab, setActiveTab] = useState<CJPTabletTab>('cjp')
  const [djSubmitted, setDjSubmitted] = useState<Record<string, boolean>>({})
  const [ejSubmitted, setEjSubmitted] = useState<Record<string, boolean>>({})
  const [ajSubmitted, setAjSubmitted] = useState<Record<string, boolean>>({})

  const noPerf = <div className="flex items-center justify-center h-32 text-slate-300 text-sm">{t.waiting}</div>

  const { difficulty: djDiff, penalty: djPen } = calcDJTotals(elements, extraElements, flags, incorrectTs, srPenaltyForAgeGroup(ageGroup), missingIndividualSR)
  const ejScore = calcEJScore(deductions)

  const isDJSubmitted = activePerfId ? !!djSubmitted[activePerfId] : false
  const isEJSubmitted = activePerfId ? !!ejSubmitted[activePerfId] : false
  const isDJEJSubmitted = isDJSubmitted && isEJSubmitted
  const isAJSubmitted = activePerfId ? !!ajSubmitted[activePerfId] : false

  const tabLabel = (id: CJPTabletTab) => {
    if (id === 'cjp') return t.cjpTab
    if (id === 'dj') return t.djTab
    if (id === 'ej') return t.ejTab
    if (id === 'aj') return t.ajTab
    return t.djEjTab
  }

  const isTabSubmitted = (id: CJPTabletTab) => {
    if (id === 'dj') return isDJSubmitted
    if (id === 'ej') return isEJSubmitted
    if (id === 'aj') return isAJSubmitted
    if (id === 'djej') return isDJEJSubmitted
    return false
  }

  return (
    <>
      <div className="px-3 pt-2.5 pb-0 border-b border-slate-200 shrink-0">
        <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1">
          {tabs.map((id) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={['flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
                activeTab === id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
              {tabLabel(id)}
              {isTabSubmitted(id) && <TabCheck />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'cjp' && (
          activePerfId
            ? <PenaltyPanel state={penaltyState} onChange={onPenaltyChange} lang={lang} />
            : noPerf
        )}

        {activeTab === 'djej' && (
          !activePerfId ? noPerf : (
            <DJEJTabContent
              lang={lang} elements={elements} extraElements={extraElements}
              flags={flags} deductions={deductions} incorrectTs={incorrectTs}
              onFlagChange={onFlagChange} onLock={onLock} onOpenRetry={onOpenRetry}
              onAddElement={onAddElement} onLabelChange={onLabelChange} onTypeChange={onTypeChange as never}
              onToggleIncorrectTs={onToggleIncorrectTs}
              onSubmit={() => {
                setDjSubmitted((p) => ({ ...p, [activePerfId]: true }))
                setEjSubmitted((p) => ({ ...p, [activePerfId]: true }))
                onDJSubmit?.(activePerfId, djDiff, djPen, { djFlags: flags, djExtraElements: extraElements, djIncorrectTs: incorrectTs })
                onEJSubmit?.(activePerfId, ejScore)
              }}
              isSubmitted={isDJEJSubmitted}
              djDifficulty={djDiff} djPenalty={djPen} ejScore={ejScore}
            />
          )
        )}

        {activeTab === 'dj' && (
          !activePerfId ? noPerf : (
            <DJTabContent
              lang={lang} elements={elements} extraElements={extraElements}
              flags={flags} incorrectTs={incorrectTs}
              onFlagChange={onFlagChange} onOpenRetry={onOpenRetry}
              onAddElement={onAddElement} onLabelChange={onLabelChange} onTypeChange={onTypeChange as never}
              onToggleIncorrectTs={onToggleIncorrectTs}
              onSubmit={() => {
                setDjSubmitted((p) => ({ ...p, [activePerfId]: true }))
                onDJSubmit?.(activePerfId, djDiff, djPen, { djFlags: flags, djExtraElements: extraElements, djIncorrectTs: incorrectTs })
              }}
              isSubmitted={isDJSubmitted}
              djDifficulty={djDiff} djPenalty={djPen}
            />
          )
        )}

        {activeTab === 'ej' && (
          !activePerfId ? noPerf : isEJSubmitted ? (
            <div className="flex flex-col items-center gap-3 py-10 px-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs text-slate-400 mb-1">{t.ejScore}</p>
              <p className="text-2xl font-bold text-sky-600 tabular-nums">{ejScore.toFixed(1)}</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {[...elements, ...extraElements].map((el) => (
                <EJElementRow key={el.id} element={el} deductions={deductions} lang={lang} onLock={onLock}
                  onLabelChange={el.id.startsWith('extra-') ? onLabelChange : undefined} />
              ))}
              <button onClick={() => {
                setEjSubmitted((p) => ({ ...p, [activePerfId]: true }))
                onEJSubmit?.(activePerfId, ejScore)
              }} className="w-full py-3 rounded-xl font-bold text-base bg-sky-500 hover:bg-sky-600 active:scale-95 text-white transition-all">
                {t.submit} · {t.ejScore} {ejScore.toFixed(1)}
              </button>
            </div>
          )
        )}

        {activeTab === 'aj' && (
          !activePerfId ? noPerf : isAJSubmitted ? (
            <div className="flex flex-col items-center gap-3 py-10 px-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="py-3">
              <AJScoringPanel lang={lang} perfId={activePerfId}
                onSubmit={(score) => {
                  setAjSubmitted((p) => ({ ...p, [activePerfId]: true }))
                  onAJSubmit?.(activePerfId, score)
                }} />
            </div>
          )
        )}
      </div>
    </>
  )
}

// ─── CJP multi-role layout ────────────────────────────────────────────────────

function CJPLayout({
  roles, lang,
  performances, rankingPerformances, currentPerfId, panelJudges, judgeScores, results,
  elements, djMode, ejMode,
  onOpen, onSkip, onCJPSubmit, onReopenScore, onUnpublishResult, onEditScore,
  onSubmitDJScore, onSubmitEJScore, onSubmitAJScore,
  flags, extraElements, incorrectTs, deductions,
  handleFlagChange, handleLock, handleOpenRetry, handleAddElement, handleLabelChange, handleTypeChange, toggleIncorrectTs,
  penaltyStates, getPenaltyState, setPenaltyState,
}: {
  roles: ScoringRole[]; lang: Lang
  performances: ScoringPerformance[]; rankingPerformances?: ScoringPerformance[]
  currentPerfId: string | null; panelJudges: PanelJudge[]
  judgeScores: Record<string, JudgeScore[]>; results: Record<string, RoutineResult>
  elements: TsElement[]; djMode: 'elements' | 'keyboard'; ejMode: 'elements' | 'keyboard'
  onOpen: (perfId: string) => void; onSkip?: (perfId: string) => void
  onCJPSubmit?: (status: 'provisional' | 'approved', result: RoutineResult, penaltyDetail?: PenaltyState | null) => void
  onReopenScore?: (perfId: string, panelJudgeId: string | 'all') => void
  onUnpublishResult?: (perfId: string) => void
  onEditScore?: (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
  onSubmitDJScore?: (perfId: string, difficulty: number, penalty: number, detail: ScoreDetail) => void
  onSubmitEJScore?: (perfId: string, score: number) => void
  onSubmitAJScore?: (perfId: string, score: number) => void
  flags: ElementFlags; extraElements: TsElement[]; incorrectTs: boolean; deductions: Deductions
  handleFlagChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  handleLock: (elementId: string, attemptNumber: number, value: number) => void
  handleOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  handleAddElement: () => void
  handleLabelChange: (id: string, label: string) => void
  handleTypeChange: (id: string, type: string, isStatic?: boolean) => void
  toggleIncorrectTs: () => void
  penaltyStates: Record<string, PenaltyState>
  getPenaltyState: (perfId: string) => PenaltyState
  setPenaltyState: (perfId: string, p: PenaltyState) => void
}) {
  const hasDJ = roles.includes('DJ')
  const hasEJ = roles.includes('EJ')
  const hasAJ = roles.includes('AJ')

  const currentPerf = performances.find((p) => p.id === currentPerfId) ?? null
  const currentPenaltyState = currentPerfId ? getPenaltyState(currentPerfId) : DEFAULT_PENALTY

  return (
    <>
      {/* phone */}
      <div className="md:hidden">
        {!currentPerf
          ? <WaitingScreen lang={lang} />
          : <CJPPhonePanel
              lang={lang} hasDJ={hasDJ} hasEJ={hasEJ} hasAJ={hasAJ}
              djMode={djMode} ejMode={ejMode}
              perf={currentPerf as Performance} penaltyState={currentPenaltyState}
              elements={elements} extraElements={extraElements}
              flags={flags} deductions={deductions} incorrectTs={incorrectTs}
              onPenaltyChange={(p) => currentPerfId && setPenaltyState(currentPerfId, p)}
              onFlagChange={handleFlagChange} onLock={handleLock} onOpenRetry={handleOpenRetry}
              onAddElement={handleAddElement} onLabelChange={handleLabelChange}
              onTypeChange={handleTypeChange} onToggleIncorrectTs={toggleIncorrectTs}
            />
        }
      </div>

      {/* tablet */}
      <div className="hidden md:block">
        <CJPTabletShell
          lang={lang} performances={performances} rankingPerformances={rankingPerformances}
          currentPerfId={currentPerfId} panelJudges={panelJudges}
          judgeScores={judgeScores} results={results}
          penaltyStates={penaltyStates} onOpen={onOpen} onSkip={onSkip}
          onSubmit={onCJPSubmit} onReopenScore={onReopenScore}
          onUnpublishResult={onUnpublishResult} onEditScore={onEditScore}
          renderRightPanel={(activePerfId) => {
            const penaltyState = activePerfId ? (penaltyStates[activePerfId] ?? DEFAULT_PENALTY) : DEFAULT_PENALTY
            const activePerf = performances.find(p => p.id === activePerfId)
            return (
              <CJPTabletRightPanel
                lang={lang} activePerfId={activePerfId}
                hasDJ={hasDJ} hasEJ={hasEJ} hasAJ={hasAJ}
                penaltyState={penaltyState}
                ageGroup={activePerf?.ageGroup ?? ''}
                missingIndividualSR={activePerf?.missingIndividualSR ?? false}
                onPenaltyChange={(p) => activePerfId && setPenaltyState(activePerfId, p)}
                elements={elements} extraElements={extraElements}
                flags={flags} deductions={deductions} incorrectTs={incorrectTs}
                onFlagChange={handleFlagChange} onLock={handleLock} onOpenRetry={handleOpenRetry}
                onAddElement={handleAddElement} onLabelChange={handleLabelChange}
                onTypeChange={handleTypeChange} onToggleIncorrectTs={toggleIncorrectTs}
                onDJSubmit={onSubmitDJScore} onEJSubmit={onSubmitEJScore} onAJSubmit={onSubmitAJScore}
              />
            )
          }}
        />
      </div>
    </>
  )
}

// ─── non-CJP multi-role view ──────────────────────────────────────────────────

function NonCJPMultiView({
  roles, lang, currentPerf, elements, djMode, ejMode,
  flags, extraElements, incorrectTs, deductions,
  handleFlagChange, handleLock, handleOpenRetry, handleAddElement, handleLabelChange, handleTypeChange, toggleIncorrectTs,
  ejOrdredAll, ejDragId, ejDropIdx, ejDragRef, ejSetDragId, ejSetDropIdx, ejHandleReorder, ejHandleAddElement, ejHandleLabelChange,
  onDJSubmit, onEJSubmit, onAJSubmit,
  myDJSubmittedScore, myEJSubmittedScore, myAJSubmittedScore,
  waitingForOtherScores, result, singleJudgeScores,
}: {
  roles: ScoringRole[]; lang: Lang; currentPerf: Performance | null
  elements: TsElement[]; djMode: 'elements' | 'keyboard'; ejMode: 'elements' | 'keyboard'
  flags: ElementFlags; extraElements: TsElement[]; incorrectTs: boolean; deductions: Deductions
  handleFlagChange: (elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) => void
  handleLock: (elementId: string, attemptNumber: number, value: number) => void
  handleOpenRetry: (elementId: string, nextAttemptNumber: number) => void
  handleAddElement: () => void
  handleLabelChange: (id: string, label: string) => void
  handleTypeChange: (id: string, type: string, isStatic?: boolean) => void
  toggleIncorrectTs: () => void
  ejOrdredAll: TsElement[]
  ejDragId: string | null; ejDropIdx: number | null
  ejDragRef: React.MutableRefObject<string | null>
  ejSetDragId: (id: string | null) => void; ejSetDropIdx: (idx: number | null) => void
  ejHandleReorder: (draggedId: string, targetIdx: number) => void
  ejHandleAddElement: () => void; ejHandleLabelChange: (id: string, label: string) => void
  onDJSubmit?: (difficulty: number, penalty: number, detail: ScoreDetail) => void
  onEJSubmit?: (score: number, detail: ScoreDetail) => void
  onAJSubmit?: (score: number) => void
  myDJSubmittedScore?: { difficulty: number; penalty: number } | null
  myEJSubmittedScore?: number | null
  myAJSubmittedScore?: number | null
  waitingForOtherScores?: boolean
  result?: RoutineResult | null
  singleJudgeScores?: JudgeScore[]
}) {
  const t = useT('ScoringView', lang)
  const hasDJ = roles.includes('DJ')
  const hasEJ = roles.includes('EJ')
  const hasAJ = roles.includes('AJ')
  const combineDJEJ = hasDJ && hasEJ

  const [djSubmitted, setDjSubmitted] = useState<{ difficulty: number; penalty: number } | null>(null)
  const [ejSubmitted, setEjSubmitted] = useState<number | null>(null)
  const [ajSubmitted, setAjSubmitted] = useState<number | null>(null)
  const [tab, setTab] = useState<string>(combineDJEJ ? 'djej' : hasDJ ? 'dj' : hasEJ ? 'ej' : 'aj')
  const [tabletTab, setTabletTab] = useState<string>(combineDJEJ ? 'djej' : hasDJ ? 'dj' : hasEJ ? 'ej' : 'aj')

  useEffect(() => {
    if (myDJSubmittedScore != null) setDjSubmitted(myDJSubmittedScore)
  }, [myDJSubmittedScore]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (myEJSubmittedScore != null) setEjSubmitted(myEJSubmittedScore)
  }, [myEJSubmittedScore]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (myAJSubmittedScore != null) setAjSubmitted(myAJSubmittedScore)
  }, [myAJSubmittedScore]) // eslint-disable-line react-hooks/exhaustive-deps

  const { difficulty: djDiff, penalty: djPen } = calcDJTotals(elements, extraElements, flags, incorrectTs, srPenaltyForAgeGroup(currentPerf?.ageGroup ?? ''), currentPerf?.missingIndividualSR ?? false)
  const ejScoreVal = calcEJScore(deductions)
  const allSubmitted = (!hasDJ || djSubmitted !== null) && (!hasEJ || ejSubmitted !== null) && (!hasAJ || ajSubmitted !== null)

  function handleDJSubmit(difficulty: number, penalty: number) {
    const val = { difficulty, penalty }
    setDjSubmitted(val)
    onDJSubmit?.(difficulty, penalty, { djFlags: flags, djExtraElements: extraElements, djIncorrectTs: incorrectTs })
  }

  function handleEJSubmit(score: number) {
    setEjSubmitted(score)
    onEJSubmit?.(score, { ejDeductions: deductions, ejExtraElements: extraElements })
  }

  function handleDJEJSubmit() {
    const djVal = { difficulty: djDiff, penalty: djPen }
    setDjSubmitted(djVal)
    setEjSubmitted(ejScoreVal)
    onDJSubmit?.(djDiff, djPen, { djFlags: flags, djExtraElements: extraElements, djIncorrectTs: incorrectTs })
    onEJSubmit?.(ejScoreVal, { ejDeductions: deductions, ejExtraElements: extraElements })
  }

  function handleAJSubmit(score: number) {
    setAjSubmitted(score)
    onAJSubmit?.(score)
  }

  // ── waiting ──
  if (!currentPerf) return <WaitingScreen lang={lang} />

  // ── all submitted ──
  if (allSubmitted) {
    const scores = [
      ...(hasDJ && djSubmitted ? [{ label: t.difficultyTotal, value: djSubmitted.difficulty, color: 'text-slate-800', decimals: 2 }] : []),
      ...(hasDJ && djSubmitted && djSubmitted.penalty > 0 ? [{ label: t.djPenalty, value: -djSubmitted.penalty, color: 'text-red-500', decimals: 1, neg: true }] : []),
      ...(hasEJ && ejSubmitted !== null ? [{ label: t.ejScore, value: ejSubmitted, color: 'text-sky-600', decimals: 1 }] : []),
      ...(hasAJ && ajSubmitted !== null ? [{ label: t.ajScore, value: ajSubmitted, color: 'text-blue-600', decimals: 2 }] : []),
    ]
    return (
      <div className="overflow-y-auto pb-8 max-w-xl mx-auto">
        <ScoringPerformanceHeader perf={currentPerf} lang={lang} rounded={false} />
        <div className="px-4 flex flex-col items-center text-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium uppercase tracking-wide text-sm">{t.submitted}</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {scores.map((s, i) => (
              <>
                {i > 0 && <div key={`d${i}`} className="w-px h-8 bg-slate-200" />}
                <div key={s.label} className="text-center">
                  <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold tabular-nums ${s.color}`}>
                    {(s as { neg?: boolean }).neg ? `−${Math.abs(s.value).toFixed(s.decimals)}` : s.value.toFixed(s.decimals)}
                  </p>
                </div>
              </>
            ))}
          </div>
        </div>
        {waitingForOtherScores && (
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-4">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.65-3.65L20 7M4 17l1.35 1.65A9 9 0 0020 15" />
            </svg>
            <p className="text-sm">{t.waiting}</p>
          </div>
        )}
      </div>
    )
  }

  // Tab definitions
  const mobileTabs = [
    ...(combineDJEJ ? [{ id: 'djej', label: `${t.dj}+${t.ej}`, submitted: djSubmitted !== null && ejSubmitted !== null }] : [
      ...(hasDJ ? [{ id: 'dj', label: t.dj, submitted: djSubmitted !== null }] : []),
      ...(hasEJ ? [{ id: 'ej', label: t.ej, submitted: ejSubmitted !== null }] : []),
    ]),
    ...(hasAJ ? [{ id: 'aj', label: t.aj, submitted: ajSubmitted !== null }] : []),
  ]

  const tabletTabs = [
    ...(combineDJEJ ? [{ id: 'djej', label: `${t.dj} + ${t.ej}`, submitted: djSubmitted !== null && ejSubmitted !== null }] : [
      ...(hasDJ ? [{ id: 'dj', label: t.dj, submitted: djSubmitted !== null }] : []),
      ...(hasEJ ? [{ id: 'ej', label: t.ej, submitted: ejSubmitted !== null }] : []),
    ]),
    ...(hasAJ ? [{ id: 'aj', label: t.aj, submitted: ajSubmitted !== null }] : []),
  ]

  const allElemsInOrder = [...elements, ...extraElements]
  const noElementsNote = t.submitted

  const djEJCombinedContent = (
    djSubmitted !== null && ejSubmitted !== null ? (
      <SubmittedDJCard dj={djSubmitted} lang={lang} />
    ) : (
      <div className="px-4 space-y-2 pb-4">
        <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 mb-2">
          <button onClick={toggleIncorrectTs} className="flex items-start gap-3 w-full text-left">
            <div className={['w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center', incorrectTs ? 'bg-red-500 border-red-500' : 'border-slate-300'].join(' ')}>
              {incorrectTs && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className={['text-sm font-medium', incorrectTs ? 'text-red-700' : 'text-slate-600'].join(' ')}>TS incorrecta <span className="font-normal text-xs ml-1">−0.3</span></span>
          </button>
        </div>
        {allElemsInOrder.map((el) => (
          <CombinedElementRow key={el.id} element={el} flags={flags} deductions={deductions} lang={lang}
            onFlagChange={handleFlagChange} onLock={handleLock} onOpenRetry={handleOpenRetry}
            isExtra={el.id.startsWith('extra-')} onLabelChange={handleLabelChange} onTypeChange={handleTypeChange as never} />
        ))}
        <button onClick={handleAddElement} className="w-full py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 hover:border-slate-300 transition-all">
          + {lang === 'es' ? 'Añadir elemento no listado' : 'Add unlisted element'}
        </button>
        <button onClick={handleDJEJSubmit} className="w-full py-4 rounded-2xl font-bold text-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all">
          {t.submit} · D {djDiff.toFixed(2)} −{djPen.toFixed(1)} E {ejScoreVal.toFixed(1)}
        </button>
      </div>
    )
  )

  const pdfPanel = currentPerf.tsUrl ? (
    <iframe src={currentPerf.tsUrl} className="flex-1 rounded-2xl border border-slate-200 bg-white min-h-0" title="TS" />
  ) : (
    <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white text-slate-400 min-h-0">
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <p className="text-sm">{lang === 'es' ? 'PDF TS' : 'Tariff Sheet PDF'}</p>
    </div>
  )

  function renderTabContent(tabId: string, forTablet = false) {
    if (tabId === 'djej') return combineDJEJ ? djEJCombinedContent : null

    if (tabId === 'dj') {
      if (djSubmitted) return forTablet ? (
        <div className="flex flex-col items-center gap-3 flex-1 justify-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center"><p className="text-xs text-slate-400 mb-1">{t.difficultyTotal}</p><p className="text-2xl font-bold text-slate-800 tabular-nums">{djSubmitted.difficulty.toFixed(2)}</p></div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center"><p className="text-xs text-slate-400 mb-1">{t.djPenalty}</p><p className="text-2xl font-bold text-red-500 tabular-nums">−{djSubmitted.penalty.toFixed(1)}</p></div>
          </div>
        </div>
      ) : <SubmittedDJCard dj={djSubmitted} lang={lang} />
      if (djMode === 'keyboard') return <DJDualKeypad lang={lang} onSubmit={handleDJSubmit} />
      return (
        <>
          {forTablet && (
            <>
              <button onClick={toggleIncorrectTs} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 mb-2">
                <div className={['w-4 h-4 rounded border', incorrectTs ? 'bg-red-500 border-red-500' : 'border-slate-300'].join(' ')} />
                TS incorrecta <span className="text-xs ml-1">−0.3</span>
              </button>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                {allElemsInOrder.map((el) => (
                  <div key={el.id}>EL</div>
                ))}
              </div>
              <button onClick={() => handleDJSubmit(djDiff, djPen)} className="w-full py-4 rounded-2xl font-bold text-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all">
                {t.submit} · D {djDiff.toFixed(2)} −{djPen.toFixed(1)}
              </button>
            </>
          )}
          {!forTablet && (
            <PhoneDJElementsList
              lang={lang} elements={elements} extraElements={extraElements}
              flags={flags} incorrectTs={incorrectTs} ageGroup={currentPerf?.ageGroup ?? ''} missingIndividualSR={currentPerf?.missingIndividualSR ?? false}
              onFlagChange={handleFlagChange} onOpenRetry={handleOpenRetry}
              onAddElement={handleAddElement} onLabelChange={handleLabelChange}
              onTypeChange={handleTypeChange as never}
              onToggleIncorrectTs={toggleIncorrectTs}
              onSubmit={handleDJSubmit}
            />
          )}
        </>
      )
    }

    if (tabId === 'ej') {
      if (ejSubmitted !== null) return <SubmittedScoreCard label={t.ejScore} score={ejSubmitted} color="text-sky-600" decimals={1} />
      if (ejMode === 'keyboard') return <EJKeypad lang={lang} onSubmit={handleEJSubmit} />
      const ejItems = ejOrdredAll.map((el, idx) => {
        const isExtra = el.id.startsWith('extra-')
        const isDragging = ejDragId === el.id
        const isDropTarget = ejDragId !== null && ejDragId !== el.id && ejDropIdx === idx
        return (
          <div key={el.id}
            draggable={isExtra}
            onDragStart={isExtra ? (e) => { e.dataTransfer.effectAllowed = 'move'; ejDragRef.current = el.id; ejSetDragId(el.id) } : undefined}
            onDragEnd={() => { ejDragRef.current = null; ejSetDragId(null); ejSetDropIdx(null) }}
            onDragOver={(e) => { e.preventDefault(); if (ejDragRef.current) ejSetDropIdx(idx) }}
            onDrop={(e) => { e.preventDefault(); if (ejDragRef.current) ejHandleReorder(ejDragRef.current, idx) }}
            className={[isExtra ? 'cursor-grab' : '', isDragging ? 'opacity-40' : '', isDropTarget ? 'ring-2 ring-blue-400 ring-offset-1 rounded-xl' : ''].join(' ')}>
            <EJElementRow element={el} deductions={deductions} lang={lang} onLock={handleLock}
              onLabelChange={isExtra ? ejHandleLabelChange : undefined} />
          </div>
        )
      })
      return (
        <div className={forTablet ? 'flex-1 overflow-y-auto space-y-2 pr-1 min-h-0' : 'px-4 space-y-2 pb-4'}>
          {ejItems}
          <button onClick={ejHandleAddElement} className="w-full py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 hover:border-slate-300 transition-all">
            + {lang === 'es' ? 'Añadir elemento no listado' : 'Add unlisted element'}
          </button>
          <button onClick={() => handleEJSubmit(ejScoreVal)} className="w-full py-4 rounded-2xl font-bold text-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white transition-all">
            {t.submit} · E {ejScoreVal.toFixed(1)}
          </button>
        </div>
      )
    }

    if (tabId === 'aj') {
      if (ajSubmitted !== null) return <SubmittedScoreCard label={t.ajScore} score={ajSubmitted} color="text-blue-600" decimals={2} />
      return (
        <div className={forTablet ? 'flex-1 overflow-y-auto min-h-0' : 'overflow-y-auto'}>
          <AJScoringPanel lang={lang} perfId={currentPerf!.id} onSubmit={handleAJSubmit} />
        </div>
      )
    }
    return null
  }

  return (
    <div className="md:h-full">
      <div className="md:hidden"><ScoringPerformanceHeader perf={currentPerf} lang={lang} rounded={false} /></div>

      {/* phone */}
      <div className="md:hidden">
        <RoleTabBar tabs={mobileTabs} activeTab={tab} onChange={setTab} />
        {renderTabContent(tab)}
      </div>

      {/* tablet */}
      <div className="hidden md:block h-full px-4 pb-4">
        <div className="flex gap-4 h-full">
          {pdfPanel}
          <div className="w-[480px] flex flex-col gap-3 min-h-0">
            <div className="bg-slate-800 text-white px-4 py-3 rounded-xl shrink-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
                  #{currentPerf.position} · {currentPerf.ageGroup} · {currentPerf.category} · {currentPerf.routineType}
                </span>
                <div className="flex items-center gap-3 text-sm font-bold tabular-nums">
                  {hasDJ && <span className="text-emerald-400">D {djDiff.toFixed(2)}</span>}
                  {hasDJ && djPen > 0 && <span className="text-red-400">−{djPen.toFixed(1)}</span>}
                  {hasEJ && <span className="text-sky-300">E {ejScoreVal.toFixed(1)}</span>}
                  {hasAJ && ajSubmitted !== null && <span className="text-blue-300">A {ajSubmitted.toFixed(2)}</span>}
                </div>
              </div>
              <p className="text-lg font-semibold leading-tight">{currentPerf.gymnasts}</p>
            </div>

            <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1 shrink-0">
              {tabletTabs.map((tabDef) => (
                <button key={tabDef.id} onClick={() => setTabletTab(tabDef.id)}
                  className={['flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
                    tabletTab === tabDef.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
                  {tabDef.label}
                  {tabDef.submitted && <CheckIcon />}
                </button>
              ))}
            </div>

            {renderTabContent(tabletTab, true)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── main export ──────────────────────────────────────────────────────────────

export default function ScoringView(props: ScoringViewProps) {
  const { roles, lang } = props
  const hasCJP = roles.includes('CJP')
  const hasDJ = roles.includes('DJ')
  const hasEJ = roles.includes('EJ')

  // Hooks always called (React rules). Values used conditionally based on roles.
  const perfId = hasCJP
    ? (props.currentPerfId ?? null)
    : (props.currentPerf?.id ?? null)

  const djScoring = useDJScoring(props.elements ?? [], perfId)
  const ejScoring = useEJScoring(props.elements ?? [], hasCJP ? null : (props.currentPerf?.id ?? null))
  const { penaltyStates, getPenaltyState, setPenaltyState, clearPenaltyState } = usePenaltyStates()

  // Solo roles → delegate to existing standalone view implementations
  if (roles.length === 1) {
    if (hasCJP) {
      return (
        <CJPView
          isCJP={true} lang={lang}
          panelJudges={props.panelJudges ?? []}
          performances={props.performances ?? []}
          rankingPerformances={props.rankingPerformances}
          currentPerfId={props.currentPerfId ?? null}
          judgeScores={props.judgeScores ?? {}}
          results={props.results ?? {}}
          onOpen={props.onOpen ?? (() => {})}
          onSkip={props.onSkip ?? (() => {})}
          onSubmit={props.onCJPSubmit ?? (() => {})}
          onReopenScore={props.onReopenScore ?? (() => {})}
          onUnpublishResult={props.onUnpublishResult}
          onEditScore={props.onEditScore}
        />
      )
    }
    if (hasDJ) {
      return (
        <DJView
          currentPerf={props.currentPerf ?? null}
          lang={lang}
          elements={props.elements ?? []}
          mode={props.djMode ?? 'elements'}
          onSubmit={props.onDJSubmit}
          waitingForOtherScores={props.waitingForOtherScores}
          judgeScores={props.singleJudgeScores}
          panelJudges={props.panelJudges}
          result={props.result}
        />
      )
    }
    if (hasEJ) {
      return (
        <EJView
          currentPerf={props.currentPerf ?? null}
          lang={lang}
          elements={props.elements ?? []}
          mode={props.ejMode ?? 'elements'}
          onSubmit={props.onEJSubmit}
          mySubmittedScore={props.mySubmittedEJScore ?? null}
          waitingForOtherScores={props.waitingForOtherScores}
          judgeScores={props.singleJudgeScores}
          panelJudges={props.panelJudges}
          result={props.result}
        />
      )
    }
    // AJ
    return (
      <AJView
        currentPerf={props.currentPerf ?? null}
        lang={lang}
        onSubmit={props.onAJSubmit}
        waitingForOtherScores={props.waitingForOtherScores}
        judgeScores={props.singleJudgeScores}
        panelJudges={props.panelJudges}
        result={props.result}
      />
    )
  }

  // CJP-containing multi-role → CJPLayout
  if (hasCJP) {
    return (
      <CJPLayout
        roles={roles} lang={lang}
        performances={props.performances ?? []}
        rankingPerformances={props.rankingPerformances}
        currentPerfId={props.currentPerfId ?? null}
        panelJudges={props.panelJudges ?? []}
        judgeScores={props.judgeScores ?? {}}
        results={props.results ?? {}}
        elements={props.elements ?? []}
        djMode={props.djMode ?? 'elements'}
        ejMode={props.ejMode ?? 'elements'}
        onOpen={props.onOpen ?? (() => {})}
        onSkip={props.onSkip}
        onCJPSubmit={props.onCJPSubmit ? (status, result, penaltyDetail) => {
          if (props.currentPerfId) clearPenaltyState(props.currentPerfId)
          props.onCJPSubmit!(status, result, penaltyDetail)
        } : undefined}
        onReopenScore={props.onReopenScore}
        onUnpublishResult={props.onUnpublishResult}
        onEditScore={props.onEditScore}
        onSubmitDJScore={props.onSubmitDJScore}
        onSubmitEJScore={props.onSubmitEJScore}
        onSubmitAJScore={props.onSubmitAJScore}
        flags={djScoring.flags}
        extraElements={djScoring.extraElements}
        incorrectTs={djScoring.incorrectTs}
        deductions={djScoring.deductions}
        handleFlagChange={djScoring.handleFlagChange}
        handleLock={djScoring.handleLock}
        handleOpenRetry={djScoring.handleOpenRetry}
        handleAddElement={djScoring.handleAddElement}
        handleLabelChange={djScoring.handleLabelChange}
        handleTypeChange={djScoring.handleTypeChange as (id: string, type: string, isStatic?: boolean) => void}
        toggleIncorrectTs={djScoring.toggleIncorrectTs}
        penaltyStates={penaltyStates}
        getPenaltyState={getPenaltyState}
        setPenaltyState={setPenaltyState}
      />
    )
  }

  // Non-CJP multi-role
  const ejData = hasDJ ? djScoring : ejScoring
  return (
    <NonCJPMultiView
      roles={roles} lang={lang}
      currentPerf={props.currentPerf ?? null}
      elements={props.elements ?? []}
      djMode={props.djMode ?? 'elements'}
      ejMode={props.ejMode ?? 'elements'}
      flags={djScoring.flags}
      extraElements={djScoring.extraElements}
      incorrectTs={djScoring.incorrectTs}
      deductions={ejData.deductions}
      handleFlagChange={djScoring.handleFlagChange}
      handleLock={ejData.handleLock}
      handleOpenRetry={djScoring.handleOpenRetry}
      handleAddElement={djScoring.handleAddElement}
      handleLabelChange={djScoring.handleLabelChange}
      handleTypeChange={djScoring.handleTypeChange as (id: string, type: string, isStatic?: boolean) => void}
      toggleIncorrectTs={djScoring.toggleIncorrectTs}
      ejOrdredAll={ejScoring.orderedAll}
      ejDragId={ejScoring.dragId}
      ejDropIdx={ejScoring.dropIdx}
      ejDragRef={ejScoring.dragRef}
      ejSetDragId={ejScoring.setDragId}
      ejSetDropIdx={ejScoring.setDropIdx}
      ejHandleReorder={ejScoring.handleReorder}
      ejHandleAddElement={ejScoring.handleAddElement}
      ejHandleLabelChange={ejScoring.handleLabelChange}
      onDJSubmit={props.onDJSubmit}
      onEJSubmit={props.onEJSubmit}
      onAJSubmit={props.onAJSubmit}
      myDJSubmittedScore={props.myDJSubmittedScore}
      myEJSubmittedScore={props.myEJSubmittedScore}
      myAJSubmittedScore={props.myAJSubmittedScore}
      waitingForOtherScores={props.waitingForOtherScores}
      result={props.result}
      singleJudgeScores={props.singleJudgeScores}
    />
  )
}
