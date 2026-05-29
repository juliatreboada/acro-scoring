'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import ScoringView from '@/components/scoring/ScoringView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang } from '@/components/scoring/types'
import type { JudgeScore, ScoreDetail } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, currentPerfId, currentPerf, judgeScores, results,
    ejMethod, handleJudgeScoreSubmit, submitError, clearSubmitError, practiceMode,
  } = useJudgeSession()

  const ejRole = assignedRoles.find(r => r.role === 'EJ')
  const ajRole = assignedRoles.find(r => r.role === 'AJ')
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const myEJScore = ejRole ? currentScores.find(s => s.panelJudgeId === ejRole.id) : null
  const myAJScore = ajRole ? currentScores.find(s => s.panelJudgeId === ajRole.id) : null
  const mySubmitted = [ejRole, ajRole].filter(Boolean).every(r => currentScores.some(s => s.panelJudgeId === r!.id))
  const currentResult = currentPerfId ? (results[currentPerfId] ?? null) : null
  const waitingForOtherScores = mySubmitted && !currentResult

  function handleEJSubmit(score: number, detail: ScoreDetail) {
    if (!ejRole) return
    const s: JudgeScore = { panelJudgeId: ejRole.id, ejScore: score, ajScore: null, djDifficulty: null, djPenalty: null, cjpPenalty: null, detail }
    handleJudgeScoreSubmit(s)
  }

  function handleAJSubmit(score: number) {
    if (!ajRole) return
    const s: JudgeScore = { panelJudgeId: ajRole.id, ejScore: null, ajScore: score, djDifficulty: null, djPenalty: null, cjpPenalty: null }
    handleJudgeScoreSubmit(s)
  }

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} submitError={submitError} onClearError={clearSubmitError} practiceMode={practiceMode}>
      <div className="md:flex-1 md:min-h-0 md:flex md:flex-col">
        <ScoringView
          roles={['EJ', 'AJ']} lang={lang}
          currentPerf={currentPerf}
          elements={currentPerf?.elements ?? []}
          ejMode={(ejMethod as 'elements' | 'keyboard') ?? 'elements'}
          onEJSubmit={handleEJSubmit}
          onAJSubmit={handleAJSubmit}
          panelJudges={panelJudges} singleJudgeScores={currentScores}
          waitingForOtherScores={waitingForOtherScores}
          result={currentResult ?? undefined}
          myEJSubmittedScore={myEJScore?.ejScore ?? null}
          myAJSubmittedScore={myAJScore?.ajScore ?? null}
        />
      </div>
    </JudgeScoringShell>
  )
}
