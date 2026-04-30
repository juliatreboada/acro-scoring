'use client'

import { useRef, useState, useEffect } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Competition, Panel, Section, Session, Judge, SectionPanelJudge, Role, Team, Club, CompetitionEntry, SessionOrder, CompetitionStatus, AdminUser, AgeGroupRule, CompetitionJudgeNomination, Gymnast, Coach, TimelineEntry } from '@/components/admin/types'
import { NEXT_STATUS } from '@/components/admin/types'
import StructureTab from './StructureTab'
import JudgesTab, { type JudgesTabProps, type PanelLock } from './JudgesTab'
import RegistrationsTab, { type RegistrationsTabProps } from './RegistrationsTab'
import StartingOrderTab, { type StartingOrderTabProps } from './StartingOrderTab'
import CompetitionDayTab from './CompetitionDayTab'
import LicenciasTab from './LicenciasTab'
import TVTab from './TVTab'

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
    // overview — display
    name: 'Name',
    location: 'Location',
    dates: 'Dates',
    registrationDeadline: 'Registration deadline',
    tsMusicDeadline: 'TS & Music deadline',
    admin: 'Competition admin',
    ageGroups: 'Age groups',
    poster: 'Poster / logo',
    panels: 'Judging panels',
    panelN: (n: number) => `${n} panel${n !== 1 ? 's' : ''}`,
    warningPanelChange: 'Changing to 1 panel will reassign all sessions to Panel 1.',
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
      provisional_entry:    'Provisional entry',
      definitive_entry:     'Definitive entry',
      registration_open:    'Registration open',
      registration_closed:  'Registration closed',
      published:            'Published',
      active:               'Live',
      finished:             'Finished',
    },
    // status advance actions
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
    posterUpload: 'Upload image',
    posterReplace: 'Replace',
    posterUploading: 'Uploading…',
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
    name: 'Nombre',
    location: 'Sede',
    dates: 'Fechas',
    registrationDeadline: 'Fecha límite de inscripción',
    tsMusicDeadline: 'Fecha límite de TS y música',
    admin: 'Admin de competición',
    ageGroups: 'Grupos de edad',
    poster: 'Póster / logo',
    panels: 'Paneles de jueces',
    panelN: (n: number) => `${n} panel${n !== 1 ? 'es' : ''}`,
    warningPanelChange: 'Cambiar a 1 panel reasignará todas las sesiones al Panel 1.',
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
    posterUpload: 'Subir imagen',
    posterReplace: 'Reemplazar',
    posterUploading: 'Subiendo…',
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

type OverviewUpdate = Omit<Competition, 'id' | 'created_at' | 'status' | 'fee_per_team' | 'fee_per_gymnast' | 'judge_missing_fine'>

function OverviewTab({ competition, lang, availableAdmins, ageGroupRules, panels, sessions, onUpdate, onSetPanelCount, onUploadPoster }: {
  competition: Competition
  lang: Lang
  availableAdmins: AdminUser[]
  ageGroupRules: AgeGroupRule[]
  panels: Panel[]
  sessions: Session[]
  onUpdate: (updates: OverviewUpdate) => void
  onSetPanelCount: (count: 1 | 2) => void
  onUploadPoster: (file: File) => Promise<void>
}) {
  const t = T[lang]
  const agLabels = Object.fromEntries(ageGroupRules.map(r => [r.id, `${r.age_group} (${r.ruleset})`]))
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const posterInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<{
    name: string; location: string; start_date: string; end_date: string
    registration_deadline: string; ts_music_deadline: string; poster_url: string; adminId: string
    age_groups: Set<string>
  }>({
    name: '', location: '', start_date: '', end_date: '',
    registration_deadline: '', ts_music_deadline: '', poster_url: '', adminId: '', age_groups: new Set(),
  })

  // Sync form poster_url when parent updates competition.poster_url (e.g. after upload)
  useEffect(() => {
    if (editing) setForm(f => ({ ...f, poster_url: competition.poster_url ?? '' }))
  }, [competition.poster_url]) // eslint-disable-line react-hooks/exhaustive-deps

  function startEditing() {
    setForm({
      name: competition.name,
      location: competition.location ?? '',
      start_date: competition.start_date ?? '',
      end_date: competition.end_date ?? '',
      registration_deadline: competition.registration_deadline ?? '',
      ts_music_deadline: competition.ts_music_deadline ?? '',
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
      ts_music_deadline: form.ts_music_deadline || null,
      poster_url: form.poster_url.trim() || null,
      admin: availableAdmins.find((u) => u.id === form.adminId) ?? null,
      age_groups: [...form.age_groups],
    })
    setEditing(false)
  }

  async function handlePosterFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try { await onUploadPoster(file) } finally {
      setUploading(false)
      if (posterInputRef.current) posterInputRef.current.value = ''
    }
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
        {/* TS & music deadline */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.tsMusicDeadline}</label>
          <input type="date" value={form.ts_music_deadline} max={form.start_date || undefined} onChange={(e) => setForm((f) => ({ ...f, ts_music_deadline: e.target.value }))} className={inputCls} />
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
          <div className="flex items-start gap-3">
            {form.poster_url && (
              <img src={form.poster_url} alt="poster" className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200" />
            )}
            <div className="flex-1 space-y-2">
              <input type="url" value={form.poster_url} onChange={(e) => setForm((f) => ({ ...f, poster_url: e.target.value }))} className={inputCls} placeholder="https://…" />
              <button type="button" disabled={uploading} onClick={() => posterInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all">
                {uploading ? t.posterUploading : (form.poster_url ? t.posterReplace : t.posterUpload)}
              </button>
            </div>
          </div>
          <input ref={posterInputRef} type="file" accept="image/*" className="hidden" onChange={handlePosterFile} />
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
  const panelCount = panels.length as 1 | 2

  function handlePanelCountChange(count: 1 | 2) {
    if (count === panelCount) return
    if (count === 1 && sessions.length > 0) {
      if (!confirm(t.warningPanelChange)) return
    }
    onSetPanelCount(count)
  }

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
          [t.tsMusicDeadline,      competition.ts_music_deadline ? fmt(competition.ts_music_deadline) : t.none],
          [t.admin,                competition.admin?.full_name || t.none],
          [t.ageGroups,            competition.age_groups.map(ag => agLabels[ag] ?? ag).join(', ') || t.none],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label} className="py-3 flex gap-4">
            <dt className="w-48 shrink-0 text-sm text-slate-400">{label}</dt>
            <dd className="text-sm text-slate-700">{value}</dd>
          </div>
        ))}
        {/* poster */}
        <div className="py-3 flex items-center gap-4">
          <dt className="w-48 shrink-0 text-sm text-slate-400">{t.poster}</dt>
          <dd className="flex items-center gap-3">
            {competition.poster_url
              ? <img src={competition.poster_url} alt="poster" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
              : <span className="text-sm text-slate-300">—</span>
            }
            <button type="button" disabled={uploading} onClick={() => posterInputRef.current?.click()}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all">
              {uploading ? t.posterUploading : (competition.poster_url ? t.posterReplace : t.posterUpload)}
            </button>
          </dd>
        </div>
        {/* panel count — inline toggle */}
        <div className="py-3 flex items-center gap-4">
          <dt className="w-48 shrink-0 text-sm text-slate-400">{t.panels}</dt>
          <dd className="flex gap-2">
            {([1, 2] as const).map((n) => (
              <button
                key={n}
                onClick={() => handlePanelCountChange(n)}
                className={[
                  'px-3 py-1 rounded-lg border text-sm font-semibold transition-all',
                  panelCount === n
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600',
                ].join(' ')}
              >
                {t.panelN(n)}
              </button>
            ))}
          </dd>
        </div>
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
  globalTeams, clubs, entries, onToggleDropout, onRemoveClubEntries, sessionOrders, lockedSessions, onReorder, onToggleLock, onReorderTimeline,
  availableAdmins, ageGroupRules, onUpdateCompetition, onUploadPoster, onUpdateFees,
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
          ageGroups={competition.age_groups}
          agLabels={Object.fromEntries(ageGroupRules.map(r => [r.id, `${r.age_group} (${r.ruleset})`]))}
          ageGroupRules={ageGroupRules}
          panels={panels}
          sections={sections}
          sessions={sessions}
          fees={{
            fee_per_team:       competition.fee_per_team,
            fee_per_gymnast:    competition.fee_per_gymnast,
            judge_missing_fine: competition.judge_missing_fine,
          }}
          onAddSection={onAddSection}
          onUpdateSectionLabel={onUpdateSectionLabel}
          onUpdateSectionTimes={onUpdateSectionTimes}
          onDeleteSection={onDeleteSection}
          onAddSession={onAddSession}
          onDeleteSession={onDeleteSession}
          onUpdateFees={onUpdateFees}
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
      {activeTab === 'registrations' && (
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
        />
      )}
      {activeTab === 'licencias' && (
        <LicenciasTab
          lang={lang}
          competitionId={competition.id}
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
