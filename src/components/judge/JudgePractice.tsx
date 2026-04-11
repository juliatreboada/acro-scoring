'use client'

import { useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { PanelJudge, MockPerf, JudgeScore, RoutineResult } from '@/components/cjp/types'
import { computeResult } from '@/components/cjp/types'
import type { TsElement } from '@/components/ej-scoring/types'
import JudgeSession from './JudgeSession'

// ─── mock data ────────────────────────────────────────────────────────────────

const MOCK_PANEL_JUDGES: PanelJudge[] = [
  { id: 'pj-cjp',  name: 'Tú (CJP)', role: 'CJP', roleNumber: 1 },
  { id: 'pj-dj1',  name: 'Tú (DJ1)', role: 'DJ',  roleNumber: 1 },
  { id: 'pj-dj2',  name: 'Tú (DJ2)', role: 'DJ',  roleNumber: 2 },
  { id: 'pj-ej1',  name: 'Tú (EJ1)', role: 'EJ',  roleNumber: 1 },
  { id: 'pj-ej2',  name: 'Tú (EJ2)', role: 'EJ',  roleNumber: 2 },
  { id: 'pj-aj',   name: 'Tú (AJ)',  role: 'AJ',  roleNumber: 1 },
]

const MOCK_ELEMENTS: TsElement[] = [
  { id: 'e1', position: 1, label: 'Handstand pair 3s',    difficultyValue: 0.3, elementType: 'balance',    isStatic: true  },
  { id: 'e2', position: 2, label: 'Forward roll pair',    difficultyValue: 0.2, elementType: 'dynamic'                     },
  { id: 'e3', position: 3, label: 'Backwalkover',         difficultyValue: 0.4, elementType: 'individual'                  },
  { id: 'e4', position: 4, label: 'Group balance',        difficultyValue: 0.5, elementType: 'balance'                     },
  { id: 'e5', position: 5, label: 'Cartwheel sequence',   difficultyValue: 0.2, elementType: 'individual'                  },
  { id: 'e6', position: 6, label: 'Fwd somersault',       difficultyValue: 0.6, elementType: 'dynamic'                     },
]

function makeMockPerformances(): MockPerf[] {
  return [
    { id: 'perf-1', teamId: 't1', position: 1, gymnasts: 'García / López',         ageGroup: 'Junior', category: 'Mixed Pair',   routineType: 'Balance', skipped: false, elements: MOCK_ELEMENTS },
    { id: 'perf-2', teamId: 't2', position: 2, gymnasts: 'Martínez / Rodríguez',   ageGroup: 'Junior', category: "Women's Pair",  routineType: 'Balance', skipped: false, elements: MOCK_ELEMENTS },
    { id: 'perf-3', teamId: 't3', position: 3, gymnasts: 'Fernández / Sánchez',    ageGroup: 'Senior', category: "Men's Pair",    routineType: 'Balance', skipped: false, elements: MOCK_ELEMENTS },
  ]
}

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    banner:  'Practice mode — scores are not saved',
    reset:   'Reset',
    back:    'Back',
  },
  es: {
    banner:  'Modo práctica — las puntuaciones no se guardan',
    reset:   'Reiniciar',
    back:    'Volver',
  },
}

// ─── component ────────────────────────────────────────────────────────────────

export default function JudgePractice({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = T[lang]

  const [performances, setPerformances] = useState<MockPerf[]>(makeMockPerformances)
  const [currentPerfId, setCurrentPerfId] = useState<string | null>(null)
  const [judgeScores, setJudgeScores] = useState<Record<string, JudgeScore[]>>({})
  const [results, setResults] = useState<Record<string, RoutineResult>>({})

  const currentPerf = performances.find(p => p.id === currentPerfId) ?? null
  const elements = currentPerf?.elements ?? []

  function reset() {
    setPerformances(makeMockPerformances())
    setCurrentPerfId(null)
    setJudgeScores({})
    setResults({})
  }

  function handleOpen(perfId: string) {
    setCurrentPerfId(perfId)
  }

  function handleSkip(perfId: string) {
    setPerformances(prev => prev.map(p => p.id === perfId ? { ...p, skipped: true } : p))
    const current = performances.find(p => p.id === perfId)
    const next = current
      ? performances.find(p => p.position > current.position && !p.skipped && p.id !== perfId)
      : null
    setCurrentPerfId(next?.id ?? null)
  }

  function handleJudgeScoreSubmit(score: JudgeScore) {
    if (!currentPerfId) return
    setJudgeScores(prev => {
      const existing = prev[currentPerfId] ?? []
      const next = [...existing.filter(s => s.panelJudgeId !== score.panelJudgeId), score]

      // Once all non-CJP judges have submitted, compute a provisional result
      const nonCjp = MOCK_PANEL_JUDGES.filter(j => j.role !== 'CJP')
      const allIn  = nonCjp.every(j => next.some(s => s.panelJudgeId === j.id))
      if (allIn) {
        const result = computeResult(currentPerfId, next, MOCK_PANEL_JUDGES, 0, 'provisional')
        setResults(r => ({ ...r, [currentPerfId]: result }))
      }

      return { ...prev, [currentPerfId]: next }
    })
  }

  function handleCJPSubmit(status: 'provisional' | 'approved', result: RoutineResult) {
    setResults(prev => ({ ...prev, [result.performanceId]: { ...result, status } }))
    const current = performances.find(p => p.id === currentPerfId)
    const next = current
      ? performances.find(p => p.position > current.position && !p.skipped)
      : null
    setCurrentPerfId(next?.id ?? null)
  }

  function handleReopenScore(perfId: string, panelJudgeId: string | 'all') {
    setJudgeScores(prev => ({
      ...prev,
      [perfId]: panelJudgeId === 'all'
        ? []
        : (prev[perfId] ?? []).filter(s => s.panelJudgeId !== panelJudgeId),
    }))
    if (panelJudgeId === 'all') {
      setResults(prev => { const r = { ...prev }; delete r[perfId]; return r })
    }
  }

  return (
    <div className="flex flex-col h-dvh">
      {/* practice banner */}
      <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span className="text-sm font-semibold truncate">{t.banner}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={reset}
            className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-all"
          >
            {t.reset}
          </button>
          <button
            onClick={onBack}
            className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-all"
          >
            {t.back}
          </button>
        </div>
      </div>

      {/* full scoring session — session always "active", all roles available */}
      <div className="flex-1 min-h-0">
        <JudgeSession
          lang={lang}
          sessionStatus="active"
          assignedRoles={MOCK_PANEL_JUDGES}
          currentPerf={currentPerf}
          elements={elements}
          panelJudges={MOCK_PANEL_JUDGES}
          performances={performances}
          currentPerfId={currentPerfId}
          judgeScores={judgeScores}
          results={results}
          onOpen={handleOpen}
          onSkip={handleSkip}
          onCJPSubmit={handleCJPSubmit}
          onReopenScore={handleReopenScore}
          onJudgeScoreSubmit={handleJudgeScoreSubmit}
        />
      </div>
    </div>
  )
}
