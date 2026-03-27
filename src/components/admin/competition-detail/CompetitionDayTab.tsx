'use client'

import { useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Competition, Section, Panel, Session, SessionOrder, Team, Club, CompetitionEntry } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    notActive: 'The competition is not live yet.',
    notActiveSub: 'Session controls become available once the competition is marked as active.',
    section: 'Section',
    panel: 'Panel',
    waiting: 'Waiting',
    active: 'Live',
    finished: 'Finished',
    start: 'Start session',
    startSection: 'Start section',
    finish: 'Finish session',
    confirmStart: 'Start this session? Judges will be able to submit scores.',
    confirmStartSection: 'Start all sessions in this section simultaneously?',
    confirmFinish: 'Mark this session as finished?',
    noTeams: 'No teams assigned.',
    dropout: 'Dropout',
    noOrder: 'Starting order not published.',
  },
  es: {
    notActive: 'La competición aún no está en curso.',
    notActiveSub: 'Los controles de sesión estarán disponibles cuando la competición esté activa.',
    section: 'Jornada',
    panel: 'Panel',
    waiting: 'En espera',
    active: 'En curso',
    finished: 'Finalizada',
    start: 'Iniciar sesión',
    startSection: 'Iniciar jornada',
    finish: 'Finalizar sesión',
    confirmStart: '¿Iniciar esta sesión? Los jueces podrán enviar puntuaciones.',
    confirmStartSection: '¿Iniciar todas las sesiones de esta jornada simultáneamente?',
    confirmFinish: '¿Marcar esta sesión como finalizada?',
    noTeams: 'Sin equipos asignados.',
    dropout: 'Baja',
    noOrder: 'Orden de salida no publicado.',
  },
}

const SESSION_BADGE: Record<Session['status'], string> = {
  waiting:  'bg-slate-100 text-slate-500',
  active:   'bg-blue-600 text-white',
  finished: 'bg-green-100 text-green-700',
}

// ─── session card ─────────────────────────────────────────────────────────────

function SessionCard({
  lang, session, sessionOrders, globalTeams, clubs, entries,
  canControl, showStart, onStart, onFinish,
}: {
  lang: Lang
  session: Session
  sessionOrders: SessionOrder[]
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  canControl: boolean
  showStart: boolean   // false when section-level start is used instead
  onStart: () => void
  onFinish: () => void
}) {
  const t = T[lang]

  // teams in this session (match by age_group + category)
  const matchingTeamIds = new Set(
    globalTeams
      .filter((tm) => tm.age_group === session.age_group && tm.category === session.category)
      .map((tm) => tm.id)
  )
  const droppedOutIds = new Set(
    entries.filter((e) => e.dropped_out && matchingTeamIds.has(e.team_id)).map((e) => e.team_id)
  )

  // build ordered team list
  const orders = sessionOrders
    .filter((o) => o.session_id === session.id)
    .sort((a, b) => a.position - b.position)

  const orderedTeamIds = orders.map((o) => o.team_id)
  const hasOrder = orderedTeamIds.length > 0

  const statusLabel = t[session.status]
  const isActive = session.status === 'active'
  const isWaiting = session.status === 'waiting'
  const isFinished = session.status === 'finished'

  return (
    <div className={['rounded-2xl border overflow-hidden transition-all',
      isActive ? 'border-blue-300 shadow-sm shadow-blue-100' : 'border-slate-200'].join(' ')}>

      {/* header */}
      <div className={['px-4 py-3 flex items-center justify-between gap-3',
        isActive ? 'bg-blue-50' : 'bg-white'].join(' ')}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={['px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1', SESSION_BADGE[session.status]].join(' ')}>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />}
              {statusLabel}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800 truncate">{session.name}</p>
        </div>
        {canControl && (
          <div className="shrink-0">
            {isWaiting && showStart && (
              <button onClick={() => { if (confirm(t.confirmStart)) onStart() }}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                {t.start}
              </button>
            )}
            {isActive && (
              <button onClick={() => { if (confirm(t.confirmFinish)) onFinish() }}
                className="px-3 py-1.5 text-xs font-semibold border border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition-all">
                {t.finish}
              </button>
            )}
          </div>
        )}
      </div>

      {/* team list — shown when active or finished */}
      {(isActive || isFinished) && (
        <div className="border-t border-slate-100">
          {!hasOrder ? (
            <p className="px-4 py-3 text-xs text-slate-400 italic">{t.noOrder}</p>
          ) : orderedTeamIds.length === 0 ? (
            <p className="px-4 py-3 text-xs text-slate-400 italic">{t.noTeams}</p>
          ) : (
            <ol className="divide-y divide-slate-50">
              {orderedTeamIds.map((teamId, idx) => {
                const team = globalTeams.find((tm) => tm.id === teamId)
                const club = team ? clubs.find((c) => c.id === team.club_id) : undefined
                const isDropout = droppedOutIds.has(teamId)
                if (!team) return null
                return (
                  <li key={teamId} className={['flex items-center gap-3 px-4 py-2.5', isDropout ? 'opacity-40' : ''].join(' ')}>
                    <span className={['w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      isDropout ? 'bg-slate-100 text-slate-400' : isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'].join(' ')}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={['text-sm font-medium truncate', isDropout ? 'line-through text-slate-400' : 'text-slate-800'].join(' ')}>
                        {team.gymnast_display}
                      </p>
                      {club && <p className="text-xs text-slate-400 truncate">{club.club_name}</p>}
                    </div>
                    {isDropout && (
                      <span className="shrink-0 text-xs font-semibold bg-red-50 text-red-400 px-2 py-0.5 rounded-full">
                        {t.dropout}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}

// ─── main tab ─────────────────────────────────────────────────────────────────

export default function CompetitionDayTab({
  lang, competition, sections, panels, sessions,
  sessionOrders, globalTeams, clubs, entries,
  onStartSession, onFinishSession,
}: {
  lang: Lang
  competition: Competition
  sections: Section[]
  panels: Panel[]
  sessions: Session[]
  sessionOrders: SessionOrder[]
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  onStartSession: (sessionId: string) => void
  onFinishSession: (sessionId: string) => void
}) {
  const t = T[lang]
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? '')
  const canControl = competition.status === 'active'

  if (competition.status !== 'active' && competition.status !== 'finished') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-base font-semibold text-slate-600">{t.notActive}</p>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">{t.notActiveSub}</p>
      </div>
    )
  }

  const sectionSessions = sessions.filter((s) => s.section_id === activeSection)
  const multiPanel = panels.length > 1

  // for multi-panel: section-level start — only when at least one session is still waiting
  const hasWaiting = sectionSessions.some((s) => s.status === 'waiting')

  function startSection() {
    sectionSessions
      .filter((s) => s.status === 'waiting')
      .forEach((s) => onStartSession(s.id))
  }

  return (
    <div>
      {/* section tabs */}
      {sections.length > 1 && (
        <div className="flex border-b border-slate-200 mb-6 -mx-4 px-4 overflow-x-auto">
          {sections.map((sec) => (
            <button key={sec.id} onClick={() => setActiveSection(sec.id)}
              className={['px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all',
                activeSection === sec.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600',
              ].join(' ')}>
              {sec.label ?? `${t.section} ${sec.section_number}`}
            </button>
          ))}
        </div>
      )}

      {/* section-level start button (multi-panel only) */}
      {/* panel columns */}
      {!multiPanel ? (
        <div className="space-y-3">
          {sectionSessions
            .filter((s) => s.panel_id === panels[0].id)
            .sort((a, b) => a.order_index - b.order_index)
            .map((session) => (
              <SessionCard key={session.id} lang={lang} session={session}
                sessionOrders={sessionOrders} globalTeams={globalTeams}
                clubs={clubs} entries={entries} canControl={canControl}
                showStart={true}
                onStart={() => onStartSession(session.id)}
                onFinish={() => onFinishSession(session.id)} />
            ))}
        </div>
      ) : (
        (() => {
          // multi-panel: pair sessions by order_index
          const orderIndices = [...new Set(sectionSessions.map(s => s.order_index))].sort((a, b) => a - b)

          return (
            <div className="space-y-4">
              {orderIndices.map(idx => {
                const rowSessions = panels
                  .map(p => sectionSessions.find(s => s.panel_id === p.id && s.order_index === idx))
                  .filter(Boolean) as Session[]
                const allWaiting = rowSessions.every(s => s.status === 'waiting')
                const allActive = rowSessions.every(s => s.status === 'active')
                const allFinished = rowSessions.every(s => s.status === 'finished')

                return (
                  <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">#{idx}</span>
                      {canControl && !allFinished && (
                        <div className="flex gap-2">
                          {allWaiting && (
                            <button
                              onClick={() => { if (confirm(t.confirmStart)) rowSessions.forEach(s => onStartSession(s.id)) }}
                              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all">
                              ▶ {t.start}
                            </button>
                          )}
                          {allActive && (
                            <button
                              onClick={() => { if (confirm(t.confirmFinish)) rowSessions.forEach(s => onFinishSession(s.id)) }}
                              className="flex items-center gap-1.5 px-3 py-1 bg-slate-700 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-all">
                              ✓ {t.finish}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`grid gap-0 ${panels.length > 1 ? 'grid-cols-2 divide-x divide-slate-100' : ''}`}>
                      {rowSessions.map(session => (
                        <SessionCard key={session.id} lang={lang} session={session}
                          sessionOrders={sessionOrders} globalTeams={globalTeams}
                          clubs={clubs} entries={entries} canControl={false}
                          showStart={false}
                          onStart={() => {}}
                          onFinish={() => {}} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()
      )}
    </div>
  )
}
