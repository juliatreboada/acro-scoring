'use client'

import { useState, useEffect } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Competition, Panel, Section, Session, Judge, SectionPanelJudge, Role, Team, Club, CompetitionEntry, SessionOrder, CompetitionStatus, AdminUser, AgeGroupRule, CompetitionJudgeNomination, Gymnast, Coach, TimelineEntry, ProvisionalEntry, DefinitiveEntry } from '@/components/admin/types'
import { NEXT_STATUS, ageGroupLabel } from '@/components/admin/types'
import type { Apparatus, ApparatusRule } from '@/components/admin/types'
import StructureTab from './StructureTab'
import JudgesTab, { type JudgesTabProps, type PanelLock } from './JudgesTab'
import RegistrationsTab, { type RegistrationsTabProps } from './RegistrationsTab'
import StartingOrderTab, { type StartingOrderTabProps } from './StartingOrderTab'
import CompetitionDayTab from './CompetitionDayTab'
import LicenciasTab from './LicenciasTab'
import TVTab from './TVTab'
import OverviewTab, { type OverviewUpdate } from './OverviewTab'
import RGRegistrationsTab from './RGRegistrationsTab'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    back: 'Competitions',
    tabs: {
      structure:     'Structure',
      judges:        'Judges',
      startingOrder: 'Starting order',
      registrations: 'Registrations',
      overview:      'Overview',
      day:           'Competition day',
      licencias:     'Licencias',
      tv:            'TV',
    },
    soon: 'Coming soon',
    soonSub: 'This section is not built yet.',
    status: {
      draft:                'Draft',
      provisional_entry:    'Provisional entry',
      definitive_entry:     'Definitive entry',
      registration_open:    'Registration open',
      registration_closed:  'Registration closed',
      published:            'Published',
      active:               'Live',
      finished:             'Finished',
    },
    action: {
      draft:                'Open provisional entry',
      provisional_entry:    'Open definitive entry',
      definitive_entry:     'Open registration',
      registration_open:    'Close registration',
      registration_closed:  'Publish starting order',
      published:            'Start competition',
      active:               'Finish competition',
    } as Partial<Record<CompetitionStatus, string>>,
    confirmAction: {
      published:  'This will start the competition and enable scoring. Continue?',
      active:     'This will mark the competition as finished. Continue?',
    } as Partial<Record<CompetitionStatus, string>>,
    djReviewOpen: 'DJ Review open',
    djReviewClosed: 'DJ Review closed',
    openDJReview: 'Open DJ review',
    closeDJReview: 'Close DJ review',
    confirmCloseDJReview: 'Close the DJ review period? DJs will no longer be able to access the review.',
  },
  es: {
    back: 'Competiciones',
    tabs: {
      structure:     'Estructura',
      judges:        'Jueces',
      startingOrder: 'Orden de salida',
      registrations: 'Inscripciones',
      overview:      'Resumen',
      day:           'Día de competición',
      licencias:     'Licencias',
      tv:            'TV',
    },
    soon: 'Próximamente',
    soonSub: 'Esta jornada aún no está construida.',
    status: {
      draft:                'Borrador',
      provisional_entry:    'Inscripción provisional',
      definitive_entry:     'Inscripción definitiva',
      registration_open:    'Inscripción abierta',
      registration_closed:  'Inscripción cerrada',
      published:            'Publicada',
      active:               'En vivo',
      finished:             'Finalizada',
    },
    action: {
      draft:                'Abrir inscripción provisional',
      provisional_entry:    'Abrir inscripción definitiva',
      definitive_entry:     'Abrir inscripción nominativa',
      registration_open:    'Cerrar inscripción',
      registration_closed:  'Publicar orden de salida',
      published:            'Iniciar competición',
      active:               'Finalizar competición',
    } as Partial<Record<CompetitionStatus, string>>,
    confirmAction: {
      published:  '¿Iniciar la competición y habilitar la puntuación?',
      active:     '¿Marcar la competición como finalizada?',
    } as Partial<Record<CompetitionStatus, string>>,
    djReviewOpen: 'Revisión DJ abierta',
    djReviewClosed: 'Revisión DJ cerrada',
    openDJReview: 'Abrir revisión DJ',
    closeDJReview: 'Cerrar revisión DJ',
    confirmCloseDJReview: '¿Cerrar el período de revisión DJ? Los jueces DJ ya no podrán acceder.',
  },
}

const STATUS_BADGE: Record<CompetitionStatus, string> = {
  draft:                'bg-slate-100 text-slate-500',
  provisional_entry:    'bg-violet-100 text-violet-700',
  definitive_entry:     'bg-orange-100 text-orange-700',
  registration_open:    'bg-green-100 text-green-700',
  registration_closed:  'bg-amber-100 text-amber-700',
  published:            'bg-indigo-100 text-indigo-700',
  active:               'bg-blue-600 text-white',
  finished:             'bg-slate-100 text-slate-400',
}

const ACTION_STYLE: Partial<Record<CompetitionStatus, string>> = {
  draft:                'border-violet-200 text-violet-700 hover:bg-violet-50',
  provisional_entry:    'border-orange-200 text-orange-700 hover:bg-orange-50',
  definitive_entry:     'border-green-200 text-green-700 hover:bg-green-50',
  registration_open:    'border-amber-200 text-amber-700 hover:bg-amber-50',
  registration_closed:  'border-indigo-200 text-indigo-700 hover:bg-indigo-50',
  published:            'border-blue-200 text-blue-700 hover:bg-blue-50',
  active:               'border-red-200 text-red-600 hover:bg-red-50',
}

type Tab = 'structure' | 'judges' | 'startingOrder' | 'registrations' | 'overview' | 'day' | 'licencias' | 'tv'


// ─── placeholder tab ──────────────────────────────────────────────────────────

function PlaceholderTab({ lang }: { lang: Lang }) {
  const t = T[lang]
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.653-4.655m0 0l3.029-2.497c.14-.468.382-.89.766-1.208" />
        </svg>
      </div>
      <p className="text-base font-semibold text-slate-600">{t.soon}</p>
      <p className="text-sm text-slate-400 mt-1">{t.soonSub}</p>
    </div>
  )
}


// ─── main component ───────────────────────────────────────────────────────────

export type CompetitionDetailProps = {
  lang: Lang
  competition: Competition
  panels: Panel[]
  sections: Section[]
  sessions: Session[]
  onBack: () => void
  onAdvanceStatus: () => void
  onSetPanelCount: (count: 1 | 2) => void
  onAddSection: () => void
  onUpdateSectionLabel: (sectionId: string, label: string) => void
  onUpdateSectionTimes: (sectionId: string, times: { starting_time: string | null; waiting_time_seconds: number | null; warmup_duration_minutes: number | null }) => void
  onDeleteSection: (sectionId: string) => void
  onAddSession: (s: Omit<Session, 'id'>) => void
  onDeleteSession: (sessionId: string) => void
  // judges
  globalJudges: Judge[]
  judgePool: string[]
  nominations: CompetitionJudgeNomination[]
  assignments: SectionPanelJudge[]
  panelLocks: PanelLock[]
  onAddToPool: (judgeId: string) => void
  onRemoveFromPool: (judgeId: string) => void
  onAssignJudge: (slotId: string, judgeId: string | null) => void
  onAddSlot: (sectionId: string, panelId: string, role: Role) => void
  onRemoveSlot: (sectionId: string, panelId: string, role: Role) => void
  onTogglePanelLock: (sectionId: string, panelId: string) => Promise<void>
  onCreateJudge?: (data: Omit<Judge, 'id' | 'avatar_url'>) => Promise<void>
  // registrations
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  provisionalEntries: ProvisionalEntry[]
  definitiveEntries: DefinitiveEntry[]
  onToggleDropout: (entryId: string) => void
  onRemoveClubEntries?: (clubId: string) => void
  // starting order
  sessionOrders: SessionOrder[]
  lockedSessions: string[]
  onReorder: (sessionId: string, teamIds: string[]) => void
  onToggleLock: (sessionId: string) => void
  onReorderTimeline: (sectionId: string, order: Array<TimelineEntry>) => void
  // overview
  availableAdmins: AdminUser[]
  ageGroupRules: AgeGroupRule[]
  apparatus: Apparatus[]
  apparatusRules: ApparatusRule[]
  onUpdateCompetition: (updates: OverviewUpdate) => void
  onUploadPoster: (file: File) => Promise<void>
  onUpdateFees: (fees: { fee_per_team: number | null; fee_per_gymnast: number | null; judge_missing_fine: number | null }) => void
  // dj review
  onSetDJReviewDeadline: (date: string | null) => void
  // competition day
  onStartSession: (sessionId: string) => void
  onFinishSession: (sessionId: string) => void
  // licencias
  competitionGymnasts: Gymnast[]
  competitionCoaches: Coach[]
  globalCoaches: Coach[]
}

export default function CompetitionDetail({
  lang, competition, panels, sections, sessions, onBack, onAdvanceStatus,
  onSetPanelCount, onAddSection, onUpdateSectionLabel, onUpdateSectionTimes,
  onDeleteSection, onAddSession, onDeleteSession,
  globalJudges, judgePool, nominations, assignments,
  panelLocks, onAddToPool, onRemoveFromPool, onAssignJudge, onAddSlot, onRemoveSlot,
  onTogglePanelLock, onCreateJudge,
  globalTeams, clubs, entries, provisionalEntries, definitiveEntries, onToggleDropout, onRemoveClubEntries, sessionOrders, lockedSessions, onReorder, onToggleLock, onReorderTimeline,
  availableAdmins, ageGroupRules, apparatus, apparatusRules, onUpdateCompetition, onUploadPoster, onUpdateFees,
  onSetDJReviewDeadline, onStartSession, onFinishSession,
  competitionGymnasts, competitionCoaches, globalCoaches,
}: CompetitionDetailProps) {
  const t = T[lang]
  const [activeTab, setActiveTab] = useState<Tab>('structure')

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const djReviewIsOpen = competition.ts_music_deadline !== null && today > competition.ts_music_deadline
  const showDJReviewToggle = !['draft', 'finished'].includes(competition.status)

  const TABS: { key: Tab; label: string; live?: boolean }[] = [
    { key: 'structure',     label: t.tabs.structure     },
    { key: 'judges',        label: t.tabs.judges        },
    { key: 'startingOrder', label: t.tabs.startingOrder },
    { key: 'registrations', label: t.tabs.registrations },
    { key: 'licencias',     label: t.tabs.licencias     },
    { key: 'day',           label: t.tabs.day, live: competition.status === 'active' },
    { key: 'tv',            label: t.tabs.tv            },
    { key: 'overview',      label: t.tabs.overview      },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* back + title */}
      <div className="mb-6">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-3 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t.back}
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3 mt-1">
          <h1 className="text-xl font-bold text-slate-800 leading-snug">{competition.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {/* public page links */}
            {(['registration_closed', 'active', 'finished'] as const).includes(competition.status as 'registration_closed' | 'active' | 'finished') && (
              <a href={`/starting-order/${competition.id}`} target="_blank" rel="noopener noreferrer"
                title="Starting order (public)"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </a>
            )}
            {(competition.status === 'active' || competition.status === 'finished') && (
              <a href={`/results/${competition.id}`} target="_blank" rel="noopener noreferrer"
                title="Results (public)"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5m-9 4.5v-4.5m0 0A2.25 2.25 0 019.75 12h4.5A2.25 2.25 0 0116.5 14.25m-9 0V12a4.5 4.5 0 119 0v2.25" />
                </svg>
              </a>
            )}
            {/* DJ review toggle */}
            {showDJReviewToggle && (
              djReviewIsOpen ? (
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {t.djReviewOpen}
                  </span>
                  <button
                    onClick={() => {
                      if (!confirm(t.confirmCloseDJReview)) return
                      onSetDJReviewDeadline('2099-12-31')
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600 transition-all"
                  >
                    {t.closeDJReview}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onSetDJReviewDeadline(yesterday)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 text-slate-500 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                >
                  {t.openDJReview}
                </button>
              )
            )}
            {/* status badge */}
            <span className={['px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5', STATUS_BADGE[competition.status]].join(' ')}>
              {competition.status === 'active' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
              )}
              {t.status[competition.status]}
            </span>
            {/* advance button */}
            {NEXT_STATUS[competition.status] && (
              <button
                onClick={() => {
                  const confirmMsg = t.confirmAction[competition.status]
                  if (confirmMsg && !confirm(confirmMsg)) return
                  onAdvanceStatus()
                }}
                className={['px-3 py-1 rounded-lg text-xs font-semibold border transition-all', ACTION_STYLE[competition.status] ?? ''].join(' ')}
              >
                {t.action[competition.status]}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* tab bar */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map(({ key, label, live }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={[
              'px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5',
              activeTab === key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600',
            ].join(' ')}
          >
            {live && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />}
            {label}
          </button>
        ))}
      </div>

      {/* tab content */}
      {activeTab === 'structure' && (
        <StructureTab
          lang={lang}
          competitionId={competition.id}
          sportType={competition.sport_type}
          competitionYear={competition.start_date ? new Date(competition.start_date).getFullYear() : new Date().getFullYear()}
          ageGroups={competition.age_groups}
          agLabels={Object.fromEntries(ageGroupRules.map(r => [r.id, ageGroupLabel(r)]))}
          ageGroupRules={ageGroupRules}
          apparatus={apparatus}
          apparatusRules={apparatusRules}
          panels={panels}
          sections={sections}
          sessions={sessions}
          onAddSection={onAddSection}
          onUpdateSectionLabel={onUpdateSectionLabel}
          onUpdateSectionTimes={onUpdateSectionTimes}
          onDeleteSection={onDeleteSection}
          onAddSession={onAddSession}
          onDeleteSession={onDeleteSession}
        />
      )}
      {activeTab === 'overview' && (
        <OverviewTab
          competition={competition}
          lang={lang}
          availableAdmins={availableAdmins}
          ageGroupRules={ageGroupRules}
          panels={panels}
          sessions={sessions}
          onUpdate={onUpdateCompetition}
          onUploadPoster={onUploadPoster}
          onSetPanelCount={onSetPanelCount}
        />
      )}
      {activeTab === 'judges' && (
        <JudgesTab
          lang={lang}
          sportType={competition.sport_type}
          globalJudges={globalJudges}
          judgePool={judgePool}
          nominations={nominations}
          clubs={clubs}
          assignments={assignments}
          sections={sections}
          panels={panels}
          panelLocks={panelLocks}
          onAddToPool={onAddToPool}
          onRemoveFromPool={onRemoveFromPool}
          onAssignJudge={onAssignJudge}
          onAddSlot={onAddSlot}
          onRemoveSlot={onRemoveSlot}
          onTogglePanelLock={onTogglePanelLock}
          onCreateJudge={onCreateJudge}
        />
      )}
      {activeTab === 'startingOrder' && (
        <StartingOrderTab
          lang={lang}
          globalTeams={globalTeams}
          clubs={clubs}
          entries={entries}
          sections={sections}
          panels={panels}
          sessions={sessions}
          sessionOrders={sessionOrders}
          lockedSessions={lockedSessions}
          agLabels={Object.fromEntries(ageGroupRules.map(r => [r.id, `${r.age_group}`]))}
          ageGroupRules={ageGroupRules}
          onReorder={onReorder}
          onToggleLock={onToggleLock}
          onReorderTimeline={onReorderTimeline}
        />
      )}
      {activeTab === 'registrations' && competition.sport_type === 'rg' && (
        <RGRegistrationsTab lang={lang} competition={competition} />
      )}
      {activeTab === 'registrations' && competition.sport_type !== 'rg' && (
        <RegistrationsTab
          lang={lang}
          globalTeams={globalTeams}
          clubs={clubs}
          gymnasts={competitionGymnasts}
          entries={entries}
          agLabels={Object.fromEntries(ageGroupRules.map(r => [r.id, `${r.age_group}`]))}
          onToggleDropout={onToggleDropout}
          onRemoveClubEntries={onRemoveClubEntries}
          competitionId={competition.id}
          ageGroupRules={ageGroupRules}
          competitionAgeGroups={competition.age_groups}
          competitionYear={competition.start_date ? new Date(competition.start_date + 'T00:00:00').getFullYear() : new Date().getFullYear()}
          competitionStatus={competition.status}
          provisionalEntries={provisionalEntries}
          definitiveEntries={definitiveEntries}
        />
      )}
      {activeTab === 'licencias' && (
        <LicenciasTab
          lang={lang}
          competitionStatus={competition.status}
          provisionalEntries={provisionalEntries}
          definitiveEntries={definitiveEntries}
          globalTeams={globalTeams}
          clubs={clubs}
          entries={entries}
          competitionGymnasts={competitionGymnasts}
          competitionCoaches={competitionCoaches}
          globalCoaches={globalCoaches}
          ageGroupRules={ageGroupRules}
        />
      )}
      {activeTab === 'day' && (
        <CompetitionDayTab
          lang={lang}
          competition={competition}
          sections={sections}
          panels={panels}
          sessions={sessions}
          sessionOrders={sessionOrders}
          globalTeams={globalTeams}
          clubs={clubs}
          entries={entries}
          onStartSession={onStartSession}
          onFinishSession={onFinishSession}
        />
      )}
      {activeTab === 'tv' && (
        <TVTab
          lang={lang}
          competition={competition}
          sessions={sessions}
          globalTeams={globalTeams}
          clubs={clubs}
          entries={entries}
          agLabels={Object.fromEntries(ageGroupRules.map(r => [r.id, r.age_group]))}
        />
      )}
    </div>
  )
}
