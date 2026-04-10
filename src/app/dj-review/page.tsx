'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import DJReview from '@/components/dj-review/DJReview'
import AuthBar from '@/components/shared/AuthBar'
import type { Lang } from '@/components/aj-scoring/types'
import type { Sheet } from '@/components/dj-review/types'

function DJReviewPage() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const filterCompId = searchParams.get('comp')
  const [lang, setLang] = useState<Lang>('es')
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [loading, setLoading] = useState(true)
  const [myJudgeId, setMyJudgeId] = useState<string>('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: prof } = await supabase
        .from('profiles').select('id').eq('auth_id', user.id).single()
      if (!prof) { setLoading(false); return }
      const { data: judge } = await supabase
        .from('judges').select('id').eq('id', prof.id).single()
      if (!judge) { setLoading(false); return }
      setMyJudgeId(judge.id)

      // 1. SPJs where this judge is assigned as DJ (role filter)
      const { data: spjs } = await supabase
        .from('section_panel_judges')
        .select('section_id, panel_id')
        .eq('judge_id', judge.id)
        .eq('role', 'DJ')
      if (!spjs?.length) { setLoading(false); return }

      const sectionIds = [...new Set(spjs.map(s => s.section_id))]

      // 2. Only locked panels
      const { data: locks } = await (supabase as any)
        .from('section_panel_locks')
        .select('section_id, panel_id')
        .in('section_id', sectionIds)
        .eq('locked', true)

      const lockedPairs = new Set(
        ((locks ?? []) as { section_id: string; panel_id: string }[])
          .map(l => `${l.section_id}|${l.panel_id}`)
      )
      const lockedSpjs = spjs.filter(s => lockedPairs.has(`${s.section_id}|${s.panel_id}`))
      if (!lockedSpjs.length) { setLoading(false); return }

      const lockedSectionIds = [...new Set(lockedSpjs.map(s => s.section_id))]

      // 3. Sections → competitions
      const { data: sections } = await supabase
        .from('sections')
        .select('id, competition_id')
        .in('id', lockedSectionIds)
      if (!sections?.length) { setLoading(false); return }

      const competitionIds = [...new Set(sections.map(s => s.competition_id))]
      const sectionToComp = Object.fromEntries(sections.map(s => [s.id, s.competition_id]))

      // 4. Competitions where ts_music_deadline has passed (or fallback: registration_closed/active/finished)
      const { data: competitions } = await supabase
        .from('competitions')
        .select('id, status, ts_music_deadline')
        .in('id', competitionIds)
      if (!competitions?.length) { setLoading(false); return }

      const today = new Date().toISOString().slice(0, 10)
      const validComps = (competitions as { id: string; status: string; ts_music_deadline: string | null }[])
        .filter(c =>
          // if admin set an explicit deadline, use it strictly (covers both open and close actions)
          c.ts_music_deadline !== null
            ? today > c.ts_music_deadline
            : ['registration_closed', 'active', 'finished'].includes(c.status)
        )
      if (!validComps.length) { setLoading(false); return }

      const allValidCompIds = new Set(validComps.map(c => c.id))
      // If a specific competition was requested, scope to it only
      const validCompIds = filterCompId && allValidCompIds.has(filterCompId)
        ? new Set([filterCompId])
        : allValidCompIds
      const validSpjs = lockedSpjs.filter(s => validCompIds.has(sectionToComp[s.section_id]))
      if (!validSpjs.length) { setLoading(false); return }

      const validSectionIds = [...new Set(validSpjs.map(s => s.section_id))]
      const validPanelIds   = [...new Set(validSpjs.map(s => s.panel_id))]

      // 5. Sessions for my DJ panels
      const { data: allSessions } = await supabase
        .from('sessions')
        .select('id, section_id, panel_id, routine_type, competition_id, age_group, category')
        .in('section_id', validSectionIds)
        .in('panel_id', validPanelIds)
      if (!allSessions?.length) { setLoading(false); return }

      const spjPairs = new Set(validSpjs.map(s => `${s.section_id}|${s.panel_id}`))
      const mySessions = allSessions.filter(
        s => spjPairs.has(`${s.section_id}|${s.panel_id}`) && validCompIds.has(s.competition_id)
      )
      if (!mySessions.length) { setLoading(false); return }

      const sessionIds = mySessions.map(s => s.id)

      // 6. Starting order — with fallback to competition_entries
      const { data: orders } = await supabase
        .from('session_orders')
        .select('session_id, team_id')
        .in('session_id', sessionIds)

      let sessionTeams: { session_id: string; team_id: string }[] = orders ?? []

      if (sessionTeams.length === 0) {
        // Fallback: registered teams filtered by session age_group + category
        const { data: entries } = await supabase
          .from('competition_entries')
          .select('team_id, competition_id')
          .in('competition_id', [...validCompIds])
          .eq('dropped_out', false)

        if (entries?.length) {
          const entryTeamIds = [...new Set(entries.map(e => e.team_id))]
          const { data: entryTeams } = await supabase
            .from('teams')
            .select('id, age_group, category')
            .in('id', entryTeamIds)

          const teamInfoMap = Object.fromEntries((entryTeams ?? []).map(t => [t.id, t]))

          for (const session of mySessions) {
            const matching = entries.filter(e => {
              const info = teamInfoMap[e.team_id]
              return (
                e.competition_id === session.competition_id &&
                info?.age_group === session.age_group &&
                info?.category === session.category
              )
            })
            for (const entry of matching) {
              sessionTeams.push({ session_id: session.id, team_id: entry.team_id })
            }
          }
        }
      }

      if (!sessionTeams.length) { setLoading(false); return }

      const teamIds = [...new Set(sessionTeams.map(o => o.team_id))]

      // Load all DJs for these section+panel pairs to detect 2-DJ panels
      const { data: panelDJRows } = await supabase
        .from('section_panel_judges')
        .select('section_id, panel_id, judge_id')
        .eq('role', 'DJ')
        .in('section_id', validSectionIds)
        .in('panel_id', validPanelIds)

      const djsPerPanel: Record<string, string[]> = {}
      for (const row of panelDJRows ?? []) {
        // Instead of pushing directly, filter out nulls
        const key = `${row.section_id}|${row.panel_id}`
        if (!djsPerPanel[key]) djsPerPanel[key] = []
        if (row.judge_id) {  // Only push if not null
          djsPerPanel[key].push(row.judge_id)
        }
      }

      const [teamsRes, musicRes, rulesRes, elementsRes, reviewRes] = await Promise.all([
        supabase.from('teams').select('id, gymnast_display, age_group, category').in('id', teamIds),
        supabase.from('routine_music')
          .select('team_id, competition_id, routine_type, ts_path')
          .in('team_id', teamIds).in('competition_id', [...validCompIds]),
        supabase.from('age_group_rules').select('id, age_group, ruleset'),
        supabase.from('ts_elements')
          .select('id, team_id, competition_id, routine_type, position, label, element_type, is_static, difficulty_value')
          .in('team_id', teamIds).in('competition_id', [...validCompIds])
          .order('position'),
        supabase.from('ts_review_status')
          .select('team_id, competition_id, routine_type, status, dj1_id, dj1_decision, dj1_comment, dj2_id, final_comment')
          .in('team_id', teamIds).in('competition_id', [...validCompIds]),
      ])

      const agLabels: Record<string, string> = Object.fromEntries(
        ((rulesRes.data ?? []) as unknown as { id: string; age_group: string; ruleset: string }[])
          .map(r => [r.id, `${r.age_group} (${r.ruleset})`])
      )

      const teamMap: Record<string, { gymnast_display: string; age_group: string; category: string }> =
        Object.fromEntries((teamsRes.data ?? []).map(t => [t.id, t]))

      type RawElement = { id: string; team_id: string; competition_id: string; routine_type: string; position: number; label: string; element_type: string; is_static: boolean; difficulty_value: number }
      const rawElements = (elementsRes.data ?? []) as RawElement[]

      type RawReview = { team_id: string; competition_id: string; routine_type: string; status: string; dj1_id: string | null; dj1_decision: string | null; dj1_comment: string | null; dj2_id: string | null; final_comment: string | null }
      const rawReviews = (reviewRes.data ?? []) as RawReview[]

      // Build one sheet per (session × team), deduplicating
      const seenKeys = new Set<string>()
      const builtSheets: Sheet[] = sessionTeams.flatMap(o => {
        const key = `${o.session_id}_${o.team_id}`
        if (seenKeys.has(key)) return []
        seenKeys.add(key)

        const session = mySessions.find(s => s.id === o.session_id)
        if (!session) return []
        const team = teamMap[o.team_id]
        if (!team) return []
        const music = (musicRes.data ?? []).find(
          m =>
            m.team_id === o.team_id &&
            m.competition_id === session.competition_id &&
            m.routine_type === session.routine_type
        )
        const sheetElements = rawElements
          .filter(e => e.team_id === o.team_id && e.competition_id === session.competition_id && e.routine_type === session.routine_type)
          .map(e => ({
            id:              e.id,
            position:        e.position,
            label:           e.label,
            elementType:     e.element_type as import('@/components/dj-review/types').ElementType,
            isStatic:        e.is_static,
            difficultyValue: e.difficulty_value,
          }))
        const spjKey = `${session.section_id}|${session.panel_id}`
        const hasTwoDJs = (djsPerPanel[spjKey]?.length ?? 0) >= 2

        const reviewRow = rawReviews.find(
          r => r.team_id === o.team_id && r.competition_id === session.competition_id && r.routine_type === session.routine_type
        )
        return [{
          id:            key,
          teamId:        o.team_id,
          competitionId: session.competition_id,
          gymnasts:      team.gymnast_display,
          ageGroup:      agLabels[team.age_group] ?? team.age_group,
          category:      team.category,
          routineType:   session.routine_type,
          pdfUrl:        music?.ts_path ?? null,
          elements:      sheetElements,
          reviewStatus:  (reviewRow?.status ?? 'pending') as import('@/components/dj-review/types').TsReviewStatus,
          dj1Id:         reviewRow?.dj1_id ?? null,
          dj1Decision:   (reviewRow?.dj1_decision ?? null) as 'checked' | 'incorrect' | null,
          dj1Comment:    reviewRow?.dj1_comment ?? null,
          dj2Id:         reviewRow?.dj2_id ?? null,
          finalComment:  reviewRow?.final_comment ?? null,
          hasTwoDJs,
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
      <AuthBar lang={lang} onLangChange={setLang} />
      <div className="max-w-5xl mx-auto pt-4 pb-16">
        <DJReview initialSheets={sheets} myJudgeId={myJudgeId} lang={lang} />
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <DJReviewPage />
    </Suspense>
  )
}
