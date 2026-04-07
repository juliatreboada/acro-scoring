'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import DJAJView from '@/components/dj-aj-scoring/DJAJView'
import AuthBar from '@/components/shared/AuthBar'
import type { Lang } from '@/components/aj-scoring/types'
import type { JudgeScore } from '@/components/cjp/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, currentPerfId, currentPerf, judgeScores, results,
    djMethod, handleJudgeScoreSubmit,
  } = useJudgeSession()

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  if (!sessionId) return (
    <div className="min-h-screen bg-slate-50"><AuthBar />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-48px)] gap-3">
        <p className="text-xl font-semibold text-slate-600">No active session</p>
      </div>
    </div>
  )

  const djRole = assignedRoles.find(r => r.role === 'DJ')
  const ajRole = assignedRoles.find(r => r.role === 'AJ')
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const mySubmitted = [djRole, ajRole].filter(Boolean).every(r => currentScores.some(s => s.panelJudgeId === r!.id))
  const currentResult = currentPerfId ? (results[currentPerfId] ?? null) : null
  const waitingForOtherScores = mySubmitted && !currentResult

  function handleSubmit(djDifficulty: number, djPenalty: number, ajScore: number) {
    const scores: JudgeScore[] = []
    if (djRole) scores.push({ panelJudgeId: djRole.id, ejScore: null, ajScore: null, djDifficulty, djPenalty, cjpPenalty: null })
    if (ajRole) scores.push({ panelJudgeId: ajRole.id, ejScore: null, ajScore, djDifficulty: null, djPenalty: null, cjpPenalty: null })
    scores.forEach(s => handleJudgeScoreSubmit(s))
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-slate-100">
      <AuthBar lang={lang} onLangChange={setLang} />
      <div className="flex-1 min-h-0 flex flex-col">
      <DJAJView
        currentPerf={currentPerf} lang={lang} elements={currentPerf?.elements ?? []}
        djMode={(djMethod as 'elements' | 'keyboard') ?? 'elements'}
        onSubmit={handleSubmit}
        panelJudges={panelJudges} judgeScores={currentScores}
        waitingForOtherScores={waitingForOtherScores}
        result={currentResult ?? undefined}
      />
      </div>
    </div>
  )
}
