'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'

export type SectionPracticeState = {
  active: boolean
  sectionId: string
  competitionId: string
  routineSessionId: string
  routineTeamId: string
}

type StartPracticeInput = {
  sectionId: string
  competitionId: string
  routineSessionId: string
  routineTeamId: string
  startedByJudgeId: string | null
}

export function useSectionPractice(sectionId: string | null) {
  const supabase = useMemo(() => createClient(), [])
  const [practice, setPractice] = useState<SectionPracticeState | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchState = useCallback(async () => {
    if (!sectionId) {
      setPractice(null)
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('section_practice_state')
      .select('section_id, competition_id, routine_session_id, routine_team_id, active')
      .eq('section_id', sectionId)
      .maybeSingle()
    setPractice(
      data
        ? {
            active: data.active,
            sectionId: data.section_id,
            competitionId: data.competition_id,
            routineSessionId: data.routine_session_id,
            routineTeamId: data.routine_team_id,
          }
        : null,
    )
    setLoading(false)
  }, [sectionId, supabase])

  useEffect(() => {
    void fetchState()
  }, [fetchState])

  useEffect(() => {
    if (!sectionId) return
    const ch = supabase
      .channel(`section-practice-${sectionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'section_practice_state', filter: `section_id=eq.${sectionId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setPractice(null)
            return
          }
          const d = payload.new as {
            section_id: string; competition_id: string
            routine_session_id: string; routine_team_id: string; active: boolean
          }
          setPractice({
            active:           d.active,
            sectionId:        d.section_id,
            competitionId:    d.competition_id,
            routineSessionId: d.routine_session_id,
            routineTeamId:    d.routine_team_id,
          })
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
  }, [sectionId, supabase])

  const startPractice = useCallback(
    async (input: StartPracticeInput) => {
      await supabase.from('section_practice_state').upsert(
        {
          section_id: input.sectionId,
          competition_id: input.competitionId,
          routine_session_id: input.routineSessionId,
          routine_team_id: input.routineTeamId,
          active: true,
          started_by: input.startedByJudgeId,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'section_id' },
      )
      await fetchState()
    },
    [fetchState, supabase],
  )

  const stopPractice = useCallback(async () => {
    if (!sectionId) return
    await supabase
      .from('section_practice_state')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('section_id', sectionId)
    await fetchState()
  }, [fetchState, sectionId, supabase])

  return { loading, practice, startPractice, stopPractice, refreshPractice: fetchState }
}

