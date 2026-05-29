'use client'

import { useState } from 'react'
import type { Lang, PanelJudge, ScoringPerformance, JudgeScore, RoutineResult } from '@/components/scoring/types'
import { RJView } from '@/components/rg/RJView'
import { RGJudgeView } from '@/components/rg/RGJudgeView'
import { useT } from '@/lib/useT'

// ─── mock data ────────────────────────────────────────────────────────────────

const MOCK_PANEL_JUDGES: PanelJudge[] = [
  { id: 'pj-rj', name: 'Tú (RJ)', role: 'RJ', roleNumber: 1 },
  { id: 'pj-e',  name: 'Tú (E)',  role: 'E',  roleNumber: 1 },
  { id: 'pj-a',  name: 'Tú (A)',  role: 'A',  roleNumber: 1 },
  { id: 'pj-da', name: 'Tú (DA)', role: 'DA', roleNumber: 1 },
  { id: 'pj-db', name: 'Tú (DB)', role: 'DB', roleNumber: 1 },
]

function makeMockPerf(resetKey: number, category: 'Individual' | 'Group'): ScoringPerformance {
  return {
    id: `mock-rg-practice-${resetKey}-${category}`,
    teamId: 'rg-t1',
    position: 1,
    gymnasts: category === 'Individual' ? 'Martínez García' : 'Equipo España',
    ageGroup: 'Junior',
    category,
    routineType: category === 'Individual' ? 'Ball' : '5 Hoops',
    skipped: false,
    elements: [],
  }
}

const RG_JUDGE_TABS = ['RJI', 'RJC', 'E', 'A', 'DA', 'DB'] as const
type RGTab = typeof RG_JUDGE_TABS[number]

// ─── component ────────────────────────────────────────────────────────────────

export default function JudgePracticeRG({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = useT('JudgePracticeRG', lang)

  const [tab, setTab]         = useState<RGTab>('RJI')
  const [resetKey, setResetKey] = useState(0)
  const [judgeScores, setJudgeScores] = useState<Record<string, JudgeScore[]>>({})
  const [results, setResults] = useState<Record<string, RoutineResult>>({})

  // Individual perf — used by RJI + E/A/DA/DB tabs
  const mockPerfI = makeMockPerf(resetKey, 'Individual')
  // Group perf — used by RJC tab only
  const mockPerfC = makeMockPerf(resetKey, 'Group')
  // Convenience alias for the non-RJ tabs
  const mockPerf  = mockPerfI

  function reset() {
    setJudgeScores({})
    setResults({})
    setResetKey(k => k + 1)
  }

  function handleRGJudgeScoreSubmit(score: JudgeScore) {
    const perfId = mockPerf.id
    setJudgeScores(prev => {
      const next = [...(prev[perfId] ?? []).filter(s => s.panelJudgeId !== score.panelJudgeId), score]
      return { ...prev, [perfId]: next }
    })
  }

  function handleRJSubmit(perfId: string, status: 'provisional' | 'approved', result: RoutineResult) {
    setResults(prev => ({ ...prev, [perfId]: { ...result, status } }))
  }

  function handleReopen(perfId: string, who: string | 'all') {
    setJudgeScores(prev => ({
      ...prev,
      [perfId]: who === 'all' ? [] : (prev[perfId] ?? []).filter(s => s.panelJudgeId !== who),
    }))
    if (who === 'all') setResults(prev => { const r = { ...prev }; delete r[perfId]; return r })
  }

  function makeSubmit(pjId: string, field: keyof JudgeScore) {
    return (value: number) => {
      const score: JudgeScore = {
        panelJudgeId: pjId,
        ejScore:      field === 'ejScore'      ? value : null,
        ajScore:      field === 'ajScore'      ? value : null,
        djDifficulty: field === 'djDifficulty' ? value : null,
        djPenalty:    null,
        cjpPenalty:   null,
        dbScore:      field === 'dbScore'      ? value : null,
      }
      handleRGJudgeScoreSubmit(score)
    }
  }

  const currentScores = judgeScores[mockPerf.id] ?? []
  const currentResult = results[mockPerf.id] ?? null

  function myScore(pjId: string, field: keyof JudgeScore): number | null {
    const s = currentScores.find(s => s.panelJudgeId === pjId)
    return s ? (s[field] as number | null) : null
  }

  const isRJTab = tab === 'RJI' || tab === 'RJC'

  return (
    <div className="flex flex-col h-dvh">
      {/* banner */}
      <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span className="text-sm font-semibold truncate">{t.banner}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={reset} className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-all">
            {t.reset}
          </button>
          <button onClick={onBack} className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-all">
            {t.back}
          </button>
        </div>
      </div>

      {/* tab bar */}
      <div className="bg-white border-b border-slate-200 px-4 flex items-center gap-0 h-11 shrink-0">
        {RG_JUDGE_TABS.map(v => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={[
              'px-5 h-full text-sm font-semibold border-b-2 transition-all',
              tab === v
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-400 hover:text-slate-600',
            ].join(' ')}
          >
            {v}
          </button>
        ))}
      </div>

      {/* content */}
      <div className={['flex-1 min-h-0', isRJTab ? 'overflow-y-auto md:overflow-hidden' : 'overflow-y-auto'].join(' ')}>
        {tab === 'RJI' && (() => {
          const perf = mockPerfI
          return (
            <RJView
              key={`${resetKey}-rji`}
              lang={lang}
              panelJudges={MOCK_PANEL_JUDGES}
              performances={[perf]}
              currentPerfId={perf.id}
              judgeScores={{ [perf.id]: judgeScores[perf.id] ?? [] }}
              results={results[perf.id] ? { [perf.id]: results[perf.id] } : {}}
              onOpen={() => {}}
              onSkip={() => {}}
              onSubmit={(status, result) => handleRJSubmit(perf.id, status, result)}
              onReopen={handleReopen}
            />
          )
        })()}
        {tab === 'RJC' && (() => {
          const perf = mockPerfC
          return (
            <RJView
              key={`${resetKey}-rjc`}
              lang={lang}
              panelJudges={MOCK_PANEL_JUDGES}
              performances={[perf]}
              currentPerfId={perf.id}
              judgeScores={{ [perf.id]: judgeScores[perf.id] ?? [] }}
              results={results[perf.id] ? { [perf.id]: results[perf.id] } : {}}
              onOpen={() => {}}
              onSkip={() => {}}
              onSubmit={(status, result) => handleRJSubmit(perf.id, status, result)}
              onReopen={handleReopen}
            />
          )
        })()}
        {tab === 'E' && (
          <div className="px-0 pt-4">
            <RGJudgeView
              key={resetKey}
              lang={lang}
              role="E"
              currentPerf={mockPerf}
              mySubmittedScore={myScore('pj-e', 'ejScore')}
              result={currentResult}
              onSubmit={makeSubmit('pj-e', 'ejScore')}
            />
          </div>
        )}
        {tab === 'A' && (
          <div className="px-0 pt-4">
            <RGJudgeView
              key={resetKey}
              lang={lang}
              role="A"
              currentPerf={mockPerf}
              mySubmittedScore={myScore('pj-a', 'ajScore')}
              result={currentResult}
              onSubmit={makeSubmit('pj-a', 'ajScore')}
            />
          </div>
        )}
        {tab === 'DA' && (
          <div className="px-0 pt-4">
            <RGJudgeView
              key={resetKey}
              lang={lang}
              role="DA"
              currentPerf={mockPerf}
              mySubmittedScore={myScore('pj-da', 'djDifficulty')}
              result={currentResult}
              onSubmit={makeSubmit('pj-da', 'djDifficulty')}
            />
          </div>
        )}
        {tab === 'DB' && (
          <div className="px-0 pt-4">
            <RGJudgeView
              key={resetKey}
              lang={lang}
              role="DB"
              currentPerf={mockPerf}
              mySubmittedScore={myScore('pj-db', 'dbScore')}
              result={currentResult}
              onSubmit={makeSubmit('pj-db', 'dbScore')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
