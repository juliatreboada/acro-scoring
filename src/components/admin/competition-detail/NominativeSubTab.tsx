'use client'

import type { Lang } from '@/components/scoring/types'
import type { Team, Club, Gymnast, CompetitionEntry, AgeGroupRule, Level } from '@/components/admin/types'
import { sortByAgeGroupAndCategory, categoryLabel, LEVEL_ORDER, getLevel } from '@/components/admin/types'
import { ClubAvatar, TeamAvatar } from '@/components/admin/Avatar'

const T = {
  en: {
    noRegistrations: 'No teams registered yet.',
    import: 'Import',
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
  },
  es: {
    noRegistrations: 'Sin equipos registrados todavía.',
    import: 'Importar',
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
  },
}

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
              <div className="absolute -bottom-1 -right-1"><ClubAvatar club={club} size="sm" ring /></div>
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

export function NominativeView({ lang, globalTeams, clubs, gymnasts, entries, agLabels, onToggleDropout, ageGroupRules, routineMusic, openLevels, openGroups, setOpenLevels, setOpenGroups, onShowImport }: {
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
