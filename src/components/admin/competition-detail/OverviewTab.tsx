'use client'

import { useState, useRef } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Competition, AdminUser, AgeGroupRule, Panel, Session } from '@/components/admin/types'
import { groupByLevel, ageGroupLabel, rgRulesetLabel } from '@/components/admin/types'
import { formatDateRange } from '@/lib/formatDate'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    none: '—',
    noAdmin: '— assign later —',
    warningPanelChange: 'Changing to 1 panel will reassign all sessions to Panel 1.',
    posterUpload: 'Upload image',
    posterReplace: 'Replace',
    posterUploading: 'Uploading…',
    ageGroups: 'Age groups',
    panels: 'Judging panels',
    panelN: (n: number) => `${n} panel${n !== 1 ? 's' : ''}`,
    feesTitle: 'Entry fees',
    feePerTeam: 'Per team',
    feePerGymnast: 'Per gymnast',
    judgeMissingFine: 'Missing judge fine (€)',
    provisionalEntryDeadline: 'Provisional entry deadline',
    definitiveEntryDeadline: 'Definitive entry deadline',
    registrationDeadline: 'Registration deadline',
    tsMusicDeadline: 'TS & Music deadline',
  },
  es: {
    none: '—',
    noAdmin: '— asignar después —',
    warningPanelChange: 'Cambiar a 1 panel reasignará todas las sesiones al Panel 1.',
    posterUpload: 'Subir imagen',
    posterReplace: 'Reemplazar',
    posterUploading: 'Subiendo…',
    ageGroups: 'Grupos de edad',
    panels: 'Paneles de jueces',
    panelN: (n: number) => `${n} panel${n !== 1 ? 'es' : ''}`,
    feesTitle: 'Tasas de inscripción',
    feePerTeam: 'Por equipo',
    feePerGymnast: 'Por gimnasta',
    judgeMissingFine: 'Penalización sin juez (€)',
    provisionalEntryDeadline: 'Fecha límite inscripción provisional',
    definitiveEntryDeadline: 'Fecha límite inscripción definitiva',
    registrationDeadline: 'Fecha límite de inscripción',
    tsMusicDeadline: 'Fecha límite de TS y música',
  },
}

// ─── types ────────────────────────────────────────────────────────────────────

export type OverviewUpdate = {
  name: string
  location: string | null
  start_date: string | null
  end_date: string | null
  registration_deadline: string | null
  ts_music_deadline: string | null
  provisional_entry_deadline: string | null
  definitive_entry_deadline: string | null
  poster_url: string | null
  admin: AdminUser | null
  age_groups: string[]
  fee_per_team: number | null
  fee_per_gymnast: number | null
  judge_missing_fine: number | null
}

// ─── component ────────────────────────────────────────────────────────────────

export default function OverviewTab({ competition, lang, availableAdmins, ageGroupRules, panels, sessions, onUpdate, onSetPanelCount, onUploadPoster }: {
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
  const filteredAGs = ageGroupRules.filter(r => r.sport_type === competition.sport_type)
  const agLabels = Object.fromEntries(ageGroupRules.map(r => [r.id, ageGroupLabel(r)]))
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const posterInputRef = useRef<HTMLInputElement>(null)

  const [editingName, setEditingName] = useState(false)
  const [editingLocation, setEditingLocation] = useState(false)
  const [editingDates, setEditingDates] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(false)
  const [editingAgeGroups, setEditingAgeGroups] = useState(false)
  const [editingFees, setEditingFees] = useState(false)
  const [editingDeadlines, setEditingDeadlines] = useState(false)

  const [nameForm, setNameForm] = useState(competition.name)
  const [locationForm, setLocationForm] = useState(competition.location ?? '')
  const [startDateForm, setStartDateForm] = useState(competition.start_date ?? '')
  const [endDateForm, setEndDateForm] = useState(competition.end_date ?? '')
  const [adminIdForm, setAdminIdForm] = useState(competition.admin?.id ?? '')
  const [ageGroupsForm, setAgeGroupsForm] = useState<Set<string>>(new Set(competition.age_groups))
  const [feeTypeForm, setFeeTypeForm] = useState<'team' | 'gymnast'>(
    competition.fee_per_gymnast ? 'gymnast' : 'team'
  )
  const [feeAmountForm, setFeeAmountForm] = useState<number | null>(
    competition.fee_per_gymnast ?? competition.fee_per_team ?? null
  )
  const [judgeFineForm, setJudgeFineForm] = useState<number | null>(competition.judge_missing_fine ?? null)

  const [provisionalDeadlineForm, setProvisionalDeadlineForm] = useState(competition.provisional_entry_deadline ?? '')
  const [definitiveDeadlineForm, setDefinitiveDeadlineForm] = useState(competition.definitive_entry_deadline ?? '')
  const [registrationDeadlineForm, setRegistrationDeadlineForm] = useState(competition.registration_deadline ?? '')
  const [tsMusicDeadlineForm, setTsMusicDeadlineForm] = useState(competition.ts_music_deadline ?? '')

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

  async function handlePosterFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      await onUploadPoster(file)
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (posterInputRef.current) posterInputRef.current.value = ''
    }
  }

  async function saveName() {
    if (nameForm === competition.name) { setEditingName(false); return }
    await onUpdate({ ...competition, name: nameForm, location: competition.location, start_date: competition.start_date, end_date: competition.end_date, registration_deadline: competition.registration_deadline, ts_music_deadline: competition.ts_music_deadline, provisional_entry_deadline: competition.provisional_entry_deadline, definitive_entry_deadline: competition.definitive_entry_deadline, poster_url: competition.poster_url, admin: competition.admin, age_groups: competition.age_groups, fee_per_team: competition.fee_per_team, fee_per_gymnast: competition.fee_per_gymnast, judge_missing_fine: competition.judge_missing_fine })
    setEditingName(false)
  }

  async function saveLocation() {
    if (locationForm === (competition.location ?? '')) { setEditingLocation(false); return }
    await onUpdate({ ...competition, name: competition.name, location: locationForm || null, start_date: competition.start_date, end_date: competition.end_date, registration_deadline: competition.registration_deadline, ts_music_deadline: competition.ts_music_deadline, provisional_entry_deadline: competition.provisional_entry_deadline, definitive_entry_deadline: competition.definitive_entry_deadline, poster_url: competition.poster_url, admin: competition.admin, age_groups: competition.age_groups, fee_per_team: competition.fee_per_team, fee_per_gymnast: competition.fee_per_gymnast, judge_missing_fine: competition.judge_missing_fine })
    setEditingLocation(false)
  }

  async function saveDates() {
    await onUpdate({ ...competition, name: competition.name, location: competition.location, start_date: startDateForm || null, end_date: endDateForm || null, registration_deadline: competition.registration_deadline, ts_music_deadline: competition.ts_music_deadline, provisional_entry_deadline: competition.provisional_entry_deadline, definitive_entry_deadline: competition.definitive_entry_deadline, poster_url: competition.poster_url, admin: competition.admin, age_groups: competition.age_groups, fee_per_team: competition.fee_per_team, fee_per_gymnast: competition.fee_per_gymnast, judge_missing_fine: competition.judge_missing_fine })
    setEditingDates(false)
  }

  async function saveAdmin() {
    const admin = availableAdmins.find((u) => u.id === adminIdForm) ?? null
    await onUpdate({ ...competition, name: competition.name, location: competition.location, start_date: competition.start_date, end_date: competition.end_date, registration_deadline: competition.registration_deadline, ts_music_deadline: competition.ts_music_deadline, provisional_entry_deadline: competition.provisional_entry_deadline, definitive_entry_deadline: competition.definitive_entry_deadline, poster_url: competition.poster_url, admin, age_groups: competition.age_groups, fee_per_team: competition.fee_per_team, fee_per_gymnast: competition.fee_per_gymnast, judge_missing_fine: competition.judge_missing_fine })
    setEditingAdmin(false)
  }

  async function saveAgeGroups() {
    await onUpdate({ ...competition, name: competition.name, location: competition.location, start_date: competition.start_date, end_date: competition.end_date, registration_deadline: competition.registration_deadline, ts_music_deadline: competition.ts_music_deadline, provisional_entry_deadline: competition.provisional_entry_deadline, definitive_entry_deadline: competition.definitive_entry_deadline, poster_url: competition.poster_url, admin: competition.admin, age_groups: [...ageGroupsForm], fee_per_team: competition.fee_per_team, fee_per_gymnast: competition.fee_per_gymnast, judge_missing_fine: competition.judge_missing_fine })
    setEditingAgeGroups(false)
  }

  async function saveFees() {
    const fee_per_team = feeTypeForm === 'team' ? feeAmountForm : null
    const fee_per_gymnast = feeTypeForm === 'gymnast' ? feeAmountForm : null
    await onUpdate({ ...competition, name: competition.name, location: competition.location, start_date: competition.start_date, end_date: competition.end_date, registration_deadline: competition.registration_deadline, ts_music_deadline: competition.ts_music_deadline, provisional_entry_deadline: competition.provisional_entry_deadline, definitive_entry_deadline: competition.definitive_entry_deadline, poster_url: competition.poster_url, admin: competition.admin, age_groups: competition.age_groups, fee_per_team, fee_per_gymnast, judge_missing_fine: judgeFineForm })
    setEditingFees(false)
  }

  async function saveDeadlines() {
    await onUpdate({ ...competition, name: competition.name, location: competition.location, start_date: competition.start_date, end_date: competition.end_date, registration_deadline: registrationDeadlineForm || null, ts_music_deadline: tsMusicDeadlineForm || null, provisional_entry_deadline: provisionalDeadlineForm || null, definitive_entry_deadline: definitiveDeadlineForm || null, poster_url: competition.poster_url, admin: competition.admin, age_groups: competition.age_groups, fee_per_team: competition.fee_per_team, fee_per_gymnast: competition.fee_per_gymnast, judge_missing_fine: competition.judge_missing_fine })
    setEditingDeadlines(false)
  }

  const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400'
  const dateCls = 'border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div>
      {/* Header with Name, Location, Dates, and Admin */}
      <div className="mb-6 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Name - inline editable */}
            <div>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={nameForm} onChange={(e) => setNameForm(e.target.value)} className={inputCls} autoFocus />
                  <button onClick={saveName} className="p-2 text-green-600 hover:text-green-700">✓</button>
                  <button onClick={() => setEditingName(false)} className="p-2 text-red-500 hover:text-red-600">✗</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-800">{competition.name}</h2>
                  <button onClick={() => setEditingName(true)} className="text-slate-400 hover:text-blue-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Location - inline editable */}
            <div>
              {editingLocation ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={locationForm} onChange={(e) => setLocationForm(e.target.value)} placeholder="Location" className={inputCls} />
                  <button onClick={saveLocation} className="p-2 text-green-600">✓</button>
                  <button onClick={() => setEditingLocation(false)} className="p-2 text-red-500">✗</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {competition.location ? (
                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {competition.location}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">No location set</span>
                  )}
                  <button onClick={() => setEditingLocation(true)} className="text-slate-400 hover:text-blue-500">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Dates - inline editable */}
            <div>
              {editingDates ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500">Start:</label>
                    <input type="date" value={startDateForm} onChange={(e) => setStartDateForm(e.target.value)} className={dateCls} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500">End:</label>
                    <input type="date" value={endDateForm} onChange={(e) => setEndDateForm(e.target.value)} className={dateCls} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={saveDates} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg">Save</button>
                    <button onClick={() => setEditingDates(false)} className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded-lg">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {dateStr ? (
                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                      </svg>
                      {dateStr}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">No dates set</span>
                  )}
                  <button onClick={() => setEditingDates(true)} className="text-slate-400 hover:text-blue-500">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Admin badge in header */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            {editingAdmin ? (
              <div className="flex items-center gap-2">
                <select value={adminIdForm} onChange={(e) => setAdminIdForm(e.target.value)} className="text-sm border rounded-lg px-2 py-1">
                  <option value="">{t.noAdmin}</option>
                  {availableAdmins.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>
                <button onClick={saveAdmin} className="text-green-600">✓</button>
                <button onClick={() => setEditingAdmin(false)} className="text-red-500">✗</button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-slate-700">{competition.admin?.full_name || t.none}</span>
                <button onClick={() => setEditingAdmin(true)} className="text-slate-400 hover:text-blue-500">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-column layout: Poster + Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Poster - Left column */}
        <div className="md:col-span-1">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden sticky top-6 h-full">
            <div className="aspect-[3/4] bg-slate-100 flex items-center justify-center">
              {competition.poster_url ? (
                <img src={competition.poster_url} alt="poster" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              )}
            </div>
            <div className="p-3 text-center border-t border-slate-200">
              <button type="button" disabled={uploading} onClick={() => posterInputRef.current?.click()}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-all w-full">
                {uploading ? t.posterUploading : (competition.poster_url ? t.posterReplace : t.posterUpload)}
              </button>
              {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
            </div>
          </div>
        </div>

        {/* Info Cards - Right column */}
        <div className="md:col-span-2 space-y-4">
          {/* Age Groups Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t.ageGroups}</h3>
              {!editingAgeGroups && (
                <button onClick={() => setEditingAgeGroups(true)} className="text-slate-400 hover:text-blue-500">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                </button>
              )}
            </div>
            <div className="p-4">
              {editingAgeGroups ? (
                <div className="space-y-4">
                  {groupByLevel(filteredAGs).map(({ level, rules }) => (
                    <div key={level} className="bg-slate-50 rounded-xl border border-slate-100 p-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{level}</p>
                      {competition.sport_type === 'rg' ? (
                        <div className="space-y-2">
                          {(['Individual', 'Group', 'Equipos'] as const).map((rs) => {
                            const sub = rules.filter((r) => r.ruleset === rs)
                            if (sub.length === 0) return null
                            return (
                              <div key={rs}>
                                <p className="text-xs text-slate-400 italic mb-1">{rgRulesetLabel(rs)}</p>
                                <div className="flex flex-wrap gap-2">
                                  {sub.map((rule) => {
                                    const active = ageGroupsForm.has(rule.id)
                                    const rangeLabel = rule.max_age ? `${rule.min_age}–${rule.max_age}` : `${rule.min_age}+`
                                    return (
                                      <button type="button" key={rule.id}
                                        onClick={() => { const next = new Set(ageGroupsForm); active ? next.delete(rule.id) : next.add(rule.id); setAgeGroupsForm(next) }}
                                        className={['flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all', active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'].join(' ')}
                                      >
                                        <span>{rule.age_group}</span>
                                        <span className={['text-xs', active ? 'text-blue-200' : 'text-slate-400'].join(' ')}>{rangeLabel}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {rules.map((rule) => {
                            const active = ageGroupsForm.has(rule.id)
                            const rangeLabel = rule.max_age ? `${rule.min_age}–${rule.max_age}` : `${rule.min_age}+`
                            return (
                              <button type="button" key={rule.id}
                                onClick={() => { const next = new Set(ageGroupsForm); active ? next.delete(rule.id) : next.add(rule.id); setAgeGroupsForm(next) }}
                                className={['flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all', active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'].join(' ')}
                              >
                                <span>{rule.age_group}</span>
                                <span className={['text-xs', active ? 'text-blue-200' : 'text-slate-400'].join(' ')}>{rangeLabel}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 justify-end">
                    <button onClick={saveAgeGroups} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg">Save</button>
                    <button onClick={() => setEditingAgeGroups(false)} className="px-3 py-1.5 text-sm bg-slate-200 rounded-lg">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {competition.age_groups.length > 0 ? (
                    competition.age_groups.map((ag) => (
                      <span key={ag} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-xl">
                        {agLabels[ag] ?? ag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">{t.none}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fees Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t.feesTitle}</h3>
              {!editingFees && (
                <button onClick={() => setEditingFees(true)} className="text-slate-400 hover:text-blue-600">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                </button>
              )}
            </div>
            <div className="p-4">
              {editingFees ? (
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={feeTypeForm === 'team'} onChange={() => setFeeTypeForm('team')} className="w-4 h-4" />
                      <span className="text-sm font-medium text-slate-700">{t.feePerTeam}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={feeTypeForm === 'gymnast'} onChange={() => setFeeTypeForm('gymnast')} className="w-4 h-4" />
                      <span className="text-sm font-medium text-slate-700">{t.feePerGymnast}</span>
                    </label>
                  </div>
                  <div>
                    <input type="number" min="0" step="0.01" value={feeAmountForm ?? ''} onChange={(e) => setFeeAmountForm(e.target.value ? parseFloat(e.target.value) : null)} placeholder="Amount (€)" className={inputCls} />
                  </div>
                  <div>
                    <input type="number" min="0" step="0.01" value={judgeFineForm ?? ''} onChange={(e) => setJudgeFineForm(e.target.value ? parseFloat(e.target.value) : null)} placeholder="Missing judge fine (€)" className={inputCls} />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button onClick={saveFees} className="px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">Save</button>
                    <button onClick={() => setEditingFees(false)} className="px-3 py-1.5 text-sm font-medium bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {competition.fee_per_team && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">{t.feePerTeam}</span>
                      <span className="text-base font-bold text-slate-800">€{competition.fee_per_team}</span>
                    </div>
                  )}
                  {competition.fee_per_gymnast && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">{t.feePerGymnast}</span>
                      <span className="text-base font-bold text-slate-800">€{competition.fee_per_gymnast}</span>
                    </div>
                  )}
                  {competition.judge_missing_fine && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="text-sm text-slate-600">{t.judgeMissingFine}</span>
                      <span className="text-base font-bold text-red-700">€{competition.judge_missing_fine}</span>
                    </div>
                  )}
                  {!competition.fee_per_team && !competition.fee_per_gymnast && !competition.judge_missing_fine && (
                    <span className="text-sm text-slate-400">{t.none}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Deadlines Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Deadlines</h3>
              {!editingDeadlines && (
                <button onClick={() => setEditingDeadlines(true)} className="text-slate-400 hover:text-blue-600">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                </button>
              )}
            </div>
            <div className="p-4">
              {editingDeadlines ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">{t.provisionalEntryDeadline}</label>
                    <input type="date" value={provisionalDeadlineForm} onChange={(e) => setProvisionalDeadlineForm(e.target.value)} className={dateCls} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">{t.definitiveEntryDeadline}</label>
                    <input type="date" value={definitiveDeadlineForm} onChange={(e) => setDefinitiveDeadlineForm(e.target.value)} className={dateCls} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">{t.registrationDeadline}</label>
                    <input type="date" value={registrationDeadlineForm} onChange={(e) => setRegistrationDeadlineForm(e.target.value)} className={dateCls} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">{t.tsMusicDeadline}</label>
                    <input type="date" value={tsMusicDeadlineForm} onChange={(e) => setTsMusicDeadlineForm(e.target.value)} className={dateCls} />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button onClick={saveDeadlines} className="px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">Save</button>
                    <button onClick={() => setEditingDeadlines(false)} className="px-3 py-1.5 text-sm font-medium bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {competition.provisional_entry_deadline && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">{t.provisionalEntryDeadline}</span>
                      <span className="text-sm font-medium text-slate-800">{fmt(competition.provisional_entry_deadline)}</span>
                    </div>
                  )}
                  {competition.definitive_entry_deadline && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">{t.definitiveEntryDeadline}</span>
                      <span className="text-sm font-medium text-slate-800">{fmt(competition.definitive_entry_deadline)}</span>
                    </div>
                  )}
                  {competition.registration_deadline && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">{t.registrationDeadline}</span>
                      <span className="text-sm font-medium text-slate-800">{fmt(competition.registration_deadline)}</span>
                    </div>
                  )}
                  {competition.ts_music_deadline && (
                    <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-1">
                      <span className="text-sm text-slate-600">{t.tsMusicDeadline}</span>
                      <span className="text-sm font-semibold text-amber-700">{fmt(competition.ts_music_deadline)}</span>
                    </div>
                  )}
                  {!competition.provisional_entry_deadline && !competition.definitive_entry_deadline && !competition.registration_deadline && !competition.ts_music_deadline && (
                    <span className="text-sm text-slate-400">{t.none}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Panels Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t.panels}</h3>
            </div>
            <div className="p-4">
              <div className="flex gap-3">
                {([1, 2] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => handlePanelCountChange(n)}
                    className={[
                      'flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                      panelCount === n
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                    ].join(' ')}
                  >
                    {t.panelN(n)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <input ref={posterInputRef} type="file" accept="image/*" className="hidden" onChange={handlePosterFile} />
    </div>
  )
}
