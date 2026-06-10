'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { Competition, Club, Team, CompetitionEntry, OfficialTraining, OfficialTrainingEntry } from '@/components/admin/types'
import { useT } from '@/lib/useT'

// ─── helpers ──────────────────────────────────────────────────────────────────

function routineDurationSec(routineType: string, teamMusicCount: number): number {
  if (routineType === 'Balance') return 150
  if (routineType === 'Dynamic') return 120
  // Combined
  return teamMusicCount > 1 ? 150 : 120
}

function fmtSecs(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function addMins(hhmm: string, mins: number): string {
  const base = hhmm.slice(0, 5)
  const [h, m] = base.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// ─── types ────────────────────────────────────────────────────────────────────

type EntryWithTeam = OfficialTrainingEntry & { gymnast_display: string }

type SlotForm = {
  training_date: string
  warmup_start: string
  warmup_duration_minutes: number
  competition_duration_minutes: number
}

// ─── main component ───────────────────────────────────────────────────────────

export default function OfficialTrainingsTab({
  lang, competition, clubs, entries, globalTeams, onToggleVisible,
}: {
  lang: Lang
  competition: Competition
  clubs: Club[]
  entries: CompetitionEntry[]
  globalTeams: Team[]
  onToggleVisible: (visible: boolean) => Promise<void>
}) {
  const t = useT('OfficialTrainingsTab', lang)
  const supabase = createClient()

  // ── schedule state ────────────────────────────────────────────────────────
  const [trainings, setTrainings] = useState<OfficialTraining[]>([])
  const [loading, setLoading] = useState(true)
  const [showVisible, setShowVisible] = useState(competition.show_official_trainings ?? false)
  const [editingClubId, setEditingClubId] = useState<string | null>(null)
  const [form, setForm] = useState<SlotForm | null>(null)
  const [saving, setSaving] = useState(false)

  // ── playback state ────────────────────────────────────────────────────────
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null)
  const [playbackEntries, setPlaybackEntries] = useState<EntryWithTeam[]>([])
  const [musicPaths, setMusicPaths] = useState<Record<string, string | null>>({})
  const [musicCounts, setMusicCounts] = useState<Record<string, number>>({})
  const [loadingPlayback, setLoadingPlayback] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentIdxRef = useRef(0)
  const entriesLenRef = useRef(0)

  // ── fetch trainings on mount ──────────────────────────────────────────────
  useEffect(() => {
    supabase.from('official_trainings')
      .select('*')
      .eq('competition_id', competition.id)
      .then(({ data }) => {
        setTrainings((data ?? []) as OfficialTraining[])
        setLoading(false)
      })
  }, [competition.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── init audio element ────────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio()
    audio.onended = () => {
      const next = currentIdxRef.current + 1
      if (next < entriesLenRef.current) {
        currentIdxRef.current = next
        setCurrentIdx(next)
        // isPlaying stays true — effect below will start next track
      } else {
        setIsPlaying(false)
      }
    }
    audioRef.current = audio
    return () => { audio.pause(); audioRef.current = null }
  }, [])

  useEffect(() => { currentIdxRef.current = currentIdx }, [currentIdx])
  useEffect(() => { entriesLenRef.current = playbackEntries.length }, [playbackEntries])

  // ── sync audio with playback state ────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const entry = playbackEntries[currentIdx]
    const url = entry ? (musicPaths[`${entry.team_id}:${entry.routine_type}`] ?? null) : null

    if (!url) { audio.pause(); audio.src = ''; return }
    if (audio.src !== url) { audio.pause(); audio.src = url; audio.load() }
    if (isPlaying) audio.play().catch(() => setIsPlaying(false))
    else audio.pause()
  }, [currentIdx, isPlaying, playbackEntries, musicPaths]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetch entries + music when club selected ──────────────────────────────
  useEffect(() => {
    if (!selectedClubId) { setPlaybackEntries([]); setMusicPaths({}); return }
    const training = trainings.find(t => t.club_id === selectedClubId)
    if (!training) { setPlaybackEntries([]); return }

    setLoadingPlayback(true)
    setCurrentIdx(0)
    setIsPlaying(false)
    audioRef.current?.pause()

    supabase.from('official_training_entries')
      .select('*, teams(gymnast_display)')
      .eq('training_id', training.id)
      .order('position')
      .then(async ({ data: rawEntries }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entries_list = (rawEntries ?? []) as unknown as (OfficialTrainingEntry & { teams: { gymnast_display: string } | null })[]
        const teamIds = [...new Set(entries_list.map(e => e.team_id))]

        if (teamIds.length === 0) {
          setPlaybackEntries([])
          setMusicPaths({})
          setMusicCounts({})
          setLoadingPlayback(false)
          return
        }

        const { data: musicData } = await supabase.from('routine_music')
          .select('team_id, routine_type, music_path')
          .eq('competition_id', competition.id)
          .in('team_id', teamIds)

        const paths: Record<string, string | null> = {}
        const counts: Record<string, number> = {}
        for (const row of (musicData ?? []) as { team_id: string; routine_type: string; music_path: string | null }[]) {
          paths[`${row.team_id}:${row.routine_type}`] = row.music_path
          counts[row.team_id] = (counts[row.team_id] ?? 0) + 1
        }

        setMusicPaths(paths)
        setMusicCounts(counts)
        setPlaybackEntries(entries_list.map(e => ({
          ...e,
          gymnast_display: e.teams?.gymnast_display ?? e.team_id,
        })))
        setLoadingPlayback(false)
      })
  }, [selectedClubId, trainings]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── which clubs are registered ────────────────────────────────────────────
  const registeredClubIds = new Set(
    entries.map(e => {
      const team = globalTeams.find(t => t.id === e.team_id)
      return team?.club_id
    }).filter(Boolean) as string[]
  )
  const registeredClubs = clubs
    .filter(c => registeredClubIds.has(c.id))
    .sort((a, b) => {
      const ta = trainings.find(t => t.club_id === a.id)
      const tb = trainings.find(t => t.club_id === b.id)
      if (!ta && !tb) return 0
      if (!ta) return 1   // unassigned goes last
      if (!tb) return -1
      const keyA = `${ta.training_date}T${ta.warmup_start}`
      const keyB = `${tb.training_date}T${tb.warmup_start}`
      return keyA < keyB ? -1 : keyA > keyB ? 1 : 0
    })

  // ── handlers ─────────────────────────────────────────────────────────────
  async function handleToggleVisible() {
    const next = !showVisible
    setShowVisible(next)
    await onToggleVisible(next)
  }

  function openEdit(clubId: string) {
    const existing = trainings.find(t => t.club_id === clubId)
    setEditingClubId(clubId)
    setForm(existing ? {
      training_date: existing.training_date,
      warmup_start: existing.warmup_start.slice(0, 5),
      warmup_duration_minutes: existing.warmup_duration_minutes,
      competition_duration_minutes: existing.competition_duration_minutes,
    } : {
      training_date: competition.start_date ?? new Date().toISOString().slice(0, 10),
      warmup_start: '09:00',
      warmup_duration_minutes: 45,
      competition_duration_minutes: 60,
    })
  }

  async function handleSave(clubId: string) {
    if (!form) return
    setSaving(true)
    const existing = trainings.find(t => t.club_id === clubId)
    const payload = {
      competition_id: competition.id,
      club_id: clubId,
      training_date: form.training_date,
      warmup_start: form.warmup_start,
      warmup_duration_minutes: form.warmup_duration_minutes,
      competition_duration_minutes: form.competition_duration_minutes,
    }
    if (existing) {
      const { data } = await supabase.from('official_trainings').update(payload).eq('id', existing.id).select().single()
      if (data) setTrainings(prev => prev.map(t => t.id === existing.id ? data as OfficialTraining : t))
    } else {
      const { data } = await supabase.from('official_trainings').insert(payload).select().single()
      if (data) setTrainings(prev => [...prev, data as OfficialTraining])
    }
    setEditingClubId(null)
    setForm(null)
    setSaving(false)
  }

  async function handleDelete(trainingId: string) {
    if (!confirm(lang === 'es' ? '¿Eliminar este slot de entrenamiento?' : 'Delete this training slot?')) return
    await supabase.from('official_trainings').delete().eq('id', trainingId)
    setTrainings(prev => prev.filter(t => t.id !== trainingId))
    if (selectedClubId && trainings.find(t => t.id === trainingId)?.club_id === selectedClubId) {
      setSelectedClubId(null)
    }
  }

  async function handleToggleLock(training: OfficialTraining) {
    const { data } = await supabase.from('official_trainings')
      .update({ locked: !training.locked }).eq('id', training.id).select().single()
    if (data) setTrainings(prev => prev.map(t => t.id === training.id ? data as OfficialTraining : t))
  }

  async function handleMarkPlayed(entryId: string, played: boolean) {
    const playedAt = played ? new Date().toISOString() : null
    await supabase.from('official_training_entries').update({ played_at: playedAt }).eq('id', entryId)
    setPlaybackEntries(prev => prev.map(e => e.id === entryId ? { ...e, played_at: playedAt } : e))
  }

  // ── render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
    </div>
  )

  const clubsWithSlots = trainings.map(tr => clubs.find(c => c.id === tr.club_id)).filter(Boolean) as Club[]

  return (
    <div className="space-y-8">

      {/* ── visibility toggle ── */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">{t.visibleToggle}</p>
          <p className="text-xs text-slate-400 mt-0.5">{showVisible ? t.visibleOn : t.visibleOff}</p>
        </div>
        <button
          onClick={handleToggleVisible}
          className={[
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
            showVisible ? 'bg-blue-600' : 'bg-slate-200',
          ].join(' ')}
        >
          <span className={[
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200',
            showVisible ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')} />
        </button>
      </div>

      {/* ── club schedule list ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          {lang === 'es' ? 'Horarios por club' : 'Club schedules'}
        </p>
        {registeredClubs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10 bg-white border border-slate-200 rounded-2xl">
            {t.noRegisteredClubs}
          </p>
        ) : (
          <div className="space-y-3">
            {registeredClubs.map(club => {
              const training = trainings.find(tr => tr.club_id === club.id)
              const isEditing = editingClubId === club.id

              return (
                <div key={club.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  {/* club header row */}
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {club.avatar_url ? (
                        <img src={club.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 flex items-center justify-center text-xs font-bold text-slate-400">
                          {club.club_name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{club.club_name}</p>
                        {training ? (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {training.training_date} · ⏰ {training.warmup_start.slice(0, 5)} · ▶ {addMins(training.warmup_start, training.warmup_duration_minutes)}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-300">{t.unassigned}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {training && (
                        <button
                          onClick={() => handleToggleLock(training)}
                          className={[
                            'text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all',
                            training.locked
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100',
                          ].join(' ')}
                        >
                          {training.locked ? t.unlock : t.lock}
                        </button>
                      )}
                      <button
                        onClick={() => isEditing ? setEditingClubId(null) : openEdit(club.id)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                      >
                        {isEditing ? (lang === 'es' ? 'Cancelar' : 'Cancel') : (training ? t.editSlot : t.newSlot)}
                      </button>
                    </div>
                  </div>

                  {/* inline edit form */}
                  {isEditing && form && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">{t.date}</label>
                          <input type="date" value={form.training_date}
                            onChange={e => setForm(f => f ? { ...f, training_date: e.target.value } : f)}
                            className="w-full text-sm text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">{t.warmupStart}</label>
                          <input type="time" value={form.warmup_start}
                            onChange={e => setForm(f => f ? { ...f, warmup_start: e.target.value } : f)}
                            className="w-full text-sm text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">{t.warmupDuration}</label>
                          <input type="number" min={0} value={form.warmup_duration_minutes}
                            onChange={e => setForm(f => f ? { ...f, warmup_duration_minutes: parseInt(e.target.value) || 0 } : f)}
                            className="w-full text-sm text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">{t.competitionDuration}</label>
                          <input type="number" min={0} value={form.competition_duration_minutes}
                            onChange={e => setForm(f => f ? { ...f, competition_duration_minutes: parseInt(e.target.value) || 0 } : f)}
                            className="w-full text-sm text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                          {t.competitionStart}: <span className="font-semibold text-slate-700">
                            {addMins(form.warmup_start, form.warmup_duration_minutes)}
                          </span>
                          <span className="ml-1.5 text-slate-300">({t.computedFrom})</span>
                        </p>
                        <div className="flex items-center gap-2">
                          {trainings.find(tr => tr.club_id === club.id) && (
                            <button
                              onClick={() => handleDelete(trainings.find(tr => tr.club_id === club.id)!.id)}
                              className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors px-2 py-1"
                            >
                              {t.delete}
                            </button>
                          )}
                          <button
                            onClick={() => handleSave(club.id)}
                            disabled={saving}
                            className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                          >
                            {saving ? '…' : t.save}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── music playback ── */}
      {clubsWithSlots.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{t.playback}</p>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {/* club selector */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap">
              <span className="text-xs font-medium text-slate-500 shrink-0">{t.selectClub}</span>
              <div className="flex flex-wrap gap-2">
                {clubsWithSlots.map(club => (
                  <button
                    key={club.id}
                    onClick={() => {
                      if (selectedClubId !== club.id) {
                        setSelectedClubId(club.id)
                        setCurrentIdx(0)
                        setIsPlaying(false)
                      }
                    }}
                    className={[
                      'text-xs font-semibold px-3 py-1 rounded-full border transition-all',
                      selectedClubId === club.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300',
                    ].join(' ')}
                  >
                    {club.club_name}
                  </button>
                ))}
              </div>
            </div>

            {selectedClubId && (
              <>
                {/* global controls */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(p => !p)}
                    disabled={playbackEntries.length === 0}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-all"
                  >
                    {isPlaying ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                        {t.stop}
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        {t.playAll}
                      </>
                    )}
                  </button>
                  {isPlaying && (
                    <p className="text-xs text-slate-400">
                      {playbackEntries[currentIdx]?.gymnast_display ?? ''} — {playbackEntries[currentIdx]?.routine_type ?? ''}
                    </p>
                  )}
                </div>

                {/* entry list */}
                {loadingPlayback ? (
                  <div className="flex justify-center py-8">
                    <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
                  </div>
                ) : playbackEntries.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">{t.noEntries}</p>
                ) : (
                  <ol className="divide-y divide-slate-50">
                    {playbackEntries.map((entry, idx) => {
                      const isActive = idx === currentIdx && isPlaying
                      const hasMusic = !!(musicPaths[`${entry.team_id}:${entry.routine_type}`])
                      const dur = routineDurationSec(entry.routine_type, musicCounts[entry.team_id] ?? 1)
                      return (
                        <li
                          key={entry.id}
                          className={[
                            'flex items-center gap-3 px-4 py-2.5 transition-colors',
                            isActive ? 'bg-blue-50' : entry.played_at ? 'bg-slate-50/60' : '',
                          ].join(' ')}
                        >
                          {/* position / playing indicator */}
                          <span className={[
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                            isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400',
                          ].join(' ')}>
                            {isActive ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            ) : idx + 1}
                          </span>

                          {/* info */}
                          <div className="flex-1 min-w-0">
                            <p className={['text-sm font-medium truncate', entry.played_at ? 'text-slate-400 line-through' : 'text-slate-800'].join(' ')}>
                              {entry.gymnast_display}
                            </p>
                            <p className="text-xs text-slate-400">{entry.routine_type} · {fmtSecs(dur)}</p>
                          </div>

                          {!hasMusic && (
                            <span className="text-xs font-semibold px-1.5 py-0.5 bg-red-50 text-red-400 rounded shrink-0">{t.noMusic}</span>
                          )}

                          {/* play this track */}
                          <button
                            onClick={() => {
                              setCurrentIdx(idx)
                              setIsPlaying(true)
                            }}
                            disabled={!hasMusic}
                            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-blue-100 flex items-center justify-center shrink-0 disabled:opacity-30 transition-all"
                          >
                            <svg className="w-3.5 h-3.5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>

                          {/* mark played */}
                          <button
                            onClick={() => handleMarkPlayed(entry.id, !entry.played_at)}
                            title={entry.played_at ? t.unmarkPlayed : t.markPlayed}
                            className={[
                              'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all',
                              entry.played_at ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200',
                            ].join(' ')}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </>
            )}

            {!selectedClubId && (
              <p className="text-sm text-slate-400 text-center py-8">
                {lang === 'es' ? 'Selecciona un club para ver su lista de rutinas.' : 'Select a club to see their routine list.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
