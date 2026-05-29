'use client'

import { useState, useEffect } from 'react'
import type { Lang } from '@/components/scoring/types'
import type { Team, Club, Gymnast, CompetitionEntry, AgeGroupRule, CompetitionStatus } from '@/components/admin/types'
import { categoryLabel, sortByAgeGroupAndCategory } from '@/components/admin/types'
import { ClubAvatar, TeamAvatar } from '@/components/admin/Avatar'
import { INPUT_CLS } from '@/lib/uiConstants'
import { SubTabSwitcher } from './SubTabSwitcher'
import ImportTab from './ImportTab'
import { createClient } from '@/lib/supabase'
import { ProvisionalSubTab } from './ProvisionalSubTab'
import { DefinitiveSubTab } from './DefinitiveSubTab'
import { useT } from '@/lib/useT'

// ─── local DB types ───────────────────────────────────────────────────────────

type ProvisionalEntry = {
  id: string
  club_id: string
  teams_per_category: Record<string, number>
  created_at: string
}

type DefinitiveEntry = {
  id: string
  club_id: string
  contact_name: string
  contact_phone: string
  contact_email: string
  teams_per_category: Record<string, number>
  judge_name: string | null
  total_amount: number
  status: 'pending' | 'payment_uploaded' | 'approved' | 'rejected'
  payment_document_url: string | null
  admin_notes: string | null
  created_at: string
}

type AllowedClub = {
  id: string
  club_id: string
  source: 'definitive_entry' | 'manual'
  created_at: string
}

// ─── shared helpers ───────────────────────────────────────────────────────────

// ─── level helpers (shared with nominative view) ──────────────────────────────

type Level = 'Escolar' | 'Base' | 'Nacional'
const LEVEL_ORDER: Level[] = ['Escolar', 'Base', 'Nacional']

function getLevel(ageGroupId: string, rules: AgeGroupRule[]): Level {
  const level = rules.find(r => r.id === ageGroupId)?.level ?? ''
  if (level === 'Escolar') return 'Escolar'
  if (level === 'Base')    return 'Base'
  return 'Nacional'
}


// ─── invite club form ─────────────────────────────────────────────────────────

function InviteClubForm({ lang, competitionId, onDone, onCancel }: {
  lang: Lang
  competitionId: string
  onDone: () => void
  onCancel: () => void
}) {
  const t = useT('RegistrationsTab', lang)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true); setError(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch('/api/admin/invite-club', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Failed to send invitation')
      }
      setSent(email.trim())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-green-800">{t.inviteSent} {sent}</p>
        <p className="text-xs text-green-700">{t.inviteClubInfo}</p>
        <div className="flex justify-end">
          <button onClick={onDone}
            className="px-4 py-2 rounded-xl text-sm font-medium text-green-700 hover:bg-green-100 transition-all">
            {t.cancel}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">{t.inviteClubTitle}</p>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">{t.emailLabel} *</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoFocus
          className={INPUT_CLS}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all">
          {t.cancel}
        </button>
        <button type="submit" disabled={sending}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all">
          {sending ? t.sending : t.sendInvite}
        </button>
      </div>
    </form>
  )
}


// ─── nominative view helpers ──────────────────────────────────────────────────

type GroupItem = { entry: CompetitionEntry; team: Team; club: Club | undefined; missingLicencia: boolean; missingTS: boolean; missingMusic: boolean }

function RegistrationGroup({ age_group, category, items, lang, agLabels, open, onToggle, onToggleDropout, musicUnlockByTeam, onToggleMusicUnlock }: {
  age_group: string
  category: string
  items: GroupItem[]
  lang: Lang
  agLabels: Record<string, string>
  open: boolean
  onToggle: () => void
  onToggleDropout: (entryId: string) => void
  musicUnlockByTeam: Record<string, boolean>
  onToggleMusicUnlock: (teamId: string, enabled: boolean) => Promise<void> | void
}) {
  const t = useT('RegistrationsTab', lang)
  const activeCount = items.filter((i) => !i.entry.dropped_out).length
  const dropoutCount = items.filter((i) => i.entry.dropped_out).length

  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center gap-3 mb-3 text-left group">
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

      {open && <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
        {items.map(({ entry, team, club, missingLicencia, missingTS, missingMusic }) => (
          <div key={entry.id} className={['flex items-center gap-3 px-4 py-3 transition-colors', entry.dropped_out ? 'bg-slate-50' : 'bg-white'].join(' ')}>
            <div className={['relative shrink-0', entry.dropped_out ? 'opacity-40' : ''].join(' ')}>
              <TeamAvatar team={team} />
              <div className="absolute -bottom-1 -right-1"><ClubAvatar club={club} size="sm" ring /></div>
            </div>

            {entry.dorsal != null && (
              <span className={['text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
                entry.dropped_out ? 'bg-slate-100 text-slate-300' : 'bg-slate-800 text-white'].join(' ')}>
                #{entry.dorsal}
              </span>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={['text-sm font-medium text-slate-800 truncate', entry.dropped_out ? 'line-through text-slate-400' : ''].join(' ')}>
                  {team.gymnast_display}
                </p>
                {missingLicencia && (
                  <span title={t.licenciaWarningFull} className="text-xs font-semibold px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full shrink-0">
                    ⚠ {t.licenciaWarning}
                  </span>
                )}
                {missingTS && (
                  <span title={t.tsWarningFull} className="text-xs font-semibold px-1.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full shrink-0">
                    ⚠ {t.tsWarning}
                  </span>
                )}
                {missingMusic && (
                  <span title={t.musicWarningFull} className="text-xs font-semibold px-1.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-full shrink-0">
                    ⚠ {t.musicWarning}
                  </span>
                )}
              </div>
              <p className={['text-xs truncate', entry.dropped_out ? 'text-slate-300' : 'text-slate-400'].join(' ')}>
                {club?.club_name ?? '—'}
              </p>
            </div>

            {entry.dropped_out && (
              <span className="text-xs font-semibold text-red-400 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full shrink-0">
                {t.baja}
              </span>
            )}

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => void onToggleMusicUnlock(team.id, !musicUnlockByTeam[team.id])}
                className={[
                  'text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all',
                  musicUnlockByTeam[team.id]
                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    : 'border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100',
                ].join(' ')}
              >
                {musicUnlockByTeam[team.id] ? t.closeMusicReopen : t.reopenMusic}
              </button>
              <button
                onClick={() => onToggleDropout(entry.id)}
                className={['text-xs font-medium px-3 py-1.5 rounded-lg border transition-all',
                  entry.dropped_out ? 'border-slate-200 text-slate-500 hover:bg-white' : 'border-red-100 text-red-500 hover:bg-red-50'].join(' ')}
              >
                {entry.dropped_out ? t.undoDropout : t.markDropout}
              </button>
            </div>
          </div>
        ))}
      </div>}
    </div>
  )
}

// ─── types ────────────────────────────────────────────────────────────────────

type SubTab = 'provisional' | 'definitive' | 'nominative'

// ─── status → default sub-tab ─────────────────────────────────────────────────

function defaultSubTab(status: CompetitionStatus): SubTab {
  if (status === 'provisional_entry') return 'provisional'
  if (status === 'definitive_entry')  return 'definitive'
  return 'nominative'
}

export type RegistrationsTabProps = {
  lang: Lang
  globalTeams: Team[]
  clubs: Club[]
  gymnasts: Gymnast[]
  entries: CompetitionEntry[]
  agLabels: Record<string, string>
  onToggleDropout: (entryId: string) => void
  onRemoveClubEntries?: (clubId: string) => void
  competitionId: string
  ageGroupRules: AgeGroupRule[]
  competitionAgeGroups: string[]
  competitionYear: number
  competitionStatus: CompetitionStatus
  provisionalEntries: ProvisionalEntry[]
  definitiveEntries: DefinitiveEntry[]
}

export default function RegistrationsTab({
  lang, globalTeams, clubs, gymnasts, entries, agLabels, onToggleDropout, onRemoveClubEntries,
  competitionId, ageGroupRules, competitionAgeGroups, competitionYear, competitionStatus,
  provisionalEntries: initialProvisionalEntries, definitiveEntries: initialDefinitiveEntries,
}: RegistrationsTabProps) {
  const t = useT('RegistrationsTab', lang)
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(() => defaultSubTab(competitionStatus))
  const [showImport, setShowImport] = useState(false)

  const [openLevels,   setOpenLevels]   = useState<Set<string>>(new Set())
  const [openGroups,   setOpenGroups]   = useState<Set<string>>(new Set())
  const [routineMusic, setRoutineMusic] = useState<Array<{ team_id: string; music_path: string | null; ts_path: string | null }>>([])
  const [musicUnlockByTeam, setMusicUnlockByTeam] = useState<Record<string, boolean>>({})

  const [provisionalEntries, setProvisionalEntries] = useState<ProvisionalEntry[]>(() => initialProvisionalEntries)
  const [definitiveEntries,  setDefinitiveEntries]  = useState<DefinitiveEntry[]>(() => initialDefinitiveEntries)
  const [allowedClubs,       setAllowedClubs]       = useState<AllowedClub[]>([])
  const [extraClubs,         setExtraClubs]         = useState<Club[]>([])

  useEffect(() => {
    const teamIds = entries.map(e => e.team_id)
    if (teamIds.length === 0) return
    const supabase = createClient()
    supabase
      .from('routine_music')
      .select('team_id, music_path, ts_path')
      .eq('competition_id', competitionId)
      .in('team_id', teamIds)
      .then(({ data }) => { if (data) setRoutineMusic(data) })
    supabase
      .from('competition_music_unlocks')
      .select('team_id, enabled')
      .eq('competition_id', competitionId)
      .in('team_id', teamIds)
      .then(({ data }) => {
        const map: Record<string, boolean> = {}
        for (const row of data ?? []) map[row.team_id] = !!row.enabled
        setMusicUnlockByTeam(map)
      })
  }, [competitionId, entries])

  async function toggleMusicUnlock(teamId: string, enabled: boolean) {
    const supabase = createClient()
    if (enabled) {
      await supabase
        .from('competition_music_unlocks')
        .upsert({ competition_id: competitionId, team_id: teamId, enabled: true }, { onConflict: 'competition_id,team_id' })
      setMusicUnlockByTeam((prev) => ({ ...prev, [teamId]: true }))
    } else {
      await supabase
        .from('competition_music_unlocks')
        .delete()
        .eq('competition_id', competitionId)
        .eq('team_id', teamId)
      setMusicUnlockByTeam((prev) => ({ ...prev, [teamId]: false }))
    }
  }

  async function fetchEntryData() {
    const supabase = createClient()
    const { data: allowedData } = await supabase
      .from('competition_allowed_clubs')
      .select('id,club_id,source,created_at')
      .eq('competition_id', competitionId)
    if (allowedData) setAllowedClubs(allowedData as AllowedClub[])

    const allEntryClubIds = [
      ...provisionalEntries.map(e => e.club_id),
      ...definitiveEntries.map(e => e.club_id),
      ...(allowedData ?? []).map(ac => ac.club_id),
    ]
    const knownIds = new Set(clubs.map(c => c.id))
    const missingIds = [...new Set(allEntryClubIds)].filter(id => !knownIds.has(id))
    if (missingIds.length > 0) {
      const { data: extra } = await supabase.from('clubs').select('id,club_name,avatar_url,contact_name,phone').in('id', missingIds)
      if (extra) setExtraClubs(extra as Club[])
    }
  }

  useEffect(() => { fetchEntryData() }, [competitionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const allClubs = [...clubs, ...extraClubs]

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

  return (
    <div>
      <SubTabSwitcher
        tabs={[
          { key: 'provisional', label: t.subTabs.provisional },
          { key: 'definitive',  label: t.subTabs.definitive  },
          { key: 'nominative',  label: t.subTabs.nominative  },
        ] as const}
        active={activeSubTab}
        onChange={setActiveSubTab}
      />

      {activeSubTab === 'provisional' && (
        <ProvisionalSubTab
          lang={lang}
          provisionalEntries={provisionalEntries}
          clubs={allClubs}
          ageGroupRules={ageGroupRules}
          competitionAgeGroups={competitionAgeGroups}
        />
      )}

      {activeSubTab === 'definitive' && (
        <DefinitiveSubTab
          lang={lang}
          competitionId={competitionId}
          definitiveEntries={definitiveEntries}
          allowedClubs={allowedClubs}
          clubs={allClubs}
          entries={entries}
          ageGroupRules={ageGroupRules}
          competitionAgeGroups={competitionAgeGroups}
          onRefresh={fetchEntryData}
          onUpdateEntry={(updated) => setDefinitiveEntries(prev => prev.map(e => e.id === updated.id ? updated : e))}
          onRemoveClubEntries={onRemoveClubEntries ?? (() => {})}
        />
      )}

      {activeSubTab === 'nominative' && (
        <NominativeView
          lang={lang}
          globalTeams={globalTeams}
          clubs={clubs}
          gymnasts={gymnasts}
          entries={entries}
          agLabels={agLabels}
          onToggleDropout={onToggleDropout}
          ageGroupRules={ageGroupRules}
          routineMusic={routineMusic}
          openLevels={openLevels}
          openGroups={openGroups}
          setOpenLevels={setOpenLevels}
          setOpenGroups={setOpenGroups}
          musicUnlockByTeam={musicUnlockByTeam}
          onToggleMusicUnlock={toggleMusicUnlock}
          onShowImport={() => setShowImport(true)}
          competitionId={competitionId}
          competitionAgeGroups={competitionAgeGroups}
          competitionYear={competitionYear}
        />
      )}
    </div>
  )
}

// ─── nominative view (extracted) ─────────────────────────────────────────────

function NominativeView({ lang, globalTeams, clubs, gymnasts, entries, agLabels, onToggleDropout, ageGroupRules, routineMusic, openLevels, openGroups, setOpenLevels, setOpenGroups, musicUnlockByTeam, onToggleMusicUnlock, onShowImport }: {
  lang: Lang
  globalTeams: Team[]
  clubs: Club[]
  gymnasts: Gymnast[]
  entries: CompetitionEntry[]
  agLabels: Record<string, string>
  onToggleDropout: (entryId: string) => void
  ageGroupRules: AgeGroupRule[]
  routineMusic: Array<{ team_id: string; music_path: string | null; ts_path: string | null }>
  openLevels: Set<string>
  openGroups: Set<string>
  setOpenLevels: React.Dispatch<React.SetStateAction<Set<string>>>
  setOpenGroups: React.Dispatch<React.SetStateAction<Set<string>>>
  musicUnlockByTeam: Record<string, boolean>
  onToggleMusicUnlock: (teamId: string, enabled: boolean) => Promise<void> | void
  onShowImport: () => void
  competitionId: string
  competitionAgeGroups: string[]
  competitionYear: number
}) {
  const t = useT('RegistrationsTab', lang)

  type Group = { age_group: string; category: string; items: GroupItem[] }
  const groupMap = new Map<string, Group>()

  for (const entry of entries) {
    const team = globalTeams.find((tm) => tm.id === entry.team_id)
    if (!team) continue
    const club = clubs.find((c) => c.id === team.club_id)
    const missingLicencia = (team.gymnast_ids ?? []).some((gid) => !gymnasts.find((g) => g.id === gid)?.licencia_url)
    const music = routineMusic.find((m) => m.team_id === team.id)
    const missingTS = !music?.ts_path
    const missingMusic = !music?.music_path
    const key = `${team.age_group}||${team.category}`
    if (!groupMap.has(key)) groupMap.set(key, { age_group: team.age_group, category: team.category, items: [] })
    groupMap.get(key)!.items.push({ entry, team, club, missingLicencia, missingTS, missingMusic })
  }

  const groups = sortByAgeGroupAndCategory([...groupMap.values()], ageGroupRules)
  const byLevel = new Map<Level, Group[]>()
  for (const g of groups) {
    const level = getLevel(g.age_group, ageGroupRules)
    if (!byLevel.has(level)) byLevel.set(level, [])
    byLevel.get(level)!.push(g)
  }
  const presentLevels = LEVEL_ORDER.filter(l => byLevel.has(l))
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
  const expandAll   = () => { setOpenLevels(new Set()); setOpenGroups(new Set()) }
  const collapseAll = () => { setOpenLevels(new Set(['__none__'])); setOpenGroups(new Set(['__none__'])) }

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-5">
        {entries.length > 0 && (
          <>
            <button onClick={expandAll} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">{t.expandAll}</button>
            <span className="text-slate-200">|</span>
            <button onClick={collapseAll} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">{t.collapseAll}</button>
          </>
        )}
        <button onClick={onShowImport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {t.import}
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-12 border border-dashed border-slate-200 rounded-xl">{t.noRegistrations}</p>
      ) : (
        <div className="space-y-4">
          {presentLevels.map(level => {
            const levelGroups = byLevel.get(level)!
            const levelOpen = isLevelOpen(level)
            const totalActive = levelGroups.reduce((sum, g) => sum + g.items.filter(i => !i.entry.dropped_out).length, 0)
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
                  <span className="text-xs text-slate-400">{t.registered(totalActive)}</span>
                </button>

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
                          musicUnlockByTeam={musicUnlockByTeam}
                          onToggleMusicUnlock={onToggleMusicUnlock}
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
