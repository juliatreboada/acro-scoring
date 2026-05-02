'use client'

import { useState, useEffect } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Team, Club, Gymnast, CompetitionEntry, AgeGroupRule, CompetitionStatus, ProvisionalEntry, DefinitiveEntry } from '@/components/admin/types'
import { SubTabSwitcher } from './SubTabSwitcher'
import ImportTab from './ImportTab'
import { createClient } from '@/lib/supabase'
import { ProvisionalSubTab } from './ProvisionalSubTab'
import { DefinitiveSubTab, type AllowedClub } from './DefinitiveSubTab'
import { NominativeView } from './NominativeSubTab'

const T = {
  en: {
    backToList: 'Back to registrations',
    subTabs: { provisional: 'Provisional', definitive: 'Definitive', nominative: 'Nominative' },
  },
  es: {
    backToList: 'Volver a inscripciones',
    subTabs: { provisional: 'Provisional', definitive: 'Definitiva', nominative: 'Nominativa' },
  },
}

type SubTab = 'provisional' | 'definitive' | 'nominative'

function defaultSubTab(status: CompetitionStatus): SubTab {
  if (status === 'provisional_entry') return 'provisional'
  if (status === 'definitive_entry')  return 'definitive'
  return 'nominative'
}

export type RegistrationsTabProps = {
  lang: Lang
  globalTeams: Team[]
  clubs: Club[]
  gymnasts: Gymnast[]
  entries: CompetitionEntry[]
  agLabels: Record<string, string>
  onToggleDropout: (entryId: string) => void
  onRemoveClubEntries?: (clubId: string) => void
  competitionId: string
  ageGroupRules: AgeGroupRule[]
  competitionAgeGroups: string[]
  competitionYear: number
  competitionStatus: CompetitionStatus
  provisionalEntries: ProvisionalEntry[]
  definitiveEntries: DefinitiveEntry[]
}

export default function RegistrationsTab({
  lang, globalTeams, clubs, gymnasts, entries, agLabels, onToggleDropout, onRemoveClubEntries,
  competitionId, ageGroupRules, competitionAgeGroups, competitionYear, competitionStatus,
  provisionalEntries: initialProvisionalEntries, definitiveEntries: initialDefinitiveEntries,
}: RegistrationsTabProps) {
  const t = T[lang]
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(() => defaultSubTab(competitionStatus))
  const [showImport, setShowImport] = useState(false)

  const [openLevels,   setOpenLevels]   = useState<Set<string>>(new Set())
  const [openGroups,   setOpenGroups]   = useState<Set<string>>(new Set())
  const [routineMusic, setRoutineMusic] = useState<Array<{ team_id: string; music_path: string | null; ts_path: string | null }>>([])

  const [provisionalEntries, setProvisionalEntries] = useState<ProvisionalEntry[]>(() => initialProvisionalEntries)
  const [definitiveEntries,  setDefinitiveEntries]  = useState<DefinitiveEntry[]>(() => initialDefinitiveEntries)
  const [allowedClubs,       setAllowedClubs]       = useState<AllowedClub[]>([])
  const [extraClubs,         setExtraClubs]         = useState<Club[]>([])

  useEffect(() => {
    const teamIds = entries.map(e => e.team_id)
    if (teamIds.length === 0) return
    const supabase = createClient()
    supabase
      .from('routine_music')
      .select('team_id, music_path, ts_path')
      .eq('competition_id', competitionId)
      .in('team_id', teamIds)
      .then(({ data }) => { if (data) setRoutineMusic(data) })
  }, [competitionId, entries])

  async function fetchEntryData() {
    const supabase = createClient()
    const { data: allowedData } = await supabase
      .from('competition_allowed_clubs')
      .select('id,club_id,source,created_at')
      .eq('competition_id', competitionId)
    if (allowedData) setAllowedClubs(allowedData as AllowedClub[])

    const allEntryClubIds = [
      ...provisionalEntries.map(e => e.club_id),
      ...definitiveEntries.map(e => e.club_id),
      ...(allowedData ?? []).map(ac => ac.club_id),
    ]
    const knownIds = new Set(clubs.map(c => c.id))
    const missingIds = [...new Set(allEntryClubIds)].filter(id => !knownIds.has(id))
    if (missingIds.length > 0) {
      const { data: extra } = await supabase.from('clubs').select('id,club_name,avatar_url,contact_name,phone').in('id', missingIds)
      if (extra) setExtraClubs(extra as Club[])
    }
  }

  useEffect(() => { fetchEntryData() }, [competitionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const allClubs = [...clubs, ...extraClubs]

  if (showImport) {
    return (
      <div>
        <button onClick={() => setShowImport(false)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-5 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t.backToList}
        </button>
        <ImportTab
          lang={lang}
          competitionId={competitionId}
          ageGroupRules={ageGroupRules}
          competitionAgeGroups={competitionAgeGroups}
          competitionYear={competitionYear}
        />
      </div>
    )
  }

  return (
    <div>
      <SubTabSwitcher
        tabs={[
          { key: 'provisional', label: t.subTabs.provisional },
          { key: 'definitive',  label: t.subTabs.definitive  },
          { key: 'nominative',  label: t.subTabs.nominative  },
        ] as const}
        active={activeSubTab}
        onChange={setActiveSubTab}
      />

      {activeSubTab === 'provisional' && (
        <ProvisionalSubTab
          lang={lang}
          provisionalEntries={provisionalEntries}
          clubs={allClubs}
          ageGroupRules={ageGroupRules}
          competitionAgeGroups={competitionAgeGroups}
        />
      )}

      {activeSubTab === 'definitive' && (
        <DefinitiveSubTab
          lang={lang}
          competitionId={competitionId}
          definitiveEntries={definitiveEntries}
          allowedClubs={allowedClubs}
          clubs={allClubs}
          entries={entries}
          ageGroupRules={ageGroupRules}
          competitionAgeGroups={competitionAgeGroups}
          onRefresh={fetchEntryData}
          onUpdateEntry={(updated) => setDefinitiveEntries(prev => prev.map(e => e.id === updated.id ? updated : e))}
          onRemoveClubEntries={onRemoveClubEntries ?? (() => {})}
        />
      )}

      {activeSubTab === 'nominative' && (
        <NominativeView
          lang={lang}
          globalTeams={globalTeams}
          clubs={clubs}
          gymnasts={gymnasts}
          entries={entries}
          agLabels={agLabels}
          onToggleDropout={onToggleDropout}
          ageGroupRules={ageGroupRules}
          routineMusic={routineMusic}
          openLevels={openLevels}
          openGroups={openGroups}
          setOpenLevels={setOpenLevels}
          setOpenGroups={setOpenGroups}
          onShowImport={() => setShowImport(true)}
          competitionId={competitionId}
          competitionAgeGroups={competitionAgeGroups}
          competitionYear={competitionYear}
        />
      )}
    </div>
  )
}
