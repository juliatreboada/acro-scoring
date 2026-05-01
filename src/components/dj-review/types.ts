import type { ElementType } from '../scoring/types'

export type { ElementType }

export type TsReviewStatus = 'pending' | 'awaiting_dj2' | 'checked' | 'incorrect' | 'new_ts'

export type ReviewElement = {
  id: string
  position: number
  label: string           // optional — can be empty
  elementType: ElementType
  isStatic: boolean       // only relevant when elementType === 'individual'
  difficultyValue: number
}

export type Sheet = {
  id: string
  teamId: string
  competitionId: string
  gymnasts: string
  ageGroup: string
  category: string
  routineType: string
  pdfUrl: string | null
  elements: ReviewElement[]
  // Review state (persisted in ts_review_status)
  reviewStatus: TsReviewStatus
  dj1Id: string | null            // judge who acted first
  dj1Decision: 'checked' | 'incorrect' | null
  dj1Comment: string | null
  dj2Id: string | null            // judge who confirmed/overrode
  finalComment: string | null     // comment sent to club (when incorrect)
  hasTwoDJs: boolean              // whether 2 DJs share this panel
}
