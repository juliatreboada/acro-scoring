import type { ElementType } from '../ej-scoring/types'

export type { ElementType }

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
  reviewedAt: string | null
  elements: ReviewElement[]
}
