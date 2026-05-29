'use client'

import { useState } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { ProvisionalEntry, Club, AgeGroupRule, Level } from '@/components/admin/types'
import { categoriesForRuleset, sortByAgeGroupAndCategory, CATEGORY_LABELS, LEVEL_ORDER, getLevel } from '@/components/admin/types'
import { useT } from '@/lib/useT'

export function ProvisionalSubTab({ lang, provisionalEntries, clubs, ageGroupRules, competitionAgeGroups }: {
  lang: Lang
  provisionalEntries: ProvisionalEntry[]
  clubs: Club[]
  ageGroupRules: AgeGroupRule[]
  competitionAgeGroups: string[]
}) {
  const t = useT('ProvisionalSubTab', lang)
  const [openLevels, setOpenLevels] = useState<Set<string>>(new Set())
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())

  type CatRow = { ageGroupId: string; ageGroupName: string; age_group: string; category: string }
  const rawRows: CatRow[] = competitionAgeGroups.flatMap(agId => {
    const rule = ageGroupRules.find(r => r.id === agId)
    if (!rule) return []
    return categoriesForRuleset(rule.level).map(cat => ({
      ageGroupId: agId, age_group: agId, ageGroupName: rule.age_group, category: cat,
    }))
  })
  const allRows = sortByAgeGroupAndCategory(rawRows, ageGroupRules)

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
