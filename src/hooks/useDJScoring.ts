import { useState, useEffect, useRef } from 'react'
import type { TsElement, ElementType, Deductions } from '@/components/scoring/types'
import type { ElementFlag, ElementFlags } from '@/components/scoring/types'
import { DEFAULT_FLAG } from '@/components/scoring/types'
import { getElementConfig } from '@/components/shared/DJElementsShared'

function safeRead<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) as T : null } catch { return null }
}
function safeWrite(key: string, val: unknown) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

type DJCache = { flags: ElementFlags; extraElements: TsElement[]; incorrectTs: boolean; deductions: Deductions }

/**
 * Manages all DJ (and combined DJ+EJ) element state:
 * flags, extra elements, incorrect-Ts toggle, and EJ deductions.
 * Resets automatically when currentPerfId changes.
 * Persists to localStorage so a page refresh mid-session restores last state.
 */
export function useDJScoring(elements: TsElement[], currentPerfId: string | null) {
  const [flags, setFlags] = useState<ElementFlags>({})
  const [extraElements, setExtraElements] = useState<TsElement[]>([])
  const [incorrectTs, setIncorrectTs] = useState(false)
  const [deductions, setDeductions] = useState<Deductions>({})
  const prevPerfId = useRef<string | null>(null)

  useEffect(() => {
    if (currentPerfId !== prevPerfId.current) {
      const cacheKey = currentPerfId ? `scoring_dj_${currentPerfId}` : null
      const cached = cacheKey ? safeRead<DJCache>(cacheKey) : null
      if (cached) {
        setFlags(cached.flags)
        setExtraElements(cached.extraElements)
        setIncorrectTs(cached.incorrectTs)
        setDeductions(cached.deductions)
      } else {
        const initial: ElementFlags = {}
        elements.forEach((el) => { initial[`${el.id}:1`] = { ...DEFAULT_FLAG } })
        setFlags(initial)
        setIncorrectTs(false)
        setExtraElements([])
        setDeductions({})
      }
      prevPerfId.current = currentPerfId ?? null
    }
  }, [currentPerfId, elements])

  useEffect(() => {
    if (!currentPerfId) return
    safeWrite(`scoring_dj_${currentPerfId}`, { flags, extraElements, incorrectTs, deductions })
  }, [flags, extraElements, incorrectTs, deductions, currentPerfId])

  function handleFlagChange(elementId: string, attemptNumber: number, patch: Partial<ElementFlag>) {
    const key = `${elementId}:${attemptNumber}`
    const element = [...elements, ...extraElements].find((el) => el.id === elementId)
    const config = element ? getElementConfig(element) : null
    setFlags((prev) => {
      const current = prev[key] ?? DEFAULT_FLAG
      const updated = { ...current, ...patch }
      if (config && patch.tfCount !== undefined) {
        if (patch.tfCount >= config.autoNotDoneAt) updated.isDone = false
        else if (patch.tfCount > 0) updated.isDone = true
      }
      return { ...prev, [key]: updated }
    })
  }

  function handleLock(elementId: string, attemptNumber: number, value: number) {
    setDeductions((prev) => ({ ...prev, [`${elementId}:${attemptNumber}`]: { value, locked: true } }))
  }

  function handleOpenRetry(elementId: string, nextAttemptNumber: number) {
    const key = `${elementId}:${nextAttemptNumber}`
    setFlags((prev) => ({ ...prev, [key]: { ...DEFAULT_FLAG } }))
    setDeductions((prev) => ({ ...prev, [key]: { value: 0, locked: false } }))
  }

  function handleAddElement() {
    const id = `extra-${Date.now()}`
    setExtraElements((prev) => [...prev, { id, position: 0, label: '', difficultyValue: 0 }])
    setFlags((prev) => ({ ...prev, [`${id}:1`]: { ...DEFAULT_FLAG } }))
  }

  function handleLabelChange(id: string, label: string) {
    setExtraElements((prev) => prev.map((el) => el.id === id ? { ...el, label } : el))
  }

  function handleTypeChange(id: string, type: ElementType, isStatic?: boolean) {
    setExtraElements((prev) => prev.map((el) => el.id === id ? { ...el, elementType: type, isStatic: isStatic ?? el.isStatic } : el))
  }

  function clearCache() {
    if (currentPerfId && typeof window !== 'undefined') localStorage.removeItem(`scoring_dj_${currentPerfId}`)
  }

  return {
    flags, extraElements, incorrectTs, deductions,
    handleFlagChange, handleLock, handleOpenRetry,
    handleAddElement, handleLabelChange, handleTypeChange,
    toggleIncorrectTs: () => setIncorrectTs((v) => !v),
    clearCache,
  }
}
