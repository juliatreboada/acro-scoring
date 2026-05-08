'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import CompetitionDetail from '@/components/admin/competition-detail/CompetitionDetail'
import AuthBar from '@/components/shared/AuthBar'
import { CompetitionPageSkeleton } from '@/components/admin/competition-detail/CompetitionPageSkeleton'
import { useCompetitionPage } from '@/hooks/useCompetitionPage'
import type { Lang } from '@/components/scoring/types'

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [lang, setLang] = useState<Lang>('es')

  const {
    loading, competition, panels, sections, sessions,
    globalJudges, judgePool, nominations, assignments, panelLocks,
    globalTeams, clubs, entries, sessionOrders, lockedSessions,
    availableAdmins, ageGroupRules, apparatus, apparatusRules, competitionGymnasts, globalCoaches, competitionCoaches,
    provisionalEntries, definitiveEntries, actionError, clearActionError,
    setLockedSessions,
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

  // ── comp-admin uses simple toggle (no auto-create of session_orders) ──────────
  async function handleToggleLock(sessionId: string) {
    const supabase = createClient()
    const isLocked = lockedSessions.includes(sessionId)
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

      {actionError && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-red-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          <span>{actionError}</span>
          <button onClick={clearActionError} className="text-white/70 hover:text-white">✕</button>
        </div>
      )}

      <CompetitionDetail
        lang={lang}
        competition={competition}
        panels={panels}
        sections={sections}
        sessions={sessions}
        onBack={() => router.push('/comp-admin')}
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
        onUpdateFees={handleUpdateFees}
        onStartSession={handleStartSession}
        onFinishSession={handleFinishSession}
        onSetDJReviewDeadline={handleSetDJReviewDeadline}
        competitionGymnasts={competitionGymnasts}
        globalCoaches={globalCoaches}
        competitionCoaches={competitionCoaches}
      />
    </div>
  )
}
