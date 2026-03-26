'use client'

import { useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Section, Panel, Session, Team, Club, CompetitionEntry, SessionOrder } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    hint: 'Set the order teams compete within each session.',
    noTeams: 'No teams registered for this session.',
    noSections: 'No sessions defined yet. Go to Structure to add sessions.',
    panelN: (n: number) => `Panel ${n}`,
    sectionN: (n: number) => `Section ${n}`,
    shuffle: 'Shuffle',
    lock: 'Publish',
    unlock: 'Published',
    notCompeting: 'Not competing',
    baja: 'Dropout',
  },
  es: {
    hint: 'Establece el orden de actuación en cada sesión.',
    noTeams: 'Sin equipos inscritos para esta sesión.',
    noSections: 'Sin sesiones definidas. Ve a Estructura.',
    panelN: (n: number) => `Panel ${n}`,
    sectionN: (n: number) => `Sección ${n}`,
    shuffle: 'Aleatorio',
    lock: 'Publicar',
    unlock: 'Publicado',
    notCompeting: 'No compiten',
    baja: 'Baja',
  },
}

const PANEL_HEADER: Record<number, string> = {
  1: 'bg-blue-50 text-blue-700 border-blue-200',
  2: 'bg-violet-50 text-violet-700 border-violet-200',
}

// ─── icons ────────────────────────────────────────────────────────────────────

function ShuffleIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  )
}

function LockIcon({ locked }: { locked: boolean }) {
  return locked ? (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}

// ─── session order card ───────────────────────────────────────────────────────

function SessionOrderCard({ session, globalTeams, clubs, entries, sessionOrders, isLocked, lang, agLabels, onReorder, onToggleLock }: {
  session: Session
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  sessionOrders: SessionOrder[]
  isLocked: boolean
  lang: Lang
  agLabels: Record<string, string>
  onReorder: (sessionId: string, teamIds: string[]) => void
  onToggleLock: (sessionId: string) => void
}) {
  const t = T[lang]

  // Split entries into active and dropout for this session's category + age group
  const sessionEntries = entries.filter((e) => {
    const team = globalTeams.find((tm) => tm.id === e.team_id)
    return team && team.age_group === session.age_group && team.category === session.category
  })
  const activeEntries = sessionEntries.filter((e) => !e.dropped_out)
  const dropoutEntries = sessionEntries.filter((e) => e.dropped_out)

  const activeTeams = globalTeams.filter((tm) => activeEntries.some((e) => e.team_id === tm.id))
  const dropoutTeams = globalTeams.filter((tm) => dropoutEntries.some((e) => e.team_id === tm.id))

  // Saved order for this session (includes both active and dropout team IDs)
  const orders = sessionOrders
    .filter((o) => o.session_id === session.id)
    .sort((a, b) => a.position - b.position)

  // Ordered active teams (for unlocked view and arrows)
  const orderedActive: Team[] = orders.length === 0
    ? activeTeams
    : [
        ...orders.map((o) => activeTeams.find((t) => t.id === o.team_id)).filter((t): t is Team => t !== undefined),
        ...activeTeams.filter((t) => !orders.some((o) => o.team_id === t.id)),
      ]

  // Full order for locked view: everyone in saved position
  const orderedAll: Array<{ team: Team; isDropout: boolean }> = orders.length === 0
    ? [
        ...activeTeams.map((t) => ({ team: t, isDropout: false })),
        ...dropoutTeams.map((t) => ({ team: t, isDropout: true })),
      ]
    : orders
        .map((o) => {
          const team = globalTeams.find((t) => t.id === o.team_id)
          if (!team) return null
          return { team, isDropout: dropoutEntries.some((e) => e.team_id === team.id) }
        })
        .filter((x): x is { team: Team; isDropout: boolean } => x !== null)

  // Active-only index for arrow disable logic (ignore dropout rows)
  const activeIdxInAll = orderedAll
    .map((x, i) => (!x.isDropout ? i : -1))
    .filter((i) => i !== -1)

  function move(activeListIdx: number, dir: -1 | 1) {
    const ids = orderedActive.map((t) => t.id)
    const target = activeListIdx + dir
    if (target < 0 || target >= ids.length) return
    ;[ids[activeListIdx], ids[target]] = [ids[target], ids[activeListIdx]]
    // Preserve dropout positions at the end
    onReorder(session.id, [...ids, ...dropoutTeams.map((t) => t.id)])
  }

  function shuffleOrder() {
    const ids = orderedActive.map((t) => t.id)
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[ids[i], ids[j]] = [ids[j], ids[i]]
    }
    // Save active order + dropout IDs appended (their position is preserved on lock)
    onReorder(session.id, [...ids, ...dropoutTeams.map((t) => t.id)])
  }

  const hasTeams = sessionEntries.length > 0

  return (
    <div className={['border rounded-xl overflow-hidden', isLocked ? 'border-blue-200' : 'border-slate-200'].join(' ')}>
      {/* header */}
      <div className={['px-3 py-2 border-b flex items-start justify-between gap-2', isLocked ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'].join(' ')}>
        <div>
          <p className="text-xs font-semibold text-slate-700">{session.category}</p>
          <p className="text-xs text-slate-400">{agLabels[session.age_group] ?? session.age_group} · {session.routine_type}</p>
        </div>
        {hasTeams && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={shuffleOrder}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-white border border-slate-200 rounded-lg transition-all"
            >
              <ShuffleIcon />
              {t.shuffle}
            </button>
            <button
              onClick={() => onToggleLock(session.id)}
              className={[
                'flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-lg transition-all',
                isLocked
                  ? 'text-blue-600 bg-blue-100 border-blue-200 hover:bg-blue-50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white border-slate-200',
              ].join(' ')}
            >
              <LockIcon locked={isLocked} />
              {isLocked ? t.unlock : t.lock}
            </button>
          </div>
        )}
      </div>

      {/* body */}
      <div className="p-3">
        {!hasTeams ? (
          <p className="text-xs text-slate-400 text-center py-3">{t.noTeams}</p>
        ) : isLocked ? (
          // ── locked view: full order, dropouts in position, crossed ─────────────
          <div className="space-y-0.5">
            {orderedAll.map(({ team, isDropout }, idx) => {
              const club = clubs.find((c) => c.id === team.club_id)
              // Arrow index within active-only list
              const activeIdx = isDropout ? -1 : activeIdxInAll.indexOf(idx)
              return (
                <div key={team.id} className={['flex items-center gap-2 py-1.5 group', isDropout ? 'opacity-50' : ''].join(' ')}>
                  <span className={['text-xs font-mono w-5 shrink-0 text-right', isDropout ? 'text-slate-300 line-through' : 'text-slate-400'].join(' ')}>
                    {idx + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={['text-xs font-medium truncate', isDropout ? 'text-slate-400 line-through' : 'text-slate-700'].join(' ')}>
                      {team.gymnast_display}
                    </p>
                    <p className={['text-xs truncate', isDropout ? 'text-slate-300' : 'text-slate-400'].join(' ')}>
                      {club?.club_name ?? '—'}
                    </p>
                  </div>
                  {isDropout ? (
                    <span className="text-xs font-semibold text-red-300 shrink-0">{t.baja}</span>
                  ) : (
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => move(activeIdx, -1)}
                        disabled={activeIdx === 0}
                        className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => move(activeIdx, 1)}
                        disabled={activeIdx === activeIdxInAll.length - 1}
                        className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          // ── unlocked view: active on top with arrows, dropouts below divider ──
          <div className="space-y-0.5">
            {orderedActive.map((team, idx) => {
              const club = clubs.find((c) => c.id === team.club_id)
              return (
                <div key={team.id} className="flex items-center gap-2 py-1.5 group">
                  <span className="text-xs font-mono text-slate-400 w-5 shrink-0 text-right">{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{team.gymnast_display}</p>
                    <p className="text-xs text-slate-400 truncate">{club?.club_name ?? '—'}</p>
                  </div>
                  <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      disabled={idx === orderedActive.length - 1}
                      className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
            {dropoutTeams.length > 0 && (
              <>
                <div className="flex items-center gap-2 pt-2 pb-1">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-xs text-slate-300 shrink-0">{t.notCompeting}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                {dropoutTeams.map((team) => {
                  const club = clubs.find((c) => c.id === team.club_id)
                  return (
                    <div key={team.id} className="flex items-center gap-2 py-1.5">
                      <span className="w-5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-300 line-through truncate">{team.gymnast_display}</p>
                        <p className="text-xs text-slate-300 truncate">{club?.club_name ?? '—'}</p>
                      </div>
                      <span className="text-xs font-semibold text-red-300 shrink-0">{t.baja}</span>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── panel column ─────────────────────────────────────────────────────────────

function PanelColumn({ lang, panel, sessions, globalTeams, clubs, entries, sessionOrders, lockedSessions, onReorder, onToggleLock }: {
  lang: Lang
  panel: Panel
  sessions: Session[]
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  sessionOrders: SessionOrder[]
  lockedSessions: string[]
  onReorder: (sessionId: string, teamIds: string[]) => void
  onToggleLock: (sessionId: string) => void
}) {
  const t = T[lang]
  const headerCls = PANEL_HEADER[panel.panel_number] ?? PANEL_HEADER[1]

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className={['px-4 py-2 text-xs font-bold border-b', headerCls].join(' ')}>
        {t.panelN(panel.panel_number)}
      </div>
      <div className="p-3 space-y-3">
        {sessions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-3">—</p>
        ) : (
          sessions.map((session) => (
            <SessionOrderCard
              key={session.id}
              session={session}
              globalTeams={globalTeams}
              clubs={clubs}
              entries={entries}
              sessionOrders={sessionOrders}
              isLocked={lockedSessions.includes(session.id)}
              lang={lang}
              agLabels={agLabels}
              onReorder={onReorder}
              onToggleLock={onToggleLock}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export type StartingOrderTabProps = {
  lang: Lang
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  sections: Section[]
  panels: Panel[]
  sessions: Session[]
  sessionOrders: SessionOrder[]
  lockedSessions: string[]
  agLabels: Record<string, string>
  onReorder: (sessionId: string, teamIds: string[]) => void
  onToggleLock: (sessionId: string) => void
}

export default function StartingOrderTab({
  lang, globalTeams, clubs, entries, sections, panels, sessions,
  sessionOrders, lockedSessions, agLabels, onReorder, onToggleLock,
}: StartingOrderTabProps) {
  const t = T[lang]
  const sortedSections = [...sections].sort((a, b) => a.section_number - b.section_number)
  const [activeSectionId, setActiveSectionId] = useState<string>(sortedSections[0]?.id ?? '')

  const activeSection = sortedSections.find((s) => s.id === activeSectionId) ?? sortedSections[0]

  function tabLabel(sec: Section) {
    return sec.label ?? t.sectionN(sec.section_number)
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-400">{t.hint}</p>

      {sortedSections.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-xl">
          {t.noSections}
        </p>
      ) : (
        <>
          <div className="flex border-b border-slate-200 gap-0">
            {sortedSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSectionId(sec.id)}
                className={[
                  'px-4 py-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
                  activeSectionId === sec.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600',
                ].join(' ')}
              >
                {tabLabel(sec)}
              </button>
            ))}
          </div>

          {activeSection && (
            <div className={['grid gap-4', panels.length === 2 ? 'grid-cols-2' : 'grid-cols-1 max-w-sm'].join(' ')}>
              {[...panels].sort((a, b) => a.panel_number - b.panel_number).map((panel) => (
                <PanelColumn
                  key={panel.id}
                  lang={lang}
                  panel={panel}
                  sessions={sessions.filter(
                    (s) => s.section_id === activeSection.id && s.panel_id === panel.id,
                  )}
                  globalTeams={globalTeams}
                  clubs={clubs}
                  entries={entries}
                  sessionOrders={sessionOrders}
                  lockedSessions={lockedSessions}
                  onReorder={onReorder}
                  onToggleLock={onToggleLock}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
