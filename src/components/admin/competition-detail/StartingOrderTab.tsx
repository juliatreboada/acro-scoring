'use client'

import { useState, useRef } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Section, Panel, Session, Team, Club, CompetitionEntry, SessionOrder, AgeGroupRule, TimelineEntry } from '@/components/admin/types'
import { categoryLabel } from '@/components/admin/types'

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
    warmup: 'W',
    compete: 'C',
    viewSessions: 'Sessions',
    viewTimeline: 'Timeline',
    print: 'Print',
    addBreak: 'Add break',
    breakLabel: 'Break',
  },
  es: {
    hint: 'Establece el orden de actuación en cada sesión.',
    noTeams: 'Sin equipos inscritos para esta sesión.',
    noSections: 'Sin sesiones definidas. Ve a Estructura.',
    panelN: (n: number) => `Panel ${n}`,
    sectionN: (n: number) => `Jornada ${n}`,
    shuffle: 'Aleatorio',
    lock: 'Publicar',
    unlock: 'Publicado',
    notCompeting: 'No compiten',
    baja: 'Baja',
    warmup: 'C',
    compete: 'A',
    viewSessions: 'Sesiones',
    viewTimeline: 'Línea de tiempo',
    print: 'Imprimir',
    addBreak: 'Añadir pausa',
    breakLabel: 'Pausa',
  },
}

const PANEL_HEADER: Record<number, string> = {
  1: 'bg-blue-50 text-blue-700 border-blue-200',
  2: 'bg-violet-50 text-violet-700 border-violet-200',
}

const PANEL_COLORS: Record<number, { badge: string; num: string }> = {
  1: { badge: 'bg-emerald-100 text-emerald-700', num: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  2: { badge: 'bg-violet-100 text-violet-700',   num: 'bg-violet-50 text-violet-600 border border-violet-200'   },
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

function SessionOrderCard({ session, globalTeams, clubs, entries, sessionOrders, isLocked, lang, agLabels, timesMap, onReorder, onToggleLock }: {
  session: Session
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  sessionOrders: SessionOrder[]
  isLocked: boolean
  lang: Lang
  agLabels: Record<string, string>
  timesMap: Map<string, SlotTimes>
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

  // ── drag-and-drop state (unlocked view) ───────────────────────────────────────
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const dragNode = useRef<HTMLDivElement | null>(null)

  function handleDrop(toIdx: number) {
    if (dragIdx === null || dragIdx === toIdx) { setDragIdx(null); setOverIdx(null); return }
    const ids = orderedActive.map((t) => t.id)
    const [moved] = ids.splice(dragIdx, 1)
    ids.splice(toIdx, 0, moved)
    onReorder(session.id, [...ids, ...dropoutTeams.map((t) => t.id)])
    setDragIdx(null)
    setOverIdx(null)
  }

  return (
    <div className={['border rounded-xl overflow-hidden', isLocked ? 'border-blue-200' : 'border-slate-200'].join(' ')}>
      {/* header */}
      <div className={['px-3 py-2 border-b flex items-start justify-between gap-2', isLocked ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'].join(' ')}>
        <div>
          <p className="text-xs font-semibold text-slate-700">{(agLabels[session.age_group] ?? session.age_group).replace(/\s*\(.*?\)$/, '')} · {categoryLabel(session.category, lang)}</p>
          <p className="text-xs text-slate-400">{session.routine_type}</p>
        </div>
        {hasTeams && (
          <div className="flex items-center gap-1.5 shrink-0">
            {!isLocked && (
              <button
                onClick={shuffleOrder}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-white border border-slate-200 rounded-lg transition-all"
              >
                <ShuffleIcon />
                {t.shuffle}
              </button>
            )}
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
              const times = timesMap.get(`${session.id}:${team.id}`)
              const dorsal = sessionEntries.find(e => e.team_id === team.id)?.dorsal
              return (
                <div key={team.id} className={['flex items-center gap-2 py-1.5', isDropout ? 'opacity-50' : ''].join(' ')}>
                  {times && !isDropout ? (
                    <div className="flex flex-col shrink-0 w-14 gap-0 text-right">
                      <span className="text-[10px] text-slate-400 font-mono leading-tight">{t.warmup} {times.warmup}</span>
                      <span className="text-[10px] text-slate-600 font-mono font-semibold leading-tight">{t.compete} {times.compete}</span>
                    </div>
                  ) : (
                    <div className="w-14 shrink-0" />
                  )}
                  <span className={['text-xs font-mono w-5 shrink-0 text-right', isDropout ? 'text-slate-300 line-through' : 'text-slate-400'].join(' ')}>
                    {idx + 1}.
                  </span>
                  {dorsal != null && (
                    <span className={['text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0',
                      isDropout ? 'bg-slate-100 text-slate-300' : 'bg-slate-800 text-white'].join(' ')}>
                      #{dorsal}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={['text-xs font-medium truncate', isDropout ? 'text-slate-400 line-through' : 'text-slate-700'].join(' ')}>
                      {team.gymnast_display}
                    </p>
                    <p className={['flex items-center gap-1 text-xs truncate', isDropout ? 'text-slate-300' : 'text-slate-400'].join(' ')}>
                      <ClubAvatar club={club} />
                      {club?.club_name ?? '—'}
                    </p>
                  </div>
                  {isDropout && (
                    <span className="text-xs font-semibold text-red-300 shrink-0">{t.baja}</span>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          // ── unlocked view: drag-and-drop active teams, dropouts below divider ──
          <div className="space-y-0.5">
            {orderedActive.map((team, idx) => {
              const club = clubs.find((c) => c.id === team.club_id)
              const dorsal = sessionEntries.find(e => e.team_id === team.id)?.dorsal
              const isDragging = dragIdx === idx
              const isOver = overIdx === idx && dragIdx !== null && dragIdx !== idx
              const dropAbove = isOver && dragIdx !== null && dragIdx > idx
              const dropBelow = isOver && dragIdx !== null && dragIdx < idx
              return (
                <div
                  key={team.id}
                  ref={isDragging ? dragNode : null}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDragIdx(idx) }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOverIdx(idx) }}
                  onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
                  onDrop={(e) => { e.preventDefault(); handleDrop(idx) }}
                  className={[
                    'flex items-center gap-2 py-1.5 rounded-lg transition-all select-none',
                    isDragging ? 'opacity-40' : 'cursor-grab active:cursor-grabbing',
                    dropAbove ? 'border-t-2 border-blue-400' : '',
                    dropBelow ? 'border-b-2 border-blue-400' : '',
                    isOver ? 'bg-blue-50' : '',
                  ].join(' ')}
                >
                  {/* drag handle */}
                  <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                  </svg>
                  <span className="text-xs font-mono text-slate-400 w-5 shrink-0 text-right">{idx + 1}.</span>
                  {dorsal != null && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-white shrink-0">#{dorsal}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{team.gymnast_display}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-400 truncate">
                      <ClubAvatar club={club} />
                      {club?.club_name ?? '—'}
                    </p>
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
                  const dorsal = sessionEntries.find(e => e.team_id === team.id)?.dorsal
                  return (
                    <div key={team.id} className="flex items-center gap-2 py-1.5">
                      <span className="w-5 shrink-0" />
                      {dorsal != null && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-300 shrink-0">#{dorsal}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-300 line-through truncate">{team.gymnast_display}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-300 truncate">
                          <ClubAvatar club={club} />
                          {club?.club_name ?? '—'}
                        </p>
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

function PanelColumn({ lang, panel, sessions, globalTeams, clubs, entries, sessionOrders, lockedSessions, agLabels, timesMap, onReorder, onToggleLock }: {
  lang: Lang
  panel: Panel
  sessions: Session[]
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  sessionOrders: SessionOrder[]
  lockedSessions: string[]
  agLabels: Record<string, string>
  timesMap: Map<string, SlotTimes>
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
              timesMap={timesMap}
              onReorder={onReorder}
              onToggleLock={onToggleLock}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── admin timeline view ──────────────────────────────────────────────────────

type TimelineDragInfo =
  | { kind: 'team'; sessionId: string; teamId: string }
  | { kind: 'break'; breakId: string }

type AdminSlot = {
  sessionId: string
  sessionName: string
  panelNumber: number
  teamId: string
  isDropout: boolean
}

type BreakSlot = { type: 'break'; id: string; duration_minutes: number; label?: string }
type MergedSlot = AdminSlot | BreakSlot

function isBreak(slot: MergedSlot): slot is BreakSlot {
  return 'type' in slot && slot.type === 'break'
}

function calcMergedTimes(
  section: Section,
  mergedSlots: MergedSlot[],
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
    if (isBreak(slot)) {
      result.set(`break:${slot.id}`, {
        compete: addSecsToHHMM(startHHMM, elapsed),
        warmup:  addSecsToHHMM(startHHMM, elapsed),
      })
      elapsed += slot.duration_minutes * 60
      continue
    }
    if (!slot.isDropout) {
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

function OrderTimelineView({ lang, panels, section, sessions, sessionOrders, entries, globalTeams, clubs, ageGroupRules, onReorderTimeline }: {
  lang: Lang
  panels: Panel[]
  section: Section
  sessions: Session[]
  sessionOrders: SessionOrder[]
  entries: CompetitionEntry[]
  globalTeams: Team[]
  clubs: Club[]
  ageGroupRules: AgeGroupRule[]
  onReorderTimeline: (sectionId: string, order: Array<TimelineEntry>) => void
}) {
  const t = T[lang]
  const [dragInfo, setDragInfo] = useState<TimelineDragInfo | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)

  const sortedPanels = [...panels].sort((a, b) => a.panel_number - b.panel_number)
  const droppedIds = new Set(entries.filter(e => e.dropped_out).map(e => e.team_id))
  const dorsalMap = Object.fromEntries(entries.map(e => [e.team_id, e.dorsal]))

  function buildPanelSlots(panel: Panel): AdminSlot[] {
    const panelSessions = sessions
      .filter(s => s.panel_id === panel.id)
      .sort((a, b) => a.order_index - b.order_index)
    const slots: AdminSlot[] = []
    for (const session of panelSessions) {
      const orders = sessionOrders.filter(o => o.session_id === session.id).sort((a, b) => a.position - b.position)
      const matchingTeams = globalTeams.filter(t => t.age_group === session.age_group && t.category === session.category)
      const matchingIds = new Set(matchingTeams.map(t => t.id))
      const orderedIds = orders.filter(o => matchingIds.has(o.team_id)).map(o => o.team_id)
      const unorderedIds = matchingTeams.filter(t => !orderedIds.includes(t.id)).map(t => t.id)
      for (const teamId of [...orderedIds, ...unorderedIds]) {
        slots.push({ sessionId: session.id, sessionName: session.name, panelNumber: panel.panel_number, teamId, isDropout: droppedIds.has(teamId) })
      }
    }
    return slots
  }

  // Build slot lookup for all panels
  const allPanelSlots = sortedPanels.flatMap(p => buildPanelSlots(p))
  const slotLookup = new Map<string, AdminSlot>(allPanelSlots.map(s => [`${s.sessionId}:${s.teamId}`, s]))

  // Build merged list: use timeline_order if present, otherwise default interleaving
  const merged: MergedSlot[] = (() => {
    if (section.timeline_order && section.timeline_order.length > 0) {
      const used = new Set<string>()
      const ordered: MergedSlot[] = []
      for (const entry of section.timeline_order) {
        if ('type' in entry && entry.type === 'break') {
          ordered.push({ type: 'break', id: entry.id, duration_minutes: entry.duration_minutes, label: entry.label })
          continue
        }
        const te = entry as { session_id: string; team_id: string }
        const key = `${te.session_id}:${te.team_id}`
        const slot = slotLookup.get(key)
        if (slot) { ordered.push(slot); used.add(key) }
      }
      // Append any new slots not yet in timeline_order
      for (const slot of allPanelSlots) {
        const key = `${slot.sessionId}:${slot.teamId}`
        if (!used.has(key)) ordered.push(slot)
      }
      return ordered
    }
    if (sortedPanels.length === 1) return [...allPanelSlots]
    const slots1 = buildPanelSlots(sortedPanels[0])
    const slots2 = buildPanelSlots(sortedPanels[1])
    const result: MergedSlot[] = []
    const len = Math.max(slots1.length, slots2.length)
    for (let i = 0; i < len; i++) {
      if (i < slots1.length) result.push(slots1[i])
      if (i < slots2.length) result.push(slots2[i])
    }
    return result
  })()

  const timesMap = calcMergedTimes(section, merged, sessions, ageGroupRules)

  // Compute drag validity bounds (only relevant when dragging a team slot)
  let dragBounds = { prevBound: -1, nextBound: merged.length }
  if (dragInfo?.kind === 'team') {
    const dragIdx = merged.findIndex(s => !isBreak(s) && s.teamId === dragInfo.teamId && s.sessionId === dragInfo.sessionId)
    if (dragIdx !== -1) {
      const dragSlot = merged[dragIdx] as AdminSlot
      const dragPanel = dragSlot.panelNumber
      let prevBound = -1
      for (let i = dragIdx - 1; i >= 0; i--) {
        const s = merged[i]; if (isBreak(s)) continue
        if (s.panelNumber === dragPanel) { prevBound = i; break }
      }
      let nextBound = merged.length
      for (let i = dragIdx + 1; i < merged.length; i++) {
        const s = merged[i]; if (isBreak(s)) continue
        if (s.panelNumber === dragPanel) { nextBound = i; break }
      }
      dragBounds = { prevBound, nextBound }
    }
  }

  function mergedToOrder(): TimelineEntry[] {
    return merged.map(s => isBreak(s)
      ? { type: 'break' as const, id: s.id, duration_minutes: s.duration_minutes, label: s.label }
      : { session_id: s.sessionId, team_id: s.teamId }
    )
  }

  function handleDrop(dropIdx: number) {
    if (!dragInfo) return
    const dragIdx = dragInfo.kind === 'break'
      ? merged.findIndex(s => isBreak(s) && s.id === dragInfo.breakId)
      : merged.findIndex(s => !isBreak(s) && s.teamId === dragInfo.teamId && s.sessionId === dragInfo.sessionId)
    setDragInfo(null); setOverIdx(null)
    if (dragIdx === -1 || dragIdx === dropIdx) return
    if (dragInfo.kind === 'team') {
      const dragSlot = merged[dragIdx] as AdminSlot
      const dropSlot = merged[dropIdx]
      if (dragSlot.isDropout || (!isBreak(dropSlot) && dropSlot.isDropout)) return
      if (dropIdx <= dragBounds.prevBound || dropIdx >= dragBounds.nextBound) return
    }
    const newOrder = mergedToOrder()
    const [moved] = newOrder.splice(dragIdx, 1)
    newOrder.splice(dropIdx, 0, moved)
    onReorderTimeline(section.id, newOrder)
  }

  function handleAddBreak() {
    const newBreak: TimelineEntry = { type: 'break', id: crypto.randomUUID(), duration_minutes: 15 }
    onReorderTimeline(section.id, [...mergedToOrder(), newBreak])
  }

  function handleRemoveBreak(breakId: string) {
    onReorderTimeline(section.id, mergedToOrder().filter(e => !('type' in e && e.id === breakId)))
  }

  function handleMoveBreak(breakId: string, direction: 'up' | 'down') {
    const idx = merged.findIndex(s => isBreak(s) && s.id === breakId)
    if (idx === -1) return
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= merged.length) return
    const newOrder = mergedToOrder()
    ;[newOrder[idx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[idx]]
    onReorderTimeline(section.id, newOrder)
  }

  function handleUpdateBreakDuration(breakId: string, minutes: number) {
    const newOrder = mergedToOrder().map(e =>
      'type' in e && e.id === breakId ? { ...e, duration_minutes: Math.max(1, minutes) } : e
    )
    onReorderTimeline(section.id, newOrder)
  }

  const teamById = Object.fromEntries(globalTeams.map(t => [t.id, t]))
  const clubById = Object.fromEntries(clubs.map(c => [c.id, c]))

  // Pre-compute sequential position numbers (active teams only)
  let _n = 0
  const positions = merged.map(s => { if (!isBreak(s) && !s.isDropout) _n++; return _n })

  if (merged.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-center text-sm text-slate-400 py-16">{t.noTeams}</p>
        <button
          onClick={handleAddBreak}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 border-dashed rounded-xl hover:bg-amber-100 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t.addBreak}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <ol className="divide-y divide-slate-50">
          {merged.map((slot, idx) => {
            if (isBreak(slot)) {
              const breakTimes = timesMap.get(`break:${slot.id}`)
              const isDraggingBreak = dragInfo?.kind === 'break' && dragInfo.breakId === slot.id
              const isValidDropBreak = (dragInfo?.kind === 'break' && !isDraggingBreak) ||
                (dragInfo?.kind === 'team' && idx > dragBounds.prevBound && idx < dragBounds.nextBound)
              const isDimmedBreak = dragInfo !== null && !isDraggingBreak && !isValidDropBreak
              const isOverBreak = overIdx === idx && isValidDropBreak
              return (
                <li
                  key={`break-${slot.id}`}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDragInfo({ kind: 'break', breakId: slot.id }) }}
                  onDragOver={(e) => { if (isValidDropBreak) { e.preventDefault(); setOverIdx(idx) } }}
                  onDragEnd={() => { setDragInfo(null); setOverIdx(null) }}
                  onDrop={(e) => { e.preventDefault(); handleDrop(idx) }}
                  className={[
                    'flex items-center gap-3 px-4 py-2.5 select-none transition-all cursor-grab active:cursor-grabbing',
                    isDraggingBreak ? 'opacity-30' : '',
                    isDimmedBreak   ? 'opacity-25' : '',
                    isOverBreak     ? 'bg-amber-100 border-t-2 border-amber-400' : 'bg-amber-50',
                  ].join(' ')}
                >
                  {/* drag handle */}
                  <svg className="w-3.5 h-3.5 shrink-0 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                  </svg>
                  {/* times */}
                  {breakTimes ? (
                    <div className="flex flex-col shrink-0 w-14 gap-0">
                      <span className="text-[10px] font-semibold text-amber-600 leading-tight">▶ {breakTimes.compete}</span>
                    </div>
                  ) : (
                    <div className="w-14 shrink-0" />
                  )}
                  {/* break icon */}
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {/* panel badge placeholder when dual panel */}
                  {sortedPanels.length > 1 && <div className="w-10 shrink-0" />}
                  {/* label + duration controls */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-amber-700">{slot.label ?? t.breakLabel}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <button
                        onClick={() => handleUpdateBreakDuration(slot.id, slot.duration_minutes - 5)}
                        className="w-5 h-5 flex items-center justify-center rounded text-amber-500 hover:bg-amber-100 text-xs font-bold leading-none"
                      >−</button>
                      <span className="text-xs text-amber-600 font-mono min-w-[3.5rem] text-center">{slot.duration_minutes} min</span>
                      <button
                        onClick={() => handleUpdateBreakDuration(slot.id, slot.duration_minutes + 5)}
                        className="w-5 h-5 flex items-center justify-center rounded text-amber-500 hover:bg-amber-100 text-xs font-bold leading-none"
                      >+</button>
                    </div>
                  </div>
                  {/* up / down / remove */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => handleMoveBreak(slot.id, 'up')}
                      disabled={idx === 0}
                      className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMoveBreak(slot.id, 'down')}
                      disabled={idx === merged.length - 1}
                      className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRemoveBreak(slot.id)}
                      className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              )
            }

            const team       = teamById[slot.teamId]
            const club       = team ? clubById[team.club_id] : null
            const slotTimes  = timesMap.get(`${slot.sessionId}:${slot.teamId}`)
            const dorsal     = dorsalMap[slot.teamId]
            const colors     = PANEL_COLORS[slot.panelNumber] ?? PANEL_COLORS[1]
            const isDragging = dragInfo?.kind === 'team' && dragInfo.teamId === slot.teamId && dragInfo.sessionId === slot.sessionId
            const slotIsDropout = slot.isDropout
            const isValidDrop = dragInfo !== null && !slotIsDropout && !isDragging
              && idx > dragBounds.prevBound && idx < dragBounds.nextBound
            const isDimmed   = dragInfo !== null && !isDragging && !isValidDrop
            const isOver     = overIdx === idx && isValidDrop

            return (
              <li
                key={`${slot.panelNumber}-${slot.teamId}-${idx}`}
                draggable={!slot.isDropout}
                onDragStart={!slot.isDropout ? (e) => { e.dataTransfer.effectAllowed = 'move'; setDragInfo({ kind: 'team', sessionId: slot.sessionId, teamId: slot.teamId }) } : undefined}
                onDragOver={(e) => { if (isValidDrop) { e.preventDefault(); setOverIdx(idx) } }}
                onDragEnd={() => { setDragInfo(null); setOverIdx(null) }}
                onDrop={(e) => { e.preventDefault(); handleDrop(idx) }}
                className={[
                  'flex items-center gap-3 px-4 py-3 select-none transition-all',
                  slot.isDropout ? 'opacity-50' : '',
                  isDragging ? 'opacity-30' : '',
                  isDimmed   ? 'opacity-25' : '',
                  isOver     ? 'bg-blue-50 border-t-2 border-blue-400' : '',
                  !slot.isDropout ? 'cursor-grab active:cursor-grabbing' : '',
                ].join(' ')}
              >
                {/* drag handle */}
                <svg className={['w-3.5 h-3.5 shrink-0', slot.isDropout ? 'text-slate-100' : 'text-slate-300'].join(' ')} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                </svg>
                {/* times */}
                {slotTimes && !slot.isDropout ? (
                  <div className="flex flex-col shrink-0 w-14 gap-0">
                    <span className="text-[10px] text-slate-400 leading-tight">⏰ {slotTimes.warmup}</span>
                    <span className="text-[10px] font-semibold text-slate-600 leading-tight">▶ {slotTimes.compete}</span>
                  </div>
                ) : (
                  <div className="w-14 shrink-0" />
                )}
                {/* position */}
                <span className={['w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  slot.isDropout ? 'bg-slate-100 text-slate-400' : colors.num].join(' ')}>
                  {positions[idx]}
                </span>
                {/* panel badge — only when dual panel */}
                {sortedPanels.length > 1 && (
                  <span className={['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold shrink-0', colors.badge].join(' ')}>
                    P{slot.panelNumber}
                  </span>
                )}
                {/* dorsal */}
                {dorsal != null && (
                  <span className={['text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
                    slot.isDropout ? 'bg-slate-100 text-slate-300' : 'bg-slate-800 text-white'].join(' ')}>
                    #{dorsal}
                  </span>
                )}
                {/* photo */}
                {team?.photo_url ? (
                  <img src={team.photo_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0 flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={['text-sm font-medium text-slate-800 truncate', slot.isDropout ? 'line-through text-slate-400' : ''].join(' ')}>
                    {team?.gymnast_display ?? slot.teamId}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-slate-400 truncate">
                    <ClubAvatar club={club} />
                    {club?.club_name ?? ''} · {slot.sessionName}
                  </p>
                </div>
                {slot.isDropout && (
                  <span className="shrink-0 text-xs font-semibold bg-red-50 text-red-400 px-2 py-0.5 rounded-full">
                    {t.baja}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </div>
      <button
        onClick={handleAddBreak}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 border-dashed rounded-xl hover:bg-amber-100 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {t.addBreak}
      </button>
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
  ageGroupRules: AgeGroupRule[]
  onReorder: (sessionId: string, teamIds: string[]) => void
  onToggleLock: (sessionId: string) => void
  onReorderTimeline: (sectionId: string, order: Array<TimelineEntry>) => void
}

export default function StartingOrderTab({
  lang, globalTeams, clubs, entries, sections, panels, sessions,
  sessionOrders, lockedSessions, agLabels, ageGroupRules, onReorder, onToggleLock, onReorderTimeline,
}: StartingOrderTabProps) {
  const t = T[lang]
  const sortedSections = [...sections].sort((a, b) => a.section_number - b.section_number)
  const [activeSectionId, setActiveSectionId] = useState<string>(sortedSections[0]?.id ?? '')
  const [view, setView] = useState<'sessions' | 'timeline'>('sessions')

  const activeSection = sortedSections.find((s) => s.id === activeSectionId) ?? sortedSections[0]

  function tabLabel(sec: Section) {
    return sec.label ?? t.sectionN(sec.section_number)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <p className="text-xs text-slate-400">{t.hint}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {t.print}
          </button>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden shrink-0 text-xs font-semibold">
            {(['sessions', 'timeline'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={['px-3 py-1.5 transition-colors',
                  view === v ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 hover:text-slate-600'].join(' ')}>
                {v === 'sessions' ? t.viewSessions : t.viewTimeline}
              </button>
            ))}
          </div>
        </div>
      </div>

      {sortedSections.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-xl">
          {t.noSections}
        </p>
      ) : (
        <div className="so-print-area">
          <div className="flex border-b border-slate-200 gap-0 print:hidden">
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

          {activeSection && (() => {
            const sortedPanels = [...panels].sort((a, b) => a.panel_number - b.panel_number)
            const sectionSessions = sessions.filter(s => s.section_id === activeSection.id)

            if (view === 'timeline') {
              return (
                <OrderTimelineView
                  lang={lang}
                  panels={sortedPanels}
                  section={activeSection}
                  sessions={sectionSessions}
                  sessionOrders={sessionOrders}
                  entries={entries}
                  globalTeams={globalTeams}
                  clubs={clubs}
                  ageGroupRules={ageGroupRules}
                  onReorderTimeline={onReorderTimeline}
                />
              )
            }

            const timesMap = sortedPanels.length === 2
              ? calcInterleavedTimes(
                  activeSection,
                  sectionSessions.filter(s => s.panel_id === sortedPanels[0].id),
                  sectionSessions.filter(s => s.panel_id === sortedPanels[1].id),
                  sessionOrders,
                  ageGroupRules,
                )
              : calcPanelTimes(activeSection, sectionSessions, sessionOrders, ageGroupRules)
            return (
              <div className={['grid gap-4', panels.length === 2 ? 'grid-cols-2' : 'grid-cols-1'].join(' ')}>
                {sortedPanels.map((panel) => (
                  <PanelColumn
                    key={panel.id}
                    lang={lang}
                    panel={panel}
                    sessions={sectionSessions.filter(s => s.panel_id === panel.id)}
                    globalTeams={globalTeams}
                    clubs={clubs}
                    entries={entries}
                    sessionOrders={sessionOrders}
                    lockedSessions={lockedSessions}
                    agLabels={agLabels}
                    timesMap={timesMap}
                    onReorder={onReorder}
                    onToggleLock={onToggleLock}
                  />
                ))}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
