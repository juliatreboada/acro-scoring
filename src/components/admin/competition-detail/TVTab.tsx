'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/aj-scoring/types'
import type { Competition, Session, Team, Club, CompetitionEntry } from '@/components/admin/types'
import { categoryLabel } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    tvUrl:        'TV URL',
    copy:         'Copy',
    copied:       'Copied!',
    open:         'Open TV',
    noState:      'No TV session active.',
    noStateSub:   'Queue a participant below to start displaying on screen.',
    currentlyOn:  'Currently on TV',
    idle:         'Idle',
    hidden:       'Score hidden',
    revealed:     'Score revealed',
    reveal:       'Reveal score',
    hide:         'Hide score',
    queue:        'Queue',
    queued:       'Queued',
    results:      'Participants',
    noResults:    'No sessions defined for this competition.',
    autoQueue:    'Auto-queue new results',
    balance:      'Balance', dynamic: 'Dynamic', combined: 'Combined',
    prov:         'Prov.',
    final:        'Final',
    team:         'Team',
    waitingScore: 'Waiting for judge score',
    dropout:      'Dropout',
  },
  es: {
    tvUrl:        'URL para la TV',
    copy:         'Copiar',
    copied:       '¡Copiado!',
    open:         'Abrir TV',
    noState:      'No hay sesión de TV activa.',
    noStateSub:   'Pon en cola a un participante para empezar a mostrar en pantalla.',
    currentlyOn:  'En pantalla ahora',
    idle:         'En espera',
    hidden:       'Puntuación oculta',
    revealed:     'Puntuación revelada',
    reveal:       'Revelar puntuación',
    hide:         'Ocultar puntuación',
    queue:        'Poner en cola',
    queued:       'En cola',
    results:      'Participantes',
    noResults:    'No hay sesiones definidas para esta competición.',
    autoQueue:    'Poner en cola automáticamente',
    balance:      'Equilibrio', dynamic: 'Dinámico', combined: 'Combinado',
    prov:         'Prov.',
    final:        'Final',
    team:         'Equipo',
    waitingScore: 'Esperando puntuación del juez',
    dropout:      'Baja',
  },
}

// ─── types ────────────────────────────────────────────────────────────────────

type TVState = {
  id: string
  session_id: string | null
  team_id: string | null
  revealed: boolean
}

type ApprovedResult = {
  session_id: string
  team_id: string
  final_score: number | null
  status: string
}

type SessionOrderRow = { session_id: string; team_id: string; position: number }

type ParticipantSlot = {
  session_id: string
  team_id: string
  routine_type: string
  category: string
  age_group: string
  gymnast_display: string
  dorsal: number | null
  photo_url: string | null
  club_name: string
  result: ApprovedResult | null
  is_dropout: boolean
}

// ─── component ────────────────────────────────────────────────────────────────

export default function TVTab({
  lang, competition, sessions, globalTeams, clubs, entries, agLabels,
}: {
  lang: Lang
  competition: Competition
  sessions: Session[]
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  agLabels: Record<string, string>
}) {
  const t = T[lang]
  const supabase = createClient()

  const [tvUrl, setTvUrl]             = useState('')
  const [copied, setCopied]           = useState(false)
  const [tvState, setTvState]         = useState<TVState | null>(null)
  const [results, setResults]         = useState<ApprovedResult[]>([])
  const [sessionOrders, setSessionOrders] = useState<SessionOrderRow[]>([])
  const [autoQueue, setAutoQueue]     = useState(true)
  const [busy, setBusy]               = useState(false)

  const previewRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(0.3)
  const IFRAME_W = 1280
  const IFRAME_H = 720

  const routineLabel = (rt: string) =>
    ({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined }[rt] ?? rt)

  // Build the TV URL once on client
  useEffect(() => {
    setTvUrl(`${window.location.origin}/tv/${competition.id}`)
  }, [competition.id])

  // Scale the preview iframe to fill its container
  useEffect(() => {
    if (!previewRef.current) return
    const ro = new ResizeObserver((entries) => {
      setPreviewScale(entries[0].contentRect.width / IFRAME_W)
    })
    ro.observe(previewRef.current)
    return () => ro.disconnect()
  }, [])

  // ── fetch approved results ───────────────────────────────────────────────────

  const fetchResults = useCallback(async () => {
    const sessionIds = sessions.map((s) => s.id)
    if (sessionIds.length === 0) return

    const { data } = await supabase
      .from('routine_results')
      .select('session_id, team_id, final_score, status, updated_at')
      .in('session_id', sessionIds)
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })

    if (!data) return
    const mapped: ApprovedResult[] = data.map((r) => ({
      session_id:  r.session_id,
      team_id:     r.team_id,
      final_score: r.final_score,
      status:      r.status,
    }))
    setResults(mapped)
    return mapped
  }, [sessions]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetch session orders ─────────────────────────────────────────────────────

  const fetchSessionOrders = useCallback(async () => {
    const sessionIds = sessions.map((s) => s.id)
    if (sessionIds.length === 0) return
    const { data } = await supabase
      .from('session_orders')
      .select('session_id,team_id,position')
      .in('session_id', sessionIds)
    if (data) setSessionOrders(data as unknown as SessionOrderRow[])
  }, [sessions]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetch tv_state ───────────────────────────────────────────────────────────

  const fetchTvState = useCallback(async (): Promise<TVState | null> => {
    const { data } = await supabase
      .from('tv_state')
      .select('id, session_id, team_id, revealed')
      .eq('competition_id', competition.id)
      .maybeSingle()
    const state: TVState | null = data
      ? { id: data.id, session_id: data.session_id, team_id: data.team_id, revealed: data.revealed }
      : null
    setTvState(state)
    return state
  }, [competition.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── on mount ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchTvState()
    fetchResults()
    fetchSessionOrders()
  }, [fetchTvState, fetchResults, fetchSessionOrders])

  // ── realtime subscriptions ───────────────────────────────────────────────────

  useEffect(() => {
    const tvCh = supabase
      .channel(`tv-admin-state-${competition.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'tv_state',
        filter: `competition_id=eq.${competition.id}`,
      }, () => { fetchTvState() })
      .subscribe()

    const resultsCh = supabase
      .channel(`tv-admin-results-${competition.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'routine_results',
      }, async () => {
        const enriched = await fetchResults()
        if (autoQueue && enriched && enriched.length > 0) {
          const latest = enriched[0]
          await queueResult(latest.session_id, latest.team_id, false)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(tvCh)
      supabase.removeChannel(resultsCh)
    }
  }, [competition.id, autoQueue, fetchTvState, fetchResults]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── actions ──────────────────────────────────────────────────────────────────

  async function queueResult(sessionId: string, teamId: string, revealed: boolean) {
    setBusy(true)
    await supabase.from('tv_state').upsert({
      competition_id: competition.id,
      session_id:     sessionId,
      team_id:        teamId,
      revealed,
      updated_at:     new Date().toISOString(),
    }, { onConflict: 'competition_id' })
    await fetchTvState()
    setBusy(false)
  }

  async function setRevealed(value: boolean) {
    if (!tvState) return
    setBusy(true)
    await supabase
      .from('tv_state')
      .update({ revealed: value, updated_at: new Date().toISOString() })
      .eq('competition_id', competition.id)
    await fetchTvState()
    setBusy(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(tvUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── derived state ─────────────────────────────────────────────────────────────

  // Is anything queued on the TV right now?
  const isAnythingQueued = !!(tvState?.session_id && tvState?.team_id)

  // Does the currently queued team have an approved score? (needed for reveal)
  const queuedHasScore = isAnythingQueued
    ? results.some(r => r.session_id === tvState!.session_id && r.team_id === tvState!.team_id)
    : false

  // ── build ordered participant list ────────────────────────────────────────────

  const droppedTeamIds = new Set(entries.filter(e => e.dropped_out).map(e => e.team_id))

  const participants: ParticipantSlot[] = []
  const sortedSessions = [...sessions].sort((a, b) => a.order_index - b.order_index)

  for (const session of sortedSessions) {
    const matchingTeams = globalTeams.filter(
      t => t.age_group === session.age_group && t.category === session.category
    )
    const orders = sessionOrders
      .filter(o => o.session_id === session.id)
      .sort((a, b) => a.position - b.position)

    const orderedTeams: Team[] = []
    for (const o of orders) {
      const team = matchingTeams.find(tm => tm.id === o.team_id)
      if (team && !orderedTeams.find(tm => tm.id === team.id)) orderedTeams.push(team)
    }
    for (const team of matchingTeams) {
      if (!orderedTeams.find(tm => tm.id === team.id)) orderedTeams.push(team)
    }

    for (const team of orderedTeams) {
      const club = clubs.find(c => c.id === team.club_id)
      const entry = entries.find(e => e.team_id === team.id)
      participants.push({
        session_id:      session.id,
        team_id:         team.id,
        routine_type:    session.routine_type,
        category:        session.category,
        age_group:       session.age_group,
        gymnast_display: team.gymnast_display,
        dorsal:          entry?.dorsal ?? null,
        photo_url:       team.photo_url,
        club_name:       club?.club_name ?? '',
        result:          results.find(r => r.session_id === session.id && r.team_id === team.id) ?? null,
        is_dropout:      droppedTeamIds.has(team.id),
      })
    }
  }

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 py-4">

      {/* TV URL row */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{t.tvUrl}</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 truncate">
            {tvUrl}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {copied ? t.copied : t.copy}
          </button>
          <a
            href={tvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-3 py-2 text-sm font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            {t.open}
          </a>
        </div>
      </div>

      {/* Current TV state */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.currentlyOn}</p>
        </div>

        {/* live TV preview */}
        <div
          ref={previewRef}
          className="w-full overflow-hidden bg-slate-950"
          style={{ height: IFRAME_H * previewScale }}
        >
          {tvUrl && (
            <iframe
              src={`${tvUrl}?lang=${lang}`}
              style={{
                width: IFRAME_W,
                height: IFRAME_H,
                border: 'none',
                pointerEvents: 'none',
                transformOrigin: 'top left',
                transform: `scale(${previewScale})`,
              }}
            />
          )}
        </div>

        {/* reveal / hide — shown whenever something is queued */}
        {isAnythingQueued && (
          <div className="p-3 border-t border-slate-200 space-y-2">
            <button
              disabled={busy || !queuedHasScore}
              onClick={() => setRevealed(!tvState?.revealed)}
              className={[
                'w-full py-3 rounded-xl text-base font-bold transition-colors disabled:opacity-40',
                tvState?.revealed
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700',
              ].join(' ')}
            >
              {tvState?.revealed ? t.hide : t.reveal}
            </button>
            {!queuedHasScore && (
              <p className="text-xs text-slate-400 text-center">{t.waitingScore}</p>
            )}
          </div>
        )}
      </div>

      {/* Auto-queue toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => setAutoQueue((v) => !v)}
          className={[
            'w-10 h-6 rounded-full transition-colors relative shrink-0',
            autoQueue ? 'bg-blue-600' : 'bg-slate-200',
          ].join(' ')}
        >
          <span className={[
            'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
            autoQueue ? 'left-5' : 'left-1',
          ].join(' ')} />
        </div>
        <span className="text-sm text-slate-600">{t.autoQueue}</span>
      </label>

      {/* Participant list */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.results}</p>
        </div>

        {participants.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">{t.noResults}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {participants.map((p) => {
              const isQueued = tvState?.session_id === p.session_id && tvState?.team_id === p.team_id
              const hasScore = p.result !== null
              return (
                <li
                  key={`${p.session_id}-${p.team_id}`}
                  className={[
                    'flex items-center gap-3 px-4 py-3',
                    isQueued ? 'bg-blue-50' : p.is_dropout ? 'opacity-50' : 'hover:bg-slate-50',
                  ].join(' ')}
                >
                  {/* photo */}
                  {p.photo_url ? (
                    <img src={p.photo_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0 flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    </div>
                  )}

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {p.dorsal != null && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-white shrink-0">
                          #{p.dorsal}
                        </span>
                      )}
                      <p className={['text-sm font-medium truncate', p.is_dropout ? 'line-through text-slate-400' : 'text-slate-800'].join(' ')}>
                        {p.gymnast_display}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {p.club_name}
                      {' · '}
                      {categoryLabel(p.category, lang)}
                      {' · '}
                      {routineLabel(p.routine_type)}
                      {' · '}
                      {agLabels[p.age_group] ?? p.age_group}
                    </p>
                  </div>

                  {/* score or waiting indicator */}
                  {hasScore ? (
                    <span className="tabular-nums font-bold text-slate-700 text-sm shrink-0">
                      {p.result!.final_score?.toFixed(3) ?? '—'}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300 shrink-0 w-14 text-right">—</span>
                  )}

                  {/* queue button */}
                  <button
                    disabled={busy || isQueued || p.is_dropout}
                    onClick={() => queueResult(p.session_id, p.team_id, false)}
                    className={[
                      'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50',
                      isQueued
                        ? 'bg-blue-100 text-blue-700 border-blue-200 cursor-default'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400',
                    ].join(' ')}
                  >
                    {isQueued ? t.queued : t.queue}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
