'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import CompetitionDetail from '@/components/admin/competition-detail/CompetitionDetail'
import AuthBar from '@/components/shared/AuthBar'
import { useCompetitionPage } from '@/hooks/useCompetitionPage'
import type { Lang } from '@/components/scoring/types'
import type { Judge, SessionOrder } from '@/components/admin/types'

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [lang, setLang] = useState<Lang>('es')

  const {
    loading, competition, panels, sections, sessions,
    globalJudges, judgePool, nominations, assignments, panelLocks,
    globalTeams, clubs, entries, sessionOrders, lockedSessions,
    availableAdmins, ageGroupRules, apparatus, apparatusRules, competitionGymnasts, globalCoaches, competitionCoaches,
    provisionalEntries, definitiveEntries, rankingMergeGroups, sessionEligibleTeamCounts, actionError,
    setLockedSessions, setSessionOrders,
    handleAdvanceStatus, handleRevertStatus, handleSetPanelCount,
    handleAddSection, handleUpdateSectionLabel, handleUpdateSectionTimes, handleDeleteSection,
    handleAddSession, handleDeleteSession, handleReorderStructureSessions,
    handleAddToPool, handleRemoveFromPool, handleAssignJudge,
    handleAddSlot, handleRemoveSlot, handleTogglePanelLock, handleCopyPanel,
    handleToggleDropout, handleRemoveClubEntries,
    handleReorder, handleReorderTimeline,
    handleUpdateCompetition, handleUpdateFees, handleUploadPoster, handleUploadLogo, handleSetDJReviewDeadline,
    handleStartSession, handleFinishSession, handleRevertSession,
    handleAssignSessionMergeGroup, handleCreateRankingMergeGroup,
    handleUpdateTshirtConfig, handleUpdateAccreditationConfig,
    clearActionError,
  } = useCompetitionPage(id)

  async function handleCreateJudge(data: Omit<Judge, 'id' | 'avatar_url'>) {
    const { full_name, email, phone, licence, sport_type } = data
    if (!email) return
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const body: Record<string, string> = { role: 'judge', email, full_name, sport_type: sport_type ?? 'acro' }
    if (phone)   body.phone   = phone
    if (licence) body.licence = licence
    const res = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error ?? 'Failed to send invite')
    }
  }

  // admin-only: auto-creates session_orders when locking for the first time
  async function handleToggleLock(sessionId: string) {
    const supabase = createClient()
    const isLocked = lockedSessions.includes(sessionId)

    if (!isLocked) {
      const existingOrders = sessionOrders.filter(o => o.session_id === sessionId)
      if (existingOrders.length === 0) {
        const session = sessions.find(s => s.id === sessionId)
        if (session) {
          const sessionTeamIds = entries
            .filter(e => !e.dropped_out)
            .map(e => e.team_id)
            .filter(tid => {
              const team = globalTeams.find(t => t.id === tid)
              return team?.age_group === session.age_group && team?.category === session.category
            })

          if (sessionTeamIds.length > 0) {
            const newOrders: SessionOrder[] = sessionTeamIds.map((teamId, idx) => ({
              session_id: sessionId, team_id: teamId, position: idx + 1,
            }))
            await supabase.from('session_orders')
              .upsert(newOrders, { onConflict: 'session_id,team_id' })
            setSessionOrders(prev => [
              ...prev.filter(o => o.session_id !== sessionId),
              ...newOrders,
            ])
          }
        }
      }
    }

    await supabase.from('sessions').update({ order_locked: !isLocked } as never).eq('id', sessionId)
    setLockedSessions(prev =>
      isLocked ? prev.filter(sid => sid !== sessionId) : [...prev, sessionId]
    )
  }

  // ── render ────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar lang={lang} onLangChange={(l) => setLang(l as Lang)} />
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10">
        <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-px bg-slate-200" />
        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex gap-1 py-1">
          {[80, 64, 72, 88, 56, 76, 60].map((w, i) => (
            <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" style={{ width: w }} />
          ))}
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                <div className="h-9 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
          <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-36 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (!competition) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-sm text-slate-400">Competition not found.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar lang={lang} onLangChange={setLang} />

      <CompetitionDetail
        lang={lang}
        competition={competition}
        panels={panels}
        sections={sections}
        sessions={sessions}
        onBack={() => router.push('/admin')}
        onAdvanceStatus={handleAdvanceStatus}
        onRevertStatus={handleRevertStatus}
        onSetPanelCount={handleSetPanelCount}
        onAddSection={handleAddSection}
        onUpdateSectionLabel={handleUpdateSectionLabel}
        onUpdateSectionTimes={handleUpdateSectionTimes}
        onDeleteSection={handleDeleteSection}
        onAddSession={handleAddSession}
        onDeleteSession={handleDeleteSession}
        onReorderSessions={handleReorderStructureSessions}
        rankingMergeGroups={rankingMergeGroups}
        sessionEligibleTeamCounts={sessionEligibleTeamCounts}
        onAssignSessionMergeGroup={handleAssignSessionMergeGroup}
        onCreateRankingMergeGroup={handleCreateRankingMergeGroup}
        globalJudges={globalJudges}
        judgePool={judgePool}
        nominations={nominations}
        assignments={assignments}
        panelLocks={panelLocks}
        onAddToPool={handleAddToPool}
        onRemoveFromPool={handleRemoveFromPool}
        onAssignJudge={handleAssignJudge}
        onAddSlot={handleAddSlot}
        onRemoveSlot={handleRemoveSlot}
        onTogglePanelLock={handleTogglePanelLock}
        onCopyPanel={handleCopyPanel}
        onCreateJudge={handleCreateJudge}
        globalTeams={globalTeams}
        clubs={clubs}
        entries={entries}
        provisionalEntries={provisionalEntries}
        definitiveEntries={definitiveEntries}
        onToggleDropout={handleToggleDropout}
        onRemoveClubEntries={handleRemoveClubEntries}
        sessionOrders={sessionOrders}
        lockedSessions={lockedSessions}
        onReorder={handleReorder}
        onToggleLock={handleToggleLock}
        onReorderTimeline={handleReorderTimeline}
        availableAdmins={availableAdmins}
        ageGroupRules={ageGroupRules}
        apparatus={apparatus}
        apparatusRules={apparatusRules}
        onUpdateCompetition={handleUpdateCompetition}
        onUploadPoster={handleUploadPoster}
        onUploadLogo={handleUploadLogo}
        onUpdateFees={handleUpdateFees}
        onSetDJReviewDeadline={handleSetDJReviewDeadline}
        onStartSession={handleStartSession}
        onFinishSession={handleFinishSession}
        onRevertSession={handleRevertSession}
        competitionGymnasts={competitionGymnasts}
        globalCoaches={globalCoaches}
        competitionCoaches={competitionCoaches}
        onUpdateTshirtConfig={handleUpdateTshirtConfig}
        onUpdateAccreditationConfig={handleUpdateAccreditationConfig}
      />
    </div>
  )
}
