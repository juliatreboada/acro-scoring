'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import { RJView } from '@/components/rg/RJView'
import { RGJudgeView } from '@/components/rg/RGJudgeView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang, JudgeScore } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const [tab, setTab] = useState<'rj' | 'a'>('rj')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, performances, currentPerf, currentPerfId, judgeScores, results,
    handleOpen, handleSkip, handleRJSubmit, handleReopenScore,
    handleRGJudgeScoreSubmit, submitError, clearSubmitError,
  } = useJudgeSession('rg')

  const aRole = assignedRoles.find(r => r.role === 'A')
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const myAScore = aRole ? currentScores.find(s => s.panelJudgeId === aRole.id) : null
  const currentResult = currentPerfId ? (results[currentPerfId] ?? null) : null

  function handleSubmitA(value: number) {
    if (!aRole) return
    const s: JudgeScore = { panelJudgeId: aRole.id, ajScore: value, ejScore: null, djDifficulty: null, djPenalty: null, cjpPenalty: null }
    handleRGJudgeScoreSubmit(s)
  }

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} submitError={submitError} onClearError={clearSubmitError}>
      <div className="flex border-b border-slate-200 bg-white shrink-0">
        {(['rj', 'a'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={['flex-1 py-3 text-sm font-semibold uppercase tracking-wide transition-colors',
              tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'].join(' ')}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {tab === 'rj' ? (
          <RJView lang={lang} panelJudges={panelJudges} performances={performances}
            currentPerfId={currentPerfId} judgeScores={judgeScores} results={results}
            onOpen={handleOpen} onSkip={handleSkip} onSubmit={handleRJSubmit} onReopen={handleReopenScore} />
        ) : (
          <div className="px-0 pt-4">
            <RGJudgeView lang={lang} role="A" currentPerf={currentPerf}
              mySubmittedScore={myAScore?.ajScore ?? null} result={currentResult} onSubmit={handleSubmitA} />
          </div>
        )}
      </div>
    </JudgeScoringShell>
  )
}
