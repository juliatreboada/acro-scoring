'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Competition, Section, Panel, Session, SessionOrder, Team, Club, CompetitionEntry, AgeGroupRule } from '@/components/admin/types'
import { categoryLabel } from '@/components/admin/types'
import ClickableImg from '@/components/shared/ClickableImg'
import { formatDateRange } from '@/lib/formatDate'

// ─── time helpers ─────────────────────────────────────────────────────────────

function routineDurationSec(routineType: string, routineCount: number): number {
  if (routineType === 'Balance') return 150
  if (routineType === 'Combined' && routineCount === 3) return 150
  return 120
}

function addSecsToHHMM(hhmm: string, secs: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 3600 + m * 60 + secs
  const adj = ((total % 86400) + 86400) % 86400
  return `${String(Math.floor(adj / 3600)).padStart(2, '0')}:${String(Math.floor((adj % 3600) / 60)).padStart(2, '0')}`
}

type SlotTimes = { warmup: string; compete: string }

function calcPanelTimes(
  section: Section,
  panelSessions: Session[],
  sessionOrders: SessionOrder[],
  ageGroupRules: AgeGroupRule[],
): Map<string, SlotTimes> {
  const result = new Map<string, SlotTimes>()
  if (!section.starting_time) return result
  const startHHMM = section.starting_time.slice(0, 5)
  const waitSec   = section.waiting_time_seconds    ?? 0
  const warmupSec = (section.warmup_duration_minutes ?? 0) * 60
  let elapsed = 0
  const sorted = [...panelSessions].sort((a, b) => a.order_index - b.order_index)
  for (const session of sorted) {
    const rule = ageGroupRules.find(r => r.id === session.age_group)
    const duration = routineDurationSec(session.routine_type, rule?.routine_count ?? 2)
    const orders = sessionOrders.filter(o => o.session_id === session.id).sort((a, b) => a.position - b.position)
    for (const o of orders) {
      result.set(`${session.id}:${o.team_id}`, {
        compete: addSecsToHHMM(startHHMM, elapsed),
        warmup:  addSecsToHHMM(startHHMM, elapsed - warmupSec),
      })
      elapsed += duration + waitSec
    }
  }
  return result
}

// Alternating 2-panel: P1[0], P2[0], P1[1], P2[1], … share a single clock
function calcInterleavedTimes(
  section: Section,
  p1Sessions: Session[],
  p2Sessions: Session[],
  sessionOrders: SessionOrder[],
  ageGroupRules: AgeGroupRule[],
): Map<string, SlotTimes> {
  const result = new Map<string, SlotTimes>()
  if (!section.starting_time) return result
  const startHHMM = section.starting_time.slice(0, 5)
  const waitSec   = section.waiting_time_seconds    ?? 0
  const warmupSec = (section.warmup_duration_minutes ?? 0) * 60

  type PerfEntry = { sessionId: string; teamId: string; duration: number }
  function buildSeq(sessions: Session[]): PerfEntry[] {
    const seq: PerfEntry[] = []
    for (const s of [...sessions].sort((a, b) => a.order_index - b.order_index)) {
      const rule = ageGroupRules.find(r => r.id === s.age_group)
      const dur  = routineDurationSec(s.routine_type, rule?.routine_count ?? 2)
      for (const o of sessionOrders.filter(o => o.session_id === s.id).sort((a, b) => a.position - b.position)) {
        seq.push({ sessionId: s.id, teamId: o.team_id, duration: dur })
      }
    }
    return seq
  }

  const seq1 = buildSeq(p1Sessions)
  const seq2 = buildSeq(p2Sessions)
  let elapsed = 0
  const maxLen = Math.max(seq1.length, seq2.length)
  for (let i = 0; i < maxLen; i++) {
    if (i < seq1.length) {
      result.set(`${seq1[i].sessionId}:${seq1[i].teamId}`, {
        compete: addSecsToHHMM(startHHMM, elapsed),
        warmup:  addSecsToHHMM(startHHMM, elapsed - warmupSec),
      })
      elapsed += seq1[i].duration + waitSec
    }
    if (i < seq2.length) {
      result.set(`${seq2[i].sessionId}:${seq2[i].teamId}`, {
        compete: addSecsToHHMM(startHHMM, elapsed),
        warmup:  addSecsToHHMM(startHHMM, elapsed - warmupSec),
      })
      elapsed += seq2[i].duration + waitSec
    }
  }
  return result
}

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
    print: 'Print',
    breakLabel: 'Break',
    searchPlaceholder: 'Highlight text...',
    previousMatch: 'Previous match',
    nextMatch: 'Next match',
    matchesCount: (current: number, total: number) => `${current}/${total}`,
    finishedCompetition: 'Finished competition',
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
    print: 'Imprimir',
    breakLabel: 'Pausa',
    searchPlaceholder: 'Resaltar texto...',
    previousMatch: 'Coincidencia anterior',
    nextMatch: 'Siguiente coincidencia',
    matchesCount: (current: number, total: number) => `${current}/${total}`,
    finishedCompetition: 'Competición finalizada',
  },
}

// ─── club avatar ──────────────────────────────────────────────────────────────

function ClubAvatar({ club }: { club: Club | null | undefined }) {
  if (!club) return null
  return club.avatar_url ? (
    <img src={club.avatar_url} alt={club.club_name} className="w-5 h-5 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 text-[9px] font-semibold flex items-center justify-center shrink-0">
      {club.club_name.charAt(0).toUpperCase()}
    </div>
  )
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightText(text: string, query: string): ReactNode {
  if (!query.trim()) return text
  const rx = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  const parts = text.split(rx)
  return parts.map((part, idx) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={`${part}-${idx}`} className="search-highlight bg-yellow-200 text-slate-900 rounded px-0.5 transition-colors">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${idx}`}>{part}</span>
    ),
  )
}

// ─── session order card ───────────────────────────────────────────────────────

function SessionOrderCard({
  session, sessionOrders, isLocked, entries, globalTeams, clubs, lang, timesMap, agLabels, globalOrderMap, highlightQuery, completedRoutineKeys, ongoingRoutineKey,
}: {
  session: Session
  sessionOrders: SessionOrder[]
  isLocked: boolean
  entries: CompetitionEntry[]
  globalTeams: Team[]
  clubs: Club[]
  lang: Lang
  timesMap: Map<string, SlotTimes>
  agLabels: Record<string, string>
  globalOrderMap?: Record<string, number>
  highlightQuery: string
  completedRoutineKeys: Set<string>
  ongoingRoutineKey: string | null
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
          <p className="text-sm font-semibold text-slate-700">
            {highlightText(`${(agLabels[session.age_group] ?? session.age_group).replace(/\s*\(.*?\)$/, '')} · ${categoryLabel(session.category, lang)}`, highlightQuery)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{highlightText(session.routine_type, highlightQuery)}</p>
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
          <p className="text-sm font-semibold text-slate-700">
            {highlightText(`${(agLabels[session.age_group] ?? session.age_group).replace(/\s*\(.*?\)$/, '')} · ${categoryLabel(session.category, lang)}`, highlightQuery)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{highlightText(session.routine_type, highlightQuery)}</p>
        </div>
        <p className="px-4 py-6 text-sm text-slate-300 text-center">{t.noSessions}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-200 overflow-hidden">
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            {highlightText(`${(agLabels[session.age_group] ?? session.age_group).replace(/\s*\(.*?\)$/, '')} · ${categoryLabel(session.category, lang)}`, highlightQuery)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{highlightText(session.routine_type, highlightQuery)}</p>
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
          const times = timesMap.get(`${session.id}:${teamId}`)
          const dorsal = entries.find(e => e.team_id === teamId)?.dorsal
          const team = globalTeams.find(t => t.id === teamId)
          const photoUrl = team?.photo_url
          const club = team ? clubs.find(c => c.id === team.club_id) : undefined
          const routineKey = `${session.id}:${teamId}`
          const isCompleted = completedRoutineKeys.has(routineKey)
          const isOngoing = ongoingRoutineKey === routineKey
          return (
            <li key={teamId} className={[
              'flex items-center gap-3 px-4 py-3',
              isDropout ? 'opacity-50' : '',
              isCompleted ? 'bg-emerald-50/70' : '',
              isOngoing ? 'bg-amber-50 ring-2 ring-amber-300 ring-inset' : '',
            ].join(' ')}>
              {times && !isDropout ? (
                <div className="flex flex-col shrink-0 w-14 gap-0">
                  <span className="text-[10px] text-slate-400 leading-tight">⏰ {times.warmup}</span>
                  <span className="text-[10px] font-semibold text-slate-600 leading-tight">▶ {times.compete}</span>
                </div>
              ) : (
                <div className="w-14 shrink-0" />
              )}
              <span className={['w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                isDropout ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'].join(' ')}>
                {globalOrderMap?.[`${session.id}:${teamId}`] ?? (idx + 1)}
              </span>
              {dorsal != null && (
                <span className={['text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
                  isDropout ? 'bg-slate-100 text-slate-300' : 'bg-slate-800 text-white'].join(' ')}>
                  #{dorsal}
                </span>
              )}
              {photoUrl ? (
                <ClickableImg src={photoUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={['text-sm font-medium text-slate-800 truncate', (isDropout || isCompleted) ? 'line-through text-slate-400' : ''].join(' ')}>
                  {highlightText(info.gymnasts, highlightQuery)}
                </p>
                <p className="flex items-center gap-1 text-xs text-slate-400 truncate">
                  <ClubAvatar club={club} />
                  {highlightText(info.club, highlightQuery)}
                </p>
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
  | { kind: 'team'; panelNumber: number; sessionId: string; sessionName: string; teamId: string; isDropout: boolean }
  | { kind: 'pending'; panelNumber: number; sessionName: string }
  | { kind: 'break'; duration_minutes: number; label?: string }

const PANEL_COLORS: Record<number, { badge: string; num: string }> = {
  1: { badge: 'bg-emerald-100 text-emerald-700', num: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  2: { badge: 'bg-violet-100 text-violet-700',   num: 'bg-violet-50 text-violet-600 border border-violet-200'   },
}

function buildPanelSlots(
  panel: Panel | undefined,
  sessions: Session[],
  sessionOrders: SessionOrder[],
  lockedSessions: string[],
  entries: CompetitionEntry[],
  globalTeams: Team[],
): PerfSlot[] {
  if (!panel) return []
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
        sessionId: session.id,
        sessionName: session.name,
        teamId: o.team_id,
        isDropout: droppedIds.has(o.team_id),
      })
    }
  }
  return slots
}

function calcTimeFromMerged(
  section: Section,
  mergedSlots: PerfSlot[],
  sessions: Session[],
  ageGroupRules: AgeGroupRule[],
): Map<string, SlotTimes> {
  const result = new Map<string, SlotTimes>()
  if (!section.starting_time) return result
  const startHHMM = section.starting_time.slice(0, 5)
  const waitSec   = section.waiting_time_seconds    ?? 0
  const warmupSec = (section.warmup_duration_minutes ?? 0) * 60
  let elapsed = 0
  for (const slot of mergedSlots) {
    if (slot.kind === 'break') {
      elapsed += slot.duration_minutes * 60
      continue
    }
    if (slot.kind === 'team' && !slot.isDropout) {
      const sess = sessions.find(s => s.id === slot.sessionId)
      const rule = sess ? ageGroupRules.find(r => r.id === sess.age_group) : undefined
      const dur  = sess ? routineDurationSec(sess.routine_type, rule?.routine_count ?? 2) : 120
      result.set(`${slot.sessionId}:${slot.teamId}`, {
        compete: addSecsToHHMM(startHHMM, elapsed),
        warmup:  addSecsToHHMM(startHHMM, elapsed - warmupSec),
      })
      elapsed += dur + waitSec
    }
  }
  return result
}

function InterleavedTimeline({
  lang, panels, sessions, sessionOrders, lockedSessions, entries, globalTeams, clubs, section, ageGroupRules, highlightQuery, completedRoutineKeys, ongoingRoutineKey,
}: {
  lang: Lang
  panels: Panel[]
  sessions: Session[]
  sessionOrders: SessionOrder[]
  lockedSessions: string[]
  entries: CompetitionEntry[]
  globalTeams: Team[]
  clubs: Club[]
  section: Section
  ageGroupRules: AgeGroupRule[]
  highlightQuery: string
  completedRoutineKeys: Set<string>
  ongoingRoutineKey: string | null
}) {
  const t = T[lang]
  const [p1, p2] = panels.slice(0, 2)
  const droppedIds = new Set(entries.filter(e => e.dropped_out).map(e => e.team_id))
  const slots1 = buildPanelSlots(p1, sessions, sessionOrders, lockedSessions, entries, globalTeams)
  const slots2 = buildPanelSlots(p2, sessions, sessionOrders, lockedSessions, entries, globalTeams)

  let merged: PerfSlot[]
  if (section.timeline_order && section.timeline_order.length > 0) {
    const pendingAdded = new Set<string>()
    merged = []
    for (const entry of section.timeline_order) {
      if ('type' in entry && entry.type === 'break') {
        merged.push({ kind: 'break', duration_minutes: entry.duration_minutes, label: entry.label })
        continue
      }
      const te = entry as { session_id: string; team_id: string }
      const sess = sessions.find(s => s.id === te.session_id)
      if (!sess) continue
      const panelNum = panels.find(p => p.id === sess.panel_id)?.panel_number ?? 1
      if (!lockedSessions.includes(te.session_id)) {
        if (!pendingAdded.has(te.session_id)) {
          merged.push({ kind: 'pending', panelNumber: panelNum, sessionName: sess.name })
          pendingAdded.add(te.session_id)
        }
      } else {
        const team = globalTeams.find(t => t.id === te.team_id)
        if (!team || team.age_group !== sess.age_group || team.category !== sess.category) continue
        merged.push({
          kind: 'team',
          panelNumber: panelNum,
          sessionId: te.session_id,
          sessionName: sess.name,
          teamId: te.team_id,
          isDropout: droppedIds.has(te.team_id),
        })
      }
    }
  } else {
    merged = []
    const len = Math.max(slots1.length, slots2.length)
    for (let i = 0; i < len; i++) {
      if (slots1[i]) merged.push(slots1[i])
      if (slots2[i]) merged.push(slots2[i])
    }
  }

  const combinedTimes = calcTimeFromMerged(section, merged, sessions, ageGroupRules)

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
          const panelColors = slot.kind !== 'break' ? (PANEL_COLORS[slot.panelNumber] ?? PANEL_COLORS[1]) : PANEL_COLORS[1]

          if (slot.kind === 'break') {
            return (
              <li key={`break-${i}`} className="flex items-center gap-3 px-4 py-2.5 bg-amber-50">
                <div className="w-14 shrink-0" />
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold shrink-0 bg-amber-100 text-amber-600">
                  —
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-amber-700">{highlightText(slot.label ?? t.breakLabel, highlightQuery)}</p>
                  <p className="text-xs text-amber-500">{slot.duration_minutes} min</p>
                </div>
              </li>
            )
          }

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
                  <p className="text-xs text-slate-400 truncate">{highlightText(slot.sessionName, highlightQuery)}</p>
                  <p className="text-xs text-slate-300 italic">{t.pendingSession}</p>
                </div>
              </li>
            )
          }

          slotIndex++
          const team = teamById[slot.teamId]
          const club = team ? clubById[team.club_id] : null
          const slotTimes = combinedTimes.get(`${slot.sessionId}:${slot.teamId}`)
          const dorsal = entries.find(e => e.team_id === slot.teamId)?.dorsal
          const routineKey = `${slot.sessionId}:${slot.teamId}`
          const isCompleted = completedRoutineKeys.has(routineKey)
          const isOngoing = ongoingRoutineKey === routineKey

          return (
            <li key={`${slot.panelNumber}-${slot.teamId}-${i}`}
              className={[
                'flex items-center gap-3 px-4 py-3',
                slot.isDropout ? 'opacity-50' : '',
                isCompleted ? 'bg-emerald-50/70' : '',
                isOngoing ? 'bg-amber-50 ring-2 ring-amber-300 ring-inset' : '',
              ].join(' ')}>
              {slotTimes && !slot.isDropout ? (
                <div className="flex flex-col shrink-0 w-14 gap-0">
                  <span className="text-[10px] text-slate-400 leading-tight">⏰ {slotTimes.warmup}</span>
                  <span className="text-[10px] font-semibold text-slate-600 leading-tight">▶ {slotTimes.compete}</span>
                </div>
              ) : (
                <div className="w-14 shrink-0" />
              )}
              <span className={['w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0', panelColors.num].join(' ')}>
                {slotIndex}
              </span>
              <span className={['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold shrink-0', panelColors.badge].join(' ')}>
                P{slot.panelNumber}
              </span>
              {dorsal != null && (
                <span className={['text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
                  slot.isDropout ? 'bg-slate-100 text-slate-300' : 'bg-slate-800 text-white'].join(' ')}>
                  #{dorsal}
                </span>
              )}
              {team?.photo_url ? (
                <ClickableImg src={team.photo_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className={['text-sm font-medium text-slate-800 truncate', (slot.isDropout || isCompleted) ? 'line-through text-slate-400' : ''].join(' ')}>
                  {highlightText(team?.gymnast_display ?? slot.teamId, highlightQuery)}
                </p>
                <p className="flex items-center gap-1 text-xs text-slate-400 truncate">
                  <ClubAvatar club={club} />
                  {highlightText(`${club?.club_name ?? ''} · ${slot.sessionName}`, highlightQuery)}
                </p>
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
  ageGroupRules: AgeGroupRule[]
  completedRoutineKeys: string[]
  ongoingRoutineKey: string | null
}

export default function StartingOrderView({
  lang, competition, sections, panels, sessions,
  sessionOrders, lockedSessions, globalTeams, clubs, entries, ageGroupRules, completedRoutineKeys, ongoingRoutineKey,
}: StartingOrderViewProps) {
  const completedRoutineSet = new Set(completedRoutineKeys)
  const t = T[lang]
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? '')
  const [highlightQuery, setHighlightQuery] = useState('')
  const [matchCount, setMatchCount] = useState(0)
  const [activeMatchIndex, setActiveMatchIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const agLabels: Record<string, string> = Object.fromEntries(ageGroupRules.map(r => [r.id, r.age_group]))

  const dateStr = formatDateRange(competition.start_date, competition.end_date)
  const currentSection = sections.find((s) => s.id === activeSection)
  const sectionSessions = sessions.filter((s) => s.section_id === activeSection)
  const panelSessions = sectionSessions.filter((s) => s.panel_id === panels[0]?.id).sort((a, b) => a.order_index - b.order_index)

  const onePanelGlobalOrderMap: Record<string, number> = {}
  if (panels.length === 1) {
    let globalPos = 1
    for (const session of panelSessions) {
      if (!lockedSessions.includes(session.id)) continue
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
      const orders = sessionOrders.filter((o) => o.session_id === session.id)
      const orderedIds = orders.sort((a, b) => a.position - b.position).map((o) => o.team_id)
      const activeIds = orderedIds.filter((id) => !droppedOutIds.has(id))
      const unorderedActive = [...enteredTeamIds].filter((id) => !orderedIds.includes(id))
      const fullOrder = orderedIds.length > 0 ? orderedIds : [...activeIds, ...[...droppedOutIds]]
      for (const teamId of fullOrder) {
        onePanelGlobalOrderMap[`${session.id}:${teamId}`] = globalPos
        globalPos += 1
      }
    }
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const matches = Array.from(root.querySelectorAll<HTMLElement>('mark.search-highlight'))
    setMatchCount(matches.length)
    if (matches.length === 0) {
      setActiveMatchIndex(0)
      return
    }
    setActiveMatchIndex((prev) => Math.min(prev, matches.length - 1))
  }, [highlightQuery, activeSection, panels.length, sectionSessions.length, sessionOrders, lockedSessions, entries, globalTeams, clubs])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const matches = Array.from(root.querySelectorAll<HTMLElement>('mark.search-highlight'))
    matches.forEach((el, idx) => {
      if (idx === activeMatchIndex) {
        el.classList.add('bg-amber-300')
        el.classList.remove('bg-yellow-200')
      } else {
        el.classList.add('bg-yellow-200')
        el.classList.remove('bg-amber-300')
      }
    })
  }, [activeMatchIndex, highlightQuery, activeSection])

  function jumpToMatch(nextIndex: number) {
    const root = rootRef.current
    if (!root) return
    const matches = Array.from(root.querySelectorAll<HTMLElement>('mark.search-highlight'))
    if (matches.length === 0) return
    const normalized = ((nextIndex % matches.length) + matches.length) % matches.length
    setActiveMatchIndex(normalized)
    matches[normalized]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div ref={rootRef} className="so-print-area h-screen bg-slate-50 flex flex-col overflow-hidden print:h-auto print:block">
      {/* header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500 mb-0.5">{t.title}</p>
              <h1 className="text-lg font-bold text-slate-800 leading-snug">{competition.name}</h1>
              {competition.status === 'finished' && (
                <p className="mt-1.5 text-xs font-semibold text-slate-600">{t.finishedCompetition}</p>
              )}
            </div>
            <button
              onClick={() => window.print()}
              className="print:hidden shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t.print}
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
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
                  'px-3 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-all',
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
        <div className="max-w-4xl mx-auto px-4 pb-3 print:hidden">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur">
            <label className="relative block max-w-sm flex-1 min-w-[14rem]">
              <span className="sr-only">{t.searchPlaceholder}</span>
              <input
                type="text"
                value={highlightQuery}
                onChange={(e) => setHighlightQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <span className="text-xs font-semibold text-slate-500 px-2">
              {t.matchesCount(matchCount > 0 ? activeMatchIndex + 1 : 0, matchCount)}
            </span>
            <button
              type="button"
              onClick={() => jumpToMatch(activeMatchIndex - 1)}
              disabled={matchCount === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={t.previousMatch}
              title={t.previousMatch}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => jumpToMatch(activeMatchIndex + 1)}
              disabled={matchCount === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={t.nextMatch}
              title={t.nextMatch}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {panels.length === 1 ? (
          (() => {
            const timesMap = currentSection
              ? calcPanelTimes(currentSection, panelSessions, sessionOrders, ageGroupRules)
              : new Map<string, SlotTimes>()
            return (
              <div className="space-y-4">
                {panelSessions.map((session) => (
                  <SessionOrderCard
                    key={session.id}
                    session={session}
                    sessionOrders={sessionOrders}
                    isLocked={lockedSessions.includes(session.id)}
                    entries={entries}
                    globalTeams={globalTeams}
                    clubs={clubs}
                    lang={lang}
                    timesMap={timesMap}
                    agLabels={agLabels}
                    globalOrderMap={onePanelGlobalOrderMap}
                    highlightQuery={highlightQuery}
                    completedRoutineKeys={completedRoutineSet}
                    ongoingRoutineKey={ongoingRoutineKey}
                  />
                ))}
              </div>
            )
          })()
        ) : (
          <InterleavedTimeline
            lang={lang}
            panels={panels}
            sessions={sectionSessions}
            sessionOrders={sessionOrders}
            lockedSessions={lockedSessions}
            entries={entries}
            globalTeams={globalTeams}
            clubs={clubs}
            section={currentSection ?? sections[0]}
            ageGroupRules={ageGroupRules}
            highlightQuery={highlightQuery}
            completedRoutineKeys={completedRoutineSet}
            ongoingRoutineKey={ongoingRoutineKey}
            />
          )}

          {panels.length === 1 && sectionSessions.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-16">{t.noSessions}</p>
          )}
        </div>
      </div>
    </div>
  )
}
