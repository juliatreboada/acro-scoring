import { useState, useEffect } from 'react'
import type { PenaltyState } from '@/components/scoring/types'
import { DEFAULT_PENALTY } from '@/components/scoring/types'

function safeRead<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) as T : null } catch { return null }
}
function safeWrite(key: string, val: unknown) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

const STORAGE_KEY = 'scoring_cjp_penalties'

export function usePenaltyStates() {
  const [penaltyStates, setPenaltyStatesMap] = useState<Record<string, PenaltyState>>({})

  useEffect(() => {
    const cached = safeRead<Record<string, PenaltyState>>(STORAGE_KEY)
    if (cached) setPenaltyStatesMap(cached)
  }, [])

  useEffect(() => {
    safeWrite(STORAGE_KEY, penaltyStates)
  }, [penaltyStates])

  function getPenaltyState(perfId: string): PenaltyState {
    return penaltyStates[perfId] ?? DEFAULT_PENALTY
  }

  function setPenaltyState(perfId: string, p: PenaltyState) {
    setPenaltyStatesMap((prev) => ({ ...prev, [perfId]: p }))
  }

  function clearPenaltyState(perfId: string) {
    setPenaltyStatesMap((prev) => {
      const next = { ...prev }
      delete next[perfId]
      return next
    })
  }

  return { penaltyStates, getPenaltyState, setPenaltyState, clearPenaltyState }
}
