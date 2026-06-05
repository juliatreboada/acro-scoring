'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useProfile } from '@/contexts/ProfileContext'
import { slugify } from '@/lib/normalizeString'
import { uploadFile } from '@/lib/uploadFile'
import type { Club, Gymnast, Coach, CompetitionCoach, Team, Competition, CompetitionEntry, RoutineMusic, Judge, CompetitionJudgeNomination, AgeGroupRule, Apparatus, ApparatusRule, RGRegistration } from '@/components/admin/types'
import { ageGroupLabel } from '@/components/admin/types'

type TsReviewStatus = { team_id: string; competition_id: string; routine_type: string; status: string; final_comment: string | null }

export function useClubData() {
  const supabase = createClient()
  const { activeProfile } = useProfile()
  const clubId = activeProfile?.club_id ?? ''

  const [loading, setLoading]                   = useState(true)
  const [club, setClub]                         = useState<Club | null>(null)
  const [gymnasts, setGymnasts]                 = useState<Gymnast[]>([])
  const [coaches, setCoaches]                   = useState<Coach[]>([])
  const [competitionCoaches, setCompetitionCoaches] = useState<CompetitionCoach[]>([])
  const [teams, setTeams]                       = useState<Team[]>([])
  const [competitions, setCompetitions]         = useState<Competition[]>([])
  const [entries, setEntries]                   = useState<CompetitionEntry[]>([])
  const [music, setMusicState]                  = useState<RoutineMusic[]>([])
  const [judges, setJudges]                     = useState<Judge[]>([])
  const [nominations, setNominations]           = useState<CompetitionJudgeNomination[]>([])
  const [agLabels, setAgLabels]                 = useState<Record<string, string>>({})
  const [ageGroupRules, setAgeGroupRules]       = useState<AgeGroupRule[]>([])
  const [tsReviewStatuses, setTsReviewStatuses] = useState<TsReviewStatus[]>([])
  const [apparatus, setApparatus]               = useState<Apparatus[]>([])
  const [apparatusRules, setApparatusRules]     = useState<ApparatusRule[]>([])
  const [rgRegistrations, setRgRegistrations]   = useState<RGRegistration[]>([])
  const [actionError, setActionError]           = useState<string | null>(null)

  // ── initial load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (!activeProfile) return
      try {
        const cid = activeProfile.club_id
        if (!cid) { setLoading(false); return }

        const [clubRes, gymnastsRes, coachesRes, teamsRes, compsRes, nomsRes, rulesRes, appRes, appRulesRes] = await Promise.all([
          supabase.from('clubs').select('id,club_name,contact_name,phone,avatar_url').eq('id', cid).single(),
          (supabase as any).from('gymnasts').select('id,club_id,first_name,last_name_1,last_name_2,date_of_birth,photo_url,licencia_url').eq('club_id', cid),
          (supabase as any).from('coaches').select('id,club_id,full_name,licence,photo_url,licencia_url').eq('club_id', cid),
          supabase.from('teams').select('id,club_id,category,age_group,gymnast_display,photo_url,sport_type').eq('club_id', cid),
          supabase.from('competitions')
            .select('id,name,status,sport_type,location,start_date,end_date,provisional_entry_deadline,definitive_entry_deadline,registration_deadline,ts_music_deadline,tshirt_sizes,tshirt_deadline,meals_enabled,age_groups,poster_url,created_at,fee_per_team,fee_per_gymnast,judge_missing_fine')
            .neq('status', 'draft')
            .order('start_date', { ascending: false }),
          supabase.from('competition_judge_nominations').select('id,competition_id,judge_id,club_id').eq('club_id', cid),
          supabase.from('age_group_rules').select('id,age_group,level,ruleset,min_age,max_age,routine_count,sport_type').order('sort_order'),
          supabase.from('apparatus').select('id,name,name_es,sort_order').order('sort_order'),
          supabase.from('apparatus_rules').select('id,age_group_rule_id,apparatus_id,is_mandatory,sort_order').order('sort_order'),
        ])

        const rawTeams = teamsRes.data ?? []
        const teamIds  = rawTeams.map(t => t.id)

        const [tgRes, taRes, entriesRes, musicRes, judgesRes, reviewRes, compCoachesRes, rgRegsRes] = await Promise.all([
          teamIds.length > 0
            ? supabase.from('team_gymnasts').select('team_id,gymnast_id').in('team_id', teamIds)
            : Promise.resolve({ data: [] as { team_id: string; gymnast_id: string }[] }),
          teamIds.length > 0
            ? supabase.from('team_apparatus').select('team_id,apparatus_id').in('team_id', teamIds)
            : Promise.resolve({ data: [] as { team_id: string; apparatus_id: string }[] }),
          teamIds.length > 0
            ? supabase.from('competition_entries').select('id,competition_id,team_id,dorsal,dropped_out,gymnast_display,gymnast_ids').in('team_id', teamIds)
            : Promise.resolve({ data: [] }),
          teamIds.length > 0
            ? supabase.from('routine_music').select('id,team_id,competition_id,routine_type,music_path,ts_path,uploaded_at').in('team_id', teamIds)
            : Promise.resolve({ data: [] }),
          supabase.from('judges').select('id,full_name,phone,licence,avatar_url,sport_type'),
          teamIds.length > 0
            ? supabase.from('ts_review_status').select('team_id,competition_id,routine_type,status,final_comment').in('team_id', teamIds)
            : Promise.resolve({ data: [] }),
          (supabase as any).from('competition_coaches').select('id,competition_id,coach_id')
            .in('coach_id', (coachesRes.data ?? []).map((c: { id: string }) => c.id)),
          teamIds.length > 0
            ? supabase.from('rg_registrations').select('id,team_id,competition_id,status,payment_document_url,notes,approved_by,approved_at,payment_approved_by,payment_approved_at,created_at').in('team_id', teamIds)
            : Promise.resolve({ data: [] as RGRegistration[] }),
        ])

        const tgMap: Record<string, string[]> = {}
        for (const tg of tgRes.data ?? []) {
          if (!tgMap[tg.team_id]) tgMap[tg.team_id] = []
          tgMap[tg.team_id].push(tg.gymnast_id)
        }
        const taMap: Record<string, string[]> = {}
        for (const ta of taRes.data ?? []) {
          if (!taMap[ta.team_id]) taMap[ta.team_id] = []
          taMap[ta.team_id].push(ta.apparatus_id)
        }
        const teamsWithIds: Team[] = rawTeams.map(t => ({
          ...t,
          gymnast_ids: tgMap[t.id] ?? [],
          apparatus_ids: taMap[t.id] ?? [],
        }))

        const mappedMusic: RoutineMusic[] = (musicRes.data ?? []).map(({ music_path, ts_path, ...m }) => ({
          ...m, music_filename: music_path, ts_filename: ts_path,
        }))

        const agLabelsMap = Object.fromEntries(
          ((rulesRes.data ?? []) as unknown as AgeGroupRule[])
            .map(r => [r.id, ageGroupLabel(r, true)])
        )

        const rawJudges = judgesRes.data ?? []
        const fetchedJudgeIds = rawJudges.map((j: { id: string }) => j.id)
        const { data: judgeProfiles } = fetchedJudgeIds.length > 0
          ? await supabase.from('profiles').select('id,email').in('id', fetchedJudgeIds)
          : { data: [] }
        const judgeEmailMap = Object.fromEntries((judgeProfiles ?? []).map(p => [p.id, p.email ?? null]))

        setClub(clubRes.data)
        setGymnasts((gymnastsRes.data ?? []) as unknown as Gymnast[])
        setCoaches((coachesRes.data ?? []) as unknown as Coach[])
        setCompetitionCoaches((compCoachesRes.data ?? []) as unknown as CompetitionCoach[])
        setTeams(teamsWithIds)
        setCompetitions((compsRes.data ?? []).map(c => ({ ...c, admin: null })) as Competition[])
        setEntries(entriesRes.data ?? [])
        setMusicState(mappedMusic)
        setJudges(rawJudges.map((j: { id: string; full_name: string; phone: string | null; licence: string | null; avatar_url: string | null; sport_type: string }) => ({ ...j, email: judgeEmailMap[j.id] ?? null })))
        setNominations(nomsRes.data ?? [])
        setAgLabels(agLabelsMap)
        setAgeGroupRules((rulesRes.data ?? []) as unknown as AgeGroupRule[])
        setTsReviewStatuses((reviewRes.data ?? []) as TsReviewStatus[])
        setApparatus((appRes.data ?? []) as Apparatus[])
        setApparatusRules((appRulesRes.data ?? []) as ApparatusRule[])
        setRgRegistrations((rgRegsRes.data ?? []) as RGRegistration[])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeProfile?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function tryUpload(bucket: string, path: string, file: File): Promise<string | null> {
    try { return await uploadFile(bucket, path, file) }
    catch (err: unknown) { setActionError(err instanceof Error ? err.message : String(err)); return null }
  }

  // ── gymnasts ──────────────────────────────────────────────────────────────────
  async function handleAddGymnast(g: Omit<Gymnast, 'id' | 'club_id'>) {
    const { data, error } = await supabase.from('gymnasts').insert({ ...g, club_id: clubId }).select().single()
    if (error) { setActionError(error.message); return }
    if (data) setGymnasts(prev => [...prev, data as unknown as Gymnast])
  }

  async function handleAddGymnastsBulk(list: Array<Omit<Gymnast, 'id' | 'club_id'>>) {
    if (!list.length) return
    const { data, error } = await supabase.from('gymnasts').insert(list.map(g => ({ ...g, club_id: clubId }))).select()
    if (error) { setActionError(error.message); return }
    if (data) setGymnasts(prev => [...prev, ...(data as unknown as Gymnast[])])
  }

  async function handleUpdateGymnast(id: string, g: Omit<Gymnast, 'id' | 'club_id'>) {
    const { error } = await supabase.from('gymnasts').update(g).eq('id', id)
    if (error) { setActionError(error.message); return }
    setGymnasts(prev => prev.map(x => x.id === id ? { ...x, ...g } : x))
  }

  async function handleDeleteGymnast(id: string) {
    const { error } = await supabase.from('gymnasts').delete().eq('id', id)
    if (error) { setActionError(error.message); return }
    setGymnasts(prev => prev.filter(x => x.id !== id))
    setTeams(prev => prev.map(t => ({ ...t, gymnast_ids: (t.gymnast_ids ?? []).filter(gid => gid !== id) })))
  }

  async function handleUploadGymnastPhoto(id: string, file: File) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const gymnast = gymnasts.find(g => g.id === id)
    const nameParts = [gymnast?.first_name, gymnast?.last_name_1, gymnast?.last_name_2].filter(Boolean).map(s => slugify(s!))
    const path = `${gymnast?.club_id ?? id}/${nameParts.join('_')}_photo.${ext}`
    const url = await tryUpload('gymnasts-photos', path, file)
    if (!url) return
    await supabase.from('gymnasts').update({ photo_url: url } as Record<string, string>).eq('id', id)
    setGymnasts(prev => prev.map(g => g.id === id ? { ...g, photo_url: url } : g))
  }

  async function handleUploadLicencia(id: string, file: File) {
    const gymnast = gymnasts.find(g => g.id === id)
    if (!gymnast) return
    const ext = file.name.split('.').pop() ?? 'pdf'
    const nameParts = [gymnast.first_name, gymnast.last_name_1, gymnast.last_name_2].filter(Boolean).map(s => slugify(s!))
    const path = `${gymnast.club_id}/${nameParts.join('_')}.${ext}`
    const url = await tryUpload('gymnast-licencias', path, file)
    if (!url) return
    await supabase.from('gymnasts').update({ licencia_url: url } as Record<string, string>).eq('id', id)
    setGymnasts(prev => prev.map(g => g.id === id ? { ...g, licencia_url: url } : g))
  }

  async function handleRemoveLicencia(id: string) {
    await supabase.from('gymnasts').update({ licencia_url: null } as Record<string, null>).eq('id', id)
    setGymnasts(prev => prev.map(g => g.id === id ? { ...g, licencia_url: null } : g))
  }

  // ── coaches ───────────────────────────────────────────────────────────────────
  async function handleAddCoach(c: Omit<Coach, 'id' | 'club_id'>) {
    const { data, error } = await (supabase as any).from('coaches').insert({ ...c, club_id: clubId }).select().single()
    if (error) { setActionError(error.message); return }
    if (data) setCoaches(prev => [...prev, data as Coach])
  }

  async function handleUpdateCoach(id: string, c: Omit<Coach, 'id' | 'club_id'>) {
    const { error } = await (supabase as any).from('coaches').update(c).eq('id', id)
    if (error) { setActionError(error.message); return }
    setCoaches(prev => prev.map(x => x.id === id ? { ...x, ...c } : x))
  }

  async function handleDeleteCoach(id: string) {
    const { error } = await (supabase as any).from('coaches').delete().eq('id', id)
    if (error) { setActionError(error.message); return }
    setCoaches(prev => prev.filter(x => x.id !== id))
    setCompetitionCoaches(prev => prev.filter(cc => cc.coach_id !== id))
  }

  async function handleUploadCoachPhoto(id: string, file: File) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const coach = coaches.find(c => c.id === id)
    const path = `${coach?.club_id ?? id}/${slugify(coach?.full_name ?? id)}_photo.${ext}`
    const url = await tryUpload('coaches-photos', path, file)
    if (!url) return
    await (supabase as any).from('coaches').update({ photo_url: url }).eq('id', id)
    setCoaches(prev => prev.map(c => c.id === id ? { ...c, photo_url: url } : c))
  }

  async function handleUploadCoachLicencia(id: string, file: File) {
    const ext = file.name.split('.').pop() ?? 'pdf'
    const coach = coaches.find(c => c.id === id)
    const path = `${coach?.club_id ?? id}/${slugify(coach?.full_name ?? id)}.${ext}`
    const url = await tryUpload('coach-licencias', path, file)
    if (!url) return
    await (supabase as any).from('coaches').update({ licencia_url: url }).eq('id', id)
    setCoaches(prev => prev.map(c => c.id === id ? { ...c, licencia_url: url } : c))
  }

  async function handleRegisterCoach(competitionId: string, coachId: string) {
    if (competitionCoaches.some(cc => cc.competition_id === competitionId && cc.coach_id === coachId)) return
    const { data, error } = await (supabase as any).from('competition_coaches')
      .insert({ competition_id: competitionId, coach_id: coachId }).select().single()
    if (error) { setActionError(error.message); return }
    if (data) setCompetitionCoaches(prev => [...prev, data as CompetitionCoach])
  }

  async function handleUnregisterCoach(competitionId: string, coachId: string) {
    const cc = competitionCoaches.find(x => x.competition_id === competitionId && x.coach_id === coachId)
    if (!cc) return
    const { error } = await (supabase as any).from('competition_coaches').delete().eq('id', cc.id)
    if (error) { setActionError(error.message); return }
    setCompetitionCoaches(prev => prev.filter(x => x.id !== cc.id))
  }

  // ── teams ─────────────────────────────────────────────────────────────────────
  async function handleAddTeam(t: Omit<Team, 'id' | 'club_id' | 'photo_url'>) {
    const { gymnast_ids, apparatus_ids, ...rest } = t
    const { data: newTeam, error } = await supabase.from('teams').insert({ ...rest, club_id: clubId, photo_url: null }).select().single()
    if (error) { setActionError(error.message); return }
    if (!newTeam) return
    if (gymnast_ids?.length) {
      await supabase.from('team_gymnasts').insert(gymnast_ids.map(gid => ({ team_id: newTeam.id, gymnast_id: gid })))
    }
    if (apparatus_ids?.length) {
      await supabase.from('team_apparatus').insert(apparatus_ids.map(aid => ({ team_id: newTeam.id, apparatus_id: aid })))
    }
    setTeams(prev => [...prev, { ...newTeam, gymnast_ids: gymnast_ids ?? [], apparatus_ids: apparatus_ids ?? [] }])
  }

  async function handleUpdateTeam(id: string, t: Omit<Team, 'id' | 'club_id' | 'photo_url'>) {
    const { gymnast_ids, apparatus_ids, ...rest } = t
    const { error } = await supabase.from('teams').update(rest).eq('id', id)
    if (error) { setActionError(error.message); return }
    if (gymnast_ids !== undefined) {
      await supabase.from('team_gymnasts').delete().eq('team_id', id)
      if (gymnast_ids.length > 0) {
        await supabase.from('team_gymnasts').insert(gymnast_ids.map(gid => ({ team_id: id, gymnast_id: gid })))
      }
    }
    if (apparatus_ids !== undefined) {
      await supabase.from('team_apparatus').delete().eq('team_id', id)
      if (apparatus_ids.length > 0) {
        await supabase.from('team_apparatus').insert(apparatus_ids.map(aid => ({ team_id: id, apparatus_id: aid })))
      }
    }
    setTeams(prev => prev.map(x => x.id === id ? { ...x, ...t } : x))
  }

  async function handleDeleteTeam(id: string) {
    const now = new Date().toISOString()
    const { error } = await supabase.from('teams').update({ archived_at: now }).eq('id', id)
    if (error) { setActionError(error.message); return }
    setTeams(prev => prev.map(x => x.id === id ? { ...x, archived_at: now } : x))
  }

  async function handleRestoreTeam(id: string) {
    const { error } = await supabase.from('teams').update({ archived_at: null }).eq('id', id)
    if (error) { setActionError(error.message); return }
    setTeams(prev => prev.map(x => x.id === id ? { ...x, archived_at: null } : x))
  }

  async function handleUploadTeamPhoto(id: string, file: File) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const team = teams.find(t => t.id === id)
    const path = `${clubId}/${slugify(team?.gymnast_display ?? id)}_photo.${ext}`
    const url = await tryUpload('team-photos', path, file)
    if (!url) return
    await supabase.from('teams').update({ photo_url: url }).eq('id', id)
    setTeams(prev => prev.map(t => t.id === id ? { ...t, photo_url: url } : t))
  }

  // ── RG registrations ─────────────────────────────────────────────────────────
  async function handleRGRegister(teamId: string, competitionId: string) {
    if (rgRegistrations.some(r => r.team_id === teamId && r.competition_id === competitionId)) return
    const { data, error } = await supabase.from('rg_registrations')
      .insert({ team_id: teamId, competition_id: competitionId, status: 'pending' }).select().single()
    if (error) { setActionError(error.message); return }
    if (data) setRgRegistrations(prev => [...prev, data as RGRegistration])
  }

  async function handleRGUploadPaymentDoc(regId: string, file: File) {
    const ext  = file.name.split('.').pop() ?? 'pdf'
    const path = `${clubId}/${regId}.${ext}`
    const url  = await tryUpload('payment-docs', path, file)
    if (!url) return
    await supabase.from('rg_registrations').update({ payment_document_url: url, status: 'payment_pending' }).eq('id', regId)
    setRgRegistrations(prev => prev.map(r => r.id === regId ? { ...r, payment_document_url: url, status: 'payment_pending' } : r))
  }

  async function handleSetRGMusic(teamId: string, competitionId: string, routineType: RoutineMusic['routine_type'], file: File | null) {
    let storagePath: string | null = null
    if (file) {
      const ext      = file.name.split('.').pop() ?? 'mp3'
      const team     = teams.find(t => t.id === teamId)
      const toSlug   = (s: string) => slugify(s).replace(/_/g, '-')
      const teamSlug = toSlug(team?.gymnast_display ?? teamId.slice(-6))
      const clubSlug = toSlug(club?.club_name ?? 'club')
      const path     = `${competitionId}/rg-${clubSlug}-${teamSlug}-${routineType}.${ext}`
      const url      = await tryUpload('musics', path, file)
      if (!url) return
      storagePath = url
    }

    const existing = music.find(m => m.team_id === teamId && m.competition_id === competitionId && m.routine_type === routineType)
    if (existing) {
      await supabase.from('routine_music').update({ music_path: storagePath }).eq('id', existing.id)
      setMusicState(prev => prev.map(m => m.id === existing.id ? { ...m, music_filename: storagePath } : m))
    } else {
      const { data } = await supabase.from('routine_music').insert({
        team_id: teamId, competition_id: competitionId, routine_type: routineType,
        music_path: storagePath, ts_path: null,
      }).select().single()
      if (data) {
        const { music_path, ts_path, ...rest } = data as typeof data & { music_path: string | null; ts_path: string | null }
        setMusicState(prev => [...prev, { ...rest, music_filename: music_path, ts_filename: ts_path }])
      }
    }
  }

  // ── Acro registrations ────────────────────────────────────────────────────────
  async function handleRegister(competitionId: string, teamId: string) {
    if (entries.some(e => e.competition_id === competitionId && e.team_id === teamId)) return
    const tempId = `temp-${Date.now()}`
    const tempEntry: CompetitionEntry = { id: tempId, competition_id: competitionId, team_id: teamId, dropped_out: false, dorsal: null, gymnast_display: null, gymnast_ids: null }
    setEntries(prev => [...prev, tempEntry])
    const { data, error } = await supabase.from('competition_entries')
      .insert({ competition_id: competitionId, team_id: teamId, dropped_out: false }).select().single()
    if (error) {
      setEntries(prev => prev.filter(e => e.id !== tempId))
      setActionError(error.message)
      return
    }
    if (data) setEntries(prev => prev.map(e => e.id === tempId ? data as CompetitionEntry : e))
  }

  async function handleDropout(entryId: string) {
    const entry = entries.find(e => e.id === entryId)
    if (!entry) return
    const newValue = !entry.dropped_out
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, dropped_out: newValue } : e))
    const { error } = await supabase.from('competition_entries').update({ dropped_out: newValue }).eq('id', entryId)
    if (error) {
      setEntries(prev => prev.map(e => e.id === entryId ? { ...e, dropped_out: entry.dropped_out } : e))
      setActionError(error.message)
    }
  }

  // ── judges ────────────────────────────────────────────────────────────────────
  async function handleInviteJudge(j: { full_name: string; email: string; phone?: string; licence?: string; sport_type: string }) {
    const res = await fetch('/api/club/invite-judge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(j),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? 'Failed to send invitation')
    }
  }

  async function handleUpdateJudge(id: string, j: Omit<Judge, 'id' | 'avatar_url'>) {
    const { full_name, phone, licence } = j
    const { error } = await supabase.from('judges').update({ full_name, phone, licence }).eq('id', id)
    if (error) { setActionError(error.message); return }
    setJudges(prev => prev.map(x => x.id === id ? { ...x, ...j } : x))
  }

  async function handleDeleteJudge(id: string) {
    const { error } = await supabase.from('judges').delete().eq('id', id)
    if (error) { setActionError(error.message); return }
    setJudges(prev => prev.filter(x => x.id !== id))
    setNominations(prev => prev.filter(n => n.judge_id !== id))
  }

  async function handleUploadJudgePhoto(id: string, file: File) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const judge = judges.find(j => j.id === id)
    const path = `${clubId}/${slugify(judge?.full_name ?? id)}_photo.${ext}`
    const url = await tryUpload('judge-photos', path, file)
    if (!url) return
    await supabase.from('judges').update({ avatar_url: url }).eq('id', id)
    setJudges(prev => prev.map(j => j.id === id ? { ...j, avatar_url: url } : j))
  }

  // ── nominations ───────────────────────────────────────────────────────────────
  async function handleNominate(competitionId: string, judgeId: string) {
    if (nominations.some(n => n.competition_id === competitionId && n.judge_id === judgeId)) return
    const { data, error } = await supabase.from('competition_judge_nominations')
      .insert({ competition_id: competitionId, judge_id: judgeId, club_id: clubId }).select().single()
    if (error) { setActionError(error.message); return }
    if (data) setNominations(prev => [...prev, data as CompetitionJudgeNomination])
  }

  async function handleRemoveNomination(nominationId: string) {
    const { error } = await supabase.from('competition_judge_nominations').delete().eq('id', nominationId)
    if (error) { setActionError(error.message); return }
    setNominations(prev => prev.filter(n => n.id !== nominationId))
  }

  // ── club profile ──────────────────────────────────────────────────────────────
  async function handleUpdateClub(data: Partial<Pick<Club, 'club_name' | 'contact_name' | 'phone'>>) {
    const { error } = await supabase.from('clubs').update(data).eq('id', clubId)
    if (error) { setActionError(error.message); return }
    setClub(prev => prev ? { ...prev, ...data } : prev)
  }

  async function handleUploadAvatar(file: File) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${clubId}/avatar.${ext}`
    const url = await tryUpload('club-logos', path, file)
    if (!url) return
    await supabase.from('clubs').update({ avatar_url: url }).eq('id', clubId)
    setClub(prev => prev ? { ...prev, avatar_url: url } : prev)
  }

  // ── files (music + TS sheet) ──────────────────────────────────────────────────
  async function handleSetFile(
    teamId: string, competitionId: string,
    routineType: 'Balance' | 'Dynamic' | 'Combined',
    field: 'music' | 'ts', file: File | null,
  ) {
    const pathField    = field === 'music' ? 'music_path'     : 'ts_path'
    const frontendField = field === 'music' ? 'music_filename' : 'ts_filename'

    let storagePath: string | null = null
    if (file) {
      const ext    = file.name.split('.').pop() ?? (field === 'ts' ? 'pdf' : 'mp3')
      const bucket = field === 'music' ? 'musics' : 'TS'
      const entry  = entries.find(e => e.team_id === teamId && e.competition_id === competitionId)
      const team   = teams.find(t => t.id === teamId)
      const dorsal = entry?.dorsal ?? 0
      const ageGroupRule = ageGroupRules.find(r => r.id === team?.age_group)
      const toSlug = (s: string) => slugify(s).replace(/_/g, '-')
      const ageGroup = toSlug(ageGroupRule?.age_group ?? team?.age_group ?? 'unknown')
      const clubSlug = toSlug(club?.club_name ?? 'club')
      const path = `${competitionId}/${dorsal}-${ageGroup}-${routineType}-${clubSlug}.${ext}`
      const url = await tryUpload(bucket, path, file)
      if (!url) return
      storagePath = url
    }

    const existing = music.find(m => m.team_id === teamId && m.competition_id === competitionId && m.routine_type === routineType)

    if (existing) {
      await supabase.from('routine_music').update({ [pathField]: storagePath }).eq('id', existing.id)
      setMusicState(prev => prev.map(m => m.id === existing.id ? { ...m, [frontendField]: storagePath } : m))
      if (field === 'ts' && storagePath) {
        setTsReviewStatuses(prev => prev.map(s =>
          s.team_id === teamId && s.competition_id === competitionId && s.routine_type === routineType &&
          ['incorrect', 'checked'].includes(s.status)
            ? { ...s, status: 'new_ts', final_comment: null }
            : s
        ))
      }
    } else {
      const { data } = await supabase.from('routine_music').insert({
        team_id: teamId, competition_id: competitionId, routine_type: routineType,
        music_path: field === 'music' ? storagePath : null,
        ts_path:    field === 'ts'    ? storagePath : null,
      }).select().single()
      if (data) {
        const { music_path, ts_path, ...rest } = data as typeof data & { music_path: string | null; ts_path: string | null }
        setMusicState(prev => [...prev, { ...rest, music_filename: music_path, ts_filename: ts_path }])
      }
    }
  }

  return {
    // state
    loading, club, clubId,
    gymnasts, coaches, competitionCoaches, teams, competitions,
    entries, music, judges, nominations, agLabels, ageGroupRules, tsReviewStatuses, apparatus, apparatusRules, rgRegistrations,
    actionError,
    // handlers
    handleAddGymnast, handleAddGymnastsBulk, handleUpdateGymnast, handleDeleteGymnast,
    handleUploadGymnastPhoto, handleUploadLicencia, handleRemoveLicencia,
    handleAddCoach, handleUpdateCoach, handleDeleteCoach,
    handleUploadCoachPhoto, handleUploadCoachLicencia,
    handleRegisterCoach, handleUnregisterCoach,
    handleAddTeam, handleUpdateTeam, handleDeleteTeam, handleRestoreTeam, handleUploadTeamPhoto,
    handleRGRegister, handleRGUploadPaymentDoc, handleSetRGMusic,
    handleRegister, handleDropout,
    handleInviteJudge, handleUpdateJudge, handleDeleteJudge, handleUploadJudgePhoto,
    handleNominate, handleRemoveNomination,
    handleUpdateClub, handleUploadAvatar,
    handleSetFile,
    clearActionError: () => setActionError(null),
  }
}
