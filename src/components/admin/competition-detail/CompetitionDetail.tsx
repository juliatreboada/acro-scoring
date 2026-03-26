'use client'

import { useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Competition, Panel, Section, Session, Judge, SectionPanelJudge, Role, Team, Club, CompetitionEntry, SessionOrder, CompetitionStatus, AdminUser, AgeGroupRule, CompetitionJudgeNomination } from '@/components/admin/types'
import { NEXT_STATUS } from '@/components/admin/types'
import StructureTab from './StructureTab'
import JudgesTab, { type JudgesTabProps } from './JudgesTab'
import RegistrationsTab, { type RegistrationsTabProps } from './RegistrationsTab'
import StartingOrderTab, { type StartingOrderTabProps } from './StartingOrderTab'
import CompetitionDayTab from './CompetitionDayTab'

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
    },
    soon: 'Coming soon',
    soonSub: 'This section is not built yet.',
    // overview — display
    name: 'Name',
    location: 'Location',
    dates: 'Dates',
    registrationDeadline: 'Registration deadline',
    admin: 'Competition admin',
    ageGroups: 'Age groups',
    poster: 'Poster / logo',
    none: '—',
    noAdmin: '— assign later —',
    // overview — edit
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    startDate: 'Start date',
    endDate: 'End date',
    // status
    status: {
      draft:                'Draft',
      registration_open:    'Registration open',
      registration_closed:  'Registration closed',
      active:               'Live',
      finished:             'Finished',
    },
    // status advance actions
    action: {
      draft:                'Open registration',
      registration_open:    'Close registration',
      registration_closed:  'Start competition',
      active:               'Finish competition',
    } as Partial<Record<CompetitionStatus, string>>,
    confirmAction: {
      registration_closed:  'This will start the competition and enable scoring. Continue?',
      active:               'This will mark the competition as finished. Continue?',
    } as Partial<Record<CompetitionStatus, string>>,
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
    },
    soon: 'Próximamente',
    soonSub: 'Esta sección aún no está construida.',
    name: 'Nombre',
    location: 'Sede',
    dates: 'Fechas',
    registrationDeadline: 'Fecha límite de inscripción',
    admin: 'Admin de competición',
    ageGroups: 'Grupos de edad',
    poster: 'Póster / logo',
    none: '—',
    noAdmin: '— asignar después —',
    edit: 'Editar',
    save: 'Guardar',
    cancel: 'Cancelar',
    startDate: 'Fecha inicio',
    endDate: 'Fecha fin',
    // status
    status: {
      draft:                'Borrador',
      registration_open:    'Inscripción abierta',
      registration_closed:  'Inscripción cerrada',
      active:               'En vivo',
      finished:             'Finalizada',
    },
    action: {
      draft:                'Abrir inscripción',
      registration_open:    'Cerrar inscripción',
      registration_closed:  'Iniciar competición',
      active:               'Finalizar competición',
    } as Partial<Record<CompetitionStatus, string>>,
    confirmAction: {
      registration_closed:  '¿Iniciar la competición y habilitar la puntuación?',
      active:               '¿Marcar la competición como finalizada?',
    } as Partial<Record<CompetitionStatus, string>>,
  },
}

const STATUS_BADGE: Record<CompetitionStatus, string> = {
  draft:                'bg-slate-100 text-slate-500',
  registration_open:    'bg-green-100 text-green-700',
  registration_closed:  'bg-amber-100 text-amber-700',
  active:               'bg-blue-600 text-white',
  finished:             'bg-slate-100 text-slate-400',
}

const ACTION_STYLE: Partial<Record<CompetitionStatus, string>> = {
  draft:                'border-green-200 text-green-700 hover:bg-green-50',
  registration_open:    'border-amber-200 text-amber-700 hover:bg-amber-50',
  registration_closed:  'border-blue-200 text-blue-700 hover:bg-blue-50',
  active:               'border-red-200 text-red-600 hover:bg-red-50',
}

type Tab = 'structure' | 'judges' | 'startingOrder' | 'registrations' | 'overview' | 'day'

function formatDateRange(start: string | null, end: string | null): string {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return fmt(start)
  if (end)   return fmt(end)
  return ''
}

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

// ─── overview tab ─────────────────────────────────────────────────────────────

type OverviewUpdate = Omit<Competition, 'id' | 'created_at' | 'status'>

function OverviewTab({ competition, lang, availableAdmins, ageGroupRules, onUpdate }: {
  competition: Competition
  lang: Lang
  availableAdmins: AdminUser[]
  ageGroupRules: AgeGroupRule[]
  onUpdate: (updates: OverviewUpdate) => void
}) {
  const t = T[lang]
  const agLabels = Object.fromEntries(ageGroupRules.map(r => [r.id, `${r.age_group} (${r.ruleset})`]))
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<{
    name: string; location: string; start_date: string; end_date: string
    registration_deadline: string; poster_url: string; adminId: string
    age_groups: Set<string>
  }>({
    name: '', location: '', start_date: '', end_date: '',
    registration_deadline: '', poster_url: '', adminId: '', age_groups: new Set(),
  })

  function startEditing() {
    setForm({
      name: competition.name,
      location: competition.location ?? '',
      start_date: competition.start_date ?? '',
      end_date: competition.end_date ?? '',
      registration_deadline: competition.registration_deadline ?? '',
      poster_url: competition.poster_url ?? '',
      adminId: competition.admin?.id ?? '',
      age_groups: new Set(competition.age_groups),
    })
    setEditing(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onUpdate({
      name: form.name.trim(),
      location: form.location.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      registration_deadline: form.registration_deadline || null,
      poster_url: form.poster_url.trim() || null,
      admin: availableAdmins.find((u) => u.id === form.adminId) ?? null,
      age_groups: [...form.age_groups],
    })
    setEditing(false)
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-4">
        {/* name */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.name} *</label>
          <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
        </div>
        {/* location */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.location}</label>
          <input type="text" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className={inputCls} />
        </div>
        {/* dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.startDate}</label>
            <input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.endDate}</label>
            <input type="date" value={form.end_date} min={form.start_date || undefined} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} className={inputCls} />
          </div>
        </div>
        {/* registration deadline */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.registrationDeadline}</label>
          <input type="date" value={form.registration_deadline} max={form.start_date || undefined} onChange={(e) => setForm((f) => ({ ...f, registration_deadline: e.target.value }))} className={inputCls} />
        </div>
        {/* age groups */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-2">{t.ageGroups}</label>
          <div className="flex flex-wrap gap-2">
            {ageGroupRules.map((rule) => {
              const active = form.age_groups.has(rule.id)
              return (
                <button type="button" key={rule.id}
                  onClick={() => setForm((f) => {
                    const next = new Set(f.age_groups)
                    active ? next.delete(rule.id) : next.add(rule.id)
                    return { ...f, age_groups: next }
                  })}
                  className={['px-3 py-1.5 rounded-xl border text-sm font-medium transition-all', active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'].join(' ')}
                >
                  {rule.age_group} ({rule.ruleset})
                </button>
              )
            })}
          </div>
        </div>
        {/* admin */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.admin}</label>
          <select value={form.adminId} onChange={(e) => setForm((f) => ({ ...f, adminId: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">{t.noAdmin}</option>
            {availableAdmins.map((u) => <option key={u.id} value={u.id}>{u.full_name} — {u.email}</option>)}
          </select>
        </div>
        {/* poster */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.poster}</label>
          <input type="url" value={form.poster_url} onChange={(e) => setForm((f) => ({ ...f, poster_url: e.target.value }))} className={inputCls} placeholder="https://…" />
        </div>
        {/* actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => setEditing(false)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all">
            {t.cancel}
          </button>
          <button type="submit"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all">
            {t.save}
          </button>
        </div>
      </form>
    )
  }

  const dateStr = formatDateRange(competition.start_date, competition.end_date)
  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button onClick={startEditing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
          {t.edit}
        </button>
      </div>
      <dl className="divide-y divide-slate-100">
        {([
          [t.name,                 competition.name],
          [t.location,             competition.location || t.none],
          [t.dates,                dateStr || t.none],
          [t.registrationDeadline, competition.registration_deadline ? fmt(competition.registration_deadline) : t.none],
          [t.admin,                competition.admin?.full_name || t.none],
          [t.ageGroups,            competition.age_groups.map(ag => agLabels[ag] ?? ag).join(', ') || t.none],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label} className="py-3 flex gap-4">
            <dt className="w-48 shrink-0 text-sm text-slate-400">{label}</dt>
            <dd className="text-sm text-slate-700">{value}</dd>
          </div>
        ))}
      </dl>
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
  onDeleteSection: (sectionId: string) => void
  onAddSession: (s: Omit<Session, 'id'>) => void
  onDeleteSession: (sessionId: string) => void
  // judges
  globalJudges: Judge[]
  judgePool: string[]
  nominations: CompetitionJudgeNomination[]
  assignments: SectionPanelJudge[]
  onAddToPool: (judgeId: string) => void
  onRemoveFromPool: (judgeId: string) => void
  onAssignJudge: (slotId: string, judgeId: string | null) => void
  onAddSlot: (sectionId: string, panelId: string, role: Role) => void
  onRemoveSlot: (sectionId: string, panelId: string, role: Role) => void
  onCreateJudge?: (data: Omit<Judge, 'id' | 'avatar_url'>) => void
  // registrations
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  onToggleDropout: (entryId: string) => void
  // starting order
  sessionOrders: SessionOrder[]
  lockedSessions: string[]
  onReorder: (sessionId: string, teamIds: string[]) => void
  onToggleLock: (sessionId: string) => void
  // overview
  availableAdmins: AdminUser[]
  ageGroupRules: AgeGroupRule[]
  onUpdateCompetition: (updates: Omit<Competition, 'id' | 'created_at' | 'status'>) => void
  // competition day
  onStartSession: (sessionId: string) => void
  onFinishSession: (sessionId: string) => void
}

export default function CompetitionDetail({
  lang, competition, panels, sections, sessions, onBack, onAdvanceStatus,
  onSetPanelCount, onAddSection, onUpdateSectionLabel,
  onDeleteSection, onAddSession, onDeleteSession,
  globalJudges, judgePool, nominations, assignments,
  onAddToPool, onRemoveFromPool, onAssignJudge, onAddSlot, onRemoveSlot, onCreateJudge,
  globalTeams, clubs, entries, onToggleDropout, sessionOrders, lockedSessions, onReorder, onToggleLock,
  availableAdmins, ageGroupRules, onUpdateCompetition,
  onStartSession, onFinishSession,
}: CompetitionDetailProps) {
  const t = T[lang]
  const [activeTab, setActiveTab] = useState<Tab>('structure')

  const TABS: { key: Tab; label: string; live?: boolean }[] = [
    { key: 'structure',     label: t.tabs.structure     },
    { key: 'judges',        label: t.tabs.judges        },
    { key: 'startingOrder', label: t.tabs.startingOrder },
    { key: 'registrations', label: t.tabs.registrations },
    { key: 'day',           label: t.tabs.day, live: competition.status === 'active' },
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
        <div className="flex items-center justify-between gap-4 mt-1">
          <h1 className="text-xl font-bold text-slate-800 leading-snug">{competition.name}</h1>
          <div className="flex items-center gap-2 shrink-0">
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
          ageGroups={competition.age_groups}
          agLabels={Object.fromEntries(ageGroupRules.map(r => [r.id, `${r.age_group} (${r.ruleset})`]))}
          panels={panels}
          sections={sections}
          sessions={sessions}
          onSetPanelCount={onSetPanelCount}
          onAddSection={onAddSection}
          onUpdateSectionLabel={onUpdateSectionLabel}
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
          onUpdate={onUpdateCompetition}
        />
      )}
      {activeTab === 'judges' && (
        <JudgesTab
          lang={lang}
          globalJudges={globalJudges}
          judgePool={judgePool}
          nominations={nominations}
          clubs={clubs}
          assignments={assignments}
          sections={sections}
          panels={panels}
          onAddToPool={onAddToPool}
          onRemoveFromPool={onRemoveFromPool}
          onAssignJudge={onAssignJudge}
          onAddSlot={onAddSlot}
          onRemoveSlot={onRemoveSlot}
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
          onReorder={onReorder}
          onToggleLock={onToggleLock}
        />
      )}
      {activeTab === 'registrations' && (
        <RegistrationsTab
          lang={lang}
          globalTeams={globalTeams}
          clubs={clubs}
          entries={entries}
          onToggleDropout={onToggleDropout}
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
    </div>
  )
}
