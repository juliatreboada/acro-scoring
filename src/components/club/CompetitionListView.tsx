'use client'

import { useState } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Competition, CompetitionEntry, CompetitionJudgeNomination, AgeGroupRule, Team } from '@/components/admin/types'
import { categoriesForRuleset } from '@/components/admin/types'
import { formatDateRange } from '@/lib/formatDate'
import { useT } from '@/lib/useT'

const STATUS_BADGE: Record<string, string> = {
  draft:               'bg-slate-100 text-slate-500',
  provisional_entry:   'bg-violet-100 text-violet-700',
  definitive_entry:    'bg-orange-100 text-orange-700',
  registration_open:   'bg-green-100 text-green-700',
  registration_closed: 'bg-amber-100 text-amber-700',
  published:           'bg-indigo-100 text-indigo-700',
  active:              'bg-blue-600 text-white',
  finished:            'bg-slate-100 text-slate-400',
}

type EntrySummaryRow = { label: string; count: number }

function EntrySummary({ lang, rows, accentClass }: { lang: Lang; rows: EntrySummaryRow[]; accentClass: string }) {
  const [open, setOpen] = useState(false)
  const total = rows.reduce((s, r) => s + r.count, 0)
  if (total === 0) return null
  const submittedLabel = lang === 'es'
    ? `${total} equipo${total !== 1 ? 's' : ''} enviados`
    : `${total} team${total !== 1 ? 's' : ''} submitted`
  return (
    <div className={`mt-2 rounded-xl border overflow-hidden ${accentClass}`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-black/5 transition-colors">
        <span className="text-xs font-semibold">{submittedLabel}</span>
        <svg className={['w-3.5 h-3.5 transition-transform opacity-60', open ? 'rotate-180' : ''].join(' ')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="px-3 pb-2.5 pt-1 space-y-1 border-t border-black/10">
          {rows.filter(r => r.count > 0).map(r => (
            <div key={r.label} className="flex items-center justify-between text-xs">
              <span className="opacity-80">{r.label}</span>
              <span className="font-bold">{r.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function CompetitionListView({
  lang, competitions, teams, entries, nominations, clubProvisionalEntries, clubDefinitiveEntries,
  ageGroupRules, onSelect, onOpenProvisionalEntry, onOpenDefinitiveEntry,
}: {
  lang: Lang
  competitions: Competition[]
  teams: Team[]
  entries: CompetitionEntry[]
  nominations: CompetitionJudgeNomination[]
  clubProvisionalEntries: Record<string, { teams_per_category: Record<string, number> }>
  clubDefinitiveEntries: Record<string, { teams_per_category: Record<string, number> }>
  ageGroupRules: AgeGroupRule[]
  onSelect: (id: string) => void
  onOpenProvisionalEntry: (comp: Competition) => void
  onOpenDefinitiveEntry: (comp: Competition) => void
}) {
  const t = useT('CompetitionListView', lang)
  const teamIds = new Set(teams.map((tm) => tm.id))

  const visible = competitions.filter((c) =>
    c.status === 'provisional_entry' ||
    c.status === 'definitive_entry' ||
    c.status === 'registration_open' ||
    entries.some((e) => e.competition_id === c.id && teamIds.has(e.team_id))
  )

  if (visible.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-16">{t.empty}</p>
  }

  function buildSummaryRows(competitionId: string, tpc: Record<string, number>): EntrySummaryRow[] {
    const comp = competitions.find(c => c.id === competitionId)
    if (!comp) return []
    return comp.age_groups.flatMap(agId => {
      const rule = ageGroupRules.find(r => r.id === agId)
      if (!rule) return []
      return categoriesForRuleset(rule.level)
        .map(cat => ({ label: `${rule.age_group} · ${cat}`, count: tpc[`${agId}|${cat}`] ?? 0 }))
        .filter(r => r.count > 0)
    })
  }

  return (
    <div className="space-y-3">
      {visible.map((comp) => {
        const registeredCount = entries.filter(
          (e) => e.competition_id === comp.id && teamIds.has(e.team_id)
        ).length
        const nominatedCount = nominations.filter((n) => n.competition_id === comp.id).length
        const needsJudge = comp.status === 'registration_open' && registeredCount > 0 && nominatedCount === 0
        const dateStr = formatDateRange(comp.start_date, comp.end_date)
        const isProvisionalEntry = comp.status === 'provisional_entry'
        const isDefinitiveEntry = comp.status === 'definitive_entry'
        const provEntry = clubProvisionalEntries[comp.id]
        const defEntry = clubDefinitiveEntries[comp.id]
        return (
          <div key={comp.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all group">
            <button onClick={() => onSelect(comp.id)} className="w-full text-left px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={['px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1', STATUS_BADGE[comp.status]].join(' ')}>
                      {comp.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                      {t.status[comp.status]}
                    </span>
                    {comp.status === 'registration_open' && (
                      <span className={['text-xs font-medium', registeredCount > 0 ? 'text-green-600' : 'text-slate-400'].join(' ')}>
                        {t.teamCount(registeredCount)}
                      </span>
                    )}
                    {needsJudge && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        ⚠ {t.judgesWarning}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{comp.name}</p>
                  <div className="flex flex-wrap gap-x-3 mt-1">
                    {comp.location && <span className="text-xs text-slate-400">{comp.location}</span>}
                    {dateStr && <span className="text-xs text-slate-400">{dateStr}</span>}
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>

            {isProvisionalEntry && (
              <div className="px-5 pb-4">
                <button
                  onClick={() => onOpenProvisionalEntry(comp)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 transition-all text-center">
                  {lang === 'es' ? 'Inscripción provisional →' : 'Provisional entry →'}
                </button>
                {provEntry && (
                  <EntrySummary
                    lang={lang}
                    rows={buildSummaryRows(comp.id, provEntry.teams_per_category)}
                    accentClass="border-violet-200 text-violet-700 bg-violet-50/60"
                  />
                )}
              </div>
            )}

            {isDefinitiveEntry && (
              <div className="px-5 pb-4">
                <button
                  onClick={() => onOpenDefinitiveEntry(comp)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 transition-all text-center">
                  {lang === 'es' ? 'Inscripción definitiva →' : 'Definitive entry →'}
                </button>
                {defEntry && (
                  <EntrySummary
                    lang={lang}
                    rows={buildSummaryRows(comp.id, defEntry.teams_per_category)}
                    accentClass="border-orange-200 text-orange-700 bg-orange-50/60"
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
