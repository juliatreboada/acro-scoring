'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { Competition, Session, Team, Club, CompetitionEntry, Section, Panel, SessionOrder } from '@/components/admin/types'
import { orderedTimelinePerformances } from '@/lib/timelinePerformances'
import { categoryLabel } from '@/components/admin/types'
import { TV_SPONSOR_BUCKET, parseTvSponsorVideos, type TvSponsorClip } from '@/lib/tvSponsorVideos'
import { useT } from '@/lib/useT'
import { DEFAULT_RANKING_CONFIG, type TvRankingConfig, type TvRankingSlot } from '@/lib/tvRankingConfig'

// ─── types ────────────────────────────────────────────────────────────────────

type TVState = {
  id: string
  session_id: string | null
  team_id: string | null
  revealed: boolean
  sponsor_reel_enabled: boolean
  sponsor_playlist_index: number
  mode: 'score' | 'ranking'
  ranking_config: TvRankingConfig | null
}

type ApprovedResult = {
  session_id: string
  team_id: string
  final_score: number | null
  status: string
}

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

function participantFromSessionTeam(
  session: Session,
  team: Team,
  clubs: Club[],
  entries: CompetitionEntry[],
  results: ApprovedResult[],
): ParticipantSlot {
  const club = clubs.find(c => c.id === team.club_id)
  const entry = entries.find(e => e.team_id === team.id)
  return {
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
    is_dropout:      entry?.dropped_out ?? false,
  }
}

/** Dropouts excluded from timeline slots; append in panel → session → starting-order order. */
function appendSectionDropoutSlots(
  sectionSessions: Session[],
  panels: Panel[],
  sessionOrders: SessionOrder[],
  globalTeams: Team[],
  droppedTeamIds: Set<string>,
  added: Set<string>,
  clubs: Club[],
  entries: CompetitionEntry[],
  results: ApprovedResult[],
  out: ParticipantSlot[],
) {
  const sortedPanels = [...panels].sort((a, b) => a.panel_number - b.panel_number)
  for (const panel of sortedPanels) {
    const panelSessions = sectionSessions
      .filter(s => s.panel_id === panel.id)
      .sort((a, b) => a.order_index - b.order_index)
    for (const session of panelSessions) {
      const matchingTeams = globalTeams.filter(
        t => t.age_group === session.age_group && t.category === session.category,
      )
      const orders = sessionOrders
        .filter(o => o.session_id === session.id)
        .sort((a, b) => a.position - b.position)
      const orderedTeams: Team[] = []
      for (const o of orders) {
        const team = matchingTeams.find(tm => tm.id === o.team_id)
        if (team && !orderedTeams.some(tm => tm.id === team.id)) orderedTeams.push(team)
      }
      for (const team of matchingTeams) {
        if (!orderedTeams.some(tm => tm.id === team.id)) orderedTeams.push(team)
      }
      for (const team of orderedTeams) {
        if (!droppedTeamIds.has(team.id)) continue
        const key = `${session.id}:${team.id}`
        if (added.has(key)) continue
        added.add(key)
        out.push(participantFromSessionTeam(session, team, clubs, entries, results))
      }
    }
  }
}

export default function TVTab({
  lang, competition, sections, panels, sessions, sessionOrders, globalTeams, clubs, entries, agLabels,
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
  agLabels: Record<string, string>
}) {
  const t = useT('TVTab', lang)
  const supabase = createClient()

  const [tvUrl, setTvUrl]             = useState('')
  const [copied, setCopied]           = useState(false)
  const [tvState, setTvState]         = useState<TVState | null>(null)
  const [results, setResults]         = useState<ApprovedResult[]>([])
  const [autoQueue, setAutoQueue]     = useState(true)
  const [busy, setBusy]               = useState(false)
  const [sponsorClips, setSponsorClips] = useState<TvSponsorClip[]>([])
  const sponsorFileRef = useRef<HTMLInputElement>(null)
  const activeItemRef = useRef<HTMLLIElement>(null)

  const previewRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(0.3)
  const rankingPreviewRef = useRef<HTMLDivElement>(null)
  const [rankingPreviewScale, setRankingPreviewScale] = useState(0.3)
  const IFRAME_W = 1280
  const IFRAME_H = 720

  // ── ranking config state ─────────────────────────────────────────────────────
  const [rankingConfig, setRankingConfig] = useState<TvRankingConfig>(DEFAULT_RANKING_CONFIG)
  const [rankingDirty, setRankingDirty] = useState(false)
  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set())
  const [mergeLabel, setMergeLabel] = useState('')
  const [showMergeInput, setShowMergeInput] = useState(false)
  const [expandedHints, setExpandedHints] = useState<Set<string>>(new Set())

  function toggleSlotSelect(id: string) {
    setSelectedSlotIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
    setShowMergeInput(false)
    setMergeLabel('')
  }

  function handleMergeSlots() {
    const selected = rankingConfig.slots.filter(s => selectedSlotIds.has(s.id))
    const combinedIds = [...new Set(selected.flatMap(s => s.session_ids))]
    const newSlot: TvRankingSlot = {
      id: `custom_${Date.now()}`,
      label: mergeLabel.trim() || selected.map(s => s.label).join(' + '),
      session_ids: combinedIds,
      enabled: true,
      source_slot_labels: selected.map(s => s.label),
    }
    // Keep all original slots — just append the new combined one
    const slots = [...rankingConfig.slots, newSlot]
    setRankingConfig(c => ({ ...c, slots }))
    setRankingDirty(true)
    setSelectedSlotIds(new Set())
    setShowMergeInput(false)
    setMergeLabel('')
  }

  function deleteSlot(id: string) {
    setRankingConfig(c => ({ ...c, slots: c.slots.filter(s => s.id !== id) }))
    setSelectedSlotIds(prev => { const n = new Set(prev); n.delete(id); return n })
    setRankingDirty(true)
  }

  const routineLabel = (rt: string) =>
    (({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined } as Record<string, string>)[rt] ?? rt)

  // Build the TV URL once on client
  useEffect(() => {
    setTvUrl(`${window.location.origin}/tv/${competition.slug}`)
  }, [competition.slug])

  // Scale the score preview iframe to fill its container
  useEffect(() => {
    if (!previewRef.current) return
    const ro = new ResizeObserver((entries) => {
      setPreviewScale(entries[0].contentRect.width / IFRAME_W)
    })
    ro.observe(previewRef.current)
    return () => ro.disconnect()
  }, [])

  // Scale the ranking preview iframe to fill its container
  useEffect(() => {
    if (!rankingPreviewRef.current) return
    const ro = new ResizeObserver((entries) => {
      setRankingPreviewScale(entries[0].contentRect.width / IFRAME_W)
    })
    ro.observe(rankingPreviewRef.current)
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
      .in('status', ['approved', 'provisional'])
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

  // ── fetch tv_state ───────────────────────────────────────────────────────────

  const fetchTvState = useCallback(async (): Promise<TVState | null> => {
    const { data } = await supabase
      .from('tv_state')
      .select('id, session_id, team_id, revealed, sponsor_reel_enabled, sponsor_playlist_index, mode, ranking_config')
      .eq('competition_id', competition.id)
      .maybeSingle()
    const state: TVState | null = data
      ? {
          id: data.id,
          session_id: data.session_id,
          team_id: data.team_id,
          revealed: data.revealed,
          sponsor_reel_enabled: data.sponsor_reel_enabled ?? false,
          sponsor_playlist_index: typeof data.sponsor_playlist_index === 'number' ? data.sponsor_playlist_index : 0,
          mode: (data.mode as 'score' | 'ranking') ?? 'score',
          ranking_config: (data.ranking_config as TvRankingConfig | null) ?? null,
        }
      : null
    setTvState(state)
    if (state?.ranking_config) {
      setRankingConfig(state.ranking_config)
    }
    return state
  }, [competition.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSponsorClips = useCallback(async () => {
    const { data } = await supabase
      .from('competitions')
      .select('tv_sponsor_videos')
      .eq('id', competition.id)
      .single()
    if (data?.tv_sponsor_videos != null) {
      setSponsorClips(parseTvSponsorVideos(data.tv_sponsor_videos))
    }
  }, [competition.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── on mount ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchTvState()
    fetchResults()
    fetchSponsorClips()
  }, [fetchTvState, fetchResults, fetchSponsorClips])

  // Scroll to active/next item whenever results change
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [results])

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

  /** Return the public TV to the idle poster + "waiting" screen (no team queued). */
  async function clearTvQueue() {
    setBusy(true)
    await supabase.from('tv_state').upsert(
      {
        competition_id: competition.id,
        session_id:     null,
        team_id:        null,
        revealed:       false,
        updated_at:     new Date().toISOString(),
      },
      { onConflict: 'competition_id' },
    )
    await fetchTvState()
    setBusy(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(tvUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function persistSponsorClips(clips: TvSponsorClip[]) {
    const { error } = await supabase.from('competitions').update({ tv_sponsor_videos: clips }).eq('id', competition.id)
    if (!error) setSponsorClips(clips)
  }

  async function setSponsorReelEnabled(enabled: boolean) {
    setBusy(true)
    await supabase.from('tv_state').upsert(
      {
        competition_id: competition.id,
        sponsor_reel_enabled: enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'competition_id' },
    )
    await fetchTvState()
    setBusy(false)
  }

  async function onPickSponsorFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || busy) return
    const lower = file.name.toLowerCase()
    if (!lower.endsWith('.mp4') && !lower.endsWith('.webm')) {
      e.target.value = ''
      return
    }
    setBusy(true)
    try {
      const ext = lower.endsWith('.webm') ? 'webm' : 'mp4'
      const clipId = crypto.randomUUID()
      const path = `${competition.id}/${clipId}.${ext}`
      const { error: upErr } = await supabase.storage.from(TV_SPONSOR_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (upErr) throw upErr
      const clip: TvSponsorClip = { id: clipId, path, label: file.name.replace(/\.[^.]+$/, '') }
      const next = [...sponsorClips, clip]
      await persistSponsorClips(next)
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  async function removeSponsorClip(clip: TvSponsorClip) {
    if (busy) return
    setBusy(true)
    try {
      await supabase.storage.from(TV_SPONSOR_BUCKET).remove([clip.path])
      const next = sponsorClips.filter((c) => c.id !== clip.id)
      await persistSponsorClips(next)
      const maxIdx = Math.max(0, next.length - 1)
      if (tvState && tvState.sponsor_playlist_index > maxIdx) {
        await supabase
          .from('tv_state')
          .update({ sponsor_playlist_index: 0, updated_at: new Date().toISOString() })
          .eq('competition_id', competition.id)
        await fetchTvState()
      }
    } finally {
      setBusy(false)
    }
  }

  async function moveSponsorClip(index: number, dir: -1 | 1) {
    const j = index + dir
    if (j < 0 || j >= sponsorClips.length || busy) return
    setBusy(true)
    try {
      const next = [...sponsorClips]
      const tmp = next[index]
      next[index] = next[j]!
      next[j] = tmp!
      await persistSponsorClips(next)
    } finally {
      setBusy(false)
    }
  }

  // ── mode switching ───────────────────────────────────────────────────────────

  async function handleSwitchMode() {
    const newMode = tvState?.mode === 'ranking' ? 'score' : 'ranking'
    await supabase.from('tv_state').update({ mode: newMode }).eq('competition_id', competition.id)
    fetchTvState()
  }

  async function saveRankingConfig(cfg: TvRankingConfig) {
    await supabase.from('tv_state').upsert(
      { competition_id: competition.id, ranking_config: cfg as any },
      { onConflict: 'competition_id' },
    )
    setRankingConfig(cfg)
    setRankingDirty(false)
  }

  // Auto-save ranking config 1.5 s after last change
  useEffect(() => {
    if (!rankingDirty) return
    const timer = setTimeout(() => { void saveRankingConfig(rankingConfig) }, 1500)
    return () => clearTimeout(timer)
  }, [rankingConfig, rankingDirty]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── auto-generate slots from sessions ────────────────────────────────────────

  const BRACKET_PHASE_LABELS: Record<string, string> = {
    open_quarter:       'Cuartos de Final OPEN',
    open_semi:          'Semifinal OPEN',
    open_final:         'Final OPEN',
    combinados_semi:    'Semifinal COMBINADOS',
    combinados_final:   'Final COMBINADOS',
  }

  const autoSlots = useMemo((): TvRankingSlot[] => {
    const qualGroups  = new Map<string, { label: string; session_ids: string[] }>()
    const bracketSlots: TvRankingSlot[] = []

    for (const s of sessions) {
      const routineL = (({ Balance: 'Balance', Dynamic: 'Dinámica', Combined: 'Combinada' } as Record<string, string>)[s.routine_type]) ?? s.routine_type
      const agLabel  = agLabels[s.age_group] ?? s.age_group

      if (s.bracket_phase) {
        const phaseLabel = BRACKET_PHASE_LABELS[s.bracket_phase] ?? s.bracket_phase
        bracketSlots.push({
          id:          `bracket_${s.id}`,
          label:       `${phaseLabel} · ${agLabel} ${categoryLabel(s.category, lang)} · ${routineL}`,
          session_ids: [s.id],
          enabled:     true,
        })
        continue
      }

      const key = s.ranking_merge_group_id
        ? `merge_${s.ranking_merge_group_id}_${s.routine_type}`
        : `${s.age_group}_${s.category}_${s.routine_type}`
      const label = `${agLabel} ${categoryLabel(s.category, lang)} · ${routineL}`
      if (!qualGroups.has(key)) qualGroups.set(key, { label, session_ids: [] })
      qualGroups.get(key)!.session_ids.push(s.id)
    }

    const qualSlots: TvRankingSlot[] = Array.from(qualGroups.entries()).map(([key, { label, session_ids }]) => ({
      id: key, label, session_ids, enabled: true,
    }))

    return [...qualSlots, ...bracketSlots]
  }, [sessions, agLabels, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── derived state ─────────────────────────────────────────────────────────────

  // Is anything queued on the TV right now?
  const isAnythingQueued = !!(tvState?.session_id && tvState?.team_id)

  // Key of the item the list should scroll to (queued > first unscored)
  const scrollTargetKey = tvState?.session_id && tvState?.team_id
    ? `${tvState.session_id}-${tvState.team_id}`
    : null

  // Does the currently queued team have an approved score? (needed for reveal)
  const queuedHasScore = isAnythingQueued
    ? results.some(r => r.session_id === tvState!.session_id && r.team_id === tvState!.team_id)
    : false

  // ── build ordered participant list ────────────────────────────────────────────

  const droppedTeamIds = new Set(entries.filter(e => e.dropped_out).map(e => e.team_id))

  const participants: ParticipantSlot[] = []
  const addedKeys = new Set<string>()
  const sortedSections = [...sections].sort((a, b) => a.section_number - b.section_number)
  const sessionById = Object.fromEntries(sessions.map(s => [s.id, s]))

  for (const section of sortedSections) {
    const sectionSessions = sessions.filter(s => s.section_id === section.id)
    if (sectionSessions.length === 0) continue

    const timelineSlots = orderedTimelinePerformances(
      section,
      panels,
      sectionSessions,
      sessionOrders,
      entries,
      globalTeams,
    )
    for (const slot of timelineSlots) {
      const key = `${slot.session_id}:${slot.team_id}`
      if (addedKeys.has(key)) continue
      const session = sessionById[slot.session_id]
      const team = globalTeams.find(t => t.id === slot.team_id)
      if (!session || !team) continue
      addedKeys.add(key)
      participants.push(participantFromSessionTeam(session, team, clubs, entries, results))
    }

    appendSectionDropoutSlots(
      sectionSessions,
      panels,
      sessionOrders,
      globalTeams,
      droppedTeamIds,
      addedKeys,
      clubs,
      entries,
      results,
      participants,
    )
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

      {/* Mode switch button — full width */}
      <button
        onClick={() => void handleSwitchMode()}
        disabled={busy || !tvState}
        className="w-full py-2.5 rounded-xl text-sm font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        {tvState?.mode === 'ranking' ? t.switchToScore : t.switchToRanking}
      </button>

      {/* Two columns: score left, ranking right */}
      <div className="grid grid-cols-2 gap-4 items-start">

        {/* ── LEFT: score column ── */}
        <div className="space-y-3">

          {/* Score preview */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">{t.previewScore}</p>
              {tvState?.mode === 'score' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white">{t.live}</span>
              )}
            </div>
            <div ref={previewRef} className="w-full overflow-hidden bg-slate-950" style={{ height: IFRAME_H * previewScale }}>
              {tvUrl && (
                <iframe
                  src={`${tvUrl}?lang=${lang}&previewMode=score`}
                  style={{ width: IFRAME_W, height: IFRAME_H, border: 'none', pointerEvents: 'none', transformOrigin: 'top left', transform: `scale(${previewScale})` }}
                />
              )}
            </div>
          </div>

          {/* Reveal / hide */}
          {isAnythingQueued && (
            <div className="space-y-2">
              <button
                disabled={busy || !queuedHasScore}
                onClick={() => setRevealed(!tvState?.revealed)}
                className={[
                  'w-full py-3 rounded-xl text-base font-bold transition-colors disabled:opacity-40',
                  tvState?.revealed ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700',
                ].join(' ')}
              >
                {tvState?.revealed ? t.hide : t.reveal}
              </button>
              {!queuedHasScore && <p className="text-xs text-slate-400 text-center">{t.waitingScore}</p>}
              <button
                type="button"
                disabled={busy}
                onClick={() => void clearTvQueue()}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {t.clearTv}
              </button>
            </div>
          )}

          {/* Auto-queue toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none px-1">
            <div
              onClick={() => setAutoQueue((v) => !v)}
              className={['w-10 h-6 rounded-full transition-colors relative shrink-0', autoQueue ? 'bg-blue-600' : 'bg-slate-200'].join(' ')}
            >
              <span className={['absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform', autoQueue ? 'left-5' : 'left-1'].join(' ')} />
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
              <ul className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {participants.map((p) => {
                  const itemKey = `${p.session_id}-${p.team_id}`
                  const isQueued = tvState?.session_id === p.session_id && tvState?.team_id === p.team_id
                  const hasScore = p.result !== null
                  const isDone = hasScore && !isQueued
                  const isScrollTarget = scrollTargetKey
                    ? itemKey === scrollTargetKey
                    : !hasScore && !p.is_dropout && !participants.slice(0, participants.indexOf(p)).some(q => !q.result && !q.is_dropout)
                  return (
                    <li
                      key={itemKey}
                      ref={isScrollTarget ? activeItemRef : null}
                      className={['flex items-center gap-3 px-4 py-3', isQueued ? 'bg-blue-50' : isDone ? 'opacity-50' : p.is_dropout ? 'opacity-40' : 'hover:bg-slate-50'].join(' ')}
                    >
                      {p.photo_url ? (
                        <img src={p.photo_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0 flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {p.dorsal != null && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-white shrink-0">#{p.dorsal}</span>
                          )}
                          <p className={['text-sm font-medium truncate', (p.is_dropout || isDone) ? 'line-through text-slate-400' : 'text-slate-800'].join(' ')}>
                            {p.gymnast_display}
                          </p>
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {p.club_name}{' · '}{categoryLabel(p.category, lang)}{' · '}{routineLabel(p.routine_type)}{' · '}{agLabels[p.age_group] ?? p.age_group}
                        </p>
                      </div>
                      {hasScore ? (
                        <div className="flex flex-col items-end shrink-0 gap-0.5">
                          {p.result!.status === 'provisional' && (
                            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded leading-none">{t.prov}</span>
                          )}
                          <span className="tabular-nums font-bold text-slate-700 text-sm">{p.result!.final_score?.toFixed(3) ?? '—'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 shrink-0 w-14 text-right">—</span>
                      )}
                      <button
                        disabled={busy || isQueued || p.is_dropout}
                        onClick={() => queueResult(p.session_id, p.team_id, false)}
                        className={['shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50', isQueued ? 'bg-blue-100 text-blue-700 border-blue-200 cursor-default' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'].join(' ')}
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

        {/* ── RIGHT: ranking column ── */}
        <div className="space-y-3">

          {/* Ranking preview */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">{t.previewRanking}</p>
              {tvState?.mode === 'ranking' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white">{t.live}</span>
              )}
            </div>
            <div ref={rankingPreviewRef} className="w-full overflow-hidden bg-slate-950" style={{ height: IFRAME_H * rankingPreviewScale }}>
              {tvUrl && (
                <iframe
                  src={`${tvUrl}?lang=${lang}&previewMode=ranking`}
                  style={{ width: IFRAME_W, height: IFRAME_H, border: 'none', pointerEvents: 'none', transformOrigin: 'top left', transform: `scale(${rankingPreviewScale})` }}
                />
              )}
            </div>
          </div>

          {/* Ranking config */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.rankingConfig}</p>
              {rankingDirty && (
                <button onClick={() => void saveRankingConfig(rankingConfig)} className="text-xs px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                  {t.saveRankingConfig}
                </button>
              )}
            </div>
            <div className="p-4 space-y-4">

              {/* Duration + teams per page + color */}
              <div className="flex gap-4">
                <label className="flex-1">
                  <span className="text-xs font-medium text-slate-600 block mb-1">{t.durationSeconds}</span>
                  <input type="number" min={3} max={60} value={rankingConfig.duration_seconds}
                    onChange={e => { setRankingConfig(c => ({ ...c, duration_seconds: +e.target.value })); setRankingDirty(true) }}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800" />
                </label>
                <label className="flex-1">
                  <span className="text-xs font-medium text-slate-600 block mb-1">Equipos por pantalla</span>
                  <input type="number" min={1} max={20} value={rankingConfig.teams_per_page ?? 8}
                    onChange={e => { setRankingConfig(c => ({ ...c, teams_per_page: +e.target.value })); setRankingDirty(true) }}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800" />
                </label>
                <label>
                  <span className="text-xs font-medium text-slate-600 block mb-1">{t.bgColor}</span>
                  <input type="color" value={rankingConfig.background_color}
                    onChange={e => { setRankingConfig(c => ({ ...c, background_color: e.target.value })); setRankingDirty(true) }}
                    className="h-9 w-16 rounded-lg border border-slate-200 cursor-pointer" />
                </label>
              </div>

              {/* Slots */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">{t.rankingSlots}</span>
                  <button
                    onClick={() => { setRankingConfig(c => ({ ...c, slots: autoSlots })); setRankingDirty(true); setSelectedSlotIds(new Set()) }}
                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    {t.generateFromSessions}
                  </button>
                </div>

                {/* Merge bar */}
                {selectedSlotIds.size >= 2 && (
                  <div className="mb-2 p-2 rounded-lg bg-indigo-50 border border-indigo-200 space-y-1.5">
                    {showMergeInput ? (
                      <div className="flex gap-2">
                        <input autoFocus value={mergeLabel} onChange={e => setMergeLabel(e.target.value)}
                          placeholder="Nombre del grupo (ej: Clasificación OPEN)"
                          className="flex-1 text-xs border border-indigo-200 rounded px-2 py-1 bg-white text-slate-800 placeholder:text-slate-400"
                          onKeyDown={e => { if (e.key === 'Enter') handleMergeSlots() }} />
                        <button onClick={handleMergeSlots} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Combinar</button>
                        <button onClick={() => { setShowMergeInput(false); setMergeLabel('') }} className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">×</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-indigo-700 font-medium">{selectedSlotIds.size} rankings seleccionados</span>
                        <div className="flex gap-1.5">
                          <button onClick={() => setShowMergeInput(true)} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Combinar en uno →</button>
                          <button onClick={() => { setSelectedSlotIds(new Set()); setShowMergeInput(false) }} className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">×</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1 max-h-[500px] overflow-y-auto">
                  {rankingConfig.slots.map((slot, i) => {
                    const isSelected = selectedSlotIds.has(slot.id)
                    const isMerged = !!(slot.source_slot_labels?.length)
                    const hintOpen = expandedHints.has(slot.id)
                    return (
                      <div key={slot.id} className={['rounded-lg border', isSelected ? 'border-indigo-300 bg-indigo-50' : isMerged ? 'border-violet-200 bg-violet-50' : 'border-slate-100 bg-slate-50'].join(' ')}>
                        <div className="flex items-center gap-2 p-2">
                          <button onClick={() => toggleSlotSelect(slot.id)} title="Seleccionar para combinar"
                            className={['w-4 h-4 rounded-full border-2 shrink-0 transition-colors', isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 hover:border-indigo-400'].join(' ')} />
                          <input type="checkbox" checked={slot.enabled}
                            onChange={e => { const slots = rankingConfig.slots.map((s, j) => j === i ? { ...s, enabled: e.target.checked } : s); setRankingConfig(c => ({ ...c, slots })); setRankingDirty(true) }}
                            className="rounded shrink-0" />
                          {isMerged && (
                            <button
                              onClick={() => setExpandedHints(prev => { const n = new Set(prev); if (n.has(slot.id)) n.delete(slot.id); else n.add(slot.id); return n })}
                              className="shrink-0 text-violet-500 hover:text-violet-700 text-xs leading-none"
                              title="Ver rankings combinados"
                            >
                              {hintOpen ? '▾' : '▸'}
                            </button>
                          )}
                          <input value={slot.label}
                            onChange={e => { const slots = rankingConfig.slots.map((s, j) => j === i ? { ...s, label: e.target.value } : s); setRankingConfig(c => ({ ...c, slots })); setRankingDirty(true) }}
                            className={['flex-1 text-xs border rounded px-2 py-1 bg-white text-slate-800', isMerged ? 'border-violet-200 font-semibold' : 'border-slate-200'].join(' ')} />
                          <button disabled={i === 0}
                            onClick={() => { const slots = [...rankingConfig.slots]; [slots[i - 1], slots[i]] = [slots[i]!, slots[i - 1]!]; setRankingConfig(c => ({ ...c, slots })); setRankingDirty(true) }}
                            className="text-slate-400 hover:text-slate-700 disabled:opacity-30 text-xs px-1">↑</button>
                          <button disabled={i === rankingConfig.slots.length - 1}
                            onClick={() => { const slots = [...rankingConfig.slots]; [slots[i], slots[i + 1]] = [slots[i + 1]!, slots[i]!]; setRankingConfig(c => ({ ...c, slots })); setRankingDirty(true) }}
                            className="text-slate-400 hover:text-slate-700 disabled:opacity-30 text-xs px-1">↓</button>
                          <button onClick={() => deleteSlot(slot.id)} className="text-slate-300 hover:text-red-500 text-xs px-1 transition-colors" title="Eliminar">×</button>
                        </div>
                        {isMerged && hintOpen && (
                          <div className="px-3 pb-2 space-y-0.5">
                            {slot.source_slot_labels!.map((lbl, j) => (
                              <div key={j} className="flex items-center gap-1.5 text-[10px] text-violet-600">
                                <span className="text-violet-300">└</span>
                                <span>{lbl}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {rankingConfig.slots.length === 0 && <p className="text-xs text-slate-400 text-center py-4">{t.noSlots}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsor reel — full width */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.sponsorVideos}</p>
          <p className="text-xs text-slate-500 mt-1">{t.sponsorReelHint}</p>
        </div>
        <div className="p-4 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => void setSponsorReelEnabled(!tvState?.sponsor_reel_enabled)}
              className={['w-10 h-6 rounded-full transition-colors relative shrink-0', tvState?.sponsor_reel_enabled ? 'bg-violet-600' : 'bg-slate-200'].join(' ')}>
              <span className={['absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform', tvState?.sponsor_reel_enabled ? 'left-5' : 'left-1'].join(' ')} />
            </div>
            <span className="text-sm text-slate-700 font-medium">{t.sponsorReel}</span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input ref={sponsorFileRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={onPickSponsorFile} />
            <button type="button" disabled={busy} onClick={() => sponsorFileRef.current?.click()}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50">
              {t.uploadVideo}
            </button>
          </div>
          {sponsorClips.length === 0 ? (
            <p className="text-sm text-slate-400">{t.noSponsors}</p>
          ) : (
            <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {sponsorClips.map((clip, index) => (
                <li key={clip.id} className="flex items-center gap-2 px-3 py-2 bg-white">
                  <span className="text-xs font-mono text-slate-400 w-6">{index + 1}</span>
                  <span className="flex-1 text-sm text-slate-800 truncate">{clip.label || clip.path}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" disabled={busy || index === 0} onClick={() => void moveSponsorClip(index, -1)} className="px-2 py-1 text-xs font-medium rounded border border-slate-200 text-slate-600 disabled:opacity-40">{t.moveUp}</button>
                    <button type="button" disabled={busy || index >= sponsorClips.length - 1} onClick={() => void moveSponsorClip(index, 1)} className="px-2 py-1 text-xs font-medium rounded border border-slate-200 text-slate-600 disabled:opacity-40">{t.moveDown}</button>
                    <button type="button" disabled={busy} onClick={() => void removeSponsorClip(clip)} className="px-2 py-1 text-xs font-medium rounded border border-red-200 text-red-600 disabled:opacity-40">{t.removeClip}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
