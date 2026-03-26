export type { Performance, Lang } from '../aj-scoring/types'

export type ElementDeduction = {
  value: number
  locked: boolean
}

// key = `${elementId}:${retryNumber}` (retryNumber is 1 or 2)
export type Deductions = Record<string, ElementDeduction>

export type ElementType = 'balance' | 'mount' | 'dynamic' | 'individual' | 'motion'

export type TsElement = {
  id: string
  position: number
  label: string
  difficultyValue: number
  elementType?: ElementType
  isStatic?: boolean  // only relevant when elementType === 'individual'
}
