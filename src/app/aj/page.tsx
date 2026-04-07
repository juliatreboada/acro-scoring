'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import AJView from '@/components/aj-scoring/AJView'
import AuthBar from '@/components/shared/AuthBar'
import type { Lang } from '@/components/aj-scoring/types'
import type { JudgeScore } from '@/components/cjp/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, currentPerfId, currentPerf, judgeScores, results,
    handleJudgeScoreSubmit,
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

  const myRole = assignedRoles.find(r => r.role === 'AJ')
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const myScore = myRole ? currentScores.find(s => s.panelJudgeId === myRole.id) : null
  const currentResult = currentPerfId ? (results[currentPerfId] ?? null) : null
  const waitingForOtherScores = !!myScore && !currentResult

  function handleSubmit(ajScore: number) {
    if (!myRole) return
    const s: JudgeScore = { panelJudgeId: myRole.id, ejScore: null, ajScore, djDifficulty: null, djPenalty: null, cjpPenalty: null }
    handleJudgeScoreSubmit(s)
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:h-[100dvh] md:overflow-hidden bg-slate-50">
      <AuthBar lang={lang} onLangChange={setLang} />
      <div className="flex-1 min-h-0 overflow-auto">
      <div className="max-w-lg mx-auto py-4">
        <AJView
          currentPerf={currentPerf}
          lang={lang}
          onSubmit={handleSubmit}
          panelJudges={panelJudges}
          judgeScores={currentScores}
          waitingForOtherScores={waitingForOtherScores}
          result={currentResult ?? undefined}
        />
      </div>
      </div>
    </div>
  )
}
