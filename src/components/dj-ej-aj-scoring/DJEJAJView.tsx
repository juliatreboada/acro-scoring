'use client'

import { useState, useEffect, useRef } from 'react'
import type { Performance, Lang } from '../aj-scoring/types'
import type { TsElement, ElementType, Deductions } from '../ej-scoring/types'
import type { ElementFlag, ElementFlags } from '../dj-scoring/types'
import { DEFAULT_FLAG } from '../dj-scoring/types'
import type { PanelJudge, JudgeScore, RoutineResult } from '../cjp/types'
import { ScoreGrid } from '../shared/CJPTabletShell'
import { categoryLabel } from '@/components/admin/types'
import DJModeSelector, { type DJPhoneMode } from '../shared/DJModeSelector'
import { getElementConfig, calcDJTotals, IncorrectTsToggle, DualKeypad, PhoneDJElementsList } from '../shared/DJElementsShared'
import { calcEJScore, EJKeypad, CombinedElementRow } from '../shared/DJEJElementsShared'
import AJScoringPanel from '../shared/AJScoringPanel'
import CheckIcon from '../shared/CheckIcon'

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

function PerformanceHeader({ perf, lang }: { perf: Performance; lang: Lang }) {
  return (
    <div className="bg-slate-800 text-white px-4 py-3 mb-4 space-y-0.5">
      <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
        #{perf.position} · {perf.ageGroup} · {categoryLabel(perf.category, lang)} · {perf.routineType}
      </span>
      <p className="text-lg font-semibold leading-tight">{perf.gymnasts}</p>
    </div>
  )
}

function PhoneTabBar({ tab, setTab, djSubmitted, ejSubmitted, ajSubmitted, lang }: {
  tab: 'dj' | 'ej' | 'aj'
  setTab: (t: 'dj' | 'ej' | 'aj') => void
  djSubmitted: boolean
  ejSubmitted: boolean
  ajSubmitted: boolean
  lang: Lang
}) {
  const t = T[lang]
  return (
    <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1 mx-4 mb-4">
      {(['dj', 'ej', 'aj'] as const).map((tabId) => (
        <button key={tabId} onClick={() => setTab(tabId)}
          className={['flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
            tab === tabId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
          {tabId === 'dj' ? t.dj : tabId === 'ej' ? t.ej : t.aj}
          {tabId === 'dj' && djSubmitted && <CheckIcon />}
          {tabId === 'ej' && ejSubmitted && <CheckIcon />}
          {tabId === 'aj' && ajSubmitted && <CheckIcon />}
        </button>
      ))}
    </div>
  )
}

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

function SubmittedScoreCard({ label, score, color, lang }: { label: string; score: number; color: string; lang: Lang }) {
  return (
    <div className="px-4 pb-8 flex flex-col items-center gap-4 pt-4">
      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className={`text-4xl font-bold tabular-nums ${color}`}>{score.toFixed(score % 1 === 0 ? 1 : 2)}</p>
      </div>
    </div>
  )
}

// ─── props & main component ───────────────────────────────────────────────────

export type DJEJAJViewProps = {
  currentPerf: Performance | null
  lang: Lang
  elements: TsElement[]
  onSubmit?: (djDifficulty: number, djPenalty: number, ejScore: number, ajScore: number) => void
  panelJudges?: PanelJudge[]
  judgeScores?: JudgeScore[]
  waitingForOtherScores?: boolean
  result?: RoutineResult | null
}

export default function DJEJAJView({
  currentPerf, lang, elements, onSubmit,
  panelJudges, judgeScores, waitingForOtherScores, result,
}: DJEJAJViewProps) {
  const t = T[lang]

  // DJ state
  const [extraElements, setExtraElements] = useState<TsElement[]>([])
  const [flags, setFlags] = useState<ElementFlags>({})
  const [deductions, setDeductions] = useState<Deductions>({})
  const [incorrectTs, setIncorrectTs] = useState(false)
  const [djPhoneMode, setDjPhoneMode] = useState<DJPhoneMode | null>(null)

  // submission
  const [djSubmitted, setDjSubmitted] = useState<{ difficulty: number; penalty: number } | null>(null)
  const [ejSubmitted, setEjSubmitted] = useState<number | null>(null)
  const [ajSubmitted, setAjSubmitted] = useState<number | null>(null)

  // mobile tab
  const [tab, setTab] = useState<'dj' | 'ej' | 'aj'>('dj')
  // tablet tab
  const [tabletTab, setTabletTab] = useState<'djej' | 'aj'>('djej')

  const prevPerfId = useRef<string | null>(null)

  useEffect(() => {
    if (currentPerf?.id !== prevPerfId.current) {
      const initial: ElementFlags = {}
      elements.forEach((el) => { initial[`${el.id}:1`] = { ...DEFAULT_FLAG } })
      setFlags(initial)
      setIncorrectTs(false)
      setExtraElements([])
      setDeductions({})
      setDjPhoneMode(null)
      setDjSubmitted(null)
      setEjSubmitted(null)
      setAjSubmitted(null)
      setTab('dj')
      setTabletTab('djej')
      prevPerfId.current = currentPerf?.id ?? null
    }
  }, [currentPerf?.id, elements])

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

  function tryFireSubmit(
    dj: typeof djSubmitted, ej: typeof ejSubmitted, aj: typeof ajSubmitted
  ) {
    if (dj && ej !== null && aj !== null) onSubmit?.(dj.difficulty, dj.penalty, ej, aj)
  }

  function handleLock(elementId: string, attemptNumber: number, value: number) {
    setDeductions((prev) => ({ ...prev, [`${elementId}:${attemptNumber}`]: { value, locked: true } }))
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
        <PerformanceHeader perf={currentPerf} lang={lang} />
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
            <ScoreGrid scores={judgeScores} panelJudges={panelJudges} lang={lang} locked={true} onReopen={() => {}} />
          </div>
        )}
      </div>
    )
  }

  // ── scoring ──
  const ejScoreVal = calcEJScore(deductions)
  return (
    <div className="h-full">
      <div className="md:hidden"><PerformanceHeader perf={currentPerf} lang={lang} /></div>

      {/* ── mobile (< md): 3-tab bar + content ── */}
      <div className="md:hidden">
        <PhoneTabBar
          tab={tab} setTab={setTab}
          djSubmitted={djSubmitted !== null} ejSubmitted={ejSubmitted !== null} ajSubmitted={ajSubmitted !== null}
          lang={lang}
        />

        {tab === 'dj' && (
          djSubmitted ? (
            <SubmittedDJCard dj={djSubmitted} lang={lang} />
          ) : djPhoneMode === null ? (
            <DJModeSelector lang={lang} onSelect={setDjPhoneMode} />
          ) : djPhoneMode === 'keypad' ? (
            <DualKeypad lang={lang} onSubmit={handleDJSubmit} />
          ) : (
            <PhoneDJElementsList
              lang={lang} elements={elements} extraElements={extraElements}
              flags={flags} incorrectTs={incorrectTs}
              onFlagChange={handleFlagChange} onOpenRetry={handleOpenRetry}
              onAddElement={handleAddElement} onLabelChange={handleLabelChange}
              onTypeChange={handleTypeChange}
              onToggleIncorrectTs={() => setIncorrectTs((v) => !v)}
              onSubmit={handleDJSubmit}
            />
          )
        )}

        {tab === 'ej' && (
          ejSubmitted !== null ? (
            <SubmittedScoreCard label={t.ejScore} score={ejSubmitted} color="text-sky-600" lang={lang} />
          ) : (
            <EJKeypad lang={lang} onSubmit={handleEJSubmit} />
          )
        )}

        {tab === 'aj' && (
          ajSubmitted !== null ? (
            <SubmittedScoreCard label={t.ajScore} score={ajSubmitted} color="text-blue-600" lang={lang} />
          ) : (
            <AJScoringPanel lang={lang} perfId={currentPerf.id} onSubmit={handleAJSubmit} />
          )
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
                  <IncorrectTsToggle active={incorrectTs} onToggle={() => setIncorrectTs((v) => !v)} lang={lang} />
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
                <SubmittedScoreCard label={t.ajScore} score={ajSubmitted} color="text-blue-600" lang={lang} />
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
