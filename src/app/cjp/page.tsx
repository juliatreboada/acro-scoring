'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import CJPView from '@/components/cjp/CJPView'
import AuthBar from '@/components/shared/AuthBar'
import type { Lang } from '@/components/aj-scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    panelJudges, performances, currentPerfId, judgeScores, results,
    handleOpen, handleSkip, handleCJPSubmit, handleReopenScore, handleEditScore,
  } = useJudgeSession()

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  if (!sessionId) return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-48px)] gap-3 px-4">
        <p className="text-xl font-semibold text-slate-600">No active session</p>
        <p className="text-sm text-slate-400 max-w-xs text-center">You have no judging sessions assigned at this time.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100">
      <AuthBar lang={lang} onLangChange={setLang} />

      <CJPView
        isCJP={true}
        lang={lang}
        panelJudges={panelJudges}
        performances={performances}
        currentPerfId={currentPerfId}
        judgeScores={judgeScores}
        results={results}
        onOpen={handleOpen}
        onSkip={handleSkip}
        onSubmit={handleCJPSubmit}
        onReopenScore={handleReopenScore}
        onEditScore={handleEditScore}
      />
    </div>
  )
}
