'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDateRange } from '@/lib/formatDate'
import { STATUS_BADGE } from '@/lib/uiConstants'
import type { Lang } from '@/components/scoring/types'
import type { Competition, Panel, Section, Session, Judge, SectionPanelJudge, Role, Team, Club, CompetitionEntry, SessionOrder, CompetitionStatus, AdminUser, AgeGroupRule, CompetitionJudgeNomination, Gymnast, Coach, TimelineEntry, ProvisionalEntry, DefinitiveEntry, RankingMergeGroup } from '@/components/admin/types'
import { NEXT_STATUS, PREV_STATUS, ageGroupLabel } from '@/components/admin/types'
import type { Apparatus, ApparatusRule } from '@/components/admin/types'
import StructureTab from './StructureTab'
import JudgesTab, { type JudgesTabProps, type PanelLock } from './JudgesTab'
import RegistrationsTab, { type RegistrationsTabProps } from './RegistrationsTab'
import StartingOrderTab from './StartingOrderTab'
import CompetitionDayTab from './CompetitionDayTab'
import LicenciasTab from './LicenciasTab'
import TVTab from './TVTab'
import TshirtTab from './TshirtTab'
import AccreditationsTab from './AccreditationsTab'
import OpenCombinadosTab from './OpenCombinadosTab'
import { isOpenCombinadosCompetitionName } from '@/lib/openCombinadosCompetition'
import RGRegistrationsTab from './RGRegistrationsTab'
import { useT } from '@/lib/useT'

const ACTION_STYLE: Partial<Record<CompetitionStatus, string>> = {
  draft:                'border-violet-200 text-violet-700 hover:bg-violet-50',
  provisional_entry:    'border-orange-200 text-orange-700 hover:bg-orange-50',
  definitive_entry:     'border-green-200 text-green-700 hover:bg-green-50',
  registration_open:    'border-amber-200 text-amber-700 hover:bg-amber-50',
  registration_closed:  'border-indigo-200 text-indigo-700 hover:bg-indigo-50',
  published:            'border-blue-200 text-blue-700 hover:bg-blue-50',
  active:               'border-red-200 text-red-600 hover:bg-red-50',
}

type Tab = 'structure' | 'judges' | 'startingOrder' | 'registrations' | 'overview' | 'day' | 'licencias' | 'tv' | 'bracket' | 'tshirt' | 'acreditaciones'


// ─── placeholder tab ──────────────────────────────────────────────────────────

function PlaceholderTab({ lang }: { lang: Lang }) {
  const t = useT('CompetitionDetail', lang)
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

type OverviewUpdate = {
  name: string
  location: string | null
  start_date: string | null
  end_date: string | null
  registration_deadline: string | null
  ts_music_deadline: string | null
  provisional_entry_deadline: string | null
  definitive_entry_deadline: string | null
  poster_url: string | null
  logo_url: string | null
  admin: AdminUser | null
  age_groups: string[]
  fee_per_team: number | null
  fee_per_gymnast: number | null
  judge_missing_fine: number | null
}

function OverviewTab({ competition, lang, availableAdmins, ageGroupRules, panels, sessions, gymnastCount, coachCount, judgeCount, onUpdate, onSetPanelCount, onUploadPoster, onUploadLogo }: {
  competition: Competition
  lang: Lang
  availableAdmins: AdminUser[]
  ageGroupRules: AgeGroupRule[]
  panels: Panel[]
  sessions: Session[]
  gymnastCount: number
  coachCount: number
  judgeCount: number
  onUpdate: (updates: OverviewUpdate) => void
  onSetPanelCount: (count: 1 | 2) => void
  onUploadPoster: (file: File) => Promise<void>
  onUploadLogo: (file: File) => Promise<void>
}) {
  const t = useT('CompetitionDetail', lang)
  const filteredAGs = ageGroupRules.filter(r => r.sport_type === competition.sport_type)
  const agLabels = Object.fromEntries(ageGroupRules.map(r => [r.id, ageGroupLabel(r, true)]))
  const [uploadBusy, setUploadBusy] = useState<null | 'poster' | 'logo'>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const posterInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  
  // Individual edit states for each card
  const [editingName, setEditingName] = useState(false)
  const [editingLocation, setEditingLocation] = useState(false)
  const [editingDates, setEditingDates] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(false)
  const [editingAgeGroups, setEditingAgeGroups] = useState(false)
  const [editingFees, setEditingFees] = useState(false)
  const [editingDeadlines, setEditingDeadlines] = useState(false)
  
  // Form values for each section
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
  
  // Deadlines form
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
    setUploadBusy('poster')
    setUploadError(null)
    try {
      await onUploadPoster(file)
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadBusy(null)
      if (posterInputRef.current) posterInputRef.current.value = ''
    }
  }

  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadBusy('logo')
    setUploadError(null)
    try {
      await onUploadLogo(file)
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadBusy(null)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  // Save functions for each section
  async function saveName() {
    if (nameForm === competition.name) {
      setEditingName(false)
      return
    }
    await onUpdate({
      ...competition,
      name: nameForm,
      location: competition.location,
      start_date: competition.start_date,
      end_date: competition.end_date,
      registration_deadline: competition.registration_deadline,
      ts_music_deadline: competition.ts_music_deadline,
      provisional_entry_deadline: competition.provisional_entry_deadline,
      definitive_entry_deadline: competition.definitive_entry_deadline,
      poster_url: competition.poster_url,
      logo_url: competition.logo_url,
      admin: competition.admin,
      age_groups: competition.age_groups,
      fee_per_team: competition.fee_per_team,
      fee_per_gymnast: competition.fee_per_gymnast,
      judge_missing_fine: competition.judge_missing_fine,
    })
    setEditingName(false)
  }

  async function saveLocation() {
    if (locationForm === (competition.location ?? '')) {
      setEditingLocation(false)
      return
    }
    await onUpdate({
      ...competition,
      name: competition.name,
      location: locationForm || null,
      start_date: competition.start_date,
      end_date: competition.end_date,
      registration_deadline: competition.registration_deadline,
      ts_music_deadline: competition.ts_music_deadline,
      provisional_entry_deadline: competition.provisional_entry_deadline,
      definitive_entry_deadline: competition.definitive_entry_deadline,
      poster_url: competition.poster_url,
      logo_url: competition.logo_url,
      admin: competition.admin,
      age_groups: competition.age_groups,
      fee_per_team: competition.fee_per_team,
      fee_per_gymnast: competition.fee_per_gymnast,
      judge_missing_fine: competition.judge_missing_fine,
    })
    setEditingLocation(false)
  }

  async function saveDates() {
    await onUpdate({
      ...competition,
      name: competition.name,
      location: competition.location,
      start_date: startDateForm || null,
      end_date: endDateForm || null,
      registration_deadline: competition.registration_deadline,
      ts_music_deadline: competition.ts_music_deadline,
      provisional_entry_deadline: competition.provisional_entry_deadline,
      definitive_entry_deadline: competition.definitive_entry_deadline,
      poster_url: competition.poster_url,
      logo_url: competition.logo_url,
      admin: competition.admin,
      age_groups: competition.age_groups,
      fee_per_team: competition.fee_per_team,
      fee_per_gymnast: competition.fee_per_gymnast,
      judge_missing_fine: competition.judge_missing_fine,
    })
    setEditingDates(false)
  }

  async function saveAdmin() {
    const admin = availableAdmins.find((u) => u.id === adminIdForm) ?? null
    await onUpdate({
      ...competition,
      name: competition.name,
      location: competition.location,
      start_date: competition.start_date,
      end_date: competition.end_date,
      registration_deadline: competition.registration_deadline,
      ts_music_deadline: competition.ts_music_deadline,
      provisional_entry_deadline: competition.provisional_entry_deadline,
      definitive_entry_deadline: competition.definitive_entry_deadline,
      poster_url: competition.poster_url,
      logo_url: competition.logo_url,
      admin,
      age_groups: competition.age_groups,
      fee_per_team: competition.fee_per_team,
      fee_per_gymnast: competition.fee_per_gymnast,
      judge_missing_fine: competition.judge_missing_fine,
    })
    setEditingAdmin(false)
  }

  async function saveAgeGroups() {
    await onUpdate({
      ...competition,
      name: competition.name,
      location: competition.location,
      start_date: competition.start_date,
      end_date: competition.end_date,
      registration_deadline: competition.registration_deadline,
      ts_music_deadline: competition.ts_music_deadline,
      provisional_entry_deadline: competition.provisional_entry_deadline,
      definitive_entry_deadline: competition.definitive_entry_deadline,
      poster_url: competition.poster_url,
      logo_url: competition.logo_url,
      admin: competition.admin,
      age_groups: [...ageGroupsForm],
      fee_per_team: competition.fee_per_team,
      fee_per_gymnast: competition.fee_per_gymnast,
      judge_missing_fine: competition.judge_missing_fine,
    })
    setEditingAgeGroups(false)
  }

  async function saveFees() {
    const fee_per_team = feeTypeForm === 'team' ? feeAmountForm : null
    const fee_per_gymnast = feeTypeForm === 'gymnast' ? feeAmountForm : null
    await onUpdate({
      ...competition,
      name: competition.name,
      location: competition.location,
      start_date: competition.start_date,
      end_date: competition.end_date,
      registration_deadline: competition.registration_deadline,
      ts_music_deadline: competition.ts_music_deadline,
      provisional_entry_deadline: competition.provisional_entry_deadline,
      definitive_entry_deadline: competition.definitive_entry_deadline,
      poster_url: competition.poster_url,
      logo_url: competition.logo_url,
      admin: competition.admin,
      age_groups: competition.age_groups,
      fee_per_team,
      fee_per_gymnast,
      judge_missing_fine: judgeFineForm,
    })
    setEditingFees(false)
  }

  async function saveDeadlines() {
    await onUpdate({
      ...competition,
      name: competition.name,
      location: competition.location,
      start_date: competition.start_date,
      end_date: competition.end_date,
      registration_deadline: registrationDeadlineForm || null,
      ts_music_deadline: tsMusicDeadlineForm || null,
      provisional_entry_deadline: provisionalDeadlineForm || null,
      definitive_entry_deadline: definitiveDeadlineForm || null,
      poster_url: competition.poster_url,
      logo_url: competition.logo_url,
      admin: competition.admin,
      age_groups: competition.age_groups,
      fee_per_team: competition.fee_per_team,
      fee_per_gymnast: competition.fee_per_gymnast,
      judge_missing_fine: competition.judge_missing_fine,
    })
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
                  <input
                    type="text"
                    value={nameForm}
                    onChange={(e) => setNameForm(e.target.value)}
                    className={inputCls}
                    autoFocus
                  />
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
                  <input
                    type="text"
                    value={locationForm}
                    onChange={(e) => setLocationForm(e.target.value)}
                    placeholder="Location"
                    className={inputCls}
                  />
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
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

      {/* Participant stats */}
      <div className="flex gap-3 mb-6">
        {[
          { label: 'Gimnastas', value: gymnastCount, color: 'text-blue-700 bg-blue-50 border-blue-100' },
          { label: 'Entrenadores', value: coachCount, color: 'text-violet-700 bg-violet-50 border-violet-100' },
          { label: 'Jueces', value: judgeCount, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`flex-1 rounded-xl border px-4 py-3 text-center ${color}`}>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-70">{label}</p>
          </div>
        ))}
      </div>

      {/* Two-column layout: Poster + Logo + Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4 md:sticky md:top-6 md:self-start">
        {/* Poster — marketing / home / TV */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-3 pt-3">{t.poster}</p>
          <div className="aspect-[3/4] bg-slate-100 flex items-center justify-center mt-2">
            {competition.poster_url ? (
              <img src={competition.poster_url} alt="poster" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            )}
          </div>
          <div className="p-3 text-center border-t border-slate-200">
            <button type="button" disabled={uploadBusy !== null} onClick={() => posterInputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-all w-full">
              {uploadBusy === 'poster' ? t.posterUploading : (competition.poster_url ? t.posterReplace : t.posterUpload)}
            </button>
          </div>
        </div>
        {/* Logo — printed results */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-3 pt-3">{t.logoTitle}</p>
          <p className="text-[11px] text-slate-400 px-3 mt-1 leading-snug">{t.logoHint}</p>
          <div className="aspect-square max-h-44 mx-auto mt-2 mb-1 bg-slate-100 flex items-center justify-center">
            {competition.logo_url ? (
              <img src={competition.logo_url} alt="" className="max-w-full max-h-full object-contain p-2" />
            ) : (
              <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            )}
          </div>
          <div className="p-3 text-center border-t border-slate-200">
            <button type="button" disabled={uploadBusy !== null} onClick={() => logoInputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-all w-full">
              {uploadBusy === 'logo' ? t.logoUploading : (competition.logo_url ? t.logoReplace : t.logoUpload)}
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
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {filteredAGs.map((rule) => {
                      const active = ageGroupsForm.has(rule.id)
                      return (
                        <button type="button" key={rule.id}
                          onClick={() => {
                            const next = new Set(ageGroupsForm)
                            active ? next.delete(rule.id) : next.add(rule.id)
                            setAgeGroupsForm(next)
                          }}
                          className={['px-3 py-1.5 rounded-xl border text-sm font-medium transition-all', active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'].join(' ')}
                        >
                          {ageGroupLabel(rule, true)}
                        </button>
                      )
                    })}
                  </div>
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
                  {!competition.provisional_entry_deadline && 
                  !competition.definitive_entry_deadline && 
                  !competition.registration_deadline && 
                  !competition.ts_music_deadline && (
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
      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
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
  onRevertStatus: () => void
  onSetPanelCount: (count: 1 | 2) => void
  onAddSection: () => void
  onUpdateSectionLabel: (sectionId: string, label: string) => void
  onUpdateSectionTimes: (sectionId: string, times: { starting_time: string | null; waiting_time_seconds: number | null; warmup_duration_minutes: number | null }) => void
  onDeleteSection: (sectionId: string) => void
  onAddSession: (s: Omit<Session, 'id'>) => void
  onDeleteSession: (sessionId: string) => void
  onReorderSessions: (ids: string[]) => void
  rankingMergeGroups: RankingMergeGroup[]
  sessionEligibleTeamCounts: Record<string, number>
  onAssignSessionMergeGroup: (sessionId: string, mergeGroupId: string | null) => void | Promise<void>
  onCreateRankingMergeGroup: (labelEs: string, labelEn: string) => Promise<string | null>
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
  onCopyPanel: (fromSectionId: string, panelId: string) => Promise<void>
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
  onUploadLogo: (file: File) => Promise<void>
  onUpdateFees: (fees: { fee_per_team: number | null; fee_per_gymnast: number | null; judge_missing_fine: number | null }) => void
  // dj review
  onSetDJReviewDeadline: (date: string | null) => void
  // tshirt
  onUpdateTshirtConfig: (sizes: string[], deadline: string | null) => Promise<void>
  // accreditations
  onUpdateAccreditationConfig: (config: import('@/components/admin/types').AccreditationConfig) => Promise<void>
  // competition day
  onStartSession: (sessionId: string) => void
  onFinishSession: (sessionId: string) => void
  onRevertSession: (sessionId: string) => void
  // licencias
  competitionGymnasts: Gymnast[]
  competitionCoaches: Coach[]
  globalCoaches: Coach[]
}

export default function CompetitionDetail({
  lang, competition, panels, sections, sessions, onBack, onAdvanceStatus, onRevertStatus,
  onSetPanelCount, onAddSection, onUpdateSectionLabel, onUpdateSectionTimes,
  onDeleteSection, onAddSession, onDeleteSession, onReorderSessions,
  rankingMergeGroups, sessionEligibleTeamCounts, onAssignSessionMergeGroup, onCreateRankingMergeGroup,
  globalJudges, judgePool, nominations, assignments,
  panelLocks, onAddToPool, onRemoveFromPool, onAssignJudge, onAddSlot, onRemoveSlot,
  onTogglePanelLock, onCopyPanel, onCreateJudge,
  globalTeams, clubs, entries, provisionalEntries, definitiveEntries, onToggleDropout, onRemoveClubEntries, sessionOrders, lockedSessions, onReorder, onToggleLock, onReorderTimeline,
  availableAdmins, ageGroupRules, apparatus, apparatusRules, onUpdateCompetition, onUploadPoster, onUploadLogo, onUpdateFees,
  onSetDJReviewDeadline, onStartSession, onFinishSession, onRevertSession,
  competitionGymnasts, competitionCoaches, globalCoaches,
  onUpdateTshirtConfig, onUpdateAccreditationConfig,
}: CompetitionDetailProps) {
  const t = useT('CompetitionDetail', lang)
  const [activeTab, setActiveTab] = useState<Tab>('structure')
  const openCombinadosEnabled =
    isOpenCombinadosCompetitionName(competition.name) || Boolean(competition.open_combinados_enabled)

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
    ...(openCombinadosEnabled ? [{ key: 'bracket' as const, label: t.tabs.bracket }] : []),
    { key: 'tshirt' as const, label: t.tabs.tshirt },
    { key: 'acreditaciones' as const, label: t.tabs.acreditaciones },
    { key: 'overview',      label: t.tabs.overview      },
  ]

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
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
              <>
                <a href={`/results/${competition.id}`} target="_blank" rel="noopener noreferrer"
                  title="Results (public)"
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5m-9 4.5v-4.5m0 0A2.25 2.25 0 019.75 12h4.5A2.25 2.25 0 0116.5 14.25m-9 0V12a4.5 4.5 0 119 0v2.25" />
                  </svg>
                </a>
                <a href={`/results/${competition.id}?official=1`} target="_blank" rel="noopener noreferrer"
                  title={t.officialResultsPrint}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </a>
              </>
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
            {PREV_STATUS[competition.status] && (
              <button
                onClick={() => {
                  const confirmMsg = t.confirmBackAction[competition.status]
                  if (confirmMsg && !confirm(confirmMsg)) return
                  onRevertStatus()
                }}
                className="px-3 py-1 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              >
                {t.actionBack[competition.status]}
              </button>
            )}
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
          rankingMergeGroups={rankingMergeGroups}
          sessionEligibleTeamCounts={sessionEligibleTeamCounts}
          openCombinadosEnabled={openCombinadosEnabled}
          onAddSection={onAddSection}
          onUpdateSectionLabel={onUpdateSectionLabel}
          onUpdateSectionTimes={onUpdateSectionTimes}
          onDeleteSection={onDeleteSection}
          onAddSession={onAddSession}
          onDeleteSession={onDeleteSession}
          onReorderSessions={onReorderSessions}
          onAssignSessionMergeGroup={onAssignSessionMergeGroup}
          onCreateRankingMergeGroup={onCreateRankingMergeGroup}
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
          gymnastCount={competitionGymnasts.length}
          coachCount={competitionCoaches.length}
          judgeCount={judgePool.length}
          onUpdate={onUpdateCompetition}
          onUploadPoster={onUploadPoster}
          onUploadLogo={onUploadLogo}
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
          onCopyPanel={onCopyPanel}
          onCreateJudge={onCreateJudge}
        />
      )}
      {activeTab === 'startingOrder' && (
        <StartingOrderTab
          lang={lang}
          competitionId={competition.id}
          competitionName={competition.name}
          globalTeams={globalTeams}
          clubs={clubs}
          entries={entries}
          sections={sections}
          panels={panels}
          sessions={sessions}
          sessionOrders={sessionOrders}
          lockedSessions={lockedSessions}
          agLabels={Object.fromEntries(ageGroupRules.map(r => [r.id, ageGroupLabel(r)]))}
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
          agLabels={Object.fromEntries(ageGroupRules.map(r => [r.id, ageGroupLabel(r, true)]))}
          onToggleDropout={onToggleDropout}
          onRemoveClubEntries={onRemoveClubEntries}
          competitionId={competition.id}
          competitionName={competition.name}
          competitionLogoUrl={competition.logo_url}
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
          competitionName={competition.name}
          competitionLogoUrl={competition.logo_url}
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
          onRevertSession={onRevertSession}
        />
      )}
      {activeTab === 'tv' && (
        <TVTab
          lang={lang}
          competition={competition}
          sections={sections}
          panels={panels}
          sessions={sessions}
          sessionOrders={sessionOrders}
          globalTeams={globalTeams}
          clubs={clubs}
          entries={entries}
          agLabels={Object.fromEntries(ageGroupRules.map(r => [r.id, ageGroupLabel(r, true)]))}
        />
      )}
      {activeTab === 'bracket' && openCombinadosEnabled && (
        <OpenCombinadosTab
          lang={lang}
          competitionId={competition.id}
          sessions={sessions}
          sessionOrders={sessionOrders}
          teams={globalTeams}
          entries={entries}
          ageGroupRules={ageGroupRules}
          panels={panels}
          sections={sections}
        />
      )}
      {activeTab === 'tshirt' && (
        <TshirtTab
          competitionId={competition.id}
          sizes={competition.tshirt_sizes ?? []}
          deadline={competition.tshirt_deadline ?? null}
          onUpdateConfig={onUpdateTshirtConfig}
        />
      )}
      {activeTab === 'acreditaciones' && (
        <AccreditationsTab
          lang={lang}
          competition={competition}
          competitionGymnasts={competitionGymnasts}
          competitionCoaches={competitionCoaches}
          globalJudges={globalJudges}
          judgePool={judgePool}
          nominations={nominations}
          clubs={clubs}
          onUpdateConfig={onUpdateAccreditationConfig}
        />
      )}
    </div>
  )
}
