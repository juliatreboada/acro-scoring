'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import EJView from '@/components/scoring/views/EJView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang } from '@/components/scoring/types'
import type { JudgeScore, ScoreDetail } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, currentPerfId, currentPerf, judgeScores, results,
    ejMethod, handleJudgeScoreSubmit, submitError, clearSubmitError,
  } = useJudgeSession()

  const myRole = assignedRoles.find(r => r.role === 'EJ')
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const myScore = myRole ? currentScores.find(s => s.panelJudgeId === myRole.id) : null
  const currentResult = currentPerfId ? (results[currentPerfId] ?? null) : null
  const waitingForOtherScores = !!myScore && !currentResult
  const mySubmittedScore = myScore?.ejScore ?? null

  function handleSubmit(ejScore: number, detail: ScoreDetail) {
    if (!myRole) return
    const s: JudgeScore = { panelJudgeId: myRole.id, ejScore, ajScore: null, djDifficulty: null, djPenalty: null, cjpPenalty: null, detail }
    handleJudgeScoreSubmit(s)
  }

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} submitError={submitError} onClearError={clearSubmitError}>
      <div className="md:flex-1 md:min-h-0 px-0 md:px-4 md:flex md:flex-col">
        <EJView
          currentPerf={currentPerf}
          lang={lang}
          elements={currentPerf?.elements ?? []}
          mode={(ejMethod as 'elements' | 'keyboard') ?? 'elements'}
          onSubmit={handleSubmit}
          mySubmittedScore={mySubmittedScore}
          panelJudges={myScore ? panelJudges : undefined}
          judgeScores={myScore ? currentScores : undefined}
          waitingForOtherScores={waitingForOtherScores}
          result={currentResult ?? undefined}
        />
      </div>
    </JudgeScoringShell>
  )
}
