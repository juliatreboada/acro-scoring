'use client'

import { useState } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Team, Club, CompetitionEntry, Gymnast, Coach, AgeGroupRule } from '@/components/admin/types'
import { categoryLabel, sortByAgeGroupAndCategory } from '@/components/admin/types'

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
  },
}

// ─── props ────────────────────────────────────────────────────────────────────

type Props = {
  lang: Lang
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  competitionGymnasts: Gymnast[]
  competitionCoaches: Coach[]   // coaches registered for this competition
  globalCoaches: Coach[]        // all coaches (across all clubs)
  ageGroupRules: AgeGroupRule[]
}

// ─── component ────────────────────────────────────────────────────────────────

export default function LicenciasTab({ lang, globalTeams, clubs, entries, competitionGymnasts, competitionCoaches, globalCoaches, ageGroupRules }: Props) {
  const t = T[lang]

  const clubMap    = Object.fromEntries(clubs.map(c => [c.id, c]))
  const teamMap    = Object.fromEntries(globalTeams.map(tm => [tm.id, tm]))
  const gymnastMap = Object.fromEntries(competitionGymnasts.map(g => [g.id, g]))

  // registered coach ids (for this competition)
  const registeredCoachIds = new Set(competitionCoaches.map(cc => cc.id))
  // coaches that are registered for this competition (full objects)
  const registeredCoaches  = globalCoaches.filter(c => registeredCoachIds.has(c.id))

  // ── group entries by club ──────────────────────────────────────────────────
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

  // Sort entries by age group (sort_order desc) → category type → pair type
  const sortableEntries = clubEntries.map(e => ({
    ...e,
    age_group: teamMap[e.team_id]?.age_group ?? '',
    category:  teamMap[e.team_id]?.category  ?? '',
  }))
  const sortedEntries = sortByAgeGroupAndCategory(sortableEntries, ageGroupRules)
  const activeEntries  = sortedEntries.filter(e => !e.dropped_out)
  const droppedEntries = sortedEntries.filter(e => e.dropped_out)

  // all gymnasts in active teams for bulk download
  const allActiveGymnasts: Gymnast[] = activeEntries.flatMap(e => {
    const team = teamMap[e.team_id]
    return (team?.gymnast_ids ?? []).map(gid => gymnastMap[gid]).filter(Boolean) as Gymnast[]
  })
  const hasAnyLicencia = allActiveGymnasts.some(g => g.licencia_url)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* club header */}
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
          {/* coaches section */}
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

          {/* gymnasts section — grouped by team */}
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
                      {/* team sub-header */}
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
