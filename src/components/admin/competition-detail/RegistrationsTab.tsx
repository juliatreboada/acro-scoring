'use client'

import { useState, useEffect } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Team, Club, Gymnast, CompetitionEntry, AgeGroupRule } from '@/components/admin/types'
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
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    // sub-tabs
    subTabs: { provisional: 'Provisional', definitive: 'Definitive', nominative: 'Nominative' },
    // provisional sub-tab
    noProvisional: 'No provisional entries yet.',
    total: 'Total',
    teams: 'Teams',
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
    expandAll: 'Expandir todo',
    collapseAll: 'Contraer todo',
    // sub-tabs
    subTabs: { provisional: 'Provisional', definitive: 'Definitiva', nominative: 'Nominativa' },
    // provisional sub-tab
    noProvisional: 'Sin inscripciones provisionales todavía.',
    total: 'Total',
    teams: 'Equipos',
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

// ─── provisional sub-tab ──────────────────────────────────────────────────────

function ProvisionalSubTab({ lang, provisionalEntries, clubs, ageGroupRules, competitionAgeGroups }: {
  lang: Lang
  provisionalEntries: ProvisionalEntry[]
  clubs: Club[]
  ageGroupRules: AgeGroupRule[]
  competitionAgeGroups: string[]
}) {
  const t = T[lang]

  if (provisionalEntries.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-12 border border-dashed border-slate-200 rounded-xl">{t.noProvisional}</p>
  }

  // Build category rows ordered by sort_order
  type CatRow = { ageGroupId: string; ageGroupName: string; age_group: string; category: string }
  const rawRows: CatRow[] = competitionAgeGroups.flatMap(agId => {
    const rule = ageGroupRules.find(r => r.id === agId)
    if (!rule) return []
    return categoriesForRuleset(rule.age_group).map(cat => ({
      ageGroupId: agId,
      age_group: agId,
      ageGroupName: rule.age_group,
      category: cat,
    }))
  })
  const rows = sortByAgeGroupAndCategory(rawRows, ageGroupRules)

  // Clubs that submitted (preserve submission order)
  const submittedClubIds = provisionalEntries.map(e => e.club_id)
  const submittedClubs = submittedClubIds.map(cid => clubs.find(c => c.id === cid)).filter(Boolean) as Club[]

  function getCount(entry: ProvisionalEntry, agId: string, cat: string): number {
    return entry.teams_per_category[`${agId}|${cat}`] ?? 0
  }

  function rowTotal(agId: string, cat: string): number {
    return provisionalEntries.reduce((s, e) => s + getCount(e, agId, cat), 0)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2.5 pr-4 text-xs font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">{t.teams}</th>
            {submittedClubs.map(c => (
              <th key={c.id} className="text-center py-2.5 px-3 text-xs font-semibold text-slate-700 whitespace-nowrap max-w-[120px]">
                <div className="flex flex-col items-center gap-1">
                  {c.avatar_url
                    ? <img src={c.avatar_url} alt={c.club_name} className="w-6 h-6 rounded-full object-cover" />
                    : <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold flex items-center justify-center">{c.club_name.charAt(0)}</div>
                  }
                  <span className="truncate max-w-[90px]">{c.club_name}</span>
                </div>
              </th>
            ))}
            <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-400 whitespace-nowrap">{t.total}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const total = rowTotal(row.ageGroupId, row.category)
            return (
              <tr key={`${row.ageGroupId}|${row.category}`} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-2.5 pr-4 text-slate-700 whitespace-nowrap">
                  <span className="font-medium">{row.ageGroupName}</span>
                  <span className="text-slate-400 ml-1.5">· {CATEGORY_LABELS[lang]?.[row.category] ?? row.category}</span>
                </td>
                {provisionalEntries.map(entry => {
                  const count = getCount(entry, row.ageGroupId, row.category)
                  return (
                    <td key={entry.id} className="text-center py-2.5 px-3">
                      <span className={count > 0 ? 'font-semibold text-slate-800' : 'text-slate-300'}>
                        {count > 0 ? count : '—'}
                      </span>
                    </td>
                  )
                })}
                <td className="text-center py-2.5 px-3 font-bold text-slate-700">
                  {total > 0 ? total : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-200 bg-slate-50">
            <td className="py-2.5 pr-4 text-xs font-bold text-slate-500 uppercase tracking-wide">{t.total}</td>
            {provisionalEntries.map(entry => {
              const total = Object.values(entry.teams_per_category).reduce((s, n) => s + n, 0)
              return (
                <td key={entry.id} className="text-center py-2.5 px-3 font-bold text-slate-700">{total > 0 ? total : '—'}</td>
              )
            })}
            <td className="text-center py-2.5 px-3 font-bold text-slate-800">
              {provisionalEntries.reduce((s, e) => s + Object.values(e.teams_per_category).reduce((ss, n) => ss + n, 0), 0)}
            </td>
          </tr>
        </tfoot>
      </table>
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
  const [addClubId, setAddClubId]               = useState('')
  const [saving, setSaving]                     = useState(false)

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
    // also delete their competition_entries
    const clubTeamIds = entries
      .map(e => ({ entryId: e.id, teamId: e.team_id }))
      .filter(({ teamId }) => {
        // we can't easily look up team→club here without globalTeams, so we rely on the parent callback
        return true
      })
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
  const eligibleToAdd = clubs.filter(c => !allowedClubIds.has(c.id))

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
              const club = clubs.find(c => c.id === entry.club_id)
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
                      <a href={entry.payment_document_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
                        {t.viewPayment}
                      </a>
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
          {!showAddDropdown && (
            <button onClick={() => setShowAddDropdown(true)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
              + {t.addManually}
            </button>
          )}
        </div>

        {showAddDropdown && (
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <select
              value={addClubId}
              onChange={e => setAddClubId(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.selectClub}</option>
              {eligibleToAdd.map(c => <option key={c.id} value={c.id}>{c.club_name}</option>)}
            </select>
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
        )}

        {allowedClubs.length === 0 && !showAddDropdown ? (
          <p className="text-sm text-slate-400 text-center py-8">{t.noAllowedClubs}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {allowedClubs.map(ac => {
              const club = clubs.find(c => c.id === ac.club_id)
              const teamCount = entries.filter(e => {
                // note: this only counts entries that are in scope — parent passes all entries for this competition
                return true // we'll pass globalTeams separately below
              }).length
              // actual count requires globalTeams — we receive entries already filtered by competition via parent
              // club_id match done via onRemoveClubEntries callback in parent
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

function RegistrationGroup({ age_group, category, items, lang, agLabels, open, onToggle, onToggleDropout }: {
  age_group: string
  category: string
  items: GroupItem[]
  lang: Lang
  agLabels: Record<string, string>
  open: boolean
  onToggle: () => void
  onToggleDropout: (entryId: string) => void
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

            <button
              onClick={() => onToggleDropout(entry.id)}
              className={['shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all',
                entry.dropped_out ? 'border-slate-200 text-slate-500 hover:bg-white' : 'border-red-100 text-red-500 hover:bg-red-50'].join(' ')}
            >
              {entry.dropped_out ? t.undoDropout : t.markDropout}
            </button>
          </div>
        ))}
      </div>}
    </div>
  )
}

type Level = 'Escolar' | 'Base' | 'Nacional'
const LEVEL_ORDER: Level[] = ['Escolar', 'Base', 'Nacional']

function getLevel(ageGroupId: string, rules: AgeGroupRule[]): Level {
  const ag = rules.find(r => r.id === ageGroupId)?.age_group ?? ''
  if (ag.includes('Escolar')) return 'Escolar'
  if (ag.includes('Base'))    return 'Base'
  return 'Nacional'
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
}

type SubTab = 'provisional' | 'definitive' | 'nominative'

export default function RegistrationsTab({
  lang, globalTeams, clubs, gymnasts, entries, agLabels, onToggleDropout, onRemoveClubEntries,
  competitionId, ageGroupRules, competitionAgeGroups, competitionYear,
}: RegistrationsTabProps) {
  const t = T[lang]
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('nominative')
  const [showImport, setShowImport] = useState(false)

  // ── nominative state ────────────────────────────────────────────────────────
  const [openLevels,  setOpenLevels]  = useState<Set<string>>(new Set())
  const [openGroups,  setOpenGroups]  = useState<Set<string>>(new Set())
  const [routineMusic, setRoutineMusic] = useState<Array<{ team_id: string; music_path: string | null; ts_path: string | null }>>([])

  // ── provisional / definitive / allowed clubs state ──────────────────────────
  const [provisionalEntries, setProvisionalEntries] = useState<ProvisionalEntry[]>([])
  const [definitiveEntries,  setDefinitiveEntries]  = useState<DefinitiveEntry[]>([])
  const [allowedClubs,       setAllowedClubs]       = useState<AllowedClub[]>([])

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
  }, [competitionId, entries])

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
  }

  useEffect(() => { fetchEntryData() }, [competitionId]) // eslint-disable-line react-hooks/exhaustive-deps

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
          clubs={clubs}
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
          clubs={clubs}
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

function NominativeView({ lang, globalTeams, clubs, gymnasts, entries, agLabels, onToggleDropout, ageGroupRules, routineMusic, openLevels, openGroups, setOpenLevels, setOpenGroups, onShowImport }: {
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
