'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import { RJView } from '@/components/rg/RJView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    panelJudges, performances, currentPerfId, judgeScores, results,
    handleOpen, handleSkip, handleRJSubmit, handleReopenScore,
    submitError, clearSubmitError,
  } = useJudgeSession('rg')

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} submitError={submitError} onClearError={clearSubmitError}>
      <div className="md:flex-1 md:min-h-0 md:flex md:flex-col md:overflow-hidden">
        <RJView
          lang={lang}
          panelJudges={panelJudges}
          performances={performances}
          currentPerfId={currentPerfId}
          judgeScores={judgeScores}
          results={results}
          onOpen={handleOpen}
          onSkip={handleSkip}
          onSubmit={handleRJSubmit}
          onReopen={handleReopenScore}
        />
      </div>
    </JudgeScoringShell>
  )
}
