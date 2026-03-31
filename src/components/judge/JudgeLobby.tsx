'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/aj-scoring/types'

// ─── types ────────────────────────────────────────────────────────────────────

type CompetitionStatus = 'draft' | 'registration_open' | 'registration_closed' | 'active' | 'finished'
type SessionStatus = 'waiting' | 'active' | 'finished'

type LobbyCompetition = {
  id: string
  name: string
  location: string | null
  start_date: string | null
  end_date: string | null
  status: CompetitionStatus
}

type OrderEntry = { position: number; gymnast_display: string }

type LobbySession = {
  id: string
  name: string
  status: SessionStatus
  orders: OrderEntry[]
}

type LobbyPanel = {
  sectionId: string
  sectionNumber: number
  sectionLabel: string | null
  panelId: string
  panelNumber: number
  roles: { role: string; roleNumber: number }[]
  sessions: LobbySession[]
}

// ─── translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    title: 'My competitions',
    noCompetitions: 'No competitions yet.',
    noCompetitionsSub: 'You will appear here once an admin adds you to a competition.',
    enter: 'Enter',
    back: 'Back',
    sectionN: (n: number) => `Section ${n}`,
    panelN: (n: number) => `Panel ${n}`,
    status: {
      draft: 'Draft',
      registration_open: 'Registration open',
      registration_closed: 'Registration closed',
      active: 'Live',
      finished: 'Finished',
    } as Record<CompetitionStatus, string>,
    sessionStatus: {
      waiting: 'Pending',
      active: 'Active',
      finished: 'Finished',
    } as Record<SessionStatus, string>,
    myAssignments: 'My panel assignments',
    noLockedPanels: 'Panel assignments have not been published yet.',
    startingOrder: 'Starting order',
    noOrder: 'Starting order not yet published.',
    scoreButton: 'Score',
    djReviewButton: 'Review TS sheets',
    loadingDetail: 'Loading…',
  },
  es: {
    title: 'Mis competiciones',
    noCompetitions: 'Sin competiciones todavía.',
    noCompetitionsSub: 'Aparecerás aquí cuando un administrador te añada a una competición.',
    enter: 'Entrar',
    back: 'Volver',
    sectionN: (n: number) => `Jornada ${n}`,
    panelN: (n: number) => `Panel ${n}`,
    status: {
      draft: 'Borrador',
      registration_open: 'Inscripción abierta',
      registration_closed: 'Inscripción cerrada',
      active: 'En vivo',
      finished: 'Finalizada',
    } as Record<CompetitionStatus, string>,
    sessionStatus: {
      waiting: 'Pendiente',
      active: 'Activa',
      finished: 'Finalizada',
    } as Record<SessionStatus, string>,
    myAssignments: 'Mis asignaciones de panel',
    noLockedPanels: 'Las asignaciones de panel aún no han sido publicadas.',
    startingOrder: 'Orden de salida',
    noOrder: 'El orden de salida aún no está publicado.',
    scoreButton: 'Puntuar',
    djReviewButton: 'Revisar hojas de tarifa',
    loadingDetail: 'Cargando…',
  },
}

const COMP_STATUS_BADGE: Record<CompetitionStatus, string> = {
  draft:                'bg-slate-100 text-slate-500',
  registration_open:    'bg-green-100 text-green-700',
  registration_closed:  'bg-amber-100 text-amber-700',
  active:               'bg-blue-600 text-white',
  finished:             'bg-slate-100 text-slate-400',
}

const SESSION_STATUS_BADGE: Record<SessionStatus, string> = {
  waiting:  'bg-slate-100 text-slate-500',
  active:   'bg-blue-600 text-white',
  finished: 'bg-slate-100 text-slate-400',
}

// ─── role → route ─────────────────────────────────────────────────────────────

const ROLE_ORDER: Record<string, number> = { CJP: 0, DJ: 1, EJ: 2, AJ: 3 }

function rolesToRoute(roles: string[]): string {
  const unique = [...new Set(roles)]
  unique.sort((a, b) => (ROLE_ORDER[a] ?? 99) - (ROLE_ORDER[b] ?? 99))
  return '/' + unique.map(r => r.toLowerCase()).join('-')
}

// ─── competition card ─────────────────────────────────────────────────────────

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function CompetitionCard({ comp, lang, onEnter }: {
  comp: LobbyCompetition
  lang: Lang
  onEnter: () => void
}) {
  const t = T[lang]
  const start = formatDate(comp.start_date)
  const end   = formatDate(comp.end_date)
  const dateStr = start && end ? `${start} – ${end}` : start ?? end ?? null

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-800 leading-snug">{comp.name}</h2>
            {comp.location && <p className="text-sm text-slate-400 mt-0.5">{comp.location}</p>}
            {dateStr && <p className="text-xs text-slate-400 mt-1">{dateStr}</p>}
          </div>
          <span className={['px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5', COMP_STATUS_BADGE[comp.status]].join(' ')}>
            {comp.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />}
            {t.status[comp.status]}
          </span>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onEnter}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all"
          >
            {t.enter}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── detail view ──────────────────────────────────────────────────────────────

function CompetitionDetail({ comp, lang, onBack }: {
  comp: LobbyCompetition
  lang: Lang
  onBack: () => void
}) {
  const t = T[lang]
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [panels, setPanels] = useState<LobbyPanel[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // 1. Get my SPJ entries for this competition's sections
      const { data: sections } = await supabase
        .from('sections')
        .select('id, section_number, label')
        .eq('competition_id', comp.id)
      if (!sections?.length) { setLoading(false); return }

      const sectionIds = sections.map(s => s.id)

      // 2. Get locked panels for these sections
      const { data: locks } = await (supabase as any)
        .from('section_panel_locks')
        .select('section_id, panel_id, locked')
        .in('section_id', sectionIds)
        .eq('locked', true)
      if (!locks?.length) { setLoading(false); return }

      const lockedPairs = (locks as { section_id: string; panel_id: string }[]).map(l => `${l.section_id}|${l.panel_id}`)

      // 3. Get my assignments in these sections
      const { data: mySpjs } = await supabase
        .from('section_panel_judges')
        .select('id, section_id, panel_id, role, role_number')
        .eq('judge_id', user.id)
        .in('section_id', sectionIds)
      if (!mySpjs?.length) { setLoading(false); return }

      // Filter to only locked panels
      const lockedSpjs = mySpjs.filter(s => lockedPairs.includes(`${s.section_id}|${s.panel_id}`))
      if (!lockedSpjs.length) { setLoading(false); return }

      const panelIds = [...new Set(lockedSpjs.map(s => s.panel_id))]

      // 4. Fetch panel numbers + sessions
      const [panelsRes, sessionsRes] = await Promise.all([
        supabase.from('panels').select('id, panel_number').in('id', panelIds),
        supabase.from('sessions')
          .select('id, name, status, section_id, panel_id')
          .in('section_id', sectionIds)
          .in('panel_id', panelIds),
      ])

      const panelMap = Object.fromEntries((panelsRes.data ?? []).map(p => [p.id, p.panel_number]))
      const sectionMap = Object.fromEntries(sections.map(s => [s.id, s]))
      const allSessions = sessionsRes.data ?? []
      const sessionIds = allSessions.map(s => s.id)

      // 5. Fetch starting orders
      const { data: orders } = sessionIds.length > 0
        ? await supabase.from('session_orders').select('session_id, position, team_id').in('session_id', sessionIds).order('position')
        : { data: [] as { session_id: string; position: number; team_id: string }[] }

      const teamIds = [...new Set((orders ?? []).map(o => o.team_id))]
      const { data: teamsData } = teamIds.length > 0
        ? await supabase.from('teams').select('id, gymnast_display').in('id', teamIds)
        : { data: [] as { id: string; gymnast_display: string }[] }

      const teamMap = Object.fromEntries((teamsData ?? []).map(t => [t.id, t.gymnast_display]))

      // 6. Build panel groups (deduplicate section×panel)
      const groupMap = new Map<string, LobbyPanel>()
      for (const spj of lockedSpjs) {
        const key = `${spj.section_id}|${spj.panel_id}`
        if (!groupMap.has(key)) {
          const sec = sectionMap[spj.section_id]
          groupMap.set(key, {
            sectionId: spj.section_id,
            sectionNumber: sec?.section_number ?? 0,
            sectionLabel: sec?.label ?? null,
            panelId: spj.panel_id,
            panelNumber: panelMap[spj.panel_id] ?? 0,
            roles: [],
            sessions: allSessions
              .filter(s => s.section_id === spj.section_id && s.panel_id === spj.panel_id)
              .map(s => ({
                id: s.id,
                name: s.name,
                status: s.status as SessionStatus,
                orders: (orders ?? [])
                  .filter(o => o.session_id === s.id)
                  .map(o => ({ position: o.position, gymnast_display: teamMap[o.team_id] ?? '' })),
              })),
          })
        }
        groupMap.get(key)!.roles.push({ role: spj.role, roleNumber: spj.role_number })
      }

      const sorted = [...groupMap.values()].sort(
        (a, b) => a.sectionNumber - b.sectionNumber || a.panelNumber - b.panelNumber
      )
      setPanels(sorted)
      setLoading(false)
    }
    load()
  }, [comp.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t.back}
        </button>
        <h1 className="text-base font-bold text-slate-800 flex-1 leading-snug">{comp.name}</h1>
      </div>

      <h2 className="text-sm font-semibold text-slate-600">{t.myAssignments}</h2>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      ) : panels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 rounded-2xl">
          <p className="text-sm font-semibold text-slate-500">{t.noLockedPanels}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {panels.map(panel => {
            const sectionLabel = panel.sectionLabel ?? t.sectionN(panel.sectionNumber)
            const hasActiveSession = panel.sessions.some(s => s.status === 'active')
            const route = rolesToRoute(panel.roles.map(r => r.role))

            return (
              <div key={`${panel.sectionId}|${panel.panelId}`}
                className={['border rounded-2xl overflow-hidden', hasActiveSession ? 'border-blue-300 shadow-sm shadow-blue-100' : 'border-slate-200'].join(' ')}>

                {/* panel header */}
                <div className={['px-4 py-3 flex items-center gap-3', hasActiveSession ? 'bg-blue-50' : 'bg-slate-50 border-b border-slate-100'].join(' ')}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">{sectionLabel}</p>
                    <p className="text-xs text-slate-400">{t.panelN(panel.panelNumber)}</p>
                  </div>
                  {/* role badges */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {panel.roles
                      .slice()
                      .sort((a, b) => (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99))
                      .map((r, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold">
                          {r.role}
                        </span>
                      ))}
                  </div>
                  {/* DJ review button — available from registration_closed onward */}
                  {(['registration_closed', 'active', 'finished'] as CompetitionStatus[]).includes(comp.status) &&
                    panel.roles.some(r => r.role === 'DJ') && (
                    <button
                      onClick={() => router.push(`/dj-review?comp=${comp.id}`)}
                      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-all"
                    >
                      {t.djReviewButton}
                    </button>
                  )}
                </div>

                {/* sessions */}
                <div className="divide-y divide-slate-100">
                  {panel.sessions.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-slate-400">{t.noOrder}</p>
                  ) : (
                    panel.sessions.map(session => (
                      <div key={session.id} className="px-4 py-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-700 flex-1">{session.name}</p>
                          <span className={['px-2 py-0.5 rounded-md text-xs font-semibold', SESSION_STATUS_BADGE[session.status]].join(' ')}>
                            {t.sessionStatus[session.status]}
                          </span>
                          {session.status === 'active' && (
                            <button
                              onClick={() => router.push(route)}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-1.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
                              {t.scoreButton}
                            </button>
                          )}
                        </div>

                        {session.orders.length > 0 ? (
                          <div>
                            <p className="text-xs font-medium text-slate-400 mb-1.5">{t.startingOrder}</p>
                            <div className="space-y-1">
                              {session.orders.map(o => (
                                <div key={o.position} className="flex items-center gap-3 text-xs text-slate-600">
                                  <span className="w-5 text-right font-mono text-slate-400 shrink-0">{o.position}</span>
                                  <span>{o.gymnast_display}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">{t.noOrder}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function JudgeLobby({ lang }: { lang: Lang }) {
  const t = T[lang]
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [competitions, setCompetitions] = useState<LobbyCompetition[]>([])
  const [selectedComp, setSelectedComp] = useState<LobbyCompetition | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Derive competitions from actual panel assignments (section_panel_judges)
      // This is more reliable than nominations (avoids RLS / club_id nullability issues)
      const { data: spjs } = await supabase
        .from('section_panel_judges')
        .select('section_id')
        .eq('judge_id', user.id)
      if (!spjs?.length) { setLoading(false); return }

      const sectionIds = [...new Set(spjs.map(s => s.section_id))]
      const { data: sections } = await supabase
        .from('sections')
        .select('competition_id')
        .in('id', sectionIds)
      if (!sections?.length) { setLoading(false); return }

      const compIds = [...new Set(sections.map(s => s.competition_id))]
      const { data: comps } = await supabase
        .from('competitions')
        .select('id, name, location, start_date, end_date, status')
        .in('id', compIds)
        .order('start_date', { ascending: false })

      setCompetitions((comps ?? []) as LobbyCompetition[])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  if (selectedComp) {
    return (
      <CompetitionDetail
        comp={selectedComp}
        lang={lang}
        onBack={() => setSelectedComp(null)}
      />
    )
  }

  if (competitions.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
        </svg>
      </div>
      <p className="text-base font-semibold text-slate-600">{t.noCompetitions}</p>
      <p className="text-sm text-slate-400 mt-1">{t.noCompetitionsSub}</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-lg font-bold text-slate-800">{t.title}</h1>
      {competitions.map(comp => (
        <CompetitionCard
          key={comp.id}
          comp={comp}
          lang={lang}
          onEnter={() => setSelectedComp(comp)}
        />
      ))}
    </div>
  )
}
