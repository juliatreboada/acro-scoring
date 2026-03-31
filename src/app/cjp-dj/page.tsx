'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import CJPDJView from '@/components/cjp-dj-scoring/CJPDJView'
import AuthBar from '@/components/shared/AuthBar'
import type { Lang } from '@/components/aj-scoring/types'
import type { TsElement } from '@/components/ej-scoring/types'
import type { JudgeScore } from '@/components/cjp/types'

const ELEMENTS: TsElement[] = []

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

  function handleSubmitDJScore(_perfId: string, difficulty: number, penalty: number) {
    const djRole = assignedRoles.find(r => r.role === 'DJ')
    if (!djRole) return
    const s: JudgeScore = { panelJudgeId: djRole.id, ejScore: null, ajScore: null, djDifficulty: difficulty, djPenalty: penalty, cjpPenalty: null }
    handleJudgeScoreSubmit(s)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AuthBar lang={lang} onLangChange={setLang} />
      <CJPDJView
        lang={lang}
        elements={ELEMENTS}
        panelJudges={panelJudges}
        performances={performances}
        currentPerfId={currentPerfId}
        judgeScores={judgeScores}
        results={results}
        onOpen={handleOpen}
        onSkip={handleSkip}
        onSubmitDJScore={handleSubmitDJScore}
        onSubmit={handleCJPSubmit}
        onReopenScore={handleReopenScore}
        onEditScore={handleEditScore}
      />
    </div>
  )
}
