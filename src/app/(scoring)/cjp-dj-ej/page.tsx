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
    assignedRoles, panelJudges, performances, rankingPerformances, currentPerfId, judgeScores, results,
    djMethod, ejMethod,
    handleOpen, handleSkip, handleCJPSubmit, handleReopenScore, handleUnpublishResult, handleEditScore, handleJudgeScoreSubmit,
    submitError, clearSubmitError, practiceMode, startSectionPractice, stopSectionPractice,
  } = useJudgeSession()

  function handleSubmitDJScore(_p: string, difficulty: number, penalty: number, detail: ScoreDetail) {
    const r = assignedRoles.find(r => r.role === 'DJ')
    if (!r) return
    const s: JudgeScore = { panelJudgeId: r.id, ejScore: null, ajScore: null, djDifficulty: difficulty, djPenalty: penalty, cjpPenalty: null, detail }
    handleJudgeScoreSubmit(s)
  }

  function handleSubmitEJScore(_p: string, ejScore: number) {
    const r = assignedRoles.find(r => r.role === 'EJ')
    if (!r) return
    handleJudgeScoreSubmit({ panelJudgeId: r.id, ejScore, ajScore: null, djDifficulty: null, djPenalty: null, cjpPenalty: null })
  }

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} className="min-h-screen bg-slate-100" submitError={submitError} onClearError={clearSubmitError} practiceMode={practiceMode} canControlPractice onStartPractice={() => { void startSectionPractice() }} onStopPractice={() => { void stopSectionPractice() }}>
      <ScoringView
        roles={['CJP', 'DJ', 'EJ']} lang={lang}
        elements={performances.find(p => p.id === currentPerfId)?.elements ?? []}
        djMode={djMethod === 'keyboard' ? 'keyboard' : 'elements'}
        ejMode={ejMethod === 'keyboard' ? 'keyboard' : 'elements'}
        panelJudges={panelJudges} performances={performances}
        rankingPerformances={rankingPerformances}
        currentPerfId={currentPerfId} judgeScores={judgeScores} results={results}
        onOpen={handleOpen} onSkip={handleSkip}
        onSubmitDJScore={handleSubmitDJScore} onSubmitEJScore={handleSubmitEJScore}
        onCJPSubmit={handleCJPSubmit} onReopenScore={handleReopenScore} onUnpublishResult={handleUnpublishResult} onEditScore={handleEditScore}
      />
    </JudgeScoringShell>
  )
}
