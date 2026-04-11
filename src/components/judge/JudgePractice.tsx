'use client'

import { useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { PanelJudge, MockPerf, JudgeScore, RoutineResult } from '@/components/cjp/types'
import { computeResult } from '@/components/cjp/types'
import type { TsElement } from '@/components/ej-scoring/types'
import type { Sheet } from '@/components/dj-review/types'
import DJReview from '@/components/dj-review/DJReview'
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
  { id: 'e1', position: 1, label: 'Handstand pair 3s',  difficultyValue: 0.3, elementType: 'balance',    isStatic: true },
  { id: 'e2', position: 2, label: 'Forward roll pair',  difficultyValue: 0.2, elementType: 'dynamic'                    },
  { id: 'e3', position: 3, label: 'Backwalkover',       difficultyValue: 0.4, elementType: 'individual'                 },
  { id: 'e4', position: 4, label: 'Group balance',      difficultyValue: 0.5, elementType: 'balance'                    },
  { id: 'e5', position: 5, label: 'Cartwheel sequence', difficultyValue: 0.2, elementType: 'individual'                 },
  { id: 'e6', position: 6, label: 'Fwd somersault',     difficultyValue: 0.6, elementType: 'dynamic'                    },
]

const MOCK_SHEET: Sheet = {
  id: 'mock-sheet-1',
  teamId: 'mock-team-1',
  competitionId: 'mock-comp-1',
  gymnasts: 'García / López',
  ageGroup: 'Junior',
  category: 'Mixed Pair',
  routineType: 'Balance',
  pdfUrl: null,
  elements: MOCK_ELEMENTS.map(e => ({
    id: e.id,
    position: e.position,
    label: e.label,
    elementType: (e.elementType ?? 'balance') as import('@/components/dj-review/types').ElementType,
    isStatic: e.isStatic ?? false,
    difficultyValue: e.difficultyValue,
  })),
  reviewStatus: 'pending',
  dj1Id: null,
  dj1Decision: null,
  dj1Comment: null,
  dj2Id: null,
  finalComment: null,
  hasTwoDJs: true,
}

function makeMockPerf(resetKey: number): MockPerf {
  return {
    id: `mock-practice-${resetKey}`, teamId: 't1', position: 1,
    gymnasts: 'García / López',
    ageGroup: 'Junior', category: 'Mixed Pair', routineType: 'Balance',
    skipped: false, elements: MOCK_ELEMENTS,
  }
}

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: { banner: 'Practice mode — scores are not saved', reset: 'Reset', back: 'Back', scoring: 'Scoring', djReview: 'TS Review' },
  es: { banner: 'Modo práctica — las puntuaciones no se guardan', reset: 'Reiniciar', back: 'Volver', scoring: 'Puntuación', djReview: 'Revisión TS' },
}

// ─── component ────────────────────────────────────────────────────────────────

export default function JudgePractice({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = T[lang]

  const [practiceView, setPracticeView] = useState<'scoring' | 'dj-review'>('scoring')
  const [resetKey, setResetKey]         = useState(0)
  const [judgeScores, setJudgeScores]   = useState<Record<string, JudgeScore[]>>({})
  const [results, setResults]           = useState<Record<string, RoutineResult>>({})

  const mockPerf = makeMockPerf(resetKey)

  function reset() {
    setJudgeScores({})
    setResults({})
    setResetKey(k => k + 1)   // forces JudgeSession to fully remount, clearing each view's submitted state
  }

  function handleJudgeScoreSubmit(score: JudgeScore) {
    const perfId = mockPerf.id
    setJudgeScores(prev => {
      const existing = prev[perfId] ?? []
      const next = [...existing.filter(s => s.panelJudgeId !== score.panelJudgeId), score]

      const nonCjp = MOCK_PANEL_JUDGES.filter(j => j.role !== 'CJP')
      const allIn = nonCjp.every(j => next.some(s => s.panelJudgeId === j.id))
      if (allIn) {
        const result = computeResult(perfId, next, MOCK_PANEL_JUDGES, 0, 'provisional')
        setResults(r => ({ ...r, [perfId]: result }))
      }

      return { ...prev, [perfId]: next }
    })
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

      {/* top-level tabs */}
      <div className="bg-white border-b border-slate-200 px-4 flex items-center gap-0 h-11 shrink-0">
        {(['scoring', 'dj-review'] as const).map(v => (
          <button
            key={v}
            onClick={() => setPracticeView(v)}
            className={[
              'px-5 h-full text-sm font-semibold border-b-2 transition-all',
              practiceView === v
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-400 hover:text-slate-600',
            ].join(' ')}
          >
            {v === 'scoring' ? t.scoring : t.djReview}
          </button>
        ))}
      </div>

      {/* scoring session */}
      <div className={['flex-1 min-h-0', practiceView === 'scoring' ? '' : 'hidden'].join(' ')}>
        <JudgeSession
          key={resetKey}
          lang={lang}
          sessionStatus="active"
          assignedRoles={MOCK_PANEL_JUDGES}
          currentPerf={mockPerf}
          elements={MOCK_ELEMENTS}
          panelJudges={MOCK_PANEL_JUDGES}
          performances={[mockPerf]}
          currentPerfId={mockPerf.id}
          judgeScores={judgeScores}
          results={results}
          onOpen={() => {}}
          onSkip={() => {}}
          onCJPSubmit={() => {}}
          onReopenScore={handleReopenScore}
          onJudgeScoreSubmit={handleJudgeScoreSubmit}
        />
      </div>

      {/* dj review */}
      {practiceView === 'dj-review' && (
        <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50">
          <div className="max-w-5xl mx-auto pt-4 pb-16">
            <DJReview
              key={resetKey}
              initialSheets={[MOCK_SHEET]}
              myJudgeId="mock-dj-1"
              lang={lang}
              practiceMode
            />
          </div>
        </div>
      )}
    </div>
  )
}
