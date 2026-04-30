'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import DJEJAJView from '@/components/scoring/views/DJEJAJView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang } from '@/components/scoring/types'
import type { JudgeScore, ScoreDetail } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, currentPerfId, currentPerf, judgeScores, results,
    djMethod, ejMethod, handleJudgeScoreSubmit, submitError, clearSubmitError,
  } = useJudgeSession()

  const djRole = assignedRoles.find(r => r.role === 'DJ')
  const ejRole = assignedRoles.find(r => r.role === 'EJ')
  const ajRole = assignedRoles.find(r => r.role === 'AJ')
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const myDJScore = djRole ? currentScores.find(s => s.panelJudgeId === djRole.id) : null
  const myEJScore = ejRole ? currentScores.find(s => s.panelJudgeId === ejRole.id) : null
  const myAJScore = ajRole ? currentScores.find(s => s.panelJudgeId === ajRole.id) : null
  const mySubmitted = [djRole, ejRole, ajRole].filter(Boolean).every(r => currentScores.some(s => s.panelJudgeId === r!.id))
  const currentResult = currentPerfId ? (results[currentPerfId] ?? null) : null
  const waitingForOtherScores = mySubmitted && !currentResult

  function handleSubmit(djDifficulty: number, djPenalty: number, ejScore: number, ajScore: number, detail: ScoreDetail) {
    const scores: JudgeScore[] = []
    if (djRole) scores.push({ panelJudgeId: djRole.id, ejScore: null, ajScore: null, djDifficulty, djPenalty, cjpPenalty: null,
      detail: { djFlags: detail.djFlags, djExtraElements: detail.djExtraElements, djIncorrectTs: detail.djIncorrectTs } })
    if (ejRole) scores.push({ panelJudgeId: ejRole.id, ejScore, ajScore: null, djDifficulty: null, djPenalty: null, cjpPenalty: null,
      detail: { ejDeductions: detail.ejDeductions, ejExtraElements: detail.ejExtraElements } })
    if (ajRole) scores.push({ panelJudgeId: ajRole.id, ejScore: null, ajScore, djDifficulty: null, djPenalty: null, cjpPenalty: null })
    scores.forEach(s => handleJudgeScoreSubmit(s))
  }

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} submitError={submitError} onClearError={clearSubmitError}>
      <div className="md:flex-1 md:min-h-0 md:flex md:flex-col">
        <DJEJAJView
          currentPerf={currentPerf} lang={lang} elements={currentPerf?.elements ?? []}
          djMode={(djMethod as 'elements' | 'keyboard') ?? 'elements'}
          ejMode={(ejMethod as 'elements' | 'keyboard') ?? 'elements'}
          onSubmit={handleSubmit}
          panelJudges={panelJudges} judgeScores={currentScores}
          waitingForOtherScores={waitingForOtherScores}
          result={currentResult ?? undefined}
          myDJSubmittedScore={myDJScore ? { difficulty: myDJScore.djDifficulty!, penalty: myDJScore.djPenalty! } : null}
          myEJSubmittedScore={myEJScore?.ejScore ?? null}
          myAJSubmittedScore={myAJScore?.ajScore ?? null}
        />
      </div>
    </JudgeScoringShell>
  )
}
