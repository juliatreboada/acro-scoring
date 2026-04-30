'use client'

import { useState, useEffect } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Team, Club, CompetitionEntry, Gymnast, Coach, AgeGroupRule } from '@/components/admin/types'
import { categoryLabel, sortByAgeGroupAndCategory } from '@/components/admin/types'
import { createClient } from '@/lib/supabase'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    title: 'Licencias',
    noEntries: 'No registered teams.',
    noLicencia: 'No licencia',
    viewLicencia: 'View licencia',
    viewPhoto: 'View photo',
    downloadAll: 'Download all',
    droppedOut: 'Dropped out',
    noGymnasts: 'No gymnasts linked',
    coaches: 'Coaches',
    gymnasts: 'Gymnasts',
    subTabs: { provisional: 'Provisional', definitive: 'Definitive', nominative: 'Nominative' },
    // provisional
    noProvisional: 'No provisional entries yet.',
    totalTeams: 'estimated teams',
    // definitive
    noDefinitive: 'No definitive entries yet.',
    contact: 'Contact',
    totalAmount: 'Total',
    judgeProvided: 'Judge',
    noJudge: 'No judge',
    statusPending: 'Pending',
    statusPaymentUploaded: 'Payment uploaded',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    viewPayment: 'View payment',
  },
  es: {
    title: 'Licencias',
    noEntries: 'No hay equipos inscritos.',
    noLicencia: 'Sin licencia',
    viewLicencia: 'Ver licencia',
    viewPhoto: 'Ver foto',
    downloadAll: 'Descargar todo',
    droppedOut: 'Retirado',
    noGymnasts: 'Sin gimnastas vinculados',
    coaches: 'Entrenadores',
    gymnasts: 'Gimnastas',
    subTabs: { provisional: 'Provisional', definitive: 'Definitiva', nominative: 'Nominativa' },
    // provisional
    noProvisional: 'Sin inscripciones provisionales todavía.',
    totalTeams: 'equipos estimados',
    // definitive
    noDefinitive: 'Sin inscripciones definitivas todavía.',
    contact: 'Contacto',
    totalAmount: 'Total',
    judgeProvided: 'Juez',
    noJudge: 'Sin juez',
    statusPending: 'Pendiente',
    statusPaymentUploaded: 'Pago subido',
    statusApproved: 'Aprobado',
    statusRejected: 'Rechazado',
    viewPayment: 'Ver pago',
  },
}

const DEF_STATUS_BADGE: Record<string, string> = {
  pending:          'bg-amber-50 text-amber-700 border-amber-200',
  payment_uploaded: 'bg-blue-50 text-blue-700 border-blue-200',
  approved:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:         'bg-red-50 text-red-500 border-red-200',
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
  judge_name: string | null
  total_amount: number
  status: string
  payment_document_url: string | null
  created_at: string
}

// ─── props ────────────────────────────────────────────────────────────────────

type Props = {
  lang: Lang
  competitionId: string
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  competitionGymnasts: Gymnast[]
  competitionCoaches: Coach[]
  globalCoaches: Coach[]
  ageGroupRules: AgeGroupRule[]
}

type SubTab = 'provisional' | 'definitive' | 'nominative'

// ─── component ────────────────────────────────────────────────────────────────

export default function LicenciasTab({ lang, competitionId, globalTeams, clubs, entries, competitionGymnasts, competitionCoaches, globalCoaches, ageGroupRules }: Props) {
  const t = T[lang]
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('nominative')
  const [provisionalEntries, setProvisionalEntries] = useState<ProvisionalEntry[]>([])
  const [definitiveEntries,  setDefinitiveEntries]  = useState<DefinitiveEntry[]>([])

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('provisional_entries').select('id,club_id,teams_per_category,created_at').eq('competition_id', competitionId),
      supabase.from('definitive_entries').select('id,club_id,contact_name,contact_phone,contact_email,judge_name,total_amount,status,payment_document_url,created_at').eq('competition_id', competitionId),
    ]).then(([provRes, defRes]) => {
      if (provRes.data)  setProvisionalEntries(provRes.data as ProvisionalEntry[])
      if (defRes.data)   setDefinitiveEntries(defRes.data as DefinitiveEntry[])
    })
  }, [competitionId])

  const SUB_TABS: { key: SubTab; label: string }[] = [
    { key: 'provisional', label: t.subTabs.provisional },
    { key: 'definitive',  label: t.subTabs.definitive  },
    { key: 'nominative',  label: t.subTabs.nominative  },
  ]

  function statusLabel(s: string): string {
    if (s === 'pending')          return t.statusPending
    if (s === 'payment_uploaded') return t.statusPaymentUploaded
    if (s === 'approved')         return t.statusApproved
    if (s === 'rejected')         return t.statusRejected
    return s
  }

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

      {/* provisional sub-tab */}
      {activeSubTab === 'provisional' && (
        provisionalEntries.length === 0
          ? <p className="text-sm text-slate-400 text-center py-12 border border-dashed border-slate-200 rounded-xl">{t.noProvisional}</p>
          : (
            <div className="space-y-3">
              {provisionalEntries.map(pe => {
                const club = clubs.find(c => c.id === pe.club_id)
                const total = Object.values(pe.teams_per_category).reduce((s, n) => s + n, 0)
                return (
                  <div key={pe.id} className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl bg-white">
                    {club?.avatar_url
                      ? <img src={club.avatar_url} alt={club.club_name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      : <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 text-sm font-bold flex items-center justify-center shrink-0">{club?.club_name.charAt(0) ?? '?'}</div>
                    }
                    <p className="flex-1 font-semibold text-slate-800 truncate">{club?.club_name ?? '—'}</p>
                    <span className="text-sm font-semibold text-slate-700">{total}</span>
                    <span className="text-xs text-slate-400">{t.totalTeams}</span>
                  </div>
                )
              })}
            </div>
          )
      )}

      {/* definitive sub-tab */}
      {activeSubTab === 'definitive' && (
        definitiveEntries.length === 0
          ? <p className="text-sm text-slate-400 text-center py-12 border border-dashed border-slate-200 rounded-xl">{t.noDefinitive}</p>
          : (
            <div className="space-y-3">
              {definitiveEntries.map(de => {
                const club = clubs.find(c => c.id === de.club_id)
                return (
                  <div key={de.id} className="border border-slate-200 rounded-2xl bg-white overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                      {club?.avatar_url
                        ? <img src={club.avatar_url} alt={club.club_name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        : <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 text-sm font-bold flex items-center justify-center shrink-0">{club?.club_name.charAt(0) ?? '?'}</div>
                      }
                      <p className="flex-1 font-semibold text-slate-800 truncate">{club?.club_name ?? '—'}</p>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${DEF_STATUS_BADGE[de.status] ?? ''}`}>
                        {statusLabel(de.status)}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                      <span>{t.contact}: <span className="text-slate-700 font-medium">{de.contact_name}</span>{de.contact_phone ? ` · ${de.contact_phone}` : ''}{de.contact_email ? ` · ${de.contact_email}` : ''}</span>
                      <span>{t.judgeProvided}: <span className="text-slate-700 font-medium">{de.judge_name ?? t.noJudge}</span></span>
                      <span>{t.totalAmount}: <span className="font-semibold text-slate-700">{de.total_amount.toFixed(2)} €</span></span>
                      {de.payment_document_url && (
                        <a href={de.payment_document_url} target="_blank" rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium">
                          {t.viewPayment}
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
      )}

      {/* nominative sub-tab — existing content */}
      {activeSubTab === 'nominative' && (
        <NominativeView
          lang={lang}
          globalTeams={globalTeams}
          clubs={clubs}
          entries={entries}
          competitionGymnasts={competitionGymnasts}
          competitionCoaches={competitionCoaches}
          globalCoaches={globalCoaches}
          ageGroupRules={ageGroupRules}
        />
      )}
    </div>
  )
}

// ─── nominative view (existing content extracted) ─────────────────────────────

function NominativeView({ lang, globalTeams, clubs, entries, competitionGymnasts, competitionCoaches, globalCoaches, ageGroupRules }: Omit<Props, 'competitionId'>) {
  const t = T[lang]

  const clubMap    = Object.fromEntries(clubs.map(c => [c.id, c]))
  const teamMap    = Object.fromEntries(globalTeams.map(tm => [tm.id, tm]))
  const gymnastMap = Object.fromEntries(competitionGymnasts.map(g => [g.id, g]))

  const registeredCoachIds = new Set(competitionCoaches.map(cc => cc.id))
  const registeredCoaches  = globalCoaches.filter(c => registeredCoachIds.has(c.id))

  const clubIds = Array.from(
    new Set([
      ...entries.map(e => teamMap[e.team_id]?.club_id).filter(Boolean),
      ...registeredCoaches.map(c => c.club_id),
    ])
  ) as string[]

  if (clubIds.length === 0) {
    return <p className="text-sm text-slate-400 py-8 text-center">{t.noEntries}</p>
  }

  function handleBulkDownload(gymnasts: Gymnast[]) {
    const withLicencia = gymnasts.filter(g => g.licencia_url)
    withLicencia.forEach((g, i) => {
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = g.licencia_url!
        a.download = `${g.first_name}_${g.last_name_1}_licencia.pdf`
        a.target = '_blank'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }, i * 300)
    })
  }

  return (
    <div className="space-y-3">
      {clubIds.map(cid => (
        <ClubBlock
          key={cid}
          lang={lang}
          club={clubMap[cid]}
          clubCoaches={registeredCoaches.filter(c => c.club_id === cid)}
          clubEntries={entries.filter(e => teamMap[e.team_id]?.club_id === cid)}
          teamMap={teamMap}
          gymnastMap={gymnastMap}
          ageGroupRules={ageGroupRules}
          onBulkDownload={handleBulkDownload}
        />
      ))}
    </div>
  )
}

// ─── per-club block ────────────────────────────────────────────────────────────

function ClubBlock({
  lang, club, clubCoaches, clubEntries, teamMap, gymnastMap, ageGroupRules, onBulkDownload,
}: {
  lang: Lang
  club: Club | undefined
  clubCoaches: Coach[]
  clubEntries: CompetitionEntry[]
  teamMap: Record<string, Team>
  gymnastMap: Record<string, Gymnast>
  ageGroupRules: AgeGroupRule[]
  onBulkDownload: (gymnasts: Gymnast[]) => void
}) {
  const [open, setOpen] = useState(true)

  const sortableEntries = clubEntries.map(e => ({
    ...e,
    age_group: teamMap[e.team_id]?.age_group ?? '',
    category:  teamMap[e.team_id]?.category  ?? '',
  }))
  const sortedEntries  = sortByAgeGroupAndCategory(sortableEntries, ageGroupRules)
  const activeEntries  = sortedEntries.filter(e => !e.dropped_out)
  const droppedEntries = sortedEntries.filter(e => e.dropped_out)

  const allActiveGymnasts: Gymnast[] = activeEntries.flatMap(e => {
    const team = teamMap[e.team_id]
    return (team?.gymnast_ids ?? []).map(gid => gymnastMap[gid]).filter(Boolean) as Gymnast[]
  })
  const hasAnyLicencia = allActiveGymnasts.some(g => g.licencia_url)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {club?.avatar_url ? (
            <img src={club.avatar_url} alt={club.club_name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
              {club?.club_name?.charAt(0) ?? '?'}
            </div>
          )}
          <p className="text-sm font-semibold text-slate-800 truncate">{club?.club_name ?? '—'}</p>
          <span className="text-xs text-slate-400 shrink-0">
            {clubCoaches.length > 0 && `${clubCoaches.length} ${T[lang].coaches.toLowerCase()}`}
            {clubCoaches.length > 0 && activeEntries.length > 0 && ' · '}
            {activeEntries.length > 0 && `${activeEntries.length} ${T[lang].gymnasts.toLowerCase()}`}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); onBulkDownload(allActiveGymnasts) }}
            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onBulkDownload(allActiveGymnasts) } }}
            className={[
              'text-xs px-2.5 py-1 rounded-lg border transition-all',
              hasAnyLicencia
                ? 'border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer'
                : 'border-slate-100 text-slate-300 cursor-default pointer-events-none',
            ].join(' ')}
          >
            {T[lang].downloadAll}
          </span>
          <svg className={['w-4 h-4 text-slate-300 transition-transform', open ? 'rotate-180' : ''].join(' ')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {clubCoaches.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-400 bg-slate-50">
                {T[lang].coaches}
              </p>
              <ul className="divide-y divide-slate-50">
                {clubCoaches.map(c => (
                  <li key={c.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-400">
                      {c.photo_url
                        ? <img src={c.photo_url} alt={c.full_name} className="w-full h-full object-cover" />
                        : c.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 font-medium truncate">{c.full_name}</p>
                      {c.licence && <p className="text-xs text-slate-400">{c.licence}</p>}
                    </div>
                    {c.photo_url && (
                      <a href={c.photo_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all shrink-0">
                        {T[lang].viewPhoto}
                      </a>
                    )}
                    {c.licencia_url ? (
                      <a href={c.licencia_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all shrink-0">
                        {T[lang].viewLicencia}
                      </a>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-lg border border-slate-100 text-slate-300 shrink-0">
                        {T[lang].noLicencia}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(activeEntries.length > 0 || droppedEntries.length > 0) && (
            <div>
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-400 bg-slate-50">
                {T[lang].gymnasts}
              </p>
              <div className="divide-y divide-slate-50">
                {[...activeEntries, ...droppedEntries].map(entry => {
                  const team = teamMap[entry.team_id]
                  if (!team) return null
                  const dropped = entry.dropped_out
                  const gymnasts = (team.gymnast_ids ?? []).map(gid => gymnastMap[gid]).filter(Boolean) as Gymnast[]
                  return (
                    <div key={entry.id} className={dropped ? 'opacity-50' : ''}>
                      <div className="px-4 py-2 bg-slate-50/50 flex items-center gap-2">
                        <p className="text-xs font-medium text-slate-600 truncate flex-1">{team.gymnast_display}</p>
                        <span className="text-xs text-slate-400">{categoryLabel(team.category, lang)}</span>
                        {dropped && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">{T[lang].droppedOut}</span>
                        )}
                      </div>
                      {gymnasts.length === 0 ? (
                        <p className="px-4 py-3 text-xs text-slate-400">{T[lang].noGymnasts}</p>
                      ) : (
                        <ul className="divide-y divide-slate-50">
                          {gymnasts.map(g => {
                            const name = [g.first_name, g.last_name_1, g.last_name_2].filter(Boolean).join(' ')
                            return (
                              <li key={g.id} className="px-4 py-3 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-400">
                                  {g.photo_url
                                    ? <img src={g.photo_url} alt={name} className="w-full h-full object-cover" />
                                    : g.first_name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-800 font-medium truncate">{name}</p>
                                  <p className="text-xs text-slate-400">{g.date_of_birth}</p>
                                </div>
                                {g.photo_url && (
                                  <a href={g.photo_url} target="_blank" rel="noopener noreferrer"
                                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all shrink-0">
                                    {T[lang].viewPhoto}
                                  </a>
                                )}
                                {g.licencia_url ? (
                                  <a href={g.licencia_url} target="_blank" rel="noopener noreferrer"
                                    className="text-xs px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all shrink-0">
                                    {T[lang].viewLicencia}
                                  </a>
                                ) : (
                                  <span className="text-xs px-2.5 py-1 rounded-lg border border-slate-100 text-slate-300 shrink-0">
                                    {T[lang].noLicencia}
                                  </span>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
