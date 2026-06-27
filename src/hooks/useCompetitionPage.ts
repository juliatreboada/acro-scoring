'use client'

import { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react'
import { createClient } from '@/lib/supabase'
import type {
  Competition, Panel, Section, Session, Judge, SectionPanelJudge,
  Role, Team, Club, CompetitionEntry, SessionOrder, AdminUser,
  AgeGroupRule, CompetitionJudgeNomination, Gymnast, Coach, TimelineEntry,
  ProvisionalEntry, DefinitiveEntry, Apparatus, ApparatusRule, RankingMergeGroup,
} from '@/components/admin/types'
import { ROLE_CONFIG, defaultSlots, NEXT_STATUS, PREV_STATUS } from '@/components/admin/types'
import type { PanelLock } from '@/components/admin/competition-detail/JudgesTab'

export function useCompetitionPage(slug: string) {
  const supabase = createClient()

  const [loading, setLoading]             = useState(true)
  const [competition, setCompetition]     = useState<Competition | null>(null)
  const [panels, setPanels]               = useState<Panel[]>([])
  const [sections, setSections]           = useState<Section[]>([])
  const [sessions, setSessions]           = useState<Session[]>([])
  const [globalJudges, setGlobalJudges]   = useState<Judge[]>([])
  const [judgePool, setJudgePool]         = useState<string[]>([])
  const [nominations, setNominations]     = useState<CompetitionJudgeNomination[]>([])
  const [assignments, setAssignments]     = useState<SectionPanelJudge[]>([])
  const [globalTeams, setGlobalTeams]     = useState<Team[]>([])
  const [clubs, setClubs]                 = useState<Club[]>([])
  const [entries, setEntries]             = useState<CompetitionEntry[]>([])
  const [sessionOrders, setSessionOrders] = useState<SessionOrder[]>([])
  const [lockedSessions, setLockedSessions] = useState<string[]>([])
  const [panelLocks, setPanelLocks]       = useState<PanelLock[]>([])
  const [availableAdmins, setAvailableAdmins] = useState<AdminUser[]>([])
  const [ageGroupRules, setAgeGroupRules] = useState<AgeGroupRule[]>([])
  const [apparatus, setApparatus] = useState<Apparatus[]>([])
  const [apparatusRules, setApparatusRules] = useState<ApparatusRule[]>([])
  const [competitionGymnasts, setCompetitionGymnasts] = useState<Gymnast[]>([])
  const [globalCoaches,      setGlobalCoaches]        = useState<Coach[]>([])
  const [competitionCoaches, setCompetitionCoaches]   = useState<Coach[]>([])
  const [provisionalEntries, setProvisionalEntries]   = useState<ProvisionalEntry[]>([])
  const [definitiveEntries,  setDefinitiveEntries]    = useState<DefinitiveEntry[]>([])
  const [rankingMergeGroups, setRankingMergeGroups]   = useState<RankingMergeGroup[]>([])
  const [actionError, setActionError] = useState<string | null>(null)

  // ── initial load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        // Step 1: resolve slug → UUID
        const { data: compRow } = await supabase.from('competitions')
          .select('id,slug,name,status,sport_type,location,start_date,end_date,provisional_entry_deadline,definitive_entry_deadline,registration_deadline,ts_music_deadline,tshirt_sizes,tshirt_deadline,meals_enabled,meals_locked,accreditation_config,age_groups,poster_url,logo_url,admin_id,created_at,fee_per_team,fee_per_gymnast,judge_missing_fine,open_combinados_enabled,show_official_trainings')
          .eq('slug', slug).single()
        if (!compRow) { setLoading(false); return }
        const id = compRow.id

        // Step 2: parallel queries using UUID
        const [panelsRes, sectionsRes, sessionsRes, judgesRes,
               nominationsRes, entriesRes, rulesRes, adminsRes, provRes, defRes,
               apparatusRes, apparatusRulesRes, mergeGroupsRes] = await Promise.all([
          supabase.from('panels').select('id,competition_id,panel_number').eq('competition_id', id).order('panel_number'),
          supabase.from('sections').select('id,competition_id,section_number,label,starting_time,waiting_time_seconds,warmup_duration_minutes,timeline_order').eq('competition_id', id).order('section_number'),
          supabase.from('sessions').select('id,competition_id,panel_id,section_id,name,age_group,category,routine_type,status,order_index,order_locked,dj_method,ej_method,ranking_merge_group_id,bracket_phase').eq('competition_id', id).order('order_index'),
          supabase.from('judges').select('id,full_name,phone,licence,licencia_url,avatar_url,sport_type'),
          supabase.from('competition_judge_nominations').select('id,competition_id,judge_id,club_id').eq('competition_id', id),
          supabase.from('competition_entries').select('id,competition_id,team_id,dorsal,dropped_out,gymnast_display,gymnast_ids').eq('competition_id', id),
          supabase.from('age_group_rules').select('id,age_group,level,ruleset,min_age,max_age,routine_count,sort_order,sport_type').order('sort_order'),
          supabase.from('profiles').select('id,email').eq('role', 'admin'),
          supabase.from('provisional_entries').select('id,club_id,teams_per_category,created_at').eq('competition_id', id),
          supabase.from('definitive_entries').select('id,club_id,contact_name,contact_phone,contact_email,teams_per_category,judge_name,total_amount,status,payment_document_url,admin_notes,created_at').eq('competition_id', id),
          supabase.from('apparatus').select('id,name,name_es,sort_order').order('sort_order'),
          supabase.from('apparatus_rules').select('id,age_group_rule_id,year,apparatus_id,is_mandatory,sort_order').order('sort_order'),
          supabase.from('ranking_merge_groups').select('id,label_es,label_en').eq('competition_id', id),
        ])

        // (competition already validated above)

        // ── wave 2: queries that depend on wave-1 IDs ─────────────────────────
        type TeamRow = { id: string; club_id: string; category: string; age_group: string; gymnast_display: string; photo_url: string | null; gymnast_ids: string[] | null }
        const entryTeamIds  = (entriesRes.data ?? []).map(e => e.team_id)
        const rawSessions   = sessionsRes.data ?? []
        const locked        = rawSessions.filter(s => s.order_locked || s.bracket_phase).map(s => s.id)
        const adminProfiles = adminsRes.data ?? []
        const rawJudges     = judgesRes.data ?? []
        const judgeIds      = rawJudges.map(j => j.id)
        const rawSectionIds = (sectionsRes.data ?? []).map(s => s.id)
        const rawPanelIds   = (panelsRes.data ?? []).map(p => p.id)

        const { data: { session: authSession } } = await supabase.auth.getSession()
        const authToken = authSession?.access_token

        const [teamsResult, teamGymnastsResult, ordersResult, adminEmailsResult, judgeProfilesResult, panelLocksResult, assignmentsResult] = await Promise.all([
          entryTeamIds.length > 0
            ? supabase.from('teams').select('id,club_id,category,age_group,gymnast_display,photo_url').in('id', entryTeamIds) as unknown as Promise<{ data: TeamRow[] | null }>
            : Promise.resolve({ data: [] as TeamRow[] }),
          entryTeamIds.length > 0
            ? supabase.from('team_gymnasts').select('team_id,gymnast_id').in('team_id', entryTeamIds)
            : Promise.resolve({ data: [] as { team_id: string; gymnast_id: string }[] }),
          locked.length > 0
            ? supabase.from('session_orders').select('session_id,team_id,position').in('session_id', locked)
            : Promise.resolve({ data: [] }),
          adminProfiles.length > 0
            ? fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
                body: JSON.stringify({ ids: adminProfiles.map(p => p.id) }),
              })
            : Promise.resolve(null),
          judgeIds.length > 0
            ? supabase.from('profiles').select('id,email').in('id', judgeIds)
            : Promise.resolve({ data: [] }),
          rawSectionIds.length > 0 && rawPanelIds.length > 0
            ? (supabase as any).from('section_panel_locks').select('section_id,panel_id,locked').in('section_id', rawSectionIds).in('panel_id', rawPanelIds)
            : Promise.resolve({ data: [] as { section_id: string; panel_id: string; locked: boolean }[] }),
          rawSectionIds.length > 0
            ? supabase.from('section_panel_judges').select('id,section_id,panel_id,judge_id,role,role_number').in('section_id', rawSectionIds)
            : Promise.resolve({ data: [] }),
        ])

        const rawTeamsData = teamsResult.data ?? []
        const teamGymnastsMap = new Map<string, string[]>()
        for (const row of (teamGymnastsResult.data ?? [])) {
          const r = row as { team_id: string; gymnast_id: string }
          if (!teamGymnastsMap.has(r.team_id)) teamGymnastsMap.set(r.team_id, [])
          teamGymnastsMap.get(r.team_id)!.push(r.gymnast_id)
        }
        const teamsData    = rawTeamsData.map(t => ({ ...t, gymnast_ids: teamGymnastsMap.get(t.id) ?? [] }))
        const ordersData   = ordersResult.data
        const judgeEmailMap = Object.fromEntries(((judgeProfilesResult as any).data ?? []).map((p: any) => [p.id, p.email ?? null]))
        const panelLocksData = (panelLocksResult as any).data
        const assignmentsRes = assignmentsResult

        let adminsWithEmail: AdminUser[] = []
        if (adminEmailsResult) {
          if ((adminEmailsResult as Response).ok) {
            adminsWithEmail = await (adminEmailsResult as Response).json()
          } else {
            adminsWithEmail = adminProfiles.map(p => ({ id: p.id, full_name: '', email: p.email ?? '' }))
          }
        }

        // ── wave 3: clubs + gymnasts depend on teams ──────────────────────────
        const nominationClubIds = (nominationsRes.data ?? []).map(n => n.club_id).filter(Boolean) as string[]
        const clubIds       = [...new Set([...teamsData.map(t => t.club_id), ...nominationClubIds])]
        const allGymnastIds = [...new Set(teamsData.flatMap(t => t.gymnast_ids ?? []))]

        const [clubsResult, gymnastsResult, compCoachesResult] = await Promise.all([
          clubIds.length > 0
            ? supabase.from('clubs').select('id,club_name,contact_name,phone,avatar_url').in('id', clubIds)
            : Promise.resolve({ data: [] }),
          allGymnastIds.length > 0
            ? (supabase as any).from('gymnasts').select('id,club_id,first_name,last_name_1,last_name_2,date_of_birth,photo_url,licencia_url').in('id', allGymnastIds) as Promise<{ data: Gymnast[] | null }>
            : Promise.resolve({ data: [] as Gymnast[] }),
          (supabase as any).from('competition_coaches').select('coach_id').eq('competition_id', id),
        ])

        const clubsData    = clubsResult.data
        const gymnastsData = gymnastsResult.data
        const registeredCoachIds = ((compCoachesResult as any).data ?? []).map((r: { coach_id: string }) => r.coach_id) as string[]

        const coachesResult = registeredCoachIds.length > 0
          ? await (supabase as any).from('coaches').select('id,club_id,full_name,licence,photo_url,licencia_url').in('id', registeredCoachIds)
          : { data: [] }
        const coachesData = (coachesResult as any).data as Coach[] ?? []

        const adminMap = Object.fromEntries(adminsWithEmail.map(a => [a.id, a]))
        const { admin_id, ...compRest } = compRow
        const rawNoms = nominationsRes.data ?? []

        setCompetition({ ...compRest, admin: admin_id ? (adminMap[admin_id] ?? null) : null } as unknown as Competition)
        setPanels((panelsRes.data ?? []) as unknown as Panel[])
        setSections((sectionsRes.data ?? []) as unknown as Section[])
        setSessions(rawSessions.map(({ order_locked: _, ...s }) => s) as Session[])
        const compSportType = compRow.sport_type ?? 'acro'
        setGlobalJudges(
          rawJudges
            .filter(j => (j as any).sport_type === compSportType)
            .map(j => ({ ...j, email: judgeEmailMap[j.id] ?? null }))
        )
        setNominations(rawNoms)
        setJudgePool(rawNoms.map(n => n.judge_id))
        setAssignments(assignmentsRes.data ?? [])
        setGlobalTeams(teamsData as unknown as Team[])
        setClubs(clubsData ?? [])
        setCompetitionGymnasts(gymnastsData ?? [])
        setGlobalCoaches(coachesData)
        setCompetitionCoaches(coachesData)
        setEntries(entriesRes.data ?? [])
        setLockedSessions(locked)
        setPanelLocks(panelLocksData ?? [])
        setSessionOrders(ordersData ?? [])
        setAvailableAdmins(adminsWithEmail)
        setAgeGroupRules((rulesRes.data ?? []) as unknown as AgeGroupRule[])
        setApparatus((apparatusRes.data ?? []) as Apparatus[])
        setApparatusRules((apparatusRulesRes.data ?? []) as ApparatusRule[])
        setProvisionalEntries((provRes.data ?? []) as ProvisionalEntry[])
        setDefinitiveEntries((defRes.data ?? []) as DefinitiveEntry[])
        setRankingMergeGroups((mergeGroupsRes.data ?? []) as RankingMergeGroup[])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── session eligible counts (for merge group UI) ─────────────────────────────
  const sessionEligibleTeamCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const session of sessions) {
      if (session.bracket_phase) {
        // Bracket sessions get their teams from session_orders, not competition_entries
        counts[session.id] = sessionOrders.filter(o => o.session_id === session.id).length
      } else {
        counts[session.id] = entries
          .filter(e => !e.dropped_out)
          .filter(e => {
            const team = globalTeams.find(t => t.id === e.team_id)
            return team?.age_group === session.age_group && team?.category === session.category
          }).length
      }
    }
    return counts
  }, [sessions, entries, globalTeams, sessionOrders])

  // ── status ────────────────────────────────────────────────────────────────────
  async function handleAdvanceStatus() {
    if (!competition) return
    const next = NEXT_STATUS[competition.status]
    if (!next) return
    await supabase.from('competitions').update({ status: next }).eq('id', competition.id)
    setCompetition(prev => prev ? { ...prev, status: next } : prev)
  }

  async function handleRevertStatus() {
    if (!competition) return
    const prev = PREV_STATUS[competition.status]
    if (!prev) return
    await supabase.from('competitions').update({ status: prev }).eq('id', competition.id)
    setCompetition(curr => curr ? { ...curr, status: prev } : curr)
  }

  // ── panel count ───────────────────────────────────────────────────────────────
  async function handleSetPanelCount(count: 1 | 2) {
    let p1 = panels.find(p => p.panel_number === 1)
    if (!p1) {
      const { data } = await supabase.from('panels')
        .insert({ competition_id: competition!.id, panel_number: 1 }).select().single()
      if (!data) return
      p1 = data as unknown as Panel
    }

    if (count === 1) {
      const p2 = panels.find(p => p.panel_number === 2)
      if (p2) {
        await supabase.from('panels').delete().eq('id', p2.id)
        await supabase.from('sessions').update({ panel_id: p1.id }).eq('competition_id', competition!.id).eq('panel_id', p2.id)
        setSessions(prev => prev.map(s => s.panel_id === p2.id ? { ...s, panel_id: p1!.id } : s))
      }
      setPanels([p1])
    } else {
      let p2 = panels.find(p => p.panel_number === 2)
      if (!p2) {
        const { data } = await supabase.from('panels')
          .insert({ competition_id: competition!.id, panel_number: 2 }).select().single()
        if (!data) return
        p2 = data as unknown as Panel
        const slots = sections.flatMap(sec =>
          defaultSlots(sec.id, p2!.id).map(slot => ({
            section_id: slot.section_id, panel_id: slot.panel_id,
            judge_id: slot.judge_id, role: slot.role, role_number: slot.role_number,
          }))
        )
        if (slots.length > 0) {
          const { data: newSlots } = await supabase.from('section_panel_judges').insert(slots).select()
          if (newSlots) setAssignments(prev => [...prev, ...newSlots])
        }
      }
      setPanels([p1, p2])
    }
  }

  // ── sections ──────────────────────────────────────────────────────────────────
  async function handleAddSection() {
    let activePanels = panels
    if (activePanels.length === 0) {
      const { data } = await supabase.from('panels')
        .insert({ competition_id: competition!.id, panel_number: 1 }).select().single()
      if (!data) return
      const p1 = data as unknown as Panel
      setPanels([p1])
      activePanels = [p1]
    }

    const nextNum = sections.length > 0 ? Math.max(...sections.map(s => s.section_number)) + 1 : 1
    const { data: newSection } = await supabase.from('sections')
      .insert({ competition_id: competition!.id, section_number: nextNum, label: null }).select().single()
    if (!newSection) return
    setSections(prev => [...prev, newSection as unknown as Section])
    const slots = activePanels.flatMap(pan =>
      defaultSlots(newSection.id, pan.id).map(slot => ({
        section_id: slot.section_id, panel_id: slot.panel_id,
        judge_id: slot.judge_id, role: slot.role, role_number: slot.role_number,
      }))
    )
    if (slots.length > 0) {
      const { data: newSlots } = await supabase.from('section_panel_judges').insert(slots).select()
      if (newSlots) setAssignments(prev => [...prev, ...newSlots])
    }
  }

  async function handleUpdateSectionLabel(sectionId: string, label: string) {
    await supabase.from('sections').update({ label: label || null }).eq('id', sectionId)
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, label: label || null } : s))
  }

  async function handleUpdateSectionTimes(sectionId: string, times: {
    starting_time: string | null
    waiting_time_seconds: number | null
    warmup_duration_minutes: number | null
  }) {
    await supabase.from('sections').update(times).eq('id', sectionId)
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, ...times } : s))
  }

  async function handleDeleteSection(sectionId: string) {
    await supabase.from('sections').delete().eq('id', sectionId)
    setSections(prev => prev.filter(s => s.id !== sectionId))
    setSessions(prev => prev.filter(s => s.section_id !== sectionId))
    setAssignments(prev => prev.filter(a => a.section_id !== sectionId))
  }

  // ── sessions ──────────────────────────────────────────────────────────────────
  async function handleAddSession(s: Omit<Session, 'id'>) {
    const { data: newSession } = await supabase.from('sessions').insert(s).select().single()
    if (newSession) setSessions(prev => [...prev, newSession as Session])
  }

  async function handleDeleteSession(sessionId: string) {
    await supabase.from('sessions').delete().eq('id', sessionId)
    setSessions(prev => prev.filter(s => s.id !== sessionId))
  }

  async function handleReorderStructureSessions(sessionIds: string[]) {
    setSessions(prev =>
      prev.map(s => {
        const idx = sessionIds.indexOf(s.id)
        return idx >= 0 ? { ...s, order_index: idx + 1 } : s
      })
    )
    await Promise.all(
      sessionIds.map((id, idx) =>
        supabase.from('sessions').update({ order_index: idx + 1 }).eq('id', id)
      )
    )
  }

  // ── judges ────────────────────────────────────────────────────────────────────
  async function handleAddToPool(judgeId: string) {
    const { data: nom, error } = await supabase.from('competition_judge_nominations')
      .insert({ competition_id: competition!.id, judge_id: judgeId, club_id: null })
      .select().single()
    if (error) { setActionError(error.message); return }
    if (nom) setNominations(prev => [...prev, nom as CompetitionJudgeNomination])
    setJudgePool(prev => [...prev, judgeId])
  }

  async function handleRemoveFromPool(judgeId: string) {
    await supabase.from('competition_judge_nominations')
      .delete().eq('competition_id', competition!.id).eq('judge_id', judgeId)
    setNominations(prev => prev.filter(n => n.judge_id !== judgeId))
    setJudgePool(prev => prev.filter(jid => jid !== judgeId))
    setAssignments(prev => prev.map(a => a.judge_id === judgeId ? { ...a, judge_id: null } : a))
  }

  async function handleAssignJudge(slotId: string, judgeId: string | null) {
    await supabase.from('section_panel_judges').update({ judge_id: judgeId }).eq('id', slotId)
    setAssignments(prev => prev.map(a => a.id === slotId ? { ...a, judge_id: judgeId } : a))
  }

  async function handleAddSlot(sectionId: string, panelId: string, role: Role) {
    const existing = assignments.filter(a => a.section_id === sectionId && a.panel_id === panelId && a.role === role)
    if (existing.length >= ROLE_CONFIG[role].max) return
    const { data: newSlot } = await supabase.from('section_panel_judges')
      .insert({ section_id: sectionId, panel_id: panelId, judge_id: null, role, role_number: existing.length + 1 })
      .select().single()
    if (newSlot) setAssignments(prev => [...prev, newSlot as SectionPanelJudge])
  }

  async function handleRemoveSlot(sectionId: string, panelId: string, role: Role) {
    const slots = assignments
      .filter(a => a.section_id === sectionId && a.panel_id === panelId && a.role === role)
      .sort((a, b) => b.role_number - a.role_number)
    if (slots.length <= ROLE_CONFIG[role].min) return
    const toRemove = slots[0]
    await supabase.from('section_panel_judges').delete().eq('id', toRemove.id)
    setAssignments(prev => prev.filter(a => a.id !== toRemove.id))
  }

  async function handleCopyPanel(fromSectionId: string, panelId: string) {
    const sourceSlots = assignments.filter(a => a.section_id === fromSectionId && a.panel_id === panelId)
    const targetSections = sections.filter(s => s.id !== fromSectionId)
    if (targetSections.length === 0) return

    for (const section of targetSections) {
      // delete existing slots for this section+panel
      const targetSlotIds = assignments
        .filter(a => a.section_id === section.id && a.panel_id === panelId)
        .map(a => a.id)
      if (targetSlotIds.length > 0) {
        await supabase.from('section_panel_judges').delete().in('id', targetSlotIds)
      }
      // insert slots mirroring the source
      const toInsert = sourceSlots.map(s => ({
        section_id: section.id,
        panel_id:   panelId,
        judge_id:   s.judge_id,
        role:       s.role,
        role_number: s.role_number,
      }))
      const { data: inserted } = await supabase.from('section_panel_judges').insert(toInsert).select()
      if (inserted) {
        setAssignments(prev => [
          ...prev.filter(a => !(a.section_id === section.id && a.panel_id === panelId)),
          ...(inserted as SectionPanelJudge[]),
        ])
      }
    }
  }

  async function handleTogglePanelLock(sectionId: string, panelId: string) {
    const current = panelLocks.find(l => l.section_id === sectionId && l.panel_id === panelId)
    const nextLocked = !(current?.locked ?? false)
    await (supabase as any).from('section_panel_locks').upsert(
      { section_id: sectionId, panel_id: panelId, locked: nextLocked, updated_at: new Date().toISOString() },
      { onConflict: 'section_id,panel_id' }
    )
    setPanelLocks(prev => {
      const without = prev.filter(l => !(l.section_id === sectionId && l.panel_id === panelId))
      return [...without, { section_id: sectionId, panel_id: panelId, locked: nextLocked }]
    })
  }

  // ── registrations ─────────────────────────────────────────────────────────────
  async function handleToggleDropout(entryId: string) {
    const entry = entries.find(e => e.id === entryId)
    if (!entry) return
    const next = !entry.dropped_out
    await supabase.from('competition_entries').update({ dropped_out: next }).eq('id', entryId)
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, dropped_out: next } : e))
  }

  async function handleRemoveClubEntries(clubId: string) {
    const clubTeamIds = globalTeams.filter(t => t.club_id === clubId).map(t => t.id)
    if (clubTeamIds.length === 0) return
    await supabase.from('competition_entries').delete().eq('competition_id', competition!.id).in('team_id', clubTeamIds)
    setEntries(prev => prev.filter(e => !clubTeamIds.includes(e.team_id)))
  }

  // ── starting order ────────────────────────────────────────────────────────────
  async function handleToggleLock(sessionId: string) {
    const isLocked = lockedSessions.includes(sessionId)
    await supabase.from('sessions').update({ order_locked: !isLocked } as never).eq('id', sessionId)
    setLockedSessions(prev => isLocked ? prev.filter(sid => sid !== sessionId) : [...prev, sessionId])
  }

  async function handleReorder(sessionId: string, teamIds: string[]) {
    const newOrders: SessionOrder[] = teamIds.map((teamId, idx) => ({
      session_id: sessionId, team_id: teamId, position: idx + 1,
    }))
    await supabase.from('session_orders').upsert(newOrders, { onConflict: 'session_id,team_id' })
    setSessionOrders(prev => [
      ...prev.filter(o => o.session_id !== sessionId),
      ...newOrders,
    ])
  }

  async function handleReorderTimeline(sectionId: string, order: Array<TimelineEntry>) {
    await supabase.from('sections').update({ timeline_order: order } as never).eq('id', sectionId)
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, timeline_order: order } : s))
  }

  // ── competition overview ──────────────────────────────────────────────────────
  async function handleUpdateCompetition(updates: {
    name: string
    location: string | null
    start_date: string | null
    end_date: string | null
    provisional_entry_deadline: string | null
    definitive_entry_deadline: string | null
    registration_deadline: string | null
    ts_music_deadline: string | null
    age_groups: string[]
    poster_url: string | null
    logo_url: string | null
    admin: AdminUser | null
    fee_per_team: number | null
    fee_per_gymnast: number | null
    judge_missing_fine: number | null
  }) {
    await supabase.from('competitions').update({
      name: updates.name,
      location: updates.location,
      start_date: updates.start_date,
      end_date: updates.end_date,
      provisional_entry_deadline: updates.provisional_entry_deadline,
      definitive_entry_deadline: updates.definitive_entry_deadline,
      registration_deadline: updates.registration_deadline,
      ts_music_deadline: updates.ts_music_deadline,
      age_groups: updates.age_groups,
      poster_url: updates.poster_url,
      logo_url: updates.logo_url,
      admin_id: updates.admin?.id ?? null,
      fee_per_team: updates.fee_per_team,
      fee_per_gymnast: updates.fee_per_gymnast,
      judge_missing_fine: updates.judge_missing_fine,
    }).eq('id', competition!.id)
    setCompetition(prev => prev ? { ...prev, ...updates } : prev)
  }

  async function handleUpdateFees(fees: { fee_per_team: number | null; fee_per_gymnast: number | null; judge_missing_fine: number | null }) {
    await supabase.from('competitions').update(fees).eq('id', competition!.id)
    setCompetition(prev => prev ? { ...prev, ...fees } : prev)
  }

  async function handleUploadPoster(file: File) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${competition!.id}/poster.${ext}`
    await supabase.storage.from('competition-posters').upload(path, file, { upsert: true })
    const { data } = supabase.storage.from('competition-posters').getPublicUrl(path)
    const url = data.publicUrl + `?t=${Date.now()}`
    await supabase.from('competitions').update({ poster_url: url }).eq('id', competition!.id)
    setCompetition(prev => prev ? { ...prev, poster_url: url } : prev)
  }

  async function handleSetDJReviewDeadline(date: string | null) {
    await supabase.from('competitions').update({ ts_music_deadline: date }).eq('id', competition!.id)
    setCompetition(prev => prev ? { ...prev, ts_music_deadline: date } : prev)
  }

  async function handleUpdateTshirtConfig(sizes: string[], deadline: string | null) {
    await supabase.from('competitions').update({ tshirt_sizes: sizes, tshirt_deadline: deadline }).eq('id', competition!.id)
    setCompetition(prev => prev ? { ...prev, tshirt_sizes: sizes, tshirt_deadline: deadline } : prev)
  }

  async function handleToggleMealsEnabled(enabled: boolean) {
    await supabase.from('competitions').update({ meals_enabled: enabled }).eq('id', competition!.id)
    setCompetition(prev => prev ? { ...prev, meals_enabled: enabled } : prev)
  }

  async function handleToggleMealsLocked(locked: boolean) {
    await supabase.from('competitions').update({ meals_locked: locked }).eq('id', competition!.id)
    setCompetition(prev => prev ? { ...prev, meals_locked: locked } : prev)
  }

  async function handleToggleShowOfficialTrainings(visible: boolean) {
    await supabase.from('competitions').update({ show_official_trainings: visible }).eq('id', competition!.id)
    setCompetition(prev => prev ? { ...prev, show_official_trainings: visible } : prev)
  }

  async function handleUpdateAccreditationConfig(config: import('@/components/admin/types').AccreditationConfig) {
    await supabase.from('competitions').update({ accreditation_config: config as never }).eq('id', competition!.id)
    setCompetition(prev => prev ? { ...prev, accreditation_config: config } : prev)
  }

  // ── competition day ───────────────────────────────────────────────────────────
  async function handleStartSession(sessionId: string) {
    await supabase.from('sessions').update({ status: 'active' }).eq('id', sessionId)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'active' as const } : s))
  }

  async function handleFinishSession(sessionId: string) {
    await supabase.from('sessions').update({ status: 'finished' }).eq('id', sessionId)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'finished' as const } : s))
  }

  async function handleRevertSession(sessionId: string) {
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return
    const prevStatus = session.status === 'finished' ? 'active' : 'waiting'
    await supabase.from('sessions').update({ status: prevStatus }).eq('id', sessionId)
    setSessions(curr => curr.map(s => s.id === sessionId ? { ...s, status: prevStatus as Session['status'] } : s))
  }

  async function handleUploadLogo(file: File) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${competition!.id}/logo.${ext}`
    await supabase.storage.from('competition-posters').upload(path, file, { upsert: true })
    const { data } = supabase.storage.from('competition-posters').getPublicUrl(path)
    const url = data.publicUrl + `?t=${Date.now()}`
    await supabase.from('competitions').update({ logo_url: url }).eq('id', competition!.id)
    setCompetition(prev => prev ? { ...prev, logo_url: url } : prev)
  }

  async function handleAssignSessionMergeGroup(sessionId: string, mergeGroupId: string | null) {
    if (mergeGroupId) {
      const session = sessions.find(s => s.id === sessionId)
      const others  = sessions.filter(s => s.ranking_merge_group_id === mergeGroupId && s.id !== sessionId)
      const conflict = session && others.some(
        o => o.age_group !== session.age_group || o.routine_type !== session.routine_type,
      )
      if (conflict) {
        window.alert('Este grupo ya tiene sesiones con otro grupo de edad o tipo de rutina. Solo sesiones con el mismo grupo de edad y tipo de rutina pueden compartir clasificación.')
        return
      }
    }
    const { error } = await supabase.from('sessions')
      .update({ ranking_merge_group_id: mergeGroupId }).eq('id', sessionId)
    if (error) { setActionError(error.message); return }
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ranking_merge_group_id: mergeGroupId } : s))
  }

  async function handleCreateRankingMergeGroup(labelEs: string, labelEn: string): Promise<string | null> {
    const { data, error } = await supabase.from('ranking_merge_groups')
      .insert({ competition_id: competition?.id ?? '', label_es: labelEs || null, label_en: labelEn || null })
      .select('id,label_es,label_en')
      .single()
    if (error || !data) { setActionError(error?.message ?? 'Error'); return null }
    const row = data as RankingMergeGroup
    setRankingMergeGroups(prev => [...prev, row])
    return row.id
  }

  async function reloadSessionOrders() {
    const ids = [...new Set([
      ...lockedSessions,
      ...sessions.filter(s => s.bracket_phase).map(s => s.id),
    ])]
    if (!ids.length) return
    const { data } = await supabase.from('session_orders').select('session_id,team_id,position').in('session_id', ids)
    if (data) setSessionOrders(data as SessionOrder[])
  }

  return {
    // state
    loading, competition, panels, sections, sessions,
    globalJudges, judgePool, nominations, assignments, panelLocks,
    globalTeams, clubs, entries, sessionOrders, lockedSessions,
    availableAdmins, ageGroupRules, apparatus, apparatusRules, competitionGymnasts, globalCoaches, competitionCoaches,
    provisionalEntries, definitiveEntries, rankingMergeGroups, sessionEligibleTeamCounts, actionError,
    // setters exposed for local overrides (e.g. admin's extended handleToggleLock)
    setLockedSessions: setLockedSessions as Dispatch<SetStateAction<string[]>>,
    setSessionOrders:  setSessionOrders  as Dispatch<SetStateAction<SessionOrder[]>>,
    // handlers
    handleAdvanceStatus, handleRevertStatus, handleSetPanelCount,
    handleAddSection, handleUpdateSectionLabel, handleUpdateSectionTimes, handleDeleteSection,
    handleAddSession, handleDeleteSession, handleReorderStructureSessions,
    handleAddToPool, handleRemoveFromPool, handleAssignJudge,
    handleAddSlot, handleRemoveSlot, handleTogglePanelLock, handleCopyPanel,
    handleToggleDropout, handleRemoveClubEntries,
    handleToggleLock, handleReorder, handleReorderTimeline,
    handleUpdateCompetition, handleUpdateFees, handleUploadPoster, handleUploadLogo, handleSetDJReviewDeadline, handleUpdateTshirtConfig, handleToggleMealsEnabled, handleToggleMealsLocked, handleToggleShowOfficialTrainings, handleUpdateAccreditationConfig,
    handleStartSession, handleFinishSession, handleRevertSession,
    handleAssignSessionMergeGroup, handleCreateRankingMergeGroup,
    reloadSessionOrders,
    clearActionError: () => setActionError(null),
  }
}
