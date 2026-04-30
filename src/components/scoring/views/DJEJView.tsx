'use client'

import { useState, useEffect, useRef } from 'react'
import { useDJScoring } from '@/hooks/useDJScoring'
import type { Performance, Lang } from '../types'
import type { TsElement, Deductions } from '../types'
import type { ElementFlags } from '../types'
import type { PanelJudge, JudgeScore, RoutineResult, ScoreDetail } from '../types'
import { ScoreGrid } from '../../shared/CJPTabletShell'
import { calcDJTotals, IncorrectTsToggle, DualKeypad, PhoneDJElementsList } from '../../shared/DJElementsShared'
import { calcEJScore, CombinedElementRow, EJKeypad, EJElementRow } from '../../shared/DJEJElementsShared'
import CheckIcon from '../../shared/CheckIcon'
import { ScoringPerformanceHeader } from '../../shared/ScoringPerformanceHeader'

// ─── translations ──────────────────────────────────────────────────────────────

const T = {
  en: {
    waiting: 'Waiting for performance…',
    waitingSub: 'The panel chief has not opened a routine yet.',
    pdfPlaceholder: 'Tariff Sheet PDF',
    pdfNote: 'PDF will appear here once uploaded',
    noElements: 'No elements in tariff sheet',
    noElementsNote: 'You can submit immediately',
    addElement: '+ Add unlisted element',
    ejScore: 'EJ Score',
    submit: 'Submit',
    submitted: 'Scores submitted',
    waitingOtherScores: 'Waiting for your other scores…',
    difficultyTotal: 'Difficulty',
    penaltyTotal: 'DJ Penalty',
    djTab: 'DJ — Difficulty',
    ejTab: 'EJ — Execution',
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
    noElementsNote: 'Puedes enviar directamente',
    addElement: '+ Añadir elemento no listado',
    ejScore: 'Nota EJ',
    submit: 'Enviar',
    submitted: 'Puntuaciones enviadas',
    waitingOtherScores: 'Esperando tus otras puntuaciones…',
    difficultyTotal: 'Dificultad',
    penaltyTotal: 'Penalización DJ',
    djTab: 'DJ — Dificultad',
    ejTab: 'EJ — Ejecución',
    balance: 'Balance',
    dynamic: 'Dinámico',
    combined: 'Combinado',
  },
}


// ─── props & main component ────────────────────────────────────────────────────

export type DJEJViewProps = {
  currentPerf: Performance | null
  lang: Lang
  elements: TsElement[]
  djMode?: 'elements' | 'keyboard'
  ejMode?: 'elements' | 'keyboard'
  onSubmit?: (difficulty: number, djPenalty: number, ejScore: number, detail: ScoreDetail) => void
  waitingForOtherScores?: boolean
  judgeScores?: JudgeScore[]
  panelJudges?: PanelJudge[]
  result?: RoutineResult | null
  myDJSubmittedScore?: { difficulty: number; penalty: number } | null
  myEJSubmittedScore?: number | null
}

export default function DJEJView({
  currentPerf, lang, elements, djMode = 'elements', ejMode = 'elements', onSubmit,
  waitingForOtherScores, judgeScores, panelJudges, result,
  myDJSubmittedScore, myEJSubmittedScore,
}: DJEJViewProps) {
  const t = T[lang]
  const { flags, extraElements, incorrectTs, deductions,
    handleFlagChange, handleLock, handleOpenRetry,
    handleAddElement, handleLabelChange, handleTypeChange,
    toggleIncorrectTs, clearCache } = useDJScoring(elements, currentPerf?.id ?? null)

  const [submitted, setSubmitted] = useState(false)
  const [submittedDifficulty, setSubmittedDifficulty] = useState<number | null>(null)
  const [submittedPenalty, setSubmittedPenalty] = useState<number | null>(null)
  const [submittedEJ, setSubmittedEJ] = useState<number | null>(null)
  const [phoneTab, setPhoneTab] = useState<'dj' | 'ej'>('dj')
  const prevPerfId = useRef<string | null>(null)

  useEffect(() => {
    if (currentPerf?.id !== prevPerfId.current) {
      setSubmitted(false)
      setSubmittedDifficulty(null)
      setSubmittedPenalty(null)
      setSubmittedEJ(null)
      setPhoneTab('dj')
      prevPerfId.current = currentPerf?.id ?? null
    }
  }, [currentPerf?.id])

  // Restore submitted state after page refresh
  useEffect(() => {
    if (myDJSubmittedScore != null && myEJSubmittedScore != null) {
      setSubmitted(true)
      setSubmittedDifficulty(myDJSubmittedScore.difficulty)
      setSubmittedPenalty(myDJSubmittedScore.penalty)
      setSubmittedEJ(myEJSubmittedScore)
    }
  }, [myDJSubmittedScore, myEJSubmittedScore]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmitTablet() {
    const { difficulty, penalty } = calcDJTotals(elements, extraElements, flags, incorrectTs)
    const ejScore = calcEJScore(deductions)
    clearCache()
    setSubmittedDifficulty(difficulty)
    setSubmittedPenalty(penalty)
    setSubmittedEJ(ejScore)
    setSubmitted(true)
    onSubmit?.(difficulty, penalty, ejScore, { djFlags: flags, djExtraElements: extraElements, djIncorrectTs: incorrectTs, ejDeductions: deductions, ejExtraElements: extraElements })
  }

  function handlePhoneDJ(difficulty: number, penalty: number) {
    setSubmittedDifficulty(difficulty)
    setSubmittedPenalty(penalty)
  }

  function handlePhoneEJ(score: number) {
    const difficulty = submittedDifficulty ?? 0
    const penalty = submittedPenalty ?? 0
    clearCache()
    setSubmittedEJ(score)
    setSubmitted(true)
    onSubmit?.(difficulty, penalty, score, { djFlags: flags, djExtraElements: extraElements, djIncorrectTs: incorrectTs, ejDeductions: deductions, ejExtraElements: extraElements })
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
  if (submitted && submittedDifficulty !== null && submittedPenalty !== null && submittedEJ !== null) {
    return (
      <div className="overflow-y-auto px-4 py-8 space-y-6 max-w-lg mx-auto">
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
            <div className="w-px h-12 bg-slate-200" />
            <div>
              <p className="text-xs text-slate-400 mb-1">{t.ejScore}</p>
              <p className="text-4xl font-bold text-sky-600 tabular-nums">{submittedEJ.toFixed(1)}</p>
            </div>
          </div>
        </div>
        {waitingForOtherScores && (
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.65-3.65L20 7M4 17l1.35 1.65A9 9 0 0020 15" />
            </svg>
            <p className="text-sm">{t.waitingOtherScores}</p>
          </div>
        )}
        {judgeScores && panelJudges && (
          <ScoreGrid scores={judgeScores} panelJudges={panelJudges} lang={lang} locked={true} result={result} onReopen={() => {}} />
        )}
      </div>
    )
  }

  const { difficulty: liveDifficulty, penalty: livePenalty } = calcDJTotals(elements, extraElements, flags, incorrectTs)
  const liveEJScore = calcEJScore(deductions)
  const allElements = [...elements, ...extraElements]

  return (
    <>
      {/* phone */}
      <div className="md:hidden">
        {djMode === 'elements' && ejMode === 'elements' ? (
          // combined: one scrollable list with both DJ+EJ controls per element
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
            <button onClick={handleSubmitTablet} className="w-full py-4 rounded-2xl font-bold text-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all">
              {t.submit} · D {liveDifficulty.toFixed(2)}  −{livePenalty.toFixed(1)}  E {liveEJScore.toFixed(1)}
            </button>
          </div>
        ) : (
          // two-tab mode when at least one is keyboard
          <>
            <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1 mx-4 mb-4">
              {(['dj', 'ej'] as const).map((tabId) => (
                <button key={tabId} onClick={() => setPhoneTab(tabId)}
                  className={['flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5',
                    phoneTab === tabId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
                  {tabId === 'dj' ? t.djTab : t.ejTab}
                  {tabId === 'dj' && submittedDifficulty !== null && <CheckIcon />}
                  {tabId === 'ej' && submittedEJ !== null && <CheckIcon />}
                </button>
              ))}
            </div>

            {phoneTab === 'dj' && (
              submittedDifficulty !== null ? (
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
                      <p className="text-4xl font-bold text-slate-800 tabular-nums">{submittedDifficulty.toFixed(2)}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-200" />
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">{t.penaltyTotal}</p>
                      <p className="text-4xl font-bold text-red-500 tabular-nums">−{submittedPenalty!.toFixed(1)}</p>
                    </div>
                  </div>
                  {submittedEJ === null && (
                    <button onClick={() => setPhoneTab('ej')} className="mt-2 w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-all">
                      {t.ejTab} →
                    </button>
                  )}
                </div>
              ) : djMode === 'keyboard' ? (
                <DualKeypad lang={lang} onSubmit={handlePhoneDJ} />
              ) : (
                <PhoneDJElementsList
                  lang={lang} elements={elements} extraElements={extraElements}
                  flags={flags} incorrectTs={incorrectTs}
                  onFlagChange={handleFlagChange} onOpenRetry={handleOpenRetry}
                  onAddElement={handleAddElement} onLabelChange={handleLabelChange}
                  onTypeChange={handleTypeChange} onToggleIncorrectTs={toggleIncorrectTs}
                  onSubmit={handlePhoneDJ}
                />
              )
            )}

            {phoneTab === 'ej' && (
              submittedEJ !== null ? (
                <div className="px-4 pb-8 flex flex-col items-center gap-4 pt-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{t.submitted}</p>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">{t.ejScore}</p>
                    <p className="text-6xl font-bold text-sky-600 tabular-nums">{submittedEJ.toFixed(1)}</p>
                  </div>
                  {submittedDifficulty === null && (
                    <button onClick={() => setPhoneTab('dj')} className="mt-2 w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all">
                      ← {t.djTab}
                    </button>
                  )}
                </div>
              ) : ejMode === 'keyboard' ? (
                <EJKeypad lang={lang} onSubmit={handlePhoneEJ} />
              ) : (
                <div className="px-4 space-y-2 pb-4">
                  {allElements.map((el) => (
                    <EJElementRow key={el.id} element={el} deductions={deductions} lang={lang} onLock={handleLock}
                      onLabelChange={el.id.startsWith('extra-') ? handleLabelChange : undefined} />
                  ))}
                  <button onClick={() => handlePhoneEJ(calcEJScore(deductions))}
                    className="w-full py-4 rounded-2xl font-bold text-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white transition-all">
                    {t.submit} · {t.ejScore} {liveEJScore.toFixed(1)}
                  </button>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* tablet/desktop: PDF viewer + element list */}
      <div className="hidden md:block h-full px-4 pb-4">
        <div className="flex gap-4 h-full">
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

          <div className="w-[480px] flex flex-col gap-3 min-h-0">
            <ScoringPerformanceHeader perf={currentPerf} lang={lang} mb="mb-3">
              <div className="flex items-center gap-3 text-sm font-bold tabular-nums">
                <span className="text-emerald-400">D {liveDifficulty.toFixed(2)}</span>
                {livePenalty > 0 && <span className="text-red-400">−{livePenalty.toFixed(1)}</span>}
                <span className="text-sky-300">E {liveEJScore.toFixed(1)}</span>
              </div>
            </ScoringPerformanceHeader>
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
            <button onClick={handleSubmitTablet} className="w-full py-4 rounded-2xl font-bold text-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white transition-all shrink-0">
              {t.submit} · D {liveDifficulty.toFixed(2)}  −{livePenalty.toFixed(1)}  E {liveEJScore.toFixed(1)}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
