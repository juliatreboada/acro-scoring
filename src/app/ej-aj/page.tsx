'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import EJAJView from '@/components/scoring/views/EJAJView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang } from '@/components/scoring/types'
import type { JudgeScore } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, currentPerfId, currentPerf, judgeScores, results,
    ejMethod, handleJudgeScoreSubmit, submitError, clearSubmitError,
  } = useJudgeSession()

  const ejRole = assignedRoles.find(r => r.role === 'EJ')
  const ajRole = assignedRoles.find(r => r.role === 'AJ')
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const myEJScore = ejRole ? currentScores.find(s => s.panelJudgeId === ejRole.id) : null
  const myAJScore = ajRole ? currentScores.find(s => s.panelJudgeId === ajRole.id) : null
  const mySubmitted = [ejRole, ajRole].filter(Boolean).every(r => currentScores.some(s => s.panelJudgeId === r!.id))
  const currentResult = currentPerfId ? (results[currentPerfId] ?? null) : null
  const waitingForOtherScores = mySubmitted && !currentResult

  function handleSubmit(ejScore: number, ajScore: number) {
    const scores: JudgeScore[] = []
    if (ejRole) scores.push({ panelJudgeId: ejRole.id, ejScore, ajScore: null, djDifficulty: null, djPenalty: null, cjpPenalty: null })
    if (ajRole) scores.push({ panelJudgeId: ajRole.id, ejScore: null, ajScore, djDifficulty: null, djPenalty: null, cjpPenalty: null })
    scores.forEach(s => handleJudgeScoreSubmit(s))
  }

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} submitError={submitError} onClearError={clearSubmitError}>
      <div className="md:flex-1 md:min-h-0 md:flex md:flex-col">
        <EJAJView
          currentPerf={currentPerf} lang={lang} elements={currentPerf?.elements ?? []}
          ejMode={(ejMethod as 'elements' | 'keyboard') ?? 'elements'}
          onSubmit={handleSubmit}
          panelJudges={panelJudges} judgeScores={currentScores}
          waitingForOtherScores={waitingForOtherScores}
          result={currentResult ?? undefined}
          myEJSubmittedScore={myEJScore?.ejScore ?? null}
          myAJSubmittedScore={myAJScore?.ajScore ?? null}
        />
      </div>
    </JudgeScoringShell>
  )
}
