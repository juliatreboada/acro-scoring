'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/aj-scoring/types'
import type { Club, Gymnast, Team, Competition, CompetitionEntry, RoutineMusic, Judge, CompetitionJudgeNomination, AgeGroupRule } from '@/components/admin/types'
import ClubPortal from '@/components/club/ClubPortal'
import AuthBar from '@/components/shared/AuthBar'

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const supabase = createClient()
  const [lang, setLang]       = useState<Lang>('es')
  const [loading, setLoading] = useState(true)

  const [club,         setClub]         = useState<Club | null>(null)
  const [gymnasts,     setGymnasts]     = useState<Gymnast[]>([])
  const [teams,        setTeams]        = useState<Team[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [entries,      setEntries]      = useState<CompetitionEntry[]>([])
  const [music,        setMusicState]   = useState<RoutineMusic[]>([])
  const [judges,       setJudges]       = useState<Judge[]>([])
  const [nominations,  setNominations]  = useState<CompetitionJudgeNomination[]>([])
  const [clubId,       setClubId]       = useState<string>('')
  const [agLabels,     setAgLabels]     = useState<Record<string, string>>({})
  const [ageGroupRules, setAgeGroupRules] = useState<AgeGroupRule[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // In new schema, clubs.id = profiles.id = auth.uid()
      const { data: profile } = await supabase
        .from('clubs').select('id').eq('id', user.id).single()
      if (!profile) { setLoading(false); return }
      const cid = user.id
      setClubId(cid)

      // ── parallel: club + gymnasts + teams + competitions + nominations + rules ─
      const [clubRes, gymnastsRes, teamsRes, compsRes, nomsRes, rulesRes] = await Promise.all([
        supabase.from('clubs').select('id,club_name,contact_name,phone,avatar_url').eq('id', cid).single(),
        supabase.from('gymnasts').select('id,club_id,first_name,last_name_1,last_name_2,date_of_birth,photo_url').eq('club_id', cid),
        supabase.from('teams').select('id,club_id,category,age_group,gymnast_display,photo_url').eq('club_id', cid),
        supabase.from('competitions')
          .select('id,name,status,location,start_date,end_date,registration_deadline,age_groups,poster_url,created_at')
          .neq('status', 'draft')
          .order('start_date', { ascending: false }),
        supabase.from('competition_judge_nominations').select('id,competition_id,judge_id,club_id').eq('club_id', cid),
        supabase.from('age_group_rules').select('id,age_group,ruleset,min_age,max_age,routine_count').order('sort_order'),
      ])

      const rawTeams = teamsRes.data ?? []
      const teamIds  = rawTeams.map(t => t.id)

      // ── parallel: team_gymnasts + entries + music + all judges ───────────────
      const [tgRes, entriesRes, musicRes, judgesRes] = await Promise.all([
        teamIds.length > 0
          ? supabase.from('team_gymnasts').select('team_id,gymnast_id').in('team_id', teamIds)
          : Promise.resolve({ data: [] as { team_id: string; gymnast_id: string }[] }),
        teamIds.length > 0
          ? supabase.from('competition_entries').select('id,competition_id,team_id,dropped_out').in('team_id', teamIds)
          : Promise.resolve({ data: [] }),
        teamIds.length > 0
          ? supabase.from('routine_music').select('id,team_id,competition_id,routine_type,music_path,ts_path,uploaded_at').in('team_id', teamIds)
          : Promise.resolve({ data: [] }),
        supabase.from('judges').select('id,full_name,phone,licence,avatar_url'),
      ])

      // attach gymnast_ids to each team
      const tgMap: Record<string, string[]> = {}
      for (const tg of tgRes.data ?? []) {
        if (!tgMap[tg.team_id]) tgMap[tg.team_id] = []
        tgMap[tg.team_id].push(tg.gymnast_id)
      }
      const teamsWithIds: Team[] = rawTeams.map(t => ({ ...t, gymnast_ids: tgMap[t.id] ?? [] }))

      // map music_path/ts_path → music_filename/ts_filename
      const mappedMusic: RoutineMusic[] = (musicRes.data ?? []).map(({ music_path, ts_path, ...m }) => ({
        ...m,
        music_filename: music_path,
        ts_filename:    ts_path,
      }))

      const mappedComps: Competition[] = (compsRes.data ?? []).map(c => ({ ...c, admin: null }))

      const agLabelsMap = Object.fromEntries(((rulesRes.data ?? []) as unknown as { id: string; age_group: string; ruleset: string; min_age: number; max_age: number | null }[]).map(r => [r.id, `${r.age_group} (${r.ruleset})`]))
      setAgeGroupRules((rulesRes.data ?? []) as unknown as AgeGroupRule[])

      const rawJudges = judgesRes.data ?? []
      const fetchedJudgeIds = rawJudges.map((j: { id: string }) => j.id)
      const { data: judgeProfiles } = fetchedJudgeIds.length > 0
        ? await supabase.from('profiles').select('id,email').in('id', fetchedJudgeIds)
        : { data: [] }
      const judgeEmailMap = Object.fromEntries((judgeProfiles ?? []).map(p => [p.id, p.email ?? null]))

      setClub(clubRes.data)
      setGymnasts((gymnastsRes.data ?? []) as unknown as Gymnast[])
      setTeams(teamsWithIds)
      setCompetitions(mappedComps)
      setEntries(entriesRes.data ?? [])
      setMusicState(mappedMusic)
      setJudges(rawJudges.map((j: { id: string; full_name: string; phone: string | null; licence: string | null; avatar_url: string | null }) => ({ ...j, email: judgeEmailMap[j.id] ?? null })))
      setNominations(nomsRes.data ?? [])
      setAgLabels(agLabelsMap)
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── gymnasts ──────────────────────────────────────────────────────────────────
  async function handleAddGymnast(g: Omit<Gymnast, 'id' | 'club_id'>) {
    const { data } = await supabase.from('gymnasts').insert({ ...g, club_id: clubId }).select().single()
    if (data) setGymnasts(prev => [...prev, data as unknown as Gymnast])
  }

  async function handleUpdateGymnast(id: string, g: Omit<Gymnast, 'id' | 'club_id'>) {
    await supabase.from('gymnasts').update(g).eq('id', id)
    setGymnasts(prev => prev.map(x => x.id === id ? { ...x, ...g } : x))
  }

  async function handleDeleteGymnast(id: string) {
    await supabase.from('gymnasts').delete().eq('id', id)
    setGymnasts(prev => prev.filter(x => x.id !== id))
    setTeams(prev => prev.map(t => ({ ...t, gymnast_ids: (t.gymnast_ids ?? []).filter(gid => gid !== id) })))
  }

  // ── teams ─────────────────────────────────────────────────────────────────────
  async function handleAddTeam(t: Omit<Team, 'id' | 'club_id' | 'photo_url'>) {
    const { gymnast_ids, ...rest } = t
    const { data: newTeam } = await supabase
      .from('teams').insert({ ...rest, club_id: clubId, photo_url: null }).select().single()
    if (!newTeam) return
    // insert team_gymnasts rows
    if (gymnast_ids?.length) {
      await supabase.from('team_gymnasts').insert(gymnast_ids.map(gid => ({ team_id: newTeam.id, gymnast_id: gid })))
    }
    setTeams(prev => [...prev, { ...newTeam, gymnast_ids: gymnast_ids ?? [] }])
  }

  async function handleUpdateTeam(id: string, t: Omit<Team, 'id' | 'club_id' | 'photo_url'>) {
    const { gymnast_ids, ...rest } = t
    await supabase.from('teams').update(rest).eq('id', id)
    // replace team_gymnasts
    if (gymnast_ids !== undefined) {
      await supabase.from('team_gymnasts').delete().eq('team_id', id)
      if (gymnast_ids.length > 0) {
        await supabase.from('team_gymnasts').insert(gymnast_ids.map(gid => ({ team_id: id, gymnast_id: gid })))
      }
    }
    setTeams(prev => prev.map(x => x.id === id ? { ...x, ...t } : x))
  }

  async function handleDeleteTeam(id: string) {
    await supabase.from('teams').delete().eq('id', id)
    setTeams(prev => prev.filter(x => x.id !== id))
    setEntries(prev => prev.filter(e => e.team_id !== id))
    setMusicState(prev => prev.filter(m => m.team_id !== id))
  }

  // ── registrations ─────────────────────────────────────────────────────────────
  async function handleRegister(competitionId: string, teamId: string) {
    if (entries.some(e => e.competition_id === competitionId && e.team_id === teamId)) return
    const { data } = await supabase.from('competition_entries')
      .insert({ competition_id: competitionId, team_id: teamId, dropped_out: false }).select().single()
    if (data) setEntries(prev => [...prev, data as CompetitionEntry])
  }

  async function handleUnregister(entryId: string) {
    const entry = entries.find(e => e.id === entryId)
    await supabase.from('competition_entries').delete().eq('id', entryId)
    setEntries(prev => prev.filter(e => e.id !== entryId))
    if (entry) setMusicState(prev => prev.filter(m => !(m.team_id === entry.team_id && m.competition_id === entry.competition_id)))
  }

  // ── judges ────────────────────────────────────────────────────────────────────
  async function handleInviteJudge(j: { full_name: string; email: string; phone?: string; licence?: string }) {
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
    await supabase.from('judges').update({ full_name, phone, licence }).eq('id', id)
    setJudges(prev => prev.map(x => x.id === id ? { ...x, ...j } : x))
  }

  async function handleDeleteJudge(id: string) {
    await supabase.from('judges').delete().eq('id', id)
    setJudges(prev => prev.filter(x => x.id !== id))
    setNominations(prev => prev.filter(n => n.judge_id !== id))
  }

  // ── nominations ───────────────────────────────────────────────────────────────
  async function handleNominate(competitionId: string, judgeId: string) {
    if (nominations.some(n => n.competition_id === competitionId && n.judge_id === judgeId)) return
    const { data } = await supabase.from('competition_judge_nominations')
      .insert({ competition_id: competitionId, judge_id: judgeId, club_id: clubId }).select().single()
    if (data) setNominations(prev => [...prev, data as CompetitionJudgeNomination])
  }

  async function handleRemoveNomination(nominationId: string) {
    await supabase.from('competition_judge_nominations').delete().eq('id', nominationId)
    setNominations(prev => prev.filter(n => n.id !== nominationId))
  }

  // ── club profile ──────────────────────────────────────────────────────────────
  async function handleUpdateClub(data: Partial<Pick<Club, 'club_name' | 'contact_name' | 'phone'>>) {
    await supabase.from('clubs').update(data).eq('id', clubId)
    setClub(prev => prev ? { ...prev, ...data } : prev)
  }

  async function handleUploadGymnastPhoto(id: string, file: File) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `gymnasts/${id}/photo.${ext}`
    const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: true })
    if (error) { console.error('Gymnast photo upload failed:', error.message); return }
    const { data } = supabase.storage.from('photos').getPublicUrl(path)
    const url = data.publicUrl
    await supabase.from('gymnasts').update({ photo_url: url } as Record<string, string>).eq('id', id)
    setGymnasts(prev => prev.map(g => g.id === id ? { ...g, photo_url: url } : g))
  }

  async function handleUploadTeamPhoto(id: string, file: File) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `teams/${id}/photo.${ext}`
    const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: true })
    if (error) { console.error('Team photo upload failed:', error.message); return }
    const { data } = supabase.storage.from('photos').getPublicUrl(path)
    const url = data.publicUrl
    await supabase.from('teams').update({ photo_url: url }).eq('id', id)
    setTeams(prev => prev.map(t => t.id === id ? { ...t, photo_url: url } : t))
  }

  async function handleUploadAvatar(file: File) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `clubs/${clubId}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { console.error('Avatar upload failed:', error.message); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = data.publicUrl
    await supabase.from('clubs').update({ avatar_url: url }).eq('id', clubId)
    setClub(prev => prev ? { ...prev, avatar_url: url } : prev)
  }

  // ── files (music + TS sheet) ──────────────────────────────────────────────────
  async function handleSetFile(
    teamId: string, competitionId: string,
    routineType: 'Balance' | 'Dynamic' | 'Combined',
    field: 'music' | 'ts', filename: string | null,
  ) {
    const pathField = field === 'music' ? 'music_path' : 'ts_path'
    const existing = music.find(m => m.team_id === teamId && m.competition_id === competitionId && m.routine_type === routineType)

    if (existing) {
      await supabase.from('routine_music').update({ [pathField]: filename }).eq('id', existing.id)
      const frontendField = field === 'music' ? 'music_filename' : 'ts_filename'
      setMusicState(prev => prev.map(m => m.id === existing.id ? { ...m, [frontendField]: filename } : m))
    } else {
      const { data } = await supabase.from('routine_music').insert({
        team_id: teamId, competition_id: competitionId, routine_type: routineType,
        music_path: field === 'music' ? filename : null,
        ts_path:    field === 'ts'    ? filename : null,
      }).select().single()
      if (data) {
        const { music_path, ts_path, ...rest } = data as typeof data & { music_path: string | null; ts_path: string | null }
        setMusicState(prev => [...prev, { ...rest, music_filename: music_path, ts_filename: ts_path }])
      }
    }
  }

  if (loading || !club) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
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

      <ClubPortal
        lang={lang}
        club={club}
        gymnasts={gymnasts}
        teams={teams}
        competitions={competitions}
        entries={entries}
        music={music}
        judges={judges}
        nominations={nominations}
        agLabels={agLabels}
        ageGroupRules={ageGroupRules}
        onAddGymnast={handleAddGymnast}
        onUpdateGymnast={handleUpdateGymnast}
        onDeleteGymnast={handleDeleteGymnast}
        onAddTeam={handleAddTeam}
        onUpdateTeam={handleUpdateTeam}
        onDeleteTeam={handleDeleteTeam}
        onRegister={handleRegister}
        onUnregister={handleUnregister}
        onSetFile={handleSetFile}
        onInviteJudge={handleInviteJudge}
        onUpdateJudge={handleUpdateJudge}
        onDeleteJudge={handleDeleteJudge}
        onNominate={handleNominate}
        onRemoveNomination={handleRemoveNomination}
        onUpdateClub={handleUpdateClub}
        onUploadAvatar={handleUploadAvatar}
        onUploadGymnastPhoto={handleUploadGymnastPhoto}
        onUploadTeamPhoto={handleUploadTeamPhoto}
      />
    </div>
  )
}
