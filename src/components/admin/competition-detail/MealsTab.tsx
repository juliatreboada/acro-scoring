'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { MealOption, MealSubmission } from '@/components/admin/types'

type SubmissionRow = MealSubmission & { club_name: string; items: { option: MealOption; quantity: number }[] }

type Props = {
  lang: Lang
  competitionId: string
  mealsEnabled: boolean
  onToggleEnabled: (enabled: boolean) => Promise<void>
}

type SlotKey = string // `${day_label}||${meal_type}`
type LabelKey = string // `${SlotKey}::${labelName}`

function slotKey(day: string, type: string): SlotKey { return `${day}||${type}` }
function labelKey(sk: SlotKey, label: string): LabelKey { return `${sk}::${label}` }
function slotLabel(day: string, type: 'lunch' | 'dinner', lang: Lang) {
  return `${day} — ${type === 'lunch' ? (lang === 'es' ? 'Comida' : 'Lunch') : (lang === 'es' ? 'Cena' : 'Dinner')}`
}

export default function MealsTab({ lang, competitionId, mealsEnabled, onToggleEnabled }: Props) {
  const supabase = createClient()
  const [options, setOptions] = useState<MealOption[]>([])
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  // ── add-slot form ────────────────────────────────────────────────────────────
  const [addingSlot, setAddingSlot] = useState(false)
  const [slotDay, setSlotDay] = useState('')
  const [slotType, setSlotType] = useState<'lunch' | 'dinner'>('lunch')

  // ── local pending state (not yet in DB) ──────────────────────────────────────
  // Slots that have been "created" in the UI but have 0 options yet
  const [pendingSlots, setPendingSlots] = useState<{ key: SlotKey; day_label: string; meal_type: 'lunch' | 'dinner' }[]>([])
  // Labels within a slot that have been created but have 0 items yet
  const [pendingLabels, setPendingLabels] = useState<Record<SlotKey, string[]>>({})

  // ── add-label form ───────────────────────────────────────────────────────────
  const [addingLabelToSlot, setAddingLabelToSlot] = useState<SlotKey | null>(null)
  const [newLabelName, setNewLabelName] = useState('')

  // ── add-item form ────────────────────────────────────────────────────────────
  const [addingItemToLabel, setAddingItemToLabel] = useState<LabelKey | null>(null)
  const [itemName, setItemName] = useState('')
  const [itemDesc, setItemDesc] = useState('')
  const [itemPrice, setItemPrice] = useState('')

  // ── add-type form (child of an item) ─────────────────────────────────────────
  const [addingTypeTo, setAddingTypeTo] = useState<string | null>(null) // parent option id
  const [typeName, setTypeName] = useState('')
  const [typePrice, setTypePrice] = useState('')

  // ── edit-option form ──────────────────────────────────────────────────────────
  const [editingOption, setEditingOption] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPrice, setEditPrice] = useState('')

  // ── copy-slot form ────────────────────────────────────────────────────────────
  const [copyingSlot, setCopyingSlot] = useState<SlotKey | null>(null)
  const [copyDay, setCopyDay] = useState('')
  const [copyType, setCopyType] = useState<'lunch' | 'dinner'>('lunch')
  const [copying, setCopying] = useState(false)

  // ── slot edit / delete / reorder ──────────────────────────────────────────────
  const [editingSlot, setEditingSlot] = useState<SlotKey | null>(null)
  const [editSlotDay, setEditSlotDay] = useState('')
  const [editSlotType, setEditSlotType] = useState<'lunch' | 'dinner'>('lunch')
  const [slotOrder, setSlotOrder] = useState<SlotKey[]>([])
  const [draggedSlot, setDraggedSlot] = useState<SlotKey | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<SlotKey | null>(null)

  // ── reject modal ─────────────────────────────────────────────────────────────
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')

  // ── data loading ─────────────────────────────────────────────────────────────
  async function load() {
    setLoading(true)
    const [optRes, subRes, ordRes, clubRes] = await Promise.all([
      supabase.from('meal_options').select('*').eq('competition_id', competitionId).order('day_label').order('meal_type').order('sort_order'),
      supabase.from('meal_submissions').select('*').eq('competition_id', competitionId),
      supabase.from('meal_orders').select('*').eq('competition_id', competitionId),
      supabase.from('clubs').select('id,club_name'),
    ])

    const opts = ((optRes.data ?? []) as unknown as MealOption[]).map(o => ({ ...o, price: Number(o.price) }))
    setOptions(opts)

    const clubMap: Record<string, string> = Object.fromEntries(
      ((clubRes.data ?? []) as any[]).map((c: any) => [c.id, c.club_name])
    )
    const orders = (ordRes.data ?? []) as any[]
    const optMap = Object.fromEntries(opts.map(o => [o.id, o]))

    const rows: SubmissionRow[] = ((subRes.data ?? []) as unknown as MealSubmission[]).map(sub => {
      const clubOrders = orders.filter(o => o.club_id === sub.club_id && o.quantity > 0)
      const items = clubOrders
        .map((o: any) => ({ option: optMap[o.meal_option_id], quantity: o.quantity }))
        .filter((i: any) => i.option)
      return {
        ...sub,
        total_amount: sub.total_amount != null ? Number(sub.total_amount) : null,
        club_name: clubMap[sub.club_id] ?? sub.club_id,
        items,
      }
    })
    rows.sort((a, b) => {
      const order: Record<string, number> = { submitted: 0, draft: 1, rejected: 2, approved: 3 }
      return (order[a.status] ?? 9) - (order[b.status] ?? 9)
    })
    setSubmissions(rows)
    setLoading(false)
  }

  useEffect(() => { void load() }, [competitionId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`meal_slot_order_${competitionId}`)
      if (saved) setSlotOrder(JSON.parse(saved))
    } catch {}
  }, [competitionId])

  // ── derived: DB slots ────────────────────────────────────────────────────────
  const dbSlots = useMemo(() => {
    const map = new Map<SlotKey, MealOption[]>()
    for (const opt of options) {
      const k = slotKey(opt.day_label, opt.meal_type)
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(opt)
    }
    return Array.from(map.entries()).map(([k, opts]) => {
      const [day, type] = k.split('||')
      return { key: k, day_label: day, meal_type: type as 'lunch' | 'dinner', options: opts }
    })
  }, [options])

  // All slots = DB slots + pending slots not yet in DB
  const allSlots = useMemo(() => {
    const dbKeys = new Set(dbSlots.map(s => s.key))
    return [
      ...dbSlots,
      ...pendingSlots
        .filter(ps => !dbKeys.has(ps.key))
        .map(ps => ({ key: ps.key, day_label: ps.day_label, meal_type: ps.meal_type, options: [] as MealOption[] })),
    ]
  }, [dbSlots, pendingSlots])

  // Slots sorted by user-defined drag order (new slots appended at end)
  const orderedSlots = useMemo(() => {
    const orderMap = new Map(slotOrder.map((k, i) => [k, i]))
    return [...allSlots].sort((a, b) => {
      const ai = orderMap.has(a.key) ? orderMap.get(a.key)! : slotOrder.length + allSlots.indexOf(a)
      const bi = orderMap.has(b.key) ? orderMap.get(b.key)! : slotOrder.length + allSlots.indexOf(b)
      return ai - bi
    })
  }, [allSlots, slotOrder])

  // Sync slot_sort_order to DB once after initial load so club view matches admin order
  const hasSyncedOrder = useRef(false)
  useEffect(() => {
    if (loading || orderedSlots.length === 0) return
    if (hasSyncedOrder.current) return
    hasSyncedOrder.current = true
    orderedSlots.forEach((slot, i) => {
      const [day, type] = slot.key.split('||')
      void supabase.from('meal_options')
        .update({ slot_sort_order: i })
        .eq('competition_id', competitionId).eq('day_label', day).eq('meal_type', type)
    })
  }, [loading, orderedSlots]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── handlers ─────────────────────────────────────────────────────────────────
  function handleCreateSlot() {
    if (!slotDay.trim()) return
    const key = slotKey(slotDay.trim(), slotType)
    if (!allSlots.some(s => s.key === key)) {
      setPendingSlots(prev => [...prev, { key, day_label: slotDay.trim(), meal_type: slotType }])
    }
    setAddingSlot(false)
    setSlotDay(''); setSlotType('lunch')
  }

  function handleCreateLabel(sk: SlotKey) {
    if (!newLabelName.trim()) return
    const name = newLabelName.trim()
    // Skip if label already exists in DB options or pending
    const slotOpts = options.filter(o => slotKey(o.day_label, o.meal_type) === sk)
    const existingLabels = new Set(slotOpts.map(o => o.course_label).filter(Boolean))
    if (!existingLabels.has(name)) {
      setPendingLabels(prev => ({
        ...prev,
        [sk]: [...(prev[sk] ?? []).filter(l => l !== name), name],
      }))
    }
    setAddingLabelToSlot(null)
    setNewLabelName('')
  }

  async function handleAddItem(sk: SlotKey, labelName: string | null) {
    if (!itemName.trim()) return
    const [day, type] = sk.split('||')
    const nextSort = options.filter(o => o.day_label === day && o.meal_type === type).length
    const slotIdx = orderedSlots.findIndex(s => s.key === sk)
    const { data, error } = await supabase.from('meal_options').insert({
      competition_id: competitionId,
      day_label: day,
      meal_type: type,
      course_label: labelName,
      name: itemName.trim(),
      description: itemDesc.trim() || null,
      price: parseFloat(itemPrice) || 0,
      sort_order: nextSort,
      slot_sort_order: slotIdx >= 0 ? slotIdx : orderedSlots.length,
    }).select().single()
    if (!error && data) {
      setOptions(prev => [...prev, { ...(data as any), price: Number((data as any).price) }])
      // Slot now has options — no longer pending
      setPendingSlots(prev => prev.filter(ps => ps.key !== sk))
      // Label now has items — no longer pending
      if (labelName) {
        setPendingLabels(prev => {
          const labels = (prev[sk] ?? []).filter(l => l !== labelName)
          if (labels.length === 0) { const next = { ...prev }; delete next[sk]; return next }
          return { ...prev, [sk]: labels }
        })
      }
    }
    setAddingItemToLabel(null)
    setItemName(''); setItemDesc(''); setItemPrice('')
  }

  async function handleAddType(parentId: string) {
    if (!typeName.trim()) return
    const parent = options.find(o => o.id === parentId)
    if (!parent) return
    const nextSort = options.filter(o => o.parent_option_id === parentId).length
    const { data, error } = await supabase.from('meal_options').insert({
      competition_id: competitionId,
      day_label: parent.day_label,
      meal_type: parent.meal_type,
      course_label: parent.course_label,
      parent_option_id: parentId,
      name: typeName.trim(),
      price: parseFloat(typePrice) || 0,
      sort_order: nextSort,
    }).select().single()
    if (!error && data) {
      setOptions(prev => [...prev, { ...(data as any), price: Number((data as any).price) }])
    }
    setAddingTypeTo(null)
    setTypeName(''); setTypePrice('')
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return
    const { data, error } = await supabase.from('meal_options').update({
      name: editName.trim(),
      description: editDesc.trim() || null,
      price: parseFloat(editPrice) || 0,
    }).eq('id', id).select().single()
    if (!error && data) {
      setOptions(prev => prev.map(o => o.id === id ? { ...(data as any), price: Number((data as any).price) } : o))
    }
    setEditingOption(null)
  }

  async function handleCopySlot(sk: SlotKey) {
    if (!copyDay.trim()) return
    setCopying(true)
    try {
      const srcOpts = options.filter(o => slotKey(o.day_label, o.meal_type) === sk)
      const parents = srcOpts.filter(o => !o.parent_option_id)
      const children = srcOpts.filter(o => !!o.parent_option_id)
      const idMap: Record<string, string> = {}
      const newOpts: MealOption[] = []

      const newSlotSortOrder = orderedSlots.length
      for (const p of parents) {
        const { data } = await supabase.from('meal_options').insert({
          competition_id: competitionId, day_label: copyDay.trim(), meal_type: copyType,
          course_label: p.course_label, name: p.name, description: p.description,
          price: p.price, sort_order: p.sort_order, slot_sort_order: newSlotSortOrder,
        }).select().single()
        if (data) {
          const o = { ...(data as any), price: Number((data as any).price) } as MealOption
          idMap[p.id] = o.id
          newOpts.push(o)
        }
      }
      for (const c of children) {
        const newParentId = c.parent_option_id ? idMap[c.parent_option_id] : null
        if (c.parent_option_id && !newParentId) continue
        const { data } = await supabase.from('meal_options').insert({
          competition_id: competitionId, day_label: copyDay.trim(), meal_type: copyType,
          course_label: c.course_label, parent_option_id: newParentId,
          name: c.name, description: c.description, price: c.price, sort_order: c.sort_order, slot_sort_order: newSlotSortOrder,
        }).select().single()
        if (data) newOpts.push({ ...(data as any), price: Number((data as any).price) } as MealOption)
      }

      setOptions(prev => [...prev, ...newOpts])
      setCopyingSlot(null); setCopyDay(''); setCopyType('lunch')
    } finally {
      setCopying(false)
    }
  }

  async function handleDeleteOption(id: string) {
    // Cascade in DB handles children, but also clean local state
    await supabase.from('meal_options').delete().eq('id', id)
    setOptions(prev => prev.filter(o => o.id !== id && o.parent_option_id !== id))
  }

  async function handleDeleteLabel(sk: SlotKey, labelName: string) {
    const toDelete = options.filter(o =>
      o.course_label === labelName && slotKey(o.day_label, o.meal_type) === sk
    )
    await Promise.all(toDelete.map(o => supabase.from('meal_options').delete().eq('id', o.id)))
    setOptions(prev => prev.filter(o =>
      !(o.course_label === labelName && slotKey(o.day_label, o.meal_type) === sk)
    ))
    // Also remove from pending
    setPendingLabels(prev => {
      const labels = (prev[sk] ?? []).filter(l => l !== labelName)
      if (labels.length === 0) { const next = { ...prev }; delete next[sk]; return next }
      return { ...prev, [sk]: labels }
    })
  }

  async function handleEditSlot(sk: SlotKey) {
    if (!editSlotDay.trim()) return
    const newSk = slotKey(editSlotDay.trim(), editSlotType)
    if (newSk !== sk) {
      const [oldDay, oldType] = sk.split('||')
      const toUpdate = options.filter(o => o.day_label === oldDay && o.meal_type === oldType)
      if (toUpdate.length > 0) {
        await Promise.all(toUpdate.map(o =>
          supabase.from('meal_options').update({ day_label: editSlotDay.trim(), meal_type: editSlotType }).eq('id', o.id)
        ))
        setOptions(prev => prev.map(o =>
          o.day_label === oldDay && o.meal_type === oldType
            ? { ...o, day_label: editSlotDay.trim(), meal_type: editSlotType }
            : o
        ))
      }
      setPendingSlots(prev => prev.map(ps => ps.key === sk
        ? { key: newSk, day_label: editSlotDay.trim(), meal_type: editSlotType }
        : ps
      ))
      if (pendingLabels[sk]) {
        setPendingLabels(prev => { const next = { ...prev, [newSk]: prev[sk] }; delete next[sk]; return next })
      }
      setSlotOrder(prev => {
        const next = prev.includes(sk) ? prev.map(k => k === sk ? newSk : k) : prev
        try { localStorage.setItem(`meal_slot_order_${competitionId}`, JSON.stringify(next)) } catch {}
        return next
      })
    }
    setEditingSlot(null)
  }

  async function handleDeleteSlot(sk: SlotKey) {
    const [day, type] = sk.split('||')
    const toDelete = options.filter(o => o.day_label === day && o.meal_type === type)
    if (toDelete.length > 0) {
      await Promise.all(toDelete.map(o => supabase.from('meal_options').delete().eq('id', o.id)))
      setOptions(prev => prev.filter(o => !(o.day_label === day && o.meal_type === type)))
    }
    setPendingSlots(prev => prev.filter(ps => ps.key !== sk))
    setPendingLabels(prev => { const next = { ...prev }; delete next[sk]; return next })
    setSlotOrder(prev => {
      const next = prev.filter(k => k !== sk)
      try { localStorage.setItem(`meal_slot_order_${competitionId}`, JSON.stringify(next)) } catch {}
      return next
    })
  }

  async function handleApprove(subId: string) {
    await supabase.from('meal_submissions').update({
      status: 'approved', reviewed_at: new Date().toISOString(), admin_notes: null,
    }).eq('id', subId)
    setSubmissions(prev => prev.map(s => s.id === subId
      ? { ...s, status: 'approved' as const, reviewed_at: new Date().toISOString(), admin_notes: null }
      : s))
  }

  async function handleReject(subId: string) {
    await supabase.from('meal_submissions').update({
      status: 'rejected', reviewed_at: new Date().toISOString(), admin_notes: rejectNotes.trim() || null,
    }).eq('id', subId)
    setSubmissions(prev => prev.map(s => s.id === subId
      ? { ...s, status: 'rejected' as const, reviewed_at: new Date().toISOString(), admin_notes: rejectNotes.trim() || null }
      : s))
    setRejectTarget(null); setRejectNotes('')
  }

  // ── locale ────────────────────────────────────────────────────────────────────
  const T = {
    es: {
      enable: 'Visible para los clubes',
      enableHint: 'Cuando está activo, los clubes pueden ver las opciones y enviar su selección. Puedes configurar las opciones antes de activarlo.',
      optionsTitle: 'Opciones de comida',
      optionsHint: 'Crea franjas (día + tipo), añade categorías dentro de cada franja y luego los artículos de cada categoría.',
      addSlot: '+ Añadir franja',
      dayLabelPlaceholder: 'Ej: Sábado 14 jun',
      lunch: 'Comida',
      dinner: 'Cena',
      createSlot: 'Crear franja',
      addLabel: '+ Añadir categoría',
      labelPlaceholder: 'Ej: Primer plato, Postre, Bebida…',
      createLabel: 'Crear',
      addItem: '+ Añadir artículo',
      itemNamePlaceholder: 'Ej: Pasta con tomate',
      descPlaceholder: 'Descripción (opcional)',
      price: 'Precio (€)',
      saveItem: 'Guardar',
      cancel: 'Cancelar',
      deleteLabel: 'Eliminar categoría',
      deleteItem: 'Eliminar',
      editItem: 'Editar',
      addType: '+ Añadir tipo',
      typeNamePlaceholder: 'Ej: Manzana, Naranja…',
      saveType: 'Guardar',
      copySlot: 'Copiar franja',
      copyDayPlaceholder: 'Nuevo día (ej: Domingo 15 jun)',
      copyConfirm: 'Copiar',
      copyingLabel: 'Copiando…',
      editSlot: 'Editar franja',
      deleteSlot: 'Eliminar franja',
      noSlots: 'Sin franjas configuradas. Añade una para empezar.',
      noItems: 'Sin artículos todavía.',
      submissionsTitle: 'Solicitudes de comidas por club',
      approve: 'Aprobar',
      reject: 'Rechazar',
      rejectTitle: 'Motivo del rechazo (opcional)',
      confirm: 'Confirmar rechazo',
      statusDraft: 'Borrador',
      statusSubmitted: 'Enviado',
      statusApproved: 'Aprobado',
      statusRejected: 'Rechazado',
      viewProof: 'Ver comprobante',
      noProof: 'Sin comprobante',
      noSubmissions: 'Ningún club ha enviado solicitudes todavía.',
      eachLabel: (n: number) => `${n.toFixed(2)} €/ud`,
    },
    en: {
      enable: 'Visible to clubs',
      enableHint: 'When active, clubs can see the options and submit their selection. You can configure options before activating.',
      optionsTitle: 'Meal options',
      optionsHint: 'Create slots (day + type), add categories within each slot, then the items for each category.',
      addSlot: '+ Add slot',
      dayLabelPlaceholder: 'E.g. Saturday 14 Jun',
      lunch: 'Lunch',
      dinner: 'Dinner',
      createSlot: 'Create slot',
      addLabel: '+ Add category',
      labelPlaceholder: 'E.g. Starter, Dessert, Drinks…',
      createLabel: 'Create',
      addItem: '+ Add item',
      itemNamePlaceholder: 'E.g. Pasta with tomato sauce',
      descPlaceholder: 'Description (optional)',
      price: 'Price (€)',
      saveItem: 'Save',
      cancel: 'Cancel',
      deleteLabel: 'Delete category',
      deleteItem: 'Delete',
      editItem: 'Edit',
      addType: '+ Add type',
      typeNamePlaceholder: 'E.g. Apple, Orange…',
      saveType: 'Save',
      copySlot: 'Copy slot',
      copyDayPlaceholder: 'New day (e.g. Sunday 15 Jun)',
      copyConfirm: 'Copy',
      copyingLabel: 'Copying…',
      editSlot: 'Edit slot',
      deleteSlot: 'Delete slot',
      noSlots: 'No slots configured. Add one to get started.',
      noItems: 'No items yet.',
      submissionsTitle: 'Club meal requests',
      approve: 'Approve',
      reject: 'Reject',
      rejectTitle: 'Rejection reason (optional)',
      confirm: 'Confirm rejection',
      statusDraft: 'Draft',
      statusSubmitted: 'Submitted',
      statusApproved: 'Approved',
      statusRejected: 'Rejected',
      viewProof: 'View proof',
      noProof: 'No proof',
      noSubmissions: 'No clubs have submitted requests yet.',
      eachLabel: (n: number) => `€${n.toFixed(2)}/ea`,
    },
  }
  const t = T[lang]

  const statusBadge: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-500',
    submitted: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
  }
  const statusLabelMap: Record<string, string> = {
    draft: t.statusDraft, submitted: t.statusSubmitted,
    approved: t.statusApproved, rejected: t.statusRejected,
  }

  const inputCls = 'border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500'

  if (loading) return <div className="text-sm text-slate-500 py-8 text-center">Cargando…</div>

  return (
    <div className="space-y-6">

      {/* Enable / disable toggle */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">{t.enable}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t.enableHint}</p>
          </div>
          <button
            disabled={toggling}
            onClick={async () => { setToggling(true); await onToggleEnabled(!mealsEnabled); setToggling(false) }}
            className={['relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none',
              mealsEnabled ? 'bg-blue-600' : 'bg-slate-200'].join(' ')}>
            <span className={['pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform',
              mealsEnabled ? 'translate-x-5' : 'translate-x-0'].join(' ')} />
          </button>
        </div>
      </div>

      {/* Options management — always visible to admin */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-800">{t.optionsTitle}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t.optionsHint}</p>
        </div>
        <div className="p-4 space-y-4">

          {orderedSlots.length === 0 && !addingSlot && (
            <p className="text-sm text-slate-400">{t.noSlots}</p>
          )}

          {/* ── Slots ── */}
          {orderedSlots.map(slot => {
            // Build label groups: DB labels + pending labels
            const courseMap = new Map<string | null, MealOption[]>()
            for (const opt of slot.options) {
              const k = opt.course_label ?? null
              if (!courseMap.has(k)) courseMap.set(k, [])
              courseMap.get(k)!.push(opt)
            }
            const dbLabelGroups: { label: string | null; opts: MealOption[] }[] = []
            if (courseMap.has(null)) dbLabelGroups.push({ label: null, opts: courseMap.get(null)! })
            for (const [lbl, opts] of courseMap.entries()) {
              if (lbl !== null) dbLabelGroups.push({ label: lbl, opts })
            }
            // Merge pending labels (empty, UI-only)
            const pendingForSlot = (pendingLabels[slot.key] ?? []).filter(
              l => !dbLabelGroups.some(g => g.label === l)
            )
            const allLabelGroups = [
              ...dbLabelGroups,
              ...pendingForSlot.map(l => ({ label: l, opts: [] as MealOption[] })),
            ]

            return (
              <div
                key={slot.key}
                draggable
                onDragStart={() => setDraggedSlot(slot.key)}
                onDragOver={e => { e.preventDefault(); if (dragOverSlot !== slot.key) setDragOverSlot(slot.key) }}
                onDrop={() => {
                  if (!draggedSlot || draggedSlot === slot.key) return
                  const allKeys = orderedSlots.map(s => s.key)
                  const complete = [...new Set([...slotOrder, ...allKeys])]
                  const from = complete.indexOf(draggedSlot)
                  const to = complete.indexOf(slot.key)
                  if (from === -1 || to === -1) return
                  const next = [...complete]
                  next.splice(from, 1)
                  next.splice(to, 0, draggedSlot)
                  setSlotOrder(next)
                  try { localStorage.setItem(`meal_slot_order_${competitionId}`, JSON.stringify(next)) } catch {}
                  // Persist order to DB so club view stays in sync
                  next.forEach((sk, i) => {
                    const [day, type] = sk.split('||')
                    void supabase.from('meal_options')
                      .update({ slot_sort_order: i })
                      .eq('competition_id', competitionId).eq('day_label', day).eq('meal_type', type)
                  })
                  setDraggedSlot(null); setDragOverSlot(null)
                }}
                onDragEnd={() => { setDraggedSlot(null); setDragOverSlot(null) }}
                className={[
                  'rounded-xl overflow-hidden border transition-all',
                  draggedSlot === slot.key ? 'opacity-40 border-slate-200' : '',
                  dragOverSlot === slot.key && draggedSlot !== slot.key ? 'border-blue-400 shadow-sm' : 'border-slate-200',
                ].join(' ')}
              >
                {/* Slot header */}
                {editingSlot === slot.key ? (
                  <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-2">
                    <input
                      value={editSlotDay}
                      onChange={e => setEditSlotDay(e.target.value)}
                      className={`flex-1 min-w-40 ${inputCls}`}
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleEditSlot(slot.key) }}
                    />
                    <select value={editSlotType} onChange={e => setEditSlotType(e.target.value as 'lunch' | 'dinner')} className={inputCls}>
                      <option value="lunch">{t.lunch}</option>
                      <option value="dinner">{t.dinner}</option>
                    </select>
                    <button onClick={() => handleEditSlot(slot.key)} disabled={!editSlotDay.trim()}
                      className="px-3 py-1.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 transition-all">
                      {t.saveItem}
                    </button>
                    <button onClick={() => setEditingSlot(null)}
                      className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">
                      {t.cancel}
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                    <span className="text-slate-300 cursor-grab active:cursor-grabbing shrink-0" title="Arrastrar">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/>
                        <circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
                      </svg>
                    </span>
                    <p className="flex-1 text-sm font-semibold text-slate-700">
                      {slotLabel(slot.day_label, slot.meal_type, lang)}
                    </p>
                    <button onClick={() => { setEditingSlot(slot.key); setEditSlotDay(slot.day_label); setEditSlotType(slot.meal_type) }} title={t.editSlot}
                      className="text-slate-300 hover:text-blue-500 transition-colors shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => { setCopyingSlot(slot.key); setCopyDay(''); setCopyType('lunch') }} title={t.copySlot}
                      className="text-slate-300 hover:text-blue-500 transition-colors shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDeleteSlot(slot.key)} title={t.deleteSlot}
                      className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Copy slot form */}
                {copyingSlot === slot.key && (
                  <div className="px-3 py-2.5 bg-blue-50/50 border-b border-slate-100 flex flex-wrap items-center gap-2">
                    <input
                      value={copyDay}
                      onChange={e => setCopyDay(e.target.value)}
                      placeholder={t.copyDayPlaceholder}
                      className={`flex-1 min-w-40 ${inputCls}`}
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleCopySlot(slot.key) }}
                    />
                    <select value={copyType} onChange={e => setCopyType(e.target.value as 'lunch' | 'dinner')} className={inputCls}>
                      <option value="lunch">{t.lunch}</option>
                      <option value="dinner">{t.dinner}</option>
                    </select>
                    <button
                      onClick={() => handleCopySlot(slot.key)}
                      disabled={!copyDay.trim() || copying}
                      className="px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-all">
                      {copying ? t.copyingLabel : t.copyConfirm}
                    </button>
                    <button
                      onClick={() => { setCopyingSlot(null); setCopyDay('') }}
                      className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">
                      {t.cancel}
                    </button>
                  </div>
                )}

                {/* Labels */}
                <div className="flex flex-col md:flex-row md:divide-x divide-y md:divide-y-0 divide-slate-100">
                  {allLabelGroups.map(({ label, opts }) => {
                    const lk = label ? labelKey(slot.key, label) : labelKey(slot.key, '__none__')
                    return (
                      <div key={label ?? '__none__'} className="flex-1 min-w-0 px-3 py-2.5">
                        {/* Label heading */}
                        <div className="flex items-center justify-between mb-2">
                          {label ? (
                            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{label}</p>
                          ) : (
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">—</p>
                          )}
                          <div className="flex items-center gap-2">
                            {label && (
                              <button
                                onClick={() => handleDeleteLabel(slot.key, label)}
                                title={t.deleteLabel}
                                className="text-xs text-slate-300 hover:text-red-500 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Items (top-level only — children rendered under their parent) */}
                        {opts.filter(o => !o.parent_option_id).length > 0 && (
                          <div className="space-y-2 mb-2">
                            {opts.filter(o => !o.parent_option_id).map(opt => {
                              const types = options.filter(o => o.parent_option_id === opt.id)
                              return (
                                <div key={opt.id} className="rounded-lg border border-slate-100 bg-slate-50 overflow-hidden">
                                  {/* Item row */}
                                  {editingOption === opt.id ? (
                                    <div className="flex items-start gap-2 p-2">
                                      <div className="flex-1 flex flex-col gap-1 min-w-0">
                                        <input value={editName} onChange={e => setEditName(e.target.value)} className={`${inputCls} text-xs py-1`} autoFocus onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(opt.id) }} />
                                        <input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder={t.descPlaceholder} className={`${inputCls} text-xs py-1`} />
                                      </div>
                                      <input value={editPrice} onChange={e => setEditPrice(e.target.value)} type="number" min="0" step="0.01" placeholder={t.price} className={`w-20 ${inputCls} text-xs py-1 shrink-0`} />
                                      <div className="flex gap-1 shrink-0">
                                        <button onClick={() => handleSaveEdit(opt.id)} disabled={!editName.trim()} className="px-2 py-1 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 transition-all">{t.saveItem}</button>
                                        <button onClick={() => setEditingOption(null)} className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">{t.cancel}</button>
                                      </div>
                                    </div>
                                  ) : (
                                  <div className="flex items-center gap-2 py-1.5 pl-2 pr-1">
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm text-slate-800 font-medium">{opt.name}</span>
                                      {opt.description && (
                                        <span className="text-xs text-slate-400 ml-1.5">{opt.description}</span>
                                      )}
                                    </div>
                                    {types.length === 0 && (
                                      <span className="text-xs font-semibold text-slate-600 tabular-nums shrink-0">{opt.price.toFixed(2)} €</span>
                                    )}
                                    <button onClick={() => { setEditingOption(opt.id); setEditName(opt.name); setEditDesc(opt.description ?? ''); setEditPrice(opt.price.toFixed(2)) }} title={t.editItem}
                                      className="text-slate-300 hover:text-blue-500 transition-colors shrink-0">
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button onClick={() => handleDeleteOption(opt.id)} title={t.deleteItem}
                                      className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                  )}

                                  {/* Type rows */}
                                  {types.map(tp => (
                                    editingOption === tp.id ? (
                                      <div key={tp.id} className="flex items-center gap-2 p-2 border-t border-slate-100 bg-white">
                                        <input value={editName} onChange={e => setEditName(e.target.value)} className={`flex-1 ${inputCls} text-xs py-1`} autoFocus onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(tp.id) }} />
                                        <input value={editPrice} onChange={e => setEditPrice(e.target.value)} type="number" min="0" step="0.01" placeholder={t.price} className={`w-20 ${inputCls} text-xs py-1`} />
                                        <button onClick={() => handleSaveEdit(tp.id)} disabled={!editName.trim()} className="px-2 py-1 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 transition-all">{t.saveType}</button>
                                        <button onClick={() => setEditingOption(null)} className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">{t.cancel}</button>
                                      </div>
                                    ) : (
                                    <div key={tp.id} className="flex items-center gap-2 py-1 pl-5 pr-1 border-t border-slate-100 bg-white">
                                      <span className="text-xs text-slate-400 mr-0.5">↳</span>
                                      <span className="flex-1 text-sm text-slate-700">{tp.name}</span>
                                      <span className="text-xs font-semibold text-slate-600 tabular-nums shrink-0">{tp.price.toFixed(2)} €</span>
                                      <button onClick={() => { setEditingOption(tp.id); setEditName(tp.name); setEditDesc(''); setEditPrice(tp.price.toFixed(2)) }} title={t.editItem}
                                        className="text-slate-300 hover:text-blue-500 transition-colors shrink-0">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button onClick={() => handleDeleteOption(tp.id)} title={t.deleteItem}
                                        className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                    )
                                  ))}

                                  {/* Add type */}
                                  {addingTypeTo === opt.id ? (
                                    <div className="flex gap-2 p-2 border-t border-slate-100 bg-white">
                                      <input value={typeName} onChange={e => setTypeName(e.target.value)} placeholder={t.typeNamePlaceholder}
                                        className={`flex-1 ${inputCls} text-xs py-1`} autoFocus
                                        onKeyDown={e => { if (e.key === 'Enter') handleAddType(opt.id) }} />
                                      <input value={typePrice} onChange={e => setTypePrice(e.target.value)} placeholder={t.price}
                                        type="number" min="0" step="0.01" className={`w-20 ${inputCls} text-xs py-1`} />
                                      <button onClick={() => handleAddType(opt.id)} disabled={!typeName.trim()}
                                        className="px-2 py-1 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 transition-all">
                                        {t.saveType}
                                      </button>
                                      <button onClick={() => { setAddingTypeTo(null); setTypeName(''); setTypePrice('') }}
                                        className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">
                                        {t.cancel}
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="px-2 py-1 border-t border-slate-100">
                                      <button onClick={() => { setAddingTypeTo(opt.id); setTypeName(''); setTypePrice('') }}
                                        className="text-xs text-blue-500 hover:text-blue-700 transition-colors">
                                        {t.addType}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Add item form or button */}
                        {addingItemToLabel === lk ? (
                          <div className="space-y-2 mt-2 pl-2">
                            <input value={itemName} onChange={e => setItemName(e.target.value)} placeholder={t.itemNamePlaceholder} className={`w-full ${inputCls}`} autoFocus />
                            <input value={itemDesc} onChange={e => setItemDesc(e.target.value)} placeholder={t.descPlaceholder} className={`w-full ${inputCls}`} />
                            <div className="flex gap-2">
                              <input value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder={t.price} type="number" min="0" step="0.01" className={`w-28 ${inputCls}`} />
                              <button
                                onClick={() => handleAddItem(slot.key, label)}
                                disabled={!itemName.trim()}
                                className="px-3 py-1.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 transition-all">
                                {t.saveItem}
                              </button>
                              <button
                                onClick={() => { setAddingItemToLabel(null); setItemName(''); setItemDesc(''); setItemPrice('') }}
                                className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">
                                {t.cancel}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setAddingItemToLabel(lk); setItemName(''); setItemDesc(''); setItemPrice('') }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors pl-2">
                            {t.addItem}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Add label */}
                <div className="px-3 py-2.5 border-t border-slate-100 bg-slate-50/60">
                  {addingLabelToSlot === slot.key ? (
                    <div className="flex gap-2">
                      <input
                        value={newLabelName}
                        onChange={e => setNewLabelName(e.target.value)}
                        placeholder={t.labelPlaceholder}
                        className={`flex-1 ${inputCls}`}
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleCreateLabel(slot.key) }}
                      />
                      <button onClick={() => handleCreateLabel(slot.key)} disabled={!newLabelName.trim()}
                        className="px-3 py-1.5 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-all">
                        {t.createLabel}
                      </button>
                      <button onClick={() => { setAddingLabelToSlot(null); setNewLabelName('') }}
                        className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">
                        {t.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingLabelToSlot(slot.key); setNewLabelName('') }}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                      {t.addLabel}
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Add slot form */}
          {addingSlot ? (
            <div className="border border-blue-200 rounded-xl p-3 bg-blue-50/30 space-y-2">
              <div className="flex gap-2">
                <input
                  value={slotDay}
                  onChange={e => setSlotDay(e.target.value)}
                  placeholder={t.dayLabelPlaceholder}
                  className={`flex-1 ${inputCls}`}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateSlot() }}
                />
                <select value={slotType} onChange={e => setSlotType(e.target.value as 'lunch' | 'dinner')} className={inputCls}>
                  <option value="lunch">{t.lunch}</option>
                  <option value="dinner">{t.dinner}</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateSlot} disabled={!slotDay.trim()}
                  className="px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-all">
                  {t.createSlot}
                </button>
                <button onClick={() => { setAddingSlot(false); setSlotDay(''); setSlotType('lunch') }}
                  className="px-3 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">
                  {t.cancel}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingSlot(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
              {t.addSlot}
            </button>
          )}
        </div>
      </div>

      {/* Submissions — only shown when meals are active */}
      {mealsEnabled && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-sm font-semibold text-slate-800">{t.submissionsTitle}</p>
          </div>
          {submissions.length === 0 ? (
            <p className="text-sm text-slate-400 px-4 py-6">{t.noSubmissions}</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {submissions.map(sub => (
                <div key={sub.id} className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800">{sub.club_name}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge[sub.status] ?? ''}`}>
                        {statusLabelMap[sub.status] ?? sub.status}
                      </span>
                      {sub.total_amount != null && (
                        <span className="text-sm font-bold text-slate-700 tabular-nums">{sub.total_amount.toFixed(2)} €</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {sub.payment_proof_url ? (
                        <a href={sub.payment_proof_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline font-medium">{t.viewProof}</a>
                      ) : (
                        <span className="text-xs text-slate-300">{t.noProof}</span>
                      )}
                      {sub.status === 'submitted' && (
                        <>
                          <button onClick={() => handleApprove(sub.id)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-all">
                            {t.approve}
                          </button>
                          <button onClick={() => { setRejectTarget(sub.id); setRejectNotes('') }}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold transition-all">
                            {t.reject}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {sub.items.length > 0 && (
                    <div className="pl-1 space-y-0.5">
                      {sub.items.map(item => (
                        <p key={item.option.id} className="text-xs text-slate-500">
                          {item.quantity}× {item.option.name}
                          {item.option.course_label && <span className="text-slate-400 ml-1">({item.option.course_label})</span>}
                          <span className="text-slate-400 ml-1">{t.eachLabel(item.option.price)}</span>
                        </p>
                      ))}
                    </div>
                  )}
                  {sub.admin_notes && (
                    <p className="text-xs text-red-500 italic">{sub.admin_notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <p className="text-sm font-semibold text-slate-800">{t.rejectTitle}</p>
            <textarea
              value={rejectNotes}
              onChange={e => setRejectNotes(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => handleReject(rejectTarget)}
                className="flex-1 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
                {t.confirm}
              </button>
              <button onClick={() => setRejectTarget(null)}
                className="flex-1 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
