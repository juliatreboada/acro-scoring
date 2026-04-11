'use client'

import { useState, useEffect } from 'react'
import type { Lang } from '../aj-scoring/types'
import type { PanelJudge, MockPerf, JudgeScore, RoutineResult } from '../cjp/types'
import type { TsElement } from '../ej-scoring/types'
import CJPView from '../cjp/CJPView'
import EJView from '../ej-scoring/EJView'
import AJView from '../aj-scoring/AJView'
import DJView from '../dj-scoring/DJView'

// ─── types ────────────────────────────────────────────────────────────────────

export type SessionStatus = 'waiting' | 'active' | 'finished'

export type JudgeSessionProps = {
  lang: Lang
  sessionStatus: SessionStatus
  assignedRoles: PanelJudge[]         // roles assigned to this judge (may be multiple)

  // shared — active performance driven by CJP
  currentPerf: MockPerf | null
  elements: TsElement[]               // TS elements for current perf (EJ / DJ)

  // CJP-specific (only relevant when CJP is in assignedRoles)
  panelJudges: PanelJudge[]
  performances: MockPerf[]
  currentPerfId: string | null
  judgeScores: Record<string, JudgeScore[]>
  results: Record<string, RoutineResult>
  onOpen: (perfId: string) => void
  onSkip: (perfId: string) => void
  onCJPSubmit: (status: 'provisional' | 'approved', result: RoutineResult) => void
  onReopenScore: (perfId: string, panelJudgeId: string | 'all') => void

  // called when any non-CJP role submits — page stores score in judgeScores
  onJudgeScoreSubmit?: (score: JudgeScore) => void
}

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    waiting: 'Session has not started yet',
    waitingSub: 'Please wait. The session will begin shortly.',
    finished: 'Session is finished',
    finishedSub: 'All performances for this session have been completed.',
    noRoles: 'No roles assigned',
    noRolesSub: 'You have no judging roles assigned for this session.',
  },
  es: {
    waiting: 'La sesión aún no ha comenzado',
    waitingSub: 'Por favor, espera. La sesión comenzará en breve.',
    finished: 'La sesión ha finalizado',
    finishedSub: 'Todas las actuaciones de esta sesión han concluido.',
    noRoles: 'Sin roles asignados',
    noRolesSub: 'No tienes ningún rol de juez asignado para esta sesión.',
  },
}

// Tab order enforced: CJP → DJ → EJ → AJ
const ROLE_ORDER = ['CJP', 'DJ', 'EJ', 'AJ']

// ─── empty state ──────────────────────────────────────────────────────────────

function EmptyState({ icon, title, sub }: {
  icon: 'clock' | 'check' | 'slash'
  title: string
  sub: string
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
        {icon === 'clock' && (
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        )}
        {icon === 'check' && (
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {icon === 'slash' && (
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        )}
      </div>
      <p className="text-xl font-semibold text-slate-600">{title}</p>
      <p className="text-sm text-slate-400 max-w-xs">{sub}</p>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function JudgeSession({
  lang, sessionStatus, assignedRoles,
  currentPerf, elements,
  panelJudges, performances, currentPerfId, judgeScores, results,
  onOpen, onSkip, onCJPSubmit, onReopenScore,
  onJudgeScoreSubmit,
}: JudgeSessionProps) {
  const t = T[lang]

  const sortedRoles = [...assignedRoles].sort((a, b) => {
    const ai = ROLE_ORDER.indexOf(a.role)
    const bi = ROLE_ORDER.indexOf(b.role)
    if (ai !== bi) return ai - bi
    return a.roleNumber - b.roleNumber
  })

  const [activeTabId, setActiveTabId] = useState<string>(sortedRoles[0]?.id ?? '')
  const [submittedRoleIds, setSubmittedRoleIds] = useState<Set<string>>(new Set())

  // reset submitted state when active performance changes
  useEffect(() => {
    setSubmittedRoleIds(new Set())
  }, [currentPerfId])

  const nonCjpRoles = sortedRoles.filter((r) => r.role !== 'CJP')

  // Score data — available to each role as soon as that role submits
  const currentJudgeScores = currentPerfId ? (judgeScores[currentPerfId] ?? []) : []

  // A role is considered submitted if it's in local state OR already in DB scores (survives refresh)
  function roleHasSubmitted(role: PanelJudge): boolean {
    return submittedRoleIds.has(role.id) || currentJudgeScores.some(s => s.panelJudgeId === role.id)
  }

  const allNonCjpSubmittedWithDB = nonCjpRoles.length > 0 && nonCjpRoles.every(roleHasSubmitted)
  // Final result only passed when all non-CJP roles have submitted
  const currentResult = allNonCjpSubmittedWithDB ? (currentPerfId ? (results[currentPerfId] ?? null) : null) : null

  function handleRoleSubmit(role: PanelJudge, score: JudgeScore) {
    setSubmittedRoleIds((prev) => new Set([...prev, role.id]))
    onJudgeScoreSubmit?.(score)
  }

  // ── empty states ──
  if (sessionStatus !== 'active') {
    return (
      <div className="h-[calc(100dvh-48px)]">
        <EmptyState
          icon={sessionStatus === 'waiting' ? 'clock' : 'check'}
          title={sessionStatus === 'waiting' ? t.waiting : t.finished}
          sub={sessionStatus === 'waiting' ? t.waitingSub : t.finishedSub}
        />
      </div>
    )
  }

  if (sortedRoles.length === 0) {
    return (
      <div className="h-[calc(100dvh-48px)]">
        <EmptyState icon="slash" title={t.noRoles} sub={t.noRolesSub} />
      </div>
    )
  }

  const tabLabel = (r: PanelJudge) =>
    r.role === 'CJP' ? 'CJP' : `${r.role}${r.roleNumber}`

  return (
    <div className="flex flex-col md:h-[calc(100dvh-48px)]">
      {/* tabs — only shown when more than one role */}
      {sortedRoles.length > 1 && (
        <div className="bg-white border-b border-slate-200 px-4 flex items-center gap-0 h-11 shrink-0">
          {sortedRoles.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveTabId(role.id)}
              className={[
                'px-5 h-full text-sm font-semibold border-b-2 transition-all',
                activeTabId === role.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600',
              ].join(' ')}
            >
              {tabLabel(role)}
            </button>
          ))}
        </div>
      )}

      {/* views — all rendered, inactive ones hidden to preserve state */}
      <div className="md:flex-1 md:min-h-0 md:flex md:flex-col">
        {sortedRoles.map((role) => {
          const thisRoleSubmitted = roleHasSubmitted(role)
          const waiting = thisRoleSubmitted && !allNonCjpSubmittedWithDB
          return (
            <div key={role.id} className={['md:flex-1 md:min-h-0', activeTabId === role.id ? '' : 'hidden'].join(' ')}>
              {role.role === 'CJP' && (
                <CJPView
                  isCJP={true}
                  lang={lang}
                  panelJudges={panelJudges}
                  performances={performances}
                  currentPerfId={currentPerfId}
                  judgeScores={judgeScores}
                  results={results}
                  onOpen={onOpen}
                  onSkip={onSkip}
                  onSubmit={onCJPSubmit}
                  onReopenScore={onReopenScore}
                />
              )}
              {role.role === 'DJ' && (
                <DJView
                  currentPerf={currentPerf}
                  lang={lang}
                  elements={elements}
                  mode={role.roleNumber === 1 ? 'elements' : 'keyboard'}
                  waitingForOtherScores={waiting}
                  judgeScores={thisRoleSubmitted ? currentJudgeScores : undefined}
                  panelJudges={thisRoleSubmitted ? panelJudges : undefined}
                  result={currentResult}
                  onSubmit={(difficulty, penalty) => handleRoleSubmit(role, {
                    panelJudgeId: role.id,
                    ejScore: null,
                    ajScore: null,
                    djDifficulty: difficulty,
                    djPenalty: penalty,
                    cjpPenalty: null,
                  })}
                />
              )}
              {role.role === 'EJ' && (
                <EJView
                  currentPerf={currentPerf}
                  lang={lang}
                  elements={elements}
                  mode={role.roleNumber === 1 ? 'elements' : 'keyboard'}
                  waitingForOtherScores={waiting}
                  judgeScores={thisRoleSubmitted ? currentJudgeScores : undefined}
                  panelJudges={thisRoleSubmitted ? panelJudges : undefined}
                  result={currentResult}
                  mySubmittedScore={currentJudgeScores.find(s => s.panelJudgeId === role.id)?.ejScore ?? null}
                  onSubmit={(score, detail) => handleRoleSubmit(role, {
                    panelJudgeId: role.id,
                    ejScore: score,
                    ajScore: null,
                    djDifficulty: null,
                    djPenalty: null,
                    cjpPenalty: null,
                    detail,
                  })}
                />
              )}
              {role.role === 'AJ' && (
                <AJView
                  currentPerf={currentPerf}
                  lang={lang}
                  waitingForOtherScores={waiting}
                  judgeScores={thisRoleSubmitted ? currentJudgeScores : undefined}
                  panelJudges={thisRoleSubmitted ? panelJudges : undefined}
                  result={currentResult}
                  onSubmit={(score) => handleRoleSubmit(role, {
                    panelJudgeId: role.id,
                    ejScore: null,
                    ajScore: score,
                    djDifficulty: null,
                    djPenalty: null,
                    cjpPenalty: null,
                  })}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
