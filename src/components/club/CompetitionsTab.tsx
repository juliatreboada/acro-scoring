'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { Competition, Team, Gymnast, CompetitionEntry, RoutineMusic, Judge, CompetitionJudgeNomination, AgeGroupRule, Coach, CompetitionCoach } from '@/components/admin/types'
import { ROUTINE_TYPES, categoriesForRuleset } from '@/components/admin/types'
import { formatDate, formatDateRange } from '@/lib/formatDate'
import { STATUS_BADGE, INPUT_CLS } from '@/lib/uiConstants'
import ProvisionalEntryForm from './ProvisionalEntryForm'
import DefinitiveEntryForm from './DefinitiveEntryForm'
import { useT } from '@/lib/useT'

const NOMINAL_ENTRY_BADGE = 'bg-green-100 text-green-700'

// ─── compact file chip ────────────────────────────────────────────────────────

function FileChip({ label, filename, accept, locked, onUpload, onRemove, onPreview }: {
  label: string
  filename: string | null | undefined
  accept: string
  locked: boolean
  onUpload: (file: File) => void
  onRemove: () => void
  onPreview?: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    if (inputRef.current) inputRef.current.value = ''
  }
  const displayName = filename
    ? decodeURIComponent(filename.split('/').pop() ?? filename)
    : null
  return (
    <span className="flex items-center gap-1 min-w-0">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      {displayName ? (
        <span className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full pl-2 pr-1 py-0.5 max-w-[140px]">
          {onPreview ? (
            <button onClick={onPreview} className="text-xs text-green-700 truncate hover:underline underline-offset-2 text-left">
              {displayName}
            </button>
          ) : (
            <span className="text-xs text-green-700 truncate">{displayName}</span>
          )}
          {!locked && (
            <button onClick={onRemove} className="text-green-400 hover:text-red-500 transition-colors ml-0.5 shrink-0 leading-none">✕</button>
          )}
        </span>
      ) : locked ? (
        <span className="text-xs text-slate-300 border border-dashed border-slate-200 rounded-full px-2 py-0.5">—</span>
      ) : (
        <button onClick={() => inputRef.current?.click()}
          className="text-xs text-slate-400 hover:text-blue-600 border border-dashed border-slate-300 hover:border-blue-400 rounded-full px-2 py-0.5 transition-all">
          + upload
        </button>
      )}
      {!locked && <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />}
    </span>
  )
}

// ─── pdf viewer modal ─────────────────────────────────────────────────────────

function PDFViewerModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <span className="text-slate-300">|</span>
        <span className="text-sm font-semibold text-slate-700 truncate flex-1">{title}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2"
        >
          Abrir en nueva pestaña
        </a>
      </div>
      {/* iframe */}
      <iframe src={url} className="flex-1 w-full border-0" title={title} />
    </div>
  )
}

// ─── music player modal ───────────────────────────────────────────────────────

function MusicPlayerModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-700 truncate flex-1">{title}</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* player */}
        <div className="px-4 py-5">
          <audio controls autoPlay className="w-full" src={url}>
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </div>
  )
}

// ─── routine row ──────────────────────────────────────────────────────────────

function RoutineRow({
  lang, routineType, record, locked, musicUnlocked, reviewStatus, reviewComment, onSet,
}: {
  lang: Lang
  routineType: 'Balance' | 'Dynamic' | 'Combined'
  record: RoutineMusic | undefined
  locked: boolean
  musicUnlocked?: boolean
  reviewStatus?: string
  reviewComment?: string | null
  onSet: (field: 'music' | 'ts', file: File | null) => void
}) {
  const t = useT('CompetitionsTab', lang)
  const [tsPreviewUrl, setTsPreviewUrl] = useState<string | null>(null)
  const [musicPreviewUrl, setMusicPreviewUrl] = useState<string | null>(null)
  return (
    <>
      <div className="py-2 border-t border-slate-100 first:border-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="w-16 shrink-0 text-xs font-semibold text-slate-600">{routineType}</span>
          <FileChip label={t.ts} filename={record?.ts_filename}
            accept=".pdf,application/pdf"
            locked={locked && reviewStatus !== 'incorrect'}
            onPreview={record?.ts_filename ? () => setTsPreviewUrl(record.ts_filename!) : undefined}
            onUpload={(file) => onSet('ts', file)}
            onRemove={() => onSet('ts', null)} />
          {reviewStatus === 'checked' && (
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {lang === 'es' ? 'Revisada' : 'Reviewed'}
            </span>
          )}
          <FileChip label={t.music} filename={record?.music_filename}
            accept="audio/*,.mp3,.wav,.aac,.m4a"
            locked={locked && !musicUnlocked}
            onPreview={record?.music_filename ? () => setMusicPreviewUrl(record.music_filename!) : undefined}
            onUpload={(file) => onSet('music', file)}
            onRemove={() => onSet('music', null)} />
        </div>
        {reviewStatus === 'incorrect' && (
          <div className="mt-2 ml-16 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs font-semibold text-red-700 mb-0.5">
              {lang === 'es' ? 'TS marcada como incorrecta por el juez DJ:' : 'TS marked as incorrect by DJ judge:'}
            </p>
            {reviewComment && (
              <p className="text-xs text-red-600 leading-snug">{reviewComment}</p>
            )}
            <p className="text-xs text-red-400 mt-1">
              {lang === 'es' ? 'Sube una nueva TS para corregirla.' : 'Upload a new TS to correct it.'}
            </p>
          </div>
        )}
        {reviewStatus === 'new_ts' && (
          <p className="text-xs text-blue-500 ml-16 mt-1">
            {lang === 'es' ? 'Nueva TS enviada — pendiente de revisión por el juez.' : 'New TS sent — pending DJ review.'}
          </p>
        )}
      </div>
      {tsPreviewUrl && (
        <PDFViewerModal
          url={tsPreviewUrl}
          title={`${routineType} — TS`}
          onClose={() => setTsPreviewUrl(null)}
        />
      )}
      {musicPreviewUrl && (
        <MusicPlayerModal
          url={musicPreviewUrl}
          title={`${routineType} — Music`}
          onClose={() => setMusicPreviewUrl(null)}
        />
      )}
    </>
  )
}

// ─── invite judge form ────────────────────────────────────────────────────────

type InviteForm = { full_name: string; email: string; phone: string; licence: string; sport_type: string }
const EMPTY_INVITE: InviteForm = { full_name: '', email: '', phone: '', licence: '', sport_type: 'acro' }

function InviteJudgeForm({ lang, onSend, onCancel }: {
  lang: Lang
  onSend: (f: InviteForm) => Promise<void>
  onCancel: () => void
}) {
  const t = useT('CompetitionsTab', lang)
  const [form, setForm] = useState<InviteForm>(EMPTY_INVITE)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputCls = INPUT_CLS

  function set(k: keyof InviteForm, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim() || !form.email.trim()) return
    setSending(true); setError(null)
    try {
      await onSend({ ...form, full_name: form.full_name.trim(), email: form.email.trim() })
      setSent(form.email.trim())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-green-800">{t.inviteSent} {sent}</p>
        <p className="text-xs text-green-700">{t.inviteInfo}</p>
        <div className="flex justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-green-700 hover:bg-green-100 transition-all">
            {t.cancel}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.name} *</label>
          <input type="text" required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} className={inputCls} autoFocus />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.email} *</label>
          <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.phone}</label>
          <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.licence}</label>
          <input type="text" value={form.licence} onChange={(e) => set('licence', e.target.value)} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.sportType} *</label>
          <div className="flex gap-2">
            {(['acro', 'rg'] as const).map(s => (
              <button key={s} type="button" onClick={() => set('sport_type', s)}
                className={[
                  'flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                  form.sport_type === s
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300',
                ].join(' ')}>
                {s === 'acro' ? t.acro : t.rg}
              </button>
            ))}
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all">
          {t.cancel}
        </button>
        <button type="submit" disabled={sending}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all">
          {t.send}
        </button>
      </div>
    </form>
  )
}

// ─── detail view ─────────────────────────────────────────────────────────────

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

function routineTypesForTeam(team: Team, ageGroupRules: AgeGroupRule[]): (typeof ROUTINE_TYPES[number])[] {
  const rule = ageGroupRules.find(r => r.id === team.age_group)
  const count = rule?.routine_count ?? 3
  if (count === 1) return ['Combined']
  if (count === 2) return ['Balance', 'Dynamic']
  return ['Balance', 'Dynamic', 'Combined']
}

/** Rule UUID on the team row, or legacy human-readable label matching `agLabels[ruleId]`. */
function teamMatchesCompetitionAgeGroups(
  team: Team,
  competition: Competition,
  agLabels: Record<string, string>,
): boolean {
  return competition.age_groups.some(
    (agId) => agId === team.age_group || (!!agLabels[agId] && agLabels[agId] === team.age_group),
  )
}

function CompetitionDetailView({
  lang, clubId, competition, teams, gymnasts, coaches, competitionCoaches, entries, music, judges, nominations, agLabels, ageGroupRules,
  tsReviewStatuses, definitiveEntryQuota, clubDefinitiveEntryStatus, onBack,
  onRegister, onDropout, onSetFile, onNominate, onRemoveNomination, onInviteJudge,
  onRegisterCoach, onUnregisterCoach,
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
  /** From `definitive_entries.status`; `approved` ⇒ nominal entry allowed before global registration_open. */
  clubDefinitiveEntryStatus: string | null
  onBack: () => void
  onRegister: (teamId: string) => void
  onDropout: (entryId: string) => void
  onSetFile: (teamId: string, routineType: 'Balance' | 'Dynamic' | 'Combined', field: 'music' | 'ts', file: File | null) => void
  onNominate: (judgeId: string) => void
  onRemoveNomination: (nominationId: string) => void
  onInviteJudge: (f: { full_name: string; email: string; phone?: string; licence?: string; sport_type: string }) => Promise<void>
  onRegisterCoach: (coachId: string) => void
  onUnregisterCoach: (coachId: string) => void
}) {
  const t = useT('CompetitionsTab', lang)
  const isOpen = competition.status === 'registration_open'
  const nominalOpenForClub = competition.status === 'definitive_entry' && clubDefinitiveEntryStatus === 'approved'
  const registrationFlowOpen = isOpen || nominalOpenForClub
  const canRegisterNow = competition.status === 'registration_open' || competition.status === 'definitive_entry'
  const dateStr = formatDateRange(competition.start_date, competition.end_date)
  const today = new Date().toISOString().slice(0, 10)
  const isFileEditLocked = !!competition.ts_music_deadline && today > competition.ts_music_deadline
  const competitionYear = competition.start_date
    ? new Date(competition.start_date + 'T00:00:00').getFullYear()
    : new Date().getFullYear()
  const [ageError, setAgeError] = useState<{ teamId: string; messages: string[] } | null>(null)
  const [musicUnlockedByTeam, setMusicUnlockedByTeam] = useState<Record<string, boolean>>({})

  // registration gate: check if this club is in competition_allowed_clubs
  const [allowed, setAllowed] = useState<boolean | null>(canRegisterNow ? null : true)
  useEffect(() => {
    if (!canRegisterNow) return
    const supabase = createClient()
    supabase
      .from('competition_allowed_clubs')
      .select('id')
      .eq('competition_id', competition.id)
      .eq('club_id', clubId)
      .maybeSingle()
      .then(({ data }) => setAllowed(!!data))
  }, [canRegisterNow, competition.id, clubId])

  useEffect(() => {
    const supabase = createClient()
    const enteredIds = entries
      .filter((e) => e.competition_id === competition.id)
      .map((e) => e.team_id)
    const teamIds = [
      ...new Set([
        ...teams
          .filter((team) => !team.archived_at && teamMatchesCompetitionAgeGroups(team, competition, agLabels))
          .map((t) => t.id),
        ...enteredIds,
      ]),
    ].filter((id) => teams.some((t) => t.id === id))
    if (!teamIds.length) {
      setMusicUnlockedByTeam({})
      return
    }
    supabase
      .from('competition_music_unlocks')
      .select('team_id, enabled')
      .eq('competition_id', competition.id)
      .in('team_id', teamIds)
      .then(({ data }) => {
        const map: Record<string, boolean> = {}
        for (const row of data ?? []) map[row.team_id] = !!row.enabled
        setMusicUnlockedByTeam(map)
      })
  }, [competition.id, competition.age_groups, teams, agLabels, entries])

  const rosterTeams = teams.filter((team) => !team.archived_at)
  // Eligible for new registration; also show teams already entered even if age_group no longer matches (edits / rule changes).
  const eligibleTeams = rosterTeams.filter((team) => teamMatchesCompetitionAgeGroups(team, competition, agLabels))
  const enteredTeamIds = new Set(
    entries.filter((e) => e.competition_id === competition.id).map((e) => e.team_id),
  )
  const registeredOutsideEligible = teams.filter((t) => enteredTeamIds.has(t.id) && !eligibleTeams.some((e) => e.id === t.id))
  const teamsListedForCompetition = [...eligibleTeams, ...registeredOutsideEligible]

  const compNominations = nominations.filter((n) => n.competition_id === competition.id)
  const nominatedIds = new Set(compNominations.map((n) => n.judge_id))
  const hasJudgeWarning = compNominations.length === 0 && registrationFlowOpen
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

  // Judges already nominated for this competition
  const nominatedJudges = judges.filter(j => nominatedIds.has(j.id))
  // Judges in pool but not yet nominated for this competition
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
    const used = teams
      .filter((t) => t.age_group === team.age_group && t.category === team.category)
      .filter((t) => {
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
          <span
            className={[
              'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1',
              nominalOpenForClub ? NOMINAL_ENTRY_BADGE : STATUS_BADGE[competition.status],
            ].join(' ')}
          >
            {competition.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            {nominalOpenForClub ? t.nominalEntryOpen : t.status[competition.status]}
          </span>
        </div>

        {/* judges collapsible */}
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
                    {registrationFlowOpen && (
                      <button onClick={() => onUnregisterCoach(c.id)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shrink-0">
                        {t.unregisterCoach}
                      </button>
                    )}
                  </div>
                ))}
                {registrationFlowOpen && unregisteredCoaches.map(c => (
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
                {registeredCoaches.length === 0 && !registrationFlowOpen && (
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
            {/* nominated judges for this competition */}
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
                        {registrationFlowOpen && nomination && (
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

            {/* pool picker */}
            {registrationFlowOpen && (
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

                {/* invite new judge */}
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
                    onSend={async (f) => {
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

      {/* registration gate */}
      {canRegisterNow && allowed === null ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
        </div>
      ) : canRegisterNow && allowed === false ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-6 text-center space-y-1">
          <p className="text-sm font-semibold text-amber-800">{t.notAllowedTitle}</p>
          <p className="text-xs text-amber-600">{t.notAllowedHint}</p>
        </div>
      ) : teams.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10 bg-white border border-slate-200 rounded-2xl">{t.noTeams}</p>
      ) : teamsListedForCompetition.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10 bg-white border border-slate-200 rounded-2xl">{t.noEligibleTeams}</p>
      ) : (
        <div className="space-y-3">
          {teamsListedForCompetition.map((team) => {
            const entry = entryFor(team.id)
            const missingLicencia = (team.gymnast_ids ?? []).some(gid => {
              const g = gymnasts.find(x => x.id === gid)
              return !g?.licencia_url
            })
            return (
              <div key={team.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {/* team row */}
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
                      {missingLicencia && (
                        <span title={t.licenciaWarningFull} className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
                          ⚠ {t.licenciaWarning}
                        </span>
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
                    ) : canRegisterNow ? (() => {
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
                          if (!teamMatchesCompetitionAgeGroups(team, competition, agLabels)) {
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

                {/* uploads — only if registered */}
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
                            musicUnlocked={!!musicUnlockedByTeam[team.id]}
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
      )}

      {/* age / age-group error modal */}
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

// ─── list view ────────────────────────────────────────────────────────────────

// ─── entry summary (collapsible, shown below action buttons) ─────────────────

type EntrySummaryRow = { label: string; count: number }

function EntrySummary({ lang, rows, accentClass }: { lang: Lang; rows: EntrySummaryRow[]; accentClass: string }) {
  const [open, setOpen] = useState(false)
  const total = rows.reduce((s, r) => s + r.count, 0)
  if (total === 0) return null
  const submittedLabel = lang === 'es' ? `${total} equipo${total !== 1 ? 's' : ''} enviados` : `${total} team${total !== 1 ? 's' : ''} submitted`
  return (
    <div className={`mt-2 rounded-xl border overflow-hidden ${accentClass}`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-black/5 transition-colors">
        <span className="text-xs font-semibold">{submittedLabel}</span>
        <svg className={['w-3.5 h-3.5 transition-transform opacity-60', open ? 'rotate-180' : ''].join(' ')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="px-3 pb-2.5 pt-1 space-y-1 border-t border-black/10">
          {rows.filter(r => r.count > 0).map(r => (
            <div key={r.label} className="flex items-center justify-between text-xs">
              <span className="opacity-80">{r.label}</span>
              <span className="font-bold">{r.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CompetitionListView({
  lang, competitions, teams, entries, nominations, clubProvisionalEntries, clubDefinitiveEntries,
  ageGroupRules, onSelect, onOpenProvisionalEntry, onOpenDefinitiveEntry,
}: {
  lang: Lang
  competitions: Competition[]
  teams: Team[]
  entries: CompetitionEntry[]
  nominations: CompetitionJudgeNomination[]
  clubProvisionalEntries: Record<string, { teams_per_category: Record<string, number> }>
  clubDefinitiveEntries: Record<string, { teams_per_category: Record<string, number>; status: string }>
  ageGroupRules: AgeGroupRule[]
  onSelect: (id: string) => void
  onOpenProvisionalEntry: (comp: Competition) => void
  onOpenDefinitiveEntry: (comp: Competition) => void
}) {
  const t = useT('CompetitionsTab', lang)
  const teamIds = new Set(teams.map((tm) => tm.id))

  const visible = competitions.filter((c) =>
    c.status === 'provisional_entry' ||
    c.status === 'definitive_entry' ||
    c.status === 'registration_open' ||
    entries.some((e) => e.competition_id === c.id && teamIds.has(e.team_id))
  )

  if (visible.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-16">{t.empty}</p>
  }

  function buildSummaryRows(competitionId: string, tpc: Record<string, number>): EntrySummaryRow[] {
    const comp = competitions.find(c => c.id === competitionId)
    if (!comp) return []
    return comp.age_groups.flatMap(agId => {
      const rule = ageGroupRules.find(r => r.id === agId)
      if (!rule) return []
      return categoriesForRuleset(rule.age_group)
        .map(cat => ({ label: `${rule.age_group} · ${cat}`, count: tpc[`${agId}|${cat}`] ?? 0 }))
        .filter(r => r.count > 0)
    })
  }

  return (
    <div className="space-y-3">
      {visible.map((comp) => {
        const registeredCount = entries.filter(
          (e) => e.competition_id === comp.id && teamIds.has(e.team_id)
        ).length
        const nominatedCount = nominations.filter((n) => n.competition_id === comp.id).length
        const dateStr = formatDateRange(comp.start_date, comp.end_date)
        const isProvisionalEntry = comp.status === 'provisional_entry'
        const isDefinitiveEntry = comp.status === 'definitive_entry'
        const provEntry = clubProvisionalEntries[comp.id]
        const defEntry = clubDefinitiveEntries[comp.id]
        const nominalOpenForClub = comp.status === 'definitive_entry' && defEntry?.status === 'approved'
        const needsJudge = (comp.status === 'registration_open' || nominalOpenForClub) && registeredCount > 0 && nominatedCount === 0
        return (
          <div key={comp.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all group">
            <button onClick={() => onSelect(comp.id)} className="w-full text-left px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={[
                        'px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1',
                        nominalOpenForClub ? NOMINAL_ENTRY_BADGE : STATUS_BADGE[comp.status],
                      ].join(' ')}
                    >
                      {comp.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                      {nominalOpenForClub ? t.nominalEntryOpen : t.status[comp.status]}
                    </span>
                    {(comp.status === 'registration_open' || nominalOpenForClub) && (
                      <span className={['text-xs font-medium', registeredCount > 0 ? 'text-green-600' : 'text-slate-400'].join(' ')}>
                        {t.teamCount(registeredCount)}
                      </span>
                    )}
                    {needsJudge && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        ⚠ {t.judgesWarning}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{comp.name}</p>
                  <div className="flex flex-wrap gap-x-3 mt-1">
                    {comp.location && <span className="text-xs text-slate-400">{comp.location}</span>}
                    {dateStr && <span className="text-xs text-slate-400">{dateStr}</span>}
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>

            {isProvisionalEntry && (
              <div className="px-5 pb-4">
                <button
                  onClick={() => onOpenProvisionalEntry(comp)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 transition-all text-center">
                  {lang === 'es' ? 'Inscripción provisional →' : 'Provisional entry →'}
                </button>
                {provEntry && (
                  <EntrySummary
                    lang={lang}
                    rows={buildSummaryRows(comp.id, provEntry.teams_per_category)}
                    accentClass="border-violet-200 text-violet-700 bg-violet-50/60"
                  />
                )}
              </div>
            )}

            {isDefinitiveEntry && (
              <div className="px-5 pb-4">
                {nominalOpenForClub ? (
                  <button
                    type="button"
                    onClick={() => onSelect(comp.id)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-green-200 text-green-800 bg-green-50 hover:bg-green-100 transition-all text-center">
                    {t.nominalEntryCta}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenDefinitiveEntry(comp)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 transition-all text-center">
                    {lang === 'es' ? 'Inscripción definitiva →' : 'Definitive entry →'}
                  </button>
                )}
                {defEntry && (
                  <EntrySummary
                    lang={lang}
                    rows={buildSummaryRows(comp.id, defEntry.teams_per_category)}
                    accentClass={nominalOpenForClub ? 'border-green-200 text-green-800 bg-green-50/60' : 'border-orange-200 text-orange-700 bg-orange-50/60'}
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── main export ──────────────────────────────────────────────────────────────

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
  onInviteJudge: (f: { full_name: string; email: string; phone?: string; licence?: string; sport_type: string }) => Promise<void>
  onRegisterCoach: (competitionId: string, coachId: string) => void
  onUnregisterCoach: (competitionId: string, coachId: string) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [provisionalEntryComp, setProvisionalEntryComp] = useState<Competition | null>(null)
  const [definitiveEntryComp, setDefinitiveEntryComp] = useState<Competition | null>(null)

  const [clubProvisionalEntries, setClubProvisionalEntries] = useState<Record<string, { teams_per_category: Record<string, number> }>>({})
  const [clubDefinitiveEntries, setClubDefinitiveEntries]   = useState<Record<string, { teams_per_category: Record<string, number>; status: string }>>({})

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
        .select('competition_id,teams_per_category,status')
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
        Object.fromEntries((defRes.data as unknown as { competition_id: string; teams_per_category: Record<string, number>; status: string }[]).map(e => [
          e.competition_id,
          { teams_per_category: e.teams_per_category ?? {}, status: e.status },
        ]))
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
          clubDefinitiveEntryStatus={clubDefinitiveEntries[selected.id]?.status ?? null}
          onBack={() => {
            setSelectedId(null)
            void fetchClubEntries()
          }}
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
