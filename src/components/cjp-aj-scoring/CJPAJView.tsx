'use client'

import { useState, useEffect, useRef } from 'react'
import type { Performance, Lang } from '../aj-scoring/types'
import type { PanelJudge, MockPerf, JudgeScore, RoutineResult, PenaltyState } from '../cjp/types'
import { calcCjpPenalty, DEFAULT_PENALTY } from '../cjp/types'
import { PenaltyPanel } from '../shared/CJPPenaltyPanel'
import AJScoringPanel from '../shared/AJScoringPanel'
import CJPTabletShell from '../shared/CJPTabletShell'
import CheckIcon from '../shared/CheckIcon'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    waiting: 'Waiting for performance…',
    waitingSub: 'The panel chief has not opened a routine yet.',
    cjpTab: 'CJP — Penalties',
    ajTab: 'AJ — Score',
    cjpPenalty: 'CJP Penalty',
    submit: 'Submit',
    submitted: 'Scores submitted',
    balance: 'Balance',
    dynamic: 'Dynamic',
    combined: 'Combined',
  },
  es: {
    waiting: 'Esperando actuación…',
    waitingSub: 'El juez coordinador no ha abierto ninguna rutina todavía.',
    cjpTab: 'CJP — Penalizaciones',
    ajTab: 'AJ — Puntuación',
    cjpPenalty: 'Pen. CJP',
    submit: 'Enviar',
    submitted: 'Puntuaciones enviadas',
    balance: 'Balance',
    dynamic: 'Dinámico',
    combined: 'Combinado',
  },
}

// ─── performance header (phone) ───────────────────────────────────────────────

function PerformanceHeader({ perf, lang, ajScore, cjpPenalty }: {
  perf: Performance
  lang: Lang
  ajScore: number | null
  cjpPenalty: number
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
          {ajScore !== null && <span className="text-blue-300">A {ajScore.toFixed(2)}</span>}
          {cjpPenalty > 0 && <span className="text-orange-400">−{cjpPenalty.toFixed(1)}</span>}
        </div>
      </div>
      <p className="text-lg font-semibold leading-tight">{perf.gymnasts}</p>
    </div>
  )
}

// ─── phone view (2 tabs) ──────────────────────────────────────────────────────

function PhoneView({ perf, lang, penaltyState, onPenaltyChange, onSubmit }: {
  perf: Performance
  lang: Lang
  penaltyState: PenaltyState
  onPenaltyChange: (p: PenaltyState) => void
  onSubmit: (ajScore: number, cjpPenalty: number) => void
}) {
  const t = T[lang]
  const [tab, setTab] = useState<'cjp' | 'aj'>('cjp')
  const [ajScore, setAjScore] = useState<number | null>(null)
  const [cjpSubmitted, setCjpSubmitted] = useState(false)
  const cjpPenalty = calcCjpPenalty(penaltyState)

  function handleAJSubmit(score: number) {
    setAjScore(score)
    if (cjpSubmitted) {
      onSubmit(score, calcCjpPenalty(penaltyState))
    }
  }

  function handleCJPSubmit() {
    setCjpSubmitted(true)
    if (ajScore !== null) {
      onSubmit(ajScore, calcCjpPenalty(penaltyState))
    }
  }

  return (
    <div>
      {/* performance header */}
      <div className="px-4 mb-4">
        <PerformanceHeader perf={perf} lang={lang} ajScore={ajScore} cjpPenalty={cjpSubmitted ? cjpPenalty : 0} />
      </div>

      {/* tab switcher */}
      <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1 mx-4 mb-4">
        {(['cjp', 'aj'] as const).map((tabId) => (
          <button key={tabId} onClick={() => setTab(tabId)}
            className={['flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5',
              tab === tabId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
            {tabId === 'cjp' ? t.cjpTab : t.ajTab}
            {tabId === 'cjp' && cjpSubmitted && <CheckIcon />}
            {tabId === 'aj' && ajScore !== null && <CheckIcon />}
          </button>
        ))}
      </div>

      {tab === 'cjp' ? (
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
            {ajScore === null && (
              <button onClick={() => setTab('aj')} className="mt-2 w-full py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all">
                {t.ajTab} →
              </button>
            )}
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
      ) : (
        ajScore !== null ? (
          <div className="px-4 pb-8 flex flex-col items-center gap-4 pt-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{t.submitted}</p>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">{t.ajTab}</p>
              <p className="text-4xl font-bold text-slate-800 tabular-nums">{ajScore.toFixed(2)}</p>
            </div>
            {!cjpSubmitted && (
              <button onClick={() => setTab('cjp')} className="mt-2 w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all">
                ← {t.cjpTab}
              </button>
            )}
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
  penaltyStates, onPenaltyChange, onOpen, onSkip, onSubmitAJScore, onSubmit, onReopenScore, onEditScore,
}: {
  lang: Lang
  performances: MockPerf[]
  currentPerfId: string | null
  panelJudges: PanelJudge[]
  judgeScores: Record<string, JudgeScore[]>
  results: Record<string, RoutineResult>
  penaltyStates: Record<string, PenaltyState>
  onPenaltyChange: (perfId: string, p: PenaltyState) => void
  onOpen: (perfId: string) => void
  onSkip?: (perfId: string) => void
  onSubmitAJScore?: (perfId: string, score: number) => void
  onSubmit?: (status: 'provisional' | 'approved', result: RoutineResult) => void
  onReopenScore?: (perfId: string, panelJudgeId: string | 'all') => void
  onEditScore?: (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
}) {
  const t = T[lang]
  const [rightTab, setRightTab] = useState<'cjp' | 'aj'>('cjp')
  const [ajScoreSubmitted, setAjScoreSubmitted] = useState<Record<string, boolean>>({})

  function handleAJSubmit(perfId: string, score: number) {
    setAjScoreSubmitted((prev) => ({ ...prev, [perfId]: true }))
    onSubmitAJScore?.(perfId, score)
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
        const isAJSubmitted = activePerfId ? !!ajScoreSubmitted[activePerfId] : false

        return (
          <>
            {/* tab header */}
            <div className="px-3 pt-2.5 pb-0 border-b border-slate-200 shrink-0">
              <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1">
                <button onClick={() => setRightTab('cjp')}
                  className={['flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all', rightTab === 'cjp' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
                  {t.cjpTab}
                </button>
                <button onClick={() => setRightTab('aj')}
                  className={['flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1', rightTab === 'aj' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
                  {t.ajTab}
                  {isAJSubmitted && (
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
                  <PenaltyPanel
                    state={penalty}
                    onChange={(p) => onPenaltyChange(activePerfId, p)}
                    lang={lang}
                  />
                ) : (
                  <div className="flex items-center justify-center h-32 text-slate-300 text-sm">{t.waiting}</div>
                )
              ) : !activePerfId ? (
                <div className="flex items-center justify-center h-32 text-slate-300 text-sm">{t.waiting}</div>
              ) : (
                <div className="py-3">
                  <AJScoringPanel
                    lang={lang}
                    perfId={activePerfId}
                    onSubmit={(score) => handleAJSubmit(activePerfId, score)}
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

export type CJPAJViewProps = {
  lang: Lang
  performances: MockPerf[]
  currentPerfId: string | null
  panelJudges: PanelJudge[]
  judgeScores: Record<string, JudgeScore[]>
  results: Record<string, RoutineResult>
  onOpen: (perfId: string) => void
  onSkip?: (perfId: string) => void
  onSubmitAJScore?: (perfId: string, score: number) => void
  onSubmit?: (status: 'provisional' | 'approved', result: RoutineResult) => void
  onReopenScore?: (perfId: string, panelJudgeId: string | 'all') => void
  onEditScore?: (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
  onPhoneSubmit?: (ajScore: number, cjpPenalty: number) => void
}

export default function CJPAJView({
  lang, performances, currentPerfId, panelJudges, judgeScores, results,
  onOpen, onSkip, onSubmitAJScore, onSubmit, onReopenScore, onEditScore, onPhoneSubmit,
}: CJPAJViewProps) {
  const [penaltyStates, setPenaltyStates] = useState<Record<string, PenaltyState>>({})

  const currentPerf = performances.find((p) => p.id === currentPerfId) ?? null

  function getPenaltyState(perfId: string): PenaltyState {
    return penaltyStates[perfId] ?? DEFAULT_PENALTY
  }
  function setPenaltyState(perfId: string, p: PenaltyState) {
    setPenaltyStates((prev) => ({ ...prev, [perfId]: p }))
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
        ) : (
          <PhoneView
            perf={currentPerf as Performance}
            lang={lang}
            penaltyState={currentPenaltyState}
            onPenaltyChange={(p) => currentPerfId && setPenaltyState(currentPerfId, p)}
            onSubmit={(ajScore, cjpPenalty) => onPhoneSubmit?.(ajScore, cjpPenalty)}
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
          penaltyStates={penaltyStates}
          onPenaltyChange={setPenaltyState}
          onOpen={onOpen}
          onSkip={onSkip}
          onSubmitAJScore={onSubmitAJScore}
          onSubmit={onSubmit}
          onReopenScore={onReopenScore}
          onEditScore={onEditScore}
        />
      </div>
    </>
  )
}
