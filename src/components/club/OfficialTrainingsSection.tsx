'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { Competition, Team, OfficialTraining, OfficialTrainingEntry } from '@/components/admin/types'
import { useT } from '@/lib/useT'

// ─── helpers ──────────────────────────────────────────────────────────────────

function routineDurationSec(routineType: string, teamMusicCount: number): number {
  if (routineType === 'Balance') return 150
  if (routineType === 'Dynamic') return 120
  return teamMusicCount > 1 ? 150 : 120
}

function fmtSecs(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function addMins(hhmm: string, mins: number): string {
  const base = hhmm.slice(0, 5)
  const [h, m] = base.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// ─── types ────────────────────────────────────────────────────────────────────

type MusicRow = { team_id: string; routine_type: string; music_path: string | null }

type EntryDisplay = OfficialTrainingEntry & { gymnast_display: string; duration: number }

// ─── component ────────────────────────────────────────────────────────────────

export function OfficialTrainingsSection({
  lang, competition, clubId, registeredTeams,
}: {
  lang: Lang
  competition: Competition
  clubId: string
  registeredTeams: Team[]  // club's non-dropped-out teams entered in this competition
}) {
  const t = useT('CompetitionsTab', lang)
  const supabase = createClient()

  const [training, setTraining] = useState<OfficialTraining | null | undefined>(undefined) // undefined = loading
  const [entries, setEntries] = useState<EntryDisplay[]>([])
  const [musicRows, setMusicRows] = useState<MusicRow[]>([])
  const [musicCounts, setMusicCounts] = useState<Record<string, number>>({})
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [playingKey, setPlayingKey] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // ── fetch training slot ───────────────────────────────────────────────────
  useEffect(() => {
    supabase.from('official_trainings')
      .select('*')
      .eq('competition_id', competition.id)
      .eq('club_id', clubId)
      .maybeSingle()
      .then(({ data }) => setTraining(data ? data as OfficialTraining : null))
  }, [competition.id, clubId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetch entries + music once training is known ──────────────────────────
  useEffect(() => {
    if (!training) return
    const teamIds = registeredTeams.map(t => t.id)
    setLoadingEntries(true)

    Promise.all([
      supabase.from('official_training_entries')
        .select('*, teams(gymnast_display)')
        .eq('training_id', training.id)
        .order('position'),
      teamIds.length > 0
        ? supabase.from('routine_music')
            .select('team_id, routine_type, music_path')
            .eq('competition_id', competition.id)
            .in('team_id', teamIds)
        : Promise.resolve({ data: [] }),
    ]).then(([entriesRes, musicRes]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawEntries = (entriesRes.data ?? []) as unknown as (OfficialTrainingEntry & { teams: { gymnast_display: string } | null })[]
      const music = (musicRes.data ?? []) as MusicRow[]

      const counts: Record<string, number> = {}
      for (const row of music) counts[row.team_id] = (counts[row.team_id] ?? 0) + 1

      setMusicRows(music)
      setMusicCounts(counts)
      setEntries(rawEntries.map(e => ({
        ...e,
        gymnast_display: e.teams?.gymnast_display ?? e.team_id,
        duration: routineDurationSec(e.routine_type, counts[e.team_id] ?? 1),
      })))
      setLoadingEntries(false)
    })
  }, [training?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── time calculations ─────────────────────────────────────────────────────
  const totalAvailableSecs = (training?.competition_duration_minutes ?? 0) * 60
  const usedSecs = entries.reduce((sum, e) => sum + e.duration, 0)
  const usedPct = totalAvailableSecs > 0 ? Math.min(100, (usedSecs / totalAvailableSecs) * 100) : 0
  const isFull = usedSecs >= totalAvailableSecs && totalAvailableSecs > 0
  const isNearFull = usedPct >= 90

  // ── available routines for picker ─────────────────────────────────────────
  // group available routine types per team (only those that exist in routine_music)
  const availableByTeam: Array<{ team: Team; routineTypes: string[] }> = registeredTeams
    .map(team => {
      const types = musicRows
        .filter(r => r.team_id === team.id)
        .map(r => r.routine_type)
      return { team, routineTypes: types }
    })
    .filter(x => x.routineTypes.length > 0)

  // ── handlers ──────────────────────────────────────────────────────────────

  async function handleAdd(teamId: string, routineType: string) {
    if (!training || isFull) return
    setSaving(true)
    const newPosition = entries.length + 1
    const { data } = await supabase.from('official_training_entries')
      .insert({ training_id: training.id, team_id: teamId, routine_type: routineType, position: newPosition })
      .select('*, teams(gymnast_display)')
      .single()
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = data as unknown as OfficialTrainingEntry & { teams: { gymnast_display: string } | null }
      setEntries(prev => [...prev, {
        ...row,
        gymnast_display: row.teams?.gymnast_display ?? teamId,
        duration: routineDurationSec(routineType, musicCounts[teamId] ?? 1),
      }])
    }
    setSaving(false)
  }

  async function handleRemove(entryId: string) {
    await supabase.from('official_training_entries').delete().eq('id', entryId)
    setEntries(prev => {
      const next = prev.filter(e => e.id !== entryId).map((e, i) => ({ ...e, position: i + 1 }))
      // renumber in DB (fire and forget)
      next.forEach(e => supabase.from('official_training_entries').update({ position: e.position }).eq('id', e.id))
      return next
    })
  }

  async function handleMove(entryId: string, direction: 'up' | 'down') {
    const idx = entries.findIndex(e => e.id === entryId)
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= entries.length) return

    const next = [...entries]
    ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
    next[idx] = { ...next[idx], position: idx + 1 }
    next[swapIdx] = { ...next[swapIdx], position: swapIdx + 1 }
    setEntries(next)

    await Promise.all([
      supabase.from('official_training_entries').update({ position: idx + 1 }).eq('id', next[idx].id),
      supabase.from('official_training_entries').update({ position: swapIdx + 1 }).eq('id', next[swapIdx].id),
    ])
  }

  function handlePlayEntry(teamId: string, routineType: string) {
    const key = `${teamId}:${routineType}`
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (playingKey === key) { setPlayingKey(null); return }
    const path = musicRows.find(r => r.team_id === teamId && r.routine_type === routineType)?.music_path
    if (!path) return
    const audio = new Audio(path)
    audio.onended = () => setPlayingKey(null)
    audioRef.current = audio
    audio.play()
    setPlayingKey(key)
  }

  // ── loading state ──────────────────────────────────────────────────────────
  if (training === undefined) return (
    <div className="flex justify-center py-8">
      <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
    </div>
  )

  // ── no slot assigned ───────────────────────────────────────────────────────
  if (!training) return (
    <div className="py-8 text-center">
      <p className="text-sm text-slate-400">{t.trainingsNoSlot}</p>
    </div>
  )

  const competitionStart = addMins(training.warmup_start, training.warmup_duration_minutes)

  return (
    <div className="space-y-4">

      {/* schedule card */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t.trainingsSchedule}</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 w-36 shrink-0">{t.trainingsWarmup}</span>
            <span className="text-xs font-semibold text-slate-800">
              {training.training_date} · {training.warmup_start.slice(0, 5)} · {training.warmup_duration_minutes} min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 w-36 shrink-0">{t.trainingsCompetition}</span>
            <span className="text-xs font-semibold text-slate-800">
              {training.training_date} · {competitionStart} · {training.competition_duration_minutes} min
            </span>
          </div>
        </div>
        {training.locked && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mt-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            {t.trainingsLocked}
          </div>
        )}
      </div>

      {/* routine list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t.trainingsRoutineList}</p>
          {!training.locked && (
            <button
              onClick={() => setShowPicker(true)}
              disabled={isFull}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t.trainingsAddRoutine}
            </button>
          )}
        </div>

        {loadingEntries ? (
          <div className="flex justify-center py-6">
            <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">{t.trainingsNoEntries}</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <ol className="divide-y divide-slate-50">
              {entries.map((entry, idx) => (
                <li key={entry.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{entry.gymnast_display}</p>
                    <p className="text-xs text-slate-400">{entry.routine_type} · {fmtSecs(entry.duration)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                  {musicRows.some(r => r.team_id === entry.team_id && r.routine_type === entry.routine_type) && (() => {
                    const key = `${entry.team_id}:${entry.routine_type}`
                    const isPlaying = playingKey === key
                    return (
                      <button
                        onClick={() => handlePlayEntry(entry.team_id, entry.routine_type)}
                        className={['w-6 h-6 rounded flex items-center justify-center transition-colors', isPlaying ? 'text-blue-600 hover:text-blue-800' : 'text-slate-400 hover:text-blue-600'].join(' ')}
                        title={isPlaying ? (lang === 'es' ? 'Pausar' : 'Pause') : (lang === 'es' ? 'Escuchar música' : 'Play music')}
                      >
                        {isPlaying ? (
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                    )
                  })()}
                  {!training.locked && (<>
                      <button
                        onClick={() => handleMove(entry.id, 'up')}
                        disabled={idx === 0}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-20 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleMove(entry.id, 'down')}
                        disabled={idx === entries.length - 1}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-20 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemove(entry.id)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                  </>)}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* time bar */}
        {totalAvailableSecs > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={isNearFull ? 'font-semibold text-amber-600' : 'text-slate-400'}>
                {t.trainingsTimeUsed(fmtSecs(usedSecs), String(training.competition_duration_minutes))}
              </span>
              <span className="text-slate-300">{Math.round(usedPct)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={['h-full rounded-full transition-all', isFull ? 'bg-red-400' : isNearFull ? 'bg-amber-400' : 'bg-blue-400'].join(' ')}
                style={{ width: `${usedPct}%` }}
              />
            </div>
            {isFull && (
              <p className="text-xs font-semibold text-red-500">{t.trainingsTimeFull}</p>
            )}
            {!isFull && isNearFull && (
              <p className="text-xs font-semibold text-amber-600">{t.trainingsTimeWarning}</p>
            )}
          </div>
        )}
      </div>

      {/* picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <p className="text-sm font-semibold text-slate-800">{t.trainingsAddRoutine}</p>
              <button onClick={() => setShowPicker(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-3 space-y-3">
              {availableByTeam.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  {lang === 'es' ? 'No hay rutinas disponibles.' : 'No routines available.'}
                </p>
              ) : (
                availableByTeam.map(({ team, routineTypes }) => (
                  <div key={team.id}>
                    <p className="text-xs font-semibold text-slate-500 mb-1.5">{team.gymnast_display}</p>
                    <div className="flex flex-wrap gap-2">
                      {routineTypes.map(rt => {
                        const dur = routineDurationSec(rt, musicCounts[team.id] ?? 1)
                        const wouldExceed = usedSecs + dur > totalAvailableSecs && totalAvailableSecs > 0
                        return (
                          <button
                            key={rt}
                            onClick={async () => {
                              await handleAdd(team.id, rt)
                              setShowPicker(false)
                            }}
                            disabled={saving || wouldExceed}
                            className={[
                              'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all',
                              wouldExceed
                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
                            ].join(' ')}
                          >
                            {rt}
                            <span className="text-xs font-normal opacity-60">{fmtSecs(dur)}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-3 border-t border-slate-100 shrink-0">
              <button onClick={() => setShowPicker(false)}
                className="w-full text-sm font-semibold py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                {t.trainingsClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
