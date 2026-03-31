'use client'

import type { Lang } from '@/components/aj-scoring/types'
import type { Team, Club, CompetitionEntry } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    noRegistrations: 'No teams registered yet.',
    registered: (n: number) => `${n} registered`,
    dropout: (n: number) => `${n} dropout`,
    dropouts: (n: number) => `${n} dropouts`,
    markDropout: 'Mark as dropout',
    undoDropout: 'Undo dropout',
    baja: 'Dropout',
  },
  es: {
    noRegistrations: 'Sin equipos registrados todavía.',
    registered: (n: number) => `${n} inscrito${n === 1 ? '' : 's'}`,
    dropout: (n: number) => `${n} baja`,
    dropouts: (n: number) => `${n} bajas`,
    markDropout: 'Declarar baja',
    undoDropout: 'Deshacer baja',
    baja: 'Baja',
  },
}

// ─── team avatar ──────────────────────────────────────────────────────────────

function TeamAvatar({ team }: { team: Team }) {
  const initials = team.gymnast_display
    .split('/')
    .map((n) => n.trim()[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return team.photo_url ? (
    <img
      src={team.photo_url}
      alt={team.gymnast_display}
      className="w-10 h-10 rounded-lg object-cover shrink-0"
    />
  ) : (
    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold flex items-center justify-center shrink-0">
      {initials}
    </div>
  )
}

// ─── group ────────────────────────────────────────────────────────────────────

type GroupItem = { entry: CompetitionEntry; team: Team; club: Club | undefined }

function RegistrationGroup({ age_group, category, items, lang, agLabels, onToggleDropout }: {
  age_group: string
  category: string
  items: GroupItem[]
  lang: Lang
  agLabels: Record<string, string>
  onToggleDropout: (entryId: string) => void
}) {
  const t = T[lang]
  const activeCount = items.filter((i) => !i.entry.dropped_out).length
  const dropoutCount = items.filter((i) => i.entry.dropped_out).length

  return (
    <div>
      {/* group header */}
      <div className="flex items-baseline gap-3 mb-3">
        <h3 className="text-sm font-semibold text-slate-700">
          {agLabels[age_group] ?? age_group} · {category}
        </h3>
        <span className="text-xs text-slate-400">{t.registered(activeCount)}</span>
        {dropoutCount > 0 && (
          <span className="text-xs text-red-400">· {dropoutCount === 1 ? t.dropout(1) : t.dropouts(dropoutCount)}</span>
        )}
      </div>

      {/* team rows */}
      <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
        {items.map(({ entry, team, club }) => (
          <div
            key={entry.id}
            className={[
              'flex items-center gap-3 px-4 py-3 transition-colors',
              entry.dropped_out ? 'bg-slate-50' : 'bg-white',
            ].join(' ')}
          >
            <div className={entry.dropped_out ? 'opacity-40' : ''}>
              <TeamAvatar team={team} />
            </div>

            {entry.dorsal != null && (
              <span className={['text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
                entry.dropped_out ? 'bg-slate-100 text-slate-300' : 'bg-slate-800 text-white'].join(' ')}>
                #{entry.dorsal}
              </span>
            )}

            <div className="flex-1 min-w-0">
              <p className={[
                'text-sm font-medium text-slate-800 truncate',
                entry.dropped_out ? 'line-through text-slate-400' : '',
              ].join(' ')}>
                {team.gymnast_display}
              </p>
              <p className={[
                'text-xs truncate',
                entry.dropped_out ? 'text-slate-300' : 'text-slate-400',
              ].join(' ')}>
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
              className={[
                'shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all',
                entry.dropped_out
                  ? 'border-slate-200 text-slate-500 hover:bg-white'
                  : 'border-red-100 text-red-500 hover:bg-red-50',
              ].join(' ')}
            >
              {entry.dropped_out ? t.undoDropout : t.markDropout}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export type RegistrationsTabProps = {
  lang: Lang
  globalTeams: Team[]
  clubs: Club[]
  entries: CompetitionEntry[]
  agLabels: Record<string, string>
  onToggleDropout: (entryId: string) => void
}

export default function RegistrationsTab({
  lang, globalTeams, clubs, entries, agLabels, onToggleDropout,
}: RegistrationsTabProps) {
  const t = T[lang]

  if (entries.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-12 border border-dashed border-slate-200 rounded-xl">
        {t.noRegistrations}
      </p>
    )
  }

  // Build groups: { age_group, category, items[] }
  type Group = { age_group: string; category: string; items: GroupItem[] }
  const groupMap = new Map<string, Group>()

  for (const entry of entries) {
    const team = globalTeams.find((tm) => tm.id === entry.team_id)
    if (!team) continue
    const club = clubs.find((c) => c.id === team.club_id)
    const key = `${team.age_group}||${team.category}`
    if (!groupMap.has(key)) {
      groupMap.set(key, { age_group: team.age_group, category: team.category, items: [] })
    }
    groupMap.get(key)!.items.push({ entry, team, club })
  }

  const groups = [...groupMap.values()].sort((a, b) => {
    const ag = a.age_group.localeCompare(b.age_group)
    return ag !== 0 ? ag : a.category.localeCompare(b.category)
  })

  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <RegistrationGroup
          key={`${g.age_group}||${g.category}`}
          age_group={g.age_group}
          category={g.category}
          items={g.items}
          lang={lang}
          agLabels={agLabels}
          onToggleDropout={onToggleDropout}
        />
      ))}
    </div>
  )
}
