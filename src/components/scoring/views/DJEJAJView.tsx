'use client'

import { useState, useEffect, useRef } from 'react'
import type { Performance, Lang } from '../types'
import type { TsElement, ElementType, Deductions } from '../types'
import type { ElementFlag, ElementFlags } from '../types'
import type { PanelJudge, JudgeScore, RoutineResult, ScoreDetail } from '../types'
import { ScoreGrid } from '../../shared/CJPTabletShell'
import { calcDJTotals, IncorrectTsToggle, DualKeypad, PhoneDJElementsList } from '../../shared/DJElementsShared'
import { calcEJScore, EJKeypad, EJElementRow, CombinedElementRow } from '../../shared/DJEJElementsShared'
import AJScoringPanel from '../../shared/AJScoringPanel'
import CheckIcon from '../../shared/CheckIcon'
import { useDJScoring } from '@/hooks/useDJScoring'
import { ScoringPerformanceHeader } from '../../shared/ScoringPerformanceHeader'
import { RoleTabBar } from '../../shared/RoleTabBar'
import { SubmittedScoreCard } from '../../shared/SubmittedScoreCard'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    waiting: 'Waiting for performance…',
    waitingSub: 'The panel chief has not opened a routine yet.',
    dj: 'DJ',
    ej: 'EJ',
    aj: 'AJ',
    djTab: 'DJ — Difficulty',
    ejTab: 'EJ — Execution',
    ajTab: 'AJ — Score',
    submitted: 'Scores submitted',
    difficultyTotal: 'Difficulty',
    djPenalty: 'DJ Penalty',
    ejScore: 'EJ Score',
    ajScore: 'AJ Score',
    pdfPlaceholder: 'Tariff Sheet PDF',
    pdfNote: 'PDF will appear here once uploaded',
    submit: 'Submit',
    addElement: '+ Add unlisted element',
    noElements: 'No elements in tariff sheet',
    noElementsNote: 'You can submit immediately',
  },
  es: {
    waiting: 'Esperando actuación…',
    waitingSub: 'El juez coordinador no ha abierto ninguna rutina todavía.',
    dj: 'DJ',
    ej: 'EJ',
    aj: 'AJ',
    djTab: 'DJ — Dificultad',
    ejTab: 'EJ — Ejecución',
    ajTab: 'AJ — Puntuación',
    submitted: 'Puntuaciones enviadas',
    difficultyTotal: 'Dificultad',
    djPenalty: 'Pen. DJ',
    ejScore: 'Nota EJ',
    ajScore: 'Punt. AJ',
    pdfPlaceholder: 'Hoja de tarifa',
    pdfNote: 'El PDF aparecerá aquí una vez subido',
    submit: 'Enviar',
    addElement: '+ Añadir elemento no listado',
    noElements: 'No hay elementos en la hoja de tarifa',
    noElementsNote: 'Puedes enviar directamente',
  },
}

// ─── helper components ────────────────────────────────────────────────────────

function SubmittedDJCard({ dj, lang }: { dj: { difficulty: number; penalty: number }; lang: Lang }) {
  const t = T[lang]
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

// ─── props & main component ───────────────────────────────────────────────────

export type DJEJAJViewProps = {
  currentPerf: Performance | null
  lang: Lang
  elements: TsElement[]
  djMode?: 'elements' | 'keyboard'
  ejMode?: 'elements' | 'keyboard'
  onSubmit?: (djDifficulty: number, djPenalty: number, ejScore: number, ajScore: number, detail: ScoreDetail) => void
  panelJudges?: PanelJudge[]
  judgeScores?: JudgeScore[]
  waitingForOtherScores?: boolean
  result?: RoutineResult | null
  myDJSubmittedScore?: { difficulty: number; penalty: number } | null
  myEJSubmittedScore?: number | null
  myAJSubmittedScore?: number | null
}

export default function DJEJAJView({
  currentPerf, lang, elements, djMode = 'elements', ejMode = 'elements', onSubmit,
  panelJudges, judgeScores, waitingForOtherScores, result,
  myDJSubmittedScore, myEJSubmittedScore, myAJSubmittedScore,
}: DJEJAJViewProps) {
  const t = T[lang]

  const { flags, extraElements, incorrectTs, deductions,
    handleFlagChange, handleLock, handleOpenRetry,
    handleAddElement, handleLabelChange, handleTypeChange,
    toggleIncorrectTs, clearCache } = useDJScoring(elements, currentPerf?.id ?? null)

  // submission
  const [djSubmitted, setDjSubmitted] = useState<{ difficulty: number; penalty: number } | null>(null)
  const [ejSubmitted, setEjSubmitted] = useState<number | null>(null)
  const [ajSubmitted, setAjSubmitted] = useState<number | null>(null)

  // mobile tab (3-tab mode when at least one is keyboard)
  const [tab, setTab] = useState<'dj' | 'ej' | 'aj'>('dj')
  // mobile tab (2-tab combined mode when both are elements)
  const [combinedTab, setCombinedTab] = useState<'djej' | 'aj'>('djej')
  // tablet tab
  const [tabletTab, setTabletTab] = useState<'djej' | 'aj'>('djej')

  const prevPerfId = useRef<string | null>(null)

  useEffect(() => {
    if (currentPerf?.id !== prevPerfId.current) {
      setDjSubmitted(null)
      setEjSubmitted(null)
      setAjSubmitted(null)
      setTab('dj')
      setCombinedTab('djej')
      setTabletTab('djej')
      prevPerfId.current = currentPerf?.id ?? null
    }
  }, [currentPerf?.id])

  // Restore submitted state after page refresh
  useEffect(() => {
    if (myDJSubmittedScore != null) setDjSubmitted(myDJSubmittedScore)
  }, [myDJSubmittedScore]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (myEJSubmittedScore != null) setEjSubmitted(myEJSubmittedScore)
  }, [myEJSubmittedScore]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (myAJSubmittedScore != null) setAjSubmitted(myAJSubmittedScore)
  }, [myAJSubmittedScore]) // eslint-disable-line react-hooks/exhaustive-deps

  function tryFireSubmit(
    dj: typeof djSubmitted, ej: typeof ejSubmitted, aj: typeof ajSubmitted
  ) {
    if (dj && ej !== null && aj !== null) {
      clearCache()
      onSubmit?.(dj.difficulty, dj.penalty, ej, aj, { djFlags: flags, djExtraElements: extraElements, djIncorrectTs: incorrectTs, ejDeductions: deductions, ejExtraElements: extraElements })
    }
  }

  function handleTabletDJEJSubmit() {
    const { difficulty, penalty } = calcDJTotals(elements, extraElements, flags, incorrectTs)
    const ej = calcEJScore(deductions)
    const djVal = { difficulty, penalty }
    setDjSubmitted(djVal)
    setEjSubmitted(ej)
    tryFireSubmit(djVal, ej, ajSubmitted)
  }

  function handleDJSubmit(difficulty: number, penalty: number) {
    const val = { difficulty, penalty }
    setDjSubmitted(val)
    tryFireSubmit(val, ejSubmitted, ajSubmitted)
  }

  function handleEJSubmit(score: number) {
    setEjSubmitted(score)
    tryFireSubmit(djSubmitted, score, ajSubmitted)
  }

  function handleAJSubmit(score: number) {
    setAjSubmitted(score)
    tryFireSubmit(djSubmitted, ejSubmitted, score)
  }

  const { difficulty: djDifficulty, penalty: djPenaltyVal } = calcDJTotals(elements, extraElements, flags, incorrectTs)
  const allElements = [...elements, ...extraElements]
  const allSubmitted = djSubmitted !== null && ejSubmitted !== null && ajSubmitted !== null

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

  // ── all submitted ──
  if (allSubmitted) {
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
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">{t.difficultyTotal}</p>
              <p className="text-3xl font-bold text-slate-800 tabular-nums">{djSubmitted.difficulty.toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">{t.djPenalty}</p>
              <p className="text-3xl font-bold text-red-500 tabular-nums">−{djSubmitted.penalty.toFixed(1)}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">{t.ejScore}</p>
              <p className="text-3xl font-bold text-sky-600 tabular-nums">{ejSubmitted.toFixed(1)}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">{t.ajScore}</p>
              <p className="text-3xl font-bold text-blue-600 tabular-nums">{ajSubmitted.toFixed(2)}</p>
            </div>
          </div>
        </div>
        {judgeScores && panelJudges && (
          <div className="px-4">
            <ScoreGrid scores={judgeScores} panelJudges={panelJudges} lang={lang} locked={true} result={result} onReopen={() => {}} />
          </div>
        )}
      </div>
    )
  }

  // ── scoring ──
  const ejScoreVal = calcEJScore(deductions)
  return (
    <div className="md:h-full">
      <div className="md:hidden"><ScoringPerformanceHeader perf={currentPerf} lang={lang} rounded={false} /></div>

      {/* ── mobile (< md) ── */}
      <div className="md:hidden">
        {djMode === 'elements' && ejMode === 'elements' ? (
          // 2-tab combined mode: DJ+EJ | AJ
          <>
            <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1 mx-4 mb-4">
              {(['djej', 'aj'] as const).map((tabId) => (
                <button key={tabId} onClick={() => setCombinedTab(tabId)}
                  className={['flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
                    combinedTab === tabId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
                  {tabId === 'djej' ? `${t.dj}+${t.ej}` : t.aj}
                  {tabId === 'djej' && djSubmitted !== null && ejSubmitted !== null && <CheckIcon />}
                  {tabId === 'aj' && ajSubmitted !== null && <CheckIcon />}
                </button>
              ))}
            </div>

            {combinedTab === 'djej' && (
              djSubmitted !== null && ejSubmitted !== null ? (
                <SubmittedDJCard dj={djSubmitted} lang={lang} />
              ) : (
                <div className="px-4 space-y-2 pb-4">
                  <IncorrectTsToggle active={incorrectTs} onToggle={toggleIncorrectTs} lang={lang} />
                  {allElements.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <p className="font-medium text-sm">{t.noElements}</p>
                      <p className="text-xs mt-1">{t.noElementsNote}</p>
                    </div>
                  ) : allElements.map((el) => (
                    <CombinedElementRow key={el.id} element={el} flags={flags} deductions={deductions} lang={lang}
                      onFlagChange={handleFlagChange} onLock={handleLock} onOpenRetry={handleOpenRetry}
                      isExtra={el.id.startsWith('extra-')} onLabelChange={handleLabelChange} onTypeChange={handleTypeChange} />
                  ))}
                  <button onClick={handleAddElement} className="w-full py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 hover:border-slate-300 transition-all">
                    {t.addElement}
                  </button>
                  <button onClick={handleTabletDJEJSubmit} className="w-full py-4 rounded-2xl font-bold text-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all">
                    {t.submit} · D {djDifficulty.toFixed(2)}  −{djPenaltyVal.toFixed(1)}  E {ejScoreVal.toFixed(1)}
                  </button>
                </div>
              )
            )}

            {combinedTab === 'aj' && (
              ajSubmitted !== null ? (
                <SubmittedScoreCard label={t.ajScore} score={ajSubmitted} color="text-blue-600" decimals={2} />
              ) : (
                <AJScoringPanel lang={lang} perfId={currentPerf.id} onSubmit={handleAJSubmit} />
              )
            )}
          </>
        ) : (
          // 3-tab mode when at least one is keyboard: DJ | EJ | AJ
          <>
            <RoleTabBar
              tabs={[
                { id: 'dj', label: t.dj, submitted: djSubmitted !== null },
                { id: 'ej', label: t.ej, submitted: ejSubmitted !== null },
                { id: 'aj', label: t.aj, submitted: ajSubmitted !== null },
              ]}
              activeTab={tab}
              onChange={(id) => setTab(id as 'dj' | 'ej' | 'aj')}
            />

            {tab === 'dj' && (
              djSubmitted ? (
                <SubmittedDJCard dj={djSubmitted} lang={lang} />
              ) : djMode === 'keyboard' ? (
                <DualKeypad lang={lang} onSubmit={handleDJSubmit} />
              ) : (
                <PhoneDJElementsList
                  lang={lang} elements={elements} extraElements={extraElements}
                  flags={flags} incorrectTs={incorrectTs}
                  onFlagChange={handleFlagChange} onOpenRetry={handleOpenRetry}
                  onAddElement={handleAddElement} onLabelChange={handleLabelChange}
                  onTypeChange={handleTypeChange}
                  onToggleIncorrectTs={toggleIncorrectTs}
                  onSubmit={handleDJSubmit}
                />
              )
            )}

            {tab === 'ej' && (
              ejSubmitted !== null ? (
                <SubmittedScoreCard label={t.ejScore} score={ejSubmitted} color="text-sky-600" decimals={1} />
              ) : ejMode === 'keyboard' ? (
                <EJKeypad lang={lang} onSubmit={handleEJSubmit} />
              ) : (
                <div className="px-4 space-y-2 pb-4">
                  {allElements.map((el) => (
                    <EJElementRow key={el.id} element={el} deductions={deductions} lang={lang} onLock={handleLock}
                      onLabelChange={el.id.startsWith('extra-') ? handleLabelChange : undefined} />
                  ))}
                  <button onClick={() => handleEJSubmit(calcEJScore(deductions))}
                    className="w-full py-4 rounded-2xl font-bold text-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white transition-all">
                    {t.submit} · {t.ejScore} {calcEJScore(deductions).toFixed(1)}
                  </button>
                </div>
              )
            )}

            {tab === 'aj' && (
              ajSubmitted !== null ? (
                <SubmittedScoreCard label={t.ajScore} score={ajSubmitted} color="text-blue-600" decimals={2} />
              ) : (
                <AJScoringPanel lang={lang} perfId={currentPerf.id} onSubmit={handleAJSubmit} />
              )
            )}
          </>
        )}
      </div>

      {/* ── tablet / desktop (md+): PDF viewer + right panel with tabs ── */}
      <div className="hidden md:block h-full px-4 pb-4">
        <div className="flex gap-4 h-full">
          {/* TS PDF */}
          {currentPerf.tsUrl ? (
            <iframe src={currentPerf.tsUrl} className="flex-1 rounded-2xl border border-slate-200 bg-white min-h-0" title={t.pdfPlaceholder} />
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

          {/* right panel */}
          <div className="w-[480px] flex flex-col gap-3 min-h-0">
            {/* performance header with live scores */}
            <div className="bg-slate-800 text-white px-4 py-3 rounded-xl">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
                  #{currentPerf.position} · {currentPerf.ageGroup} · {currentPerf.category} · {currentPerf.routineType}
                </span>
                <div className="flex items-center gap-3 text-sm font-bold tabular-nums">
                  <span className="text-emerald-400">D {djDifficulty.toFixed(2)}</span>
                  {djPenaltyVal > 0 && <span className="text-red-400">−{djPenaltyVal.toFixed(1)}</span>}
                  <span className="text-sky-300">E {ejScoreVal.toFixed(1)}</span>
                  {ajSubmitted !== null && <span className="text-blue-300">A {ajSubmitted.toFixed(2)}</span>}
                </div>
              </div>
              <p className="text-lg font-semibold leading-tight">{currentPerf.gymnasts}</p>
            </div>

            {/* tab bar: DJ+EJ | AJ */}
            <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1">
              {(['djej', 'aj'] as const).map((tid) => (
                <button key={tid} onClick={() => setTabletTab(tid)}
                  className={['flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
                    tabletTab === tid ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
                  {tid === 'djej' ? `${t.dj} + ${t.ej}` : t.aj}
                  {tid === 'djej' && djSubmitted !== null && ejSubmitted !== null && <CheckIcon />}
                  {tid === 'aj' && ajSubmitted !== null && <CheckIcon />}
                </button>
              ))}
            </div>

            {/* DJ+EJ tab content */}
            {tabletTab === 'djej' && (
              djSubmitted !== null && ejSubmitted !== null ? (
                <div className="flex flex-col items-center gap-3 flex-1 justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center"><p className="text-xs text-slate-400 mb-1">{t.difficultyTotal}</p><p className="text-2xl font-bold text-slate-800 tabular-nums">{djSubmitted.difficulty.toFixed(2)}</p></div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="text-center"><p className="text-xs text-slate-400 mb-1">{t.djPenalty}</p><p className="text-2xl font-bold text-red-500 tabular-nums">−{djSubmitted.penalty.toFixed(1)}</p></div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="text-center"><p className="text-xs text-slate-400 mb-1">{t.ejScore}</p><p className="text-2xl font-bold text-sky-600 tabular-nums">{ejSubmitted.toFixed(1)}</p></div>
                  </div>
                </div>
              ) : (
                <>
                  <IncorrectTsToggle active={incorrectTs} onToggle={toggleIncorrectTs} lang={lang} />
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                    {allElements.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <p className="font-medium text-sm">{t.noElements}</p>
                        <p className="text-xs mt-1">{t.noElementsNote}</p>
                      </div>
                    ) : allElements.map((el) => (
                      <CombinedElementRow key={el.id} element={el} flags={flags} deductions={deductions} lang={lang}
                        onFlagChange={handleFlagChange} onLock={handleLock} onOpenRetry={handleOpenRetry}
                        isExtra={el.id.startsWith('extra-')} onLabelChange={handleLabelChange} onTypeChange={handleTypeChange} />
                    ))}
                    <button onClick={handleAddElement} className="w-full py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 hover:border-slate-300 transition-all">
                      {t.addElement}
                    </button>
                  </div>
                  <button onClick={handleTabletDJEJSubmit} className="w-full py-4 rounded-2xl font-bold text-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all">
                    {t.submit} · D {djDifficulty.toFixed(2)}  −{djPenaltyVal.toFixed(1)}  E {ejScoreVal.toFixed(1)}
                  </button>
                </>
              )
            )}

            {/* AJ tab content */}
            {tabletTab === 'aj' && (
              ajSubmitted !== null ? (
                <SubmittedScoreCard label={t.ajScore} score={ajSubmitted} color="text-blue-600" decimals={2} />
              ) : (
                <div className="flex-1 overflow-y-auto min-h-0">
                  <AJScoringPanel lang={lang} perfId={currentPerf.id} onSubmit={handleAJSubmit} />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
