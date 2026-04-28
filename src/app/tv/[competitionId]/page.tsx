'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { PenaltyState } from '@/components/cjp/types'
import { activePenalties, activeDJPenalties } from '@/lib/penaltyLabels'
import type { ElementFlags } from '@/components/dj-scoring/types'
import { categoryLabel } from '@/components/admin/types'

// ─── types ────────────────────────────────────────────────────────────────────

type Lang = 'en' | 'es'

type TVState = {
  session_id: string | null
  team_id: string | null
  revealed: boolean
}

type TeamData = {
  gymnast_display: string
  photo_url: string | null
  club: { club_name: string; avatar_url: string | null }
}

type SessionData = {
  age_group: string
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
  final_score: number | null
  cjp_penalty_detail: PenaltyState | null
  dj_penalty_detail: ElementFlags | null
}

type CompetitionData = {
  name: string
  poster_url: string | null
}

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    waiting: 'Waiting for results',
    balance: 'Balance', dynamic: 'Dynamic', combined: 'Combined',
    e: 'E×2', a: 'A', d: 'D', pen: 'Pen.',
    total: 'TOTAL',
    rank: (n: number, total: number) => `#${n} of ${total}`,
    penLabel: 'Penalties',
    dorsal: (n: number) => `#${n}`,
  },
  es: {
    waiting: 'Esperando resultados',
    balance: 'Equilibrio', dynamic: 'Dinámico', combined: 'Combinado',
    e: 'E×2', a: 'A', d: 'D', pen: 'Pen.',
    total: 'TOTAL',
    rank: (n: number, total: number) => `#${n} de ${total}`,
    penLabel: 'Penalizaciones',
    dorsal: (n: number) => `#${n}`,
  },
}

// ─── component ────────────────────────────────────────────────────────────────

export default function TVPage() {
  const { competitionId } = useParams<{ competitionId: string }>()
  const searchParams = useSearchParams()
  const lang: Lang = (searchParams.get('lang') as Lang) === 'en' ? 'en' : 'es'
  const t = T[lang]

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

  // ── fetch competition info once ──────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('competitions')
        .select('name, poster_url')
        .eq('id', competitionId)
        .single()
      if (data) setCompetition({ name: data.name, poster_url: data.poster_url ?? null })
    }
    load()
  }, [competitionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetch initial tv_state then subscribe ────────────────────────────────────

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('tv_state')
        .select('session_id, team_id, revealed')
        .eq('competition_id', competitionId)
        .maybeSingle()
      const state: TVState = {
        session_id: data?.session_id ?? null,
        team_id:    data?.team_id    ?? null,
        revealed:   data?.revealed   ?? false,
      }
      setTvState(state)
      prevRevealedRef.current = state.revealed
      setScoreVisible(state.revealed)
    }
    load()

    const ch = supabase
      .channel(`tv-display-${competitionId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'tv_state',
        filter: `competition_id=eq.${competitionId}`,
      }, (payload) => {
        const row = payload.new as { session_id: string | null; team_id: string | null; revealed: boolean }
        const next: TVState = {
          session_id: row.session_id ?? null,
          team_id:    row.team_id    ?? null,
          revealed:   row.revealed   ?? false,
        }
        setTvState(next)
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [competitionId]) // eslint-disable-line react-hooks/exhaustive-deps

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
      return
    }

    const { session_id, team_id, revealed } = tvState

    // If only revealed changed (same team+session), just update scoreVisible.
    // If team changed, reset score visibility immediately before fetching.
    const teamChanged = team?.gymnast_display !== undefined &&
      prevRevealedRef.current !== null &&
      (tvState.session_id !== session?.age_group) // rough check handled below

    setScoreVisible(revealed)
    prevRevealedRef.current = revealed

    async function fetchDisplay() {
      const [teamRes, sessionRes, entryRes, resultRes] = await Promise.all([
        supabase
          .from('teams')
          .select('gymnast_display, photo_url, clubs(club_name, avatar_url)')
          .eq('id', team_id)
          .single(),
        supabase
          .from('sessions')
          .select('age_group, category, routine_type, competition_id, section_id, panel_id')
          .eq('id', session_id)
          .single(),
        supabase
          .from('competition_entries')
          .select('dorsal')
          .eq('competition_id', competitionId)
          .eq('team_id', team_id)
          .maybeSingle(),
        supabase
          .from('routine_results')
          .select('e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, cjp_penalty_detail, dj_penalty_detail')
          .eq('session_id', session_id)
          .eq('team_id', team_id)
          .maybeSingle(),
      ])

      if (teamRes.data) {
        const club = Array.isArray(teamRes.data.clubs)
          ? teamRes.data.clubs[0]
          : teamRes.data.clubs
        setTeam({
          gymnast_display: teamRes.data.gymnast_display,
          photo_url:       teamRes.data.photo_url ?? null,
          club: {
            club_name:  club?.club_name  ?? '',
            avatar_url: club?.avatar_url ?? null,
          },
        })
      }

      const sess = sessionRes.data
      if (sess) {
        setSession({
          age_group:  sess.age_group,
          category:   sess.category,
          routine_type: sess.routine_type,
          section_id: sess.section_id,
          panel_id:   sess.panel_id,
        })

        // Ranking: all approved results for same age_group + category + routine_type
        const { data: peerSessions } = await supabase
          .from('sessions')
          .select('id')
          .eq('competition_id', competitionId)
          .eq('age_group', sess.age_group)
          .eq('category', sess.category)
          .eq('routine_type', sess.routine_type)

        if (peerSessions && peerSessions.length > 0) {
          const ids = peerSessions.map((s) => s.id)
          const { data: allResults } = await supabase
            .from('routine_results')
            .select('team_id, final_score')
            .in('session_id', ids)
            .eq('status', 'approved')
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
          final_score:         resultRes.data.final_score,
          cjp_penalty_detail:  resultRes.data.cjp_penalty_detail as PenaltyState | null,
          dj_penalty_detail:   resultRes.data.dj_penalty_detail as ElementFlags | null,
        })
      } else {
        setResult(null)
      }
    }

    fetchDisplay()
  }, [tvState?.session_id, tvState?.team_id, tvState?.revealed]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── helpers ──────────────────────────────────────────────────────────────────

  const routineLabel = (rt: string) =>
    ({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined }[rt] ?? rt)

  const djPenalties  = result?.dj_penalty_detail
    ? activeDJPenalties(result.dj_penalty_detail, lang)
    : []
  const cjpPenalties = result?.cjp_penalty_detail
    ? activePenalties(result.cjp_penalty_detail, lang)
    : []
  const allPenalties = [...djPenalties, ...cjpPenalties]

  const totalPen = (result?.dif_penalty ?? 0) + (result?.cjp_penalty ?? 0)

  // ── idle state ───────────────────────────────────────────────────────────────

  if (!tvState?.team_id || !team) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
        {competition?.poster_url && (
          <img
            src={competition.poster_url}
            alt={competition?.name ?? ''}
            className="max-h-56 max-w-xs object-contain mb-10 opacity-80"
          />
        )}
        <p className="text-white text-5xl font-bold text-center px-8 mb-4">
          {competition?.name ?? ''}
        </p>
        <p className="text-slate-500 text-xl tracking-widest uppercase">{t.waiting}</p>
      </div>
    )
  }

  // ── active state ─────────────────────────────────────────────────────────────

  const eScore     = result ? (result.e_score ?? 0) * 2 : null
  const aScore     = result?.a_score ?? null
  const dScore     = result?.dif_score ?? null
  const penDisplay = totalPen > 0 ? -totalPen : null
  const final      = result?.final_score ?? null

  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col overflow-hidden text-white">

      {/* top bar */}
      <div className="shrink-0 flex items-center justify-between px-8 py-3 bg-slate-900 border-b border-slate-800">
        <span className="text-slate-300 text-lg font-semibold truncate">{competition?.name}</span>
        {session && (
          <span className="text-slate-400 text-base shrink-0 ml-4">
            {categoryLabel(session.category, lang)}
            {' · '}
            {routineLabel(session.routine_type)}
            {' · '}
            {session.age_group}
          </span>
        )}
      </div>

      {/* main area */}
      <div className="flex-1 flex min-h-0">

        {/* team photo */}
        <div className="w-[38%] shrink-0 flex items-center justify-center p-8">
          {team.photo_url ? (
            <img
              src={team.photo_url}
              alt={team.gymnast_display}
              className="w-full h-full object-contain max-h-full rounded-2xl"
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
              style={{ fontSize: 'clamp(2rem, 4.5vw, 5rem)' }}>
              {team.gymnast_display}
            </p>
            {dorsal !== null && (
              <p className="text-slate-400 text-xl mt-1">{t.dorsal(dorsal)}</p>
            )}
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
              'flex flex-col gap-4 transition-opacity duration-300',
              scoreVisible ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          >
            {/* partial scores row */}
            {result && (
              <div className="flex items-center gap-6 flex-wrap">
                {([
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
                      label === t.pen ? 'text-red-400' : 'text-white',
                    ].join(' ')}
                      style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)' }}>
                      {value != null
                        ? label === t.pen
                          ? value.toFixed(1)
                          : value.toFixed(3)
                        : '—'}
                    </span>
                  </div>
                ))}
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

            {/* ranking */}
            {rank !== null && rankTotal > 0 && (
              <div
                className="flex items-center gap-3 transition-all duration-300"
                style={{ transitionDelay: scoreVisible ? '700ms' : '0ms' }}
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
                <span className="text-slate-400 text-xl">{t.rank(rank, rankTotal)}</span>
              </div>
            )}

            {/* penalty reasons */}
            {scoreVisible && allPenalties.length > 0 && (
              <div
                className="transition-opacity duration-300"
                style={{ transitionDelay: scoreVisible ? '900ms' : '0ms' }}
              >
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">{t.penLabel}</p>
                <ul className="space-y-0.5">
                  {allPenalties.map((p, i) => (
                    <li key={i} className="text-red-400 text-sm">
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
  )
}
