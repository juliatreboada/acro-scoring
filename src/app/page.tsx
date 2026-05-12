'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useProfile, ROLE_HOME } from '@/contexts/ProfileContext'
import type { Lang } from '@/components/scoring/types'
import type { Database } from '@/lib/database.types'

type Competition = Pick<
  Database['public']['Tables']['competitions']['Row'],
  'id' | 'name' | 'status' | 'location' | 'start_date' | 'end_date' | 'age_groups' | 'poster_url'
>

type CompetitionStatus = Database['public']['Enums']['competition_status']

/** Poster badge styles (aligned with club competition list). */
const POSTER_STATUS_BADGE: Record<CompetitionStatus, string> = {
  draft: 'bg-slate-100 text-slate-500',
  provisional_entry: 'bg-violet-100 text-violet-700',
  definitive_entry: 'bg-orange-100 text-orange-700',
  registration_open: 'bg-green-100 text-green-700',
  registration_closed: 'bg-amber-100 text-amber-800',
  published: 'bg-indigo-100 text-indigo-700',
  active: 'bg-emerald-100 text-emerald-700',
  finished: 'bg-slate-200/90 text-slate-700',
}

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
    finishedCompetition: 'Finished competition',
    status: {
      draft: 'Draft',
      provisional_entry: 'Provisional entry',
      definitive_entry: 'Definitive entry',
      registration_open: 'Registration open',
      registration_closed: 'Registration closed',
      published: 'Starting order published',
      active: 'Live',
      finished: 'Finished',
    } as Record<CompetitionStatus, string>,
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
    finishedCompetition: 'Competición finalizada',
    status: {
      draft: 'Borrador',
      provisional_entry: 'Inscripción provisional',
      definitive_entry: 'Inscripción definitiva',
      registration_open: 'Inscripción abierta',
      registration_closed: 'Inscripción cerrada',
      published: 'Orden de salida publicada',
      active: 'En vivo',
      finished: 'Finalizada',
    } as Record<CompetitionStatus, string>,
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

/** Cards keep a fixed max width; flex-wrap packs 2+ per row only when space allows — width does not grow with row occupancy. */
function CompetitionCardSection({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 w-full max-w-7xl mx-auto px-1 sm:px-0">
      {children}
    </div>
  )
}

function CompCard({
  comp, lang, router,
}: {
  comp: Competition
  lang: Lang
  router: ReturnType<typeof useRouter>
}) {
  const t = T[lang]
  const isActive = comp.status === 'active'
  const isFinished = comp.status === 'finished'
  const isPublished = comp.status === 'published'

  const statusKey = comp.status as CompetitionStatus
  const posterBadgeCls = POSTER_STATUS_BADGE[statusKey] ?? 'bg-slate-100 text-slate-600'
  const posterStatusLabel =
    isFinished ? t.finishedCompetition : isActive ? t.liveNow : t.status[statusKey] ?? comp.status

  return (
    <div className={[
      'bg-white border rounded-2xl overflow-hidden transition-all flex flex-col sm:flex-row sm:items-stretch',
      'shrink-0 w-[min(100%,36.4rem)]',
      isActive ? 'border-emerald-200 shadow-sm shadow-emerald-50' : 'border-slate-200',
    ].join(' ')}>
      {/* poster — full image (contain); ~35% width on sm+ (half of previous 70% share) */}
      <div
        className={[
          'relative shrink-0 bg-slate-100 flex items-center justify-center',
          'w-full max-sm:aspect-[3/4] max-sm:max-h-[min(75vh,33.8rem)]',
          'sm:w-[35%] sm:min-w-0 sm:border-r sm:border-slate-100 sm:min-h-[18.2rem] sm:p-4',
        ].join(' ')}
      >
        {comp.poster_url ? (
          <img
            src={comp.poster_url}
            alt={comp.name}
            className="max-h-full max-w-full w-auto h-auto object-contain object-center sm:absolute sm:inset-4 sm:max-h-[calc(100%-2rem)] sm:max-w-[calc(100%-2rem)] max-sm:max-h-full max-sm:max-w-full"
          />
        ) : (
          <div className="flex items-center justify-center py-16 sm:py-0 sm:absolute sm:inset-0">
            <svg className="w-14 h-14 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5c.621 0 1.125.504 1.125 1.125v13.5c0 .621-.504 1.125-1.125 1.125H3.75A1.125 1.125 0 012.625 17.625V4.125C2.625 3.504 3.129 3 3.75 3z" />
            </svg>
          </div>
        )}
      </div>

      {/* title, status, meta, actions — ~65% on sm+ (double previous 30% share) */}
      <div className="w-full sm:w-[65%] sm:min-w-0 min-w-0 flex flex-col justify-between gap-2.5 px-3 py-3 sm:py-4 sm:px-4">
        <div className="min-w-0 space-y-2">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 leading-snug line-clamp-3">{comp.name}</h3>
          <div className="flex justify-end w-full">
            <span
              className={[
                'inline-flex max-w-full items-center justify-end gap-1.5 text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full text-right',
                posterBadgeCls,
              ].join(' ')}
            >
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />}
              <span className="min-w-0 break-words">{posterStatusLabel}</span>
            </span>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-slate-500">
            <span className="flex items-start gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="min-w-0 break-words">{comp.location}</span>
            </span>
            <span className="flex items-start gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              <span className="min-w-0">{formatDateRange(comp.start_date, comp.end_date)}</span>
            </span>
          </div>
        </div>

        {(isActive || isFinished) && (
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 sm:items-stretch">
            <button
              type="button"
              onClick={() => router.push(`/starting-order/${comp.id}`)}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all w-full"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {t.startingOrder}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/results/${comp.id}`)}
              className={[
                'flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition-all w-full',
                isActive
                  ? 'text-white bg-emerald-600 hover:bg-emerald-700'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200',
              ].join(' ')}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              {t.results}
            </button>
          </div>
        )}
        {isPublished && (
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push(`/starting-order/${comp.id}`)}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all w-full"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {t.startingOrder}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const ROLE_BADGE_BG: Record<string, string> = {
  super_admin: 'bg-violet-500',
  admin:       'bg-blue-500',
  judge:       'bg-amber-500',
  club:        'bg-emerald-500',
}

function avatarInitials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
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
  const { activeProfile, profileLoading } = useProfile()

  useEffect(() => {
    async function load() {
      const [{ data }, { data: rulesData }] = await Promise.all([
        supabase
          .from('competitions')
          .select('id, name, status, location, start_date, end_date, age_groups, poster_url')
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
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo-nobg.png" alt="Nosa Acro Suite" className="w-14 h-14 object-contain shrink-0" />
            <div>
              <span className="text-base font-bold text-slate-800 tracking-tight">{t.appName}</span>
              <p className="text-xs font-semibold text-slate-600">{t.appTagline}</p>
            </div>
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
            {!profileLoading && activeProfile ? (
              <button
                onClick={() => router.push(ROLE_HOME[activeProfile.role])}
                title={activeProfile.name}
                className="w-8 h-8 rounded-full overflow-hidden shrink-0 hover:opacity-80 transition-opacity"
              >
                {activeProfile.avatar_url ? (
                  <img src={activeProfile.avatar_url} alt={activeProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className={['w-full h-full flex items-center justify-center text-white text-xs font-bold', ROLE_BADGE_BG[activeProfile.role] ?? 'bg-slate-500'].join(' ')}>
                    {avatarInitials(activeProfile.name)}
                  </div>
                )}
              </button>
            ) : !profileLoading && (
              <button
                onClick={() => router.push('/login')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                {t.signIn}
              </button>
            )}
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
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        )}
        {!loading && <>

        {/* live */}
        {active.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t.liveNow}</h2>
            </div>
            <CompetitionCardSection>
              {active.map((c) => <CompCard key={c.id} comp={c} lang={lang} router={router} />)}
            </CompetitionCardSection>
          </section>
        )}

        {/* upcoming */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">{t.upcoming}</h2>
            <CompetitionCardSection>
              {upcoming.map((c) => <CompCard key={c.id} comp={c} lang={lang} router={router} />)}
            </CompetitionCardSection>
          </section>
        )}

        {/* finished */}
        {finished.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t.finished}</h2>
              <button onClick={() => router.push('/results')}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors flex items-center gap-1">
                {t.viewAll}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
            <CompetitionCardSection>
              {finished.map((c) => <CompCard key={c.id} comp={c} lang={lang} router={router} />)}
            </CompetitionCardSection>
          </section>
        )}

        {active.length === 0 && upcoming.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-14">{t.noActive}</p>
        )}
        </>}

      </div>
    </div>
  )
}
