'use client'

import { useState, useEffect, type ReactNode } from 'react'
import type { Lang } from '../scoring/types'
import type { ScoringPerformance, RoutineResult } from '../scoring/types'
import { categoryLabel } from '@/components/admin/types'
import { getResultsRuleset } from '@/lib/resultsRuleset'
import {
  computeClubTrophyRanking,
  type TeamClubInfo,
  type ClubTrophyRow,
  type ClubTrophyTopEntry,
} from '@/lib/clubTrophyRanking'
import type { OpenCombinadosActaData } from '@/lib/openCombinadosBracket'
import type { ResultsPageCompetitionMeta } from '@/lib/loadResultsPageBundle'

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
    combinedCategories: 'Combined categories',
    trophyEscolar: 'Gondomar Trophy — Escolar',
    trophyBase: 'Gondomar Trophy — Base',
    trophyExplain:
      'Club ranking: sum of the three highest routine scores in this block (each Balance / Dynamic / Combined routine counts once).',
    trophyClub: 'Club',
    trophyTop3: 'Total (best 3)',
    trophyBreakdown: 'Top scores',
    trophyRoutines: 'Routines',
    finishedCompetition: 'Finished competition',
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
    combinedCategories: 'Categorías combinadas',
    trophyEscolar: 'Trofeo Gondomar — Escolar',
    trophyBase: 'Trofeo Gondomar — Base',
    trophyExplain:
      'Clasificación por club: suma de las tres mejores puntuaciones de rutina en este bloque (cada rutina de equilibrio, dinámico o combinado cuenta una vez).',
    trophyClub: 'Club',
    trophyTop3: 'Total (3 mejores)',
    trophyBreakdown: 'Puntuaciones',
    trophyRoutines: 'Rutinas',
    finishedCompetition: 'Competición finalizada',
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

const MONTH_NAMES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'] as const
const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const

function parseDateParts(raw: string): { y: number; m: number; d: number } | null {
  const trimmed = raw.trim()
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return { y: +iso[1], m: +iso[2], d: +iso[3] }
  const slash = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
  if (slash) return { y: +slash[3], m: +slash[2], d: +slash[1] }
  return null
}

/** e.g. Spanish "5 Mayo 2026", English "5 May 2026" (day without leading zero). */
function formatCalendarDateLong(raw: string, lang: Lang): string | null {
  const p = parseDateParts(raw)
  if (!p) return null
  const monthRaw = lang === 'es' ? MONTH_NAMES_ES[p.m - 1] : MONTH_NAMES_EN[p.m - 1]
  const month = lang === 'es' ? monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1) : monthRaw
  return `${p.d} ${month} ${p.y}`
}

/** Range uses en dash between dates when end ≠ start (same rule as competition page). */
function formatCompetitionDatesLong(meta: ResultsPageCompetitionMeta | null, lang: Lang): string | null {
  if (!meta?.start_date && !meta?.end_date) return null
  const startFmt = meta.start_date ? formatCalendarDateLong(meta.start_date, lang) : null
  if (meta.end_date && meta.end_date !== meta.start_date) {
    const endFmt = formatCalendarDateLong(meta.end_date, lang)
    if (startFmt && endFmt) return `${startFmt} – ${endFmt}`
    return endFmt ?? startFmt
  }
  return startFmt ?? (meta.end_date ? formatCalendarDateLong(meta.end_date, lang) : null)
}

function ResultsPrintSectionBanner({
  competitionMeta,
  sectionLabel,
  lang,
  officialDocument,
  hasProvisional,
  t,
}: {
  competitionMeta: ResultsPageCompetitionMeta | null
  sectionLabel: string
  lang: Lang
  officialDocument: boolean
  hasProvisional: boolean
  t: typeof T['en']
}) {
  const datesStr = formatCompetitionDatesLong(competitionMeta, lang)
  const name = competitionMeta?.name?.trim()
  const showLine1 = Boolean(name || datesStr)

  const logoUrl = competitionMeta?.logo_url?.trim()

  return (
    <div className="hidden print:flex print:items-start print:gap-4 px-4 sm:px-6 pt-4 pb-3 border-b border-slate-200">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className="h-14 w-auto max-w-[140px] shrink-0 object-contain object-left"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        {showLine1 ? (
          <p className="text-lg font-bold text-slate-800 break-words leading-snug">
            {name ? <span>{name}</span> : null}
            {name && datesStr ? <span className="font-normal text-slate-500"> · </span> : null}
            {datesStr ? <span className="font-semibold tabular-nums text-slate-800">{datesStr}</span> : null}
          </p>
        ) : null}
        <p className="font-bold text-slate-800 text-base mt-2 break-words leading-snug">
          {sectionLabel}
          {hasProvisional ? (
            <span className="ml-2 text-xs font-semibold text-amber-600">({t.someProvisional})</span>
          ) : null}
        </p>
        {officialDocument ? (
          <p className="text-xs text-slate-500 mt-2">
            {lang === 'en'
              ? 'Official results — approved scores only'
              : 'Resultados oficiales — solo puntuaciones aprobadas'}
          </p>
        ) : null}
        {competitionMeta?.status === 'finished' ? (
          <p className="text-xs font-semibold text-slate-600 mt-2">{t.finishedCompetition}</p>
        ) : null}
      </div>
    </div>
  )
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

function ClubAvatar({ url, className = '' }: { url: string | null | undefined; className?: string }) {
  if (!url) return null
  return <img src={url} alt="" className={['w-6 h-6 rounded-full object-cover shrink-0', className].filter(Boolean).join(' ')} />
}

function TeamGymnastsClubBlock({
  gymnasts,
  teamId,
  teamClubInfo,
  gymnastClassName,
}: {
  gymnasts: string
  teamId: string
  teamClubInfo: Record<string, TeamClubInfo>
  gymnastClassName: string
}) {
  const clubName = teamClubInfo[teamId]?.clubName?.trim()
  return (
    <div className="min-w-0">
      <p className={gymnastClassName}>{gymnasts}</p>
      {clubName ? (
        <p className="text-xs text-slate-500 mt-0.5 break-words print:hidden">{clubName}</p>
      ) : null}
    </div>
  )
}

function trophyRoutineLabel(routineType: string, t: typeof T['en']): string {
  return (
    ({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined } as Record<string, string>)[routineType] ??
    routineType
  )
}

/**
 * Club header + top-3 routine rows: col1 = details, col2 = scores (aligned with total).
 */
function ClubTrophyClubScoresTable({
  row,
  t,
  rankSlot,
  compactHeader,
}: {
  row: ClubTrophyRow
  t: typeof T['en']
  /** Mobile: rank (and avatar) in first cell with club name. */
  rankSlot?: ReactNode
  /** Slightly smaller total on narrow screens. */
  compactHeader?: boolean
}) {
  const totalSize = compactHeader ? 'text-lg' : 'text-xl print:text-lg'
  return (
    <table className="w-full table-fixed border-separate border-spacing-0">
      <colgroup>
        <col className="min-w-0" />
        <col className="w-[5.75rem] sm:w-24" />
      </colgroup>
      <tbody>
        <tr>
          <td className="align-middle py-0 pr-3">
            <div className="flex flex-wrap items-start gap-x-3 gap-y-2 min-w-0">
              {rankSlot}
              {!rankSlot ? <ClubAvatar url={row.clubAvatar} /> : null}
              <div className="min-w-0 flex-1">
                <p className="text-base leading-snug break-words">
                  <span className="font-semibold text-slate-800">{row.clubName || '—'}</span>
                  <span className="text-sm font-normal tabular-nums text-slate-500">
                    {' · '}
                    {t.trophyRoutines}: {row.routinesCounted}
                  </span>
                </p>
              </div>
            </div>
          </td>
          <td className="align-middle py-0 text-right align-bottom">
            <div className="flex flex-col items-end justify-center gap-1">
              <span
                className={[
                  totalSize,
                  'font-bold tabular-nums leading-none',
                  row.hasProvisional ? 'text-amber-600' : 'text-slate-800',
                ].join(' ')}
              >
                {row.sumTop3.toFixed(3)}
              </span>
              {row.hasProvisional ? (
                <span className="text-xs font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">{t.prov}</span>
              ) : null}
            </div>
          </td>
        </tr>
        {row.topEntries.map((e, idx) => (
          <tr key={`${e.gymnasts}-${e.ageGroup}-${e.routineType}-${e.score}-${idx}`}>
            <td className="align-bottom pt-3 border-t border-slate-100 pr-3">
              <div className="text-xs text-slate-400 leading-snug">
                {e.ageGroup} · {trophyRoutineLabel(e.routineType, t)}
              </div>
              <div className="text-sm font-medium text-slate-800 leading-snug mt-0.5 break-words">{e.gymnasts}</div>
            </td>
            <td className="align-bottom pt-3 border-t border-slate-100 text-right">
              <span
                className={[
                  'font-mono text-sm tabular-nums font-semibold',
                  e.isProvisional ? 'text-amber-600' : 'text-slate-800',
                ].join(' ')}
              >
                {e.score.toFixed(3)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ClubTrophyBlock({
  ruleset,
  performances,
  results,
  teamClubInfo,
  t,
}: {
  ruleset: 'Escolar' | 'Base'
  performances: ScoringPerformance[]
  results: Record<string, RoutineResult>
  teamClubInfo: Record<string, TeamClubInfo>
  t: typeof T['en']
}) {
  if (Object.keys(teamClubInfo).length === 0) return null
  const rows = computeClubTrophyRanking(performances, results, teamClubInfo, ruleset)
  if (rows.length === 0) return null

  const title = ruleset === 'Escolar' ? t.trophyEscolar : t.trophyBase

  return (
    <div className="bg-white border-t border-slate-200 print:break-inside-avoid">
      <div className="px-2 sm:px-4 py-4 sm:py-5">
        <h3 className="text-base sm:text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-4 max-w-2xl">{t.trophyExplain}</p>

        {/* desktop + print: rank column + stacked club header row + three score lines */}
        <table className="w-full max-w-full hidden sm:table print:table">
          <colgroup>
            <col className="w-14" />
            <col />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">#</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.trophyClub}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <ClubTrophyRowDesktop key={row.clubId} row={row} t={t} />
            ))}
          </tbody>
        </table>

        {/* mobile */}
        <div className="sm:hidden print:hidden space-y-2">
          {rows.map((row) => (
            <ClubTrophyRowMobile key={row.clubId} row={row} t={t} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ClubTrophyRowDesktop({ row, t }: { row: ClubTrophyRow; t: typeof T['en'] }) {
  const medal = row.rank <= 3 ? MEDALS[row.rank - 1] : null
  return (
    <tr className={['border-b border-slate-50', medal ? medal.row : '', row.hasProvisional && !medal ? 'bg-amber-50/40' : ''].join(' ')}>
      <td className="px-3 py-3 align-top">
        <RankCircle rank={row.rank} />
      </td>
      <td className="px-3 py-3 align-top">
        <ClubTrophyClubScoresTable row={row} t={t} />
      </td>
    </tr>
  )
}

function ClubTrophyRowMobile({ row, t }: { row: ClubTrophyRow; t: typeof T['en'] }) {
  const medal = row.rank <= 3 ? MEDALS[row.rank - 1] : null
  return (
    <div
      className={['px-3 py-3 rounded-xl', medal ? medal.row : row.hasProvisional ? 'bg-amber-50/60' : 'bg-slate-50'].join(' ')}
    >
      <ClubTrophyClubScoresTable
        row={row}
        t={t}
        compactHeader
        rankSlot={
          <div className="flex items-center gap-2 shrink-0">
            <RankCircle rank={row.rank} />
            <ClubAvatar url={row.clubAvatar} />
          </div>
        }
      />
    </div>
  )
}

// ─── individual routine ranking ───────────────────────────────────────────────
// Uses table-fixed + explicit column widths to guarantee pixel-level alignment
// across all sections on the page.

function GroupRanking({ rows, results, t, clubAvatarByTeam, teamClubInfo }: {
  rows: ScoringPerformance[]
  results: Record<string, RoutineResult>
  t: typeof T['en']
  clubAvatarByTeam: Record<string, string | null>
  teamClubInfo: Record<string, TeamClubInfo>
}) {
  return (
    <div className="px-2 sm:px-4 py-3">
      {/* desktop (also used for print — mobile cards hidden when printing) */}
      <table className="w-full max-w-full hidden sm:table print:table sm:table-fixed print:table-auto">
        <colgroup>
          <col className="w-14" />        {/* # */}
          <col />                          {/* team — fills remaining in print */}
          <col className="w-20 print:hidden" />
          <col className="w-20 print:hidden" />
          <col className="w-20 print:hidden" />
          <col className="w-20 print:hidden" />
          <col className="w-28 print:w-32" />
          <col className="w-16 print:hidden" />
        </colgroup>
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">#</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.team}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide print:hidden">{t.eScore}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide print:hidden">{t.aScore}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide print:hidden">{t.dScore}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide print:hidden">{t.pen}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">
              <span className="print:hidden">{t.total}</span>
            </th>
            <th className="print:hidden" />
          </tr>
        </thead>
        <tbody>
          {rows.map((perf, rank) => {
            const r = results[perf.id]!
            const totalPen = r.difPenalty + r.cjpPenalty
            const isProvisional = r.status === 'provisional'
            const medal = rank < 3 ? MEDALS[rank] : null
            const clubName = teamClubInfo[perf.teamId]?.clubName?.trim()
            return (
              <tr key={perf.id} className={[
                'border-b border-slate-50',
                medal ? medal.row : '',
                isProvisional && !medal ? 'bg-amber-50/40' : '',
              ].join(' ')}>
                <td className="px-3 py-3"><RankCircle rank={rank + 1} /></td>
                <td className="px-3 py-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <ClubAvatar url={clubAvatarByTeam[perf.teamId]} className="print:hidden" />
                    <div className="min-w-0">
                      <TeamGymnastsClubBlock
                        gymnasts={perf.gymnasts}
                        teamId={perf.teamId}
                        teamClubInfo={teamClubInfo}
                        gymnastClassName="font-semibold text-slate-800 text-base break-words"
                      />
                      <p className="hidden print:block mt-1 break-words leading-relaxed">
                        {clubName ? (
                          <span className="text-[11px] text-slate-500 align-baseline">{clubName}</span>
                        ) : null}
                        {clubName ? <span className="text-[11px] text-slate-400"> · </span> : null}
                        <span className="text-sm tabular-nums text-slate-800 font-medium align-baseline">
                          {t.eScore} {(r.eScore * 2).toFixed(3)} · {t.aScore} {r.aScore.toFixed(3)} · {t.dScore} {r.difScore.toFixed(2)}
                          {totalPen > 0 ? (
                            <span className="text-red-500"> · {t.pen} −{totalPen.toFixed(1)}</span>
                          ) : (
                            <span className="text-slate-500"> · {t.pen} —</span>
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-mono text-slate-600 print:hidden">{(r.eScore * 2).toFixed(3)}</td>
                <td className="px-3 py-3 text-right tabular-nums font-mono text-slate-600 print:hidden">{r.aScore.toFixed(3)}</td>
                <td className="px-3 py-3 text-right tabular-nums font-mono text-slate-600 print:hidden">{r.difScore.toFixed(2)}</td>
                <td className="px-3 py-3 text-right tabular-nums font-mono print:hidden">
                  <span className={totalPen > 0 ? 'text-red-500' : 'text-slate-300'}>
                    {totalPen > 0 ? `−${totalPen.toFixed(1)}` : '—'}
                  </span>
                </td>
                <td className="px-3 py-3 text-right align-middle">
                  <div className="flex flex-col items-end justify-center gap-1">
                    <span
                      className={[
                        'font-bold tabular-nums leading-none text-xl sm:text-2xl print:text-xl print:leading-snug',
                        isProvisional ? 'text-amber-600' : 'text-slate-800',
                      ].join(' ')}
                    >
                      {r.finalScore.toFixed(3)}
                    </span>
                    {isProvisional ? (
                      <span className="hidden print:inline-flex text-xs font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">{t.prov}</span>
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-3 text-right print:hidden">
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
      <div className="sm:hidden print:hidden space-y-2">
        {rows.map((perf, rank) => {
          const r = results[perf.id]!
          const totalPen = r.difPenalty + r.cjpPenalty
          const isProvisional = r.status === 'provisional'
          const medal = rank < 3 ? MEDALS[rank] : null
          return (
            <div key={perf.id} className={[
              'flex items-start gap-3 px-3 py-3 rounded-xl',
              medal ? medal.row : isProvisional ? 'bg-amber-50/60' : 'bg-slate-50',
            ].join(' ')}>
              <RankCircle rank={rank + 1} />
              <ClubAvatar url={clubAvatarByTeam[perf.teamId]} />
              <div className="flex-1 min-w-0">
                <TeamGymnastsClubBlock
                  gymnasts={perf.gymnasts}
                  teamId={perf.teamId}
                  teamClubInfo={teamClubInfo}
                  gymnastClassName="font-semibold text-slate-800 break-words"
                />
                <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                  E {(r.eScore * 2).toFixed(3)} · A {r.aScore.toFixed(3)} · D {r.difScore.toFixed(2)}
                  {totalPen > 0 && <span className="text-red-400"> · −{totalPen.toFixed(1)}</span>}
                </p>
              </div>
              <div className="text-right shrink-0 self-center">
                <p className={['text-xl font-bold tabular-nums leading-none', isProvisional ? 'text-amber-600' : 'text-slate-800'].join(' ')}>
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

function AllRoundRanking({ entries, t, clubAvatarByTeam, teamClubInfo }: {
  entries: AllRoundEntry[]
  t: typeof T['en']
  clubAvatarByTeam: Record<string, string | null>
  teamClubInfo: Record<string, TeamClubInfo>
}) {
  return (
    <div className="px-2 sm:px-4 py-3">
      {/* desktop (also used for print) */}
      <table className="w-full max-w-full hidden sm:table print:table sm:table-fixed print:table-auto">
        <colgroup>
          <col className="w-14" />
          <col />
          <col className="w-24 print:hidden" />
          <col className="w-24 print:hidden" />
          <col className="w-28 print:w-32" />
          <col className="w-16 print:hidden" />
        </colgroup>
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">#</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.team}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide print:hidden">{t.balance}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide print:hidden">{t.dynamic}</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">
              <span className="print:hidden">{t.total}</span>
            </th>
            <th className="print:hidden" />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, rank) => {
            const medal = rank < 3 ? MEDALS[rank] : null
            const clubName = teamClubInfo[entry.teamId]?.clubName?.trim()
            return (
              <tr key={entry.gymnasts} className={[
                'border-b border-slate-50',
                medal ? medal.row : '',
                entry.isProvisional && !medal ? 'bg-amber-50/40' : '',
              ].join(' ')}>
                <td className="px-3 py-3"><RankCircle rank={rank + 1} /></td>
                <td className="px-3 py-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <ClubAvatar url={clubAvatarByTeam[entry.teamId]} className="print:hidden" />
                    <div className="min-w-0">
                      <TeamGymnastsClubBlock
                        gymnasts={entry.gymnasts}
                        teamId={entry.teamId}
                        teamClubInfo={teamClubInfo}
                        gymnastClassName="font-semibold text-slate-800 text-base break-words"
                      />
                      <p className="hidden print:block mt-1 break-words leading-relaxed">
                        {clubName ? (
                          <span className="text-[11px] text-slate-500 align-baseline">{clubName}</span>
                        ) : null}
                        {clubName ? <span className="text-[11px] text-slate-400"> · </span> : null}
                        <span className="text-sm tabular-nums text-slate-800 font-medium align-baseline">
                          {t.balance} {entry.balanceScore.toFixed(3)} · {t.dynamic} {entry.dynamicScore.toFixed(3)}
                        </span>
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-mono text-slate-600 print:hidden">{entry.balanceScore.toFixed(3)}</td>
                <td className="px-3 py-3 text-right tabular-nums font-mono text-slate-600 print:hidden">{entry.dynamicScore.toFixed(3)}</td>
                <td className="px-3 py-3 text-right align-middle">
                  <div className="flex flex-col items-end justify-center gap-1">
                    <span
                      className={[
                        'font-bold tabular-nums leading-none text-xl sm:text-2xl print:text-xl print:leading-snug',
                        entry.isProvisional ? 'text-amber-600' : 'text-slate-800',
                      ].join(' ')}
                    >
                      {entry.total.toFixed(3)}
                    </span>
                    {entry.isProvisional ? (
                      <span className="hidden print:inline-flex text-xs font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">{t.prov}</span>
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-3 text-right print:hidden">
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
      <div className="sm:hidden print:hidden space-y-2">
        {entries.map((entry, rank) => {
          const medal = rank < 3 ? MEDALS[rank] : null
          return (
            <div key={entry.gymnasts} className={[
              'flex items-start gap-3 px-3 py-3 rounded-xl',
              medal ? medal.row : entry.isProvisional ? 'bg-amber-50/60' : 'bg-slate-50',
            ].join(' ')}>
              <RankCircle rank={rank + 1} />
              <ClubAvatar url={clubAvatarByTeam[entry.teamId]} />
              <div className="flex-1 min-w-0">
                <TeamGymnastsClubBlock
                  gymnasts={entry.gymnasts}
                  teamId={entry.teamId}
                  teamClubInfo={teamClubInfo}
                  gymnastClassName="font-semibold text-slate-800 break-words"
                />
                <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                  {t.balance} {entry.balanceScore.toFixed(3)} · {t.dynamic} {entry.dynamicScore.toFixed(3)}
                </p>
              </div>
              <div className="text-right shrink-0 self-center">
                <p className={['text-xl font-bold tabular-nums leading-none', entry.isProvisional ? 'text-amber-600' : 'text-slate-800'].join(' ')}>
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

const ROUTINE_ORDER = ['Balance', 'Dynamic', 'Combined'] as const

function routineTypesWithResults(
  performances: ScoringPerformance[],
  results: Record<string, RoutineResult>,
): string[] {
  return ROUTINE_ORDER.filter((rt) =>
    performances.some((p) => p.routineType === rt && results[p.id]),
  )
}

/** More than one print tab (routines + optional all-around). */
function sectionHasMultipleRoutineTabs(
  performances: ScoringPerformance[],
  results: Record<string, RoutineResult>,
): boolean {
  const routineTypes = routineTypesWithResults(performances, results)
  const hasAllRound = routineTypes.includes('Balance') && routineTypes.includes('Dynamic')
  return routineTypes.length + (hasAllRound ? 1 : 0) > 1
}

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

function AccordionSection({
  label,
  count,
  hasProvisional,
  isOpen,
  onToggle,
  children,
  t,
  lang,
  forceExpanded,
  printBreakBefore,
  competitionMeta,
  officialDocument,
  printSectionLabel,
  omitPrintBanner,
}: {
  label: string
  count: number
  hasProvisional: boolean
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
  t: typeof T['en']
  lang: Lang
  /** Official document: static heading, all sections visible (screen + print). */
  forceExpanded?: boolean
  printBreakBefore?: boolean
  competitionMeta: ResultsPageCompetitionMeta | null
  officialDocument: boolean
  /** When set, used in the print banner instead of `label` (e.g. adds routine type). */
  printSectionLabel?: string
  /** Multi-routine sections render their own per-tab print banners inside CategoryBlock. */
  omitPrintBanner?: boolean
}) {
  const rootClass = ['bg-white', printBreakBefore ? 'print:break-before-page' : ''].filter(Boolean).join(' ')
  const bannerLabel = printSectionLabel ?? label
  if (forceExpanded) {
    return (
      <div className={rootClass}>
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap print:hidden">
          <span className="font-bold text-slate-800 text-base sm:text-lg">{label}</span>
          <span className="text-xs text-slate-400 shrink-0">{t.result(count)}</span>
          {hasProvisional && (
            <span className="text-xs font-semibold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full shrink-0">
              {t.someProvisional}
            </span>
          )}
        </div>
        {!omitPrintBanner ? (
          <ResultsPrintSectionBanner
            competitionMeta={competitionMeta}
            sectionLabel={bannerLabel}
            lang={lang}
            officialDocument={officialDocument}
            hasProvisional={hasProvisional}
            t={t}
          />
        ) : null}
        {children}
      </div>
    )
  }
  return (
    <div className={rootClass}>
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
        {!omitPrintBanner ? (
          <ResultsPrintSectionBanner
            competitionMeta={competitionMeta}
            sectionLabel={bannerLabel}
            lang={lang}
            officialDocument={officialDocument}
            hasProvisional={hasProvisional}
            t={t}
          />
        ) : null}
        {children}
      </div>
    </div>
  )
}

// ─── category block with optional tabs ───────────────────────────────────────

function CategoryBlock({
  ageGroup,
  category,
  performances,
  results,
  t,
  clubAvatarByTeam,
  teamClubInfo,
  officialDocument,
  sectionHeaderLabel,
  lang,
  competitionMeta,
  hasProvisional,
  usePerTabPrintBanners,
}: {
  ageGroup: string
  category: string
  performances: ScoringPerformance[]
  results: Record<string, RoutineResult>
  t: typeof T['en']
  clubAvatarByTeam: Record<string, string | null>
  teamClubInfo: Record<string, TeamClubInfo>
  officialDocument?: boolean
  /** Age group · category (or merged label); used in print headers when multi-tab. */
  sectionHeaderLabel: string
  lang: Lang
  competitionMeta: ResultsPageCompetitionMeta | null
  hasProvisional: boolean
  usePerTabPrintBanners: boolean
}) {
  const routineLabel = (rt: string) =>
    ({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined }[rt] ?? rt)

  // Routine types that have at least one result, in fixed order
  const routineTypes = routineTypesWithResults(performances, results)

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
    return (
      <GroupRanking rows={rows} results={results} t={t} clubAvatarByTeam={clubAvatarByTeam} teamClubInfo={teamClubInfo} />
    )
  }

  // Multi-routine: show tab bar (hidden in print) + all panels always in DOM
  return (
    <>
      {!officialDocument && <RoutineTabs tabs={tabs} activeTab={resolvedTab} onSelect={setActiveTab} />}
      {/* In print, show every tab panel one after another; on screen, show only active (unless officialDocument) */}
      {tabs.map((tab, tabIdx) => {
        const isActive = tab === resolvedTab
        const panelVisible = officialDocument || isActive
        let content: React.ReactNode
        if (tab === t.allRound) {
          const entries = getAllRoundEntries()
          content = <AllRoundRanking entries={entries} t={t} clubAvatarByTeam={clubAvatarByTeam} teamClubInfo={teamClubInfo} />
        } else {
          const rt = ROUTINE_ORDER.find(r => routineLabel(r) === tab) ?? routineTypes[0]
          const rows = performances
            .filter(p => p.routineType === rt && results[p.id])
            .sort((a, b) => (results[b.id]?.finalScore ?? 0) - (results[a.id]?.finalScore ?? 0))
          content = <GroupRanking rows={rows} results={results} t={t} clubAvatarByTeam={clubAvatarByTeam} teamClubInfo={teamClubInfo} />
        }
        // Print: one page per routine tab, then one page for all-round (when present).
        const printPageBreak = tabIdx > 0 ? 'print:break-before-page' : ''
        const tabSubtitleClass = usePerTabPrintBanners
          ? officialDocument
            ? 'block print:hidden'
            : 'hidden print:hidden'
          : [officialDocument ? 'block' : 'hidden print:block'].join(' ')
        return (
          <div key={tab} className={['print:block', panelVisible ? '' : 'hidden', printPageBreak].filter(Boolean).join(' ')}>
            {usePerTabPrintBanners ? (
              <ResultsPrintSectionBanner
                competitionMeta={competitionMeta}
                sectionLabel={`${sectionHeaderLabel} · ${tab}`}
                lang={lang}
                officialDocument={officialDocument ?? false}
                hasProvisional={hasProvisional}
                t={t}
              />
            ) : null}
            <p className={['px-4 pt-3 pb-1 text-sm font-semibold text-slate-500', tabSubtitleClass].join(' ')}>
              {tab}
            </p>
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

/** Stable key for public results sections (per category or merged group). */
export function resultsSectionKey(p: ScoringPerformance): string {
  if (p.rankingMergeGroupId) return `${p.ageGroup}||__merge__${p.rankingMergeGroupId}`
  return `${p.ageGroup}||${p.category}`
}

function accordionLabelForSection(
  sectionKey: string,
  performances: ScoringPerformance[],
  lang: Lang,
  t: typeof T['en'],
): string {
  const sample = performances.find((p) => resultsSectionKey(p) === sectionKey)
  if (!sample) return sectionKey
  if (sample.rankingMergeGroupId) {
    const raw = lang === 'en' ? sample.mergeLabelEn : sample.mergeLabelEs
    if (raw?.trim()) return raw.trim()
    return t.combinedCategories
  }
  return `${sample.ageGroup} · ${categoryLabel(sample.category, lang)}`
}

export type ResultsViewProps = {
  performances: ScoringPerformance[]
  results: Record<string, RoutineResult>
  lang: Lang
  clubAvatarByTeam?: Record<string, string | null>
  /** Team → club (for Trofeo Gondomar–style club rankings). */
  teamClubInfo?: Record<string, TeamClubInfo>
  agSortOrder?: Record<string, number>  // ageGroup label → sort_order
  /** Full competition document: all rulesets stacked, sections expanded, routine tabs all visible. */
  officialDocument?: boolean
  /** When true, show Trofeo Gondomar Escolar/Base club rankings (single competition only). */
  showTrofeoGondomarClubRanking?: boolean
  openCombinadosActa?: OpenCombinadosActaData | null
  competitionMeta?: ResultsPageCompetitionMeta | null
}

export default function ResultsView({
  performances,
  results,
  lang,
  clubAvatarByTeam = {},
  teamClubInfo = {},
  agSortOrder = {},
  officialDocument = false,
  showTrofeoGondomarClubRanking = false,
  openCombinadosActa = null,
  competitionMeta = null,
}: ResultsViewProps) {
  const t = T[lang]

  const routineLabel = (rt: string) =>
    ({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined }[rt] ?? rt)

  // Build unique section keys with at least one result, sorted by sort_order desc
  const allCategoryKeys: string[] = []
  for (const p of performances) {
    const ck = resultsSectionKey(p)
    if (!allCategoryKeys.includes(ck) && performances.some(q => resultsSectionKey(q) === ck && results[q.id])) {
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
      return getResultsRuleset(ag) === rs
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

  // Filter section keys to the active ruleset tab (first segment is always display age group)
  const categoryKeys = resolvedRuleset
    ? allCategoryKeys.filter(ck => {
        const [ag] = ck.split('||')
        return getResultsRuleset(ag) === resolvedRuleset
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

  const renderSections = (keys: string[]) =>
    keys.map((ck, idx) => {
      const catPerfs = performances.filter((p) => resultsSectionKey(p) === ck)
      const ageGroup = catPerfs[0]?.ageGroup ?? ''
      const category = catPerfs[0]?.category ?? ''
      const totalResults = catPerfs.filter((p) => results[p.id]).length
      const hasProvisional = catPerfs.some((p) => results[p.id]?.status === 'provisional')
      const label = accordionLabelForSection(ck, performances, lang, t)
      const multiRoutineTabs = sectionHasMultipleRoutineTabs(catPerfs, results)
      const singleRoutineTypes = routineTypesWithResults(catPerfs, results)
      const printSectionLabelSingle =
        !multiRoutineTabs && singleRoutineTypes.length === 1
          ? `${label} · ${({ Balance: t.balance, Dynamic: t.dynamic, Combined: t.combined } as Record<string, string>)[singleRoutineTypes[0]] ?? singleRoutineTypes[0]}`
          : undefined
      return (
        <AccordionSection
          key={ck}
          label={label}
          count={totalResults}
          hasProvisional={hasProvisional}
          isOpen={officialDocument || openSections.has(ck)}
          onToggle={() => toggleSection(ck)}
          t={t}
          lang={lang}
          forceExpanded={officialDocument}
          printBreakBefore={idx > 0}
          competitionMeta={competitionMeta}
          officialDocument={officialDocument}
          printSectionLabel={printSectionLabelSingle}
          omitPrintBanner={multiRoutineTabs}
        >
          <CategoryBlock
            ageGroup={ageGroup}
            category={category}
            performances={catPerfs}
            results={results}
            t={t}
            clubAvatarByTeam={clubAvatarByTeam}
            teamClubInfo={teamClubInfo}
            officialDocument={officialDocument}
            sectionHeaderLabel={label}
            lang={lang}
            competitionMeta={competitionMeta}
            hasProvisional={hasProvisional}
            usePerTabPrintBanners={multiRoutineTabs}
          />
        </AccordionSection>
      )
    })

  const teamNameById = Object.fromEntries(performances.map((p) => [p.teamId, p.gymnasts]))
  const renderOpenCombinadosTable = (title: string, rows?: Array<{ rank: number; teamId: string; score: number }>) => {
    if (!rows?.length) return null
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-200 font-semibold text-slate-800">{title}</div>
        <table className="w-full max-w-full text-sm print:table-auto">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-2">#</th>
              <th className="text-left px-4 py-2">{lang === 'en' ? 'Team' : 'Equipo'}</th>
              <th className="text-right px-4 py-2">
                <span className="print:hidden">{lang === 'en' ? 'Score' : 'Puntuación'}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const teamLabel = teamNameById[r.teamId] ?? r.teamId
              const clubLine = teamClubInfo[r.teamId]?.clubName?.trim()
              return (
                <tr key={r.teamId} className="border-t border-slate-100">
                  <td className="px-4 py-2">{r.rank}</td>
                  <td className="px-4 py-2">
                    <div className="min-w-0">
                      <div>{teamLabel}</div>
                      {clubLine ? (
                        <div className="text-xs text-slate-500 mt-0.5 break-words print:hidden">{clubLine}</div>
                      ) : null}
                      {clubLine ? (
                        <div className="hidden print:block text-[11px] text-slate-500 mt-1 break-words leading-relaxed">{clubLine}</div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right font-semibold tabular-nums">{r.score.toFixed(3)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  if (allCategoryKeys.length === 0) {
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
    <div className="min-h-screen bg-slate-50 print:w-full print:max-w-none">
      {!officialDocument && activeRulesets.length > 1 && (
        <div className="bg-white border-b border-slate-200 sticky top-[49px] z-10 print:hidden">
          <div className="max-w-3xl mx-auto print:max-w-none print:w-full print:mx-0 px-4 flex">
            {activeRulesets.map((rs) => (
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

      {officialDocument ? (
        <>
          {activeRulesets.map((rs, idx) => {
            const keys = allCategoryKeys.filter((ck) => {
              const [ag] = ck.split('||')
              return getResultsRuleset(ag) === rs
            })
            if (keys.length === 0) return null
            return (
              <div key={rs} className={idx > 0 ? 'print:break-before-page' : ''}>
                <div className="bg-white border-b border-slate-200">
                  <div className="max-w-3xl mx-auto print:max-w-none print:w-full print:mx-0 px-4 py-3">
                    <h2 className="text-lg font-bold text-slate-800">{rs}</h2>
                  </div>
                </div>
                <div className="divide-y divide-slate-200">{renderSections(keys)}</div>
                {showTrofeoGondomarClubRanking && (rs === 'Escolar' || rs === 'Base') && (
                  <ClubTrophyBlock
                    ruleset={rs}
                    performances={performances}
                    results={results}
                    teamClubInfo={teamClubInfo}
                    t={t}
                  />
                )}
              </div>
            )
          })}
          {openCombinadosActa && (
            <div className="max-w-3xl mx-auto print:max-w-none print:w-full print:mx-0 px-4 py-6 space-y-3">
              <h2 className="text-lg font-bold text-slate-800">OPEN / COMBINADOS</h2>
              {renderOpenCombinadosTable('OPEN Qualification', openCombinadosActa.openQualification)}
              {renderOpenCombinadosTable('COMBINADOS Qualification', openCombinadosActa.combinadosQualification)}
              {renderOpenCombinadosTable('OPEN Quarter', openCombinadosActa.openQuarter)}
              {renderOpenCombinadosTable('OPEN Semi', openCombinadosActa.openSemi)}
              {renderOpenCombinadosTable('OPEN Final', openCombinadosActa.openFinal)}
              {renderOpenCombinadosTable('COMBINADOS Semi', openCombinadosActa.combinadosSemi)}
              {renderOpenCombinadosTable('COMBINADOS Final', openCombinadosActa.combinadosFinal)}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="divide-y divide-slate-200">{renderSections(categoryKeys)}</div>
          {showTrofeoGondomarClubRanking && (resolvedRuleset === 'Escolar' || resolvedRuleset === 'Base') && (
            <ClubTrophyBlock
              ruleset={resolvedRuleset}
              performances={performances}
              results={results}
              teamClubInfo={teamClubInfo}
              t={t}
            />
          )}
          {openCombinadosActa && (
            <div className="max-w-3xl mx-auto print:max-w-none print:w-full print:mx-0 px-4 py-6 space-y-3">
              <h2 className="text-lg font-bold text-slate-800">OPEN / COMBINADOS</h2>
              {renderOpenCombinadosTable('OPEN Qualification', openCombinadosActa.openQualification)}
              {renderOpenCombinadosTable('COMBINADOS Qualification', openCombinadosActa.combinadosQualification)}
              {renderOpenCombinadosTable('OPEN Quarter', openCombinadosActa.openQuarter)}
              {renderOpenCombinadosTable('OPEN Semi', openCombinadosActa.openSemi)}
              {renderOpenCombinadosTable('OPEN Final', openCombinadosActa.openFinal)}
              {renderOpenCombinadosTable('COMBINADOS Semi', openCombinadosActa.combinadosSemi)}
              {renderOpenCombinadosTable('COMBINADOS Final', openCombinadosActa.combinadosFinal)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
