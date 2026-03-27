'use client'

import { useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Competition, Section, Panel, Session, SessionOrder, Team, Club, CompetitionEntry } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    title: 'Starting Order',
    notPublished: 'Not published yet',
    notPublishedSub: 'The starting order for this session has not been published yet.',
    dropout: 'Dropout',
    noSessions: 'No sessions in this section.',
    panel: 'Panel',
    section: 'Section',
    location: 'Location',
    dates: 'Dates',
    pendingSession: 'Order not yet published',
  },
  es: {
    title: 'Orden de salida',
    notPublished: 'No publicado aún',
    notPublishedSub: 'El orden de salida para esta sesión aún no ha sido publicado.',
    dropout: 'Baja',
    noSessions: 'No hay sesiones en esta jornada.',
    panel: 'Panel',
    section: 'Jornada',
    location: 'Sede',
    dates: 'Fechas',
    pendingSession: 'Orden no publicado aún',
  },
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDateRange(start: string | null, end: string | null): string {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  if (start && end && start !== end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return fmt(start)
  if (end) return fmt(end)
  return ''
}

// ─── session order card ───────────────────────────────────────────────────────

function SessionOrderCard({
  session, sessionOrders, isLocked, entries, globalTeams, clubs, lang,
}: {
  session: Session
  sessionOrders: SessionOrder[]
  isLocked: boolean
  entries: CompetitionEntry[]
  globalTeams: Team[]
  clubs: Club[]
  lang: Lang
}) {
  const t = T[lang]

  // teams entered in this session's age_group + category
  const matchingTeams = globalTeams.filter(
    (team) => team.age_group === session.age_group && team.category === session.category,
  )
  const enteredTeamIds = new Set(
    entries.filter((e) => !e.dropped_out).map((e) => e.team_id).filter((id) =>
      matchingTeams.some((t) => t.id === id),
    ),
  )
  const droppedOutIds = new Set(
    entries.filter((e) => e.dropped_out).map((e) => e.team_id).filter((id) =>
      matchingTeams.some((t) => t.id === id),
    ),
  )
  const allTeamIds = new Set([...enteredTeamIds, ...droppedOutIds])

  const orders = sessionOrders.filter((o) => o.session_id === session.id)
  const orderedIds = orders.sort((a, b) => a.position - b.position).map((o) => o.team_id)

  // build display list
  const activeIds = orderedIds.filter((id) => !droppedOutIds.has(id))
  const unorderedActive = [...enteredTeamIds].filter((id) => !orderedIds.includes(id))
  const displayActive = [...activeIds, ...unorderedActive]
  const displayDropouts = [...droppedOutIds]

  function teamLabel(teamId: string) {
    const team = globalTeams.find((t) => t.id === teamId)
    if (!team) return teamId
    const club = clubs.find((c) => c.id === team.club_id)
    return { gymnasts: team.gymnast_display, club: club?.club_name ?? '' }
  }

  if (!isLocked) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">{session.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{session.routine_type}</p>
        </div>
        <div className="px-4 py-8 flex flex-col items-center text-center gap-1.5">
          <svg className="w-8 h-8 text-slate-200 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-slate-400">{t.notPublished}</p>
          <p className="text-xs text-slate-300">{t.notPublishedSub}</p>
        </div>
      </div>
    )
  }

  // locked view — full order with dropouts in position
  const fullOrder = orderedIds.length > 0
    ? orderedIds
    : [...displayActive, ...displayDropouts]

  if (allTeamIds.size === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">{session.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{session.routine_type}</p>
        </div>
        <p className="px-4 py-6 text-sm text-slate-300 text-center">{t.noSessions}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-200 overflow-hidden">
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">{session.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{session.routine_type}</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Published
        </span>
      </div>
      <ol className="divide-y divide-slate-50">
        {fullOrder.map((teamId, idx) => {
          const info = teamLabel(teamId)
          const isDropout = droppedOutIds.has(teamId)
          if (typeof info === 'string') return null
          return (
            <li key={teamId} className={['flex items-center gap-3 px-4 py-3', isDropout ? 'opacity-50' : ''].join(' ')}>
              <span className={['w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                isDropout ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'].join(' ')}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={['text-sm font-medium text-slate-800 truncate', isDropout ? 'line-through text-slate-400' : ''].join(' ')}>
                  {info.gymnasts}
                </p>
                <p className="text-xs text-slate-400 truncate">{info.club}</p>
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
    </div>
  )
}

// ─── interleaved timeline (2 panels) ─────────────────────────────────────────

type PerfSlot =
  | { kind: 'team'; panelNumber: number; sessionName: string; teamId: string; isDropout: boolean }
  | { kind: 'pending'; panelNumber: number; sessionName: string }

const PANEL_COLORS: Record<number, { badge: string; num: string }> = {
  1: { badge: 'bg-emerald-100 text-emerald-700', num: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  2: { badge: 'bg-violet-100 text-violet-700',   num: 'bg-violet-50 text-violet-600 border border-violet-200'   },
}

function buildPanelSlots(
  panel: Panel,
  sessions: Session[],
  sessionOrders: SessionOrder[],
  lockedSessions: string[],
  entries: CompetitionEntry[],
  globalTeams: Team[],
): PerfSlot[] {
  const panelSessions = sessions
    .filter((s) => s.panel_id === panel.id)
    .sort((a, b) => a.order_index - b.order_index)

  const slots: PerfSlot[] = []
  const droppedIds = new Set(entries.filter((e) => e.dropped_out).map((e) => e.team_id))

  for (const session of panelSessions) {
    if (!lockedSessions.includes(session.id)) {
      slots.push({ kind: 'pending', panelNumber: panel.panel_number, sessionName: session.name })
      continue
    }
    const orders = sessionOrders
      .filter((o) => o.session_id === session.id)
      .sort((a, b) => a.position - b.position)

    // include teams that appear in orders (preserves dropout positions)
    const matchingTeamIds = new Set(
      globalTeams
        .filter((t) => t.age_group === session.age_group && t.category === session.category)
        .map((t) => t.id),
    )
    for (const o of orders) {
      if (!matchingTeamIds.has(o.team_id)) continue
      slots.push({
        kind: 'team',
        panelNumber: panel.panel_number,
        sessionName: session.name,
        teamId: o.team_id,
        isDropout: droppedIds.has(o.team_id),
      })
    }
  }
  return slots
}

function InterleavedTimeline({
  lang, panels, sessions, sessionOrders, lockedSessions, entries, globalTeams, clubs,
}: {
  lang: Lang
  panels: Panel[]
  sessions: Session[]
  sessionOrders: SessionOrder[]
  lockedSessions: string[]
  entries: CompetitionEntry[]
  globalTeams: Team[]
  clubs: Club[]
}) {
  const t = T[lang]
  const [p1, p2] = panels.slice(0, 2)
  const slots1 = buildPanelSlots(p1, sessions, sessionOrders, lockedSessions, entries, globalTeams)
  const slots2 = buildPanelSlots(p2, sessions, sessionOrders, lockedSessions, entries, globalTeams)

  const merged: PerfSlot[] = []
  const len = Math.max(slots1.length, slots2.length)
  for (let i = 0; i < len; i++) {
    if (slots1[i]) merged.push(slots1[i])
    if (slots2[i]) merged.push(slots2[i])
  }

  const teamById = Object.fromEntries(globalTeams.map((t) => [t.id, t]))
  const clubById = Object.fromEntries(clubs.map((c) => [c.id, c]))

  if (merged.length === 0) {
    return <p className="text-center text-sm text-slate-400 py-16">{t.noSessions}</p>
  }

  // track which session header to show (change when session changes per panel)
  let slotIndex = 0

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <ol className="divide-y divide-slate-50">
        {merged.map((slot, i) => {
          const panelColors = PANEL_COLORS[slot.panelNumber] ?? PANEL_COLORS[1]

          if (slot.kind === 'pending') {
            return (
              <li key={`pending-${i}`} className="flex items-center gap-3 px-4 py-3 bg-slate-50">
                <span className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                  —
                </span>
                <span className={['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold shrink-0', panelColors.badge].join(' ')}>
                  P{slot.panelNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 truncate">{slot.sessionName}</p>
                  <p className="text-xs text-slate-300 italic">{t.pendingSession}</p>
                </div>
              </li>
            )
          }

          slotIndex++
          const team = teamById[slot.teamId]
          const club = team ? clubById[team.club_id] : null

          return (
            <li key={`${slot.panelNumber}-${slot.teamId}-${i}`}
              className={['flex items-center gap-3 px-4 py-3', slot.isDropout ? 'opacity-50' : ''].join(' ')}>
              <span className={['w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0', panelColors.num].join(' ')}>
                {slotIndex}
              </span>
              <span className={['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold shrink-0', panelColors.badge].join(' ')}>
                P{slot.panelNumber}
              </span>
              <div className="min-w-0 flex-1">
                <p className={['text-sm font-medium text-slate-800 truncate', slot.isDropout ? 'line-through text-slate-400' : ''].join(' ')}>
                  {team?.gymnast_display ?? slot.teamId}
                </p>
                <p className="text-xs text-slate-400 truncate">{club?.club_name ?? ''} · {slot.sessionName}</p>
              </div>
              {slot.isDropout && (
                <span className="shrink-0 text-xs font-semibold bg-red-50 text-red-400 px-2 py-0.5 rounded-full">
                  {t.dropout}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// ─── main view ────────────────────────────────────────────────────────────────

export type StartingOrderViewProps = {
  lang: Lang
  competition: Competition
  sections: Section[]
  panels: Panel[]
  sessions: Session[]
  sessionOrders: SessionOrder[]
  lockedSessions: string[]
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
}

export default function StartingOrderView({
  lang, competition, sections, panels, sessions,
  sessionOrders, lockedSessions, globalTeams, clubs, entries,
}: StartingOrderViewProps) {
  const t = T[lang]
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? '')

  const dateStr = formatDateRange(competition.start_date, competition.end_date)
  const currentSection = sections.find((s) => s.id === activeSection)
  const sectionSessions = sessions.filter((s) => s.section_id === activeSection)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">{t.title}</p>
          <h1 className="text-xl font-bold text-slate-800 leading-snug">{competition.name}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {competition.location && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {competition.location}
              </span>
            )}
            {dateStr && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
                {dateStr}
              </span>
            )}
          </div>
        </div>

        {/* section tabs */}
        {sections.length > 1 && (
          <div className="max-w-4xl mx-auto px-4 flex overflow-x-auto">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={[
                  'px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all',
                  activeSection === sec.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600',
                ].join(' ')}
              >
                {sec.label ?? `${t.section} ${sec.section_number}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {panels.length === 1 ? (
          // single panel — full width
          <div className="space-y-4">
            {sectionSessions
              .filter((s) => s.panel_id === panels[0].id)
              .sort((a, b) => a.order_index - b.order_index)
              .map((session) => (
                <SessionOrderCard
                  key={session.id}
                  session={session}
                  sessionOrders={sessionOrders}
                  isLocked={lockedSessions.includes(session.id)}
                  entries={entries}
                  globalTeams={globalTeams}
                  clubs={clubs}
                  lang={lang}
                />
              ))}
          </div>
        ) : (
          // two panels — single interleaved timeline
          <InterleavedTimeline
            lang={lang}
            panels={panels}
            sessions={sectionSessions}
            sessionOrders={sessionOrders}
            lockedSessions={lockedSessions}
            entries={entries}
            globalTeams={globalTeams}
            clubs={clubs}
          />
        )}

        {panels.length === 1 && sectionSessions.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-16">{t.noSessions}</p>
        )}
      </div>
    </div>
  )
}
