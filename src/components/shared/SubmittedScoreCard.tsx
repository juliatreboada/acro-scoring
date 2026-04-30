export function SubmittedScoreCard({ label, score, color, decimals = 2 }: {
  label: string
  score: number
  color: string
  decimals?: number
}) {
  return (
    <div className="px-4 pb-8 flex flex-col items-center gap-4 pt-4">
      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className={`text-4xl font-bold tabular-nums ${color}`}>{score.toFixed(decimals)}</p>
      </div>
    </div>
  )
}
