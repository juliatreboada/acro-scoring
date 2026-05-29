'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { Competition, RGRegistration, RGRegistrationStatus, Apparatus } from '@/components/admin/types'
import { useT } from '@/lib/useT'

const STATUS_ORDER: RGRegistrationStatus[] = ['pending', 'inscription_approved', 'payment_pending', 'registered']

const STATUS_STYLE: Record<RGRegistrationStatus, string> = {
  pending:              'bg-amber-100 text-amber-700',
  inscription_approved: 'bg-blue-100 text-blue-700',
  payment_pending:      'bg-orange-100 text-orange-700',
  registered:           'bg-green-100 text-green-700',
}

// ─── types ─────────────────────────────────────────────────────────────────────

type TeamRow   = { id: string; club_id: string; gymnast_display: string }
type ClubRow   = { id: string; club_name: string }
type TARow     = { team_id: string; apparatus_id: string }

// ─── component ────────────────────────────────────────────────────────────────

export default function RGRegistrationsTab({
  lang, competition,
}: {
  lang: Lang
  competition: Competition
}) {
  const t = useT('RGRegistrationsTab', lang)
  const supabase = createClient()
  const hasFee = !!(competition.fee_per_team || competition.fee_per_gymnast)

  const [loading,       setLoading]       = useState(true)
  const [registrations, setRegistrations] = useState<RGRegistration[]>([])
  const [teams,         setTeams]         = useState<TeamRow[]>([])
  const [clubs,         setClubs]         = useState<ClubRow[]>([])
  const [apparatus,     setApparatus]     = useState<Apparatus[]>([])
  const [teamApparatus, setTeamApparatus] = useState<TARow[]>([])
  const [editingNote,   setEditingNote]   = useState<{ id: string; value: string } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: regs } = await supabase
        .from('rg_registrations')
        .select('id,team_id,competition_id,status,payment_document_url,notes,approved_by,approved_at,payment_approved_by,payment_approved_at,created_at')
        .eq('competition_id', competition.id)
        .order('created_at')

      const rawRegs = (regs ?? []) as RGRegistration[]
      const teamIds = rawRegs.map(r => r.team_id)

      const [teamsRes, appRes] = await Promise.all([
        teamIds.length > 0
          ? supabase.from('teams').select('id,club_id,gymnast_display').in('id', teamIds)
          : Promise.resolve({ data: [] as TeamRow[] }),
        supabase.from('apparatus').select('id,name,name_es,sort_order').order('sort_order'),
      ])

      const rawTeams = (teamsRes.data ?? []) as TeamRow[]
      const clubIds  = [...new Set(rawTeams.map(t => t.club_id))]

      const [clubsRes, taRes] = await Promise.all([
        clubIds.length > 0
          ? supabase.from('clubs').select('id,club_name').in('id', clubIds)
          : Promise.resolve({ data: [] as ClubRow[] }),
        teamIds.length > 0
          ? supabase.from('team_apparatus').select('team_id,apparatus_id').in('team_id', teamIds)
          : Promise.resolve({ data: [] as TARow[] }),
      ])

      setRegistrations(rawRegs)
      setTeams(rawTeams)
      setClubs((clubsRes.data ?? []) as ClubRow[])
      setApparatus((appRes.data ?? []) as unknown as Apparatus[])
      setTeamApparatus((taRes.data ?? []) as TARow[])
      setLoading(false)
    }
    load()
  }, [competition.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── helpers ──────────────────────────────────────────────────────────────────

  function teamFor(r: RGRegistration): TeamRow | undefined {
    return teams.find(t => t.id === r.team_id)
  }

  function clubNameFor(team: TeamRow | undefined): string {
    if (!team) return '—'
    return clubs.find(c => c.id === team.club_id)?.club_name ?? '—'
  }

  function apparatusNamesFor(teamId: string): string {
    const ids = teamApparatus.filter(ta => ta.team_id === teamId).map(ta => ta.apparatus_id)
    if (!ids.length) return '—'
    return ids
      .map(id => apparatus.find(a => a.id === id))
      .filter(Boolean)
      .map(a => (lang === 'es' && a!.name_es ? a!.name_es : a!.name))
      .join(', ')
  }

  // ── actions ──────────────────────────────────────────────────────────────────

  async function handleApproveInscription(reg: RGRegistration) {
    const nextStatus: RGRegistrationStatus = hasFee ? 'inscription_approved' : 'registered'
    await supabase.from('rg_registrations').update({ status: nextStatus, approved_at: new Date().toISOString() }).eq('id', reg.id)
    setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, status: nextStatus } : r))
  }

  async function handleApprovePayment(reg: RGRegistration) {
    await supabase.from('rg_registrations').update({ status: 'registered', payment_approved_at: new Date().toISOString() }).eq('id', reg.id)
    setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, status: 'registered' } : r))
  }

  async function handleSaveNote(regId: string, note: string) {
    await supabase.from('rg_registrations').update({ notes: note || null }).eq('id', regId)
    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, notes: note || null } : r))
    setEditingNote(null)
  }

  // ── render ───────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  if (!registrations.length) return (
    <p className="text-sm text-slate-400 text-center py-16">{t.empty}</p>
  )

  // Status count summary
  const counts = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = registrations.filter(r => r.status === s).length
    return acc
  }, {})

  const grouped = STATUS_ORDER
    .map(status => ({ status, items: registrations.filter(r => r.status === status) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="space-y-6">
      {/* status summary */}
      <div className="flex flex-wrap gap-2">
        {STATUS_ORDER.map(status => counts[status] > 0 && (
          <span key={status} className={['px-2.5 py-1 rounded-lg text-xs font-semibold', STATUS_STYLE[status]].join(' ')}>
            {counts[status]} {t.status[status].toLowerCase()}
          </span>
        ))}
        {hasFee && (
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
            {t.hasFee}
          </span>
        )}
      </div>

      {/* grouped lists */}
      {grouped.map(({ status, items }) => (
        <div key={status}>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
            {t.status[status]}
          </p>
          <div className="space-y-2">
            {items.map(reg => {
              const team     = teamFor(reg)
              const clubName = clubNameFor(team)
              const apps     = team ? apparatusNamesFor(team.id) : '—'
              const isEditingThisNote = editingNote?.id === reg.id

              return (
                <div key={reg.id} className="bg-white border border-slate-200 rounded-2xl px-4 py-3 space-y-3">
                  {/* team info row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{team?.gymnast_display ?? '—'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{clubName} · {apps}</p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {new Date(reg.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB')}
                      </p>
                    </div>
                    <span className={['px-2 py-0.5 rounded-lg text-xs font-semibold shrink-0', STATUS_STYLE[reg.status]].join(' ')}>
                      {t.status[reg.status]}
                    </span>
                  </div>

                  {/* payment doc link */}
                  {reg.payment_document_url && (
                    <a href={reg.payment_document_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                      </svg>
                      Payment document
                    </a>
                  )}

                  {/* note row */}
                  <div>
                    {isEditingThisNote ? (
                      <div className="flex gap-2 items-start">
                        <textarea
                          rows={2}
                          value={editingNote.value}
                          onChange={e => setEditingNote({ id: reg.id, value: e.target.value })}
                          placeholder={t.notePlaceholder}
                          className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex flex-col gap-1">
                          <button onClick={() => handleSaveNote(reg.id, editingNote.value)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all">
                            {t.saveNote}
                          </button>
                          <button onClick={() => setEditingNote(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 transition-all">
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingNote({ id: reg.id, value: reg.notes ?? '' })}
                        className="text-xs text-slate-400 hover:text-slate-600 transition-colors text-left w-full">
                        {reg.notes
                          ? <span className="italic">&ldquo;{reg.notes}&rdquo;</span>
                          : <span className="text-slate-300">+ {t.note}</span>
                        }
                      </button>
                    )}
                  </div>

                  {/* action buttons */}
                  <div className="flex gap-2 pt-1">
                    {reg.status === 'pending' && (
                      <button onClick={() => handleApproveInscription(reg)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all">
                        {t.approveInscription}
                      </button>
                    )}
                    {reg.status === 'payment_pending' && (
                      <button onClick={() => handleApprovePayment(reg)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-all">
                        {t.approvePayment}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
