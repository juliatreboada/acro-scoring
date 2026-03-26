'use client'

import { useState } from 'react'
import { useJudgeSession } from '@/hooks/useJudgeSession'
import DJView from '@/components/dj-scoring/DJView'
import AuthBar from '@/components/shared/AuthBar'
import type { Lang } from '@/components/dj-scoring/types'
import type { TsElement } from '@/components/ej-scoring/types'
import type { JudgeScore } from '@/components/cjp/types'

const ELEMENTS: TsElement[] = []

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const {
    loading, sessionId,
    assignedRoles, panelJudges, currentPerfId, currentPerf, judgeScores, results,
    handleJudgeScoreSubmit,
  } = useJudgeSession()

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  if (!sessionId) return (
    <div className="min-h-screen bg-slate-50"><AuthBar />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-48px)] gap-3">
        <p className="text-xl font-semibold text-slate-600">No active session</p>
      </div>
    </div>
  )

  const myRole = assignedRoles.find(r => r.role === 'DJ')
  const currentScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []
  const myScore = myRole ? currentScores.find(s => s.panelJudgeId === myRole.id) : null
  const currentResult = currentPerfId ? (results[currentPerfId] ?? null) : null
  const waitingForOtherScores = !!myScore && !currentResult

  function handleSubmit(djDifficulty: number, djPenalty: number) {
    if (!myRole) return
    const s: JudgeScore = { panelJudgeId: myRole.id, ejScore: null, ajScore: null, djDifficulty, djPenalty, cjpPenalty: null }
    handleJudgeScoreSubmit(s)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AuthBar />
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['en', 'es'] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={['px-3 py-1 rounded-md text-sm font-medium transition-all',
                lang === l ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-5xl mx-auto pt-4 pb-16 px-0 md:px-4">
        <DJView
          currentPerf={currentPerf}
          lang={lang}
          elements={ELEMENTS}
          onSubmit={handleSubmit}
          panelJudges={panelJudges}
          judgeScores={currentScores}
          waitingForOtherScores={waitingForOtherScores}
          result={currentResult ?? undefined}
        />
      </div>
    </div>
  )
}
