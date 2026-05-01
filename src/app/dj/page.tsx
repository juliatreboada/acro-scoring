'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import DJView from '@/components/scoring/views/DJView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang } from '@/components/scoring/types'
import type { JudgeScore, ScoreDetail } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, currentPerfId, currentPerf, judgeScores, results,
    djMethod, handleJudgeScoreSubmit, submitError, clearSubmitError,
  } = useJudgeSession()

  const myRole = assignedRoles.find(r => r.role === 'DJ')
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const myScore = myRole ? currentScores.find(s => s.panelJudgeId === myRole.id) : null
  const currentResult = currentPerfId ? (results[currentPerfId] ?? null) : null
  const waitingForOtherScores = !!myScore && !currentResult

  function handleSubmit(djDifficulty: number, djPenalty: number, detail: ScoreDetail) {
    if (!myRole) return
    const s: JudgeScore = { panelJudgeId: myRole.id, ejScore: null, ajScore: null, djDifficulty, djPenalty, cjpPenalty: null, detail }
    handleJudgeScoreSubmit(s)
  }

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} submitError={submitError} onClearError={clearSubmitError}>
      <div className="flex-1 min-h-0 px-0 md:px-4 flex flex-col">
        <DJView
          currentPerf={currentPerf}
          lang={lang}
          elements={currentPerf?.elements ?? []}
          mode={(djMethod as 'elements' | 'keyboard') ?? 'elements'}
          onSubmit={handleSubmit}
          panelJudges={panelJudges}
          judgeScores={currentScores}
          waitingForOtherScores={waitingForOtherScores}
          result={currentResult ?? undefined}
        />
      </div>
    </JudgeScoringShell>
  )
}
