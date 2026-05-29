'use client'

import { useState, useEffect, useRef } from 'react'
import type { Lang, PanelJudge, ScoringPerformance, JudgeScore, RoutineResult } from '@/components/scoring/types'
import { computeRGResult } from '@/components/scoring/types'
import type { Json } from '@/lib/database.types'
import { RJPenaltyGrid } from './RJPenaltyGrid'
import { categoryLabel } from '@/components/admin/types'
import { useT } from '@/lib/useT'

// ─── performance list ─────────────────────────────────────────────────────────

function PerformanceList({ lang, performances, currentPerfId, results, onOpen, onSkip }: {
  lang: Lang
  performances: ScoringPerformance[]
  currentPerfId: string | null
  results: Record<string, RoutineResult>
  onOpen: (id: string) => void
  onSkip: (id: string) => void
}) {
  const t = useT('RJView', lang)
  return (
    <div className="divide-y divide-slate-100">
      {performances.map(perf => {
        const isCurrent = perf.id === currentPerfId
        const result    = results[perf.id]
        return (
          <div key={perf.id}
            className={[
              'flex items-center gap-3 px-4 py-3 transition-colors',
              isCurrent ? 'bg-blue-50' : 'hover:bg-slate-50',
            ].join(' ')}>
            <div className="w-6 text-center shrink-0">
              <span className={['text-xs font-bold tabular-nums', isCurrent ? 'text-blue-600' : 'text-slate-400'].join(' ')}>
                {perf.position}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={['text-sm font-semibold truncate', isCurrent ? 'text-blue-800' : 'text-slate-800'].join(' ')}>
                {perf.gymnasts}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {perf.ageGroup} · {categoryLabel(perf.category, lang)} · {perf.routineType}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {result && (
                <span className={[
                  'text-xs font-bold tabular-nums px-2 py-0.5 rounded-lg',
                  result.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
                ].join(' ')}>
                  {result.finalScore.toFixed(3)}
                </span>
              )}
              {perf.skipped ? (
                <span className="text-xs text-slate-300">{t.skipped}</span>
              ) : (
                <button onClick={() => onOpen(perf.id)}
                  className={[
                    'text-xs font-semibold px-2.5 py-1 rounded-lg transition-all',
                    isCurrent
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
                  ].join(' ')}>
                  {t.open}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── score grid ───────────────────────────────────────────────────────────────

function RGScoreGrid({ scores, panelJudges, lang, onReopen }: {
  scores: JudgeScore[]
  panelJudges: PanelJudge[]
  lang: Lang
  onReopen: (panelJudgeId: string | 'all') => void
}) {
  const t = useT('RJView', lang)

  const eJudges = panelJudges.filter(j => j.role === 'E')
  const aJudges = panelJudges.filter(j => j.role === 'A')
  const daJudge = panelJudges.find(j  => j.role === 'DA')
  const dbJudge = panelJudges.find(j  => j.role === 'DB')

  const eVals = eJudges.map(j => scores.find(s => s.panelJudgeId === j.id)?.ejScore    ?? null)
  const aVals = aJudges.map(j => scores.find(s => s.panelJudgeId === j.id)?.ajScore    ?? null)
  const daVal = daJudge ? (scores.find(s => s.panelJudgeId === daJudge.id)?.djDifficulty ?? null) : null
  const dbVal = dbJudge ? (scores.find(s => s.panelJudgeId === dbJudge.id)?.dbScore       ?? null) : null

  const eNums = eVals.filter((v): v is number => v !== null)
  const aNums = aVals.filter((v): v is number => v !== null)
  const eAvg  = eNums.length > 0 ? eNums.reduce((s, v) => s + v, 0) / eNums.length : null
  const aAvg  = aNums.length > 0 ? aNums.reduce((s, v) => s + v, 0) / aNums.length : null

  const anyScore = scores.length > 0

  const tdBase  = 'px-3 py-2 border-t border-slate-100 align-top'
  const tdLabel = `${tdBase} text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap`
  const tdScore = `${tdBase} border-l border-slate-100`
  const tdAvg   = `${tdBase} border-l border-slate-100`

  function ScoreCell({ value }: { value: number | null }) {
    return (
      <span className={['tabular-nums font-mono text-sm', value != null ? 'text-slate-800' : 'text-slate-300'].join(' ')}>
        {value != null ? value.toFixed(3) : '—'}
      </span>
    )
  }

  function ReopenBtn({ judgeId }: { judgeId: string }) {
    return (
      <button onClick={() => onReopen(judgeId)} title={t.reopen}
        className="w-5 h-5 rounded text-slate-300 hover:text-amber-500 hover:bg-amber-50 transition-colors flex items-center justify-center">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.65-3.65L20 7M4 17l1.35 1.65A9 9 0 0020 15" />
        </svg>
      </button>
    )
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {anyScore && (
        <div className="flex justify-end px-3 py-1.5 bg-slate-50 border-b border-slate-200">
          <button onClick={() => onReopen('all')} className="text-xs text-amber-500 hover:text-amber-700 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.65-3.65L20 7M4 17l1.35 1.65A9 9 0 0020 15" />
            </svg>
            {t.reopen}
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <tbody>
            {eJudges.length > 0 && (
              <tr>
                <td className={tdLabel}>{t.e}</td>
                {eJudges.map((j, i) => (
                  <td key={j.id} className={tdScore}>
                    <div className="text-[10px] text-slate-400 mb-0.5 truncate">E{j.roleNumber} {j.name}</div>
                    <div className="flex items-center gap-1">
                      <ScoreCell value={eVals[i]} />
                      {eVals[i] != null && <ReopenBtn judgeId={j.id} />}
                    </div>
                  </td>
                ))}
                <td className={tdAvg}>
                  <div className="text-[10px] text-slate-400 mb-0.5">{t.avg}</div>
                  <span className="font-bold tabular-nums text-slate-600">{eAvg != null ? eAvg.toFixed(3) : '—'}</span>
                </td>
              </tr>
            )}
            {aJudges.length > 0 && (
              <tr>
                <td className={tdLabel}>{t.a}</td>
                {aJudges.map((j, i) => (
                  <td key={j.id} className={tdScore}>
                    <div className="text-[10px] text-slate-400 mb-0.5 truncate">A{j.roleNumber} {j.name}</div>
                    <div className="flex items-center gap-1">
                      <ScoreCell value={aVals[i]} />
                      {aVals[i] != null && <ReopenBtn judgeId={j.id} />}
                    </div>
                  </td>
                ))}
                <td className={tdAvg}>
                  <div className="text-[10px] text-slate-400 mb-0.5">{t.avg}</div>
                  <span className="font-bold tabular-nums text-slate-600">{aAvg != null ? aAvg.toFixed(3) : '—'}</span>
                </td>
              </tr>
            )}
            {daJudge && (
              <tr>
                <td className={tdLabel}>{t.da}</td>
                <td className={tdScore}>
                  <div className="text-[10px] text-slate-400 mb-0.5 truncate">DA {daJudge.name}</div>
                  <div className="flex items-center gap-1">
                    <ScoreCell value={daVal} />
                    {daVal != null && <ReopenBtn judgeId={daJudge.id} />}
                  </div>
                </td>
                <td className={`${tdAvg} text-slate-300 text-sm`}>—</td>
              </tr>
            )}
            {dbJudge && (
              <tr>
                <td className={tdLabel}>{t.db}</td>
                <td className={tdScore}>
                  <div className="text-[10px] text-slate-400 mb-0.5 truncate">DB {dbJudge.name}</div>
                  <div className="flex items-center gap-1">
                    <ScoreCell value={dbVal} />
                    {dbVal != null && <ReopenBtn judgeId={dbJudge.id} />}
                  </div>
                </td>
                <td className={`${tdAvg} text-slate-300 text-sm`}>—</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export function RJView({ lang, panelJudges, performances, currentPerfId, judgeScores, results, onOpen, onSkip, onSubmit, onReopen }: {
  lang: Lang
  panelJudges: PanelJudge[]
  performances: ScoringPerformance[]
  currentPerfId: string | null
  judgeScores: Record<string, JudgeScore[]>
  results: Record<string, RoutineResult>
  onOpen: (id: string) => void
  onSkip: (id: string) => void
  onSubmit: (status: 'provisional' | 'approved', result: RoutineResult, penaltyDetail?: Json) => void
  onReopen: (perfId: string, who: string | 'all') => void
}) {
  const t = useT('RJView', lang)

  const [rjPenalty,       setRjPenalty]       = useState(0)
  const [rjPenaltyDetail, setRjPenaltyDetail] = useState<Json>({})
  const [confirmFinal,    setConfirmFinal]    = useState(false)
  const [reviewingId,     setReviewingId]     = useState<string | null>(null)
  const [leftOpen,        setLeftOpen]        = useState(true)
  const [rightPanelWidth, setRightPanelWidth] = useState(600)
  const resizeStartX     = useRef(0)
  const resizeStartWidth = useRef(0)

  const activePerfId = reviewingId ?? currentPerfId
  const currentPerf  = activePerfId ? performances.find(p => p.id === activePerfId) ?? null : null
  const currentScores = activePerfId ? (judgeScores[activePerfId] ?? []) : []
  const currentResult = activePerfId ? (results[activePerfId] ?? null) : null
  const isReviewing   = reviewingId !== null && reviewingId !== currentPerfId

  // reset penalty when performance changes
  useEffect(() => {
    setRjPenalty(0)
    setRjPenaltyDetail({})
    setConfirmFinal(false)
  }, [activePerfId])

  const computedResult = computeRGResult(activePerfId ?? '', currentScores, panelJudges, rjPenalty, 'provisional')

  // ─ next unscored perf ──
  const nextPerf = performances.find(p =>
    !p.skipped && !results[p.id] && p.id !== activePerfId
  )

  // ─ content: no perf open ──
  if (!currentPerf) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <PerformanceList lang={lang} performances={performances}
            currentPerfId={currentPerfId} results={results}
            onOpen={onOpen} onSkip={onSkip} />
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-3 border-t border-slate-100 text-center px-6">
          <p className="text-lg font-semibold text-slate-600">{t.noPerf}</p>
          <p className="text-sm text-slate-400">{t.noPerfSub}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row md:h-full">

      {/* ── left: performance list (md+, collapsible) ── */}
      <div className={[
        'hidden md:flex md:flex-col min-h-0 shrink-0 transition-all duration-200 border-r border-slate-200 bg-white',
        leftOpen ? 'md:w-64' : 'md:w-9',
      ].join(' ')}>
        <div className="px-2 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          {leftOpen && <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.performances}</p>}
          <button
            onClick={() => setLeftOpen(o => !o)}
            className="ml-auto p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {leftOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />}
            </svg>
          </button>
        </div>
        <div className={['flex-1 overflow-y-auto', leftOpen ? '' : 'hidden'].join(' ')}>
          <PerformanceList lang={lang} performances={performances}
            currentPerfId={currentPerfId} results={results}
            onOpen={id => { setReviewingId(null); onOpen(id) }} onSkip={onSkip} />
        </div>
      </div>

      {/* ── center: scoring panel ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* perf header */}
        <div className={['rounded-xl px-4 py-3 space-y-0.5', isReviewing ? 'bg-amber-700' : 'bg-slate-800'].join(' ')}>
          {isReviewing && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-amber-300 font-semibold uppercase">{t.prov} — reviewing</span>
              <button onClick={() => setReviewingId(null)} className="text-xs text-amber-300 hover:text-white">
                ← {t.nextPerf}
              </button>
            </div>
          )}
          <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
            #{currentPerf.position} · {currentPerf.ageGroup} · {categoryLabel(currentPerf.category, lang)} · {currentPerf.routineType}
          </span>
          <p className="text-white text-lg font-semibold leading-tight">{currentPerf.gymnasts}</p>
        </div>

        {/* ── result already approved ── */}
        {currentResult?.status === 'approved' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-4 space-y-3">
            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-widest text-center">{t.approved}</p>
            <p className="text-4xl font-bold text-emerald-700 tabular-nums text-center">{currentResult.finalScore.toFixed(3)}</p>
            <button onClick={() => onReopen(activePerfId!, 'all')}
              className="w-full text-xs text-slate-400 hover:text-red-500 transition-colors py-1">
              {t.reopen}
            </button>
          </div>
        )}

        {/* ── scores from judges ── */}
        {currentResult?.status !== 'approved' && (
          <>
            <RGScoreGrid
              scores={currentScores}
              panelJudges={panelJudges}
              lang={lang}
              onReopen={id => onReopen(activePerfId!, id)}
            />

            {/* ── penalty (mobile only — on md+ it's in the right panel) ── */}
            <div className="md:hidden bg-white border border-slate-200 rounded-2xl px-4 py-4">
              <RJPenaltyGrid key={activePerfId ?? 'none'} lang={lang} ruleset={currentPerf.category as 'Individual' | 'Group'} onChange={(total, detail: Json) => {
                setRjPenalty(total)
                setRjPenaltyDetail(detail)
              }} />
            </div>

            {/* ── computed total ── */}
            <div className="bg-slate-800 text-white rounded-2xl px-4 py-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs text-slate-400 uppercase tracking-widest">{t.final_score}</p>
                {rjPenalty > 0 && (
                  <p className="text-xs text-red-400 tabular-nums">−{rjPenalty.toFixed(1)} {t.penalty}</p>
                )}
              </div>
              <p className="text-4xl font-bold tabular-nums">{computedResult.finalScore.toFixed(3)}</p>
            </div>

            {/* ── action buttons ── */}
            {currentResult?.status === 'provisional' ? (
              <div className="space-y-2">
                {confirmFinal ? (
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmFinal(false)}
                      className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all">
                      ✕
                    </button>
                    <button onClick={() => { onSubmit('approved', computedResult, rjPenaltyDetail); setConfirmFinal(false) }}
                      className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 active:scale-95 transition-all">
                      {t.confirmFinal}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button onClick={() => onSubmit('provisional', computedResult, rjPenaltyDetail)}
                      className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold transition-all">
                      {t.submitProv}
                    </button>
                    <button onClick={() => setConfirmFinal(true)}
                      className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold transition-all">
                      {t.submitFinal}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={() => onSubmit('provisional', computedResult, rjPenaltyDetail)}
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-lg transition-all">
                  {t.submitProv}
                </button>
                {confirmFinal ? (
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmFinal(false)}
                      className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all">
                      ✕
                    </button>
                    <button onClick={() => { onSubmit('approved', computedResult, rjPenaltyDetail); setConfirmFinal(false) }}
                      className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 active:scale-95 transition-all">
                      {t.confirmFinal}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmFinal(true)}
                    className="w-full py-3 rounded-2xl border border-emerald-200 text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition-all">
                    {t.submitFinal}
                  </button>
                )}
              </div>
            )}

            {/* ── next perf shortcut ── */}
            {nextPerf && (
              <button onClick={() => { setReviewingId(null); onOpen(nextPerf.id) }}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 border border-dashed border-slate-200 rounded-xl transition-colors">
                {t.nextPerf}: #{nextPerf.position} {nextPerf.gymnasts}
              </button>
            )}
          </>
        )}

        {/* ── phone: performance list at the bottom ── */}
        <div className="md:hidden bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <PerformanceList lang={lang} performances={performances}
            currentPerfId={currentPerfId} results={results}
            onOpen={id => { setReviewingId(null); onOpen(id) }} onSkip={onSkip} />
        </div>
      </div>

      {/* ── resize handle (md+) ── */}
      <div
        className="hidden md:block w-1.5 shrink-0 cursor-col-resize bg-slate-200 hover:bg-blue-400 active:bg-blue-500 transition-colors select-none touch-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          resizeStartX.current     = e.clientX
          resizeStartWidth.current = rightPanelWidth
        }}
        onPointerMove={(e) => {
          if (e.buttons === 0) return
          const delta    = resizeStartX.current - e.clientX
          const newWidth = Math.max(180, Math.min(640, resizeStartWidth.current + delta))
          setRightPanelWidth(newWidth)
        }}
      />

      {/* ── right panel: penalty grid (md+, resizable) ── */}
      <div style={{ width: rightPanelWidth }} className="hidden md:flex md:flex-col border-l border-slate-200 bg-white min-h-0 shrink-0 overflow-y-auto">
        {currentResult?.status !== 'approved' && (
          <div className="px-4 py-4">
            <RJPenaltyGrid key={activePerfId ?? 'none'} lang={lang} ruleset={currentPerf.category as 'Individual' | 'Group'} onChange={(total, detail: Json) => {
              setRjPenalty(total)
              setRjPenaltyDetail(detail)
            }} />
          </div>
        )}
      </div>
    </div>
  )
}
