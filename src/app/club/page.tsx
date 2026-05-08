'use client'

import { useState } from 'react'
import type { Lang } from '@/components/scoring/types'
import { useClubData } from '@/hooks/useClubData'
import ClubPortal from '@/components/club/ClubPortal'
import AuthBar from '@/components/shared/AuthBar'

export default function Page() {
  const [lang, setLang] = useState<Lang>('es')

  const {
    loading, club,
    gymnasts, coaches, competitionCoaches, teams, competitions,
    entries, music, judges, nominations, agLabels, ageGroupRules, tsReviewStatuses, apparatus, apparatusRules,
    actionError, clearActionError,
    handleAddGymnast, handleAddGymnastsBulk, handleUpdateGymnast, handleDeleteGymnast,
    handleUploadGymnastPhoto, handleUploadLicencia, handleRemoveLicencia,
    handleAddCoach, handleUpdateCoach, handleDeleteCoach,
    handleUploadCoachPhoto, handleUploadCoachLicencia,
    handleRegisterCoach, handleUnregisterCoach,
    handleAddTeam, handleUpdateTeam, handleDeleteTeam, handleUploadTeamPhoto,
    handleRegister, handleDropout,
    handleInviteJudge, handleUpdateJudge, handleDeleteJudge, handleUploadJudgePhoto,
    handleNominate, handleRemoveNomination,
    handleUpdateClub, handleUploadAvatar,
    handleSetFile,
  } = useClubData()

  if (loading || !club) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <AuthBar lang={lang} onLangChange={setLang} />

      {actionError && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-red-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          <span>{actionError}</span>
          <button onClick={clearActionError} className="text-white/70 hover:text-white">✕</button>
        </div>
      )}

      <ClubPortal
        lang={lang}
        club={club}
        tsReviewStatuses={tsReviewStatuses}
        gymnasts={gymnasts}
        coaches={coaches}
        competitionCoaches={competitionCoaches}
        teams={teams}
        competitions={competitions}
        entries={entries}
        music={music}
        judges={judges}
        nominations={nominations}
        agLabels={agLabels}
        ageGroupRules={ageGroupRules}
        apparatus={apparatus}
        apparatusRules={apparatusRules}
        onAddGymnast={handleAddGymnast}
        onAddGymnastsBulk={handleAddGymnastsBulk}
        onUpdateGymnast={handleUpdateGymnast}
        onDeleteGymnast={handleDeleteGymnast}
        onUploadGymnastPhoto={handleUploadGymnastPhoto}
        onUploadLicencia={handleUploadLicencia}
        onRemoveLicencia={handleRemoveLicencia}
        onAddCoach={handleAddCoach}
        onUpdateCoach={handleUpdateCoach}
        onDeleteCoach={handleDeleteCoach}
        onUploadCoachPhoto={handleUploadCoachPhoto}
        onUploadCoachLicencia={handleUploadCoachLicencia}
        onRegisterCoach={handleRegisterCoach}
        onUnregisterCoach={handleUnregisterCoach}
        onAddTeam={handleAddTeam}
        onUpdateTeam={handleUpdateTeam}
        onDeleteTeam={handleDeleteTeam}
        onUploadTeamPhoto={handleUploadTeamPhoto}
        onRegister={handleRegister}
        onDropout={handleDropout}
        onSetFile={handleSetFile}
        onInviteJudge={handleInviteJudge}
        onUpdateJudge={handleUpdateJudge}
        onDeleteJudge={handleDeleteJudge}
        onUploadJudgePhoto={handleUploadJudgePhoto}
        onNominate={handleNominate}
        onRemoveNomination={handleRemoveNomination}
        onUpdateClub={handleUpdateClub}
        onUploadAvatar={handleUploadAvatar}
      />
    </div>
  )
}
