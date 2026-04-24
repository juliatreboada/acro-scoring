'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import CompetitionDetail from '@/components/admin/competition-detail/CompetitionDetail'
import AuthBar from '@/components/shared/AuthBar'
import type { Lang } from '@/components/aj-scoring/types'
import type {
  Competition, Panel, Section, Session, Judge, SectionPanelJudge,
  Role, Team, Club, CompetitionEntry, SessionOrder, AdminUser,
  AgeGroupRule, CompetitionJudgeNomination, Gymnast, Coach,
} from '@/components/admin/types'
import { ROLE_CONFIG, defaultSlots, NEXT_STATUS } from '@/components/admin/types'
import type { PanelLock } from '@/components/admin/competition-detail/JudgesTab'

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const supabase = createClient()

  const [lang, setLang]             = useState<Lang>('es')
  const [loading, setLoading]       = useState(true)
  const [competition, setCompetition]         = useState<Competition | null>(null)
  const [panels, setPanels]                   = useState<Panel[]>([])
  const [sections, setSections]               = useState<Section[]>([])
  const [sessions, setSessions]               = useState<Session[]>([])
  const [globalJudges, setGlobalJudges]       = useState<Judge[]>([])
  const [judgePool, setJudgePool]             = useState<string[]>([])
  const [nominations, setNominations]         = useState<CompetitionJudgeNomination[]>([])
  const [assignments, setAssignments]         = useState<SectionPanelJudge[]>([])
  const [globalTeams, setGlobalTeams]         = useState<Team[]>([])
  const [clubs, setClubs]                     = useState<Club[]>([])
  const [entries, setEntries]                 = useState<CompetitionEntry[]>([])
  const [sessionOrders, setSessionOrders]     = useState<SessionOrder[]>([])
  const [lockedSessions, setLockedSessions]   = useState<string[]>([])
  const [panelLocks, setPanelLocks]           = useState<PanelLock[]>([])
  const [availableAdmins, setAvailableAdmins] = useState<AdminUser[]>([])
  const [ageGroupRules, setAgeGroupRules]     = useState<AgeGroupRule[]>([])
  const [competitionGymnasts, setCompetitionGymnasts] = useState<Gymnast[]>([])
  const [globalCoaches,       setGlobalCoaches]       = useState<Coach[]>([])
  const [competitionCoaches,  setCompetitionCoaches]  = useState<Coach[]>([])

  // ── initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
      const [compRes, panelsRes, sectionsRes, sessionsRes, judgesRes,
             nominationsRes, entriesRes, rulesRes, adminsRes] = await Promise.all([
        supabase.from('competitions')
          .select('id,name,status,location,start_date,end_date,registration_deadline,ts_music_deadline,age_groups,poster_url,admin_id,created_at')
          .eq('id', id).single(),
        supabase.from('panels').select('id,competition_id,panel_number').eq('competition_id', id).order('panel_number'),
        supabase.from('sections').select('id,competition_id,section_number,label,starting_time,waiting_time_seconds,warmup_duration_minutes,timeline_order').eq('competition_id', id).order('section_number'),
        supabase.from('sessions').select('id,competition_id,panel_id,section_id,name,age_group,category,routine_type,status,order_index,order_locked,dj_method,ej_method').eq('competition_id', id).order('order_index'),
        supabase.from('judges').select('id,full_name,phone,licence,avatar_url'),
        supabase.from('competition_judge_nominations').select('id,competition_id,judge_id,club_id').eq('competition_id', id),
        supabase.from('competition_entries').select('id,competition_id,team_id,dorsal,dropped_out').eq('competition_id', id),
        supabase.from('age_group_rules').select('id, age_group, ruleset, min_age, max_age, routine_count, sort_order').order('sort_order'),
        supabase.from('profiles').select('id,email').eq('role', 'admin'),
      ])

      if (!compRes.data) { setLoading(false); return }

      // ── wave 2: all queries that depend on wave-1 IDs, run in parallel ────────
      type TeamRow = { id: string; club_id: string; category: string; age_group: string; gymnast_display: string; photo_url: string | null; gymnast_ids: string[] | null }
      const entryTeamIds  = (entriesRes.data ?? []).map(e => e.team_id)
      const rawSessions   = sessionsRes.data ?? []
      const locked        = rawSessions.filter(s => s.order_locked).map(s => s.id)
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
      const teamsData = rawTeamsData.map(t => ({ ...t, gymnast_ids: teamGymnastsMap.get(t.id) ?? [] }))
      const ordersData = ordersResult.data
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

      // ── wave 3: clubs + gymnasts depend on teams (wave 2) ─────────────────────
      const clubIds       = [...new Set(teamsData.map(t => t.club_id))]
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

      // load the coach rows for those ids
      const coachesResult = registeredCoachIds.length > 0
        ? await (supabase as any).from('coaches').select('id,club_id,full_name,licence,photo_url,licencia_url').in('id', registeredCoachIds)
        : { data: [] }
      const coachesData = (coachesResult as any).data as Coach[] ?? []

      const adminMap  = Object.fromEntries(adminsWithEmail.map(a => [a.id, a]))
      const { admin_id, ...compRest } = compRes.data
      const rawNoms = nominationsRes.data ?? []

      setCompetition({ ...compRest, admin: admin_id ? (adminMap[admin_id] ?? null) : null })
      setPanels((panelsRes.data ?? []) as unknown as Panel[])
      setSections((sectionsRes.data ?? []) as unknown as Section[])
      setSessions(rawSessions.map(({ order_locked: _, ...s }) => s) as Session[])
      setGlobalJudges(rawJudges.map(j => ({ ...j, email: judgeEmailMap[j.id] ?? null })))
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
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── status ───────────────────────────────────────────────────────────────────
  async function handleAdvanceStatus() {
    if (!competition) return
    const next = NEXT_STATUS[competition.status]
    if (!next) return
    await supabase.from('competitions').update({ status: next }).eq('id', id)
    setCompetition(prev => prev ? { ...prev, status: next } : prev)
  }

  // ── panel count ──────────────────────────────────────────────────────────────
  async function handleSetPanelCount(count: 1 | 2) {
    // Ensure panel 1 always exists
    let p1 = panels.find(p => p.panel_number === 1)
    if (!p1) {
      const { data } = await supabase.from('panels')
        .insert({ competition_id: id, panel_number: 1 }).select().single()
      if (!data) return
      p1 = data as unknown as Panel
    }

    if (count === 1) {
      const p2 = panels.find(p => p.panel_number === 2)
      if (p2) {
        await supabase.from('panels').delete().eq('id', p2.id)
        await supabase.from('sessions').update({ panel_id: p1.id }).eq('competition_id', id).eq('panel_id', p2.id)
        setSessions(prev => prev.map(s => s.panel_id === p2.id ? { ...s, panel_id: p1!.id } : s))
      }
      setPanels([p1])
    } else {
      let p2 = panels.find(p => p.panel_number === 2)
      if (!p2) {
        const { data } = await supabase.from('panels')
          .insert({ competition_id: id, panel_number: 2 }).select().single()
        if (!data) return
        p2 = data as unknown as Panel
        // seed default spj slots for Panel 2 × every existing section
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

  // ── sections ─────────────────────────────────────────────────────────────────
  async function handleAddSection() {
    // Ensure Panel 1 exists (may not exist if Overview was never visited)
    let activePanels = panels
    if (activePanels.length === 0) {
      const { data } = await supabase.from('panels')
        .insert({ competition_id: id, panel_number: 1 }).select().single()
      if (!data) return
      const p1 = data as unknown as Panel
      setPanels([p1])
      activePanels = [p1]
    }

    const nextNum = sections.length > 0 ? Math.max(...sections.map(s => s.section_number)) + 1 : 1
    const { data: newSection } = await supabase.from('sections')
      .insert({ competition_id: id, section_number: nextNum, label: null }).select().single()
    if (!newSection) return
    setSections(prev => [...prev, newSection as unknown as Section])
    // insert default spj slots for new section × all panels
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

  // ── sessions ─────────────────────────────────────────────────────────────────
  async function handleAddSession(s: Omit<Session, 'id'>) {
    const { data: newSession } = await supabase.from('sessions').insert(s).select().single()
    if (newSession) setSessions(prev => [...prev, newSession as Session])
  }

  async function handleDeleteSession(sessionId: string) {
    await supabase.from('sessions').delete().eq('id', sessionId)
    setSessions(prev => prev.filter(s => s.id !== sessionId))
  }

  // ── judges ───────────────────────────────────────────────────────────────────
  async function handleAddToPool(judgeId: string) {
    // Note: requires club_id to be nullable in DB (run: ALTER TABLE competition_judge_nominations ALTER COLUMN club_id DROP NOT NULL)
    const { data: nom } = await supabase.from('competition_judge_nominations')
      .insert({ competition_id: id, judge_id: judgeId, club_id: null } as never)
      .select().single()
    if (nom) setNominations(prev => [...prev, nom as CompetitionJudgeNomination])
    setJudgePool(prev => [...prev, judgeId])
  }

  async function handleRemoveFromPool(judgeId: string) {
    await supabase.from('competition_judge_nominations')
      .delete().eq('competition_id', id).eq('judge_id', judgeId)
    setNominations(prev => prev.filter(n => n.judge_id !== judgeId))
    setJudgePool(prev => prev.filter(jid => jid !== judgeId))
    setAssignments(prev => prev.map(a => a.judge_id === judgeId ? { ...a, judge_id: null } : a))
  }

  async function handleCreateJudge(data: Omit<Judge, 'id' | 'avatar_url'>) {
    const { full_name, email, phone, licence } = data
    if (!email) return
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const body: Record<string, string> = { role: 'judge', email, full_name }
    if (phone)   body.phone   = phone
    if (licence) body.licence = licence
    const res = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error ?? 'Failed to send invite')
    }
    // Judge will appear in the pool once they accept the invite and their profile is created
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

  // ── starting order ────────────────────────────────────────────────────────────
  async function handleToggleLock(sessionId: string) {
    const isLocked = lockedSessions.includes(sessionId)

    // When locking: auto-create session_orders if none exist yet
    if (!isLocked) {
      const existingOrders = sessionOrders.filter(o => o.session_id === sessionId)
      if (existingOrders.length === 0) {
        const session = sessions.find(s => s.id === sessionId)
        if (session) {
          const sessionTeamIds = entries
            .filter(e => !e.dropped_out)
            .map(e => e.team_id)
            .filter(tid => {
              const team = globalTeams.find(t => t.id === tid)
              return team?.age_group === session.age_group && team?.category === session.category
            })

          if (sessionTeamIds.length > 0) {
            const newOrders: SessionOrder[] = sessionTeamIds.map((teamId, idx) => ({
              session_id: sessionId, team_id: teamId, position: idx + 1,
            }))
            await supabase.from('session_orders')
              .upsert(newOrders, { onConflict: 'session_id,team_id' })
            setSessionOrders(prev => [
              ...prev.filter(o => o.session_id !== sessionId),
              ...newOrders,
            ])
          }
        }
      }
    }

    await supabase.from('sessions').update({ order_locked: !isLocked } as never).eq('id', sessionId)
    setLockedSessions(prev =>
      isLocked ? prev.filter(sid => sid !== sessionId) : [...prev, sessionId]
    )
  }

  async function handleReorder(sessionId: string, teamIds: string[]) {
    const newOrders: SessionOrder[] = teamIds.map((teamId, idx) => ({
      session_id: sessionId, team_id: teamId, position: idx + 1,
    }))
    await supabase.from('session_orders')
      .upsert(newOrders, { onConflict: 'session_id,team_id' })
    setSessionOrders(prev => [
      ...prev.filter(o => o.session_id !== sessionId),
      ...newOrders,
    ])
  }

  async function handleReorderTimeline(sectionId: string, order: Array<{ session_id: string; team_id: string }>) {
    await supabase.from('sections').update({ timeline_order: order } as never).eq('id', sectionId)
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, timeline_order: order } : s))
  }

  // ── competition overview ──────────────────────────────────────────────────────
  async function handleUpdateCompetition(updates: Omit<Competition, 'id' | 'created_at' | 'status'>) {
    await supabase.from('competitions').update({
      name:                  updates.name,
      location:              updates.location,
      start_date:            updates.start_date,
      end_date:              updates.end_date,
      registration_deadline: updates.registration_deadline,
      ts_music_deadline:     updates.ts_music_deadline,
      age_groups:            updates.age_groups,
      poster_url:            updates.poster_url,
      admin_id:              updates.admin?.id ?? null,
    }).eq('id', id)
    setCompetition(prev => prev ? { ...prev, ...updates } : prev)
  }

  // ── poster upload ─────────────────────────────────────────────────────────────
  async function handleUploadPoster(file: File) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${id}/poster.${ext}`
    await supabase.storage.from('competition-posters').upload(path, file, { upsert: true })
    const { data } = supabase.storage.from('competition-posters').getPublicUrl(path)
    const url = data.publicUrl + `?t=${Date.now()}`
    await supabase.from('competitions').update({ poster_url: url }).eq('id', id)
    setCompetition(prev => prev ? { ...prev, poster_url: url } : prev)
  }

  // ── dj review deadline ────────────────────────────────────────────────────────
  async function handleSetDJReviewDeadline(date: string | null) {
    await supabase.from('competitions').update({ ts_music_deadline: date }).eq('id', id)
    setCompetition(prev => prev ? { ...prev, ts_music_deadline: date } : prev)
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

  // ── render ────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar lang={lang} onLangChange={(l) => setLang(l as Lang)} />
      {/* toolbar skeleton */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10">
        <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-px bg-slate-200" />
        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
      </div>
      {/* tab bar skeleton */}
      <div className="bg-white border-b border-slate-200 px-4">
        <div className="max-w-5xl mx-auto flex gap-1 py-1">
          {[80, 64, 72, 88, 56, 76, 60].map((w, i) => (
            <div key={i} className={`h-8 bg-slate-100 rounded-lg animate-pulse`} style={{ width: w }} />
          ))}
        </div>
      </div>
      {/* content skeleton */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                <div className="h-9 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
          <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-36 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (!competition) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-sm text-slate-400">Competition not found.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar lang={lang} onLangChange={(l) => setLang(l as Lang)} />

      <CompetitionDetail
        lang={lang}
        competition={competition}
        panels={panels}
        sections={sections}
        sessions={sessions}
        onBack={() => router.push('/admin')}
        onAdvanceStatus={handleAdvanceStatus}
        onSetPanelCount={handleSetPanelCount}
        onAddSection={handleAddSection}
        onUpdateSectionLabel={handleUpdateSectionLabel}
        onUpdateSectionTimes={handleUpdateSectionTimes}
        onDeleteSection={handleDeleteSection}
        onAddSession={handleAddSession}
        onDeleteSession={handleDeleteSession}
        globalJudges={globalJudges}
        judgePool={judgePool}
        nominations={nominations}
        assignments={assignments}
        panelLocks={panelLocks}
        onAddToPool={handleAddToPool}
        onRemoveFromPool={handleRemoveFromPool}
        onAssignJudge={handleAssignJudge}
        onAddSlot={handleAddSlot}
        onRemoveSlot={handleRemoveSlot}
        onTogglePanelLock={handleTogglePanelLock}
        onCreateJudge={handleCreateJudge}
        globalTeams={globalTeams}
        clubs={clubs}
        entries={entries}
        onToggleDropout={handleToggleDropout}
        sessionOrders={sessionOrders}
        lockedSessions={lockedSessions}
        onReorder={handleReorder}
        onToggleLock={handleToggleLock}
        onReorderTimeline={handleReorderTimeline}
        availableAdmins={availableAdmins}
        ageGroupRules={ageGroupRules}
        onUpdateCompetition={handleUpdateCompetition}
        onUploadPoster={handleUploadPoster}
        onSetDJReviewDeadline={handleSetDJReviewDeadline}
        onStartSession={handleStartSession}
        onFinishSession={handleFinishSession}
        competitionGymnasts={competitionGymnasts}
        globalCoaches={globalCoaches}
        competitionCoaches={competitionCoaches}
      />
    </div>
  )
}
