'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { loadResultsPageBundle, type ResultsPageCompetitionMeta } from '@/lib/loadResultsPageBundle'
import ResultsView from '@/components/results/ResultsView'
import type { Lang } from '@/components/scoring/types'
import type { ScoringPerformance, RoutineResult } from '@/components/scoring/types'
import type { TeamClubInfo } from '@/lib/clubTrophyRanking'
import { showTrofeoGondomarClubRanking } from '@/lib/trofeoGondomarCompetition'
import type { OpenCombinadosActaData } from '@/lib/openCombinadosBracket'

function ResultsPageInner() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const isOfficial = searchParams.get('official') === '1'
  const supabase = createClient()

  const [lang, setLang] = useState<Lang>('es')
  const [competitionMeta, setCompetitionMeta] = useState<ResultsPageCompetitionMeta | null>(null)
  const [performances, setPerformances] = useState<ScoringPerformance[]>([])
  const [results, setResults] = useState<Record<string, RoutineResult>>({})
  const [clubAvatarByTeam, setClubAvatarByTeam] = useState<Record<string, string | null>>({})
  const [teamClubInfo, setTeamClubInfo] = useState<Record<string, TeamClubInfo>>({})
  const [agSortOrder, setAgSortOrder] = useState<Record<string, number>>({})
  const [openCombinadosActa, setOpenCombinadosActa] = useState<OpenCombinadosActaData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const bundle = await loadResultsPageBundle(supabase, id)
      if (!bundle.competition) {
        setLoading(false)
        return
      }
      setCompetitionMeta(bundle.competition)
      setPerformances(bundle.performances)
      setResults(bundle.results)
      setClubAvatarByTeam(bundle.clubAvatarByTeam)
      setTeamClubInfo(bundle.teamClubInfo)
      setAgSortOrder(bundle.agSortOrder)
      setOpenCombinadosActa(bundle.openCombinadosActa)
      setLoading(false)
    }
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  const competitionName = competitionMeta?.name ?? ''
  const trofeoGondomar = showTrofeoGondomarClubRanking(id)

  return (
    <div className="so-print-area min-h-screen bg-slate-50 print:w-full print:max-w-none">
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10 print:hidden">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['en', 'es'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={[
                'px-3 py-1 rounded-md text-sm font-medium transition-all',
                lang === l ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
            />
          </svg>
          {lang === 'en' ? 'Print' : 'Imprimir'}
        </button>
      </div>

      <div className="bg-white border-b border-slate-200 print:hidden">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            {isOfficial
              ? lang === 'en'
                ? 'Official results'
                : 'Resultados oficiales'
              : lang === 'en'
                ? 'Results'
                : 'Resultados'}
          </p>
          <h1 className="text-xl font-bold text-slate-800">{competitionName}</h1>
          {competitionMeta?.status === 'finished' && (
            <p className="mt-2 text-xs font-semibold text-slate-600">
              {lang === 'en' ? 'Finished competition' : 'Competición finalizada'}
            </p>
          )}
          {isOfficial && competitionMeta && (
            <div className="mt-3 text-sm text-slate-600 space-y-0.5 print:text-slate-700">
              {competitionMeta.location ? <p>{competitionMeta.location}</p> : null}
              {competitionMeta.start_date || competitionMeta.end_date ? (
                <p>
                  {competitionMeta.start_date ?? ''}
                  {competitionMeta.end_date &&
                  competitionMeta.end_date !== competitionMeta.start_date
                    ? ` – ${competitionMeta.end_date}`
                    : ''}
                </p>
              ) : null}
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-2">
                {lang === 'en'
                  ? 'Approved scores only (for signature and records)'
                  : 'Solo puntuaciones aprobadas (para firma y archivo)'}
              </p>
            </div>
          )}
        </div>
      </div>

      <ResultsView
        performances={performances}
        results={results}
        lang={lang}
        clubAvatarByTeam={clubAvatarByTeam}
        teamClubInfo={teamClubInfo}
        agSortOrder={agSortOrder}
        officialDocument={isOfficial}
        showTrofeoGondomarClubRanking={trofeoGondomar}
        openCombinadosActa={openCombinadosActa}
        competitionMeta={competitionMeta}
      />

      {isOfficial && (
        <footer className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10 print:py-14 border-t border-slate-200 mt-6 print:mt-10 print:break-inside-avoid">
          <p className="text-xs text-slate-500 mb-8">
            {lang === 'en'
              ? `Document generated: ${new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`
              : `Documento generado: ${new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}`}
          </p>
          <div className="grid sm:grid-cols-3 gap-10 text-sm text-slate-700">
            <div>
              <p className="font-semibold mb-10">{lang === 'en' ? 'CJP (Chief Judge Panel)' : 'CJP (Juez presidente)'}</p>
              <div className="border-b border-slate-400" />
            </div>
            <div>
              <p className="font-semibold mb-10">
                {lang === 'en' ? 'Competition secretary' : 'Secretaría de competición'}
              </p>
              <div className="border-b border-slate-400" />
            </div>
            <div>
              <p className="font-semibold mb-10">
                {lang === 'en' ? 'Organiser / stamp' : 'Organización / sello'}
              </p>
              <div className="border-b border-slate-400" />
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      }
    >
      <ResultsPageInner />
    </Suspense>
  )
}
