'use client'

import { useState, useEffect } from 'react'
import type { Lang } from '../aj-scoring/types'
import type { MockPerf, RoutineResult } from '../cjp/types'

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
    team: 'Pareja',
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

// ─── individual routine ranking ───────────────────────────────────────────────

function GroupRanking({ rows, results, t }: {
  rows: MockPerf[]
  results: Record<string, RoutineResult>
  t: typeof T['en']
}) {
  return (
    <div className="px-2 sm:px-4 py-3">
      <table className="w-full hidden sm:table">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-14">#</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.team}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.eScore}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.aScore}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.dScore}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.pen}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.total}</th>
            <th className="w-16"></th>
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
                  <p className="font-semibold text-slate-800 text-base">{perf.gymnasts}</p>
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
                  <span className={['text-xl font-bold tabular-nums', isProvisional ? 'text-amber-600' : 'text-slate-800'].join(' ')}>
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
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{perf.gymnasts}</p>
                <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                  E {(r.eScore * 2).toFixed(3)} · A {r.aScore.toFixed(3)} · D {r.difScore.toFixed(2)}
                  {totalPen > 0 && <span className="text-red-400"> · −{totalPen.toFixed(1)}</span>}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={['text-xl font-bold tabular-nums', isProvisional ? 'text-amber-600' : 'text-slate-800'].join(' ')}>
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

function AllRoundRanking({ entries, t }: {
  entries: AllRoundEntry[]
  t: typeof T['en']
}) {
  return (
    <div className="px-2 sm:px-4 py-3">
      <table className="w-full hidden sm:table">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-14">#</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.team}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.balance}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.dynamic}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.total}</th>
            <th className="w-16"></th>
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
                  <p className="font-semibold text-slate-800 text-base">{entry.gymnasts}</p>
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-mono text-slate-600">{entry.balanceScore.toFixed(3)}</td>
                <td className="px-3 py-3 text-right tabular-nums font-mono text-slate-600">{entry.dynamicScore.toFixed(3)}</td>
                <td className="px-3 py-3 text-right">
                  <span className={['text-xl font-bold tabular-nums', entry.isProvisional ? 'text-amber-600' : 'text-slate-800'].join(' ')}>
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

      <div className="sm:hidden space-y-2">
        {entries.map((entry, rank) => {
          const medal = rank < 3 ? MEDALS[rank] : null
          return (
            <div key={entry.gymnasts} className={[
              'flex items-center gap-3 px-3 py-3 rounded-xl',
              medal ? medal.row : entry.isProvisional ? 'bg-amber-50/60' : 'bg-slate-50',
            ].join(' ')}>
              <RankCircle rank={rank + 1} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{entry.gymnasts}</p>
                <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                  {t.balance} {entry.balanceScore.toFixed(3)} · {t.dynamic} {entry.dynamicScore.toFixed(3)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={['text-xl font-bold tabular-nums', entry.isProvisional ? 'text-amber-600' : 'text-slate-800'].join(' ')}>
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
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-slate-50 transition-colors text-left"
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
      {isOpen && children}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export type ResultsViewProps = {
  performances: MockPerf[]
  results: Record<string, RoutineResult>
  lang: Lang
}

export default function ResultsView({ performances, results, lang }: ResultsViewProps) {
  const t = T[lang]

  const routineLabel = (rt: string) =>
    ({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined }[rt] ?? rt)

  const groupKey = (p: MockPerf) => `${p.ageGroup}||${p.category}||${p.routineType}`
  const categoryKey = (p: MockPerf) => `${p.ageGroup}||${p.category}`
  const allRoundKey = (p: MockPerf) => `${p.ageGroup}||${p.category}||ALL_ROUND`

  // ── build section list ──
  // Ordered as they appear in performance list, with all-around appended after
  // each ageGroup+category block that qualifies

  const routineGroups: string[] = []
  for (const p of performances) {
    const k = groupKey(p)
    if (!routineGroups.includes(k) && results[p.id]) routineGroups.push(k)
  }

  // Detect ageGroup+category combos that have results for BOTH Balance AND Dynamic
  const categoryHasBalance = new Set<string>()
  const categoryHasDynamic = new Set<string>()
  for (const p of performances) {
    if (!results[p.id]) continue
    const ck = categoryKey(p)
    if (p.routineType === 'Balance') categoryHasBalance.add(ck)
    if (p.routineType === 'Dynamic') categoryHasDynamic.add(ck)
  }
  const allRoundCategories = new Set(
    [...categoryHasBalance].filter((ck) => categoryHasDynamic.has(ck))
  )

  // Build ordered section keys: inject all-round key right after the last routine
  // of its ageGroup+category block
  const sectionKeys: string[] = []
  const seenCategories = new Set<string>()
  for (const k of routineGroups) {
    sectionKeys.push(k)
    const ck = k.split('||').slice(0, 2).join('||')
    // If this is the last routine group for this category, add all-round after it
    const remaining = routineGroups.slice(routineGroups.indexOf(k) + 1)
    const hasMoreInCategory = remaining.some((rk) => rk.startsWith(ck + '||'))
    if (!hasMoreInCategory && allRoundCategories.has(ck) && !seenCategories.has(ck)) {
      seenCategories.add(ck)
      sectionKeys.push(allRoundKey(performances.find((p) => categoryKey(p) === ck)!))
    }
  }

  const [openSections, setOpenSections] = useState<Set<string>>(new Set(sectionKeys))

  useEffect(() => {
    setOpenSections((prev) => {
      const newKeys = sectionKeys.filter((k) => !prev.has(k))
      if (newKeys.length === 0) return prev
      return new Set([...prev, ...newKeys])
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKeys.length])

  function toggleSection(k: string) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      next.has(k) ? next.delete(k) : next.add(k)
      return next
    })
  }

  // ── compute all-round entries per qualifying category ──
  function getAllRoundEntries(ck: string): AllRoundEntry[] {
    const [ageGroup, category] = ck.split('||')
    const balancePerfs = performances.filter(
      (p) => p.ageGroup === ageGroup && p.category === category && p.routineType === 'Balance' && results[p.id]
    )
    const dynamicPerfs = performances.filter(
      (p) => p.ageGroup === ageGroup && p.category === category && p.routineType === 'Dynamic' && results[p.id]
    )

    const entries: AllRoundEntry[] = []
    for (const bp of balancePerfs) {
      const dp = dynamicPerfs.find((d) => d.gymnasts === bp.gymnasts)
      if (!dp) continue
      const br = results[bp.id]
      const dr = results[dp.id]
      entries.push({
        gymnasts: bp.gymnasts,
        balanceScore: br.finalScore,
        dynamicScore: dr.finalScore,
        total: parseFloat((br.finalScore + dr.finalScore).toFixed(3)),
        isProvisional: br.status === 'provisional' || dr.status === 'provisional',
      })
    }
    return entries.sort((a, b) => b.total - a.total)
  }

  // ── no results ──
  if (sectionKeys.length === 0) {
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
    <div className="min-h-screen bg-slate-50 divide-y divide-slate-200">
      {sectionKeys.map((k) => {
        const isAllRound = k.endsWith('||ALL_ROUND')

        if (isAllRound) {
          const ck = k.replace('||ALL_ROUND', '')
          const entries = getAllRoundEntries(ck)
          if (entries.length === 0) return null
          const [ageGroup, category] = ck.split('||')
          const label = `${ageGroup} · ${category} · ${t.allRound}`
          const hasProvisional = entries.some((e) => e.isProvisional)

          return (
            <AccordionSection
              key={k}
              label={label}
              count={entries.length}
              hasProvisional={hasProvisional}
              isOpen={openSections.has(k)}
              onToggle={() => toggleSection(k)}
              t={t}
            >
              <AllRoundRanking entries={entries} t={t} />
            </AccordionSection>
          )
        }

        // regular routine section
        const rows = performances
          .filter((p) => groupKey(p) === k && results[p.id])
          .sort((a, b) => (results[b.id]?.finalScore ?? 0) - (results[a.id]?.finalScore ?? 0))

        const perf = performances.find((p) => groupKey(p) === k)!
        const label = `${perf.ageGroup} · ${perf.category} · ${routineLabel(perf.routineType)}`
        const hasProvisional = rows.some((p) => results[p.id]?.status === 'provisional')

        return (
          <AccordionSection
            key={k}
            label={label}
            count={rows.length}
            hasProvisional={hasProvisional}
            isOpen={openSections.has(k)}
            onToggle={() => toggleSection(k)}
            t={t}
          >
            <GroupRanking rows={rows} results={results} t={t} />
          </AccordionSection>
        )
      })}
    </div>
  )
}
