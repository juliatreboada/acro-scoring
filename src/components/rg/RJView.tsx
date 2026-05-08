'use client'

import { useState, useEffect } from 'react'
import type { Lang, PanelJudge, ScoringPerformance, JudgeScore, RoutineResult } from '@/components/scoring/types'
import { computeRGResult, average } from '@/components/scoring/types'
import type { Json } from '@/lib/database.types'
import { RJPenaltyGrid } from './RJPenaltyGrid'
import { categoryLabel } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    noPerf:     'No performance open',
    noPerfSub:  'Select a performance from the list to open it.',
    open:       'Open',
    skip:       'Skip',
    skipped:    'Skipped',
    final:      'Final',
    prov:       'Prov.',
    reopen:     'Re-open all',
    submitProv: 'Submit provisional',
    submitFinal:'Submit final',
    confirmFinal:'Confirm final',
    nextPerf:   'Next',
    ranking:    'Ranking',
    waiting:    'Waiting for scores…',
    scores:     'Scores',
    e:   'E', a:   'A', da: 'DA', db: 'DB',
    avg: 'Avg',
    final_score:'Final',
    penalty:    'RJ Penalty',
    approved:   'Approved',
    provisional:'Provisional',
  },
  es: {
    noPerf:     'Sin actuación abierta',
    noPerfSub:  'Selecciona una actuación de la lista para abrirla.',
    open:       'Abrir',
    skip:       'Saltar',
    skipped:    'Saltada',
    final:      'Final',
    prov:       'Prov.',
    reopen:     'Reabrir todo',
    submitProv: 'Enviar provisional',
    submitFinal:'Enviar final',
    confirmFinal:'Confirmar final',
    nextPerf:   'Siguiente',
    ranking:    'Clasificación',
    waiting:    'Esperando puntuaciones…',
    scores:     'Puntuaciones',
    e:   'E', a:   'A', da: 'DA', db: 'DB',
    avg: 'Media',
    final_score:'Final',
    penalty:    'Pen. RJ',
    approved:   'Aprobado',
    provisional:'Provisional',
  },
}

// ─── performance list ─────────────────────────────────────────────────────────

function PerformanceList({ lang, performances, currentPerfId, results, onOpen, onSkip }: {
  lang: Lang
  performances: ScoringPerformance[]
  currentPerfId: string | null
  results: Record<string, RoutineResult>
  onOpen: (id: string) => void
  onSkip: (id: string) => void
}) {
  const t = T[lang]
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

// ─── score row ────────────────────────────────────────────────────────────────

function ScoreRow({ label, values, avg }: { label: string; values: (number | null)[]; avg: number }) {
  const hasAny = values.some(v => v !== null)
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
      <span className="w-8 text-xs font-bold text-slate-500 shrink-0">{label}</span>
      <div className="flex gap-1.5 flex-1">
        {values.map((v, i) => (
          <span key={i} className={[
            'px-2.5 py-1 rounded-lg text-sm font-mono font-semibold tabular-nums',
            v !== null ? 'bg-slate-100 text-slate-800' : 'bg-slate-50 text-slate-300',
          ].join(' ')}>
            {v !== null ? v.toFixed(3) : '—'}
          </span>
        ))}
      </div>
      {hasAny && values.length > 1 && (
        <span className="text-sm font-bold tabular-nums text-slate-700 w-16 text-right">{avg.toFixed(3)}</span>
      )}
      {hasAny && values.length === 1 && (
        <span className="text-sm font-bold tabular-nums text-slate-700 w-16 text-right">{values[0]!.toFixed(values[0]! % 1 === 0 ? 1 : 2)}</span>
      )}
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
  const t = T[lang]

  const [rjPenalty,       setRjPenalty]       = useState(0)
  const [rjPenaltyDetail, setRjPenaltyDetail] = useState<Json>({})
  const [confirmFinal,    setConfirmFinal]    = useState(false)
  const [reviewingId,     setReviewingId]     = useState<string | null>(null)

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

  const eJudges = panelJudges.filter(j => j.role === 'E')
  const aJudges = panelJudges.filter(j => j.role === 'A')
  const daJudge = panelJudges.find(j => j.role === 'DA')
  const dbJudge = panelJudges.find(j => j.role === 'DB')

  const eVals  = eJudges.map(j => currentScores.find(s => s.panelJudgeId === j.id)?.ejScore ?? null)
  const aVals  = aJudges.map(j => currentScores.find(s => s.panelJudgeId === j.id)?.ajScore ?? null)
  const daVal  = daJudge ? (currentScores.find(s => s.panelJudgeId === daJudge.id)?.djDifficulty ?? null) : null
  const dbVal  = dbJudge ? (currentScores.find(s => s.panelJudgeId === dbJudge.id)?.dbScore ?? null) : null

  const eAvg  = average(eVals.filter((v): v is number => v !== null))
  const aAvg  = average(aVals.filter((v): v is number => v !== null))

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

      {/* ── left: performance list (md+) ── */}
      <div className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-slate-100 md:overflow-y-auto shrink-0">
        <PerformanceList lang={lang} performances={performances}
          currentPerfId={currentPerfId} results={results}
          onOpen={id => { setReviewingId(null); onOpen(id) }} onSkip={onSkip} />
      </div>

      {/* ── right: scoring panel ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 md:max-w-xl md:mx-auto">

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
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">{t.scores}</p>
              {eJudges.length > 0 && (
                <ScoreRow label={t.e} values={eVals} avg={eAvg} />
              )}
              {aJudges.length > 0 && (
                <ScoreRow label={t.a} values={aVals} avg={aAvg} />
              )}
              {daJudge && (
                <ScoreRow label={t.da} values={[daVal]} avg={daVal ?? 0} />
              )}
              {dbJudge && (
                <ScoreRow label={t.db} values={[dbVal]} avg={dbVal ?? 0} />
              )}
            </div>

            {/* ── penalty ── */}
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-4">
              <RJPenaltyGrid lang={lang} ruleset={currentPerf.category as 'Individual' | 'Group'} onChange={(total, detail: Json) => {
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
                    <button onClick={() => onReopen(activePerfId!, 'all')}
                      className="w-full py-2 text-xs text-slate-400 hover:text-red-500 transition-colors">
                      {t.reopen}
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
    </div>
  )
}
