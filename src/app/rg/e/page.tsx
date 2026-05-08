'use client'

import { useState } from 'react'
import { useRGJudgeSession } from '@/hooks/useRGJudgeSession'
import { RGJudgeView } from '@/components/rg/RGJudgeView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang, JudgeScore } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    assignedRoles, currentPerf, currentPerfId, judgeScores, results,
    handleRGJudgeScoreSubmit, submitError, clearSubmitError,
  } = useRGJudgeSession()

  const myRole = assignedRoles.find(r => r.role === 'E')
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const myScore = myRole ? currentScores.find(s => s.panelJudgeId === myRole.id) : null
  const currentResult = currentPerfId ? (results[currentPerfId] ?? null) : null

  function handleSubmit(value: number) {
    if (!myRole) return
    const s: JudgeScore = {
      panelJudgeId: myRole.id, ejScore: value,
      ajScore: null, djDifficulty: null, djPenalty: null, cjpPenalty: null,
    }
    handleRGJudgeScoreSubmit(s)
  }

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} submitError={submitError} onClearError={clearSubmitError}>
      <div className="px-0 md:px-4 pt-4 md:flex-1 md:min-h-0 overflow-y-auto">
        <RGJudgeView
          lang={lang}
          role="E"
          currentPerf={currentPerf}
          mySubmittedScore={myScore?.ejScore ?? null}
          result={currentResult}
          onSubmit={handleSubmit}
        />
      </div>
    </JudgeScoringShell>
  )
}
