'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { Competition, Section, Panel, Session, SessionOrder, Team, Club, CompetitionEntry, ScoringMethod } from '@/components/admin/types'
import { resolveRoutineTypeForTeamInSession, type SessionMapRow } from '@/lib/openCombinadosBracket'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    notActive: 'The competition is not live yet.',
    notActiveSub: 'Session controls become available once the competition is marked as active.',
    section: 'Section',
    panel: 'Panel',
    waiting: 'Waiting',
    active: 'Live',
    finished: 'Finished',
    start: 'Start session',
    finish: 'Finish session',
    back: 'Back',
    confirmStart: 'Start this session? Judges will be able to submit scores.',
    confirmFinish: 'Mark this session as finished?',
    confirmBackToWaiting: 'Move this session back to waiting?',
    confirmBackToActive: 'Re-open this session as live?',
    noTeams: 'No teams assigned.',
    dropout: 'Dropout',
    noOrder: 'Starting order not published.',
    scoring: 'Scoring',
    noMusic: 'No music uploaded',
    inputConfig: 'Scoring input',
    keyboard: 'Keyboard',
    elements: 'Elements',
  },
  es: {
    notActive: 'La competición aún no está en curso.',
    notActiveSub: 'Los controles de sesión estarán disponibles cuando la competición esté activa.',
    section: 'Jornada',
    panel: 'Panel',
    waiting: 'En espera',
    active: 'En curso',
    finished: 'Finalizada',
    start: 'Iniciar sesión',
    finish: 'Finalizar sesión',
    back: 'Volver',
    confirmStart: '¿Iniciar esta sesión? Los jueces podrán enviar puntuaciones.',
    confirmFinish: '¿Marcar esta sesión como finalizada?',
    confirmBackToWaiting: '¿Volver esta sesión a espera?',
    confirmBackToActive: '¿Reabrir esta sesión en curso?',
    noTeams: 'Sin equipos asignados.',
    dropout: 'Baja',
    noOrder: 'Orden de salida no publicado.',
    scoring: 'Puntuando',
    noMusic: 'Sin música subida',
    inputConfig: 'Entrada de puntuación',
    keyboard: 'Teclado',
    elements: 'Elementos',
  },
}

// ─── types ────────────────────────────────────────────────────────────────────

const SESSION_BADGE: Record<Session['status'], string> = {
  waiting:  'bg-slate-100 text-slate-500',
  active:   'bg-blue-600 text-white',
  finished: 'bg-green-100 text-green-700',
}

// Keep one audio player per session so playback can persist across tab switches.
const sharedSessionAudio = new Map<string, HTMLAudioElement>()
const sharedSessionIdx = new Map<string, number>()
const sharedSessionPlaying = new Map<string, boolean>()

// ─── session card ─────────────────────────────────────────────────────────────

function SessionCard({
  lang, session, sessionOrders, globalTeams, clubs, entries,
  canControl, showStart, cjpCurrentTeamId, musicPaths, onStart, onFinish, onRevert, onConfigChange,
}: {
  lang: Lang
  session: Session
  sessionOrders: SessionOrder[]
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  canControl: boolean
  showStart: boolean
  cjpCurrentTeamId: string | null
  musicPaths: Record<string, string | null>
  onStart: () => void
  onFinish: () => void
  onRevert: () => void
  onConfigChange: (patch: Partial<Pick<Session, 'dj_method' | 'ej_method'>>) => void
}) {
  const t = T[lang]

  const matchingTeamIds = new Set(
    globalTeams
      .filter((tm) => tm.age_group === session.age_group && tm.category === session.category)
      .map((tm) => tm.id)
  )
  const droppedOutIds = new Set(
    entries.filter((e) => e.dropped_out && matchingTeamIds.has(e.team_id)).map((e) => e.team_id)
  )

  const orders = sessionOrders
    .filter((o) => o.session_id === session.id)
    .sort((a, b) => a.position - b.position)

  const orderedTeamIds = orders.map((o) => o.team_id)
  const hasOrder = orderedTeamIds.length > 0

  const statusLabel = t[session.status]
  const isActive   = session.status === 'active'
  const isWaiting  = session.status === 'waiting'
  const isFinished = session.status === 'finished'

  // ── music player state ────────────────────────────────────────────────────────
  const [currentIdx, setCurrentIdx] = useState(() => sharedSessionIdx.get(session.id) ?? 0)
  const [isPlaying,  setIsPlaying]  = useState(() => {
    const remembered = sharedSessionPlaying.get(session.id)
    if (typeof remembered === 'boolean') return remembered
    const existing = sharedSessionAudio.get(session.id)
    return !!existing && !existing.paused && !!existing.src
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentIdxRef = useRef(0)
  const isPlayingRef = useRef(false)
  const prevIsActiveRef = useRef(isActive)

  // Init audio element once (client-only)
  useEffect(() => {
    const existing = sharedSessionAudio.get(session.id)
    const audio = existing ?? new Audio()
    if (!existing) sharedSessionAudio.set(session.id, audio)
    audio.onended = () => setIsPlaying(false)
    audioRef.current = audio
    return () => {
      sharedSessionIdx.set(session.id, currentIdxRef.current)
      sharedSessionPlaying.set(session.id, isPlayingRef.current)
      audioRef.current = null
    }
  }, [session.id])

  useEffect(() => { currentIdxRef.current = currentIdx }, [currentIdx])
  useEffect(() => {
    isPlayingRef.current = isPlaying
    sharedSessionPlaying.set(session.id, isPlaying)
  }, [isPlaying, session.id])

  // Reset player only when status transitions into active (not on tab remount).
  useEffect(() => {
    if (!prevIsActiveRef.current && isActive) {
      setCurrentIdx(0)
      setIsPlaying(false)
      sharedSessionIdx.set(session.id, 0)
      sharedSessionPlaying.set(session.id, false)
      audioRef.current?.pause()
    }
    prevIsActiveRef.current = isActive
  }, [isActive])

  const activeTeamIds      = orderedTeamIds.filter(id => !droppedOutIds.has(id))
  const clampedIdx         = Math.min(currentIdx, Math.max(0, activeTeamIds.length - 1))
  const currentMusicTeamId = activeTeamIds[clampedIdx] ?? null
  const currentMusicUrl    = currentMusicTeamId ? (musicPaths[currentMusicTeamId] ?? null) : null

  // Sync audio src + play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!currentMusicUrl) {
      const rememberedPlaying = sharedSessionPlaying.get(session.id) ?? isPlayingRef.current
      const hasLoadedSource = audio.src.length > 0
      // Ignore transient remount/data-refresh gaps while an active session track is playing.
      if (isActive && rememberedPlaying && hasLoadedSource) return
      audio.pause()
      audio.src = ''
      if (isPlaying) setIsPlaying(false)
      return
    }

    if (audio.src !== currentMusicUrl) {
      audio.pause()
      audio.src = currentMusicUrl
      audio.load()
    }

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [currentMusicTeamId, isPlaying, currentMusicUrl, isActive, session.id]) // eslint-disable-line

  function prev() {
    audioRef.current?.pause()
    setCurrentIdx(i => {
      const next = Math.max(0, i - 1)
      sharedSessionIdx.set(session.id, next)
      return next
    })
  }

  function next() {
    if (clampedIdx < activeTeamIds.length - 1) {
      audioRef.current?.pause()
      setCurrentIdx(i => {
        const next = i + 1
        sharedSessionIdx.set(session.id, next)
        return next
      })
    } else {
      setIsPlaying(false)
    }
  }

  return (
    <div className={['rounded-2xl border overflow-hidden transition-all',
      isActive ? 'border-blue-300 shadow-sm shadow-blue-100' : 'border-slate-200'].join(' ')}>

      {/* header */}
      <div className={['px-4 py-3 flex items-center justify-between gap-3',
        isActive ? 'bg-blue-50' : 'bg-white'].join(' ')}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={['px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1', SESSION_BADGE[session.status]].join(' ')}>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />}
              {statusLabel}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800 truncate">{session.name}</p>
        </div>
        {canControl && (
          <div className="shrink-0">
            {isWaiting && showStart && (
              <button onClick={() => { if (confirm(t.confirmStart)) onStart() }}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                {t.start}
              </button>
            )}
            {isActive && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { if (confirm(t.confirmBackToWaiting)) onRevert() }}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                >
                  {t.back}
                </button>
                <button onClick={() => { if (confirm(t.confirmFinish)) onFinish() }}
                  className="px-3 py-1.5 text-xs font-semibold border border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition-all">
                  {t.finish}
                </button>
              </div>
            )}
            {isFinished && (
              <button
                onClick={() => { if (confirm(t.confirmBackToActive)) onRevert() }}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
              >
                {t.back}
              </button>
            )}
          </div>
        )}
      </div>

      {/* scoring input config */}
      {canControl && !isFinished && (
        <div className="border-t border-slate-100 px-3 py-2 bg-slate-50 flex flex-wrap gap-x-4 gap-y-1.5 items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide shrink-0">{t.inputConfig}</span>
          {(['dj', 'ej'] as const).map(role => {
            const method = session[`${role}_method`] as ScoringMethod | null
            return (
              <div key={role} className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase w-4">{role.toUpperCase()}</span>
                <div className="flex rounded-md overflow-hidden border border-slate-200 text-[10px] font-semibold">
                  {(['keyboard', 'elements'] as const).map(opt => (
                    <button key={opt}
                      onClick={() => {
                        const newMethod: ScoringMethod | null = method === opt ? null : opt
                        if (role === 'dj') onConfigChange({ dj_method: newMethod })
                        else onConfigChange({ ej_method: newMethod })
                      }}
                      className={['px-2 py-0.5 transition-colors',
                        method === opt
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-400 hover:text-slate-600'].join(' ')}>
                      {opt === 'keyboard' ? t.keyboard : t.elements}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* team list */}
      {(isActive || isFinished) && (
        <div className="border-t border-slate-100">
          {!hasOrder ? (
            <p className="px-4 py-3 text-xs text-slate-400 italic">{t.noOrder}</p>
          ) : orderedTeamIds.length === 0 ? (
            <p className="px-4 py-3 text-xs text-slate-400 italic">{t.noTeams}</p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {orderedTeamIds.map((teamId, idx) => {
                const team          = globalTeams.find((tm) => tm.id === teamId)
                const club          = team ? clubs.find((c) => c.id === team.club_id) : undefined
                const isDropout     = droppedOutIds.has(teamId)
                const isMusicActive = isActive && teamId === currentMusicTeamId && !isDropout
                const isCjpScoring  = isActive && teamId === cjpCurrentTeamId && !isDropout
                const musicUrl      = musicPaths[teamId] ?? null
                if (!team) return null

                return (
                  <li key={teamId}
                    className={['flex items-center gap-2.5 px-3 py-2.5 transition-colors',
                      isDropout ? 'opacity-40' : isMusicActive ? 'bg-blue-50' : ''].join(' ')}>

                    {/* position badge */}
                    <span className={['w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      isDropout    ? 'bg-slate-100 text-slate-400'
                      : isMusicActive ? 'bg-blue-600 text-white'
                      : isActive   ? 'bg-slate-100 text-slate-500'
                                   : 'bg-slate-100 text-slate-500'].join(' ')}>
                      {isMusicActive && isPlaying
                        ? <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        : idx + 1}
                    </span>

                    {/* team info */}
                    <div className="flex-1 min-w-0">
                      <p className={['text-sm font-medium truncate',
                        isDropout    ? 'line-through text-slate-400'
                        : isMusicActive ? 'text-blue-700 font-semibold'
                                      : 'text-slate-800'].join(' ')}>
                        {team.gymnast_display}
                      </p>
                      {club && <p className="text-xs text-slate-400 truncate">{club.club_name}</p>}
                    </div>

                    {/* CJP scoring indicator */}
                    {isCjpScoring && (
                      <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                        <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">{t.scoring}</span>
                      </span>
                    )}

                    {/* dropout badge */}
                    {isDropout && (
                      <span className="shrink-0 text-xs font-semibold bg-red-50 text-red-400 px-2 py-0.5 rounded-full">
                        {t.dropout}
                      </span>
                    )}

                    {/* music controls or warning — only on the active music row */}
                    {isMusicActive && (
                      musicUrl ? (
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <button onClick={prev} disabled={clampedIdx === 0}
                            className="w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 disabled:opacity-30 flex items-center justify-center transition-colors">
                            <svg className="w-3 h-3 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                            </svg>
                          </button>
                          <button onClick={() => setIsPlaying(p => !p)}
                            className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors shadow-sm active:scale-95">
                            {isPlaying ? (
                              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </button>
                          <button onClick={next} disabled={clampedIdx >= activeTeamIds.length - 1}
                            className="w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 disabled:opacity-30 flex items-center justify-center transition-colors">
                            <svg className="w-3 h-3 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
                          <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                          </svg>
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">{t.noMusic}</span>
                        </span>
                      )
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}

// ─── main tab ─────────────────────────────────────────────────────────────────

export default function CompetitionDayTab({
  lang, competition, sections, panels, sessions,
  sessionOrders, globalTeams, clubs, entries,
  onStartSession, onFinishSession, onRevertSession,
}: {
  lang: Lang
  competition: Competition
  sections: Section[]
  panels: Panel[]
  sessions: Session[]
  sessionOrders: SessionOrder[]
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  onStartSession: (sessionId: string) => void
  onFinishSession: (sessionId: string) => void
  onRevertSession: (sessionId: string) => void
}) {
  const t = T[lang]
  const supabase = createClient()
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? '')

  // sessionId → current_team_id (CJP indicator)
  const [cjpCurrentTeamIds, setCjpCurrentTeamIds] = useState<Record<string, string | null>>({})
  // team_id|routine_type → music public URL
  const [allMusicPaths, setAllMusicPaths] = useState<Array<{ team_id: string; routine_type: string; music_path: string | null }>>([])
  const [teamRoutineBySessionTeam, setTeamRoutineBySessionTeam] = useState<Record<string, 'Balance' | 'Dynamic' | 'Combined'>>({})

  // Local optimistic state for scoring config (so toggling reflects immediately without prop round-trip)
  const [localConfig, setLocalConfig] = useState<Record<string, Partial<Pick<Session, 'dj_method' | 'ej_method'>>>>({})

  const canControl       = competition.status === 'active'
  const activeSessions   = sessions.filter(s => s.status === 'active')
  const activeSessionKey = activeSessions.map(s => s.id).join(',')

  // ── fetch music + subscribe to CJP indicator ──────────────────────────────────
  useEffect(() => {
    if (!activeSessions.length) return

    const ids     = activeSessions.map(s => s.id)
    const teamIds = [...new Set(sessionOrders.filter(o => ids.includes(o.session_id)).map(o => o.team_id))]
    const sessionById = Object.fromEntries(activeSessions.map((s) => [s.id, s]))

    // fetch initial CJP current_team_id
    supabase.from('sessions').select('id, current_team_id').in('id', ids)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, string | null> = {}
        data.forEach((s: any) => { map[s.id] = s.current_team_id ?? null })
        setCjpCurrentTeamIds(map)
      })

    // fetch music URLs
    if (teamIds.length) {
      Promise.all([
        supabase.from('routine_music')
          .select('team_id, routine_type, music_path')
          .eq('competition_id', competition.id)
          .in('team_id', teamIds),
        supabase
          .from('open_combinados_phase_sessions')
          .select('phase_key, session_id')
          .eq('competition_id', competition.id)
          .in('session_id', ids),
        supabase
          .from('open_combinados_open_team_choices')
          .select('phase_key, team_id, selected_routine_type')
          .eq('competition_id', competition.id)
          .in('team_id', teamIds),
      ]).then(([musicRes, phaseRes, choiceRes]) => {
        setAllMusicPaths((musicRes.data ?? []) as typeof allMusicPaths)
        const mappings = (phaseRes.data ?? []) as SessionMapRow[]
        const openChoicesByPhaseAndTeam: Record<string, Record<string, 'Balance' | 'Dynamic' | 'Combined'>> = {}
        for (const row of (choiceRes.data ?? [])) {
          if (!openChoicesByPhaseAndTeam[row.phase_key]) openChoicesByPhaseAndTeam[row.phase_key] = {}
          openChoicesByPhaseAndTeam[row.phase_key][row.team_id] = row.selected_routine_type as 'Balance' | 'Dynamic' | 'Combined'
        }
        const nextMap: Record<string, 'Balance' | 'Dynamic' | 'Combined'> = {}
        for (const o of sessionOrders.filter((ord) => ids.includes(ord.session_id))) {
          const session = sessionById[o.session_id]
          if (!session) continue
          nextMap[`${o.session_id}:${o.team_id}`] = resolveRoutineTypeForTeamInSession({
            sessionId: o.session_id,
            sessionRoutineType: session.routine_type as 'Balance' | 'Dynamic' | 'Combined',
            teamId: o.team_id,
            mappings,
            openChoicesByPhaseAndTeam,
          })
        }
        setTeamRoutineBySessionTeam(nextMap)
      })
    }

    // subscribe to session updates (CJP indicator)
    const channels = activeSessions.map(session =>
      supabase.channel(`day-cjp-${session.id}`)
        .on('postgres_changes', {
          event: 'UPDATE', schema: 'public', table: 'sessions',
          filter: `id=eq.${session.id}`,
        }, (payload) => {
          const row = payload.new as { id: string; current_team_id: string | null }
          setCjpCurrentTeamIds(prev => ({ ...prev, [row.id]: row.current_team_id ?? null }))
        })
        .subscribe()
    )

    return () => { channels.forEach(ch => supabase.removeChannel(ch)) }
  }, [activeSessionKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (competition.status !== 'active' && competition.status !== 'finished') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-base font-semibold text-slate-600">{t.notActive}</p>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">{t.notActiveSub}</p>
      </div>
    )
  }

  const sectionSessions = sessions.filter((s) => s.section_id === activeSection)
  const multiPanel      = panels.length > 1

  function getMusicPaths(session: Session): Record<string, string | null> {
    const byTeamAndRoutine = new Map<string, string | null>()
    for (const row of allMusicPaths) byTeamAndRoutine.set(`${row.team_id}:${row.routine_type}`, row.music_path)
    const out: Record<string, string | null> = {}
    for (const o of sessionOrders.filter((ord) => ord.session_id === session.id)) {
      const routine = teamRoutineBySessionTeam[`${session.id}:${o.team_id}`] ?? session.routine_type
      out[o.team_id] = byTeamAndRoutine.get(`${o.team_id}:${routine}`) ?? null
    }
    return out
  }

  async function handleConfigChange(sessionId: string, patch: Partial<Pick<Session, 'dj_method' | 'ej_method'>>) {
    // Optimistic local update so the UI responds immediately
    setLocalConfig(prev => ({ ...prev, [sessionId]: { ...(prev[sessionId] ?? {}), ...patch } }))
    await supabase.from('sessions').update(patch as never).eq('id', sessionId)
  }

  return (
    <div>
      {/* section tabs */}
      {sections.length > 1 && (
        <div className="flex border-b border-slate-200 mb-6 -mx-4 px-4 overflow-x-auto">
          {sections.map((sec) => (
            <button key={sec.id} onClick={() => setActiveSection(sec.id)}
              className={['px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all',
                activeSection === sec.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600',
              ].join(' ')}>
              {sec.label ?? `${t.section} ${sec.section_number}`}
            </button>
          ))}
        </div>
      )}

      {!multiPanel ? (
        <div className="space-y-3">
          {sectionSessions
            .filter((s) => s.panel_id === panels[0].id)
            .sort((a, b) => a.order_index - b.order_index)
            .map((session) => { const s = { ...session, ...(localConfig[session.id] ?? {}) }; return (
              <SessionCard key={session.id} lang={lang} session={s}
                sessionOrders={sessionOrders} globalTeams={globalTeams}
                clubs={clubs} entries={entries} canControl={canControl}
                showStart={true}
                cjpCurrentTeamId={cjpCurrentTeamIds[session.id] ?? null}
                musicPaths={getMusicPaths(session)}
                onStart={() => onStartSession(session.id)}
                onFinish={() => onFinishSession(session.id)}
                onRevert={() => onRevertSession(session.id)}
                onConfigChange={(patch) => handleConfigChange(session.id, patch)} />
            ) })}
        </div>
      ) : (
        (() => {
          const orderIndices = [...new Set(sectionSessions.map(s => s.order_index))].sort((a, b) => a - b)
          return (
            <div className="space-y-4">
              {orderIndices.map(idx => {
                const rowSessions = panels
                  .map(p => sectionSessions.find(s => s.panel_id === p.id && s.order_index === idx))
                  .filter(Boolean) as Session[]
                const allWaiting  = rowSessions.every(s => s.status === 'waiting')
                const allActive   = rowSessions.every(s => s.status === 'active')
                const allFinished = rowSessions.every(s => s.status === 'finished')

                return (
                  <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">#{idx}</span>
                      {canControl && !allFinished && (
                        <div className="flex gap-2">
                          {allWaiting && (
                            <button
                              onClick={() => { if (confirm(t.confirmStart)) rowSessions.forEach(s => onStartSession(s.id)) }}
                              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all">
                              ▶ {t.start}
                            </button>
                          )}
                          {allActive && (
                            <button
                              onClick={() => { if (confirm(t.confirmFinish)) rowSessions.forEach(s => onFinishSession(s.id)) }}
                              className="flex items-center gap-1.5 px-3 py-1 bg-slate-700 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-all">
                              ✓ {t.finish}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`grid gap-0 ${panels.length > 1 ? 'grid-cols-2 divide-x divide-slate-100' : ''}`}>
                      {rowSessions.map(session => { const s = { ...session, ...(localConfig[session.id] ?? {}) }; return (
                        <SessionCard key={session.id} lang={lang} session={s}
                          sessionOrders={sessionOrders} globalTeams={globalTeams}
                          clubs={clubs} entries={entries} canControl={false}
                          showStart={false}
                          cjpCurrentTeamId={cjpCurrentTeamIds[session.id] ?? null}
                          musicPaths={getMusicPaths(session)}
                          onStart={() => {}}
                          onFinish={() => {}}
                          onRevert={() => {}}
                          onConfigChange={(patch) => handleConfigChange(session.id, patch)} />
                      ) })}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()
      )}
    </div>
  )
}
