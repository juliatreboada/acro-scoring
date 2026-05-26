'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CompetitionDetail from '@/components/admin/competition-detail/CompetitionDetail'
import AuthBar from '@/components/shared/AuthBar'
import { useCompetitionPage } from '@/hooks/useCompetitionPage'
import type { Lang } from '@/components/scoring/types'

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
    handleAdvanceStatus, handleRevertStatus, handleSetPanelCount,
    handleAddSection, handleUpdateSectionLabel, handleUpdateSectionTimes, handleDeleteSection,
    handleAddSession, handleDeleteSession,
    handleAddToPool, handleRemoveFromPool, handleAssignJudge,
    handleAddSlot, handleRemoveSlot, handleTogglePanelLock,
    handleToggleDropout, handleRemoveClubEntries,
    handleToggleLock, handleReorder, handleReorderTimeline,
    handleUpdateCompetition, handleUpdateFees, handleUploadPoster, handleUploadLogo, handleSetDJReviewDeadline,
    handleStartSession, handleFinishSession, handleRevertSession,
    handleAssignSessionMergeGroup, handleCreateRankingMergeGroup,
    clearActionError,
  } = useCompetitionPage(id)

  // ── render ────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <AuthBar lang={lang} onLangChange={setLang} />
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10">
        <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-px bg-slate-200" />
        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="bg-white border-b border-slate-200 px-4">
        <div className="max-w-5xl mx-auto flex gap-1 py-1">
          {[80, 64, 72, 88, 56, 76, 60].map((w, i) => (
            <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" style={{ width: w }} />
          ))}
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
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
        onRevertStatus={handleRevertStatus}
        onSetPanelCount={handleSetPanelCount}
        onAddSection={handleAddSection}
        onUpdateSectionLabel={handleUpdateSectionLabel}
        onUpdateSectionTimes={handleUpdateSectionTimes}
        onDeleteSection={handleDeleteSection}
        onAddSession={handleAddSession}
        onDeleteSession={handleDeleteSession}
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
      />
    </div>
  )
}
