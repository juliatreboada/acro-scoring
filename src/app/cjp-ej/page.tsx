'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import CJPEJAJView from '@/components/scoring/views/CJPEJAJView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, performances, rankingPerformances, currentPerfId, judgeScores, results,
    ejMethod,
    handleOpen, handleSkip, handleCJPSubmit, handleReopenScore, handleEditScore, handleJudgeScoreSubmit,
    submitError, clearSubmitError, practiceMode, startSectionPractice, stopSectionPractice,
  } = useJudgeSession()

  function handleSubmitEJScore(_p: string, ejScore: number) {
    const r = assignedRoles.find(r => r.role === 'EJ')
    if (!r) return
    handleJudgeScoreSubmit({ panelJudgeId: r.id, ejScore, ajScore: null, djDifficulty: null, djPenalty: null, cjpPenalty: null })
  }

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} className="min-h-screen bg-slate-100" submitError={submitError} onClearError={clearSubmitError} practiceMode={practiceMode} canControlPractice onStartPractice={() => { void startSectionPractice() }} onStopPractice={() => { void stopSectionPractice() }}>
      <CJPEJAJView
        lang={lang} elements={performances.find(p => p.id === currentPerfId)?.elements ?? []}
        ejMode={ejMethod === 'keyboard' ? 'keyboard' : 'elements'}
        includeAJ={false}
        panelJudges={panelJudges} performances={performances}
        rankingPerformances={rankingPerformances}
        currentPerfId={currentPerfId} judgeScores={judgeScores} results={results}
        onOpen={handleOpen} onSkip={handleSkip}
        onSubmitEJScore={handleSubmitEJScore}
        onSubmit={handleCJPSubmit} onReopenScore={handleReopenScore} onEditScore={handleEditScore}
      />
    </JudgeScoringShell>
  )
}
