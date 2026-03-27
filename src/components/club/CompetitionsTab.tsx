'use client'

import { useRef, useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Competition, Team, CompetitionEntry, RoutineMusic, Judge, CompetitionJudgeNomination, AgeGroupRule } from '@/components/admin/types'
import { ROUTINE_TYPES } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    empty: 'No competitions available yet.',
    back: 'Competitions',
    register: 'Register',
    registered: 'Registered',
    dropout: 'Dropout',
    unregister: 'Unregister',
    confirmUnregister: 'Remove this team from the competition?',
    registrationClosed: 'Registration closed',
    noEligibleTeams: 'None of your teams match the age groups of this competition.',
    noTeams: 'Create teams first to be able to register.',
    teamsTitle: 'Your teams',
    deadline: 'Deadline',
    music: 'Music',
    ts: 'TS',
    noFile: 'No file',
    replace: 'Replace',
    upload: 'Upload',
    judgesTitle: 'Judges',
    nominate: 'Nominate',
    nominated: 'Nominated',
    removeNomination: 'Remove',
    noJudges: 'No judges nominated yet.',
    judgesWarning: 'At least 1 judge must be nominated for this competition.',
    addFromPool: '+ Add from pool',
    inviteNew: '+ Invite new judge',
    noPoolJudges: 'No other judges available in the pool.',
    searchJudges: 'Search judges…',
    // invite form
    inviteJudge: 'Invite new judge',
    name: 'Full name',
    email: 'Email',
    phone: 'Phone',
    licence: 'Licence no.',
    send: 'Send invitation',
    cancel: 'Cancel',
    inviteSent: 'Invitation sent to',
    inviteInfo: 'The judge will receive an email to set up their account.',
    status: {
      draft: 'Draft',
      registration_open: 'Open',
      registration_closed: 'Closed',
      active: 'Live',
      finished: 'Finished',
    } as Record<string, string>,
    teamCount: (n: number) => n === 0 ? 'Not registered' : `${n} team${n !== 1 ? 's' : ''} registered`,
  },
  es: {
    empty: 'Aún no hay competiciones disponibles.',
    back: 'Competiciones',
    register: 'Inscribir',
    registered: 'Inscrito',
    dropout: 'Baja',
    unregister: 'Retirar',
    confirmUnregister: '¿Retirar este equipo de la competición?',
    registrationClosed: 'Inscripción cerrada',
    noEligibleTeams: 'Ningún equipo coincide con los grupos de edad de esta competición.',
    noTeams: 'Crea equipos primero para poder inscribirte.',
    teamsTitle: 'Tus equipos',
    deadline: 'Plazo',
    music: 'Música',
    ts: 'TS',
    noFile: 'Sin archivo',
    replace: 'Reemplazar',
    upload: 'Subir',
    judgesTitle: 'Jueces',
    nominate: 'Nominar',
    nominated: 'Nominado',
    removeNomination: 'Quitar',
    noJudges: 'Aún no hay jueces nominados.',
    judgesWarning: 'Debes nominar al menos 1 juez para esta competición.',
    addFromPool: '+ Añadir del pool',
    inviteNew: '+ Invitar nuevo juez',
    noPoolJudges: 'No hay otros jueces disponibles en el pool.',
    searchJudges: 'Buscar jueces…',
    // invite form
    inviteJudge: 'Invitar nuevo juez',
    name: 'Nombre completo',
    email: 'Email',
    phone: 'Teléfono',
    licence: 'Nº licencia',
    send: 'Enviar invitación',
    cancel: 'Cancelar',
    inviteSent: 'Invitación enviada a',
    inviteInfo: 'El juez recibirá un email para crear su cuenta.',
    status: {
      draft: 'Borrador',
      registration_open: 'Abierta',
      registration_closed: 'Cerrada',
      active: 'En vivo',
      finished: 'Finalizada',
    } as Record<string, string>,
    teamCount: (n: number) => n === 0 ? 'Sin inscripción' : `${n} equipo${n !== 1 ? 's' : ''} inscrito${n !== 1 ? 's' : ''}`,
  },
}

const STATUS_BADGE: Record<string, string> = {
  draft:               'bg-slate-100 text-slate-500',
  registration_open:   'bg-green-100 text-green-700',
  registration_closed: 'bg-amber-100 text-amber-700',
  active:              'bg-blue-600 text-white',
  finished:            'bg-slate-100 text-slate-400',
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDateRange(start: string | null, end: string | null) {
  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  if (start && end && start !== end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return fmt(start)
  if (end) return fmt(end)
  return ''
}
function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── compact file chip ────────────────────────────────────────────────────────

function FileChip({ label, filename, accept, onUpload, onRemove }: {
  label: string
  filename: string | null | undefined
  accept: string
  onUpload: (filename: string) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onUpload(file.name)
    if (inputRef.current) inputRef.current.value = ''
  }
  return (
    <span className="flex items-center gap-1 min-w-0">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      {filename ? (
        <span className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full pl-2 pr-1 py-0.5 max-w-[140px]">
          <span className="text-xs text-green-700 truncate">{filename}</span>
          <button onClick={onRemove} className="text-green-400 hover:text-red-500 transition-colors ml-0.5 shrink-0 leading-none">✕</button>
        </span>
      ) : (
        <button onClick={() => inputRef.current?.click()}
          className="text-xs text-slate-400 hover:text-blue-600 border border-dashed border-slate-300 hover:border-blue-400 rounded-full px-2 py-0.5 transition-all">
          + upload
        </button>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
    </span>
  )
}

// ─── routine row ──────────────────────────────────────────────────────────────

function RoutineRow({
  lang, routineType, record, onSet,
}: {
  lang: Lang
  routineType: 'Balance' | 'Dynamic' | 'Combined'
  record: RoutineMusic | undefined
  onSet: (field: 'music' | 'ts', filename: string | null) => void
}) {
  const t = T[lang]
  return (
    <div className="flex items-center gap-3 py-2 border-t border-slate-100 first:border-0">
      <span className="w-16 shrink-0 text-xs font-semibold text-slate-600">{routineType}</span>
      <div className="flex items-center gap-3 flex-wrap">
        <FileChip label={t.ts} filename={record?.ts_filename}
          accept=".pdf,application/pdf"
          onUpload={(fn) => onSet('ts', fn)}
          onRemove={() => onSet('ts', null)} />
        <FileChip label={t.music} filename={record?.music_filename}
          accept="audio/*,.mp3,.wav,.aac,.m4a"
          onUpload={(fn) => onSet('music', fn)}
          onRemove={() => onSet('music', null)} />
      </div>
    </div>
  )
}

// ─── invite judge form ────────────────────────────────────────────────────────

type InviteForm = { full_name: string; email: string; phone: string; licence: string }
const EMPTY_INVITE: InviteForm = { full_name: '', email: '', phone: '', licence: '' }

function InviteJudgeForm({ lang, onSend, onCancel }: {
  lang: Lang
  onSend: (f: InviteForm) => Promise<void>
  onCancel: () => void
}) {
  const t = T[lang]
  const [form, setForm] = useState<InviteForm>(EMPTY_INVITE)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

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
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">{t.name} *</label>
          <input type="text" required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} className={inputCls} autoFocus />
        </div>
        <div className="col-span-2">
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

function routineTypesForTeam(team: Team, ageGroupRules: AgeGroupRule[]): (typeof ROUTINE_TYPES[number])[] {
  const rule = ageGroupRules.find(r => r.id === team.age_group)
  const count = rule?.routine_count ?? 3
  if (count === 1) return ['Combined']
  if (count === 2) return ['Balance', 'Dynamic']
  return ['Balance', 'Dynamic', 'Combined']
}

function CompetitionDetailView({
  lang, competition, teams, entries, music, judges, nominations, agLabels, ageGroupRules, onBack,
  onRegister, onUnregister, onSetFile, onNominate, onRemoveNomination, onInviteJudge,
}: {
  lang: Lang
  competition: Competition
  teams: Team[]
  entries: CompetitionEntry[]
  music: RoutineMusic[]
  judges: Judge[]
  nominations: CompetitionJudgeNomination[]
  agLabels: Record<string, string>
  ageGroupRules: AgeGroupRule[]
  onBack: () => void
  onRegister: (teamId: string) => void
  onUnregister: (entryId: string) => void
  onSetFile: (teamId: string, routineType: 'Balance' | 'Dynamic' | 'Combined', field: 'music' | 'ts', filename: string | null) => void
  onNominate: (judgeId: string) => void
  onRemoveNomination: (nominationId: string) => void
  onInviteJudge: (f: { full_name: string; email: string; phone?: string; licence?: string }) => Promise<void>
}) {
  const t = T[lang]
  const isOpen = competition.status === 'registration_open'
  const dateStr = formatDateRange(competition.start_date, competition.end_date)

  // Fix eligible teams filter: match by UUID (ag_group = rule.id) OR by label name (legacy)
  const eligibleTeams = teams.filter((team) =>
    competition.age_groups.some(agId =>
      agId === team.age_group ||
      (agLabels[agId] && agLabels[agId] === team.age_group)
    )
  )

  const compNominations = nominations.filter((n) => n.competition_id === competition.id)
  const nominatedIds = new Set(compNominations.map((n) => n.judge_id))
  const hasJudgeWarning = compNominations.length === 0 && isOpen
  const [judgesOpen, setJudgesOpen] = useState(hasJudgeWarning)
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

        {/* judges collapsible */}
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

            {/* pool picker */}
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
                      await onInviteJudge({ full_name: f.full_name, email: f.email, phone: f.phone || undefined, licence: f.licence || undefined })
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
      {teams.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10 bg-white border border-slate-200 rounded-2xl">{t.noTeams}</p>
      ) : eligibleTeams.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10 bg-white border border-slate-200 rounded-2xl">{t.noEligibleTeams}</p>
      ) : (
        <div className="space-y-3">
          {eligibleTeams.map((team) => {
            const entry = entryFor(team.id)
            return (
              <div key={team.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {/* team row */}
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{team.gymnast_display}</p>
                      {entry?.dropped_out && (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-red-50 text-red-400 rounded-full">{t.dropout}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{team.category} · {agLabels[team.age_group] ?? team.age_group}</p>
                  </div>
                  <div className="shrink-0">
                    {entry ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-600 rounded-full">{t.registered}</span>
                        {isOpen && (
                          <button onClick={() => { if (confirm(t.confirmUnregister)) onUnregister(entry.id) }}
                            className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                            {t.unregister}
                          </button>
                        )}
                      </div>
                    ) : isOpen ? (
                      <button onClick={() => onRegister(team.id)}
                        className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                        {t.register}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-300">{t.registrationClosed}</span>
                    )}
                  </div>
                </div>

                {/* uploads — only if registered */}
                {entry && (
                  <div className="px-4 pb-4 pt-1">
                    <div className="bg-slate-50 rounded-xl px-4 py-1">
                      {routineTypesForTeam(team, ageGroupRules).map((rt) => (
                        <RoutineRow key={rt} lang={lang} routineType={rt}
                          record={recordFor(team.id, rt)}
                          onSet={(field, filename) => onSetFile(team.id, rt, field, filename)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}

// ─── list view ────────────────────────────────────────────────────────────────

function CompetitionListView({
  lang, competitions, teams, entries, nominations, onSelect,
}: {
  lang: Lang
  competitions: Competition[]
  teams: Team[]
  entries: CompetitionEntry[]
  nominations: CompetitionJudgeNomination[]
  onSelect: (id: string) => void
}) {
  const t = T[lang]
  const teamIds = new Set(teams.map((tm) => tm.id))

  const visible = competitions.filter((c) =>
    c.status === 'registration_open' ||
    entries.some((e) => e.competition_id === c.id && teamIds.has(e.team_id))
  )

  if (visible.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-16">{t.empty}</p>
  }

  return (
    <div className="space-y-3">
      {visible.map((comp) => {
        const registeredCount = entries.filter(
          (e) => e.competition_id === comp.id && teamIds.has(e.team_id)
        ).length
        const nominatedCount = nominations.filter((n) => n.competition_id === comp.id).length
        const needsJudge = comp.status === 'registration_open' && registeredCount > 0 && nominatedCount === 0
        const dateStr = formatDateRange(comp.start_date, comp.end_date)
        return (
          <button key={comp.id} onClick={() => onSelect(comp.id)}
            className="w-full text-left bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={['px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1', STATUS_BADGE[comp.status]].join(' ')}>
                    {comp.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    {t.status[comp.status]}
                  </span>
                  <span className={['text-xs font-medium', registeredCount > 0 ? 'text-green-600' : 'text-slate-400'].join(' ')}>
                    {t.teamCount(registeredCount)}
                  </span>
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
        )
      })}
    </div>
  )
}

// ─── main export ──────────────────────────────────────────────────────────────

export default function CompetitionsTab({
  lang, competitions, teams, entries, music, judges, nominations, agLabels, ageGroupRules,
  onRegister, onUnregister, onSetFile, onNominate, onRemoveNomination, onInviteJudge,
}: {
  lang: Lang
  competitions: Competition[]
  teams: Team[]
  entries: CompetitionEntry[]
  music: RoutineMusic[]
  judges: Judge[]
  nominations: CompetitionJudgeNomination[]
  agLabels: Record<string, string>
  ageGroupRules: AgeGroupRule[]
  onRegister: (competitionId: string, teamId: string) => void
  onUnregister: (entryId: string) => void
  onSetFile: (teamId: string, competitionId: string, routineType: 'Balance' | 'Dynamic' | 'Combined', field: 'music' | 'ts', filename: string | null) => void
  onNominate: (competitionId: string, judgeId: string) => void
  onRemoveNomination: (nominationId: string) => void
  onInviteJudge: (f: { full_name: string; email: string; phone?: string; licence?: string }) => Promise<void>
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = competitions.find((c) => c.id === selectedId) ?? null

  if (selected) {
    return (
      <CompetitionDetailView
        lang={lang}
        competition={selected}
        teams={teams}
        entries={entries}
        music={music}
        judges={judges}
        nominations={nominations}
        agLabels={agLabels}
        ageGroupRules={ageGroupRules}
        onBack={() => setSelectedId(null)}
        onRegister={(teamId) => onRegister(selected.id, teamId)}
        onUnregister={onUnregister}
        onSetFile={(teamId, routineType, field, filename) => onSetFile(teamId, selected.id, routineType, field, filename)}
        onNominate={(judgeId) => onNominate(selected.id, judgeId)}
        onRemoveNomination={onRemoveNomination}
        onInviteJudge={onInviteJudge}
      />
    )
  }

  return (
    <CompetitionListView
      lang={lang}
      competitions={competitions}
      teams={teams}
      entries={entries}
      nominations={nominations}
      onSelect={setSelectedId}
    />
  )
}
