'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import CJPAJView from '@/components/scoring/views/CJPAJView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang } from '@/components/scoring/types'
import type { JudgeScore } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, performances, currentPerfId, judgeScores, results,
    handleOpen, handleSkip, handleCJPSubmit, handleReopenScore, handleEditScore, handleJudgeScoreSubmit,
    submitError, clearSubmitError,
  } = useJudgeSession()

  function handleSubmitAJScore(_perfId: string, score: number) {
    const ajRole = assignedRoles.find(r => r.role === 'AJ')
    if (!ajRole) return
    const s: JudgeScore = { panelJudgeId: ajRole.id, ejScore: null, ajScore: score, djDifficulty: null, djPenalty: null, cjpPenalty: null }
    handleJudgeScoreSubmit(s)
  }

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} className="min-h-screen bg-slate-50" submitError={submitError} onClearError={clearSubmitError}>
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
    </JudgeScoringShell>
  )
}
