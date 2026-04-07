'use client'

import { useState, useEffect } from 'react'
import type { Lang } from '../aj-scoring/types'
import type { MockPerf, RoutineResult } from '../cjp/types'
import { categoryLabel } from '@/components/admin/types'

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    balance: 'Balance',
    dynamic: 'Dynamic',
    combined: 'Combined',
    allRound: 'All-Around',
    team: 'Team',
    eScore: 'E',
    aScore: 'A',
    dScore: 'D',
    pen: 'Pen.',
    total: 'Total',
    prov: 'PROV',
    someProvisional: 'provisional',
    result: (n: number) => `${n} result${n !== 1 ? 's' : ''}`,
    noResults: 'No results yet',
    noResultsSub: 'Scores will appear here as they are submitted.',
  },
  es: {
    balance: 'Equilibrio',
    dynamic: 'Dinámico',
    combined: 'Combinado',
    allRound: 'All-Around',
    team: 'Equipo',
    eScore: 'E',
    aScore: 'A',
    dScore: 'D',
    pen: 'Pen.',
    total: 'Total',
    prov: 'PROV',
    someProvisional: 'provisional',
    result: (n: number) => `${n} resultado${n !== 1 ? 's' : ''}`,
    noResults: 'Sin resultados',
    noResultsSub: 'Las puntuaciones aparecerán aquí a medida que se envíen.',
  },
}

// ─── types ────────────────────────────────────────────────────────────────────

type AllRoundEntry = {
  gymnasts: string
  teamId: string
  balanceScore: number
  dynamicScore: number
  total: number
  isProvisional: boolean
}

// ─── medal styles ─────────────────────────────────────────────────────────────

const MEDALS = [
  { circle: 'bg-yellow-400 text-white', row: 'bg-yellow-50'  },
  { circle: 'bg-slate-400 text-white',  row: 'bg-slate-50'   },
  { circle: 'bg-amber-600 text-white',  row: 'bg-amber-50'   },
]

function RankCircle({ rank }: { rank: number }) {
  const medal = rank <= 3 ? MEDALS[rank - 1] : null
  if (medal) {
    return (
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${medal.circle}`}>
        {rank}
      </div>
    )
  }
  return (
    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-400 shrink-0">
      {rank}
    </div>
  )
}

function ClubAvatar({ url }: { url: string | null | undefined }) {
  if (!url) return null
  return <img src={url} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
}

// ─── individual routine ranking ───────────────────────────────────────────────
// Uses table-fixed + explicit column widths to guarantee pixel-level alignment
// across all sections on the page.

function GroupRanking({ rows, results, t, clubAvatarByTeam }: {
  rows: MockPerf[]
  results: Record<string, RoutineResult>
  t: typeof T['en']
  clubAvatarByTeam: Record<string, string | null>
}) {
  return (
    <div className="px-2 sm:px-4 py-3">
      {/* desktop */}
      <table className="w-full table-fixed hidden sm:table">
        <colgroup>
          <col className="w-14" />        {/* # */}
          <col />                          {/* team — fills remaining */}
          <col className="w-20" />        {/* E */}
          <col className="w-20" />        {/* A */}
          <col className="w-20" />        {/* D */}
          <col className="w-20" />        {/* Pen */}
          <col className="w-24" />        {/* Total */}
          <col className="w-16" />        {/* PROV badge */}
        </colgroup>
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">#</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.team}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.eScore}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.aScore}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.dScore}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.pen}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.total}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((perf, rank) => {
            const r = results[perf.id]!
            const totalPen = r.difPenalty + r.cjpPenalty
            const isProvisional = r.status === 'provisional'
            const medal = rank < 3 ? MEDALS[rank] : null
            return (
              <tr key={perf.id} className={[
                'border-b border-slate-50',
                medal ? medal.row : '',
                isProvisional && !medal ? 'bg-amber-50/40' : '',
              ].join(' ')}>
                <td className="px-3 py-3"><RankCircle rank={rank + 1} /></td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <ClubAvatar url={clubAvatarByTeam[perf.teamId]} />
                    <p className="font-semibold text-slate-800 text-base break-words">{perf.gymnasts}</p>
                  </div>
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-mono text-slate-600">{(r.eScore * 2).toFixed(3)}</td>
                <td className="px-3 py-3 text-right tabular-nums font-mono text-slate-600">{r.aScore.toFixed(3)}</td>
                <td className="px-3 py-3 text-right tabular-nums font-mono text-slate-600">{r.difScore.toFixed(2)}</td>
                <td className="px-3 py-3 text-right tabular-nums font-mono">
                  <span className={totalPen > 0 ? 'text-red-500' : 'text-slate-300'}>
                    {totalPen > 0 ? `−${totalPen.toFixed(1)}` : '—'}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className={['text-xl font-bold tabular-nums print:text-sm', isProvisional ? 'text-amber-600' : 'text-slate-800'].join(' ')}>
                    {r.finalScore.toFixed(3)}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  {isProvisional && (
                    <span className="text-xs font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">{t.prov}</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* mobile */}
      <div className="sm:hidden space-y-2">
        {rows.map((perf, rank) => {
          const r = results[perf.id]!
          const totalPen = r.difPenalty + r.cjpPenalty
          const isProvisional = r.status === 'provisional'
          const medal = rank < 3 ? MEDALS[rank] : null
          return (
            <div key={perf.id} className={[
              'flex items-center gap-3 px-3 py-3 rounded-xl',
              medal ? medal.row : isProvisional ? 'bg-amber-50/60' : 'bg-slate-50',
            ].join(' ')}>
              <RankCircle rank={rank + 1} />
              <ClubAvatar url={clubAvatarByTeam[perf.teamId]} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 break-words">{perf.gymnasts}</p>
                <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                  E {(r.eScore * 2).toFixed(3)} · A {r.aScore.toFixed(3)} · D {r.difScore.toFixed(2)}
                  {totalPen > 0 && <span className="text-red-400"> · −{totalPen.toFixed(1)}</span>}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={['text-xl font-bold tabular-nums print:text-sm', isProvisional ? 'text-amber-600' : 'text-slate-800'].join(' ')}>
                  {r.finalScore.toFixed(3)}
                </p>
                {isProvisional && <span className="text-xs font-bold text-amber-500">{t.prov}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── all-around ranking ───────────────────────────────────────────────────────

function AllRoundRanking({ entries, t, clubAvatarByTeam }: {
  entries: AllRoundEntry[]
  t: typeof T['en']
  clubAvatarByTeam: Record<string, string | null>
}) {
  return (
    <div className="px-2 sm:px-4 py-3">
      {/* desktop */}
      <table className="w-full table-fixed hidden sm:table">
        <colgroup>
          <col className="w-14" />   {/* # */}
          <col />                     {/* team */}
          <col className="w-24" />   {/* Balance */}
          <col className="w-24" />   {/* Dynamic */}
          <col className="w-24" />   {/* Total */}
          <col className="w-16" />   {/* PROV */}
        </colgroup>
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">#</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.team}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.balance}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.dynamic}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.total}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, rank) => {
            const medal = rank < 3 ? MEDALS[rank] : null
            return (
              <tr key={entry.gymnasts} className={[
                'border-b border-slate-50',
                medal ? medal.row : '',
                entry.isProvisional && !medal ? 'bg-amber-50/40' : '',
              ].join(' ')}>
                <td className="px-3 py-3"><RankCircle rank={rank + 1} /></td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <ClubAvatar url={clubAvatarByTeam[entry.teamId]} />
                    <p className="font-semibold text-slate-800 text-base break-words">{entry.gymnasts}</p>
                  </div>
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-mono text-slate-600">{entry.balanceScore.toFixed(3)}</td>
                <td className="px-3 py-3 text-right tabular-nums font-mono text-slate-600">{entry.dynamicScore.toFixed(3)}</td>
                <td className="px-3 py-3 text-right">
                  <span className={['text-xl font-bold tabular-nums print:text-sm', entry.isProvisional ? 'text-amber-600' : 'text-slate-800'].join(' ')}>
                    {entry.total.toFixed(3)}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  {entry.isProvisional && (
                    <span className="text-xs font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">{t.prov}</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* mobile */}
      <div className="sm:hidden space-y-2">
        {entries.map((entry, rank) => {
          const medal = rank < 3 ? MEDALS[rank] : null
          return (
            <div key={entry.gymnasts} className={[
              'flex items-center gap-3 px-3 py-3 rounded-xl',
              medal ? medal.row : entry.isProvisional ? 'bg-amber-50/60' : 'bg-slate-50',
            ].join(' ')}>
              <RankCircle rank={rank + 1} />
              <ClubAvatar url={clubAvatarByTeam[entry.teamId]} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 break-words">{entry.gymnasts}</p>
                <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                  {t.balance} {entry.balanceScore.toFixed(3)} · {t.dynamic} {entry.dynamicScore.toFixed(3)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={['text-xl font-bold tabular-nums print:text-sm', entry.isProvisional ? 'text-amber-600' : 'text-slate-800'].join(' ')}>
                  {entry.total.toFixed(3)}
                </p>
                {entry.isProvisional && <span className="text-xs font-bold text-amber-500">{t.prov}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── tab bar within an accordion ─────────────────────────────────────────────

const ROUTINE_ORDER = ['Balance', 'Dynamic', 'Combined']

function RoutineTabs({ tabs, activeTab, onSelect }: {
  tabs: string[]
  activeTab: string
  onSelect: (tab: string) => void
}) {
  return (
    <div className="flex border-b border-slate-100 overflow-x-auto print:hidden">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={[
            'px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all shrink-0',
            activeTab === tab
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-600',
          ].join(' ')}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

// ─── accordion section ────────────────────────────────────────────────────────

function AccordionSection({ label, count, hasProvisional, isOpen, onToggle, children, t }: {
  label: string
  count: number
  hasProvisional: boolean
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
  t: typeof T['en']
}) {
  return (
    <div className="bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-slate-50 transition-colors text-left print:hidden"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-bold text-slate-800 text-base sm:text-lg truncate">{label}</span>
          <span className="text-xs text-slate-400 shrink-0">{t.result(count)}</span>
          {hasProvisional && (
            <span className="text-xs font-semibold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full shrink-0">
              {t.someProvisional}
            </span>
          )}
        </div>
        <svg
          className={['w-5 h-5 text-slate-400 transition-transform shrink-0 ml-3', isOpen ? 'rotate-180' : ''].join(' ')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* Always in DOM so print can show all sections; hidden visually when closed */}
      <div className={['print:block', isOpen ? '' : 'hidden'].join(' ')}>
        {/* Section title shown only in print (replaces the hidden button) */}
        <div className="hidden print:block px-4 pt-4 pb-1">
          <span className="font-bold text-slate-800 text-base">{label}</span>
          {hasProvisional && (
            <span className="ml-2 text-xs font-semibold text-amber-600">({t.someProvisional})</span>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── category block with optional tabs ───────────────────────────────────────

function CategoryBlock({
  ageGroup, category, performances, results, t, clubAvatarByTeam,
}: {
  ageGroup: string
  category: string
  performances: MockPerf[]
  results: Record<string, RoutineResult>
  t: typeof T['en']
  clubAvatarByTeam: Record<string, string | null>
}) {
  const routineLabel = (rt: string) =>
    ({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined }[rt] ?? rt)

  // Routine types that have at least one result, in fixed order
  const routineTypes = ROUTINE_ORDER.filter(rt =>
    performances.some(p => p.routineType === rt && results[p.id])
  )

  // All-round: Balance + Dynamic both present
  const hasAllRound = routineTypes.includes('Balance') && routineTypes.includes('Dynamic')

  // Tabs list: routines + all-round at end
  const tabs = [...routineTypes.map(rt => routineLabel(rt))]
  if (hasAllRound) tabs.push(t.allRound)

  const [activeTab, setActiveTab] = useState(tabs[0] ?? '')

  // If activeTab is no longer in tabs (shouldn't happen), reset
  const resolvedTab = tabs.includes(activeTab) ? activeTab : (tabs[0] ?? '')

  function getAllRoundEntries(): AllRoundEntry[] {
    const balancePerfs = performances.filter(p => p.routineType === 'Balance' && results[p.id])
    const dynamicPerfs = performances.filter(p => p.routineType === 'Dynamic' && results[p.id])
    const entries: AllRoundEntry[] = []
    for (const bp of balancePerfs) {
      const dp = dynamicPerfs.find(d => d.gymnasts === bp.gymnasts)
      if (!dp) continue
      const br = results[bp.id]
      const dr = results[dp.id]
      entries.push({
        gymnasts: bp.gymnasts,
        teamId: bp.teamId,
        balanceScore: br.finalScore,
        dynamicScore: dr.finalScore,
        total: parseFloat((br.finalScore + dr.finalScore).toFixed(3)),
        isProvisional: br.status === 'provisional' || dr.status === 'provisional',
      })
    }
    return entries.sort((a, b) => b.total - a.total)
  }

  // With only 1 routine and no all-round: render directly without tabs
  if (tabs.length === 1) {
    const rt = routineTypes[0]
    const rows = performances
      .filter(p => p.routineType === rt && results[p.id])
      .sort((a, b) => (results[b.id]?.finalScore ?? 0) - (results[a.id]?.finalScore ?? 0))
    return <GroupRanking rows={rows} results={results} t={t} clubAvatarByTeam={clubAvatarByTeam} />
  }

  // Multi-routine: show tab bar (hidden in print) + all panels always in DOM
  return (
    <>
      <RoutineTabs tabs={tabs} activeTab={resolvedTab} onSelect={setActiveTab} />
      {/* In print, show every tab panel one after another; on screen, show only active */}
      {tabs.map(tab => {
        const isActive = tab === resolvedTab
        let content: React.ReactNode
        if (tab === t.allRound) {
          const entries = getAllRoundEntries()
          content = <AllRoundRanking entries={entries} t={t} clubAvatarByTeam={clubAvatarByTeam} />
        } else {
          const rt = ROUTINE_ORDER.find(r => routineLabel(r) === tab) ?? routineTypes[0]
          const rows = performances
            .filter(p => p.routineType === rt && results[p.id])
            .sort((a, b) => (results[b.id]?.finalScore ?? 0) - (results[a.id]?.finalScore ?? 0))
          content = <GroupRanking rows={rows} results={results} t={t} clubAvatarByTeam={clubAvatarByTeam} />
        }
        return (
          <div key={tab} className={['print:block', isActive ? '' : 'hidden'].join(' ')}>
            {/* Tab label shown only in print */}
            <p className="hidden print:block px-4 pt-3 pb-1 text-sm font-semibold text-slate-500">{tab}</p>
            {content}
          </div>
        )
      })}
    </>
  )
}

// ─── ruleset tab order ────────────────────────────────────────────────────────

const RULESET_ORDER = ['Escolar', 'Base', 'Nacional']

// ─── main component ───────────────────────────────────────────────────────────

function getRuleset(ageGroup: string): string {
  if (ageGroup.includes('Escolar')) return 'Escolar'
  if (ageGroup.includes('Base')) return 'Base'
  return 'Nacional'
}

export type ResultsViewProps = {
  performances: MockPerf[]
  results: Record<string, RoutineResult>
  lang: Lang
  clubAvatarByTeam?: Record<string, string | null>
  agSortOrder?: Record<string, number>  // ageGroup label → sort_order
}

export default function ResultsView({ performances, results, lang, clubAvatarByTeam = {}, agSortOrder = {} }: ResultsViewProps) {
  const t = T[lang]

  const routineLabel = (rt: string) =>
    ({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined }[rt] ?? rt)

  // Build unique ageGroup+category keys with at least one result, sorted by sort_order desc
  const allCategoryKeys: string[] = []
  for (const p of performances) {
    const ck = `${p.ageGroup}||${p.category}`
    if (!allCategoryKeys.includes(ck) && performances.some(q => q.ageGroup === p.ageGroup && q.category === p.category && results[q.id])) {
      allCategoryKeys.push(ck)
    }
  }
  allCategoryKeys.sort((a, b) => {
    const [agA] = a.split('||')
    const [agB] = b.split('||')
    return (agSortOrder[agB] ?? 0) - (agSortOrder[agA] ?? 0)
  })

  // Determine which rulesets have results (in fixed display order)
  const activeRulesets = RULESET_ORDER.filter(rs =>
    allCategoryKeys.some(ck => {
      const [ag] = ck.split('||')
      return getRuleset(ag) === rs
    })
  )

  const [activeRuleset, setActiveRuleset] = useState<string>('')

  // When activeRulesets changes (data loads), pick the first one
  useEffect(() => {
    if (activeRulesets.length > 0 && !activeRulesets.includes(activeRuleset)) {
      setActiveRuleset(activeRulesets[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRulesets.join(',')])

  const resolvedRuleset = activeRulesets.includes(activeRuleset) ? activeRuleset : (activeRulesets[0] ?? '')

  // Filter category keys to the active ruleset tab
  const categoryKeys = resolvedRuleset
    ? allCategoryKeys.filter(ck => {
        const [ag] = ck.split('||')
        return getRuleset(ag) === resolvedRuleset
      })
    : allCategoryKeys

  const [openSections, setOpenSections] = useState<Set<string>>(new Set())

  function toggleSection(k: string) {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      return next
    })
  }

  if (categoryKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-3 px-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5m-9 4.5v-4.5m0 0A2.25 2.25 0 019.75 12h4.5A2.25 2.25 0 0116.5 14.25m-9 0V12a4.5 4.5 0 119 0v2.25" />
          </svg>
        </div>
        <p className="text-xl font-semibold text-slate-500">{t.noResults}</p>
        <p className="text-sm text-slate-400 max-w-xs">{t.noResultsSub}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ruleset tabs */}
      {activeRulesets.length > 1 && (
        <div className="bg-white border-b border-slate-200 sticky top-[49px] z-10 print:hidden">
          <div className="max-w-3xl mx-auto px-4 flex">
            {activeRulesets.map(rs => (
              <button
                key={rs}
                onClick={() => setActiveRuleset(rs)}
                className={[
                  'px-5 py-3 text-sm font-semibold border-b-2 transition-all',
                  resolvedRuleset === rs
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600',
                ].join(' ')}
              >
                {rs}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-200">
      {categoryKeys.map(ck => {
        const [ageGroup, category] = ck.split('||')
        const catPerfs = performances.filter(p => p.ageGroup === ageGroup && p.category === category)

        // Routine types with at least one result
        const routineTypes = ROUTINE_ORDER.filter(rt =>
          catPerfs.some(p => p.routineType === rt && results[p.id])
        )
        const hasAllRound = routineTypes.includes('Balance') && routineTypes.includes('Dynamic')

        // Count: total number of results in this category
        const totalResults = catPerfs.filter(p => results[p.id]).length
        const hasProvisional = catPerfs.some(p => results[p.id]?.status === 'provisional')
        const label = `${ageGroup} · ${categoryLabel(category, lang)}`

        return (
          <AccordionSection
            key={ck}
            label={label}
            count={totalResults}
            hasProvisional={hasProvisional}
            isOpen={openSections.has(ck)}
            onToggle={() => toggleSection(ck)}
            t={t}
          >
            <CategoryBlock
              ageGroup={ageGroup}
              category={category}
              performances={catPerfs}
              results={results}
              t={t}
              clubAvatarByTeam={clubAvatarByTeam}
            />
          </AccordionSection>
        )
      })}
      </div>
    </div>
  )
}
