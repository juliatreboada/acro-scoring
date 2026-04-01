import type { Lang } from '../aj-scoring/types'
import type { PanelJudge, JudgeScore, RoutineResult } from '../cjp/types'
import { droppedIndices } from '../cjp/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    ej: 'EJ', aj: 'AJ', dj: 'DJ',
    avg: 'Avg',
    djDif: 'Dif.',
    djPen: 'Pen.',
    cjpPen: 'CJP',
    pen: 'Pen',
    final: 'Final',
    prov: 'Provisional',
    panelScores: 'Panel scores',
    djMismatch: 'DJ scores differ — averaged',
  },
  es: {
    ej: 'EJ', aj: 'AJ', dj: 'DJ',
    avg: 'Media',
    djDif: 'Dif.',
    djPen: 'Pen.',
    cjpPen: 'CJP',
    pen: 'Pen',
    final: 'Final',
    prov: 'Provisional',
    panelScores: 'Puntuaciones del panel',
    djMismatch: 'Puntuaciones DJ distintas — promediadas',
  },
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ScoreBoard({ judgeScores, panelJudges, result, lang }: {
  judgeScores: JudgeScore[]
  panelJudges: PanelJudge[]
  result?: RoutineResult | null
  lang: Lang
}) {
  const t = T[lang]

  const ejJudges = panelJudges.filter((j) => j.role === 'EJ').sort((a, b) => a.roleNumber - b.roleNumber)
  const ajJudges = panelJudges.filter((j) => j.role === 'AJ').sort((a, b) => a.roleNumber - b.roleNumber)
  const djJudges = panelJudges.filter((j) => j.role === 'DJ').sort((a, b) => a.roleNumber - b.roleNumber)

  const ejVals = ejJudges.map((j) => judgeScores.find((s) => s.panelJudgeId === j.id)?.ejScore)
  const ajVals = ajJudges.map((j) => judgeScores.find((s) => s.panelJudgeId === j.id)?.ajScore)

  const ejNums = ejVals.filter((v): v is number => v != null)
  const ajNums = ajVals.filter((v): v is number => v != null)

  const ejDropped = droppedIndices(ejNums)
  const ajDropped = droppedIndices(ajNums)

  // Map dropped indices (into ejNums / ajNums) back to judge-list indices
  const ejNumToJudgeIdx: number[] = []
  ejVals.forEach((v, i) => { if (v != null) ejNumToJudgeIdx.push(i) })
  const ejDroppedJudge = new Set(Array.from(ejDropped).map((i) => ejNumToJudgeIdx[i]))

  const ajNumToJudgeIdx: number[] = []
  ajVals.forEach((v, i) => { if (v != null) ajNumToJudgeIdx.push(i) })
  const ajDroppedJudge = new Set(Array.from(ajDropped).map((i) => ajNumToJudgeIdx[i]))

  const ejAvg = ejNums.length > 0
    ? ejNums.filter((_, i) => !ejDropped.has(i)).reduce((s, v) => s + v, 0) / (ejNums.length - ejDropped.size || 1)
    : null
  const ajAvg = ajNums.length > 0
    ? ajNums.filter((_, i) => !ajDropped.has(i)).reduce((s, v) => s + v, 0) / (ajNums.length - ajDropped.size || 1)
    : null

  const djSubmitted = djJudges
    .map((j) => judgeScores.find((s) => s.panelJudgeId === j.id))
    .filter((s): s is JudgeScore => s != null && s.djDifficulty != null)
  const djMismatch = djSubmitted.length >= 2 &&
    (djSubmitted.some((s) => s.djDifficulty !== djSubmitted[0].djDifficulty) ||
     djSubmitted.some((s) => s.djPenalty !== djSubmitted[0].djPenalty))

  function ScoreCell({ value, dropped }: { value: number | null | undefined; dropped?: boolean }) {
    if (value == null) return <span className="text-slate-300 text-sm">—</span>
    return (
      <span className={['tabular-nums font-mono text-sm', dropped ? 'line-through text-slate-300' : 'text-slate-800'].join(' ')}>
        {value}
      </span>
    )
  }

  return (
    <div className="w-full space-y-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide text-center">{t.panelScores}</p>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-slate-100">

          {/* EJ */}
          <div className="p-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{t.ej}</p>
            {ejJudges.map((j, i) => (
              <div key={j.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500 truncate">{t.ej}{j.roleNumber} {j.name}</span>
                <ScoreCell value={ejVals[i]} dropped={ejDroppedJudge.has(i)} />
              </div>
            ))}
            {ejJudges.length > 0 && (
              <div className="flex justify-between pt-2 mt-1 border-t border-slate-100">
                <span className="text-xs text-slate-400">{t.avg}</span>
                <span className="text-xs font-bold tabular-nums text-slate-600">
                  {ejAvg != null ? (ejAvg).toFixed(3) : '—'}
                </span>
              </div>
            )}
          </div>

          {/* AJ */}
          <div className="p-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{t.aj}</p>
            {ajJudges.map((j, i) => (
              <div key={j.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500 truncate">{t.aj}{j.roleNumber} {j.name}</span>
                <ScoreCell value={ajVals[i]} dropped={ajDroppedJudge.has(i)} />
              </div>
            ))}
            {ajJudges.length > 0 && (
              <div className="flex justify-between pt-2 mt-1 border-t border-slate-100">
                <span className="text-xs text-slate-400">{t.avg}</span>
                <span className="text-xs font-bold tabular-nums text-slate-600">
                  {ajAvg != null ? ajAvg.toFixed(3) : '—'}
                </span>
              </div>
            )}
          </div>

          {/* DJ */}
          <div className="p-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{t.dj}</p>
            {djJudges.map((j, idx) => {
              const s = judgeScores.find((sc) => sc.panelJudgeId === j.id)
              const showLabel = djJudges.length > 1
              return (
                <div key={j.id} className={idx > 0 ? 'mt-2 pt-2 border-t border-slate-100' : ''}>
                  {showLabel && (
                    <p className="text-[10px] text-slate-400 mb-1">{t.dj}{j.roleNumber} {j.name}</p>
                  )}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-xs text-slate-500">{t.djDif}</span>
                    <ScoreCell value={s?.djDifficulty} />
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-xs text-slate-500">{t.djPen}</span>
                    <ScoreCell value={s?.djPenalty != null ? -s.djPenalty : null} />
                  </div>
                  {idx === djJudges.length - 1 && (
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-slate-500">{t.cjpPen}</span>
                      <ScoreCell value={result?.cjpPenalty != null ? -result.cjpPenalty : null} />
                    </div>
                  )}
                </div>
              )
            })}
            {djMismatch && (
              <p className="text-[10px] text-amber-600 mt-2 leading-snug">⚠ {t.djMismatch}</p>
            )}
          </div>
        </div>
      </div>

      {/* result card — shown once CJP has submitted */}
      {result && (
        <div className="bg-slate-800 text-white rounded-xl px-4 py-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mb-2">
            <span>E <span className="text-slate-200 font-mono tabular-nums">{(result.eScore * 2).toFixed(3)}</span></span>
            <span>A <span className="text-slate-200 font-mono tabular-nums">{result.aScore.toFixed(3)}</span></span>
            <span>D <span className="text-slate-200 font-mono tabular-nums">{result.difScore.toFixed(2)}</span></span>
            {(result.difPenalty + result.cjpPenalty) > 0 && (
              <span>{t.pen} <span className="text-red-400 font-mono tabular-nums">−{(result.difPenalty + result.cjpPenalty).toFixed(1)}</span></span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className={['text-xs font-semibold px-2 py-0.5 rounded-full', result.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'].join(' ')}>
              {result.status === 'approved' ? t.final : t.prov}
            </span>
            <p className="text-4xl font-bold tabular-nums">{result.finalScore.toFixed(3)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
