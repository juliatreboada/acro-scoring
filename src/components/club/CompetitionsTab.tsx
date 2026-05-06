'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { Competition, Team, Gymnast, CompetitionEntry, RoutineMusic, Judge, CompetitionJudgeNomination, AgeGroupRule, Coach, CompetitionCoach } from '@/components/admin/types'
import ProvisionalEntryForm from './ProvisionalEntryForm'
import DefinitiveEntryForm from './DefinitiveEntryForm'
import { CompetitionDetailView } from './CompetitionDetailView'
import { CompetitionListView } from './CompetitionListView'

export default function CompetitionsTab({
  lang, clubId, clubName, competitions, teams, gymnasts, coaches, competitionCoaches, entries, music, judges, nominations, agLabels, ageGroupRules,
  tsReviewStatuses,
  onRegister, onDropout, onSetFile, onNominate, onRemoveNomination, onInviteJudge,
  onRegisterCoach, onUnregisterCoach,
}: {
  lang: Lang
  clubId: string
  clubName: string
  competitions: Competition[]
  teams: Team[]
  gymnasts: Gymnast[]
  coaches: Coach[]
  competitionCoaches: CompetitionCoach[]
  entries: CompetitionEntry[]
  music: RoutineMusic[]
  judges: Judge[]
  nominations: CompetitionJudgeNomination[]
  agLabels: Record<string, string>
  ageGroupRules: AgeGroupRule[]
  tsReviewStatuses: { team_id: string; competition_id: string; routine_type: string; status: string; final_comment: string | null }[]
  onRegister: (competitionId: string, teamId: string) => void
  onDropout: (entryId: string) => void
  onSetFile: (teamId: string, competitionId: string, routineType: 'Balance' | 'Dynamic' | 'Combined', field: 'music' | 'ts', file: File | null) => void
  onNominate: (competitionId: string, judgeId: string) => void
  onRemoveNomination: (nominationId: string) => void
  onInviteJudge: (f: { full_name: string; email: string; phone?: string; licence?: string }) => Promise<void>
  onRegisterCoach: (competitionId: string, coachId: string) => void
  onUnregisterCoach: (competitionId: string, coachId: string) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [provisionalEntryComp, setProvisionalEntryComp] = useState<Competition | null>(null)
  const [definitiveEntryComp, setDefinitiveEntryComp] = useState<Competition | null>(null)

  const [clubProvisionalEntries, setClubProvisionalEntries] = useState<Record<string, { teams_per_category: Record<string, number> }>>({})
  const [clubDefinitiveEntries, setClubDefinitiveEntries]   = useState<Record<string, { teams_per_category: Record<string, number> }>>({})

  async function fetchClubEntries() {
    const compIds = competitions
      .filter(c => c.status === 'provisional_entry' || c.status === 'definitive_entry' || c.status === 'registration_open')
      .map(c => c.id)
    if (compIds.length === 0) return
    const supabase = createClient()
    const [provRes, defRes] = await Promise.all([
      supabase.from('provisional_entries' as any)
        .select('competition_id,teams_per_category')
        .eq('club_id', clubId)
        .in('competition_id', compIds),
      supabase.from('definitive_entries' as any)
        .select('competition_id,teams_per_category')
        .eq('club_id', clubId)
        .in('competition_id', compIds),
    ])
    if (provRes.data) {
      setClubProvisionalEntries(
        Object.fromEntries((provRes.data as any[]).map(e => [e.competition_id, { teams_per_category: e.teams_per_category }]))
      )
    }
    if (defRes.data) {
      setClubDefinitiveEntries(
        Object.fromEntries((defRes.data as any[]).map(e => [e.competition_id, { teams_per_category: e.teams_per_category }]))
      )
    }
  }

  useEffect(() => { fetchClubEntries() }, [clubId]) // eslint-disable-line react-hooks/exhaustive-deps

  const selected = competitions.find((c) => c.id === selectedId) ?? null

  return (
    <>
      {selected ? (
        <CompetitionDetailView
          lang={lang}
          clubId={clubId}
          competition={selected}
          teams={teams}
          gymnasts={gymnasts}
          coaches={coaches}
          competitionCoaches={competitionCoaches.filter(cc => cc.competition_id === selected.id)}
          entries={entries}
          music={music}
          judges={judges}
          nominations={nominations}
          agLabels={agLabels}
          ageGroupRules={ageGroupRules}
          tsReviewStatuses={tsReviewStatuses}
          definitiveEntryQuota={clubDefinitiveEntries[selected.id]?.teams_per_category ?? null}
          onBack={() => setSelectedId(null)}
          onRegister={(teamId) => onRegister(selected.id, teamId)}
          onDropout={onDropout}
          onSetFile={(teamId, routineType, field, file) => onSetFile(teamId, selected.id, routineType, field, file)}
          onNominate={(judgeId) => onNominate(selected.id, judgeId)}
          onRemoveNomination={onRemoveNomination}
          onInviteJudge={onInviteJudge}
          onRegisterCoach={(coachId) => onRegisterCoach(selected.id, coachId)}
          onUnregisterCoach={(coachId) => onUnregisterCoach(selected.id, coachId)}
        />
      ) : (
        <CompetitionListView
          lang={lang}
          competitions={competitions}
          teams={teams}
          entries={entries}
          nominations={nominations}
          clubProvisionalEntries={clubProvisionalEntries}
          clubDefinitiveEntries={clubDefinitiveEntries}
          ageGroupRules={ageGroupRules}
          onSelect={setSelectedId}
          onOpenProvisionalEntry={setProvisionalEntryComp}
          onOpenDefinitiveEntry={setDefinitiveEntryComp}
        />
      )}

      {provisionalEntryComp && (
        <ProvisionalEntryForm
          lang={lang}
          competition={provisionalEntryComp}
          clubId={clubId}
          clubName={clubName}
          ageGroupRules={ageGroupRules}
          onClose={() => setProvisionalEntryComp(null)}
          onSaved={() => { fetchClubEntries(); setProvisionalEntryComp(null) }}
        />
      )}

      {definitiveEntryComp && (
        <DefinitiveEntryForm
          lang={lang}
          competition={definitiveEntryComp}
          clubId={clubId}
          clubName={clubName}
          ageGroupRules={ageGroupRules}
          onClose={() => setDefinitiveEntryComp(null)}
          onSaved={() => { fetchClubEntries(); setDefinitiveEntryComp(null) }}
        />
      )}
    </>
  )
}
