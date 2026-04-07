'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import ResultsView from '@/components/results/ResultsView'
import type { Lang } from '@/components/aj-scoring/types'
import type { MockPerf, RoutineResult } from '@/components/cjp/types'

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [lang, setLang]                   = useState<Lang>('es')
  const [competitionName, setCompName]    = useState('')
  const [performances, setPerformances]   = useState<MockPerf[]>([])
  const [results, setResults]             = useState<Record<string, RoutineResult>>({})
  const [clubAvatarByTeam, setClubAvatarByTeam] = useState<Record<string, string | null>>({})
  const [agSortOrder, setAgSortOrder]     = useState<Record<string, number>>({})
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    async function load() {
      // ── competition name ───────────────────────────────────────────────────
      const { data: comp } = await supabase
        .from('competitions')
        .select('name')
        .eq('id', id)
        .single()

      if (!comp) { setLoading(false); return }
      setCompName(comp.name)

      // ── sessions + age group labels (parallel) ────────────────────────────
      const [sessionsRes, ageGroupRulesRes] = await Promise.all([
        supabase.from('sessions').select('id, age_group, category, routine_type').eq('competition_id', id),
        supabase.from('age_group_rules').select('id, age_group, sort_order, ruleset'),
      ])
      const sessions = sessionsRes.data
      const agRules = ageGroupRulesRes.data ?? []
      const agLabelMap    = Object.fromEntries(agRules.map((r) => [r.id, r.age_group]))
      const agSortOrder = Object.fromEntries(agRules.map((r) => [r.age_group, r.sort_order ?? 0]))

      if (!sessions?.length) { setLoading(false); return }

      const sessionIds = sessions.map((s) => s.id)

      // ── session_orders + routine_results + entries (parallel) ──────────────
      const [ordersRes, resultsRes, entriesRes] = await Promise.all([
        supabase
          .from('session_orders')
          .select('session_id, team_id, position')
          .in('session_id', sessionIds)
          .order('position'),
        supabase
          .from('routine_results')
          .select('session_id, team_id, e_score, a_score, dif_score, dif_penalty, cjp_penalty, final_score, status')
          .in('session_id', sessionIds),
        supabase
          .from('competition_entries')
          .select('team_id, dropped_out')
          .eq('competition_id', id),
      ])

      const orders  = ordersRes.data  ?? []
      const rawRes  = resultsRes.data ?? []
      const entries = entriesRes.data ?? []

      // ── teams referenced by orders ─────────────────────────────────────────
      const teamIds = [...new Set(orders.map((o) => o.team_id))]
      const { data: teams } = teamIds.length > 0
        ? await supabase.from('teams').select('id, gymnast_display, club_id').in('id', teamIds)
        : { data: [] }

      const teamMap   = Object.fromEntries((teams ?? []).map((t) => [t.id, t.gymnast_display]))

      // ── fetch clubs for avatars ────────────────────────────────────────────
      const clubIds = [...new Set((teams ?? []).map(t => (t as any).club_id).filter(Boolean))]
      const { data: clubs } = clubIds.length > 0
        ? await supabase.from('clubs').select('id, avatar_url').in('id', clubIds)
        : { data: [] }
      const clubAvatarMap = Object.fromEntries((clubs ?? []).map(c => [c.id, c.avatar_url ?? null]))
      const teamClubAvatars: Record<string, string | null> = {}
      for (const t of teams ?? []) {
        const clubId = (t as any).club_id
        teamClubAvatars[t.id] = clubId ? (clubAvatarMap[clubId] ?? null) : null
      }
      setClubAvatarByTeam(teamClubAvatars)
      const sessionMap = Object.fromEntries(sessions.map((s) => [s.id, s]))
      const dropoutSet = new Set(entries.filter((e) => e.dropped_out).map((e) => e.team_id))

      // ── build MockPerf[] ───────────────────────────────────────────────────
      const perfs: MockPerf[] = orders.map((o) => {
        const session = sessionMap[o.session_id]
        return {
          id:          `${o.session_id}_${o.team_id}`,
          teamId:      o.team_id,
          position:    o.position,
          gymnasts:    teamMap[o.team_id] ?? '',
          ageGroup:    agLabelMap[session?.age_group ?? ''] ?? session?.age_group ?? '',
          category:    session?.category    ?? '',
          routineType: session?.routine_type ?? '',
          skipped:     dropoutSet.has(o.team_id),
          elements:    [],
        }
      })

      // ── build results record ───────────────────────────────────────────────
      const resultsMap: Record<string, RoutineResult> = {}
      for (const r of rawRes) {
        const perfId = `${r.session_id}_${r.team_id}`
        resultsMap[perfId] = {
          performanceId: perfId,
          eScore:     r.e_score     ?? 0,
          aScore:     r.a_score     ?? 0,
          difScore:   r.dif_score   ?? 0,
          difPenalty: r.dif_penalty ?? 0,
          cjpPenalty: r.cjp_penalty ?? 0,
          finalScore: r.final_score ?? 0,
          status:     r.status as 'provisional' | 'approved',
        }
      }

      setPerformances(perfs)
      setResults(resultsMap)
      setAgSortOrder(agSortOrder)
      setLoading(false)
    }
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* lang toggle + print */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10 print:hidden">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['en', 'es'] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={['px-3 py-1 rounded-md text-sm font-medium transition-all',
                lang === l ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'].join(' ')}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          {lang === 'en' ? 'Print' : 'Imprimir'}
        </button>
      </div>

      {/* competition header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            {lang === 'en' ? 'Results' : 'Resultados'}
          </p>
          <h1 className="text-xl font-bold text-slate-800">{competitionName}</h1>
        </div>
      </div>

      <ResultsView
        performances={performances}
        results={results}
        lang={lang}
        clubAvatarByTeam={clubAvatarByTeam}
        agSortOrder={agSortOrder}
      />
    </div>
  )
}
