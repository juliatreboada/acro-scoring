'use client'

import { useState } from 'react'
import type { Lang } from '@/components/aj-scoring/types'
import type { Team, Club, Gymnast, CompetitionEntry, AgeGroupRule } from '@/components/admin/types'
import { categoryLabel } from '@/components/admin/types'
import ClickableImg from '@/components/shared/ClickableImg'
import ImportTab from './ImportTab'

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
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
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
    expandAll: 'Expandir todo',
    collapseAll: 'Contraer todo',
  },
}

// ─── club avatar ──────────────────────────────────────────────────────────────

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

// ─── team avatar ──────────────────────────────────────────────────────────────

function TeamAvatar({ team }: { team: Team }) {
  const initials = team.gymnast_display
    .split('/')
    .map((n) => n.trim()[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return team.photo_url ? (
    <ClickableImg
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

type GroupItem = { entry: CompetitionEntry; team: Team; club: Club | undefined; missingLicencia: boolean }

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
      {/* group header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 mb-3 text-left group"
      >
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

      {/* team rows */}
      {open && <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
        {items.map(({ entry, team, club, missingLicencia }) => (
          <div
            key={entry.id}
            className={[
              'flex items-center gap-3 px-4 py-3 transition-colors',
              entry.dropped_out ? 'bg-slate-50' : 'bg-white',
            ].join(' ')}
          >
            <div className={['relative shrink-0', entry.dropped_out ? 'opacity-40' : ''].join(' ')}>
              <TeamAvatar team={team} />
              <div className="absolute -bottom-1 -right-1">
                <ClubAvatar club={club} />
              </div>
            </div>

            {entry.dorsal != null && (
              <span className={['text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
                entry.dropped_out ? 'bg-slate-100 text-slate-300' : 'bg-slate-800 text-white'].join(' ')}>
                #{entry.dorsal}
              </span>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={[
                  'text-sm font-medium text-slate-800 truncate',
                  entry.dropped_out ? 'line-through text-slate-400' : '',
                ].join(' ')}>
                  {team.gymnast_display}
                </p>
                {missingLicencia && (
                  <span title={t.licenciaWarningFull} className="text-xs font-semibold px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full shrink-0">
                    ⚠ {t.licenciaWarning}
                  </span>
                )}
              </div>
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
      </div>}
    </div>
  )
}

// ─── level + sort helpers ─────────────────────────────────────────────────────

type Level = 'Escolar' | 'Base' | 'Nacional'
const LEVEL_ORDER: Level[] = ['Escolar', 'Base', 'Nacional']

function getLevel(ageGroupId: string, rules: AgeGroupRule[]): Level {
  const ag = rules.find(r => r.id === ageGroupId)?.age_group ?? ''
  if (ag.includes('Escolar')) return 'Escolar'
  if (ag.includes('Base'))    return 'Base'
  return 'Nacional'
}

// Category type: pairs=0, groups3=1, groups4=2
const CATEGORY_TYPE_ORDER: Record<string, number> = {
  "Women's Pair": 0, "Mixed Pair": 0, "Men's Pair": 0, 'Pairs': 0,
  "Women's Group": 1, 'Groups 3': 1,
  "Mixed Group": 2, 'Groups 4': 2,
}

// Within pairs: Women's=0, Mixed=1, Men's=2
const PAIR_ORDER: Record<string, number> = {
  "Women's Pair": 0, 'Pairs': 0,
  "Mixed Pair":   1,
  "Men's Pair":   2,
}

function sortGroups(
  groups: { age_group: string; category: string }[],
  rules: AgeGroupRule[],
): typeof groups {
  return [...groups].sort((a, b) => {
    const ruleA = rules.find(r => r.id === a.age_group)
    const ruleB = rules.find(r => r.id === b.age_group)
    // 1. age group: descending sort_order
    const sortDiff = (ruleB?.sort_order ?? 0) - (ruleA?.sort_order ?? 0)
    if (sortDiff !== 0) return sortDiff
    // 2. category type: pairs → groups3 → groups4
    const typeDiff = (CATEGORY_TYPE_ORDER[a.category] ?? 99) - (CATEGORY_TYPE_ORDER[b.category] ?? 99)
    if (typeDiff !== 0) return typeDiff
    // 3. within pairs: women → mixed → men
    return (PAIR_ORDER[a.category] ?? 99) - (PAIR_ORDER[b.category] ?? 99)
  })
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
  competitionId: string
  ageGroupRules: AgeGroupRule[]
  competitionAgeGroups: string[]
  competitionYear: number
}

export default function RegistrationsTab({
  lang, globalTeams, clubs, gymnasts, entries, agLabels, onToggleDropout,
  competitionId, ageGroupRules, competitionAgeGroups, competitionYear,
}: RegistrationsTabProps) {
  const t = T[lang]
  const [showImport, setShowImport] = useState(false)
  // empty Set = all open sentinel for both levels and groups
  const [openLevels,  setOpenLevels]  = useState<Set<string>>(new Set())
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())

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

  // ── Build groups ────────────────────────────────────────────────────────────
  type Group = { age_group: string; category: string; items: GroupItem[] }
  const groupMap = new Map<string, Group>()

  for (const entry of entries) {
    const team = globalTeams.find((tm) => tm.id === entry.team_id)
    if (!team) continue
    const club = clubs.find((c) => c.id === team.club_id)
    const missingLicencia = (team.gymnast_ids ?? []).some((gid) =>
      !gymnasts.find((g) => g.id === gid)?.licencia_url
    )
    const key = `${team.age_group}||${team.category}`
    if (!groupMap.has(key)) {
      groupMap.set(key, { age_group: team.age_group, category: team.category, items: [] })
    }
    groupMap.get(key)!.items.push({ entry, team, club, missingLicencia })
  }

  const groups = sortGroups([...groupMap.values()], ageGroupRules)

  // ── Group by level ──────────────────────────────────────────────────────────
  const byLevel = new Map<Level, Group[]>()
  for (const g of groups) {
    const level = getLevel(g.age_group, ageGroupRules)
    if (!byLevel.has(level)) byLevel.set(level, [])
    byLevel.get(level)!.push(g)
  }
  const presentLevels = LEVEL_ORDER.filter(l => byLevel.has(l))

  // ── Open/close helpers ──────────────────────────────────────────────────────
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

  const expandAll  = () => { setOpenLevels(new Set()); setOpenGroups(new Set()) }
  const collapseAll = () => { setOpenLevels(new Set(['__none__'])); setOpenGroups(new Set(['__none__'])) }

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-5">
        {entries.length > 0 && (
          <>
            <button onClick={expandAll}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              {t.expandAll}
            </button>
            <span className="text-slate-200">|</span>
            <button onClick={collapseAll}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              {t.collapseAll}
            </button>
          </>
        )}
        <button onClick={() => setShowImport(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {t.import}
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-12 border border-dashed border-slate-200 rounded-xl">
          {t.noRegistrations}
        </p>
      ) : (
        <div className="space-y-4">
          {presentLevels.map(level => {
            const levelGroups = byLevel.get(level)!
            const levelOpen = isLevelOpen(level)
            const totalActive = levelGroups.reduce((sum, g) => sum + g.items.filter(i => !i.entry.dropped_out).length, 0)
            return (
              <div key={level} className="border border-slate-200 rounded-2xl overflow-hidden">
                {/* level header */}
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

                {/* level body */}
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
