'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { Competition, Panel, Section, Session, SessionOrder, Team, Club, CompetitionEntry, AgeGroupRule } from '@/components/admin/types'
import StartingOrderView from '@/components/starting-order/StartingOrderView'

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const [lang, setLang] = useState<Lang>('es')

  const [competition,   setCompetition]   = useState<Competition | null>(null)
  const [panels,        setPanels]        = useState<Panel[]>([])
  const [sections,      setSections]      = useState<Section[]>([])
  const [sessions,      setSessions]      = useState<Session[]>([])
  const [sessionOrders, setSessionOrders] = useState<SessionOrder[]>([])
  const [lockedSessions,setLockedSessions]= useState<string[]>([])
  const [globalTeams,   setGlobalTeams]   = useState<Team[]>([])
  const [clubs,         setClubs]         = useState<Club[]>([])
  const [entries,       setEntries]       = useState<CompetitionEntry[]>([])
  const [ageGroupRules, setAgeGroupRules] = useState<AgeGroupRule[]>([])
  const [completedRoutineKeys, setCompletedRoutineKeys] = useState<string[]>([])
  const [ongoingRoutineKey, setOngoingRoutineKey] = useState<string | null>(null)
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    async function load() {
      // ── first wave: competition + panels + sections + sessions + entries ──────
      const [compRes, panelsRes, sectionsRes, sessionsRes, entriesRes, rulesRes, resultsRes, tvStateRes] = await Promise.all([
        supabase.from('competitions')
          .select('id, name, status, location, start_date, end_date, provisional_entry_deadline, definitive_entry_deadline, registration_deadline, ts_music_deadline, age_groups, poster_url, logo_url, created_at, fee_per_team, fee_per_gymnast, judge_missing_fine')
          .eq('id', id).single(),
        supabase.from('panels')
          .select('id, competition_id, panel_number')
          .eq('competition_id', id)
          .order('panel_number'),
        supabase.from('sections')
          .select('id, competition_id, section_number, label, starting_time, waiting_time_seconds, warmup_duration_minutes, timeline_order')
          .eq('competition_id', id)
          .order('section_number'),
        supabase.from('sessions')
          .select('id, competition_id, panel_id, section_id, name, age_group, category, routine_type, status, order_index, order_locked')
          .eq('competition_id', id)
          .order('order_index'),
        supabase.from('competition_entries')
          .select('id, competition_id, team_id, dorsal, dropped_out, gymnast_display, gymnast_ids')
          .eq('competition_id', id),
        supabase.from('age_group_rules')
          .select('id, age_group, ruleset, min_age, max_age, routine_count')
          .order('sort_order'),
        supabase.from('routine_results')
          .select('session_id, team_id')
          .eq('competition_id', id)
          .in('status', ['approved', 'provisional']),
        supabase.from('tv_state')
          .select('session_id, team_id')
          .eq('competition_id', id)
          .maybeSingle(),
      ])

      if (!compRes.data) { setLoading(false); return }

      const comp: Competition = { ...compRes.data, admin: null }
      const rawSessions = sessionsRes.data ?? []
      const rawEntries  = entriesRes.data  ?? []
      const entryDisplayMap = Object.fromEntries(rawEntries.map(e => [e.team_id, (e as any).gymnast_display as string | null]))

      const locked    = rawSessions.filter((s) => s.order_locked).map((s) => s.id)
      const teamIds   = rawEntries.map((e) => e.team_id)

      // ── second wave: session_orders + teams ───────────────────────────────────
      const [ordersRes, teamsRes] = await Promise.all([
        locked.length > 0
          ? supabase.from('session_orders').select('session_id, team_id, position').in('session_id', locked)
          : Promise.resolve({ data: [] as SessionOrder[] }),
        teamIds.length > 0
          ? supabase.from('teams').select('id, club_id, category, age_group, gymnast_display, photo_url').in('id', teamIds)
          : Promise.resolve({ data: [] as Team[] }),
      ])

      const rawTeams = (teamsRes.data ?? []).map(t => ({
        ...t,
        gymnast_display: entryDisplayMap[t.id] ?? t.gymnast_display,
      }))
      const clubIds  = [...new Set(rawTeams.map((t) => t.club_id))]

      // ── third wave: clubs ─────────────────────────────────────────────────────
      const { data: clubsData } = clubIds.length > 0
        ? await supabase.from('clubs').select('id, club_name, contact_name, phone, avatar_url').in('id', clubIds)
        : { data: [] as Club[] }

      setCompetition(comp)
      setPanels((panelsRes.data ?? []) as unknown as Panel[])
      setSections((sectionsRes.data ?? []) as unknown as Section[])
      setSessions(rawSessions.map(({ order_locked: _, ...s }) => s) as Session[])
      setLockedSessions(locked)
      setSessionOrders(ordersRes.data ?? [])
      setEntries(rawEntries)
      setGlobalTeams(rawTeams)
      setClubs(clubsData ?? [])
      setAgeGroupRules((rulesRes.data ?? []) as unknown as AgeGroupRule[])
      setCompletedRoutineKeys((resultsRes.data ?? []).map((r) => `${r.session_id}:${r.team_id}`))
      setOngoingRoutineKey(tvStateRes.data?.session_id && tvStateRes.data?.team_id
        ? `${tvStateRes.data.session_id}:${tvStateRes.data.team_id}`
        : null)
      setLoading(false)
    }
    load()

    const resultsChannel = supabase
      .channel(`starting-order-results-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'routine_results', filter: `competition_id=eq.${id}` },
        async () => {
          const { data } = await supabase
            .from('routine_results')
            .select('session_id, team_id')
            .eq('competition_id', id)
            .in('status', ['approved', 'provisional'])
          setCompletedRoutineKeys((data ?? []).map((r) => `${r.session_id}:${r.team_id}`))
        },
      )
      .subscribe()

    const tvStateChannel = supabase
      .channel(`starting-order-tv-state-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tv_state', filter: `competition_id=eq.${id}` },
        (payload) => {
          const row = payload.new as { session_id: string | null; team_id: string | null }
          setOngoingRoutineKey(row?.session_id && row?.team_id ? `${row.session_id}:${row.team_id}` : null)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(resultsChannel)
      supabase.removeChannel(tvStateChannel)
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  if (!competition) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-sm text-slate-400">Competition not found.</p>
    </div>
  )

  return (
    <div>
      {/* dev toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">Starting Order</span>
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

      <StartingOrderView
        lang={lang}
        competition={competition}
        sections={sections}
        panels={panels}
        sessions={sessions}
        sessionOrders={sessionOrders}
        lockedSessions={lockedSessions}
        globalTeams={globalTeams}
        clubs={clubs}
        entries={entries}
        ageGroupRules={ageGroupRules}
        completedRoutineKeys={completedRoutineKeys}
        ongoingRoutineKey={ongoingRoutineKey}
      />
    </div>
  )
}
