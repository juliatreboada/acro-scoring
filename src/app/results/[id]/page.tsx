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

      // ── sessions for this competition ──────────────────────────────────────
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, age_group, category, routine_type')
        .eq('competition_id', id)

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
        ? await supabase.from('teams').select('id, gymnast_display').in('id', teamIds)
        : { data: [] }

      const teamMap   = Object.fromEntries((teams ?? []).map((t) => [t.id, t.gymnast_display]))
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
          ageGroup:    session?.age_group   ?? '',
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
      {/* lang toggle */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10">
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
      />
    </div>
  )
}
