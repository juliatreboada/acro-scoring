'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import DJAJView from '@/components/scoring/views/DJAJView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang } from '@/components/scoring/types'
import type { JudgeScore } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, currentPerfId, currentPerf, judgeScores, results,
    djMethod, handleJudgeScoreSubmit, submitError, clearSubmitError,
  } = useJudgeSession()

  const djRole = assignedRoles.find(r => r.role === 'DJ')
  const ajRole = assignedRoles.find(r => r.role === 'AJ')
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const mySubmitted = [djRole, ajRole].filter(Boolean).every(r => currentScores.some(s => s.panelJudgeId === r!.id))
  const currentResult = currentPerfId ? (results[currentPerfId] ?? null) : null
  const waitingForOtherScores = mySubmitted && !currentResult

  function handleSubmit(djDifficulty: number, djPenalty: number, ajScore: number) {
    const scores: JudgeScore[] = []
    if (djRole) scores.push({ panelJudgeId: djRole.id, ejScore: null, ajScore: null, djDifficulty, djPenalty, cjpPenalty: null })
    if (ajRole) scores.push({ panelJudgeId: ajRole.id, ejScore: null, ajScore, djDifficulty: null, djPenalty: null, cjpPenalty: null })
    scores.forEach(s => handleJudgeScoreSubmit(s))
  }

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} submitError={submitError} onClearError={clearSubmitError}>
      <div className="flex-1 min-h-0 flex flex-col">
        <DJAJView
          currentPerf={currentPerf} lang={lang} elements={currentPerf?.elements ?? []}
          djMode={(djMethod as 'elements' | 'keyboard') ?? 'elements'}
          onSubmit={handleSubmit}
          panelJudges={panelJudges} judgeScores={currentScores}
          waitingForOtherScores={waitingForOtherScores}
          result={currentResult ?? undefined}
        />
      </div>
    </JudgeScoringShell>
  )
}
