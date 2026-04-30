'use client'

import { useState } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Competition, AgeGroupRule, AdminUser } from './types'
import ClickableImg from '@/components/shared/ClickableImg'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    title: 'Competitions',
    newCompetition: 'New competition',
    cancel: 'Cancel',
    create: 'Create competition',
    noCompetitions: 'No competitions yet',
    noCompetitionsSub: 'Create your first competition to get started.',
    manage: 'Manage',
    // form
    formTitle: 'New competition',
    name: 'Name',
    namePlaceholder: 'e.g. Spanish National Championships 2026',
    location: 'Location',
    locationPlaceholder: 'e.g. Madrid, Spain',
    startDate: 'Start date',
    endDate: 'End date',
    ageGroups: 'Age groups',
    ageGroupsHint: 'Select at least one',
    registrationDeadline: 'Registration deadline',
    poster: 'Poster / logo',
    posterPlaceholder: 'Image URL (upload coming soon)',
    competitionAdmin: 'Competition admin',
    noAdmin: '— assign later —',
    // status
    draft:                'Draft',
    registration_open:    'Registration open',
    registration_closed:  'Registration closed',
    published:            'Published',
    active:               'Live',
    finished:             'Finished',
    // card
    noLocation: 'No location set',
    noDates: 'Dates not set',
    noAdminAssigned: 'No admin assigned',
  },
  es: {
    title: 'Competiciones',
    newCompetition: 'Nueva competición',
    cancel: 'Cancelar',
    create: 'Crear competición',
    noCompetitions: 'Sin competiciones',
    noCompetitionsSub: 'Crea tu primera competición para empezar.',
    manage: 'Gestionar',
    // form
    formTitle: 'Nueva competición',
    name: 'Nombre',
    namePlaceholder: 'p.ej. Campeonato Nacional 2026',
    location: 'Sede',
    locationPlaceholder: 'p.ej. Madrid, España',
    startDate: 'Fecha inicio',
    endDate: 'Fecha fin',
    ageGroups: 'Grupos de edad',
    ageGroupsHint: 'Selecciona al menos uno',
    registrationDeadline: 'Fecha límite de inscripción',
    poster: 'Póster / logo',
    posterPlaceholder: 'URL de imagen (subida próximamente)',
    competitionAdmin: 'Admin de competición',
    noAdmin: '— asignar después —',
    // status
    draft:                'Borrador',
    registration_open:    'Inscripción abierta',
    registration_closed:  'Inscripción cerrada',
    published:            'Publicada',
    active:               'En vivo',
    finished:             'Finalizada',
    // card
    noLocation: 'Sin sede',
    noDates: 'Fechas no definidas',
    noAdminAssigned: 'Sin admin asignado',
  },
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDateRange(start: string | null, end: string | null): string {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return `${fmt(start)} –`
  if (end)   return `– ${fmt(end)}`
  return ''
}

const STATUS_STYLES: Record<string, string> = {
  draft:                'bg-slate-100/90 text-slate-500',
  registration_open:    'bg-green-100/90 text-green-700',
  registration_closed:  'bg-amber-100/90 text-amber-700',
  active:               'bg-blue-600/90 text-white',
  finished:             'bg-slate-100/90 text-slate-400',
}

// ─── create form ──────────────────────────────────────────────────────────────

type CreateFormProps = {
  lang: Lang
  ageGroupRules: AgeGroupRule[]
  availableAdmins: AdminUser[]
  onSubmit: (data: Omit<Competition, 'id' | 'created_at'>) => void
  onCancel: () => void
}

function CreateForm({ lang, ageGroupRules, availableAdmins, onSubmit, onCancel }: CreateFormProps) {
  const t = T[lang]
  const [name, setName]           = useState('')
  const [location, setLocation]   = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')
  const [posterUrl, setPosterUrl]                   = useState('')
  const [registrationDeadline, setRegistrationDeadline] = useState('')
  const [adminId, setAdminId]                       = useState('')
  const [selectedAGs, setSelectedAGs] = useState<Set<string>>(new Set())

  function toggleAG(ag: string) {
    setSelectedAGs((prev) => {
      const next = new Set(prev)
      next.has(ag) ? next.delete(ag) : next.add(ag)
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || selectedAGs.size === 0) return
    const admin = availableAdmins.find((u) => u.id === adminId) ?? null
    onSubmit({
      name: name.trim(),
      status: 'draft',
      location: location.trim() || null,
      start_date: startDate || null,
      end_date: endDate || null,
      age_groups: [...selectedAGs],
      registration_deadline: registrationDeadline || null,
      ts_music_deadline: null,
      poster_url: posterUrl.trim() || null,
      admin,
    })
  }

  const valid = name.trim().length > 0 && selectedAGs.size > 0

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-800 mb-5">{t.formTitle}</h2>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* name */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.name} *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* location */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.location}</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t.locationPlaceholder}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.startDate}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.endDate}</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* registration deadline */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.registrationDeadline}</label>
          <input
            type="date"
            value={registrationDeadline}
            max={startDate || undefined}
            onChange={(e) => setRegistrationDeadline(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* poster */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.poster}</label>
          <input
            type="url"
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder={t.posterPlaceholder}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* age groups */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.ageGroups} *</label>
          <p className="text-xs text-slate-400 mb-2.5">{t.ageGroupsHint}</p>
          <div className="flex flex-wrap gap-2">
            {ageGroupRules.map((rule) => {
              const active = selectedAGs.has(rule.id)
              const rangeLabel = rule.max_age
                ? `${rule.min_age}–${rule.max_age}`
                : `${rule.min_age}+`
              return (
                <button
                  type="button"
                  key={rule.id}
                  onClick={() => toggleAG(rule.id)}
                  className={[
                    'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all',
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400',
                  ].join(' ')}
                >
                  <span>{rule.age_group} ({rule.ruleset})</span>
                  <span className={['text-xs', active ? 'text-blue-200' : 'text-slate-400'].join(' ')}>
                    {rangeLabel}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* competition admin */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">{t.competitionAdmin}</label>
          <select
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t.noAdmin}</option>
            {availableAdmins.map((u) => (
              <option key={u.id} value={u.id}>{u.full_name} — {u.email}</option>
            ))}
          </select>
        </div>

        {/* actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={!valid}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {t.create}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── competition card ─────────────────────────────────────────────────────────

type CompetitionCardProps = {
  competition: Competition
  lang: Lang
  onManage: (id: string) => void
}

function CompetitionCard({ competition: c, lang, onManage }: CompetitionCardProps) {
  const t       = T[lang]
  const dateStr = formatDateRange(c.start_date, c.end_date)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* poster */}
      <div className="relative w-full aspect-[3/1] bg-slate-100 shrink-0">
        {c.poster_url ? (
          <ClickableImg
            src={c.poster_url}
            alt={c.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5c.621 0 1.125.504 1.125 1.125v13.5c0 .621-.504 1.125-1.125 1.125H3.75A1.125 1.125 0 012.625 17.625V4.125C2.625 3.504 3.129 3 3.75 3z" />
            </svg>
          </div>
        )}
        {/* status badge overlaid on poster */}
        <span className={['absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm', STATUS_STYLES[c.status]].join(' ')}>
          {c.status === 'active' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1.5 align-middle" />}
          {t[c.status]}
        </span>
      </div>

      {/* body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="text-sm font-semibold text-slate-800 leading-snug">{c.name}</h3>

        <div className="flex flex-col gap-1.5">
          {/* location */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>{c.location || t.noLocation}</span>
          </div>
          {/* dates */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span>{dateStr || t.noDates}</span>
          </div>
          {/* admin */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span>{c.admin?.full_name ?? t.noAdminAssigned}</span>
          </div>
        </div>

        {/* manage button */}
        <button
          onClick={() => onManage(c.id)}
          className="w-full mt-auto py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          {t.manage}
        </button>
      </div>
    </div>
  )
}

// ─── main view ────────────────────────────────────────────────────────────────

export type CompetitionsViewProps = {
  lang: Lang
  ageGroupRules: AgeGroupRule[]
  availableAdmins: AdminUser[]
  competitions: Competition[]
  canCreate?: boolean
  onCreate: (data: Omit<Competition, 'id' | 'created_at'>) => void
  onManage: (id: string) => void
}

export default function CompetitionsView({
  lang, ageGroupRules, availableAdmins, competitions, canCreate = true, onCreate, onManage,
}: CompetitionsViewProps) {
  const t = T[lang]
  const [showForm, setShowForm] = useState(false)

  function handleCreate(data: Omit<Competition, 'id' | 'created_at'>) {
    onCreate(data)
    setShowForm(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{t.title}</h1>
        {canCreate && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t.newCompetition}
          </button>
        )}
      </div>

      {/* create form */}
      {canCreate && showForm && (
        <CreateForm
          lang={lang}
          ageGroupRules={ageGroupRules}
          availableAdmins={availableAdmins}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* competition list */}
      {competitions.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-600">{t.noCompetitions}</p>
          <p className="text-sm text-slate-400 mt-1">{t.noCompetitionsSub}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitions.map((c) => (
            <CompetitionCard key={c.id} competition={c} lang={lang} onManage={onManage} />
          ))}
        </div>
      )}
    </div>
  )
}
