'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import DJReview from '@/components/dj-review/DJReview'
import AuthBar from '@/components/shared/AuthBar'
import type { Lang } from '@/components/aj-scoring/types'
import type { Sheet } from '@/components/dj-review/types'

export default function Page() {
  const supabase = createClient()
  const [lang, setLang] = useState<Lang>('en')
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // In new schema, judges.id = profiles.id = auth.uid()
      const { data: judge } = await supabase
        .from('judges').select('id').eq('id', user.id).single()
      if (!judge) { setLoading(false); return }

      // find this judge's section_panel_judge assignments
      const { data: spjs } = await supabase
        .from('section_panel_judges').select('section_id, panel_id').eq('judge_id', judge.id)
      if (!spjs?.length) { setLoading(false); return }

      const sectionIds = [...new Set(spjs.map(s => s.section_id))]
      const panelIds   = [...new Set(spjs.map(s => s.panel_id))]

      const { data: allSessions } = await supabase
        .from('sessions')
        .select('id, section_id, panel_id, routine_type, competition_id, age_group, category')
        .in('section_id', sectionIds).in('panel_id', panelIds)

      if (!allSessions?.length) { setLoading(false); return }

      const spjPairs = new Set(spjs.map(s => `${s.section_id}|${s.panel_id}`))
      const mySessions = allSessions.filter(s => spjPairs.has(`${s.section_id}|${s.panel_id}`))
      if (!mySessions.length) { setLoading(false); return }

      // collect all team IDs + competition IDs from session orders
      const sessionIds     = mySessions.map(s => s.id)
      const competitionIds = [...new Set(mySessions.map(s => s.competition_id))]

      const { data: orders } = await supabase
        .from('session_orders').select('session_id, team_id').in('session_id', sessionIds)
      if (!orders?.length) { setLoading(false); return }

      const teamIds = [...new Set(orders.map(o => o.team_id))]

      const [teamsRes, musicRes] = await Promise.all([
        supabase.from('teams').select('id, gymnast_display, age_group, category').in('id', teamIds),
        supabase.from('routine_music')
          .select('team_id, competition_id, routine_type, ts_path')
          .in('team_id', teamIds).in('competition_id', competitionIds),
      ])

      const teamMap: Record<string, { gymnast_display: string; age_group: string; category: string }> =
        Object.fromEntries((teamsRes.data ?? []).map(t => [t.id, t]))

      // Build sheets: one per team per session (matching routine type)
      const builtSheets: Sheet[] = orders.flatMap(o => {
        const session = mySessions.find(s => s.id === o.session_id)
        if (!session) return []
        const team = teamMap[o.team_id]
        if (!team) return []
        const music = (musicRes.data ?? []).find(
          m => m.team_id === o.team_id &&
               m.competition_id === session.competition_id &&
               m.routine_type === session.routine_type
        )
        return [{
          id:          `${o.session_id}_${o.team_id}`,
          gymnasts:    team.gymnast_display,
          ageGroup:    team.age_group,
          category:    team.category,
          routineType: session.routine_type,
          pdfUrl:      music?.ts_path ?? null,
          reviewedAt:  null,
          elements:    [],
        }]
      })

      setSheets(builtSheets)
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100">
      <AuthBar />
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-4 flex-wrap sticky top-0 z-10">
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
      <div className="max-w-5xl mx-auto pt-4 pb-16">
        <DJReview initialSheets={sheets} lang={lang} />
      </div>
    </div>
  )
}
