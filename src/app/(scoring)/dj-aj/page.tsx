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
    djMethod, handleJudgeScoreSubmit, submitError, clearSubmitError, practiceMode,
  } = useJudgeSession()

  const djRole = assignedRoles.find(r => r.role === 'DJ')
  const ajRole = assignedRoles.find(r => r.role === 'AJ')
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const myDJScore = djRole ? currentScores.find(s => s.panelJudgeId === djRole.id) : null
  const myAJScore = ajRole ? currentScores.find(s => s.panelJudgeId === ajRole.id) : null
  const mySubmitted = [djRole, ajRole].filter(Boolean).every(r => currentScores.some(s => s.panelJudgeId === r!.id))
  const currentResult = currentPerfId ? (results[currentPerfId] ?? null) : null
  const waitingForOtherScores = mySubmitted && !currentResult

  function handleDJSubmit(difficulty: number, penalty: number, detail: ScoreDetail) {
    if (!djRole) return
    const s: JudgeScore = { panelJudgeId: djRole.id, ejScore: null, ajScore: null, djDifficulty: difficulty, djPenalty: penalty, cjpPenalty: null, detail }
    handleJudgeScoreSubmit(s)
  }

  function handleAJSubmit(score: number) {
    if (!ajRole) return
    const s: JudgeScore = { panelJudgeId: ajRole.id, ejScore: null, ajScore: score, djDifficulty: null, djPenalty: null, cjpPenalty: null }
    handleJudgeScoreSubmit(s)
  }

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} submitError={submitError} onClearError={clearSubmitError} practiceMode={practiceMode}>
      <div className="flex-1 min-h-0 flex flex-col">
        <ScoringView
          roles={['DJ', 'AJ']} lang={lang}
          currentPerf={currentPerf}
          elements={currentPerf?.elements ?? []}
          djMode={(djMethod as 'elements' | 'keyboard') ?? 'elements'}
          onDJSubmit={handleDJSubmit}
          onAJSubmit={handleAJSubmit}
          panelJudges={panelJudges} singleJudgeScores={currentScores}
          waitingForOtherScores={waitingForOtherScores}
          result={currentResult ?? undefined}
          myDJSubmittedScore={myDJScore ? { difficulty: myDJScore.djDifficulty!, penalty: myDJScore.djPenalty! } : null}
          myAJSubmittedScore={myAJScore?.ajScore ?? null}
        />
      </div>
    </JudgeScoringShell>
  )
}
