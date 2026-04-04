import { useState, useEffect, useRef } from 'react'
import type { TsElement, Deductions } from '@/components/ej-scoring/types'

/**
 * Manages EJ-only element state: deductions, extra elements with drag-reorder,
 * and ordered display list. Used by EJ-only views (e.g. EJAJView).
 * Resets automatically when currentPerfId changes.
 */
export function useEJScoring(elements: TsElement[], currentPerfId: string | null) {
  const [deductions, setDeductions] = useState<Deductions>({})
  const [extraElements, setExtraElements] = useState<TsElement[]>([])
  const [orderedIds, setOrderedIds] = useState<string[]>([])
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropIdx, setDropIdx] = useState<number | null>(null)
  const dragRef = useRef<string | null>(null)
  const prevPerfId = useRef<string | null>(null)

  useEffect(() => {
    if (currentPerfId !== prevPerfId.current) {
      setDeductions({})
      setExtraElements([])
      setOrderedIds(elements.map((el) => el.id))
      dragRef.current = null
      prevPerfId.current = currentPerfId ?? null
    }
  }, [currentPerfId, elements])

  const allById = Object.fromEntries([...elements, ...extraElements].map((el) => [el.id, el]))
  const orderedAll = orderedIds.map((id) => allById[id]).filter((el): el is TsElement => el !== undefined)

  function handleLock(elementId: string, attemptNumber: number, value: number) {
    setDeductions((prev) => ({ ...prev, [`${elementId}:${attemptNumber}`]: { value, locked: true } }))
  }

  function handleAddElement() {
    const id = `extra-${Date.now()}`
    setExtraElements((prev) => [...prev, { id, position: 0, label: '', difficultyValue: 0 }])
    setOrderedIds((prev) => [...prev, id])
  }

  function handleLabelChange(id: string, label: string) {
    setExtraElements((prev) => prev.map((el) => el.id === id ? { ...el, label } : el))
  }

  function handleReorder(draggedId: string, targetIdx: number) {
    setOrderedIds((prev) => {
      const fromIdx = prev.indexOf(draggedId)
      if (fromIdx === -1) return prev
      const reordered = [...prev]
      reordered.splice(fromIdx, 1)
      reordered.splice(targetIdx, 0, draggedId)
      return reordered
    })
    setDragId(null)
    setDropIdx(null)
  }

  return {
    deductions, extraElements, orderedAll, dragId, dropIdx, dragRef,
    handleLock, handleAddElement, handleLabelChange, handleReorder,
    setDragId, setDropIdx,
  }
}
