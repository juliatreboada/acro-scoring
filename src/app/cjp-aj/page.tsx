'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import CJPAJView from '@/components/cjp-aj-scoring/CJPAJView'
import AuthBar from '@/components/shared/AuthBar'
import type { Lang } from '@/components/aj-scoring/types'
import type { JudgeScore } from '@/components/cjp/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, performances, currentPerfId, judgeScores, results,
    handleOpen, handleSkip, handleCJPSubmit, handleReopenScore, handleEditScore, handleJudgeScoreSubmit,
  } = useJudgeSession()

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  if (!sessionId) return (
    <div className="min-h-screen bg-slate-50"><AuthBar />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-48px)] gap-3 px-4">
        <p className="text-xl font-semibold text-slate-600">No active session</p>
      </div>
    </div>
  )

  function handleSubmitAJScore(_perfId: string, score: number) {
    const ajRole = assignedRoles.find(r => r.role === 'AJ')
    if (!ajRole) return
    const s: JudgeScore = { panelJudgeId: ajRole.id, ejScore: null, ajScore: score, djDifficulty: null, djPenalty: null, cjpPenalty: null }
    handleJudgeScoreSubmit(s)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar lang={lang} onLangChange={setLang} />
      <CJPAJView
        lang={lang}
        panelJudges={panelJudges}
        performances={performances}
        currentPerfId={currentPerfId}
        judgeScores={judgeScores}
        results={results}
        onOpen={handleOpen}
        onSkip={handleSkip}
        onSubmitAJScore={handleSubmitAJScore}
        onSubmit={handleCJPSubmit}
        onReopenScore={handleReopenScore}
        onEditScore={handleEditScore}
      />
    </div>
  )
}
