'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import CJPView from '@/components/scoring/views/CJPView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    panelJudges, performances, currentPerfId, judgeScores, results,
    handleOpen, handleSkip, handleCJPSubmit, handleReopenScore, handleEditScore,
    submitError, clearSubmitError,
  } = useJudgeSession()

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} className="min-h-screen bg-slate-100" submitError={submitError} onClearError={clearSubmitError}>
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
    </JudgeScoringShell>
  )
}
