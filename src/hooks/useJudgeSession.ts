'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useProfile } from '@/contexts/ProfileContext'
import type { PanelJudge, ScoringPerformance, JudgeScore, RoutineResult, PenaltyState } from '@/components/scoring/types'
import type { SessionStatus } from '@/components/judge/JudgeSession'
import type { Json } from '@/lib/database.types'
import { fetchPeerSessionIdsForRanking } from '@/lib/rankingPeers'
import { ageGroupLabel } from '@/components/admin/types'
import type { AgeGroupRule } from '@/components/admin/types'
import { useSectionPractice } from '@/hooks/useSectionPractice'
import { resolveRoutineTypeForTeamInSession, type SessionMapRow } from '@/lib/openCombinadosBracket'

// ─── types ────────────────────────────────────────────────────────────────────

function parseTimelineOrder(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export type JudgeSessionData = {
  loading:       boolean
  sessionId:     string | null
  sessionStatus: SessionStatus
  currentPerfId: string | null
  currentPerf:   ScoringPerformance | null
  assignedRoles: PanelJudge[]
  panelJudges:   PanelJudge[]
  performances:  ScoringPerformance[]
  /** Includes peer sessions when `ranking_merge_group_id` is set (CJP ranking only). */
  rankingPerformances: ScoringPerformance[]
  judgeScores:   Record<string, JudgeScore[]>
  results:       Record<string, RoutineResult>
  djMethod:      string | null
  ejMethod:      string | null
  submitError:   string | null
  practiceMode:  boolean
  practiceRoutinePerfId: string | null
  // acro handlers
  handleOpen:              (perfId: string) => Promise<void>
  handleSkip:              (perfId: string) => void
  handleCJPSubmit:         (status: 'provisional' | 'approved', result: RoutineResult, penaltyDetail?: PenaltyState | null) => Promise<void>
  handleReopenScore:       (perfId: string, panelJudgeId: string | 'all') => Promise<void>
  handleUnpublishResult:   (perfId: string) => Promise<void>
  handleJudgeScoreSubmit:  (score: JudgeScore) => Promise<void>
  handleEditScore:         (perfId: string, panelJudgeId: string, field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number) => void
  clearSubmitError:        () => void
  startSectionPractice:    () => Promise<void>
  stopSectionPractice:     () => Promise<void>
  // rg handlers
  handleRJSubmit:           (status: 'provisional' | 'approved', result: RoutineResult, penaltyDetail?: Json | null) => Promise<void>
  handleRGJudgeScoreSubmit: (score: JudgeScore) => Promise<void>
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useJudgeSession(sport: 'acro' | 'rg' = 'acro'): JudgeSessionData {
  const supabase = useMemo(() => createClient(), []) // eslint-disable-line react-hooks/exhaustive-deps
  const router = useRouter()
  const { activeProfile, profileLoading } = useProfile()
  const [loading,       setLoading]       = useState(true)
  const [sessionId,     setSessionId]     = useState<string | null>(null)
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('waiting')
  const [currentPerfId, setCurrentPerfId] = useState<string | null>(null)
  const [assignedRoles, setAssignedRoles] = useState<PanelJudge[]>([])
  const [panelJudges,   setPanelJudges]   = useState<PanelJudge[]>([])
  const [performances,  setPerformances]  = useState<ScoringPerformance[]>([])
  const [rankingPerformances, setRankingPerformances] = useState<ScoringPerformance[]>([])
  const [judgeScores,   setJudgeScores]   = useState<Record<string, JudgeScore[]>>({})
  const [results,       setResults]       = useState<Record<string, RoutineResult>>({})
  const [djMethod,      setDjMethod]      = useState<string | null>(null)
  const [ejMethod,      setEjMethod]      = useState<string | null>(null)
  const [submitError,   setSubmitError]   = useState<string | null>(null)
  // acro-only (null for rg)
  const [sectionId,     setSectionId]     = useState<string | null>(null)
  const [competitionId, setCompetitionId] = useState<string | null>(null)
  const [judgeId,       setJudgeId]       = useState<string | null>(null)

  const { practice, startPractice, stopPractice } = useSectionPractice(sectionId)
  const practiceMode = !!practice?.active
  const practiceRoutinePerfId =
    practice && practice.active
      ? `${practice.routineSessionId}_${practice.routineTeamId}`
      : null

  const sessionIdRef = useRef<string | null>(null)
  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])

  /** Session IDs whose routine_results feed the CJP ranking table (acro only). */
  const rankingPeerIdsRef = useRef<string[]>([])

  // ── prevent back navigation while in an active session ───────────────────────
  useEffect(() => {
    if (!sessionId) return
    window.history.pushState(null, '', window.location.href)
    function handlePopState() {
      window.history.pushState(null, '', window.location.href)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [sessionId])

  // ── initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (profileLoading) return
      if (!activeProfile) { setLoading(false); return }
      if (sport === 'acro') { await loadAcro() } else { await loadRG() }
    }

    async function loadAcro() {
      const { data: judge } = await supabase
        .from('judges').select('id').eq('id', activeProfile!.id).single()
      if (!judge) { setLoading(false); return }
      setJudgeId(judge.id)

      const { data: spjs } = await supabase
        .from('section_panel_judges')
        .select('id, section_id, panel_id, role, role_number')
        .eq('judge_id', judge.id)
      if (!spjs?.length) { setLoading(false); return }

      const sectionIds = [...new Set(spjs.map(s => s.section_id))]
      const panelIds   = [...new Set(spjs.map(s => s.panel_id))]

      const [{ data: allSessions }, { data: sectionRows }] = await Promise.all([
        supabase
          .from('sessions')
          .select('id, name, status, section_id, panel_id, competition_id, current_team_id, age_group, category, routine_type, dj_method, ej_method, order_index, ranking_merge_group_id')
          .in('section_id', sectionIds)
          .in('panel_id', panelIds),
        supabase
          .from('sections')
          .select('id, section_number, timeline_order')
          .in('id', sectionIds),
      ])

      if (!allSessions?.length) { setLoading(false); return }

      const spjPairs = new Set(spjs.map(s => `${s.section_id}|${s.panel_id}`))
      const mySessions = allSessions.filter(s => spjPairs.has(`${s.section_id}|${s.panel_id}`))
      if (!mySessions.length) { setLoading(false); return }

      const sectionOrderMap = new Map(
        (sectionRows ?? []).map((row) => [
          row.id,
          parseTimelineOrder(row.timeline_order) ?? row.section_number ?? Number.MAX_SAFE_INTEGER,
        ]),
      )

      const sortedMySessions = [...mySessions].sort((a, b) => {
        const secA = sectionOrderMap.get(a.section_id) ?? Number.MAX_SAFE_INTEGER
        const secB = sectionOrderMap.get(b.section_id) ?? Number.MAX_SAFE_INTEGER
        if (secA !== secB) return secA - secB
        const oiA = a.order_index ?? Number.MAX_SAFE_INTEGER
        const oiB = b.order_index ?? Number.MAX_SAFE_INTEGER
        if (oiA !== oiB) return oiA - oiB
        return a.id.localeCompare(b.id)
      })

      const session = sortedMySessions.find(s => s.status === 'active') ?? sortedMySessions[0]

      const mySpjsForSession = spjs.filter(
        s => s.section_id === session.section_id && s.panel_id === session.panel_id
      )

      const { data: allSpjs } = await supabase
        .from('section_panel_judges')
        .select('id, judge_id, role, role_number')
        .eq('section_id', session.section_id)
        .eq('panel_id',   session.panel_id)

      const judgeIds = [...new Set((allSpjs ?? []).filter(s => s.judge_id).map(s => s.judge_id as string))]
      const [judgesRes, ordersRes, scoresRes, resultsRes, rulesRes] = await Promise.all([
        judgeIds.length > 0
          ? supabase.from('judges').select('id, full_name').in('id', judgeIds)
          : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
        supabase.from('session_orders').select('position, team_id').eq('session_id', session.id).order('position'),
        supabase.from('scores').select('*').eq('session_id', session.id),
        supabase.from('routine_results').select('*').eq('session_id', session.id),
        supabase.from('age_group_rules').select('id, age_group, level, ruleset, sport_type'),
      ])

      const agLabels: Record<string, string> = Object.fromEntries(
        ((rulesRes.data ?? []) as unknown as { id: string; age_group: string; level: string; ruleset: string; sport_type: string }[])
          .map(r => [r.id, ageGroupLabel(r as unknown as AgeGroupRule, true)])
      )

      const judgeNameMap: Record<string, string> = Object.fromEntries(
        (judgesRes.data ?? []).map(j => [j.id, j.full_name])
      )

      const builtPanelJudges: PanelJudge[] = (allSpjs ?? []).map(s => ({
        id:         s.id,
        name:       s.judge_id ? (judgeNameMap[s.judge_id] ?? '—') : '—',
        role:       s.role as PanelJudge['role'],
        roleNumber: s.role_number,
      }))

      const builtAssignedRoles: PanelJudge[] = mySpjsForSession.map(s => ({
        id:         s.id,
        name:       judgeNameMap[judge.id] ?? '—',
        role:       s.role as PanelJudge['role'],
        roleNumber: s.role_number,
      }))

      let orderedEntries: { team_id: string; position: number }[] = (ordersRes.data ?? []).map(o => ({
        team_id: o.team_id, position: o.position,
      }))

      if (orderedEntries.length === 0) {
        const { data: entries } = await supabase
          .from('competition_entries')
          .select('team_id')
          .eq('competition_id', (session as any).competition_id)
          .eq('dropped_out', false)
        const { data: fallbackTeams } = (entries ?? []).length > 0
          ? await supabase.from('teams')
              .select('id, gymnast_display')
              .in('id', (entries ?? []).map(e => e.team_id))
              .eq('age_group', session.age_group)
              .eq('category', session.category)
              .order('gymnast_display')
          : { data: [] as { id: string; gymnast_display: string }[] }
        orderedEntries = (fallbackTeams ?? []).map((t, i) => ({ team_id: t.id, position: i + 1 }))
      }

      orderedEntries.sort(
        (a, b) => a.position - b.position || a.team_id.localeCompare(b.team_id),
      )

      const teamIds = orderedEntries.map(o => o.team_id)
      const [phaseMapRes, choiceRes] = await Promise.all([
        supabase
          .from('open_combinados_phase_sessions')
          .select('phase_key, session_id')
          .eq('competition_id', (session as any).competition_id)
          .eq('session_id', session.id),
        teamIds.length > 0
          ? supabase
              .from('open_combinados_open_team_choices')
              .select('phase_key, team_id, selected_routine_type')
              .eq('competition_id', (session as any).competition_id)
              .in('team_id', teamIds)
          : Promise.resolve({ data: [] as { phase_key: string; team_id: string; selected_routine_type: 'Balance' | 'Dynamic' | 'Combined' }[] }),
      ])
      const phaseMappings = (phaseMapRes.data ?? []) as SessionMapRow[]
      const openChoicesByPhaseAndTeam: Record<string, Record<string, 'Balance' | 'Dynamic' | 'Combined'>> = {}
      for (const row of (choiceRes.data ?? [])) {
        if (!openChoicesByPhaseAndTeam[row.phase_key]) openChoicesByPhaseAndTeam[row.phase_key] = {}
        openChoicesByPhaseAndTeam[row.phase_key][row.team_id] = row.selected_routine_type as 'Balance' | 'Dynamic' | 'Combined'
      }
      const teamRoutineTypeMap: Record<string, 'Balance' | 'Dynamic' | 'Combined'> = {}
      for (const teamId of teamIds) {
        teamRoutineTypeMap[teamId] = resolveRoutineTypeForTeamInSession({
          sessionId: session.id,
          sessionRoutineType: session.routine_type as 'Balance' | 'Dynamic' | 'Combined',
          teamId,
          mappings: phaseMappings,
          openChoicesByPhaseAndTeam,
        })
      }

      const [teamsRes, musicRes, elementsRes, entryDisplayRes, reviewStatusRes] = await Promise.all([
        teamIds.length > 0
          ? supabase.from('teams').select('id, gymnast_display, age_group, category').in('id', teamIds)
          : Promise.resolve({ data: [] as { id: string; gymnast_display: string; age_group: string; category: string }[] }),
        teamIds.length > 0
          ? supabase.from('routine_music')
              .select('team_id, routine_type, ts_path')
              .eq('competition_id', (session as any).competition_id)
              .in('team_id', teamIds)
          : Promise.resolve({ data: [] as { team_id: string; routine_type: 'Balance' | 'Dynamic' | 'Combined'; ts_path: string | null }[] }),
        teamIds.length > 0
          ? supabase.from('ts_elements')
              .select('id, team_id, routine_type, position, label, element_type, is_static, difficulty_value')
              .eq('competition_id', (session as any).competition_id)
              .in('team_id', teamIds)
              .order('position')
          : Promise.resolve({ data: [] as { id: string; team_id: string; routine_type: 'Balance' | 'Dynamic' | 'Combined'; position: number; label: string; element_type: string; is_static: boolean; difficulty_value: number }[] }),
        teamIds.length > 0
          ? supabase.from('competition_entries').select('team_id, gymnast_display').eq('competition_id', (session as any).competition_id).in('team_id', teamIds)
          : Promise.resolve({ data: [] as { team_id: string; gymnast_display: string | null }[] }),
        teamIds.length > 0
          ? supabase.from('ts_review_status')
              .select('team_id, routine_type, missing_individual_sr')
              .eq('competition_id', (session as any).competition_id)
              .in('team_id', teamIds)
          : Promise.resolve({ data: [] as { team_id: string; routine_type: string; missing_individual_sr: boolean }[] }),
      ])

      const entryDisplay = Object.fromEntries((entryDisplayRes.data ?? []).map(e => [e.team_id, e.gymnast_display]))
      const teamMap: Record<string, { gymnast_display: string; age_group: string; category: string }> =
        Object.fromEntries((teamsRes.data ?? []).map(t => [t.id, { ...t, gymnast_display: entryDisplay[t.id] ?? t.gymnast_display }]))

      const missingIndividualSRMap: Record<string, boolean> = {}
      for (const r of ((reviewStatusRes.data ?? []) as { team_id: string; routine_type: string; missing_individual_sr: boolean }[])) {
        if (r.missing_individual_sr) missingIndividualSRMap[`${r.team_id}:${r.routine_type}`] = true
      }

      const tsUrlMap: Record<string, string | null> = {}
      for (const m of ((musicRes.data ?? []) as { team_id: string; routine_type: 'Balance' | 'Dynamic' | 'Combined'; ts_path: string | null }[])) {
        if (teamRoutineTypeMap[m.team_id] !== m.routine_type) continue
        tsUrlMap[m.team_id] = m.ts_path ?? null
      }

      const elementsMap: Record<string, import('@/components/scoring/types').TsElement[]> = {}
      for (const el of (elementsRes.data ?? []) as { id: string; team_id: string; routine_type: 'Balance' | 'Dynamic' | 'Combined'; position: number; label: string; element_type: string; is_static: boolean; difficulty_value: number }[]) {
        if (teamRoutineTypeMap[el.team_id] !== el.routine_type) continue
        if (!elementsMap[el.team_id]) elementsMap[el.team_id] = []
        elementsMap[el.team_id].push({
          id:              el.id,
          position:        el.position,
          label:           el.label,
          elementType:     el.element_type as import('@/components/scoring/types').ElementType,
          isStatic:        el.is_static,
          difficultyValue: el.difficulty_value,
        })
      }

      const builtPerfs: ScoringPerformance[] = orderedEntries.map(o => ({
        id:          `${session.id}_${o.team_id}`,
        teamId:      o.team_id,
        position:    o.position,
        gymnasts:    teamMap[o.team_id]?.gymnast_display ?? '',
        ageGroup:    agLabels[teamMap[o.team_id]?.age_group ?? session.age_group] ?? teamMap[o.team_id]?.age_group ?? session.age_group,
        category:    teamMap[o.team_id]?.category  ?? session.category,
        routineType: teamRoutineTypeMap[o.team_id] ?? session.routine_type,
        skipped:              false,
        tsUrl:                tsUrlMap[o.team_id] ?? null,
        elements:             elementsMap[o.team_id] ?? [],
        missingIndividualSR:  missingIndividualSRMap[`${o.team_id}:${teamRoutineTypeMap[o.team_id] ?? session.routine_type}`] ?? false,
      }))

      const builtJudgeScores: Record<string, JudgeScore[]> = {}
      for (const s of (scoresRes.data ?? [])) {
        const perfId = `${s.session_id}_${s.team_id}`
        if (!builtJudgeScores[perfId]) builtJudgeScores[perfId] = []
        builtJudgeScores[perfId].push({
          panelJudgeId: s.section_panel_judge_id,
          ejScore:      s.ej_score,
          ajScore:      s.aj_score,
          djDifficulty: s.dj_difficulty,
          djPenalty:    s.dj_penalty,
          cjpPenalty:   s.cjp_penalty,
        })
      }

      const builtResults: Record<string, RoutineResult> = {}
      for (const r of (resultsRes.data ?? [])) {
        const perfId = `${r.session_id}_${r.team_id}`
        builtResults[perfId] = {
          performanceId: perfId,
          eScore:        r.e_score      ?? 0,
          aScore:        r.a_score      ?? 0,
          difScore:      r.dif_score    ?? 0,
          difPenalty:    r.dif_penalty  ?? 0,
          cjpPenalty:    r.cjp_penalty  ?? 0,
          finalScore:    r.final_score  ?? 0,
          status:        r.status,
        }
      }

      let mergedResults: Record<string, RoutineResult> = { ...builtResults }
      let rankingPerformancesForCjp: ScoringPerformance[] = builtPerfs

      rankingPeerIdsRef.current = [session.id]

      const mergeId = session.ranking_merge_group_id ?? null
      if (mergeId) {
        const { data: mgRow } = await supabase
          .from('ranking_merge_groups')
          .select('label_es, label_en')
          .eq('id', mergeId)
          .maybeSingle()

        const peerIds = await fetchPeerSessionIdsForRanking(supabase, {
          competition_id: session.competition_id,
          age_group: session.age_group,
          category: session.category,
          routine_type: session.routine_type,
          ranking_merge_group_id: mergeId,
        })
        rankingPeerIdsRef.current = peerIds

        const { data: peerRoutineResults } = await supabase
          .from('routine_results')
          .select('*')
          .in('session_id', peerIds)

        for (const r of peerRoutineResults ?? []) {
          if (r.session_id === session.id) continue
          const perfId = `${r.session_id}_${r.team_id}`
          mergedResults[perfId] = {
            performanceId: perfId,
            eScore:        r.e_score      ?? 0,
            aScore:        r.a_score      ?? 0,
            difScore:      r.dif_score    ?? 0,
            difPenalty:    r.dif_penalty  ?? 0,
            cjpPenalty:    r.cjp_penalty  ?? 0,
            finalScore:    r.final_score  ?? 0,
            status:        r.status as 'provisional' | 'approved',
          }
        }

        const baseTagged: ScoringPerformance[] = builtPerfs.map((p) => ({
          ...p,
          rankingMergeGroupId: mergeId,
          mergeLabelEs:        mgRow?.label_es ?? undefined,
          mergeLabelEn:        mgRow?.label_en ?? undefined,
        }))

        const otherPeerIds = peerIds.filter((sid) => sid !== session.id)
        if (otherPeerIds.length > 0) {
          const { data: peerOrdersAll } = await supabase
            .from('session_orders')
            .select('session_id, team_id, position')
            .in('session_id', peerIds)

          const { data: peerSessionRows } = await supabase
            .from('sessions')
            .select('id, age_group, category, routine_type')
            .in('id', peerIds)

          const peerMeta = Object.fromEntries((peerSessionRows ?? []).map((s) => [s.id, s]))
          const ordersBySession = new Map<string, { session_id: string; team_id: string; position: number }[]>()
          for (const o of peerOrdersAll ?? []) {
            if (!ordersBySession.has(o.session_id)) ordersBySession.set(o.session_id, [])
            ordersBySession.get(o.session_id)!.push(o)
          }
          for (const rows of ordersBySession.values()) {
            rows.sort((a, b) => a.position - b.position || a.team_id.localeCompare(b.team_id))
          }

          const peerTeamIds = [...new Set((peerOrdersAll ?? []).map((o) => o.team_id))]
          const { data: peerTeamsData } = peerTeamIds.length > 0
            ? await supabase.from('teams').select('id, gymnast_display, age_group, category').in('id', peerTeamIds)
            : { data: [] as { id: string; gymnast_display: string; age_group: string; category: string }[] }
          const peerTeamMap = Object.fromEntries((peerTeamsData ?? []).map((t) => [t.id, t]))

          const extraPerfs: ScoringPerformance[] = []
          for (const sid of peerIds) {
            if (sid === session.id) continue
            const sm = peerMeta[sid]
            if (!sm) continue
            for (const o of ordersBySession.get(sid) ?? []) {
              const tm = peerTeamMap[o.team_id]
              extraPerfs.push({
                id:          `${sid}_${o.team_id}`,
                teamId:      o.team_id,
                position:    o.position,
                gymnasts:    tm?.gymnast_display ?? '',
                ageGroup:    agLabels[tm?.age_group ?? sm.age_group] ?? tm?.age_group ?? sm.age_group,
                category:    tm?.category ?? sm.category,
                routineType: sm.routine_type,
                skipped:     false,
                tsUrl:       null,
                elements:    [],
                rankingMergeGroupId: mergeId,
                mergeLabelEs:        mgRow?.label_es ?? undefined,
                mergeLabelEn:        mgRow?.label_en ?? undefined,
              })
            }
          }
          rankingPerformancesForCjp = [...baseTagged, ...extraPerfs]
        } else {
          rankingPerformancesForCjp = baseTagged
        }
      }

      const currentPerfIdVal = session.current_team_id
        ? `${session.id}_${session.current_team_id}`
        : null

      setSessionId(session.id)
      setSectionId(session.section_id)
      setCompetitionId(session.competition_id)
      setSessionStatus(session.status as SessionStatus)
      setCurrentPerfId(currentPerfIdVal)
      setAssignedRoles(builtAssignedRoles)
      setPanelJudges(builtPanelJudges)
      setPerformances(builtPerfs)
      setRankingPerformances(rankingPerformancesForCjp)
      setJudgeScores(builtJudgeScores)
      setResults(mergedResults)
      setDjMethod((session as any).dj_method ?? null)
      setEjMethod((session as any).ej_method ?? null)
      setLoading(false)
    }

    async function loadRG() {
      const { data: judge } = await supabase
        .from('judges').select('id').eq('id', activeProfile!.id).single()
      if (!judge) { setLoading(false); return }

      const { data: spjs } = await supabase
        .from('section_panel_judges')
        .select('id, section_id, panel_id, role, role_number')
        .eq('judge_id', judge.id)
      if (!spjs?.length) { setLoading(false); return }

      const sectionIds = [...new Set(spjs.map(s => s.section_id))]
      const panelIds   = [...new Set(spjs.map(s => s.panel_id))]

      const { data: allSessions } = await supabase
        .from('sessions')
        .select('id, name, status, section_id, panel_id, competition_id, current_team_id, age_group, category, routine_type')
        .in('section_id', sectionIds)
        .in('panel_id',   panelIds)

      if (!allSessions?.length) { setLoading(false); return }

      const spjPairs = new Set(spjs.map(s => `${s.section_id}|${s.panel_id}`))
      const mySessions = allSessions.filter(s => spjPairs.has(`${s.section_id}|${s.panel_id}`))
      if (!mySessions.length) { setLoading(false); return }

      const session = mySessions.find(s => s.status === 'active') ?? mySessions[0]

      const mySpjsForSession = spjs.filter(
        s => s.section_id === session.section_id && s.panel_id === session.panel_id
      )

      const { data: allSpjs } = await supabase
        .from('section_panel_judges')
        .select('id, judge_id, role, role_number')
        .eq('section_id', session.section_id)
        .eq('panel_id',   session.panel_id)

      const judgeIds = [...new Set((allSpjs ?? []).filter(s => s.judge_id).map(s => s.judge_id as string))]
      const [judgesRes, ordersRes, scoresRes, resultsRes, rulesRes] = await Promise.all([
        judgeIds.length > 0
          ? supabase.from('judges').select('id, full_name').in('id', judgeIds)
          : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
        supabase.from('session_orders').select('position, team_id').eq('session_id', session.id).order('position'),
        supabase.from('scores').select('section_panel_judge_id,ej_score,aj_score,dj_difficulty,db_score').eq('session_id', session.id),
        supabase.from('routine_results').select('team_id,e_score,a_score,da_score,db_score,rj_penalty,final_score,status').eq('session_id', session.id),
        supabase.from('age_group_rules').select('id, age_group, level, ruleset, sport_type'),
      ])

      const agLabels: Record<string, string> = Object.fromEntries(
        ((rulesRes.data ?? []) as { id: string; age_group: string; level: string; ruleset: string; sport_type: string }[])
          .map(r => [r.id, ageGroupLabel(r as unknown as AgeGroupRule, true)])
      )

      const judgeNameMap: Record<string, string> = Object.fromEntries(
        (judgesRes.data ?? []).map(j => [j.id, j.full_name])
      )

      const builtPanelJudges: PanelJudge[] = (allSpjs ?? []).map(s => ({
        id:         s.id,
        name:       s.judge_id ? (judgeNameMap[s.judge_id] ?? '—') : '—',
        role:       s.role as PanelJudge['role'],
        roleNumber: s.role_number,
      }))

      const builtAssignedRoles: PanelJudge[] = mySpjsForSession.map(s => ({
        id:         s.id,
        name:       judgeNameMap[judge.id] ?? '—',
        role:       s.role as PanelJudge['role'],
        roleNumber: s.role_number,
      }))

      let orderedEntries: { team_id: string; position: number }[] = (ordersRes.data ?? []).map(o => ({
        team_id: o.team_id, position: o.position,
      }))

      if (orderedEntries.length === 0) {
        const { data: entries } = await supabase
          .from('rg_registrations')
          .select('team_id')
          .eq('competition_id', (session as any).competition_id)
          .eq('status', 'registered')
        orderedEntries = (entries ?? []).map((e, i) => ({ team_id: e.team_id, position: i + 1 }))
      }

      const teamIds = orderedEntries.map(o => o.team_id)
      const teamsRes = teamIds.length > 0
        ? await supabase.from('teams').select('id, gymnast_display, age_group, category').in('id', teamIds)
        : { data: [] as { id: string; gymnast_display: string; age_group: string; category: string }[] }

      const teamMap: Record<string, { gymnast_display: string; age_group: string; category: string }> =
        Object.fromEntries((teamsRes.data ?? []).map(t => [t.id, t]))

      const builtPerfs: ScoringPerformance[] = orderedEntries.map(o => ({
        id:          `${session.id}_${o.team_id}`,
        teamId:      o.team_id,
        position:    o.position,
        gymnasts:    teamMap[o.team_id]?.gymnast_display ?? '',
        ageGroup:    agLabels[teamMap[o.team_id]?.age_group ?? ''] ?? teamMap[o.team_id]?.age_group ?? session.age_group,
        category:    teamMap[o.team_id]?.category ?? session.category,
        routineType: session.routine_type,
        skipped:     false,
        tsUrl:       null,
        elements:    [],
      }))

      const builtJudgeScores: Record<string, JudgeScore[]> = {}
      for (const s of (scoresRes.data ?? []) as any[]) {
        const perfId = `${session.id}_${s.team_id}`
        if (!builtJudgeScores[perfId]) builtJudgeScores[perfId] = []
        builtJudgeScores[perfId].push({
          panelJudgeId: s.section_panel_judge_id,
          ejScore:      s.ej_score,
          ajScore:      s.aj_score,
          djDifficulty: s.dj_difficulty,
          djPenalty:    null,
          cjpPenalty:   null,
          dbScore:      s.db_score,
        })
      }

      const builtResults: Record<string, RoutineResult> = {}
      for (const r of (resultsRes.data ?? []) as any[]) {
        const perfId = `${session.id}_${r.team_id}`
        builtResults[perfId] = {
          performanceId: perfId,
          eScore:     r.e_score     ?? 0,
          aScore:     r.a_score     ?? 0,
          difScore:   0,
          difPenalty: 0,
          cjpPenalty: 0,
          daScore:    r.da_score    ?? 0,
          dbScore:    r.db_score    ?? 0,
          rjPenalty:  r.rj_penalty  ?? 0,
          finalScore: r.final_score ?? 0,
          status:     r.status,
        }
      }

      const currentPerfIdVal = session.current_team_id
        ? `${session.id}_${session.current_team_id}`
        : null

      setSessionId(session.id)
      setSessionStatus(session.status as SessionStatus)
      setCurrentPerfId(currentPerfIdVal)
      setAssignedRoles(builtAssignedRoles)
      setPanelJudges(builtPanelJudges)
      setPerformances(builtPerfs)
      setJudgeScores(builtJudgeScores)
      setResults(builtResults)
      setLoading(false)
    }

    load()
  }, [activeProfile?.id, profileLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── practice mode broadcast (acro only) ──────────────────────────────────────
  useEffect(() => {
    if (!sectionId) return
    const ch = supabase.channel(`practice-broadcast-${sectionId}`)
    ch
      .on('broadcast', { event: 'practice_open' }, ({ payload }) => {
        const p = payload as { perfId?: string }
        if (p.perfId) setCurrentPerfId(p.perfId)
      })
      .on('broadcast', { event: 'practice_score' }, ({ payload }) => {
        const p = payload as { perfId: string; score: JudgeScore }
        if (!p?.perfId || !p?.score) return
        setJudgeScores(prev => ({
          ...prev,
          [p.perfId]: [...(prev[p.perfId] ?? []).filter(s => s.panelJudgeId !== p.score.panelJudgeId), p.score],
        }))
      })
      .on('broadcast', { event: 'practice_result' }, ({ payload }) => {
        const p = payload as { perfId: string; result: RoutineResult }
        if (!p?.perfId || !p?.result) return
        setResults(prev => ({ ...prev, [p.perfId]: p.result }))
      })
      .on('broadcast', { event: 'practice_reset' }, () => {
        setJudgeScores({})
        setResults({})
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [sectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!practiceMode) return
    if (practiceRoutinePerfId) {
      setCurrentPerfId(practiceRoutinePerfId)
      setJudgeScores(prev => prev[practiceRoutinePerfId] ? prev : { ...prev, [practiceRoutinePerfId]: [] })
    }
  }, [practiceMode, practiceRoutinePerfId])

  // ── Realtime ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return

    const chPrefix = sport === 'acro' ? 'js' : 'rg'

    const sessionCh = supabase
      .channel(`${chPrefix}-session-${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'sessions',
        filter: `id=eq.${sessionId}`,
      }, (payload) => {
        const row = payload.new as { status: SessionStatus; current_team_id: string | null }
        setSessionStatus(row.status)
        if (row.status === 'finished') {
          router.push('/judge')
          return
        }
        const newPerfId = row.current_team_id ? `${sessionId}_${row.current_team_id}` : null
        setCurrentPerfId(newPerfId)
        if (newPerfId) setJudgeScores(prev => prev[newPerfId] ? prev : { ...prev, [newPerfId]: [] })
      })
      .subscribe()

    const scoresCh = supabase
      .channel(`${chPrefix}-scores-${sessionId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'scores',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const row = payload.new as {
          session_id: string; team_id: string; section_panel_judge_id: string
          ej_score: number | null; aj_score: number | null
          dj_difficulty: number | null; dj_penalty: number | null; cjp_penalty: number | null
          db_score: number | null
        }
        const perfId = `${row.session_id}_${row.team_id}`
        const incoming: JudgeScore = {
          panelJudgeId: row.section_panel_judge_id,
          ejScore:      row.ej_score,
          ajScore:      row.aj_score,
          djDifficulty: row.dj_difficulty,
          djPenalty:    sport === 'acro' ? row.dj_penalty : null,
          cjpPenalty:   sport === 'acro' ? row.cjp_penalty : null,
          dbScore:      sport === 'rg' ? row.db_score : undefined,
        }
        setJudgeScores(prev => ({
          ...prev,
          [perfId]: [...(prev[perfId] ?? []).filter(s => s.panelJudgeId !== incoming.panelJudgeId), incoming],
        }))
      })
      .subscribe()

    if (sport === 'acro') {
      const resultSessionIds = rankingPeerIdsRef.current.length > 0
        ? rankingPeerIdsRef.current
        : [sessionId]

      const resultsChannels = resultSessionIds.map((sid) =>
        supabase
          .channel(`js-results-${sessionId}-${sid}`)
          .on('postgres_changes', {
            event: '*', schema: 'public', table: 'routine_results',
            filter: `session_id=eq.${sid}`,
          }, (payload) => {
            const row = payload.new as {
              session_id: string; team_id: string
              e_score: number | null; a_score: number | null
              dif_score: number | null; dif_penalty: number | null; cjp_penalty: number | null
              final_score: number | null; status: 'provisional' | 'approved'
            }
            const perfId = `${row.session_id}_${row.team_id}`
            setResults(prev => ({
              ...prev,
              [perfId]: {
                performanceId: perfId,
                eScore:     row.e_score     ?? 0,
                aScore:     row.a_score     ?? 0,
                difScore:   row.dif_score   ?? 0,
                difPenalty: row.dif_penalty ?? 0,
                cjpPenalty: row.cjp_penalty ?? 0,
                finalScore: row.final_score ?? 0,
                status:     row.status,
              },
            }))
          })
          .subscribe(),
      )

      return () => {
        supabase.removeChannel(sessionCh)
        supabase.removeChannel(scoresCh)
        for (const ch of resultsChannels) supabase.removeChannel(ch)
      }
    } else {
      const resultsCh = supabase
        .channel(`rg-results-${sessionId}`)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'routine_results',
          filter: `session_id=eq.${sessionId}`,
        }, (payload) => {
          const row = payload.new as {
            session_id: string; team_id: string
            e_score: number | null; a_score: number | null
            da_score: number | null; db_score: number | null
            rj_penalty: number | null; final_score: number | null
            status: 'provisional' | 'approved'
          }
          const perfId = `${row.session_id}_${row.team_id}`
          setResults(prev => ({
            ...prev,
            [perfId]: {
              performanceId: perfId,
              eScore:     row.e_score     ?? 0,
              aScore:     row.a_score     ?? 0,
              difScore:   0,
              difPenalty: 0,
              cjpPenalty: 0,
              daScore:    row.da_score    ?? 0,
              dbScore:    row.db_score    ?? 0,
              rjPenalty:  row.rj_penalty  ?? 0,
              finalScore: row.final_score ?? 0,
              status:     row.status,
            },
          }))
        })
        .subscribe()

      return () => {
        supabase.removeChannel(sessionCh)
        supabase.removeChannel(scoresCh)
        supabase.removeChannel(resultsCh)
      }
    }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── shared handlers ───────────────────────────────────────────────────────────

  async function handleOpen(perfId: string) {
    if (!sessionId) return
    if (sport === 'acro' && practiceMode) {
      setCurrentPerfId(perfId)
      setJudgeScores(prev => prev[perfId] ? prev : { ...prev, [perfId]: [] })
      if (sectionId) {
        const ch = supabase.channel(`practice-open-tx-${sectionId}`)
        await ch.subscribe()
        await ch.send({ type: 'broadcast', event: 'practice_open', payload: { perfId } })
        supabase.removeChannel(ch)
      }
      return
    }
    const teamId = perfId.replace(`${sessionId}_`, '')
    await supabase.from('sessions').update({ current_team_id: teamId }).eq('id', sessionId)
    setCurrentPerfId(perfId)
    setJudgeScores(prev => prev[perfId] ? prev : { ...prev, [perfId]: [] })
  }

  function handleSkip(perfId: string) {
    setPerformances(prev => prev.map(p => p.id === perfId ? { ...p, skipped: true } : p))
  }

  async function handleReopenScore(perfId: string, panelJudgeId: string | 'all') {
    if (!sessionId) return
    if (sport === 'acro' && practiceMode) {
      if (panelJudgeId === 'all') {
        setJudgeScores(prev => ({ ...prev, [perfId]: [] }))
        setResults(prev => { const next = { ...prev }; delete next[perfId]; return next })
      } else {
        setJudgeScores(prev => ({
          ...prev,
          [perfId]: (prev[perfId] ?? []).filter(s => s.panelJudgeId !== panelJudgeId),
        }))
      }
      return
    }
    const teamId = perfId.replace(`${sessionId}_`, '')
    if (panelJudgeId === 'all') {
      await supabase.from('scores').delete().eq('session_id', sessionId).eq('team_id', teamId)
      await supabase.from('routine_results').delete().eq('session_id', sessionId).eq('team_id', teamId)
      setJudgeScores(prev => ({ ...prev, [perfId]: [] }))
    } else {
      await supabase.from('scores').delete()
        .eq('session_id', sessionId).eq('team_id', teamId).eq('section_panel_judge_id', panelJudgeId)
      setJudgeScores(prev => ({
        ...prev,
        [perfId]: (prev[perfId] ?? []).filter(s => s.panelJudgeId !== panelJudgeId),
      }))
    }
    setResults(prev => { const next = { ...prev }; delete next[perfId]; return next })
  }

  function clearSubmitError() { setSubmitError(null) }

  // ── acro handlers ─────────────────────────────────────────────────────────────

  async function handleCJPSubmit(status: 'provisional' | 'approved', result: RoutineResult, penaltyDetail?: PenaltyState | null) {
    if (sport !== 'acro' || !sessionId) return
    setSubmitError(null)
    if (practiceMode) {
      const next: RoutineResult = { ...result, status }
      setResults(prev => ({ ...prev, [result.performanceId]: next }))
      if (sectionId) {
        const ch = supabase.channel(`practice-result-tx-${sectionId}`)
        await ch.subscribe()
        await ch.send({ type: 'broadcast', event: 'practice_result', payload: { perfId: result.performanceId, result: next } })
        supabase.removeChannel(ch)
      }
      return
    }
    try {
      const teamId = result.performanceId.replace(`${sessionId}_`, '')

      const djJudgeIds = panelJudges.filter(j => j.role === 'DJ').map(j => j.id)
      let djPenaltyDetail: import('@/lib/database.types').Json | null = null
      if (djJudgeIds.length > 0) {
        const { data: djScores } = await supabase
          .from('scores')
          .select('dj_flags')
          .in('section_panel_judge_id', djJudgeIds)
          .eq('session_id', sessionId)
          .eq('team_id', teamId)
          .not('dj_flags', 'is', null)
        djPenaltyDetail = djScores?.[0]?.dj_flags ?? null
      }

      const { error } = await supabase.from('routine_results').upsert({
        session_id: sessionId, team_id: teamId,
        e_score: result.eScore, a_score: result.aScore,
        dif_score: result.difScore, dif_penalty: result.difPenalty,
        cjp_penalty: result.cjpPenalty, final_score: result.finalScore, status,
        cjp_penalty_detail: penaltyDetail ?? null,
        dj_penalty_detail:  djPenaltyDetail,
      }, { onConflict: 'session_id,team_id' })
      if (error) throw error
      setResults(prev => ({ ...prev, [result.performanceId]: result }))
    } catch (err) {
      console.error('CJP submit failed:', err)
      setSubmitError('No se pudo guardar el resultado — comprueba la conexión e inténtalo de nuevo.')
    }
  }

  async function handleUnpublishResult(perfId: string) {
    if (sport !== 'acro' || !sessionId || practiceMode) return
    const teamId = perfId.replace(`${sessionId}_`, '')
    await supabase.from('routine_results')
      .update({ status: 'provisional' })
      .eq('session_id', sessionId)
      .eq('team_id', teamId)
    setResults(prev => prev[perfId] ? { ...prev, [perfId]: { ...prev[perfId]!, status: 'provisional' } } : prev)
  }

  async function handleJudgeScoreSubmit(score: JudgeScore) {
    if (sport !== 'acro' || !sessionId || !currentPerfId) return
    setSubmitError(null)
    if (practiceMode) {
      setJudgeScores(prev => ({
        ...prev,
        [currentPerfId]: [...(prev[currentPerfId] ?? []).filter(s => s.panelJudgeId !== score.panelJudgeId), score],
      }))
      if (sectionId) {
        const ch = supabase.channel(`practice-score-tx-${sectionId}`)
        await ch.subscribe()
        await ch.send({ type: 'broadcast', event: 'practice_score', payload: { perfId: currentPerfId, score } })
        supabase.removeChannel(ch)
      }
      return
    }
    try {
      const teamId = currentPerfId.replace(`${sessionId}_`, '')
      const { error } = await supabase.from('scores').upsert({
        session_id: sessionId, team_id: teamId,
        section_panel_judge_id: score.panelJudgeId,
        ej_score: score.ejScore, aj_score: score.ajScore,
        dj_difficulty: score.djDifficulty, dj_penalty: score.djPenalty, cjp_penalty: score.cjpPenalty,
        dj_flags: score.detail?.djFlags ?? null,
        dj_extra_elements: score.detail?.djExtraElements ?? null,
        dj_incorrect_ts: score.detail?.djIncorrectTs ?? null,
        ej_deductions: score.detail?.ejDeductions ?? null,
        ej_extra_elements: score.detail?.ejExtraElements ?? null,
      }, { onConflict: 'session_id,team_id,section_panel_judge_id' })
      if (error) throw error
      const { data: latest } = await supabase.from('scores')
        .select('section_panel_judge_id,ej_score,aj_score,dj_difficulty,dj_penalty,cjp_penalty')
        .eq('session_id', sessionId)
        .eq('team_id', teamId)
      if (latest) {
        const perfId = currentPerfId
        setJudgeScores(prev => ({
          ...prev,
          [perfId]: latest.map((s: any) => ({
            panelJudgeId: s.section_panel_judge_id,
            ejScore:      s.ej_score,
            ajScore:      s.aj_score,
            djDifficulty: s.dj_difficulty,
            djPenalty:    s.dj_penalty,
            cjpPenalty:   s.cjp_penalty,
          })),
        }))
      }
    } catch (err) {
      console.error('Score submission failed:', err)
      setSubmitError('No se pudo enviar la puntuación — comprueba la conexión e inténtalo de nuevo.')
    }
  }

  function handleEditScore(
    perfId: string, panelJudgeId: string,
    field: 'ejScore' | 'ajScore' | 'djDifficulty' | 'djPenalty', value: number,
  ) {
    if (sport !== 'acro') return
    setJudgeScores(prev => {
      const existing = prev[perfId] ?? []
      if (existing.some(s => s.panelJudgeId === panelJudgeId)) {
        return { ...prev, [perfId]: existing.map(s => s.panelJudgeId === panelJudgeId ? { ...s, [field]: value } : s) }
      }
      const blank = { panelJudgeId, ejScore: null, ajScore: null, djDifficulty: null, djPenalty: null, cjpPenalty: null }
      return { ...prev, [perfId]: [...existing, { ...blank, [field]: value }] }
    })
  }

  async function startSectionPractice() {
    if (sport !== 'acro') return
    if (!sectionId || !competitionId || !judgeId || performances.length === 0 || !sessionId) return
    const first = performances[0]
    if (!first) return
    await startPractice({
      sectionId,
      competitionId,
      routineSessionId: sessionId,
      routineTeamId: first.teamId,
      startedByJudgeId: judgeId,
    })
    setCurrentPerfId(`${sessionId}_${first.teamId}`)
    setJudgeScores({})
    setResults({})
    if (sectionId) {
      const ch = supabase.channel(`practice-reset-tx-${sectionId}`)
      await ch.subscribe()
      await ch.send({ type: 'broadcast', event: 'practice_reset', payload: {} })
      supabase.removeChannel(ch)
    }
  }

  async function stopSectionPractice() {
    if (sport !== 'acro') return
    await stopPractice()
  }

  // ── rg handlers ───────────────────────────────────────────────────────────────

  async function handleRGJudgeScoreSubmit(score: JudgeScore) {
    if (sport !== 'rg' || !sessionId || !currentPerfId) return
    setSubmitError(null)
    try {
      const teamId = currentPerfId.replace(`${sessionId}_`, '')
      const { error } = await supabase.from('scores').upsert({
        session_id: sessionId, team_id: teamId,
        section_panel_judge_id: score.panelJudgeId,
        ej_score:     score.ejScore,
        aj_score:     score.ajScore,
        dj_difficulty: score.djDifficulty,
        db_score:     score.dbScore ?? null,
      }, { onConflict: 'session_id,team_id,section_panel_judge_id' })
      if (error) throw error

      const { data: latest } = await supabase.from('scores')
        .select('section_panel_judge_id,ej_score,aj_score,dj_difficulty,db_score')
        .eq('session_id', sessionId)
        .eq('team_id', teamId)
      if (latest) {
        const perfId = currentPerfId
        setJudgeScores(prev => ({
          ...prev,
          [perfId]: (latest as any[]).map(s => ({
            panelJudgeId: s.section_panel_judge_id,
            ejScore:      s.ej_score,
            ajScore:      s.aj_score,
            djDifficulty: s.dj_difficulty,
            djPenalty:    null,
            cjpPenalty:   null,
            dbScore:      s.db_score,
          })),
        }))
      }
    } catch (err) {
      console.error('RG score submission failed:', err)
      setSubmitError('No se pudo enviar la puntuación — comprueba la conexión e inténtalo de nuevo.')
    }
  }

  async function handleRJSubmit(
    status: 'provisional' | 'approved',
    result: RoutineResult,
    penaltyDetail?: Json | null,
  ) {
    if (sport !== 'rg' || !sessionId) return
    setSubmitError(null)
    try {
      const teamId = result.performanceId.replace(`${sessionId}_`, '')
      const { error } = await supabase.from('routine_results').upsert({
        session_id: sessionId, team_id: teamId,
        e_score:          result.eScore,
        a_score:          result.aScore,
        da_score:         result.daScore ?? 0,
        db_score:         result.dbScore ?? 0,
        rj_penalty:       result.rjPenalty ?? 0,
        rj_penalty_detail: penaltyDetail ?? null,
        final_score:      result.finalScore,
        dif_score:   null, dif_penalty: null, cjp_penalty: null,
        status,
      }, { onConflict: 'session_id,team_id' })
      if (error) throw error
      setResults(prev => ({ ...prev, [result.performanceId]: result }))
    } catch (err) {
      console.error('RJ submit failed:', err)
      setSubmitError('No se pudo guardar el resultado — comprueba la conexión e inténtalo de nuevo.')
    }
  }

  // ── resolve current performance ───────────────────────────────────────────────

  const resolvedPerfId = (sport === 'acro' && practiceMode && practiceRoutinePerfId)
    ? practiceRoutinePerfId
    : currentPerfId
  const currentPerf = resolvedPerfId ? (performances.find(p => p.id === resolvedPerfId) ?? null) : null

  return {
    loading, sessionId, sessionStatus, currentPerfId: resolvedPerfId, currentPerf,
    assignedRoles, panelJudges, performances, rankingPerformances, judgeScores, results,
    djMethod, ejMethod, submitError, practiceMode, practiceRoutinePerfId,
    handleOpen, handleSkip, handleCJPSubmit, handleReopenScore, handleUnpublishResult,
    handleJudgeScoreSubmit, handleEditScore, clearSubmitError, startSectionPractice, stopSectionPractice,
    handleRJSubmit, handleRGJudgeScoreSubmit,
  }
}
