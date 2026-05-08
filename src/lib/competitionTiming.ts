import type { Section, Session, SessionOrder, AgeGroupRule } from '@/components/admin/types'

// ─── time helpers ─────────────────────────────────────────────────────────────

export function routineDurationSec(routineType: string, routineCount: number): number {
  if (routineType === 'Balance') return 150
  if (routineType === 'Combined' && routineCount === 3) return 150
  return 120
}

export function addSecsToHHMM(hhmm: string, secs: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 3600 + m * 60 + secs
  const adj = ((total % 86400) + 86400) % 86400
  return `${String(Math.floor(adj / 3600)).padStart(2, '0')}:${String(Math.floor((adj % 3600) / 60)).padStart(2, '0')}`
}

export type SlotTimes = { warmup: string; compete: string }

export function calcPanelTimes(
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
export function calcInterleavedTimes(
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

export type AdminSlot = {
  sessionId: string
  sessionName: string
  panelNumber: number
  teamId: string
  isDropout: boolean
}

export type BreakSlot = { type: 'break'; id: string; duration_minutes: number; label?: string }
export type MergedSlot = AdminSlot | BreakSlot

export function isBreak(slot: MergedSlot): slot is BreakSlot {
  return 'type' in slot && slot.type === 'break'
}

export function calcMergedTimes(
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
