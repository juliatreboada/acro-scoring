import type { Section, Panel, Session, SessionOrder, CompetitionEntry, Team } from '@/components/admin/types'

/** One performance slot in timeline order (matches OrderTimelineView merge; no breaks). */
export type TimelinePerformanceSlot = {
  session_id: string
  team_id: string
  routine_type: Session['routine_type']
}

type AdminSlot = {
  sessionId: string
  panelNumber: number
  teamId: string
  isDropout: boolean
}

type MergedSlot = AdminSlot | { type: 'break'; id: string }

function isBreak(slot: MergedSlot): slot is { type: 'break'; id: string } {
  return 'type' in slot && slot.type === 'break'
}

/**
 * Performances in the same order as the Timeline tab for this section:
 * `timeline_order` when set (plus trailing slots not in JSON), else one-panel list or two-panel interleave.
 * Excludes breaks and dropouts (not exported to TS/music ZIP).
 */
export function orderedTimelinePerformances(
  section: Section,
  panels: Panel[],
  sectionSessions: Session[],
  sessionOrders: SessionOrder[],
  entries: CompetitionEntry[],
  globalTeams: Team[],
): TimelinePerformanceSlot[] {
  const sortedPanels = [...panels].sort((a, b) => a.panel_number - b.panel_number)
  const droppedIds = new Set(entries.filter((e) => e.dropped_out).map((e) => e.team_id))
  const sessionById = Object.fromEntries(sectionSessions.map((s) => [s.id, s]))

  function buildPanelSlots(panel: Panel): AdminSlot[] {
    const panelSessions = sectionSessions
      .filter((s) => s.panel_id === panel.id)
      .sort((a, b) => a.order_index - b.order_index)
    const slots: AdminSlot[] = []
    for (const session of panelSessions) {
      const orders = sessionOrders
        .filter((o) => o.session_id === session.id)
        .sort((a, b) => a.position - b.position)
      const isBracket = !!(session as any).bracket_phase
      let orderedIds: string[]
      let unorderedIds: string[]
      if (isBracket) {
        orderedIds = orders.map((o) => o.team_id)
        unorderedIds = []
      } else {
        const matchingTeams = globalTeams.filter(
          (t) => t.age_group === session.age_group && t.category === session.category,
        )
        const matchingIds = new Set(matchingTeams.map((t) => t.id))
        orderedIds = orders.filter((o) => matchingIds.has(o.team_id)).map((o) => o.team_id)
        unorderedIds = matchingTeams.filter((t) => !orderedIds.includes(t.id)).map((t) => t.id)
      }
      for (const teamId of [...orderedIds, ...unorderedIds]) {
        slots.push({
          sessionId: session.id,
          panelNumber: panel.panel_number,
          teamId,
          isDropout: droppedIds.has(teamId),
        })
      }
    }
    return slots
  }

  const allPanelSlots = sortedPanels.flatMap((p) => buildPanelSlots(p))
  const slotLookup = new Map<string, AdminSlot>(
    allPanelSlots.map((s) => [`${s.sessionId}:${s.teamId}`, s]),
  )

  const merged: MergedSlot[] = (() => {
    const timeline = section.timeline_order
    if (timeline && timeline.length > 0) {
      const used = new Set<string>()
      const ordered: MergedSlot[] = []
      for (const entry of timeline) {
        if ('type' in entry && entry.type === 'break') {
          ordered.push({ type: 'break', id: entry.id })
          continue
        }
        const te = entry as { session_id: string; team_id: string }
        const key = `${te.session_id}:${te.team_id}`
        const slot = slotLookup.get(key)
        if (slot) {
          ordered.push(slot)
          used.add(key)
        }
      }
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

  const out: TimelinePerformanceSlot[] = []
  for (const slot of merged) {
    if (isBreak(slot)) continue
    if (slot.isDropout) continue
    const sess = sessionById[slot.sessionId]
    if (!sess) continue
    out.push({
      session_id: slot.sessionId,
      team_id: slot.teamId,
      routine_type: sess.routine_type,
    })
  }
  return out
}
