'use client'

import type { Lang } from '@/components/aj-scoring/types'
import type { Team, Club, CompetitionEntry, Gymnast } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    title: 'Licencias',
    noEntries: 'No registered teams.',
    noLicencia: 'No licencia',
    viewLicencia: 'View licencia',
    viewPhoto: 'View photo',
    noPhoto: 'No photo',
    downloadAll: 'Download all',
    droppedOut: 'Dropped out',
    noGymnasts: 'No gymnasts linked',
  },
  es: {
    title: 'Licencias',
    noEntries: 'No hay equipos inscritos.',
    noLicencia: 'Sin licencia',
    viewLicencia: 'Ver licencia',
    viewPhoto: 'Ver foto',
    noPhoto: 'Sin foto',
    downloadAll: 'Descargar todo',
    droppedOut: 'Retirado',
    noGymnasts: 'Sin gimnastas vinculados',
  },
}

// ─── props ────────────────────────────────────────────────────────────────────

type Props = {
  lang: Lang
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  competitionGymnasts: Gymnast[]
}

// ─── component ────────────────────────────────────────────────────────────────

export default function LicenciasTab({ lang, globalTeams, clubs, entries, competitionGymnasts }: Props) {
  const t = T[lang]

  const activeEntries = entries.filter(e => !e.dropped_out)
  const droppedEntries = entries.filter(e => e.dropped_out)

  const clubMap = Object.fromEntries(clubs.map(c => [c.id, c]))
  const teamMap = Object.fromEntries(globalTeams.map(tm => [tm.id, tm]))
  const gymnastMap = Object.fromEntries(competitionGymnasts.map(g => [g.id, g]))

  function getGymnastsForTeam(team: Team): Gymnast[] {
    if (!team.gymnast_ids?.length) return []
    return team.gymnast_ids.map(gid => gymnastMap[gid]).filter(Boolean) as Gymnast[]
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

  if (activeEntries.length === 0 && droppedEntries.length === 0) {
    return <p className="text-sm text-slate-400 py-8 text-center">{t.noEntries}</p>
  }

  function renderEntry(entry: CompetitionEntry, dropped: boolean) {
    const team = teamMap[entry.team_id]
    if (!team) return null
    const club = clubMap[team.club_id]
    const gymnasts = getGymnastsForTeam(team)
    const hasAnyLicencia = gymnasts.some(g => g.licencia_url)

    return (
      <div key={entry.id} className={['rounded-2xl border bg-white overflow-hidden', dropped ? 'opacity-50' : ''].join(' ')}>
        {/* team header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{team.gymnast_display}</p>
            <p className="text-xs text-slate-400">{club?.club_name ?? '—'} · {team.category} · {team.age_group}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {dropped && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">{t.droppedOut}</span>
            )}
            {hasAnyLicencia && !dropped && (
              <button
                onClick={() => handleBulkDownload(gymnasts)}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
              >
                {t.downloadAll}
              </button>
            )}
          </div>
        </div>

        {/* gymnasts list */}
        {gymnasts.length === 0 ? (
          <p className="px-4 py-3 text-xs text-slate-400">{t.noGymnasts}</p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {gymnasts.map(g => {
              const name = [g.first_name, g.last_name_1, g.last_name_2].filter(Boolean).join(' ')
              return (
                <li key={g.id} className="px-4 py-3 flex items-center gap-3">
                  {/* photo */}
                  <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-400">
                    {g.photo_url
                      ? <img src={g.photo_url} alt={name} className="w-full h-full object-cover" />
                      : g.first_name.charAt(0)}
                  </div>
                  {/* name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 font-medium truncate">{name}</p>
                    <p className="text-xs text-slate-400">{g.date_of_birth}</p>
                  </div>
                  {/* photo link */}
                  {g.photo_url && (
                    <a href={g.photo_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all shrink-0">
                      {t.viewPhoto}
                    </a>
                  )}
                  {/* licencia */}
                  {g.licencia_url ? (
                    <a href={g.licencia_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all shrink-0">
                      {t.viewLicencia}
                    </a>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-lg border border-slate-100 text-slate-300 shrink-0">
                      {t.noLicencia}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activeEntries.map(e => renderEntry(e, false))}
      {droppedEntries.map(e => renderEntry(e, true))}
    </div>
  )
}
