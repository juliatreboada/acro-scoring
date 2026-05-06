'use client'

import { useState, useEffect } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Team, Club, Gymnast, CompetitionEntry, AgeGroupRule, CompetitionStatus } from '@/components/admin/types'
import { categoryLabel, sortByAgeGroupAndCategory, categoriesForRuleset, CATEGORY_LABELS } from '@/components/admin/types'
import ClickableImg from '@/components/shared/ClickableImg'
import ImportTab from './ImportTab'
import { createClient } from '@/lib/supabase'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    noRegistrations: 'No teams registered yet.',
    import: 'Import',
    backToList: 'Back to registrations',
    registered: (n: number) => `${n} registered`,
    dropout: (n: number) => `${n} dropout`,
    dropouts: (n: number) => `${n} dropouts`,
    markDropout: 'Mark as dropout',
    undoDropout: 'Undo dropout',
    baja: 'Dropout',
    licenciaWarning: 'Missing licencia',
    licenciaWarningFull: 'One or more gymnasts have no licencia uploaded.',
    tsWarning: 'Missing TS',
    tsWarningFull: 'No TS uploaded.',
    musicWarning: 'Missing music',
    musicWarningFull: 'No music file uploaded.',
    reopenMusic: 'Reopen music upload',
    closeMusicReopen: 'Close music reopen',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    // sub-tabs
    subTabs: { provisional: 'Provisional', definitive: 'Definitive', nominative: 'Nominative' },
    // provisional sub-tab
    noProvisional: 'No provisional entries yet.',
    total: 'Total',
    teams: 'teams',
    // definitive sub-tab
    noDefinitive: 'No definitive entries yet.',
    contact: 'Contact',
    totalAmount: 'Total',
    judgeProvided: 'Judge',
    noJudge: 'No judge',
    statusPending: 'Pending',
    statusPaymentUploaded: 'Payment uploaded',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    approve: 'Approve',
    reject: 'Reject',
    viewPayment: 'View payment',
    allowedClubs: 'Allowed clubs',
    noAllowedClubs: 'No clubs allowed yet.',
    addManually: 'Add club',
    removeAllowed: 'Remove',
    sourceAuto: 'Auto',
    sourceManual: 'Manual',
    selectClub: 'Select a club…',
    add: 'Add',
    cancel: 'Cancel',
    confirmRemoveWithEntries: (name: string, n: number) =>
      `${name} has ${n} registered team${n !== 1 ? 's' : ''}. Removing will delete their registrations. Continue?`,
    confirmRemoveSimple: (name: string) => `Remove ${name} from allowed clubs?`,
    confirm: 'Confirm',
    adminNotes: 'Admin notes',
    saveNotes: 'Save',
    withDefinitiveEntry: 'With definitive entry',
    noDefinitiveEntry: 'Other clubs',
    inviteNewClub: '+ Invite new club',
    inviteClubTitle: 'Invite new club',
    emailLabel: 'Email',
    sendInvite: 'Send invitation',
    inviteSent: 'Invitation sent to',
    inviteClubInfo: 'The club will receive an email to set up their account.',
    sending: 'Sending…',
  },
  es: {
    noRegistrations: 'Sin equipos registrados todavía.',
    import: 'Importar',
    backToList: 'Volver a inscripciones',
    registered: (n: number) => `${n} inscrito${n === 1 ? '' : 's'}`,
    dropout: (n: number) => `${n} baja`,
    dropouts: (n: number) => `${n} bajas`,
    markDropout: 'Declarar baja',
    undoDropout: 'Deshacer baja',
    baja: 'Baja',
    licenciaWarning: 'Licencia pendiente',
    licenciaWarningFull: 'Uno o más gimnastas no tienen la licencia subida.',
    tsWarning: 'Falta TS',
    tsWarningFull: 'No se ha subido la TS.',
    musicWarning: 'Falta música',
    musicWarningFull: 'No se ha subido el archivo de música.',
    reopenMusic: 'Reabrir subida música',
    closeMusicReopen: 'Cerrar reapertura música',
    expandAll: 'Expandir todo',
    collapseAll: 'Contraer todo',
    // sub-tabs
    subTabs: { provisional: 'Provisional', definitive: 'Definitiva', nominative: 'Nominativa' },
    // provisional sub-tab
    noProvisional: 'Sin inscripciones provisionales todavía.',
    total: 'Total',
    teams: 'equipos',
    // definitive sub-tab
    noDefinitive: 'Sin inscripciones definitivas todavía.',
    contact: 'Contacto',
    totalAmount: 'Total',
    judgeProvided: 'Juez',
    noJudge: 'Sin juez',
    statusPending: 'Pendiente',
    statusPaymentUploaded: 'Pago subido',
    statusApproved: 'Aprobado',
    statusRejected: 'Rechazado',
    approve: 'Aprobar',
    reject: 'Rechazar',
    viewPayment: 'Ver pago',
    allowedClubs: 'Clubes autorizados',
    noAllowedClubs: 'Aún no hay clubes autorizados.',
    addManually: 'Añadir club',
    removeAllowed: 'Quitar',
    sourceAuto: 'Auto',
    sourceManual: 'Manual',
    selectClub: 'Selecciona un club…',
    add: 'Añadir',
    cancel: 'Cancelar',
    confirmRemoveWithEntries: (name: string, n: number) =>
      `${name} tiene ${n} equipo${n !== 1 ? 's' : ''} inscrito${n !== 1 ? 's' : ''}. Al quitar el club se eliminarán sus inscripciones. ¿Continuar?`,
    confirmRemoveSimple: (name: string) => `¿Quitar a ${name} de los clubes autorizados?`,
    confirm: 'Confirmar',
    adminNotes: 'Notas del admin',
    saveNotes: 'Guardar',
    withDefinitiveEntry: 'Con inscripción definitiva',
    noDefinitiveEntry: 'Otros clubes',
    inviteNewClub: '+ Invitar nuevo club',
    inviteClubTitle: 'Invitar nuevo club',
    emailLabel: 'Email',
    sendInvite: 'Enviar invitación',
    inviteSent: 'Invitación enviada a',
    inviteClubInfo: 'El club recibirá un email para crear su cuenta.',
    sending: 'Enviando…',
  },
}

// ─── local DB types ───────────────────────────────────────────────────────────

type ProvisionalEntry = {
  id: string
  club_id: string
  teams_per_category: Record<string, number>
  created_at: string
}

type DefinitiveEntry = {
  id: string
  club_id: string
  contact_name: string
  contact_phone: string
  contact_email: string
  teams_per_category: Record<string, number>
  judge_name: string | null
  total_amount: number
  status: 'pending' | 'payment_uploaded' | 'approved' | 'rejected'
  payment_document_url: string | null
  admin_notes: string | null
  created_at: string
}

type AllowedClub = {
  id: string
  club_id: string
  source: 'definitive_entry' | 'manual'
  created_at: string
}

// ─── shared helpers ───────────────────────────────────────────────────────────

function ClubAvatar({ club }: { club: Club | undefined }) {
  if (!club) return null
  return club.avatar_url ? (
    <img src={club.avatar_url} alt={club.club_name} className="w-6 h-6 rounded-full object-cover shrink-0 ring-2 ring-white" />
  ) : (
    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-[10px] font-semibold flex items-center justify-center shrink-0 ring-2 ring-white">
      {club.club_name.charAt(0).toUpperCase()}
    </div>
  )
}

function TeamAvatar({ team }: { team: Team }) {
  const initials = team.gymnast_display
    .split('/')
    .map((n) => n.trim()[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return team.photo_url ? (
    <ClickableImg src={team.photo_url} alt={team.gymnast_display} className="w-10 h-10 rounded-lg object-cover shrink-0" />
  ) : (
    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold flex items-center justify-center shrink-0">
      {initials}
    </div>
  )
}

// ─── level helpers (shared with nominative view) ──────────────────────────────

type Level = 'Escolar' | 'Base' | 'Nacional'
const LEVEL_ORDER: Level[] = ['Escolar', 'Base', 'Nacional']

function getLevel(ageGroupId: string, rules: AgeGroupRule[]): Level {
  const ag = rules.find(r => r.id === ageGroupId)?.age_group ?? ''
  if (ag.includes('Escolar')) return 'Escolar'
  if (ag.includes('Base'))    return 'Base'
  return 'Nacional'
}

// ─── provisional sub-tab ──────────────────────────────────────────────────────

function ProvisionalSubTab({ lang, provisionalEntries, clubs, ageGroupRules, competitionAgeGroups }: {
  lang: Lang
  provisionalEntries: ProvisionalEntry[]
  clubs: Club[]
  ageGroupRules: AgeGroupRule[]
  competitionAgeGroups: string[]
}) {
  const t = T[lang]
  const [openLevels, setOpenLevels] = useState<Set<string>>(new Set())
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())

  type CatRow = { ageGroupId: string; ageGroupName: string; age_group: string; category: string }
  const rawRows: CatRow[] = competitionAgeGroups.flatMap(agId => {
    const rule = ageGroupRules.find(r => r.id === agId)
    if (!rule) return []
    return categoriesForRuleset(rule.age_group).map(cat => ({
      ageGroupId: agId, age_group: agId, ageGroupName: rule.age_group, category: cat,
    }))
  })
  const allRows = sortByAgeGroupAndCategory(rawRows, ageGroupRules)

  // Only rows where at least one club submitted teams
  const activeRows = allRows.filter(row =>
    provisionalEntries.some(e => (e.teams_per_category[`${row.ageGroupId}|${row.category}`] ?? 0) > 0)
  )

  const byLevel = new Map<Level, CatRow[]>()
  for (const row of activeRows) {
    const level = getLevel(row.ageGroupId, ageGroupRules)
    if (!byLevel.has(level)) byLevel.set(level, [])
    byLevel.get(level)!.push(row)
  }
  const presentLevels = LEVEL_ORDER.filter(l => byLevel.has(l))
  const allGroupKeys = activeRows.map(r => `${r.ageGroupId}|${r.category}`)

  function getRowTotal(agId: string, cat: string): number {
    return provisionalEntries.reduce((s, e) => s + (e.teams_per_category[`${agId}|${cat}`] ?? 0), 0)
  }
  function getLevelTotal(rows: CatRow[]): number {
    return rows.reduce((s, r) => s + getRowTotal(r.ageGroupId, r.category), 0)
  }

  const isLevelOpen = (level: string) => openLevels.size === 0 || openLevels.has(level)
  const toggleLevel = (level: string) => {
    setOpenLevels(prev => {
      const next = prev.size === 0 ? new Set<string>(presentLevels) : new Set(prev)
      if (next.has(level)) next.delete(level); else next.add(level)
      return next
    })
  }
  const isGroupOpen = (key: string) => openGroups.size === 0 || openGroups.has(key)
  const toggleGroup = (key: string) => {
    setOpenGroups(prev => {
      const next = prev.size === 0 ? new Set(allGroupKeys) : new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }

  if (provisionalEntries.length === 0 || activeRows.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-12 border border-dashed border-slate-200 rounded-xl">{t.noProvisional}</p>
  }

  return (
    <div className="space-y-4">
      {presentLevels.map(level => {
        const levelRows = byLevel.get(level)!
        const levelOpen = isLevelOpen(level)
        const levelTotal = getLevelTotal(levelRows)
        return (
          <div key={level} className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleLevel(level)}
              className="w-full flex items-center gap-3 px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <svg
                className={['w-4 h-4 text-slate-400 shrink-0 transition-transform', levelOpen ? 'rotate-90' : ''].join(' ')}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <span className="text-sm font-bold text-slate-700">{level}</span>
              <span className="text-xs text-slate-400">{levelTotal} {t.teams}</span>
            </button>

            {levelOpen && (
              <div className="px-5 py-4 space-y-4">
                {levelRows.map(row => {
                  const key = `${row.ageGroupId}|${row.category}`
                  const groupOpen = isGroupOpen(key)
                  const total = getRowTotal(row.ageGroupId, row.category)
                  const clubRows = provisionalEntries
                    .map(e => ({ club: clubs.find(c => c.id === e.club_id), count: e.teams_per_category[`${row.ageGroupId}|${row.category}`] ?? 0, clubId: e.club_id }))
                    .filter(x => x.count > 0)

                  return (
                    <div key={key}>
                      <button onClick={() => toggleGroup(key)} className="w-full flex items-center gap-3 mb-2 text-left group">
                        <svg
                          className={['w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform', groupOpen ? 'rotate-90' : ''].join(' ')}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                        <span className="text-sm font-semibold text-slate-700">
                          {row.ageGroupName} · {CATEGORY_LABELS[lang]?.[row.category] ?? row.category}
                        </span>
                        <span className="text-xs text-slate-400">{total} {t.teams}</span>
                      </button>

                      {groupOpen && (
                        <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                          {clubRows.map(({ club, count, clubId }) => (
                            <div key={clubId} className="flex items-center gap-3 px-4 py-2.5 bg-white">
                              {club?.avatar_url
                                ? <img src={club.avatar_url} alt={club.club_name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                                : <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
                                    {club?.club_name.charAt(0).toUpperCase() ?? '?'}
                                  </div>
                              }
                              <p className="flex-1 text-sm font-medium text-slate-700 truncate">{club?.club_name ?? '—'}</p>
                              <span className="text-sm font-bold text-slate-800 shrink-0">{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── status badge helper ──────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  pending:          'bg-amber-50 text-amber-700 border-amber-200',
  payment_uploaded: 'bg-blue-50 text-blue-700 border-blue-200',
  approved:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:         'bg-red-50 text-red-500 border-red-200',
}

// ─── invite club form ─────────────────────────────────────────────────────────

function InviteClubForm({ lang, competitionId, onDone, onCancel }: {
  lang: Lang
  competitionId: string
  onDone: () => void
  onCancel: () => void
}) {
  const t = T[lang]
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true); setError(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch('/api/admin/invite-club', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Failed to send invitation')
      }
      setSent(email.trim())
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
        <p className="text-xs text-green-700">{t.inviteClubInfo}</p>
        <div className="flex justify-end">
          <button onClick={onDone}
            className="px-4 py-2 rounded-xl text-sm font-medium text-green-700 hover:bg-green-100 transition-all">
            {t.cancel}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">{t.inviteClubTitle}</p>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">{t.emailLabel} *</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoFocus
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all">
          {t.cancel}
        </button>
        <button type="submit" disabled={sending}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all">
          {sending ? t.sending : t.sendInvite}
        </button>
      </div>
    </form>
  )
}

// ─── definitive sub-tab ───────────────────────────────────────────────────────

function DefinitiveSubTab({ lang, competitionId, definitiveEntries, allowedClubs, clubs, entries, ageGroupRules, competitionAgeGroups, onRefresh, onRemoveClubEntries }: {
  lang: Lang
  competitionId: string
  definitiveEntries: DefinitiveEntry[]
  allowedClubs: AllowedClub[]
  clubs: Club[]
  entries: CompetitionEntry[]
  ageGroupRules: AgeGroupRule[]
  competitionAgeGroups: string[]
  onRefresh: () => void
  onRemoveClubEntries: (clubId: string) => void
}) {
  const t = T[lang]
  const supabase = createClient()

  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)
  const [showAddDropdown, setShowAddDropdown]   = useState(false)
  const [showInviteForm, setShowInviteForm]     = useState(false)
  const [addClubId, setAddClubId]               = useState('')
  const [saving, setSaving]                     = useState(false)

  // All clubs fetched from DB (for the "add club" picker)
  const [allClubs, setAllClubs] = useState<Club[]>(clubs)
  useEffect(() => {
    const client = createClient()
    client.from('clubs').select('id, club_name, avatar_url, contact_name, phone')
      .then(({ data }) => { if (data) setAllClubs(data as Club[]) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Build category row labels for displaying teams_per_category
  type CatRow = { ageGroupId: string; ageGroupName: string; age_group: string; category: string }
  const rawRows: CatRow[] = competitionAgeGroups.flatMap(agId => {
    const rule = ageGroupRules.find(r => r.id === agId)
    if (!rule) return []
    return categoriesForRuleset(rule.age_group).map(cat => ({
      ageGroupId: agId, age_group: agId, ageGroupName: rule.age_group, category: cat,
    }))
  })
  const categoryRows = sortByAgeGroupAndCategory(rawRows, ageGroupRules)

  function statusLabel(s: string): string {
    if (s === 'pending')          return t.statusPending
    if (s === 'payment_uploaded') return t.statusPaymentUploaded
    if (s === 'approved')         return t.statusApproved
    if (s === 'rejected')         return t.statusRejected
    return s
  }

  function handleViewPayment(path: string) {
    const { data } = supabase.storage.from('payment-documents').getPublicUrl(path)
    window.open(data.publicUrl, '_blank')
  }

  async function handleApprove(entry: DefinitiveEntry) {
    setSaving(true)
    await supabase.from('definitive_entries').update({ status: 'approved' }).eq('id', entry.id)
    await supabase.from('competition_allowed_clubs').upsert(
      { competition_id: competitionId, club_id: entry.club_id, source: 'definitive_entry' },
      { onConflict: 'competition_id,club_id' }
    )
    onRefresh()
    setSaving(false)
  }

  async function handleReject(entry: DefinitiveEntry) {
    setSaving(true)
    await supabase.from('definitive_entries').update({ status: 'rejected' }).eq('id', entry.id)
    onRefresh()
    setSaving(false)
  }

  async function handleRemoveConfirm(allowedClub: AllowedClub) {
    setSaving(true)
    await supabase.from('competition_allowed_clubs').delete().eq('id', allowedClub.id)
    onRemoveClubEntries(allowedClub.club_id)
    setConfirmRemoveId(null)
    onRefresh()
    setSaving(false)
  }

  async function handleAddManually() {
    if (!addClubId) return
    setSaving(true)
    await supabase.from('competition_allowed_clubs').upsert(
      { competition_id: competitionId, club_id: addClubId, source: 'manual' },
      { onConflict: 'competition_id,club_id' }
    )
    setAddClubId('')
    setShowAddDropdown(false)
    onRefresh()
    setSaving(false)
  }

  const allowedClubIds = new Set(allowedClubs.map(ac => ac.club_id))
  const definitiveClubIds = new Set(definitiveEntries.map(e => e.club_id))
  const eligibleToAdd = allClubs.filter(c => !allowedClubIds.has(c.id))
  const withEntry = eligibleToAdd.filter(c => definitiveClubIds.has(c.id))
  const withoutEntry = eligibleToAdd.filter(c => !definitiveClubIds.has(c.id))

  return (
    <div className="space-y-6">
      {/* ── submissions ────────────────────────────────────────────────────── */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t.subTabs.definitive}</p>
        </div>

        {definitiveEntries.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">{t.noDefinitive}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {definitiveEntries.map(entry => {
              const club = clubs.find(c => c.id === entry.club_id) ?? allClubs.find(c => c.id === entry.club_id)
              const teamTotals = categoryRows
                .map(row => ({ label: `${row.ageGroupName} · ${CATEGORY_LABELS[lang]?.[row.category] ?? row.category}`, count: entry.teams_per_category[`${row.ageGroupId}|${row.category}`] ?? 0 }))
                .filter(r => r.count > 0)
              const canAct = entry.status === 'pending' || entry.status === 'payment_uploaded'

              return (
                <div key={entry.id} className="p-4 space-y-3">
                  {/* club + status row */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {club?.avatar_url
                        ? <img src={club.avatar_url} alt={club.club_name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        : <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 text-sm font-bold flex items-center justify-center shrink-0">{club?.club_name.charAt(0) ?? '?'}</div>
                      }
                      <p className="font-semibold text-slate-800 truncate">{club?.club_name ?? '—'}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_BADGE[entry.status] ?? ''}`}>
                      {statusLabel(entry.status)}
                    </span>
                  </div>

                  {/* contact + judge */}
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                    <span>{t.contact}: <span className="text-slate-700 font-medium">{entry.contact_name}</span>{entry.contact_phone ? ` · ${entry.contact_phone}` : ''}{entry.contact_email ? ` · ${entry.contact_email}` : ''}</span>
                    <span>{t.judgeProvided}: <span className="text-slate-700 font-medium">{entry.judge_name ?? t.noJudge}</span></span>
                    <span>{t.totalAmount}: <span className="text-slate-700 font-semibold">{entry.total_amount.toFixed(2)} €</span></span>
                  </div>

                  {/* teams breakdown */}
                  {teamTotals.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {teamTotals.map(r => (
                        <span key={r.label} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {r.label}: <strong>{r.count}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* actions row */}
                  <div className="flex items-center gap-2">
                    {entry.payment_document_url && (
                      <button
                        onClick={() => handleViewPayment(entry.payment_document_url!)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
                        {t.viewPayment}
                      </button>
                    )}
                    {canAct && (
                      <>
                        <button
                          disabled={saving}
                          onClick={() => handleApprove(entry)}
                          className="text-xs px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all disabled:opacity-40">
                          {t.approve}
                        </button>
                        <button
                          disabled={saving}
                          onClick={() => handleReject(entry)}
                          className="text-xs px-2.5 py-1 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-all disabled:opacity-40">
                          {t.reject}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── allowed clubs ──────────────────────────────────────────────────── */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t.allowedClubs}</p>
          <div className="flex items-center gap-3">
            {!showAddDropdown && !showInviteForm && (
              <>
                <button onClick={() => setShowAddDropdown(true)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  + {t.addManually}
                </button>
                <button onClick={() => setShowInviteForm(true)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
                  {t.inviteNewClub}
                </button>
              </>
            )}
          </div>
        </div>

        {showInviteForm && (
          <div className="p-4">
            <InviteClubForm
              lang={lang}
              competitionId={competitionId}
              onDone={() => setShowInviteForm(false)}
              onCancel={() => setShowInviteForm(false)}
            />
          </div>
        )}

        {showAddDropdown && !showInviteForm && (
          <div className="px-4 py-3 border-b border-slate-100 space-y-3">
            <select
              value={addClubId}
              onChange={e => setAddClubId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.selectClub}</option>
              {withEntry.length > 0 && (
                <optgroup label={t.withDefinitiveEntry}>
                  {withEntry.map(c => <option key={c.id} value={c.id}>{c.club_name}</option>)}
                </optgroup>
              )}
              {withoutEntry.length > 0 && (
                <optgroup label={t.noDefinitiveEntry}>
                  {withoutEntry.map(c => <option key={c.id} value={c.id}>{c.club_name}</option>)}
                </optgroup>
              )}
            </select>
            <div className="flex items-center gap-2">
              <button
                disabled={!addClubId || saving}
                onClick={handleAddManually}
                className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-all">
                {t.add}
              </button>
              <button onClick={() => { setShowAddDropdown(false); setAddClubId('') }}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5 transition-colors">
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {allowedClubs.length === 0 && !showAddDropdown && !showInviteForm ? (
          <p className="text-sm text-slate-400 text-center py-8">{t.noAllowedClubs}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {allowedClubs.map(ac => {
              const club = clubs.find(c => c.id === ac.club_id) ?? allClubs.find(c => c.id === ac.club_id)
              const isConfirming = confirmRemoveId === ac.id

              return (
                <li key={ac.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {club?.avatar_url
                      ? <img src={club.avatar_url} alt={club?.club_name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                      : <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">{club?.club_name.charAt(0) ?? '?'}</div>
                    }
                    <p className="text-sm font-medium text-slate-800 truncate">{club?.club_name ?? '—'}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${ac.source === 'manual' ? 'bg-violet-50 text-violet-600 border-violet-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                      {ac.source === 'manual' ? t.sourceManual : t.sourceAuto}
                    </span>
                  </div>

                  {isConfirming ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-xs text-red-500">{t.confirmRemoveSimple(club?.club_name ?? '?')}</p>
                      <button disabled={saving} onClick={() => handleRemoveConfirm(ac)}
                        className="text-xs font-semibold px-2.5 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-40 transition-all">
                        {t.confirm}
                      </button>
                      <button onClick={() => setConfirmRemoveId(null)}
                        className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 transition-colors">
                        {t.cancel}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmRemoveId(ac.id)}
                      className="shrink-0 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-lg border border-transparent hover:border-red-100 transition-all">
                      {t.removeAllowed}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

// ─── nominative view helpers ──────────────────────────────────────────────────

type GroupItem = { entry: CompetitionEntry; team: Team; club: Club | undefined; missingLicencia: boolean; missingTS: boolean; missingMusic: boolean }

function RegistrationGroup({ age_group, category, items, lang, agLabels, open, onToggle, onToggleDropout, musicUnlockByTeam, onToggleMusicUnlock }: {
  age_group: string
  category: string
  items: GroupItem[]
  lang: Lang
  agLabels: Record<string, string>
  open: boolean
  onToggle: () => void
  onToggleDropout: (entryId: string) => void
  musicUnlockByTeam: Record<string, boolean>
  onToggleMusicUnlock: (teamId: string, enabled: boolean) => Promise<void> | void
}) {
  const t = T[lang]
  const activeCount = items.filter((i) => !i.entry.dropped_out).length
  const dropoutCount = items.filter((i) => i.entry.dropped_out).length

  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center gap-3 mb-3 text-left group">
        <svg
          className={['w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform', open ? 'rotate-90' : ''].join(' ')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <h3 className="text-sm font-semibold text-slate-700">
          {agLabels[age_group] ?? age_group} · {categoryLabel(category, lang)}
        </h3>
        <span className="text-xs text-slate-400">{t.registered(activeCount)}</span>
        {dropoutCount > 0 && (
          <span className="text-xs text-red-400">· {dropoutCount === 1 ? t.dropout(1) : t.dropouts(dropoutCount)}</span>
        )}
      </button>

      {open && <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
        {items.map(({ entry, team, club, missingLicencia, missingTS, missingMusic }) => (
          <div key={entry.id} className={['flex items-center gap-3 px-4 py-3 transition-colors', entry.dropped_out ? 'bg-slate-50' : 'bg-white'].join(' ')}>
            <div className={['relative shrink-0', entry.dropped_out ? 'opacity-40' : ''].join(' ')}>
              <TeamAvatar team={team} />
              <div className="absolute -bottom-1 -right-1"><ClubAvatar club={club} /></div>
            </div>

            {entry.dorsal != null && (
              <span className={['text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
                entry.dropped_out ? 'bg-slate-100 text-slate-300' : 'bg-slate-800 text-white'].join(' ')}>
                #{entry.dorsal}
              </span>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={['text-sm font-medium text-slate-800 truncate', entry.dropped_out ? 'line-through text-slate-400' : ''].join(' ')}>
                  {team.gymnast_display}
                </p>
                {missingLicencia && (
                  <span title={t.licenciaWarningFull} className="text-xs font-semibold px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full shrink-0">
                    ⚠ {t.licenciaWarning}
                  </span>
                )}
                {missingTS && (
                  <span title={t.tsWarningFull} className="text-xs font-semibold px-1.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full shrink-0">
                    ⚠ {t.tsWarning}
                  </span>
                )}
                {missingMusic && (
                  <span title={t.musicWarningFull} className="text-xs font-semibold px-1.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-full shrink-0">
                    ⚠ {t.musicWarning}
                  </span>
                )}
              </div>
              <p className={['text-xs truncate', entry.dropped_out ? 'text-slate-300' : 'text-slate-400'].join(' ')}>
                {club?.club_name ?? '—'}
              </p>
            </div>

            {entry.dropped_out && (
              <span className="text-xs font-semibold text-red-400 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full shrink-0">
                {t.baja}
              </span>
            )}

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => void onToggleMusicUnlock(team.id, !musicUnlockByTeam[team.id])}
                className={[
                  'text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all',
                  musicUnlockByTeam[team.id]
                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    : 'border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100',
                ].join(' ')}
              >
                {musicUnlockByTeam[team.id] ? t.closeMusicReopen : t.reopenMusic}
              </button>
              <button
                onClick={() => onToggleDropout(entry.id)}
                className={['text-xs font-medium px-3 py-1.5 rounded-lg border transition-all',
                  entry.dropped_out ? 'border-slate-200 text-slate-500 hover:bg-white' : 'border-red-100 text-red-500 hover:bg-red-50'].join(' ')}
              >
                {entry.dropped_out ? t.undoDropout : t.markDropout}
              </button>
            </div>
          </div>
        ))}
      </div>}
    </div>
  )
}

// ─── status → default sub-tab ─────────────────────────────────────────────────

function defaultSubTab(status: CompetitionStatus): SubTab {
  if (status === 'provisional_entry') return 'provisional'
  if (status === 'definitive_entry')  return 'definitive'
  return 'nominative'
}

// ─── main component ───────────────────────────────────────────────────────────

export type RegistrationsTabProps = {
  lang: Lang
  globalTeams: Team[]
  clubs: Club[]
  gymnasts: Gymnast[]
  entries: CompetitionEntry[]
  agLabels: Record<string, string>
  onToggleDropout: (entryId: string) => void
  onRemoveClubEntries?: (clubId: string) => void
  competitionId: string
  ageGroupRules: AgeGroupRule[]
  competitionAgeGroups: string[]
  competitionYear: number
  competitionStatus: CompetitionStatus
}

type SubTab = 'provisional' | 'definitive' | 'nominative'

export default function RegistrationsTab({
  lang, globalTeams, clubs, gymnasts, entries, agLabels, onToggleDropout, onRemoveClubEntries,
  competitionId, ageGroupRules, competitionAgeGroups, competitionYear, competitionStatus,
}: RegistrationsTabProps) {
  const t = T[lang]
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(() => defaultSubTab(competitionStatus))
  const [showImport, setShowImport] = useState(false)

  // ── nominative state ────────────────────────────────────────────────────────
  const [openLevels,  setOpenLevels]  = useState<Set<string>>(new Set())
  const [openGroups,  setOpenGroups]  = useState<Set<string>>(new Set())
  const [routineMusic, setRoutineMusic] = useState<Array<{ team_id: string; music_path: string | null; ts_path: string | null }>>([])
  const [musicUnlockByTeam, setMusicUnlockByTeam] = useState<Record<string, boolean>>({})

  // ── provisional / definitive / allowed clubs state ──────────────────────────
  const [provisionalEntries, setProvisionalEntries] = useState<ProvisionalEntry[]>([])
  const [definitiveEntries,  setDefinitiveEntries]  = useState<DefinitiveEntry[]>([])
  const [allowedClubs,       setAllowedClubs]       = useState<AllowedClub[]>([])
  // extra clubs from provisional/definitive entries that aren't in the `clubs` prop
  const [extraClubs, setExtraClubs] = useState<Club[]>([])

  useEffect(() => {
    const teamIds = entries.map(e => e.team_id)
    if (teamIds.length === 0) return
    const supabase = createClient()
    supabase
      .from('routine_music')
      .select('team_id, music_path, ts_path')
      .eq('competition_id', competitionId)
      .in('team_id', teamIds)
      .then(({ data }) => { if (data) setRoutineMusic(data) })
    supabase
      .from('competition_music_unlocks')
      .select('team_id, enabled')
      .eq('competition_id', competitionId)
      .in('team_id', teamIds)
      .then(({ data }) => {
        const map: Record<string, boolean> = {}
        for (const row of data ?? []) map[row.team_id] = !!row.enabled
        setMusicUnlockByTeam(map)
      })
  }, [competitionId, entries])

  async function toggleMusicUnlock(teamId: string, enabled: boolean) {
    const supabase = createClient()
    if (enabled) {
      await supabase
        .from('competition_music_unlocks')
        .upsert({ competition_id: competitionId, team_id: teamId, enabled: true }, { onConflict: 'competition_id,team_id' })
      setMusicUnlockByTeam((prev) => ({ ...prev, [teamId]: true }))
    } else {
      await supabase
        .from('competition_music_unlocks')
        .delete()
        .eq('competition_id', competitionId)
        .eq('team_id', teamId)
      setMusicUnlockByTeam((prev) => ({ ...prev, [teamId]: false }))
    }
  }

  async function fetchEntryData() {
    const supabase = createClient()
    const [provRes, defRes, allowedRes] = await Promise.all([
      supabase.from('provisional_entries').select('id,club_id,teams_per_category,created_at').eq('competition_id', competitionId),
      supabase.from('definitive_entries').select('id,club_id,contact_name,contact_phone,contact_email,teams_per_category,judge_name,total_amount,status,payment_document_url,admin_notes,created_at').eq('competition_id', competitionId),
      supabase.from('competition_allowed_clubs').select('id,club_id,source,created_at').eq('competition_id', competitionId),
    ])
    if (provRes.data)    setProvisionalEntries(provRes.data as ProvisionalEntry[])
    if (defRes.data)     setDefinitiveEntries(defRes.data as DefinitiveEntry[])
    if (allowedRes.data) setAllowedClubs(allowedRes.data as AllowedClub[])

    // Fetch any clubs from entry data not already in the clubs prop
    const allEntryClubIds = [
      ...(provRes.data ?? []).map(e => e.club_id),
      ...(defRes.data ?? []).map(e => e.club_id),
      ...(allowedRes.data ?? []).map(ac => ac.club_id),
    ]
    const knownIds = new Set(clubs.map(c => c.id))
    const missingIds = [...new Set(allEntryClubIds)].filter(id => !knownIds.has(id))
    if (missingIds.length > 0) {
      const { data: extra } = await supabase.from('clubs').select('id,club_name,avatar_url,contact_name,phone').in('id', missingIds)
      if (extra) setExtraClubs(extra as Club[])
    }
  }

  useEffect(() => { fetchEntryData() }, [competitionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const allClubs = [...clubs, ...extraClubs]

  // ── import screen ────────────────────────────────────────────────────────────
  if (showImport) {
    return (
      <div>
        <button onClick={() => setShowImport(false)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-5 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t.backToList}
        </button>
        <ImportTab
          lang={lang}
          competitionId={competitionId}
          ageGroupRules={ageGroupRules}
          competitionAgeGroups={competitionAgeGroups}
          competitionYear={competitionYear}
        />
      </div>
    )
  }

  // ── sub-tab bar ───────────────────────────────────────────────────────────────
  const SUB_TABS: { key: SubTab; label: string }[] = [
    { key: 'provisional', label: t.subTabs.provisional },
    { key: 'definitive',  label: t.subTabs.definitive  },
    { key: 'nominative',  label: t.subTabs.nominative  },
  ]

  return (
    <div>
      {/* sub-tab bar */}
      <div className="flex border-b border-slate-200 mb-5 gap-0">
        {SUB_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveSubTab(key)}
            className={[
              'px-4 py-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
              activeSubTab === key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* provisional */}
      {activeSubTab === 'provisional' && (
        <ProvisionalSubTab
          lang={lang}
          provisionalEntries={provisionalEntries}
          clubs={allClubs}
          ageGroupRules={ageGroupRules}
          competitionAgeGroups={competitionAgeGroups}
        />
      )}

      {/* definitive */}
      {activeSubTab === 'definitive' && (
        <DefinitiveSubTab
          lang={lang}
          competitionId={competitionId}
          definitiveEntries={definitiveEntries}
          allowedClubs={allowedClubs}
          clubs={allClubs}
          entries={entries}
          ageGroupRules={ageGroupRules}
          competitionAgeGroups={competitionAgeGroups}
          onRefresh={fetchEntryData}
          onRemoveClubEntries={onRemoveClubEntries ?? (() => {})}
        />
      )}

      {/* nominative */}
      {activeSubTab === 'nominative' && (
        <NominativeView
          lang={lang}
          globalTeams={globalTeams}
          clubs={clubs}
          gymnasts={gymnasts}
          entries={entries}
          agLabels={agLabels}
          onToggleDropout={onToggleDropout}
          ageGroupRules={ageGroupRules}
          routineMusic={routineMusic}
          openLevels={openLevels}
          openGroups={openGroups}
          setOpenLevels={setOpenLevels}
          setOpenGroups={setOpenGroups}
          musicUnlockByTeam={musicUnlockByTeam}
          onToggleMusicUnlock={toggleMusicUnlock}
          onShowImport={() => setShowImport(true)}
          competitionId={competitionId}
          competitionAgeGroups={competitionAgeGroups}
          competitionYear={competitionYear}
        />
      )}
    </div>
  )
}

// ─── nominative view (extracted) ─────────────────────────────────────────────

function NominativeView({ lang, globalTeams, clubs, gymnasts, entries, agLabels, onToggleDropout, ageGroupRules, routineMusic, openLevels, openGroups, setOpenLevels, setOpenGroups, musicUnlockByTeam, onToggleMusicUnlock, onShowImport }: {
  lang: Lang
  globalTeams: Team[]
  clubs: Club[]
  gymnasts: Gymnast[]
  entries: CompetitionEntry[]
  agLabels: Record<string, string>
  onToggleDropout: (entryId: string) => void
  ageGroupRules: AgeGroupRule[]
  routineMusic: Array<{ team_id: string; music_path: string | null; ts_path: string | null }>
  openLevels: Set<string>
  openGroups: Set<string>
  setOpenLevels: React.Dispatch<React.SetStateAction<Set<string>>>
  setOpenGroups: React.Dispatch<React.SetStateAction<Set<string>>>
  musicUnlockByTeam: Record<string, boolean>
  onToggleMusicUnlock: (teamId: string, enabled: boolean) => Promise<void> | void
  onShowImport: () => void
  competitionId: string
  competitionAgeGroups: string[]
  competitionYear: number
}) {
  const t = T[lang]

  type Group = { age_group: string; category: string; items: GroupItem[] }
  const groupMap = new Map<string, Group>()

  for (const entry of entries) {
    const team = globalTeams.find((tm) => tm.id === entry.team_id)
    if (!team) continue
    const club = clubs.find((c) => c.id === team.club_id)
    const missingLicencia = (team.gymnast_ids ?? []).some((gid) => !gymnasts.find((g) => g.id === gid)?.licencia_url)
    const music = routineMusic.find((m) => m.team_id === team.id)
    const missingTS = !music?.ts_path
    const missingMusic = !music?.music_path
    const key = `${team.age_group}||${team.category}`
    if (!groupMap.has(key)) groupMap.set(key, { age_group: team.age_group, category: team.category, items: [] })
    groupMap.get(key)!.items.push({ entry, team, club, missingLicencia, missingTS, missingMusic })
  }

  const groups = sortByAgeGroupAndCategory([...groupMap.values()], ageGroupRules)
  const byLevel = new Map<Level, Group[]>()
  for (const g of groups) {
    const level = getLevel(g.age_group, ageGroupRules)
    if (!byLevel.has(level)) byLevel.set(level, [])
    byLevel.get(level)!.push(g)
  }
  const presentLevels = LEVEL_ORDER.filter(l => byLevel.has(l))
  const allGroupKeys = groups.map(g => `${g.age_group}||${g.category}`)

  const isLevelOpen = (level: string) => openLevels.size === 0 || openLevels.has(level)
  const toggleLevel = (level: string) => {
    setOpenLevels(prev => {
      const next = prev.size === 0 ? new Set<string>(presentLevels) : new Set(prev)
      if (next.has(level)) next.delete(level); else next.add(level)
      return next
    })
  }
  const isGroupOpen = (key: string) => openGroups.size === 0 || openGroups.has(key)
  const toggleGroup = (key: string) => {
    setOpenGroups(prev => {
      const next = prev.size === 0 ? new Set(allGroupKeys) : new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }
  const expandAll   = () => { setOpenLevels(new Set()); setOpenGroups(new Set()) }
  const collapseAll = () => { setOpenLevels(new Set(['__none__'])); setOpenGroups(new Set(['__none__'])) }

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-5">
        {entries.length > 0 && (
          <>
            <button onClick={expandAll} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">{t.expandAll}</button>
            <span className="text-slate-200">|</span>
            <button onClick={collapseAll} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">{t.collapseAll}</button>
          </>
        )}
        <button onClick={onShowImport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {t.import}
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-12 border border-dashed border-slate-200 rounded-xl">{t.noRegistrations}</p>
      ) : (
        <div className="space-y-4">
          {presentLevels.map(level => {
            const levelGroups = byLevel.get(level)!
            const levelOpen = isLevelOpen(level)
            const totalActive = levelGroups.reduce((sum, g) => sum + g.items.filter(i => !i.entry.dropped_out).length, 0)
            return (
              <div key={level} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleLevel(level)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                >
                  <svg
                    className={['w-4 h-4 text-slate-400 shrink-0 transition-transform', levelOpen ? 'rotate-90' : ''].join(' ')}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  <span className="text-sm font-bold text-slate-700">{level}</span>
                  <span className="text-xs text-slate-400">{t.registered(totalActive)}</span>
                </button>

                {levelOpen && (
                  <div className="px-5 py-4 space-y-6">
                    {levelGroups.map(g => {
                      const key = `${g.age_group}||${g.category}`
                      return (
                        <RegistrationGroup
                          key={key}
                          age_group={g.age_group}
                          category={g.category}
                          items={g.items}
                          lang={lang}
                          agLabels={agLabels}
                          open={isGroupOpen(key)}
                          onToggle={() => toggleGroup(key)}
                          onToggleDropout={onToggleDropout}
                          musicUnlockByTeam={musicUnlockByTeam}
                          onToggleMusicUnlock={onToggleMusicUnlock}
                        />
                      )
                    })}
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
