'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import CJPDJEJView from '@/components/scoring/views/CJPDJEJView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang } from '@/components/scoring/types'
import type { JudgeScore, ScoreDetail } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, performances, currentPerfId, judgeScores, results,
    djMethod, ejMethod,
    handleOpen, handleSkip, handleCJPSubmit, handleReopenScore, handleEditScore, handleJudgeScoreSubmit,
    submitError, clearSubmitError,
  } = useJudgeSession()

  function handleSubmitDJScore(_p: string, difficulty: number, penalty: number, detail: ScoreDetail) {
    const r = assignedRoles.find(r => r.role === 'DJ')
    if (!r) return
    handleJudgeScoreSubmit({ panelJudgeId: r.id, ejScore: null, ajScore: null, djDifficulty: difficulty, djPenalty: penalty, cjpPenalty: null, detail })
  }

  function handleSubmitEJScore(_p: string, ejScore: number) {
    const r = assignedRoles.find(r => r.role === 'EJ')
    if (!r) return
    handleJudgeScoreSubmit({ panelJudgeId: r.id, ejScore, ajScore: null, djDifficulty: null, djPenalty: null, cjpPenalty: null })
  }

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} className="min-h-screen bg-slate-100" submitError={submitError} onClearError={clearSubmitError}>
      <CJPDJEJView
        lang={lang} elements={performances.find(p => p.id === currentPerfId)?.elements ?? []}
        djMode={djMethod === 'keyboard' ? 'keyboard' : 'elements'}
        ejMode={ejMethod === 'keyboard' ? 'keyboard' : 'elements'}
        panelJudges={panelJudges} performances={performances}
        currentPerfId={currentPerfId} judgeScores={judgeScores} results={results}
        onOpen={handleOpen} onSkip={handleSkip}
        onSubmitDJScore={handleSubmitDJScore} onSubmitEJScore={handleSubmitEJScore}
        onSubmit={handleCJPSubmit} onReopenScore={handleReopenScore} onEditScore={handleEditScore}
      />
    </JudgeScoringShell>
  )
}
