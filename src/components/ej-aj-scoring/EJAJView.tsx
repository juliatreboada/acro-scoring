'use client'

import { useState, useEffect, useRef } from 'react'
import type { Performance, Lang } from '../aj-scoring/types'
import type { TsElement } from '../ej-scoring/types'
import type { PanelJudge, JudgeScore, RoutineResult } from '../cjp/types'
import { ScoreGrid } from '../shared/CJPTabletShell'
import { categoryLabel } from '@/components/admin/types'
import { calcEJScore, EJKeypad, EJElementRow } from '../shared/DJEJElementsShared'
import AJScoringPanel from '../shared/AJScoringPanel'
import CheckIcon from '../shared/CheckIcon'
import { useEJScoring } from '@/hooks/useEJScoring'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    waiting: 'Waiting for performance…',
    waitingSub: 'The panel chief has not opened a routine yet.',
    ej: 'EJ',
    aj: 'AJ',
    ejTab: 'EJ — Execution',
    ajTab: 'AJ — Score',
    submitted: 'Scores submitted',
    ejScore: 'EJ Score',
    ajScore: 'AJ Score',
    pdfPlaceholder: 'Tariff Sheet PDF',
    pdfNote: 'PDF will appear here once uploaded',
    submit: 'Submit',
    noElements: 'No elements in tariff sheet',
    noElementsNote: 'You can submit immediately',
    addElement: '+ Add unlisted element',
  },
  es: {
    waiting: 'Esperando actuación…',
    waitingSub: 'El juez coordinador no ha abierto ninguna rutina todavía.',
    ej: 'EJ',
    aj: 'AJ',
    ejTab: 'EJ — Ejecución',
    ajTab: 'AJ — Puntuación',
    submitted: 'Puntuaciones enviadas',
    ejScore: 'Nota EJ',
    ajScore: 'Punt. AJ',
    pdfPlaceholder: 'Hoja de tarifa',
    pdfNote: 'El PDF aparecerá aquí una vez subido',
    submit: 'Enviar',
    noElements: 'No hay elementos en la hoja de tarifa',
    noElementsNote: 'Puedes enviar directamente',
    addElement: '+ Añadir elemento no listado',
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

function PhoneTabBar({ tab, setTab, ejSubmitted, ajSubmitted, lang }: {
  tab: 'ej' | 'aj'
  setTab: (t: 'ej' | 'aj') => void
  ejSubmitted: boolean
  ajSubmitted: boolean
  lang: Lang
}) {
  const t = T[lang]
  return (
    <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1 mx-4 mb-4">
      {(['ej', 'aj'] as const).map((tabId) => (
        <button key={tabId} onClick={() => setTab(tabId)}
          className={['flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5',
            tab === tabId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
          {tabId === 'ej' ? t.ej : t.aj}
          {tabId === 'ej' && ejSubmitted && <CheckIcon />}
          {tabId === 'aj' && ajSubmitted && <CheckIcon />}
        </button>
      ))}
    </div>
  )
}

function SubmittedEJCard({ score, lang }: { score: number; lang: Lang }) {
  const t = T[lang]
  return (
    <div className="px-4 pb-8 flex flex-col items-center gap-4 pt-4">
      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-xs text-slate-400 mb-1">{t.ejScore}</p>
        <p className="text-4xl font-bold text-sky-600 tabular-nums">{score.toFixed(1)}</p>
      </div>
    </div>
  )
}

function SubmittedAJCard({ score, lang }: { score: number; lang: Lang }) {
  const t = T[lang]
  return (
    <div className="px-4 pb-8 flex flex-col items-center gap-4 pt-4">
      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-xs text-slate-400 mb-1">{t.ajScore}</p>
        <p className="text-4xl font-bold text-blue-600 tabular-nums">{score.toFixed(2)}</p>
      </div>
    </div>
  )
}

// ─── props & main component ───────────────────────────────────────────────────

export type EJAJViewProps = {
  currentPerf: Performance | null
  lang: Lang
  elements: TsElement[]
  ejMode?: 'elements' | 'keyboard'
  onSubmit?: (ejScore: number, ajScore: number) => void
  panelJudges?: PanelJudge[]
  judgeScores?: JudgeScore[]
  waitingForOtherScores?: boolean
  result?: RoutineResult | null
}

export default function EJAJView({
  currentPerf, lang, elements, ejMode = 'elements', onSubmit,
  panelJudges, judgeScores, waitingForOtherScores, result,
}: EJAJViewProps) {
  const t = T[lang]

  const { deductions, orderedAll, dragId, dropIdx, dragRef,
    handleLock, handleAddElement, handleLabelChange, handleReorder,
    setDragId, setDropIdx } = useEJScoring(elements, currentPerf?.id ?? null)

  const [ejSubmitted, setEjSubmitted] = useState<number | null>(null)
  const [ajSubmitted, setAjSubmitted] = useState<number | null>(null)
  const [tab, setTab] = useState<'ej' | 'aj'>('ej')
  const [tabletTab, setTabletTab] = useState<'ej' | 'aj'>('ej')

  const prevPerfId = useRef<string | null>(null)

  useEffect(() => {
    if (currentPerf?.id !== prevPerfId.current) {
      setEjSubmitted(null)
      setAjSubmitted(null)
      setTab('ej')
      setTabletTab('ej')
      prevPerfId.current = currentPerf?.id ?? null
    }
  }, [currentPerf?.id])

  function handleEJSubmit(score: number) {
    setEjSubmitted(score)
    if (ajSubmitted !== null) onSubmit?.(score, ajSubmitted)
  }

  function handleTabletEJSubmit() {
    const score = calcEJScore(deductions)
    setEjSubmitted(score)
    if (ajSubmitted !== null) onSubmit?.(score, ajSubmitted)
  }

  function handleAJSubmit(score: number) {
    setAjSubmitted(score)
    if (ejSubmitted !== null) onSubmit?.(ejSubmitted, score)
  }

  const ejScoreVal = calcEJScore(deductions)
  const allSubmitted = ejSubmitted !== null && ajSubmitted !== null

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
          <div className="flex items-center gap-6">
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
  return (
    <div className="h-full">
      <div className="md:hidden"><PerformanceHeader perf={currentPerf} lang={lang} /></div>

      {/* ── mobile (< md): tab bar + content ── */}
      <div className="md:hidden">
        <PhoneTabBar
          tab={tab} setTab={setTab}
          ejSubmitted={ejSubmitted !== null} ajSubmitted={ajSubmitted !== null}
          lang={lang}
        />

        {tab === 'ej' && (
          ejSubmitted !== null ? (
            <SubmittedEJCard score={ejSubmitted} lang={lang} />
          ) : ejMode === 'keyboard' ? (
            <EJKeypad lang={lang} onSubmit={handleEJSubmit} />
          ) : (
            <div className="px-4 space-y-2 pb-4">
              {orderedAll.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="font-medium text-sm">{t.noElements}</p>
                  <p className="text-xs mt-1">{t.noElementsNote}</p>
                </div>
              ) : orderedAll.map((el, idx) => {
                const isExtra = el.id.startsWith('extra-')
                const isDragging = dragId === el.id
                const isDropTarget = dragId !== null && dragId !== el.id && dropIdx === idx
                return (
                  <div key={el.id}
                    draggable={isExtra}
                    onDragStart={isExtra ? (e) => { e.dataTransfer.effectAllowed = 'move'; dragRef.current = el.id; setDragId(el.id) } : undefined}
                    onDragEnd={() => { dragRef.current = null; setDragId(null); setDropIdx(null) }}
                    onDragOver={(e) => { e.preventDefault(); if (dragRef.current) setDropIdx(idx) }}
                    onDrop={(e) => { e.preventDefault(); if (dragRef.current) handleReorder(dragRef.current, idx) }}
                    className={[isExtra ? 'cursor-grab active:cursor-grabbing' : '', isDragging ? 'opacity-40' : '', isDropTarget ? 'ring-2 ring-blue-400 ring-offset-1 rounded-xl' : ''].join(' ')}
                  >
                    {isExtra && <div className="text-xs text-slate-300 text-right pr-1 mb-0.5 select-none">⠿ drag to reorder</div>}
                    <EJElementRow element={el} deductions={deductions} lang={lang} onLock={handleLock}
                      onLabelChange={isExtra ? handleLabelChange : undefined} />
                  </div>
                )
              })}
              <button onClick={handleAddElement} className="w-full py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 hover:border-slate-300 transition-all">
                {t.addElement}
              </button>
              <button onClick={handleTabletEJSubmit}
                className="w-full py-4 rounded-2xl font-bold text-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white transition-all">
                {t.submit} · E {ejScoreVal.toFixed(1)}
              </button>
            </div>
          )
        )}

        {tab === 'aj' && (
          ajSubmitted !== null ? (
            <SubmittedAJCard score={ajSubmitted} lang={lang} />
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
                  <span className="text-sky-300">E {ejScoreVal.toFixed(1)}</span>
                  {ajSubmitted !== null && <span className="text-blue-300">A {ajSubmitted.toFixed(2)}</span>}
                </div>
              </div>
              <p className="text-lg font-semibold leading-tight">{currentPerf.gymnasts}</p>
            </div>

            {/* tab bar: EJ | AJ */}
            <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1">
              {(['ej', 'aj'] as const).map((tid) => (
                <button key={tid} onClick={() => setTabletTab(tid)}
                  className={['flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
                    tabletTab === tid ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
                  {tid === 'ej' ? t.ej : t.aj}
                  {tid === 'ej' && ejSubmitted !== null && <CheckIcon />}
                  {tid === 'aj' && ajSubmitted !== null && <CheckIcon />}
                </button>
              ))}
            </div>

            {/* EJ tab content */}
            {tabletTab === 'ej' && (
              ejSubmitted !== null ? (
                <div className="flex flex-col items-center gap-3 flex-1 justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">{t.ejScore}</p>
                    <p className="text-2xl font-bold text-sky-600 tabular-nums">{ejSubmitted.toFixed(1)}</p>
                  </div>
                </div>
              ) : ejMode === 'keyboard' ? (
                <div className="flex-1 overflow-y-auto min-h-0">
                  <EJKeypad lang={lang} onSubmit={handleEJSubmit} />
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                    {orderedAll.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <p className="font-medium text-sm">{t.noElements}</p>
                        <p className="text-xs mt-1">{t.noElementsNote}</p>
                      </div>
                    ) : orderedAll.map((el, idx) => {
                      const isExtra = el.id.startsWith('extra-')
                      const isDragging = dragId === el.id
                      const isDropTarget = dragId !== null && dragId !== el.id && dropIdx === idx
                      return (
                        <div key={el.id}
                          draggable={isExtra}
                          onDragStart={isExtra ? (e) => { e.dataTransfer.effectAllowed = 'move'; setDragId(el.id) } : undefined}
                          onDragEnd={() => { setDragId(null); setDropIdx(null) }}
                          onDragOver={dragId ? (e) => { e.preventDefault(); setDropIdx(idx) } : undefined}
                          onDrop={dragId ? (e) => { e.preventDefault(); handleReorder(dragId, idx) } : undefined}
                          className={[isExtra ? 'cursor-grab active:cursor-grabbing' : '', isDragging ? 'opacity-40' : '', isDropTarget ? 'ring-2 ring-blue-400 ring-offset-1 rounded-xl' : ''].join(' ')}
                        >
                          {isExtra && <div className="text-xs text-slate-300 text-right pr-1 mb-0.5 select-none">⠿ drag to reorder</div>}
                          <EJElementRow element={el} deductions={deductions} lang={lang} onLock={handleLock}
                            onLabelChange={isExtra ? handleLabelChange : undefined} />
                        </div>
                      )
                    })}
                    <button onClick={handleAddElement} className="w-full py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 hover:border-slate-300 transition-all">
                      {t.addElement}
                    </button>
                  </div>
                  <button onClick={handleTabletEJSubmit} className="w-full py-4 rounded-2xl font-bold text-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white transition-all">
                    {t.submit} · E {ejScoreVal.toFixed(1)}
                  </button>
                </>
              )
            )}

            {/* AJ tab content */}
            {tabletTab === 'aj' && (
              ajSubmitted !== null ? (
                <div className="flex flex-col items-center gap-3 flex-1 justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">{t.ajScore}</p>
                    <p className="text-2xl font-bold text-blue-600 tabular-nums">{ajSubmitted.toFixed(2)}</p>
                  </div>
                </div>
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
