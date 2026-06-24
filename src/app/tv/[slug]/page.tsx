'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { PenaltyState } from '@/components/scoring/types'
import { activePenalties, activeDJPenalties, activeRJPenalties } from '@/lib/penaltyLabels'
import type { ElementFlags } from '@/components/scoring/types'
import { categoryLabel } from '@/components/admin/types'
import { fetchPeerSessionIdsForRanking } from '@/lib/rankingPeers'
import { TV_SPONSOR_BUCKET, parseTvSponsorVideos, type TvSponsorClip } from '@/lib/tvSponsorVideos'
import { useT } from '@/lib/useT'
import type { TvRankingConfig } from '@/lib/tvRankingConfig'

// ─── types ────────────────────────────────────────────────────────────────────

type Lang = 'en' | 'es'

type TVState = {
  session_id: string | null
  team_id: string | null
  revealed: boolean
  sponsor_reel_enabled: boolean
  sponsor_playlist_index: number
  mode: 'score' | 'ranking'
  ranking_config: TvRankingConfig | null
}

type TeamData = {
  gymnast_display: string
  photo_url: string | null
  club: { club_name: string; avatar_url: string | null }
}

type SessionData = {
  age_group: string       // raw ID — used for DB filtering (ranking queries)
  age_group_label: string // resolved display name
  age_group_level: string // e.g. 'Escolar', 'Base', 'Nacional', 'FIG'
  category: string
  routine_type: string
  section_id: string
  panel_id: string
}

type ResultData = {
  e_score: number | null
  a_score: number | null
  dif_score: number | null
  dif_penalty: number | null
  cjp_penalty: number | null
  da_score: number | null
  db_score: number | null
  rj_penalty: number | null
  final_score: number | null
  status: string | null
  cjp_penalty_detail: PenaltyState | null
  dj_penalty_detail: ElementFlags | null
  rj_penalty_detail: Record<string, unknown> | null
}

type CompetitionData = {
  name: string
  poster_url: string | null
  sport_type: string
  logo_url: string | null
}

type RankingEntry = {
  team_id: string
  gymnast_display: string
  club_name: string
  club_logo: string | null
  final_score: number
  routine_scores: { routine_type: string; score: number | null }[]  // populated for multi-routine
  // individual score breakdown (single-routine only; null for multi-routine combined)
  e_score: number | null    // raw e_score (×2 for Acro at render time)
  a_score: number | null
  d_score: number | null    // dif_score (Acro) or null
  da_score: number | null   // RG only
  db_score: number | null   // RG only
  pen: number | null        // total penalty (positive); null if zero
}

type SlotData = {
  entries: RankingEntry[]
  routine_types: string[]  // ordered; length > 1 means multi-routine display
}

// ─── component ────────────────────────────────────────────────────────────────

export default function TVPage() {
  const { slug } = useParams<{ slug: string }>()
  const [compUuid, setCompUuid] = useState('')
  const searchParams = useSearchParams()
  const lang: Lang = (searchParams.get('lang') as Lang) === 'en' ? 'en' : 'es'
  const t = useT('TVPage', lang)

  const previewMode = searchParams.get('previewMode') as 'score' | 'ranking' | null

  const supabase = createClient()

  const [competition, setCompetition] = useState<CompetitionData | null>(null)
  const [tvState, setTvState] = useState<TVState | null>(null)
  const [team, setTeam] = useState<TeamData | null>(null)
  const [session, setSession] = useState<SessionData | null>(null)
  const [result, setResult] = useState<ResultData | null>(null)
  const [dorsal, setDorsal] = useState<number | null>(null)
  const [rank, setRank] = useState<number | null>(null)
  const [rankTotal, setRankTotal] = useState<number>(0)

  // Separate score-visible state so animation only triggers on reveal change,
  // not on team switch (team switch resets immediately, no animation).
  const [scoreVisible, setScoreVisible] = useState(false)
  const prevRevealedRef = useRef<boolean | null>(null)
  const prevSessionIdRef = useRef<string | null>(null)
  const prevTeamIdRef = useRef<string | null>(null)

  // ── ranking state ────────────────────────────────────────────────────────────

  const [rankingData, setRankingData] = useState<Record<string, SlotData>>({})
  const [rankingFrameIdx, setRankingFrameIdx] = useState(0)
  // Ref so the interval callback always has the latest frame count without restarting the timer
  const rankingTotalFramesRef = useRef(0)

  // ── fetch competition info once ──────────────────────────────────────────────

  const [sponsorClips, setSponsorClips] = useState<TvSponsorClip[]>([])
  const sponsorPlaybackByClipRef = useRef<Record<string, number>>({})

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('competitions')
        .select('id, name, poster_url, sport_type, tv_sponsor_videos, logo_url')
        .eq('slug', slug)
        .single()
      if (data) {
        setCompUuid((data as unknown as { id: string }).id)
        setCompetition({
          name: data.name,
          poster_url: data.poster_url ?? null,
          sport_type: (data as unknown as { sport_type: string }).sport_type ?? 'acro',
          logo_url: (data as unknown as { logo_url: string | null }).logo_url ?? null,
        })
        setSponsorClips(parseTvSponsorVideos(data.tv_sponsor_videos))
      }
    }
    load()
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetch initial tv_state then subscribe ────────────────────────────────────

  useEffect(() => {
    if (!compUuid) return
    async function load() {
      const { data } = await supabase
        .from('tv_state')
        .select('session_id, team_id, revealed, sponsor_reel_enabled, sponsor_playlist_index, mode, ranking_config')
        .eq('competition_id', compUuid)
        .maybeSingle()
      const state: TVState = {
        session_id: data?.session_id ?? null,
        team_id:    data?.team_id    ?? null,
        revealed:   data?.revealed   ?? false,
        sponsor_reel_enabled: data?.sponsor_reel_enabled ?? false,
        sponsor_playlist_index: typeof data?.sponsor_playlist_index === 'number' ? data.sponsor_playlist_index : 0,
        mode: (data?.mode as 'score' | 'ranking') ?? 'score',
        ranking_config: (data?.ranking_config as TvRankingConfig | null) ?? null,
      }
      setTvState(state)
      prevRevealedRef.current = state.revealed
      setScoreVisible(state.revealed)
    }
    load()

    const ch = supabase
      .channel(`tv-display-${compUuid}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'tv_state',
        filter: `competition_id=eq.${compUuid}`,
      }, (payload) => {
        const row = payload.new as {
          session_id: string | null
          team_id: string | null
          revealed: boolean
          sponsor_reel_enabled?: boolean
          sponsor_playlist_index?: number
          mode?: string
          ranking_config?: unknown
        }
        const next: TVState = {
          session_id: row.session_id ?? null,
          team_id:    row.team_id    ?? null,
          revealed:   row.revealed   ?? false,
          sponsor_reel_enabled: row.sponsor_reel_enabled ?? false,
          sponsor_playlist_index: typeof row.sponsor_playlist_index === 'number' ? row.sponsor_playlist_index : 0,
          mode: (row.mode as 'score' | 'ranking') ?? 'score',
          ranking_config: (row.ranking_config as TvRankingConfig | null) ?? null,
        }
        setTvState(next)
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [compUuid]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── sponsor playlist updates (admin uploads) ─────────────────────────────────

  useEffect(() => {
    if (!compUuid) return
    const ch = supabase
      .channel(`tv-comp-sponsors-${compUuid}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'competitions',
          filter: `id=eq.${compUuid}`,
        },
        (payload) => {
          const row = payload.new as { tv_sponsor_videos?: unknown }
          if (row.tv_sponsor_videos !== undefined) {
            setSponsorClips(parseTvSponsorVideos(row.tv_sponsor_videos))
          }
        },
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [compUuid]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── subscribe to routine_results for live score updates ─────────────────────

  useEffect(() => {
    if (!tvState?.session_id || !tvState?.team_id) return
    const { session_id, team_id } = tvState

    const ch = supabase
      .channel(`tv-result-${session_id}-${team_id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'routine_results',
        filter: `session_id=eq.${session_id}`,
      }, (payload) => {
        const row = payload.new as ResultData & { team_id: string }
        if (row.team_id !== team_id) return
        setResult({
          e_score:            row.e_score            ?? null,
          a_score:            row.a_score            ?? null,
          dif_score:          row.dif_score          ?? null,
          dif_penalty:        row.dif_penalty        ?? null,
          cjp_penalty:        row.cjp_penalty        ?? null,
          da_score:           row.da_score           ?? null,
          db_score:           row.db_score           ?? null,
          rj_penalty:         row.rj_penalty         ?? null,
          final_score:        row.final_score        ?? null,
          status:             row.status             ?? null,
          cjp_penalty_detail: row.cjp_penalty_detail as PenaltyState | null,
          dj_penalty_detail:  row.dj_penalty_detail  as ElementFlags | null,
          rj_penalty_detail:  row.rj_penalty_detail  as Record<string, unknown> | null,
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [tvState?.session_id, tvState?.team_id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── handle team/session change ───────────────────────────────────────────────

  useEffect(() => {
    if (!tvState?.session_id || !tvState?.team_id) {
      setTeam(null)
      setSession(null)
      setResult(null)
      setDorsal(null)
      setRank(null)
      setRankTotal(0)
      setScoreVisible(false)
      prevRevealedRef.current = false
      prevSessionIdRef.current = null
      prevTeamIdRef.current = null
      return
    }

    const { session_id, team_id, revealed } = tvState

    setScoreVisible(revealed)
    prevRevealedRef.current = revealed

    // When only revealed changed, skip the full re-fetch — Realtime handles result updates.
    if (session_id === prevSessionIdRef.current && team_id === prevTeamIdRef.current) {
      return
    }
    prevSessionIdRef.current = session_id
    prevTeamIdRef.current = team_id

    setTeam(null)
    setSession(null)
    setResult(null)
    setDorsal(null)
    setRank(null)
    setRankTotal(0)

    async function fetchDisplay() {
      const [teamRes, sessionRes, entryRes, resultRes] = await Promise.all([
        supabase
          .from('teams')
          .select('gymnast_display, photo_url, clubs(club_name, avatar_url)')
          .eq('id', team_id)
          .single(),
        supabase
          .from('sessions')
          .select('age_group, category, routine_type, competition_id, section_id, panel_id, ranking_merge_group_id')
          .eq('id', session_id)
          .single(),
        supabase
          .from('competition_entries')
          .select('dorsal, gymnast_display')
          .eq('competition_id', compUuid)
          .eq('team_id', team_id)
          .maybeSingle(),
        supabase
          .from('routine_results')
          .select('e_score, a_score, dif_score, dif_penalty, cjp_penalty, da_score, db_score, rj_penalty, final_score, status, cjp_penalty_detail, dj_penalty_detail, rj_penalty_detail')
          .eq('session_id', session_id)
          .eq('team_id', team_id)
          .maybeSingle(),
      ])

      if (teamRes.data) {
        const club = Array.isArray(teamRes.data.clubs)
          ? teamRes.data.clubs[0]
          : teamRes.data.clubs
        setTeam({
          gymnast_display: (entryRes.data as any)?.gymnast_display ?? teamRes.data.gymnast_display,
          photo_url:       teamRes.data.photo_url ?? null,
          club: {
            club_name:  club?.club_name  ?? '',
            avatar_url: club?.avatar_url ?? null,
          },
        })
      }

      const sess = sessionRes.data
      if (sess) {
        const { data: agRule } = await supabase
          .from('age_group_rules')
          .select('age_group, level')
          .eq('id', sess.age_group)
          .maybeSingle()
        setSession({
          age_group:       sess.age_group,
          age_group_label: agRule?.age_group ?? sess.age_group,
          age_group_level: (agRule as any)?.level ?? '',
          category:        sess.category,
          routine_type:    sess.routine_type,
          section_id:      sess.section_id,
          panel_id:        sess.panel_id,
        })

        const peerIds = await fetchPeerSessionIdsForRanking(supabase, {
          competition_id: sess.competition_id,
          age_group: sess.age_group,
          category: sess.category,
          routine_type: sess.routine_type,
          ranking_merge_group_id: sess.ranking_merge_group_id,
        })

        if (peerIds.length > 0) {
          const ids = peerIds
          const { data: allResults } = await supabase
            .from('routine_results')
            .select('team_id, final_score')
            .in('session_id', ids)
            .in('status', ['approved', 'provisional'])
            .order('final_score', { ascending: false })

          if (allResults) {
            setRankTotal(allResults.length)
            const pos = allResults.findIndex((r) => r.team_id === team_id)
            setRank(pos >= 0 ? pos + 1 : null)
          }
        }
      }

      setDorsal(entryRes.data?.dorsal ?? null)

      if (resultRes.data) {
        setResult({
          e_score:             resultRes.data.e_score,
          a_score:             resultRes.data.a_score,
          dif_score:           resultRes.data.dif_score,
          dif_penalty:         resultRes.data.dif_penalty,
          cjp_penalty:         resultRes.data.cjp_penalty,
          da_score:            resultRes.data.da_score,
          db_score:            resultRes.data.db_score,
          rj_penalty:          resultRes.data.rj_penalty,
          final_score:         resultRes.data.final_score,
          status:              (resultRes.data as unknown as { status: string | null }).status ?? null,
          cjp_penalty_detail:  resultRes.data.cjp_penalty_detail as PenaltyState | null,
          dj_penalty_detail:   resultRes.data.dj_penalty_detail as ElementFlags | null,
          rj_penalty_detail:   resultRes.data.rj_penalty_detail as Record<string, unknown> | null,
        })
      } else {
        setResult(null)
      }
    }

    fetchDisplay()
  }, [tvState?.session_id, tvState?.team_id, tvState?.revealed]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetch ranking data when in ranking mode ──────────────────────────────────

  const effectiveMode = previewMode ?? tvState?.mode ?? 'score'

  async function fetchRankingData(config: TvRankingConfig) {
    const allSessionIds = Array.from(
      new Set(config.slots.filter(s => s.enabled).flatMap(s => s.session_ids))
    )
    if (allSessionIds.length === 0) { setRankingData({}); return }

    const [resultsRes, sessionsRes] = await Promise.all([
      supabase.from('routine_results')
        .select('session_id, team_id, final_score, e_score, a_score, dif_score, dif_penalty, cjp_penalty, da_score, db_score, rj_penalty')
        .in('session_id', allSessionIds).in('status', ['approved', 'provisional']),
      supabase.from('sessions').select('id, routine_type').in('id', allSessionIds),
    ])

    type RawResult = {
      session_id: string; team_id: string; final_score: number | null
      e_score: number | null; a_score: number | null; dif_score: number | null
      dif_penalty: number | null; cjp_penalty: number | null
      da_score: number | null; db_score: number | null; rj_penalty: number | null
    }
    const results = (resultsRes.data ?? []) as RawResult[]
    const sessionRoutineMap = new Map(
      (sessionsRes.data ?? []).map((s: { id: string; routine_type: string }) => [s.id, s.routine_type])
    )

    const teamIds = Array.from(new Set(results.map(r => r.team_id)))
    if (teamIds.length === 0) { setRankingData({}); return }

    const [teamsRes, clubsRes] = await Promise.all([
      supabase.from('teams').select('id, gymnast_display, club_id').in('id', teamIds),
      supabase.from('clubs').select('id, club_name, avatar_url'),
    ])

    const teamMap = new Map((teamsRes.data ?? []).map(t => [t.id, t]))
    const clubMap = new Map((clubsRes.data ?? []).map((c: any) => [c.id, c]))

    const ROUTINE_ORDER = ['Balance', 'Dynamic', 'Combined']
    const sortRoutines = (types: string[]) =>
      [...types].sort((a, b) => ROUTINE_ORDER.indexOf(a) - ROUTINE_ORDER.indexOf(b))

    const newData: Record<string, SlotData> = {}
    for (const slot of config.slots) {
      if (!slot.enabled) continue

      const slotResults = results.filter(r => slot.session_ids.includes(r.session_id))
      const routineTypes = sortRoutines(
        Array.from(new Set(slot.session_ids.map(id => sessionRoutineMap.get(id)).filter(Boolean) as string[]))
      )
      const isMulti = routineTypes.length > 1

      if (!isMulti) {
        const entries: RankingEntry[] = slotResults
          .map(r => {
            const team = teamMap.get(r.team_id)
            const club = clubMap.get((team as any)?.club_id ?? '')
            const totalPen = (r.dif_penalty ?? 0) + (r.cjp_penalty ?? 0) + (r.rj_penalty ?? 0)
            return {
              team_id: r.team_id,
              gymnast_display: team?.gymnast_display ?? '',
              club_name: (club as any)?.club_name ?? '',
              club_logo: (club as any)?.avatar_url ?? null,
              final_score: r.final_score ?? 0,
              routine_scores: [],
              e_score: r.e_score ?? null,
              a_score: r.a_score ?? null,
              d_score: r.dif_score ?? null,
              da_score: r.da_score ?? null,
              db_score: r.db_score ?? null,
              pen: totalPen > 0 ? totalPen : null,
            }
          })
          .sort((a, b) => b.final_score - a.final_score)
        newData[slot.id] = { entries, routine_types: routineTypes }
      } else {
        const byTeam = new Map<string, { scores: Map<string, number | null>; team_id: string }>()
        for (const r of slotResults) {
          const rt = sessionRoutineMap.get(r.session_id) ?? 'Unknown'
          if (!byTeam.has(r.team_id)) byTeam.set(r.team_id, { scores: new Map(), team_id: r.team_id })
          byTeam.get(r.team_id)!.scores.set(rt, r.final_score ?? null)
        }

        const entries: RankingEntry[] = Array.from(byTeam.values()).map(({ team_id, scores }) => {
          const team = teamMap.get(team_id)
          const club = clubMap.get((team as any)?.club_id ?? '')
          const routine_scores = routineTypes.map(rt => ({ routine_type: rt, score: scores.get(rt) ?? null }))
          const total = routine_scores.reduce((sum, rs) => sum + (rs.score ?? 0), 0)
          return {
            team_id,
            gymnast_display: team?.gymnast_display ?? '',
            club_name: (club as any)?.club_name ?? '',
            club_logo: (club as any)?.avatar_url ?? null,
            final_score: total,
            routine_scores,
            e_score: null, a_score: null, d_score: null,
            da_score: null, db_score: null, pen: null,
          }
        }).sort((a, b) => b.final_score - a.final_score)

        newData[slot.id] = { entries, routine_types: routineTypes }
      }
    }
    setRankingData(newData)
  }

  useEffect(() => {
    if (effectiveMode !== 'ranking') return
    const config = tvState?.ranking_config
    if (!config) return
    void fetchRankingData(config)
  }, [effectiveMode, tvState?.ranking_config]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── subscribe to routine_results for ranking re-fetch ───────────────────────

  useEffect(() => {
    if (effectiveMode !== 'ranking') return
    const config = tvState?.ranking_config
    if (!config) return

    const ch = supabase
      .channel(`tv-ranking-results-${compUuid}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'routine_results',
      }, () => {
        void fetchRankingData(config)
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [effectiveMode, tvState?.ranking_config]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── cycle ranking frames (slot × page) ──────────────────────────────────────

  useEffect(() => {
    if (effectiveMode !== 'ranking') {
      setRankingFrameIdx(0)
      return
    }
    const config = tvState?.ranking_config
    if (!config) return

    const interval = setInterval(() => {
      const total = rankingTotalFramesRef.current
      if (total > 1) setRankingFrameIdx(prev => (prev + 1) % total)
    }, (config.duration_seconds ?? 10) * 1000)

    return () => clearInterval(interval)
  }, [effectiveMode, tvState?.ranking_config]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── helpers ──────────────────────────────────────────────────────────────────

  const routineLabel = (rt: string) =>
    ({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined }[rt] ?? rt)

  const isRG = competition?.sport_type === 'rg'
  const srPenalty = (session?.age_group_level === 'Escolar' && session?.age_group_label !== 'Absoluto') ? 0.5 : 1.0

  const allPenalties = isRG
    ? (result?.rj_penalty_detail
        ? activeRJPenalties(result.rj_penalty_detail, result.rj_penalty ?? 0, lang)
        : [])
    : [
        ...(result?.dj_penalty_detail ? activeDJPenalties(result.dj_penalty_detail, lang, srPenalty) : []),
        ...(result?.cjp_penalty_detail ? activePenalties(result.cjp_penalty_detail, lang) : []),
      ]

  const totalPen = isRG
    ? (result?.rj_penalty ?? 0)
    : (result?.dif_penalty ?? 0) + (result?.cjp_penalty ?? 0)

  const isTeamQueued = !!(tvState?.session_id && tvState?.team_id)

  // ── ranking view ─────────────────────────────────────────────────────────────

  const showRanking = effectiveMode === 'ranking' && !(isTeamQueued && tvState?.revealed === true)

  if (showRanking) {
    const config = tvState?.ranking_config
    const teamsPerPage = config?.teams_per_page ?? 8
    const enabledSlots = config ? config.slots.filter(s => s.enabled && (rankingData[s.id]?.entries.length ?? 0) > 0) : []

    // Build frame list: each frame is { slotIdx, pageIdx }
    const frames = enabledSlots.flatMap((slot, slotIdx) => {
      const totalEntries = rankingData[slot.id]?.entries.length ?? 0
      const totalPages = Math.max(1, Math.ceil(totalEntries / teamsPerPage))
      return Array.from({ length: totalPages }, (_, pageIdx) => ({ slotIdx, pageIdx, totalPages }))
    })
    // Keep ref in sync so the interval always has the latest count
    rankingTotalFramesRef.current = frames.length

    const currentFrame = frames.length > 0 ? frames[rankingFrameIdx % frames.length] : null
    const currentSlotDisplayIdx = currentFrame?.slotIdx ?? 0
    const currentSlot = enabledSlots[currentSlotDisplayIdx]
    const currentSlotData = currentSlot ? rankingData[currentSlot.id] : undefined
    const allSlotEntries = currentSlotData?.entries ?? []
    const currentPage = currentFrame?.pageIdx ?? 0
    const totalPagesForSlot = currentFrame?.totalPages ?? 1
    const currentSlotEntries = allSlotEntries.slice(currentPage * teamsPerPage, (currentPage + 1) * teamsPerPage)
    const routineTypes = currentSlotData?.routine_types ?? []
    const isMultiRoutine = routineTypes.length > 1
    const bgColor = config?.background_color ?? '#0f172a'

    return (
      <div style={{ backgroundColor: bgColor }} className="w-screen h-screen flex flex-col overflow-hidden text-white">

        {/* Header */}
        <div className="shrink-0 flex items-center gap-6 px-10 py-5 border-b border-white/10">
          {competition?.logo_url && (
            <img src={competition.logo_url} className="h-12 w-auto object-contain" alt="" />
          )}
          <span className="text-base font-medium text-white/60 flex-1">{competition?.name}</span>
          <span className="text-2xl font-bold text-white">{currentSlot?.label ?? ''}</span>
          {totalPagesForSlot > 1 && (
            <span className="text-base font-semibold text-white/40 shrink-0 ml-2">
              {currentPage + 1} / {totalPagesForSlot}
            </span>
          )}
        </div>

        {/* Column headers */}
        <div className="shrink-0 flex items-center gap-4 px-10 py-2 border-b border-white/10 text-base font-semibold text-white/40 uppercase tracking-wider">
          <span className="w-14" />
          <span className="w-16 shrink-0" />
          <span className="flex-1" />
          {isMultiRoutine ? (
            <>
              {routineTypes.map(rt => (
                <span key={rt} className="w-28 text-right">{routineLabel(rt)}</span>
              ))}
              <span className="w-32 text-right text-white/60">Total</span>
            </>
          ) : (
            <>
              <span className="w-24 text-right">{isRG ? t.eRg : t.e}</span>
              <span className="w-24 text-right">{t.a}</span>
              {isRG ? (
                <>
                  <span className="w-24 text-right">{t.da}</span>
                  <span className="w-24 text-right">{t.db}</span>
                </>
              ) : (
                <span className="w-24 text-right">{t.d}</span>
              )}
              <span className="w-20 text-right text-red-400/50">{isRG ? t.penRj : t.pen}</span>
              <span className="w-32 text-right text-white/60">Total</span>
            </>
          )}
        </div>

        {/* Rankings list */}
        <div className="flex-1 overflow-hidden px-10 py-2 space-y-0">
          {currentSlotEntries.map((entry, i) => (
            <div key={entry.team_id} className="flex items-center gap-4 py-3.5 border-b border-white/5">
              <span className="w-12 text-right text-2xl font-black text-white/30 shrink-0">#{i + 1}</span>
              {(() => {
                const borderCls = i === 0 ? 'ring-4 ring-yellow-400'
                  : i === 1 ? 'ring-4 ring-slate-300'
                  : i === 2 ? 'ring-4 ring-amber-600'
                  : ''
                return entry.club_logo
                  ? <img src={entry.club_logo} className={`h-16 w-16 rounded-full object-contain bg-white/10 shrink-0 ${borderCls}`} alt="" />
                  : <div className={`h-16 w-16 rounded-full bg-white/10 shrink-0 flex items-center justify-center text-base font-bold text-white/40 ${borderCls}`}>{entry.club_name[0] ?? '?'}</div>
              })()}
              <span className="flex-1 text-3xl font-semibold text-white truncate">{entry.gymnast_display}</span>
              {isMultiRoutine ? (
                <>
                  {routineTypes.map(rt => {
                    const rs = entry.routine_scores.find(x => x.routine_type === rt)
                    return (
                      <span key={rt} className="w-28 text-right tabular-nums text-2xl font-bold text-white/70">
                        {rs?.score != null ? rs.score.toFixed(3) : '—'}
                      </span>
                    )
                  })}
                  <span className="w-32 text-right text-4xl font-black tabular-nums text-white">{entry.final_score.toFixed(3)}</span>
                </>
              ) : (
                <>
                  <span className="w-24 text-right tabular-nums text-2xl font-bold text-white/70">
                    {entry.e_score != null ? (isRG ? entry.e_score : entry.e_score * 2).toFixed(3) : '—'}
                  </span>
                  <span className="w-24 text-right tabular-nums text-2xl font-bold text-white/70">
                    {entry.a_score != null ? entry.a_score.toFixed(3) : '—'}
                  </span>
                  {isRG ? (
                    <>
                      <span className="w-24 text-right tabular-nums text-2xl font-bold text-white/70">
                        {entry.da_score != null ? entry.da_score.toFixed(3) : '—'}
                      </span>
                      <span className="w-24 text-right tabular-nums text-2xl font-bold text-white/70">
                        {entry.db_score != null ? entry.db_score.toFixed(3) : '—'}
                      </span>
                    </>
                  ) : (
                    <span className="w-24 text-right tabular-nums text-2xl font-bold text-white/70">
                      {entry.d_score != null ? entry.d_score.toFixed(3) : '—'}
                    </span>
                  )}
                  <span className="w-20 text-right tabular-nums text-2xl font-bold text-red-400/70">
                    {entry.pen != null ? `−${entry.pen.toFixed(1)}` : '—'}
                  </span>
                  <span className="w-32 text-right text-4xl font-black tabular-nums text-white">{entry.final_score.toFixed(3)}</span>
                </>
              )}
            </div>
          ))}
          {currentSlotEntries.length === 0 && (
            <div className="flex items-center justify-center h-full text-white/30 text-xl">Sin resultados todavía</div>
          )}
        </div>

        {/* Footer: slot progress */}
        <div className="shrink-0 flex items-center justify-center gap-2 py-3 border-t border-white/10">
          {enabledSlots.map((slot, i) => (
            <div
              key={slot.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlotDisplayIdx ? 'w-8 bg-white' : 'w-1.5 bg-white/20'}`}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── team scores loading ──────────────────────────────────────────────────────

  if (isTeamQueued && !team) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  // ── sponsor reel (team display has priority; index does not advance while queued) ──

  if (!isTeamQueued && tvState?.sponsor_reel_enabled && sponsorClips.length > 0) {
    const n = sponsorClips.length
    const idx = Math.min(Math.max(0, tvState.sponsor_playlist_index ?? 0), n - 1)
    const clip = sponsorClips[idx]
    const { data: pub } = supabase.storage.from(TV_SPONSOR_BUCKET).getPublicUrl(clip.path)
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
        <video
          key={clip.id}
          className="max-w-full max-h-full w-full h-full object-contain"
          src={pub.publicUrl}
          autoPlay
          muted
          playsInline
          onLoadedMetadata={(e) => {
            const saved = sponsorPlaybackByClipRef.current[clip.id] ?? 0
            if (saved > 0 && saved < e.currentTarget.duration - 0.25) {
              e.currentTarget.currentTime = saved
            }
          }}
          onTimeUpdate={(e) => {
            sponsorPlaybackByClipRef.current[clip.id] = e.currentTarget.currentTime
          }}
          onEnded={() => {
            sponsorPlaybackByClipRef.current[clip.id] = 0
            const next = (idx + 1) % n
            setTvState((prev) =>
              prev ? { ...prev, sponsor_playlist_index: next } : prev,
            )
            void supabase
              .from('tv_state')
              .update({
                sponsor_playlist_index: next,
                updated_at: new Date().toISOString(),
              })
              .eq('competition_id', compUuid)
          }}
        />
      </div>
    )
  }

  // ── idle state (poster + waiting) ───────────────────────────────────────────

  if (!isTeamQueued) {
    return (
      <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-slate-950">
        {/* backdrop */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_0%_50%,rgba(99,102,241,0.16),transparent_60%),radial-gradient(ellipse_55%_70%_at_100%_30%,rgba(14,165,233,0.12),transparent_55%),linear-gradient(105deg,#020617_0%,#0f172a_50%,#020617_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:64px_64px]"
          aria-hidden
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Left: title + status */}
          <div className="flex shrink-0 flex-col justify-center gap-7 border-b border-white/5 px-8 py-10 text-left sm:px-12 lg:w-[42%] lg:max-w-2xl lg:border-b-0 lg:border-r lg:py-12 xl:px-16">
            <h1 className="text-balance break-words bg-gradient-to-b from-white to-slate-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl md:text-5xl xl:text-5xl">
              {competition?.name ?? ''}
            </h1>

            <div className="inline-flex w-fit items-center gap-3.5 rounded-full border border-white/10 bg-white/[0.06] px-6 py-3 shadow-lg shadow-black/20 backdrop-blur-md">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
              </span>
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200 sm:text-base md:text-lg">
                {t.waiting}
              </span>
            </div>

            <p className="max-w-lg text-pretty text-base leading-relaxed text-slate-500 sm:text-lg">
              {t.waitingHint}
            </p>
          </div>

          {/* Right: poster — uses remaining width & full height */}
          <div className="relative flex min-h-[min(52vh,420px)] flex-1 flex-col items-center justify-center px-4 pb-8 pt-4 lg:min-h-0 lg:px-8 lg:py-8 xl:px-12">
            {competition?.poster_url ? (
              <div className="flex h-full max-h-full w-full min-h-0 flex-1 items-center justify-center">
                <div className="relative flex max-h-full max-w-full flex-col items-center justify-center">
                  <div className="rounded-[2rem] bg-gradient-to-br from-white/15 to-white/5 p-1 shadow-[0_25px_80px_-12px_rgba(0,0,0,0.65)] ring-1 ring-white/10 lg:rounded-[2.25rem]">
                    <div className="overflow-hidden rounded-[1.85rem] bg-slate-900/80 lg:rounded-[2.1rem]">
                      <img
                        src={competition.poster_url}
                        alt=""
                        className="max-h-[min(88dvh,88vh)] w-auto max-w-[min(96vw,56rem)] object-contain lg:max-h-[min(90dvh,92vh)] lg:max-w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="flex aspect-square max-h-[min(70dvh,560px)] w-full max-w-lg flex-1 items-center justify-center rounded-[2rem] bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 ring-1 ring-white/10"
                aria-hidden
              >
                <svg className="h-24 w-24 text-indigo-300/90 sm:h-32 sm:w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── active team / scores ─────────────────────────────────────────────────────

  if (!team) return null

  const eScore     = result ? (isRG ? (result.e_score ?? 0) : (result.e_score ?? 0) * 2) : null
  const aScore     = result?.a_score ?? null
  const dScore     = result?.dif_score ?? null
  const daScore    = result?.da_score ?? null
  const dbScore    = result?.db_score ?? null
  const penDisplay = totalPen > 0 ? -totalPen : null
  const final      = result?.final_score ?? null

  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col overflow-hidden text-white">

      {/* top bar */}
      <div className="shrink-0 flex items-center justify-between px-8 py-3 bg-slate-900 border-b border-slate-800">
        <span className="text-slate-300 text-base font-semibold min-w-0 break-words">{competition?.name}</span>
        {session && (
          <span className="text-slate-400 text-base shrink-0 ml-4">
            {categoryLabel(session.category, lang)}
            {' · '}
            {routineLabel(session.routine_type)}
            {' · '}
            {session.age_group_label}
          </span>
        )}
      </div>

      {/* main area */}
      <div className="flex-1 flex min-h-0">

        {/* team photo — falls back to club logo */}
        <div className="relative w-[38%] shrink-0 flex items-center justify-center p-8">
          {rank !== null && rankTotal > 0 && (
            <div
              className="absolute left-10 right-10 top-8 z-10 flex items-center gap-3 rounded-xl border border-white/15 bg-slate-950/70 px-4 py-2.5 backdrop-blur-sm transition-opacity duration-300"
              style={{ transitionDelay: scoreVisible ? '700ms' : '0ms', opacity: scoreVisible ? 1 : 0 }}
            >
              <div className={[
                'w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0',
                rank === 1 ? 'bg-yellow-400 text-slate-900'
                : rank === 2 ? 'bg-slate-300 text-slate-900'
                : rank === 3 ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-white',
              ].join(' ')}>
                {rank}
              </div>
              <span className="text-slate-200 text-xl font-medium">{t.rank(rank, rankTotal)}</span>
            </div>
          )}
          {team.photo_url ? (
            <img
              src={team.photo_url}
              alt={team.gymnast_display}
              className="w-full h-full object-contain max-h-full rounded-2xl"
            />
          ) : team.club.avatar_url ? (
            <img
              src={team.club.avatar_url}
              alt={team.club.club_name}
              className="w-full h-full object-contain max-h-full"
            />
          ) : (
            <div className="w-full aspect-square rounded-2xl bg-slate-800 flex items-center justify-center">
              <svg className="w-24 h-24 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* info + scores */}
        <div className="flex-1 flex flex-col justify-center pr-10 py-6 gap-4">

          {/* gymnast names */}
          <div>
            <p className="text-white font-bold leading-tight"
              style={{ fontSize: 'clamp(1.5rem, 3.4vw, 3.8rem)' }}>
              {team.gymnast_display}
            </p>
            {/* {dorsal !== null && (
              <p className="text-slate-400 text-xl mt-1">{t.dorsal(dorsal)}</p>
            )} */}
          </div>

          {/* club */}
          <div className="flex items-center gap-4">
            {team.club.avatar_url && (
              <img
                src={team.club.avatar_url}
                alt={team.club.club_name}
                className="w-12 h-12 object-contain rounded"
              />
            )}
            <p className="text-slate-300 text-2xl font-medium">{team.club.club_name}</p>
          </div>

          {/* separator */}
          <div className="border-t border-slate-700 my-2" />

          {/* scores area — animated on reveal */}
          <div
            key={`${tvState.session_id}-${tvState.team_id}`}
            className={[
              'grid grid-cols-[minmax(0,1fr)_minmax(17rem,24rem)] gap-8 items-start transition-opacity duration-300',
              scoreVisible ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          >
            {/* left: scores summary */}
            <div className="min-w-0 flex flex-col gap-4">
              {/* partial scores row */}
              {result && (
                <div className="flex items-center gap-6 flex-wrap">
                  {(isRG ? [
                    { label: t.eRg, value: eScore,     delay: 0   },
                    { label: t.a,   value: aScore,     delay: 100 },
                    { label: t.da,  value: daScore,    delay: 200 },
                    { label: t.db,  value: dbScore,    delay: 300 },
                    ...(penDisplay !== null
                      ? [{ label: t.penRj, value: penDisplay, delay: 400 }]
                      : []),
                  ] : [
                    { label: t.e,   value: eScore,     delay: 0   },
                    { label: t.a,   value: aScore,     delay: 100 },
                    { label: t.d,   value: dScore,     delay: 200 },
                    ...(penDisplay !== null
                      ? [{ label: t.pen, value: penDisplay, delay: 300 }]
                      : []),
                  ] as { label: string; value: number | null; delay: number }[]).map(({ label, value, delay }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center transition-all duration-300"
                      style={{ transitionDelay: scoreVisible ? `${delay}ms` : '0ms' }}
                    >
                      <span className="text-slate-400 text-sm uppercase tracking-widest">{label}</span>
                      <span className={[
                        'tabular-nums font-bold',
                        (label === t.pen || label === t.penRj) ? 'text-red-400' : 'text-white',
                      ].join(' ')}
                        style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)' }}>
                        {value != null
                          ? (label === t.pen || label === t.penRj)
                            ? value.toFixed(1)
                            : value.toFixed(3)
                          : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* provisional badge */}
              {result?.status === 'provisional' && (
                <div
                  className="flex items-center gap-2.5 transition-opacity duration-300"
                  style={{ transitionDelay: scoreVisible ? '350ms' : '0ms' }}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span className="text-amber-400 text-lg font-bold uppercase tracking-widest">
                    {t.provisional}
                  </span>
                </div>
              )}

              {/* final score */}
              {final !== null && (
                <div
                  className="flex items-baseline gap-4 transition-all duration-500"
                  style={{
                    transitionDelay: scoreVisible ? '400ms' : '0ms',
                    transform: scoreVisible ? 'scale(1)' : 'scale(0.7)',
                    transformOrigin: 'left center',
                  }}
                >
                  <span className="text-slate-400 text-2xl uppercase tracking-widest">{t.total}</span>
                  <span
                    className="text-white font-black tabular-nums"
                    style={{ fontSize: 'clamp(3rem, 7vw, 7rem)' }}
                  >
                    {final.toFixed(3)}
                  </span>
                </div>
              )}
            </div>

            {/* right: penalty reasons */}
            <div className="min-w-0">
              {scoreVisible && allPenalties.length > 0 && (
                <div
                  className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 transition-opacity duration-300"
                  style={{ transitionDelay: scoreVisible ? '900ms' : '0ms' }}
                >
                  <p className="text-slate-400 text-sm uppercase tracking-[0.2em] mb-2">{t.penLabel}</p>
                  <ul className="space-y-1.5">
                    {allPenalties.map((p, i) => (
                      <li key={i} className="text-red-300 text-base leading-snug break-words">
                        {'−'}{p.value.toFixed(1)} · {p.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
