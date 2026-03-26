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
  AgeGroupRule, CompetitionJudgeNomination,
} from '@/components/admin/types'
import { ROLE_CONFIG, defaultSlots, NEXT_STATUS } from '@/components/admin/types'

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const router   = useRouter()
  const supabase = createClient()

  const [lang, setLang]             = useState<Lang>('en')
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
  const [availableAdmins, setAvailableAdmins] = useState<AdminUser[]>([])
  const [ageGroupRules, setAgeGroupRules]     = useState<AgeGroupRule[]>([])

  // ── initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const sectionIds = (await supabase.from('sections').select('id').eq('competition_id', id)).data?.map(s => s.id) ?? []

      const [compRes, panelsRes, sectionsRes, sessionsRes, judgesRes,
             nominationsRes, assignmentsRes, entriesRes, rulesRes, adminsRes] = await Promise.all([
        supabase.from('competitions')
          .select('id,name,status,location,start_date,end_date,registration_deadline,age_groups,poster_url,admin_id,created_at')
          .eq('id', id).single(),
        supabase.from('panels').select('id,competition_id,panel_number').eq('competition_id', id).order('panel_number'),
        supabase.from('sections').select('id,competition_id,section_number,label').eq('competition_id', id).order('section_number'),
        supabase.from('sessions').select('id,competition_id,panel_id,section_id,name,age_group,category,routine_type,status,order_index,order_locked').eq('competition_id', id).order('order_index'),
        supabase.from('judges').select('id,name,email,phone,licence,avatar_url'),
        supabase.from('competition_judge_nominations').select('id,competition_id,judge_id,club_id').eq('competition_id', id),
        sectionIds.length > 0
          ? supabase.from('section_panel_judges').select('id,section_id,panel_id,judge_id,role,role_number').in('section_id', sectionIds)
          : Promise.resolve({ data: [] }),
        supabase.from('competition_entries').select('id,competition_id,team_id,dropped_out').eq('competition_id', id),
        supabase.from('age_group_rules').select('id,age_group,ruleset,min_age,max_age,sort_order').order('sort_order'),
        supabase.from('profiles').select('id,email').eq('role', 'admin'),
      ])

      if (!compRes.data) { setLoading(false); return }

      const entryTeamIds = (entriesRes.data ?? []).map(e => e.team_id)
      const { data: teamsData } = entryTeamIds.length > 0
        ? await supabase.from('teams').select('id,club_id,category,age_group,gymnast_display,photo_url').in('id', entryTeamIds)
        : { data: [] }
      const clubIds = [...new Set((teamsData ?? []).map(t => t.club_id))]
      const { data: clubsData } = clubIds.length > 0
        ? await supabase.from('clubs').select('id,club_name,contact_name,phone,avatar_url').in('id', clubIds)
        : { data: [] }

      const rawSessions = sessionsRes.data ?? []
      const locked = rawSessions.filter(s => s.order_locked).map(s => s.id)
      const { data: ordersData } = locked.length > 0
        ? await supabase.from('session_orders').select('session_id,team_id,position').in('session_id', locked)
        : { data: [] }

      const adminProfiles = adminsRes.data ?? []
      let adminsWithEmail: AdminUser[] = adminProfiles.map(p => ({ ...p, email: '' }))
      if (adminProfiles.length > 0) {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: adminProfiles.map(p => p.id) }),
        })
        if (res.ok) adminsWithEmail = await res.json()
      }

      const adminMap = Object.fromEntries(adminsWithEmail.map(a => [a.id, a]))
      const { admin_id, ...compRest } = compRes.data
      const rawNoms = nominationsRes.data ?? []

      setCompetition({ ...compRest, admin: admin_id ? (adminMap[admin_id] ?? null) : null })
      setPanels(panelsRes.data ?? [])
      setSections(sectionsRes.data ?? [])
      setSessions(rawSessions.map(({ order_locked: _, ...s }) => s) as Session[])
      setGlobalJudges(judgesRes.data ?? [])
      setNominations(rawNoms)
      setJudgePool(rawNoms.map(n => n.judge_id))
      setAssignments(assignmentsRes.data ?? [])
      setGlobalTeams(teamsData ?? [])
      setClubs(clubsData ?? [])
      setEntries(entriesRes.data ?? [])
      setLockedSessions(locked)
      setSessionOrders(ordersData ?? [])
      setAvailableAdmins(adminsWithEmail)
      setAgeGroupRules(rulesRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── status ────────────────────────────────────────────────────────────────────
  async function handleAdvanceStatus() {
    if (!competition) return
    const next = NEXT_STATUS[competition.status]
    if (!next) return
    await supabase.from('competitions').update({ status: next }).eq('id', id)
    setCompetition(prev => prev ? { ...prev, status: next } : prev)
  }

  // ── panel count ───────────────────────────────────────────────────────────────
  async function handleSetPanelCount(count: 1 | 2) {
    // Ensure panel 1 always exists
    let p1 = panels.find(p => p.panel_number === 1)
    if (!p1) {
      const { data } = await supabase.from('panels')
        .insert({ competition_id: id, panel_number: 1 }).select().single()
      if (!data) return
      p1 = data
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
        p2 = data
      }
      setPanels([p1, p2])
    }
  }

  // ── sections ──────────────────────────────────────────────────────────────────
  async function handleAddSection() {
    const nextNum = sections.length > 0 ? Math.max(...sections.map(s => s.section_number)) + 1 : 1
    const { data: newSection } = await supabase.from('sections')
      .insert({ competition_id: id, section_number: nextNum, label: null }).select().single()
    if (!newSection) return
    setSections(prev => [...prev, newSection])
    const slots = panels.flatMap(pan =>
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

  // ── judges ────────────────────────────────────────────────────────────────────
  async function handleAddToPool(judgeId: string) {
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
    await supabase.from('sessions').update({ order_locked: !isLocked } as never).eq('id', sessionId)
    setLockedSessions(prev =>
      isLocked ? prev.filter(sid => sid !== sessionId) : [...prev, sessionId]
    )
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

  // ── competition overview ──────────────────────────────────────────────────────
  async function handleUpdateCompetition(updates: Omit<Competition, 'id' | 'created_at' | 'status'>) {
    await supabase.from('competitions').update({
      name: updates.name, location: updates.location,
      start_date: updates.start_date, end_date: updates.end_date,
      registration_deadline: updates.registration_deadline,
      age_groups: updates.age_groups, poster_url: updates.poster_url,
      admin_id: updates.admin?.id ?? null,
    }).eq('id', id)
    setCompetition(prev => prev ? { ...prev, ...updates } : prev)
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  if (!competition) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-sm text-slate-400">Competition not found.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar />
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['en', 'es'] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={['px-3 py-1 rounded-md text-sm font-medium transition-all',
                lang === l ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <CompetitionDetail
        lang={lang}
        competition={competition}
        panels={panels}
        sections={sections}
        sessions={sessions}
        onBack={() => router.push('/comp-admin')}
        onAdvanceStatus={handleAdvanceStatus}
        onSetPanelCount={handleSetPanelCount}
        onAddSection={handleAddSection}
        onUpdateSectionLabel={handleUpdateSectionLabel}
        onDeleteSection={handleDeleteSection}
        onAddSession={handleAddSession}
        onDeleteSession={handleDeleteSession}
        globalJudges={globalJudges}
        judgePool={judgePool}
        nominations={nominations}
        assignments={assignments}
        onAddToPool={handleAddToPool}
        onRemoveFromPool={handleRemoveFromPool}
        onAssignJudge={handleAssignJudge}
        onAddSlot={handleAddSlot}
        onRemoveSlot={handleRemoveSlot}
        globalTeams={globalTeams}
        clubs={clubs}
        entries={entries}
        onToggleDropout={handleToggleDropout}
        sessionOrders={sessionOrders}
        lockedSessions={lockedSessions}
        onReorder={handleReorder}
        onToggleLock={handleToggleLock}
        availableAdmins={availableAdmins}
        ageGroupRules={ageGroupRules}
        onUpdateCompetition={handleUpdateCompetition}
        onStartSession={handleStartSession}
        onFinishSession={handleFinishSession}
      />
    </div>
  )
}
