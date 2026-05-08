'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useProfile } from '@/contexts/ProfileContext'
import type { PanelJudge, ScoringPerformance, JudgeScore, RoutineResult } from '@/components/scoring/types'
import type { SessionStatus } from '@/components/judge/JudgeSession'
import type { Json } from '@/lib/database.types'

// ─── types ────────────────────────────────────────────────────────────────────

export type RGJudgeSessionData = {
  loading:       boolean
  sessionId:     string | null
  sessionStatus: SessionStatus
  currentPerfId: string | null
  currentPerf:   ScoringPerformance | null
  assignedRoles: PanelJudge[]
  panelJudges:   PanelJudge[]
  performances:  ScoringPerformance[]
  judgeScores:   Record<string, JudgeScore[]>
  results:       Record<string, RoutineResult>
  submitError:   string | null
  handleOpen:                 (perfId: string) => Promise<void>
  handleSkip:                 (perfId: string) => void
  handleRGJudgeScoreSubmit:   (score: JudgeScore) => Promise<void>
  handleRJSubmit:             (status: 'provisional' | 'approved', result: RoutineResult, penaltyDetail?: Json | null) => Promise<void>
  handleReopenScore:          (perfId: string, panelJudgeId: string | 'all') => Promise<void>
  clearSubmitError:           () => void
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useRGJudgeSession(): RGJudgeSessionData {
  const supabase = useMemo(() => createClient(), []) // eslint-disable-line react-hooks/exhaustive-deps
  const router = useRouter()
  const { activeProfile } = useProfile()
  const [loading,       setLoading]       = useState(true)
  const [sessionId,     setSessionId]     = useState<string | null>(null)
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('waiting')
  const [currentPerfId, setCurrentPerfId] = useState<string | null>(null)
  const [assignedRoles, setAssignedRoles] = useState<PanelJudge[]>([])
  const [panelJudges,   setPanelJudges]   = useState<PanelJudge[]>([])
  const [performances,  setPerformances]  = useState<ScoringPerformance[]>([])
  const [judgeScores,   setJudgeScores]   = useState<Record<string, JudgeScore[]>>({})
  const [results,       setResults]       = useState<Record<string, RoutineResult>>({})
  const [submitError,   setSubmitError]   = useState<string | null>(null)

  const sessionIdRef = useRef<string | null>(null)
  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])

  // Prevent back navigation while in an active session
  useEffect(() => {
    if (!sessionId) return
    window.history.pushState(null, '', window.location.href)
    function handlePopState() { window.history.pushState(null, '', window.location.href) }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [sessionId])

  // ── initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (!activeProfile) return
      const { data: judge } = await supabase
        .from('judges').select('id').eq('id', activeProfile.id).single()
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
        supabase.from('age_group_rules').select('id, age_group, level, ruleset'),
      ])

      const agLabels: Record<string, string> = Object.fromEntries(
        ((rulesRes.data ?? []) as { id: string; age_group: string; ruleset: string }[])
          .map(r => [r.id, `${r.age_group} (${r.ruleset})`])
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
  }, [activeProfile?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Realtime ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return

    const sessionCh = supabase
      .channel(`rg-session-${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'sessions',
        filter: `id=eq.${sessionId}`,
      }, (payload) => {
        const row = payload.new as { status: SessionStatus; current_team_id: string | null }
        setSessionStatus(row.status)
        if (row.status === 'finished') { router.push('/judge'); return }
        const newPerfId = row.current_team_id ? `${sessionId}_${row.current_team_id}` : null
        setCurrentPerfId(newPerfId)
        if (newPerfId) setJudgeScores(prev => prev[newPerfId] ? prev : { ...prev, [newPerfId]: [] })
      })
      .subscribe()

    const scoresCh = supabase
      .channel(`rg-scores-${sessionId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'scores',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const row = payload.new as {
          session_id: string; team_id: string; section_panel_judge_id: string
          ej_score: number | null; aj_score: number | null
          dj_difficulty: number | null; db_score: number | null
        }
        const perfId = `${row.session_id}_${row.team_id}`
        const incoming: JudgeScore = {
          panelJudgeId: row.section_panel_judge_id,
          ejScore:      row.ej_score,
          ajScore:      row.aj_score,
          djDifficulty: row.dj_difficulty,
          djPenalty:    null,
          cjpPenalty:   null,
          dbScore:      row.db_score,
        }
        setJudgeScores(prev => ({
          ...prev,
          [perfId]: [...(prev[perfId] ?? []).filter(s => s.panelJudgeId !== incoming.panelJudgeId), incoming],
        }))
      })
      .subscribe()

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
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── handlers ─────────────────────────────────────────────────────────────────

  async function handleOpen(perfId: string) {
    if (!sessionId) return
    const teamId = perfId.replace(`${sessionId}_`, '')
    await supabase.from('sessions').update({ current_team_id: teamId }).eq('id', sessionId)
    setCurrentPerfId(perfId)
    setJudgeScores(prev => prev[perfId] ? prev : { ...prev, [perfId]: [] })
  }

  function handleSkip(perfId: string) {
    setPerformances(prev => prev.map(p => p.id === perfId ? { ...p, skipped: true } : p))
  }

  async function handleRGJudgeScoreSubmit(score: JudgeScore) {
    if (!sessionId || !currentPerfId) return
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
    if (!sessionId) return
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

  async function handleReopenScore(perfId: string, panelJudgeId: string | 'all') {
    if (!sessionId) return
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

  const currentPerf = currentPerfId ? (performances.find(p => p.id === currentPerfId) ?? null) : null

  return {
    loading, sessionId, sessionStatus, currentPerfId, currentPerf,
    assignedRoles, panelJudges, performances, judgeScores, results,
    submitError,
    handleOpen, handleSkip, handleRGJudgeScoreSubmit, handleRJSubmit,
    handleReopenScore, clearSubmitError,
  }
}
