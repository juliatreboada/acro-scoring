'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import CompetitionDetail from '@/components/admin/competition-detail/CompetitionDetail'
import AuthBar from '@/components/shared/AuthBar'
import { CompetitionPageSkeleton } from '@/components/admin/competition-detail/CompetitionPageSkeleton'
import { useCompetitionPage } from '@/hooks/useCompetitionPage'
import type { Lang } from '@/components/scoring/types'
import type { Judge, SessionOrder } from '@/components/admin/types'

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [lang, setLang] = useState<Lang>('es')

  const {
    loading, competition, panels, sections, sessions,
    globalJudges, judgePool, nominations, assignments, panelLocks,
    globalTeams, clubs, entries, sessionOrders, lockedSessions,
    availableAdmins, ageGroupRules, competitionGymnasts, globalCoaches, competitionCoaches,
    provisionalEntries, definitiveEntries,
    setLockedSessions, setSessionOrders,
    handleAdvanceStatus, handleSetPanelCount,
    handleAddSection, handleUpdateSectionLabel, handleUpdateSectionTimes, handleDeleteSection,
    handleAddSession, handleDeleteSession,
    handleAddToPool, handleRemoveFromPool, handleAssignJudge,
    handleAddSlot, handleRemoveSlot, handleTogglePanelLock,
    handleToggleDropout, handleRemoveClubEntries,
    handleReorder, handleReorderTimeline,
    handleUpdateCompetition, handleUpdateFees, handleUploadPoster, handleSetDJReviewDeadline,
    handleStartSession, handleFinishSession,
  } = useCompetitionPage(id)

  // ── admin-only: create judge via invite API ───────────────────────────────────
  async function handleCreateJudge(data: Omit<Judge, 'id' | 'avatar_url'>) {
    const { full_name, email, phone, licence } = data
    if (!email) return
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const body: Record<string, string> = { role: 'judge', email, full_name }
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

  // ── admin-only: auto-create session_orders when locking for the first time ────
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
    setLockedSessions(prev => isLocked ? prev.filter(sid => sid !== sessionId) : [...prev, sessionId])
  }

  if (loading) return <CompetitionPageSkeleton lang={lang} onLangChange={setLang} />

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
        onSetPanelCount={handleSetPanelCount}
        onAddSection={handleAddSection}
        onUpdateSectionLabel={handleUpdateSectionLabel}
        onUpdateSectionTimes={handleUpdateSectionTimes}
        onDeleteSection={handleDeleteSection}
        onAddSession={handleAddSession}
        onDeleteSession={handleDeleteSession}
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
        onUpdateCompetition={handleUpdateCompetition}
        onUploadPoster={handleUploadPoster}
        onUpdateFees={handleUpdateFees}
        onSetDJReviewDeadline={handleSetDJReviewDeadline}
        onStartSession={handleStartSession}
        onFinishSession={handleFinishSession}
        competitionGymnasts={competitionGymnasts}
        globalCoaches={globalCoaches}
        competitionCoaches={competitionCoaches}
      />
    </div>
  )
}
