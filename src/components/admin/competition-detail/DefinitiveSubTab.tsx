'use client'

import { useState, useEffect } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { DefinitiveEntry, Club, CompetitionEntry, AgeGroupRule } from '@/components/admin/types'
import { categoriesForRuleset, sortByAgeGroupAndCategory, CATEGORY_LABELS } from '@/components/admin/types'
import { createClient } from '@/lib/supabase'

const T = {
  en: {
    subTabs: { definitive: 'Definitive' },
    noDefinitive: 'No definitive entries yet.',
    contact: 'Contact',
    judgeProvided: 'Judge',
    noJudge: 'No judge',
    totalAmount: 'Total',
    viewPayment: 'View payment',
    statusPending: 'Pending',
    statusPaymentUploaded: 'Payment uploaded',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    approve: 'Approve',
    reject: 'Reject',
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
    subTabs: { definitive: 'Definitiva' },
    noDefinitive: 'Sin inscripciones definitivas todavía.',
    contact: 'Contacto',
    judgeProvided: 'Juez',
    noJudge: 'Sin juez',
    totalAmount: 'Total',
    viewPayment: 'Ver pago',
    statusPending: 'Pendiente',
    statusPaymentUploaded: 'Pago subido',
    statusApproved: 'Aprobado',
    statusRejected: 'Rechazado',
    approve: 'Aprobar',
    reject: 'Rechazar',
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

export type AllowedClub = {
  id: string
  club_id: string
  source: 'definitive_entry' | 'manual'
  created_at: string
}

const STATUS_BADGE: Record<string, string> = {
  pending:          'bg-amber-50 text-amber-700 border-amber-200',
  payment_uploaded: 'bg-blue-50 text-blue-700 border-blue-200',
  approved:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:         'bg-red-50 text-red-500 border-red-200',
}

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

export function DefinitiveSubTab({ lang, competitionId, definitiveEntries, allowedClubs, clubs, entries, ageGroupRules, competitionAgeGroups, onRefresh, onUpdateEntry, onRemoveClubEntries }: {
  lang: Lang
  competitionId: string
  definitiveEntries: DefinitiveEntry[]
  allowedClubs: AllowedClub[]
  clubs: Club[]
  entries: CompetitionEntry[]
  ageGroupRules: AgeGroupRule[]
  competitionAgeGroups: string[]
  onRefresh: () => void
  onUpdateEntry: (entry: DefinitiveEntry) => void
  onRemoveClubEntries: (clubId: string) => void
}) {
  const t = T[lang]
  const supabase = createClient()

  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)
  const [showAddDropdown, setShowAddDropdown]   = useState(false)
  const [showInviteForm, setShowInviteForm]     = useState(false)
  const [addClubId, setAddClubId]               = useState('')
  const [saving, setSaving]                     = useState(false)

  const [allClubs, setAllClubs] = useState<Club[]>(clubs)
  useEffect(() => {
    const client = createClient()
    client.from('clubs').select('id, club_name, avatar_url, contact_name, phone')
      .then(({ data }) => { if (data) setAllClubs(data as Club[]) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
    onUpdateEntry({ ...entry, status: 'approved' })
    onRefresh()
    setSaving(false)
  }

  async function handleReject(entry: DefinitiveEntry) {
    setSaving(true)
    await supabase.from('definitive_entries').update({ status: 'rejected' }).eq('id', entry.id)
    onUpdateEntry({ ...entry, status: 'rejected' })
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

                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                    <span>{t.contact}: <span className="text-slate-700 font-medium">{entry.contact_name}</span>{entry.contact_phone ? ` · ${entry.contact_phone}` : ''}{entry.contact_email ? ` · ${entry.contact_email}` : ''}</span>
                    <span>{t.judgeProvided}: <span className="text-slate-700 font-medium">{entry.judge_name ?? t.noJudge}</span></span>
                    <span>{t.totalAmount}: <span className="text-slate-700 font-semibold">{entry.total_amount.toFixed(2)} €</span></span>
                  </div>

                  {teamTotals.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {teamTotals.map(r => (
                        <span key={r.label} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {r.label}: <strong>{r.count}</strong>
                        </span>
                      ))}
                    </div>
                  )}

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
