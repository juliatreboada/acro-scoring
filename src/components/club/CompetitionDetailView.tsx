'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { Competition, Team, Gymnast, CompetitionEntry, RoutineMusic, Judge, CompetitionJudgeNomination, AgeGroupRule, Coach, CompetitionCoach, RGRegistration, Apparatus } from '@/components/admin/types'
import { ROUTINE_TYPES } from '@/components/admin/types'
import { ApparatusRow } from './ApparatusRow'
import { formatDateRange } from '@/lib/formatDate'
import { RoutineRow } from './RoutineRow'
import { InviteJudgeForm } from './shared/InviteJudgeForm'
import type { InviteForm } from './shared/InviteJudgeForm'
import { useT } from '@/lib/useT'

const STATUS_BADGE: Record<string, string> = {
  draft:               'bg-slate-100 text-slate-500',
  provisional_entry:   'bg-violet-100 text-violet-700',
  definitive_entry:    'bg-orange-100 text-orange-700',
  registration_open:   'bg-green-100 text-green-700',
  registration_closed: 'bg-amber-100 text-amber-700',
  published:           'bg-indigo-100 text-indigo-700',
  active:              'bg-blue-600 text-white',
  finished:            'bg-slate-100 text-slate-400',
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function getAgeInYear(dob: string, year: number): number {
  return year - new Date(dob + 'T00:00:00').getFullYear()
}

function validateTeamAges(
  team: Team,
  gymnasts: Gymnast[],
  ageGroupRules: AgeGroupRule[],
  competitionYear: number,
): string[] {
  const rule = ageGroupRules.find(r => r.id === team.age_group)
  if (!rule) return []
  const errors: string[] = []
  for (const gid of team.gymnast_ids ?? []) {
    const g = gymnasts.find(x => x.id === gid)
    if (!g?.date_of_birth) continue
    const age = getAgeInYear(g.date_of_birth, competitionYear)
    if (age < rule.min_age || (rule.max_age !== null && age > rule.max_age)) {
      const name = [g.first_name, g.last_name_1].filter(Boolean).join(' ')
      errors.push(`${name} (${age}): debe tener entre ${rule.min_age} y ${rule.max_age ?? '∞'} años`)
    }
  }
  return errors
}

export function routineTypesForTeam(team: Team, ageGroupRules: AgeGroupRule[]): (typeof ROUTINE_TYPES[number])[] {
  const rule = ageGroupRules.find(r => r.id === team.age_group)
  const count = rule?.routine_count ?? 3
  if (count === 1) return ['Combined']
  if (count === 2) return ['Balance', 'Dynamic']
  return ['Balance', 'Dynamic', 'Combined']
}

export function CompetitionDetailView({
  lang, clubId, competition, teams, gymnasts, coaches, competitionCoaches, entries, music, judges, nominations, agLabels, ageGroupRules,
  tsReviewStatuses, definitiveEntryQuota, onBack,
  onRegister, onDropout, onSetFile, onNominate, onRemoveNomination, onInviteJudge,
  onRegisterCoach, onUnregisterCoach,
  rgRegistrations, apparatus, onRGRegister, onRGUploadPaymentDoc, onSetRGMusic,
}: {
  lang: Lang
  clubId: string
  competition: Competition
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
  definitiveEntryQuota: Record<string, number> | null
  onBack: () => void
  onRegister: (teamId: string) => void
  onDropout: (entryId: string) => void
  onSetFile: (teamId: string, routineType: 'Balance' | 'Dynamic' | 'Combined', field: 'music' | 'ts', file: File | null) => void
  onNominate: (judgeId: string) => void
  onRemoveNomination: (nominationId: string) => void
  onInviteJudge: (f: { full_name: string; email: string; phone?: string; licence?: string; sport_type: string }) => Promise<void>
  onRegisterCoach: (coachId: string) => void
  onUnregisterCoach: (coachId: string) => void
  // RG-specific (optional — only used when competition.sport_type === 'rg')
  rgRegistrations?: RGRegistration[]
  apparatus?: Apparatus[]
  onRGRegister?: (teamId: string) => void
  onRGUploadPaymentDoc?: (regId: string, file: File) => void
  onSetRGMusic?: (teamId: string, routineType: RoutineMusic['routine_type'], file: File | null) => void
}) {
  const t = useT('CompetitionDetailView', lang)
  const isOpen = competition.status === 'registration_open'
  const dateStr = formatDateRange(competition.start_date, competition.end_date)
  const today = new Date().toISOString().slice(0, 10)
  const isFileEditLocked = !!competition.ts_music_deadline && today > competition.ts_music_deadline
  const competitionYear = competition.start_date
    ? new Date(competition.start_date + 'T00:00:00').getFullYear()
    : new Date().getFullYear()
  const [ageError, setAgeError] = useState<{ teamId: string; messages: string[] } | null>(null)

  const [allowed, setAllowed] = useState<boolean | null>(isOpen ? null : true)
  useEffect(() => {
    if (!isOpen) return
    const supabase = createClient()
    supabase
      .from('competition_allowed_clubs')
      .select('id')
      .eq('competition_id', competition.id)
      .eq('club_id', clubId)
      .maybeSingle()
      .then(({ data }) => setAllowed(!!data))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isRG = competition.sport_type === 'rg'
  const hasFee = !!(competition.fee_per_team || competition.fee_per_gymnast)

  const eligibleTeams = teams.filter((team) => {
    const ageMatch = competition.age_groups.some(agId =>
      agId === team.age_group ||
      (agLabels[agId] && agLabels[agId] === team.age_group)
    )
    if (isRG) return team.sport_type === 'rg' && ageMatch
    return team.sport_type !== 'rg' && ageMatch
  })

  const compNominations = nominations.filter((n) => n.competition_id === competition.id)
  const nominatedIds = new Set(compNominations.map((n) => n.judge_id))
  const hasJudgeWarning = compNominations.length === 0 && isOpen
  const [judgesOpen, setJudgesOpen] = useState(hasJudgeWarning)

  const registeredCoachIds = new Set(
    competitionCoaches.filter(cc => cc.competition_id === competition.id).map(cc => cc.coach_id)
  )
  const registeredCoaches = coaches.filter(c => registeredCoachIds.has(c.id))
  const unregisteredCoaches = coaches.filter(c => !registeredCoachIds.has(c.id))
  const [coachesOpen, setCoachesOpen] = useState(false)
  const [showPoolPicker, setShowPoolPicker] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [poolSearch, setPoolSearch] = useState('')

  const nominatedJudges = judges.filter(j => nominatedIds.has(j.id))
  const availableForNomination = judges.filter(j => !nominatedIds.has(j.id))
  const filteredPool = availableForNomination.filter(j =>
    !poolSearch.trim() ||
    j.full_name.toLowerCase().includes(poolSearch.trim().toLowerCase())
  )

  function entryFor(teamId: string) {
    return entries.find((e) => e.competition_id === competition.id && e.team_id === teamId)
  }
  function recordFor(teamId: string, routineType: 'Balance' | 'Dynamic' | 'Combined') {
    return music.find((m) => m.team_id === teamId && m.competition_id === competition.id && m.routine_type === routineType)
  }
  function reviewFor(teamId: string, routineType: 'Balance' | 'Dynamic' | 'Combined') {
    return tsReviewStatuses.find(
      s => s.team_id === teamId && s.competition_id === competition.id && s.routine_type === routineType
    )
  }
  function getQuotaInfo(team: Team): { limit: number; used: number } | null {
    if (!definitiveEntryQuota) return null
    const key = `${team.age_group}|${team.category}`
    const limit = definitiveEntryQuota[key] ?? 0
    const used = eligibleTeams.filter(t =>
      t.age_group === team.age_group && t.category === team.category
    ).filter(t => {
      const e = entryFor(t.id)
      return e && !e.dropped_out
    }).length
    return { limit, used }
  }

  return (
    <div>
      {/* back */}
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        {t.back}
      </button>

      {/* competition header */}
      <div className="bg-white border border-slate-200 rounded-2xl mb-5 overflow-hidden">
        <div className="flex items-start gap-3 px-5 py-4">
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-slate-800">{competition.name}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
              {competition.location && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  {competition.location}
                </span>
              )}
              {dateStr && <span className="text-xs text-slate-400">{dateStr}</span>}
              {competition.registration_deadline && (
                <span className="text-xs font-medium text-amber-600">
                  {t.deadline}: {formatDate(competition.registration_deadline)}
                </span>
              )}
              {competition.ts_music_deadline && (
                <span className={['text-xs font-medium', isFileEditLocked ? 'text-red-500' : 'text-amber-600'].join(' ')}>
                  {t.tsMusicDeadline}: {formatDate(competition.ts_music_deadline)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {competition.age_groups.map((ag) => (
                <span key={ag} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">{agLabels[ag] ?? ag}</span>
              ))}
            </div>
          </div>
          <span className={['px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1', STATUS_BADGE[competition.status]].join(' ')}>
            {competition.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            {t.status[competition.status]}
          </span>
        </div>

        {/* ── coaches section ── */}
        <button onClick={() => setCoachesOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-2.5 border-t border-slate-100 bg-slate-50 hover:bg-slate-100 text-left transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t.coachesTitle}</span>
            {registeredCoaches.length > 0 && (
              <span className="text-xs font-semibold px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full">{registeredCoaches.length}</span>
            )}
          </div>
          <svg className={['w-4 h-4 text-slate-300 transition-transform', coachesOpen ? 'rotate-180' : ''].join(' ')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {coachesOpen && (
          <div className="px-5 py-4 border-t border-slate-100 space-y-2">
            {coaches.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-2">{t.noCoachesInClub}</p>
            ) : (
              <>
                {registeredCoaches.map(c => (
                  <div key={c.id} className="flex items-center gap-3 py-1.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-400">
                      {c.photo_url ? <img src={c.photo_url} alt={c.full_name} className="w-full h-full object-cover" /> : c.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 font-medium truncate">{c.full_name}</p>
                      {c.licence && <p className="text-xs text-slate-400">{c.licence}</p>}
                    </div>
                    {isOpen && (
                      <button onClick={() => onUnregisterCoach(c.id)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shrink-0">
                        {t.unregisterCoach}
                      </button>
                    )}
                  </div>
                ))}
                {isOpen && unregisteredCoaches.map(c => (
                  <div key={c.id} className="flex items-center gap-3 py-1.5 opacity-50">
                    <div className="w-7 h-7 rounded-full bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-400">
                      {c.photo_url ? <img src={c.photo_url} alt={c.full_name} className="w-full h-full object-cover" /> : c.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 font-medium truncate">{c.full_name}</p>
                      {c.licence && <p className="text-xs text-slate-400">{c.licence}</p>}
                    </div>
                    <button onClick={() => onRegisterCoach(c.id)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all shrink-0">
                      {t.registerCoach}
                    </button>
                  </div>
                ))}
                {registeredCoaches.length === 0 && !isOpen && (
                  <p className="text-sm text-slate-400 text-center py-2">{t.noCoaches}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── judges section ── */}
        <button
          onClick={() => setJudgesOpen((o) => !o)}
          className={[
            'w-full flex items-center justify-between px-5 py-2.5 border-t text-left transition-colors',
            hasJudgeWarning ? 'border-amber-200 bg-amber-50 hover:bg-amber-100' : 'border-slate-100 bg-slate-50 hover:bg-slate-100',
          ].join(' ')}>
          <div className="flex items-center gap-2">
            <span className={['text-xs font-semibold uppercase tracking-widest', hasJudgeWarning ? 'text-amber-600' : 'text-slate-400'].join(' ')}>
              {t.judgesTitle}
            </span>
            {compNominations.length > 0 ? (
              <span className="text-xs font-semibold px-1.5 py-0.5 bg-green-100 text-green-600 rounded-full">
                {compNominations.length}
              </span>
            ) : hasJudgeWarning ? (
              <span className="text-xs font-semibold text-amber-600">⚠ {t.judgesWarning}</span>
            ) : null}
          </div>
          <svg className={['w-4 h-4 transition-transform', judgesOpen ? 'rotate-180' : '', hasJudgeWarning ? 'text-amber-400' : 'text-slate-300'].join(' ')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {judgesOpen && (
          <div className="px-5 py-4 border-t border-slate-100 space-y-3">
            {nominatedJudges.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-2">{t.noJudges}</p>
            ) : (
              <div className="space-y-2">
                {nominatedJudges.map((judge) => {
                  const nomination = compNominations.find((n) => n.judge_id === judge.id)
                  return (
                    <div key={judge.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 border bg-green-50 border-green-200">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-xs font-semibold text-slate-500">
                        {judge.full_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800">{judge.full_name}</p>
                          {judge.licence && (
                            <span className="text-xs font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{judge.licence}</span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-600 rounded-full">{t.nominated}</span>
                        {isOpen && nomination && (
                          <button onClick={() => onRemoveNomination(nomination.id)}
                            className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                            {t.removeNomination}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {isOpen && (
              <div className="space-y-2">
                {!showInviteForm && (
                  <button
                    onClick={() => { setShowPoolPicker(v => !v); setShowInviteForm(false) }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    {t.addFromPool}
                  </button>
                )}

                {showPoolPicker && !showInviteForm && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <input
                        type="text"
                        value={poolSearch}
                        onChange={e => setPoolSearch(e.target.value)}
                        placeholder={t.searchJudges}
                        className="w-full text-sm text-slate-700 bg-transparent outline-none placeholder:text-slate-300"
                      />
                    </div>
                    {filteredPool.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-slate-400 text-center">{t.noPoolJudges}</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                        {filteredPool.map(judge => (
                          <button key={judge.id}
                            onClick={() => { onNominate(judge.id); setShowPoolPicker(false); setPoolSearch('') }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-xs font-semibold text-slate-500">
                              {judge.full_name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-700 truncate">{judge.full_name}</p>
                              {judge.licence && <p className="text-xs text-slate-400">{judge.licence}</p>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!showPoolPicker && (
                  <button
                    onClick={() => { setShowInviteForm(v => !v); setShowPoolPicker(false) }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                    {t.inviteNew}
                  </button>
                )}

                {showInviteForm && (
                  <InviteJudgeForm
                    lang={lang}
                    onSend={async (f: InviteForm) => {
                      await onInviteJudge({ full_name: f.full_name, email: f.email, phone: f.phone || undefined, licence: f.licence || undefined, sport_type: f.sport_type })
                    }}
                    onCancel={() => setShowInviteForm(false)}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* teams */}
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{t.teamsTitle}</p>

      {isRG ? (
        /* ── RG teams section ──────────────────────────────────────────────── */
        eligibleTeams.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10 bg-white border border-slate-200 rounded-2xl">
            {teams.length === 0 ? t.noTeams : t.noEligibleTeams}
          </p>
        ) : (
          <div className="space-y-3">
            {eligibleTeams.map(team => {
              const reg        = rgRegistrations?.find(r => r.team_id === team.id && r.competition_id === competition.id)
              const teamApps   = (team.apparatus_ids ?? [])
                .map(id => apparatus?.find(a => a.id === id))
                .filter((a): a is Apparatus => !!a)
              const appLabel   = teamApps.map(a => lang === 'es' && a.name_es ? a.name_es : a.name).join(', ')

              return (
                <div key={team.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{team.gymnast_display}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {agLabels[team.age_group] ?? team.age_group}
                        {appLabel && <> · {appLabel}</>}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {!reg && isOpen && (
                        <button onClick={() => onRGRegister?.(team.id)}
                          className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                          {t.rgRegister}
                        </button>
                      )}
                      {!reg && !isOpen && (
                        <span className="text-xs text-slate-300">{t.registrationClosed}</span>
                      )}
                      {reg?.status === 'pending' && (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full">{t.rgPending}</span>
                      )}
                      {reg?.status === 'inscription_approved' && (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">{t.rgInscriptionApproved}</span>
                      )}
                      {reg?.status === 'payment_pending' && (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full">{t.rgPaymentPending}</span>
                      )}
                      {reg?.status === 'registered' && (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-700 rounded-full">{t.rgRegistered}</span>
                      )}
                    </div>
                  </div>

                  {/* payment doc upload — shown when inscription approved and fee required */}
                  {reg?.status === 'inscription_approved' && hasFee && (
                    <div className="px-4 pb-3 pt-0">
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-xl text-xs font-semibold text-orange-700 cursor-pointer hover:bg-orange-100 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        {t.rgUploadPayment}
                        <input type="file" accept=".pdf,application/pdf" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) onRGUploadPaymentDoc?.(reg.id, f) }} />
                      </label>
                    </div>
                  )}

                  {/* apparatus music rows — shown when registered */}
                  {reg?.status === 'registered' && teamApps.length > 0 && (
                    <div className="px-4 pb-4 pt-1">
                      {isFileEditLocked && (
                        <p className="text-xs font-medium text-red-500 mb-2 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                          {t.filesLocked}
                        </p>
                      )}
                      <div className="bg-slate-50 rounded-xl px-4 py-1">
                        {teamApps.map(app => {
                          const rt = app.name as RoutineMusic['routine_type']
                          const record = music.find(m => m.team_id === team.id && m.competition_id === competition.id && m.routine_type === rt)
                          return (
                            <ApparatusRow key={app.id} lang={lang} apparatus={app} record={record}
                              locked={isFileEditLocked}
                              onSet={file => onSetRGMusic?.(team.id, rt, file)} />
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* ── Acro teams section ────────────────────────────────────────────── */
        isOpen && allowed === null ? (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
          </div>
        ) : isOpen && allowed === false ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-6 text-center space-y-1">
            <p className="text-sm font-semibold text-amber-800">{t.notAllowedTitle}</p>
            <p className="text-xs text-amber-600">{t.notAllowedHint}</p>
          </div>
        ) : teams.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10 bg-white border border-slate-200 rounded-2xl">{t.noTeams}</p>
        ) : eligibleTeams.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10 bg-white border border-slate-200 rounded-2xl">{t.noEligibleTeams}</p>
        ) : (
          <div className="space-y-3">
            {eligibleTeams.map((team) => {
              const entry = entryFor(team.id)
              return (
                <div key={team.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {entry?.dorsal != null && (
                          <span className="text-xs font-bold px-2 py-0.5 bg-slate-800 text-white rounded-full">#{entry.dorsal}</span>
                        )}
                        <p className="text-sm font-semibold text-slate-800">{team.gymnast_display}</p>
                        {entry?.dropped_out && (
                          <span className="text-xs font-semibold px-2 py-0.5 bg-red-50 text-red-400 rounded-full">{t.dropout}</span>
                        )}
                      </div>
                      {(() => {
                        const qi = getQuotaInfo(team)
                        return (
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-slate-400">{team.category} · {agLabels[team.age_group] ?? team.age_group}</p>
                            {qi !== null && (
                              <span className={['text-xs font-semibold px-1.5 py-0.5 rounded-full tabular-nums',
                                qi.used >= qi.limit ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'].join(' ')}>
                                {t.quotaOf(qi.used, qi.limit)}
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                    <div className="shrink-0">
                      {entry ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-600 rounded-full">{t.registered}</span>
                          <button
                            onClick={() => onDropout(entry.id)}
                            className={['text-xs font-medium px-2.5 py-1 rounded-lg border transition-all',
                              entry.dropped_out
                                ? 'border-slate-200 text-slate-500 hover:bg-white'
                                : 'border-red-100 text-red-500 hover:bg-red-50'].join(' ')}>
                            {entry.dropped_out ? t.undoDropout : t.toggleDropout}
                          </button>
                        </div>
                      ) : isOpen ? (() => {
                        const qi = getQuotaInfo(team)
                        const atLimit = qi !== null && qi.used >= qi.limit
                        if (atLimit) {
                          return (
                            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-400 rounded-xl">
                              {qi!.limit === 0 ? t.notInEntry : t.quotaFull}
                            </span>
                          )
                        }
                        return (
                          <button onClick={() => {
                            const errs = validateTeamAges(team, gymnasts, ageGroupRules, competitionYear)
                            if (errs.length > 0) { setAgeError({ teamId: team.id, messages: errs }); return }
                            if (!competition.age_groups.some(ag => ag === team.age_group)) {
                              setAgeError({ teamId: team.id, messages: [lang === 'es' ? 'El grupo de edad de este equipo no está incluido en esta competición.' : 'This team\'s age group is not part of this competition.'] })
                              return
                            }
                            onRegister(team.id)
                          }}
                            className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                            {t.register}
                          </button>
                        )
                      })() : (
                        <span className="text-xs text-slate-300">{t.registrationClosed}</span>
                      )}
                    </div>
                  </div>

                  {entry && (
                    <div className="px-4 pb-4 pt-1">
                      {isFileEditLocked && (
                        <p className="text-xs font-medium text-red-500 mb-2 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                          {t.filesLocked}
                        </p>
                      )}
                      <div className="bg-slate-50 rounded-xl px-4 py-1">
                        {routineTypesForTeam(team, ageGroupRules).map((rt) => {
                          const review = reviewFor(team.id, rt)
                          return (
                            <RoutineRow key={rt} lang={lang} routineType={rt}
                              record={recordFor(team.id, rt)}
                              locked={isFileEditLocked}
                              reviewStatus={review?.status}
                              reviewComment={review?.final_comment}
                              onSet={(field, filename) => onSetFile(team.id, rt, field, filename)} />
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {ageError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-2">
                  {lang === 'es' ? 'No se puede inscribir este equipo' : 'Cannot register this team'}
                </p>
                <ul className="space-y-1">
                  {ageError.messages.map((m, i) => (
                    <li key={i} className="text-xs text-red-600">{m}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setAgeError(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
                {lang === 'es' ? 'Entendido' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
