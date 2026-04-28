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
    noStateSub:   'Queue a result below to start displaying scores.',
    currentlyOn:  'Currently on TV',
    idle:         'Idle',
    hidden:       'Score hidden',
    revealed:     'Score revealed',
    reveal:       'Reveal score',
    hide:         'Hide score',
    queue:        'Queue',
    queued:       'Queued',
    results:      'Approved results',
    noResults:    'No approved results yet.',
    autoQueue:    'Auto-queue new results',
    balance:      'Balance', dynamic: 'Dynamic', combined: 'Combined',
    prov:         'Prov.',
    final:        'Final',
    team:         'Team',
  },
  es: {
    tvUrl:        'URL para la TV',
    copy:         'Copiar',
    copied:       '¡Copiado!',
    open:         'Abrir TV',
    noState:      'No hay sesión de TV activa.',
    noStateSub:   'Pon en cola un resultado para empezar a mostrar puntuaciones.',
    currentlyOn:  'En pantalla ahora',
    idle:         'En espera',
    hidden:       'Puntuación oculta',
    revealed:     'Puntuación revelada',
    reveal:       'Revelar puntuación',
    hide:         'Ocultar puntuación',
    queue:        'Poner en cola',
    queued:       'En cola',
    results:      'Resultados aprobados',
    noResults:    'Aún no hay resultados aprobados.',
    autoQueue:    'Poner en cola automáticamente',
    balance:      'Equilibrio', dynamic: 'Dinámico', combined: 'Combinado',
    prov:         'Prov.',
    final:        'Final',
    team:         'Equipo',
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
  age_group: string
  category: string
  routine_type: string
  gymnast_display: string
  updated_at: string
}

// ─── component ────────────────────────────────────────────────────────────────

export default function TVTab({
  lang, competition, sessions, globalTeams, clubs, entries,
}: {
  lang: Lang
  competition: Competition
  sessions: Session[]
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
}) {
  const t = T[lang]
  const supabase = createClient()

  const [tvUrl, setTvUrl] = useState('')
  const [copied, setCopied]         = useState(false)
  const [tvState, setTvState]       = useState<TVState | null>(null)
  const [results, setResults]       = useState<ApprovedResult[]>([])
  const [autoQueue, setAutoQueue]   = useState(true)
  const [busy, setBusy]             = useState(false)

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

  // ── helpers ──────────────────────────────────────────────────────────────────

  function teamName(teamId: string): string {
    return globalTeams.find((t) => t.id === teamId)?.gymnast_display ?? teamId
  }

  function sessionInfo(sessionId: string) {
    return sessions.find((s) => s.id === sessionId)
  }

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

    const enriched: ApprovedResult[] = data.map((r) => {
      const sess = sessionInfo(r.session_id)
      return {
        session_id:      r.session_id,
        team_id:         r.team_id,
        final_score:     r.final_score,
        status:          r.status,
        age_group:       sess?.age_group  ?? '',
        category:        sess?.category   ?? '',
        routine_type:    sess?.routine_type ?? '',
        gymnast_display: teamName(r.team_id),
        updated_at:      r.updated_at,
      }
    })
    setResults(enriched)
    return enriched
  }, [sessions, globalTeams]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── on mount: load state + results ──────────────────────────────────────────

  useEffect(() => {
    fetchTvState()
    fetchResults()
  }, [fetchTvState, fetchResults])

  // ── subscribe to tv_state changes + new approved results ─────────────────────

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
        // Auto-queue latest result if enabled
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

  // ── current queued display ───────────────────────────────────────────────────

  const queuedResult = tvState?.session_id && tvState?.team_id
    ? results.find((r) => r.session_id === tvState.session_id && r.team_id === tvState.team_id)
    : null

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

        {/* reveal / hide button — only when something is queued */}
        {queuedResult && (
          <div className="p-3 border-t border-slate-200">
            <button
              disabled={busy}
              onClick={() => setRevealed(!tvState?.revealed)}
              className={[
                'w-full py-3 rounded-xl text-base font-bold transition-colors disabled:opacity-50',
                tvState?.revealed
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700',
              ].join(' ')}
            >
              {tvState?.revealed ? t.hide : t.reveal}
            </button>
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

      {/* Approved results list */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.results}</p>
        </div>

        {results.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">{t.noResults}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {results.map((r) => {
              const isQueued = tvState?.session_id === r.session_id && tvState?.team_id === r.team_id
              return (
                <li
                  key={`${r.session_id}-${r.team_id}`}
                  className={[
                    'flex items-center justify-between gap-3 px-4 py-3',
                    isQueued ? 'bg-blue-50' : 'hover:bg-slate-50',
                  ].join(' ')}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{r.gymnast_display}</p>
                    <p className="text-xs text-slate-500">
                      {categoryLabel(r.category, lang)}
                      {' · '}
                      {routineLabel(r.routine_type)}
                      {' · '}
                      {r.age_group}
                    </p>
                  </div>
                  <span className="tabular-nums font-bold text-slate-700 text-sm shrink-0">
                    {r.final_score?.toFixed(3) ?? '—'}
                  </span>
                  <button
                    disabled={busy || isQueued}
                    onClick={() => queueResult(r.session_id, r.team_id, false)}
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
