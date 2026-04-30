'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import AJView from '@/components/scoring/views/AJView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang } from '@/components/scoring/types'
import type { JudgeScore } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, currentPerfId, currentPerf, judgeScores, results,
    handleJudgeScoreSubmit, submitError, clearSubmitError,
  } = useJudgeSession()

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
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} className="min-h-[100dvh] flex flex-col md:h-[100dvh] md:overflow-hidden bg-slate-50" submitError={submitError} onClearError={clearSubmitError}>
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
    </JudgeScoringShell>
  )
}
