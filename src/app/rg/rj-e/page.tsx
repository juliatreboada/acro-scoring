'use client'

import { useState } from 'react'
import { useRGJudgeSession } from '@/hooks/useRGJudgeSession'
import { RJView } from '@/components/rg/RJView'
import { RGJudgeView } from '@/components/rg/RGJudgeView'
import { JudgeScoringShell } from '@/components/shared/JudgeScoringShell'
import type { Lang, JudgeScore } from '@/components/scoring/types'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')
  const [tab, setTab] = useState<'rj' | 'e'>('rj')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, performances, currentPerf, currentPerfId, judgeScores, results,
    handleOpen, handleSkip, handleRJSubmit, handleReopenScore,
    handleRGJudgeScoreSubmit, submitError, clearSubmitError,
  } = useRGJudgeSession()

  const eRole = assignedRoles.find(r => r.role === 'E')
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const myEScore = eRole ? currentScores.find(s => s.panelJudgeId === eRole.id) : null
  const currentResult = currentPerfId ? (results[currentPerfId] ?? null) : null

  function handleSubmitE(value: number) {
    if (!eRole) return
    const s: JudgeScore = { panelJudgeId: eRole.id, ejScore: value, ajScore: null, djDifficulty: null, djPenalty: null, cjpPenalty: null }
    handleRGJudgeScoreSubmit(s)
  }

  return (
    <JudgeScoringShell loading={loading} sessionId={sessionId} lang={lang} onLangChange={setLang} submitError={submitError} onClearError={clearSubmitError}>
      {/* tab bar */}
      <div className="flex border-b border-slate-200 bg-white shrink-0">
        {(['rj', 'e'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={[
              'flex-1 py-3 text-sm font-semibold uppercase tracking-wide transition-colors',
              tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600',
            ].join(' ')}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {tab === 'rj' ? (
          <RJView
            lang={lang} panelJudges={panelJudges} performances={performances}
            currentPerfId={currentPerfId} judgeScores={judgeScores} results={results}
            onOpen={handleOpen} onSkip={handleSkip} onSubmit={handleRJSubmit} onReopen={handleReopenScore}
          />
        ) : (
          <div className="px-0 pt-4">
            <RGJudgeView lang={lang} role="E" currentPerf={currentPerf}
              mySubmittedScore={myEScore?.ejScore ?? null} result={currentResult} onSubmit={handleSubmitE} />
          </div>
        )}
      </div>
    </JudgeScoringShell>
  )
}
