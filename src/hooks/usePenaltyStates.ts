import { useState } from 'react'
import type { PenaltyState } from '@/components/scoring/types'
import { DEFAULT_PENALTY } from '@/components/scoring/types'

/**
 * Manages per-performance CJP penalty state map.
 * Used by CJP views that handle multiple performances.
 */
export function usePenaltyStates() {
  const [penaltyStates, setPenaltyStatesMap] = useState<Record<string, PenaltyState>>({})

  function getPenaltyState(perfId: string): PenaltyState {
    return penaltyStates[perfId] ?? DEFAULT_PENALTY
  }

  function setPenaltyState(perfId: string, p: PenaltyState) {
    setPenaltyStatesMap((prev) => ({ ...prev, [perfId]: p }))
  }

  return { penaltyStates, getPenaltyState, setPenaltyState }
}
