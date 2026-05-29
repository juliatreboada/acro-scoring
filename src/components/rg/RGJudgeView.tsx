'use client'

import { useEffect, useRef, useState } from 'react'
import type { Lang, ScoringPerformance, RoutineResult } from '@/components/scoring/types'
import { RGNumericKeyboard } from './RGNumericKeyboard'
import { useT } from '@/lib/useT'

function WaitingScreen({ lang }: { lang: Lang }) {
  const t = useT('RGJudgeView', lang)
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

function PerfHeader({ perf, role }: { perf: ScoringPerformance; role: string }) {
  return (
    <div className="bg-slate-800 text-white px-4 py-3 rounded-xl mb-1 space-y-0.5">
      <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
        #{perf.position} · {perf.ageGroup} · {perf.category} · {perf.routineType} · <span className="text-blue-300">{role}</span>
      </span>
      <p className="text-lg font-semibold leading-tight">{perf.gymnasts}</p>
    </div>
  )
}

export function RGJudgeView({ lang, role, currentPerf, mySubmittedScore, result, onSubmit }: {
  lang: Lang
  role: 'E' | 'A' | 'DA' | 'DB'
  currentPerf: ScoringPerformance | null
  mySubmittedScore: number | null
  result: RoutineResult | null
  onSubmit: (value: number) => void
}) {
  const t = useT('RGJudgeView', lang)
  const prevPerfId = useRef<string | null>(null)
  const [localSubmitted, setLocalSubmitted] = useState(false)
  const [localScore, setLocalScore] = useState<number | null>(null)

  useEffect(() => {
    if (currentPerf?.id !== prevPerfId.current) {
      setLocalSubmitted(false)
      setLocalScore(null)
      prevPerfId.current = currentPerf?.id ?? null
    }
  }, [currentPerf?.id])

  if (!currentPerf) return <WaitingScreen lang={lang} />

  const submitted = localSubmitted || mySubmittedScore !== null
  const displayScore = localScore ?? mySubmittedScore

  const inverted    = role === 'E'
  const maxDecimals: 1 | 2 = (role === 'DA' || role === 'DB') ? 2 : 1

  // ── submitted state ──────────────────────────────────────────────────────────
  if (submitted && displayScore !== null) {
    return (
      <div className="px-4 pb-8 space-y-4 max-w-md mx-auto">
        <PerfHeader perf={currentPerf} role={role} />

        <div className="flex flex-col items-center text-center gap-3 py-6">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium uppercase tracking-wide text-xs">{t.submitted}</p>
          <p className="text-5xl font-bold text-slate-800 tabular-nums">{displayScore.toFixed(maxDecimals)}</p>
          <p className="text-xs text-slate-400">{t.yourScore} · {role}</p>
        </div>

        {result ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-4 text-center space-y-1">
            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-widest">{t.approved}</p>
            <p className="text-3xl font-bold text-emerald-700 tabular-nums">{result.finalScore.toFixed(3)}</p>
            <p className="text-xs text-emerald-500">{t.finalScore}</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.65-3.65L20 7M4 17l1.35 1.65A9 9 0 0020 15" />
            </svg>
            <p className="text-sm">{t.waiting2}</p>
          </div>
        )}
      </div>
    )
  }

  // ── scoring state ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto">
      <PerfHeader perf={currentPerf} role={role} />
      <p className="text-xs text-slate-400 text-center mt-2 mb-4">{t.roleHint[role]}</p>
      <RGNumericKeyboard
        lang={lang}
        maxDecimals={maxDecimals}
        inverted={inverted}
        onSubmit={value => {
          setLocalScore(value)
          setLocalSubmitted(true)
          onSubmit(value)
        }}
      />
    </div>
  )
}
