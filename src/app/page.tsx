'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/aj-scoring/types'
import type { Database } from '@/lib/database.types'

type Competition = Pick<
  Database['public']['Tables']['competitions']['Row'],
  'id' | 'name' | 'status' | 'location' | 'start_date' | 'end_date' | 'age_groups'
>

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    appName: 'Nosa Acro Suite',
    appTagline: 'Competition management & live scoring for Acrobatic Gymnastics',
    signIn: 'Sign in',
    liveNow: 'Live now',
    upcoming: 'Upcoming',
    finished: 'Finished',
    startingOrder: 'Starting order',
    results: 'Results',
    location: 'Location',
    competitions: 'Competitions',
    noActive: 'No active competitions right now.',
    noUpcoming: 'No upcoming competitions.',
    viewAll: 'All results',
    publicAccess: 'Public access',
    publicHint: 'Starting order and live results are publicly available — no sign-in needed.',
  },
  es: {
    appName: 'Nosa Acro Suite',
    appTagline: 'Gestión de competiciones y puntuación en directo para Gimnasia Acrobática',
    signIn: 'Entrar',
    liveNow: 'En directo',
    upcoming: 'Próximas',
    finished: 'Finalizadas',
    startingOrder: 'Orden de salida',
    results: 'Resultados',
    location: 'Sede',
    competitions: 'Competiciones',
    noActive: 'No hay competiciones activas en este momento.',
    noUpcoming: 'No hay próximas competiciones.',
    viewAll: 'Todos los resultados',
    publicAccess: 'Acceso público',
    publicHint: 'El orden de salida y los resultados en directo son públicos — sin necesidad de iniciar sesión.',
  },
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDateRange(start: string | null, end: string | null): string {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  if (start && end) return start !== end ? `${fmt(start)} – ${fmt(end)}` : fmt(start)
  if (start) return fmt(start)
  if (end) return fmt(end)
  return ''
}

// ─── competition card ─────────────────────────────────────────────────────────

function CompCard({
  comp, lang, router, agLabel,
}: {
  comp: Competition
  lang: Lang
  router: ReturnType<typeof useRouter>
  agLabel: Record<string, string>
}) {
  const t = T[lang]
  const isActive = comp.status === 'active'
  const isFinished = comp.status === 'finished'
  const isUpcoming = !isActive && !isFinished

  return (
    <div className={[
      'bg-white border rounded-2xl overflow-hidden transition-all',
      isActive ? 'border-emerald-200 shadow-sm shadow-emerald-50' : 'border-slate-200',
    ].join(' ')}>
      {/* card header */}
      <div className={['px-5 py-4 border-b', isActive ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100'].join(' ')}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {isActive && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t.liveNow}
                </span>
              </div>
            )}
            {isUpcoming && (
              <div className="mb-1.5">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {t.upcoming}
                </span>
              </div>
            )}
            <h3 className="text-sm font-semibold text-slate-800 leading-snug">{comp.name}</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {comp.location}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
                {formatDateRange(comp.start_date, comp.end_date)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {comp.age_groups.map((ag) => (
                <span key={ag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{agLabel[ag] ?? ag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* card actions */}
      {!isUpcoming && (
        <div className="px-5 py-3 flex items-center gap-2">
          <button
            onClick={() => router.push(`/starting-order/${comp.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {t.startingOrder}
          </button>
          <button
            onClick={() => router.push(`/results/${comp.id}`)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
              isActive
                ? 'text-white bg-emerald-600 hover:bg-emerald-700'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200',
            ].join(' ')}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            {t.results}
          </button>
        </div>
      )}
      {isUpcoming && (
        <div className="px-5 py-3">
          <button
            onClick={() => router.push(`/starting-order/${comp.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {t.startingOrder}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [lang, setLang]           = useState<Lang>('es')
  const [comps, setComps]         = useState<Competition[]>([])
  const [agLabel, setAgLabel]     = useState<Record<string, string>>({})
  const [loading, setLoading]     = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const t = T[lang]

  useEffect(() => {
    async function load() {
      const [{ data }, { data: rulesData }] = await Promise.all([
        supabase
          .from('competitions')
          .select('id, name, status, location, start_date, end_date, age_groups')
          .neq('status', 'draft')
          .order('start_date', { ascending: false }),
        supabase.from('age_group_rules').select('id, age_group, ruleset').order('sort_order'),
      ])
      setComps(data ?? [])
      setAgLabel(Object.fromEntries(((rulesData ?? []) as unknown as { id: string; age_group: string; ruleset: string }[]).map(r => [r.id, `${r.age_group} (${r.ruleset})`])))
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const active   = comps.filter((c) => c.status === 'active')
  const finished = comps.filter((c) => c.status === 'finished')
  const upcoming = comps.filter((c) => c.status !== 'active' && c.status !== 'finished')

  return (
    <div className="min-h-screen bg-slate-50">

      {/* nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 text-white w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <span className="text-base font-bold text-slate-800 tracking-tight">{t.appName}</span>
            <p className="text-xs font-semibold text-slate-600">{t.appTagline}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* lang toggle */}
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
              {(['en', 'es'] as Lang[]).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className={['px-2.5 py-1 rounded-md text-xs font-semibold transition-all', lang === l ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'].join(' ')}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              {t.signIn}
            </button>
          </div>
        </div>
      </header>

      {/* hero */}
      {/* <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">{t.appName}</p>
          <h1 className="text-2xl font-bold text-slate-800 leading-snug max-w-lg">{t.appTagline}</h1> */}

          {/* public access note */}
          {/* <div className="mt-5 inline-flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 max-w-lg">
            <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-slate-600">{t.publicAccess}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t.publicHint}</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* competitions */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        )}
        {!loading && <>

        {/* live */}
        {active.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t.liveNow}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {active.map((c) => <CompCard key={c.id} comp={c} lang={lang} router={router} agLabel={agLabel} />)}
            </div>
          </section>
        )}

        {/* upcoming */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">{t.upcoming}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {upcoming.map((c) => <CompCard key={c.id} comp={c} lang={lang} router={router} agLabel={agLabel} />)}
            </div>
          </section>
        )}

        {/* finished */}
        {finished.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t.finished}</h2>
              <button onClick={() => router.push('/results')}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors flex items-center gap-1">
                {t.viewAll}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {finished.map((c) => <CompCard key={c.id} comp={c} lang={lang} router={router} agLabel={agLabel} />)}
            </div>
          </section>
        )}

        {active.length === 0 && upcoming.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-16">{t.noActive}</p>
        )}
        </>}

      </div>
    </div>
  )
}
