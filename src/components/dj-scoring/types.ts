export type { Performance, Lang } from '../aj-scoring/types'
export type { TsElement, ElementType } from '../ej-scoring/types'

export type ElementFlag = {
  isDone: boolean | null  // null = pending, true = done, false = not done
  tfCount: number         // 0–3, penalty ×0.3 each
  srNotDone: boolean      // −1.0
  forbiddenElement: boolean   // −1.0
  landingWithoutSupport: boolean  // −0.5, only for 11–16 age groups
  note: string
}

// keyed by `${elementId}:${retryNumber}` (retryNumber 1 = main, 2–4 = retries)
export type ElementFlags = Record<string, ElementFlag>

export const DEFAULT_FLAG: ElementFlag = {
  isDone: null,
  tfCount: 0,
  srNotDone: false,
  forbiddenElement: false,
  landingWithoutSupport: false,
  note: '',
}
