'use client'

import { useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Club, Gymnast, Team, Competition, CompetitionEntry, RoutineMusic, Judge, CompetitionJudgeNomination } from '@/components/admin/types'
import type { AgeGroupRule } from '@/components/admin/types'
import GymnastsTab from './GymnastsTab'
import TeamsTab from './TeamsTab'
import CompetitionsTab from './CompetitionsTab'
import ClubProfileTab from './ClubProfileTab'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    tabs: { gymnasts: 'Gymnasts', teams: 'Teams', competitions: 'Competitions', judges: 'Judges', profile: 'Profile' },
    gymnasts: 'gymnasts',
    teams: 'teams',
    registrations: 'registrations',
  },
  es: {
    tabs: { gymnasts: 'Gimnastas', teams: 'Equipos', competitions: 'Competiciones', judges: 'Jueces', profile: 'Perfil' },
    gymnasts: 'gimnastas',
    teams: 'equipos',
    registrations: 'inscripciones',
  },
}

type Tab = 'gymnasts' | 'teams' | 'competitions' | 'profile'

// ─── props ────────────────────────────────────────────────────────────────────

export type ClubPortalProps = {
  lang: Lang
  club: Club
  gymnasts: Gymnast[]
  teams: Team[]
  judges: Judge[]
  nominations: CompetitionJudgeNomination[]
  competitions: Competition[]
  entries: CompetitionEntry[]
  music: RoutineMusic[]
  agLabels: Record<string, string>
  ageGroupRules: AgeGroupRule[]
  // gymnasts
  onAddGymnast: (g: Omit<Gymnast, 'id' | 'club_id'>) => void
  onUpdateGymnast: (id: string, g: Omit<Gymnast, 'id' | 'club_id'>) => void
  onDeleteGymnast: (id: string) => void
  onUploadGymnastPhoto: (id: string, file: File) => Promise<void>
  // teams
  onAddTeam: (t: Omit<Team, 'id' | 'club_id' | 'photo_url'>) => void
  onUpdateTeam: (id: string, t: Omit<Team, 'id' | 'club_id' | 'photo_url'>) => void
  onDeleteTeam: (id: string) => void
  onUploadTeamPhoto: (id: string, file: File) => Promise<void>
  // judges
  onInviteJudge: (j: { full_name: string; email: string; phone?: string; licence?: string }) => Promise<void>
  onUpdateJudge: (id: string, j: Omit<Judge, 'id' | 'avatar_url'>) => void
  onDeleteJudge: (id: string) => void
  onUploadJudgePhoto: (id: string, file: File) => Promise<void>
  // competition registration
  onRegister: (competitionId: string, teamId: string) => void
  onUnregister: (entryId: string) => void
  // files (TS + music per routine)
  onSetFile: (teamId: string, competitionId: string, routineType: 'Balance' | 'Dynamic' | 'Combined', field: 'music' | 'ts', file: File | null) => void
  // judge nominations
  onNominate: (competitionId: string, judgeId: string) => void
  onRemoveNomination: (nominationId: string) => void
  // club profile
  onUpdateClub: (data: Partial<Pick<Club, 'club_name' | 'contact_name' | 'phone'>>) => void
  onUploadAvatar: (file: File) => Promise<void>
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ClubPortal({
  lang, club, gymnasts, teams, judges, nominations, competitions, entries, music, agLabels, ageGroupRules,
  onAddGymnast, onUpdateGymnast, onDeleteGymnast, onUploadGymnastPhoto,
  onAddTeam, onUpdateTeam, onDeleteTeam, onUploadTeamPhoto,
  onInviteJudge, onUpdateJudge, onDeleteJudge, onUploadJudgePhoto,
  onRegister, onUnregister, onSetFile,
  onNominate, onRemoveNomination,
  onUpdateClub, onUploadAvatar,
}: ClubPortalProps) {
  const t = T[lang]
  const [activeTab, setActiveTab] = useState<Tab>('gymnasts')

  const activeEntries = entries.filter((e) => !e.dropped_out)
  const uniqueCompIds = new Set(activeEntries.map((e) => e.competition_id))

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'gymnasts',     label: t.tabs.gymnasts,     count: gymnasts.length },
    { key: 'teams',        label: t.tabs.teams,        count: teams.length },
    { key: 'competitions', label: t.tabs.competitions, count: uniqueCompIds.size },
    { key: 'profile',      label: t.tabs.profile },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* club header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 text-lg font-bold text-slate-500 overflow-hidden">
              {club.avatar_url
                ? <img src={club.avatar_url} alt={club.club_name} className="w-full h-full object-cover" />
                : club.club_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-800 leading-tight">{club.club_name}</h1>
              <div className="flex flex-wrap gap-x-3 mt-0.5">
                {club.contact_name && <span className="text-xs text-slate-400">{club.contact_name}</span>}
                {club.phone && <span className="text-xs text-slate-400">{club.phone}</span>}
              </div>
            </div>
          </div>

          {/* quick stats */}
          <div className="flex gap-4 mt-4">
            {[
              { n: gymnasts.length,    label: t.gymnasts },
              { n: teams.length,       label: t.teams },
              { n: uniqueCompIds.size, label: t.registrations },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-slate-800">{n}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* tabs */}
        <div className="max-w-3xl mx-auto px-4 flex overflow-x-auto">
          {TABS.map(({ key, label, count }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={[
                'px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5',
                activeTab === key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600',
              ].join(' ')}>
              {label}
              {count !== undefined && count > 0 ? (
                <span className={['text-xs px-1.5 py-0.5 rounded-full font-medium',
                  activeTab === key ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'].join(' ')}>
                  {count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* tab content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {activeTab === 'gymnasts' && (
          <GymnastsTab lang={lang} gymnasts={gymnasts}
            onAdd={onAddGymnast} onUpdate={onUpdateGymnast} onDelete={onDeleteGymnast}
            onUploadPhoto={onUploadGymnastPhoto} />
        )}
        {activeTab === 'teams' && (
          <TeamsTab lang={lang} gymnasts={gymnasts} teams={teams}
            ageGroupRules={ageGroupRules} agLabels={agLabels}
            onAdd={onAddTeam} onUpdate={onUpdateTeam} onDelete={onDeleteTeam}
            onUploadPhoto={onUploadTeamPhoto} />
        )}
        {activeTab === 'competitions' && (
          <CompetitionsTab lang={lang} competitions={competitions} teams={teams}
            entries={entries} music={music} judges={judges} nominations={nominations}
            agLabels={agLabels} ageGroupRules={ageGroupRules}
            onRegister={onRegister} onUnregister={onUnregister} onSetFile={onSetFile}
            onNominate={onNominate} onRemoveNomination={onRemoveNomination}
            onInviteJudge={onInviteJudge} />
        )}
        {activeTab === 'profile' && (
          <ClubProfileTab lang={lang} club={club} onUpdate={onUpdateClub} onUploadAvatar={onUploadAvatar} />
        )}
      </div>
    </div>
  )
}
