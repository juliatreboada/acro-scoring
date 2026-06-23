'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { MealCategory, MealOption, MealSubmission } from '@/components/admin/types'

type SubmissionRow = MealSubmission & { club_name: string; items: { option: MealOption; quantity: number }[] }

type Props = {
  lang: Lang
  competitionId: string
  competitionName: string
  competitionLogoUrl: string | null
  mealsEnabled: boolean
  mealsLocked: boolean
  onToggleEnabled: (enabled: boolean) => Promise<void>
  onToggleLocked: (locked: boolean) => Promise<void>
}

type SlotKey = string // `${day_label}||${meal_type}`
type LabelKey = string // `${SlotKey}::${labelName}`

function slotKey(day: string, type: string): SlotKey { return `${day}||${type}` }
function labelKey(sk: SlotKey, label: string): LabelKey { return `${sk}::${label}` }
function slotLabel(day: string, type: 'lunch' | 'dinner', lang: Lang) {
  const d = new Date(day + 'T00:00:00')
  const typeLabel = type === 'lunch' ? (lang === 'es' ? 'Comida' : 'Lunch') : (lang === 'es' ? 'Cena' : 'Dinner')
  if (isNaN(d.getTime())) return `${day} — ${typeLabel}`
  const locale = lang === 'es' ? 'es-ES' : 'en-GB'
  const dateStr = d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
  return `${dateStr} — ${typeLabel}`
}

export default function MealsTab({ lang, competitionId, competitionName, competitionLogoUrl, mealsEnabled, mealsLocked, onToggleEnabled, onToggleLocked }: Props) {
  const supabase = createClient()
  const [options, setOptions] = useState<MealOption[]>([])
  const [mealCategories, setMealCategories] = useState<MealCategory[]>([])
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [togglingLocked, setTogglingLocked] = useState(false)

  // ── add-slot form ────────────────────────────────────────────────────────────
  const [addingSlot, setAddingSlot] = useState(false)
  const [slotDay, setSlotDay] = useState('')
  const [slotType, setSlotType] = useState<'lunch' | 'dinner'>('lunch')

  // ── pending slots (created in UI but have 0 options yet) ─────────────────────
  const [pendingSlots, setPendingSlots] = useState<{ key: SlotKey; day_label: string; meal_type: 'lunch' | 'dinner' }[]>([])

  // ── add-item form ────────────────────────────────────────────────────────────
  const [addingItemToLabel, setAddingItemToLabel] = useState<LabelKey | null>(null)
  const [itemName, setItemName] = useState('')
  const [itemDesc, setItemDesc] = useState('')
  const [itemPrice, setItemPrice] = useState('')

  // ── add-type form (child of an item) ─────────────────────────────────────────
  const [addingTypeTo, setAddingTypeTo] = useState<string | null>(null)
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

  // ── collapsed slots ───────────────────────────────────────────────────────────
  const [collapsedSlots, setCollapsedSlots] = useState<Set<SlotKey>>(new Set())
  function toggleCollapse(key: SlotKey) {
    setCollapsedSlots(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  // ── slot edit / delete ────────────────────────────────────────────────────────
  const [editingSlot, setEditingSlot] = useState<SlotKey | null>(null)
  const [editSlotDay, setEditSlotDay] = useState('')
  const [editSlotType, setEditSlotType] = useState<'lunch' | 'dinner'>('lunch')

  // ── reject modal ─────────────────────────────────────────────────────────────
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')

  // ── data loading ─────────────────────────────────────────────────────────────
  async function load() {
    setLoading(true)
    const [optRes, subRes, ordRes, clubRes, catRes] = await Promise.all([
      supabase.from('meal_options').select('*').eq('competition_id', competitionId).order('day_label').order('meal_type').order('sort_order'),
      supabase.from('meal_submissions').select('*').eq('competition_id', competitionId),
      supabase.from('meal_orders').select('*').eq('competition_id', competitionId),
      supabase.from('clubs').select('id,club_name'),
      supabase.from('meal_categories').select('*').order('sort_order'),
    ])

    const opts = ((optRes.data ?? []) as unknown as MealOption[]).map(o => ({ ...o, price: Number(o.price) }))
    setOptions(opts)
    setMealCategories((catRes.data ?? []) as unknown as MealCategory[])

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

  // Sort by date asc, then lunch before dinner
  const orderedSlots = useMemo(() => {
    return [...allSlots].sort((a, b) => {
      const dayCompare = a.day_label.localeCompare(b.day_label)
      if (dayCompare !== 0) return dayCompare
      const typeOrder = { lunch: 0, dinner: 1 }
      return (typeOrder[a.meal_type] ?? 0) - (typeOrder[b.meal_type] ?? 0)
    })
  }, [allSlots])

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

  async function handleAddItem(sk: SlotKey, labelName: string | null) {
    if (!itemName.trim()) return
    const [day, type] = sk.split('||')
    const slotOpts = options.filter(o => o.day_label === day && o.meal_type === type)
    const nextSort = slotOpts.length
    const { data, error } = await supabase.from('meal_options').insert({
      competition_id: competitionId,
      day_label: day,
      meal_type: type,
      course_label: labelName,
      name: itemName.trim(),
      description: itemDesc.trim() || null,
      price: parseFloat(itemPrice) || 0,
      sort_order: nextSort,
    }).select().single()
    if (!error && data) {
      setOptions(prev => [...prev, { ...(data as any), price: Number((data as any).price) }])
      setPendingSlots(prev => prev.filter(ps => ps.key !== sk))
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

      for (const p of parents) {
        const { data } = await supabase.from('meal_options').insert({
          competition_id: competitionId, day_label: copyDay.trim(), meal_type: copyType,
          course_label: p.course_label, name: p.name, description: p.description,
          price: p.price, sort_order: p.sort_order,
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
          name: c.name, description: c.description, price: c.price, sort_order: c.sort_order,
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
    await supabase.from('meal_options').delete().eq('id', id)
    setOptions(prev => prev.filter(o => o.id !== id && o.parent_option_id !== id))
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

  // ── print ─────────────────────────────────────────────────────────────────────
  async function handlePrintByClub() {
    const printable = submissions.filter(s => s.items.length > 0 && (s.status === 'submitted' || s.status === 'approved'))
    if (printable.length === 0) return

    // Fetch images as base64 so they work in the isolated print window
    async function toDataUrl(url: string): Promise<string> {
      try {
        const res = await fetch(url)
        if (!res.ok) return ''
        const blob = await res.blob()
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch { return '' }
    }

    const compLogoData = competitionLogoUrl ? await toDataUrl(competitionLogoUrl) : ''

    const locale = lang === 'es' ? 'es-ES' : 'en-GB'
    const totalLabel = lang === 'es' ? 'Total' : 'Total'
    const compLogoTag = compLogoData
      ? `<img class="comp-logo" src="${compLogoData}">`
      : ''

    function fmtSlot(day: string, type: 'lunch' | 'dinner') {
      const d = new Date(day + 'T00:00:00')
      const typeLabel = type === 'lunch' ? (lang === 'es' ? 'Comida' : 'Lunch') : (lang === 'es' ? 'Cena' : 'Dinner')
      if (isNaN(d.getTime())) return `${day} — ${typeLabel}`
      const dateStr = d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
      return `${dateStr} — ${typeLabel}`
    }

    const pages = printable.map(sub => {
      const grouped = new Map<string, { day: string; type: 'lunch' | 'dinner'; items: typeof sub.items }>()
      for (const item of sub.items) {
        const k = slotKey(item.option.day_label, item.option.meal_type)
        if (!grouped.has(k)) grouped.set(k, { day: item.option.day_label, type: item.option.meal_type as 'lunch' | 'dinner', items: [] })
        grouped.get(k)!.items.push(item)
      }
      const slots = Array.from(grouped.values()).sort((a, b) => {
        const dc = a.day.localeCompare(b.day)
        return dc !== 0 ? dc : (a.type === 'lunch' ? -1 : 1)
      })

      const slotsHtml = slots.map(slot => {
        const activeCats = mealCategories.filter(cat =>
          slot.items.some(i => i.option.course_label === cat.name)
        )
        const uncategorized = slot.items.filter(i => i.option.course_label === null)

        function catColHtml(cat: typeof mealCategories[0], extraClass = '') {
          const catItems = slot.items.filter(i => i.option.course_label === cat.name)
          const itemsHtml = catItems.map(item =>
            `<p class="item"><span class="qty">${item.quantity}×</span> ${item.option.name}${item.option.description ? `<br><span class="desc">${item.option.description}</span>` : ''}</p>`
          ).join('')
          return `<div class="cat-col${extraClass ? ' ' + extraClass : ''}"><p class="cat-name">${cat.name}</p>${itemsHtml}</div>`
        }

        const secondaryCats = activeCats.slice(1)
        if (uncategorized.length > 0) {
          secondaryCats.push({ id: '__none__', name: '—', sort_order: 999 } as typeof mealCategories[0])
        }

        let catRowHtml: string
        if (activeCats.length === 0 && uncategorized.length > 0) {
          // only uncategorized items — full width
          const itemsHtml = uncategorized.map(item => `<p class="item"><span class="qty">${item.quantity}×</span> ${item.option.name}</p>`).join('')
          catRowHtml = `<div class="cat-col cat-full">${itemsHtml}</div>`
        } else if (activeCats.length === 1 && uncategorized.length === 0) {
          // single category — full width
          catRowHtml = catColHtml(activeCats[0], 'cat-full')
        } else {
          // first category takes left half; rest stack on right half
          const mainHtml = catColHtml(activeCats[0], 'cat-main')
          const secondaryItemsHtml = secondaryCats.map(cat => {
            if (cat.id === '__none__') {
              const itemsHtml = uncategorized.map(item => `<p class="item"><span class="qty">${item.quantity}×</span> ${item.option.name}</p>`).join('')
              return `<div class="cat-col cat-side"><p class="cat-name">—</p>${itemsHtml}</div>`
            }
            return catColHtml(cat, 'cat-side')
          }).join('')
          catRowHtml = `${mainHtml}<div class="cat-secondary">${secondaryItemsHtml}</div>`
        }

        return `<div class="slot">
          <p class="slot-label">${fmtSlot(slot.day, slot.type)}</p>
          <div class="cat-row">${catRowHtml}</div>
        </div>`
      }).join('')

      const totalHtml = sub.total_amount != null
        ? `<span class="club-total">${totalLabel}: ${sub.total_amount.toFixed(2)} €</span>`
        : ''

      return `<div class="page">
        <header class="comp-header">
          ${compLogoTag}
          <span class="comp-name">${competitionName}</span>
        </header>
        <div class="club-header">
          <div class="club-title">
            <h1 class="club-name">${sub.club_name}</h1>
            ${totalHtml}
          </div>
        </div>
        <div class="slots-grid">${slotsHtml}</div>
      </div>`
    }).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>${lang === 'es' ? 'Comidas' : 'Meals'} — ${competitionName}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #111; background: #fff; }

        .page { padding: 0; page-break-after: always; page-break-inside: avoid; }
        .page:last-child { page-break-after: auto; }

        /* competition header */
        .comp-header {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 16px; border-bottom: 2px solid #e2e8f0;
          margin-bottom: 12px; background: #f8fafc;
        }
        .comp-logo { height: 42px; width: auto; object-fit: contain; flex-shrink: 0; }
        .comp-name { font-size: 15px; font-weight: 600; color: #475569; }

        /* club header */
        .club-header {
          display: flex; align-items: center; gap: 14px;
          padding: 8px 16px 12px; border-bottom: 2px solid #cbd5e1; margin-bottom: 14px;
        }
        .club-title { flex: 1; min-width: 0; }
        .club-name { font-size: 26px; font-weight: 700; color: #0f172a; line-height: 1.2; }
        .club-total { font-size: 14px; font-weight: 600; color: #475569; display: block; margin-top: 3px; }

        /* slots stacked vertically, full width */
        .slots-grid { padding: 0 16px; display: flex; flex-direction: column; gap: 12px; }

        .slot {
          break-inside: avoid;
          border: 1px solid #e2e8f0; border-radius: 8px;
          overflow: hidden; background: #fff;
        }
        .slot-label {
          font-size: 15px; font-weight: 700; color: #fff;
          background: #1e40af;
          padding: 7px 12px; letter-spacing: 0.03em;
        }

        /* slot layout: first dish = left 50%, rest stacked on right 50% */
        .cat-row { display: flex; flex-direction: row; min-height: 0; }
        .cat-col { padding: 10px 12px; min-width: 0; }
        .cat-full { flex: 1; }
        .cat-main { width: 50%; flex-shrink: 0; border-right: 2px solid #e2e8f0; }
        .cat-secondary {
          width: 50%; flex-shrink: 0;
          display: flex; flex-direction: column;
        }
        .cat-side { flex: 1; border-bottom: 1px solid #e2e8f0; }
        .cat-side:last-child { border-bottom: none; }
        .cat-name {
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; color: #6d28d9;
          margin-bottom: 6px; padding-bottom: 4px;
          border-bottom: 1px solid #ede9fe;
        }
        .item { font-size: 15px; color: #1e293b; line-height: 1.7; margin-bottom: 1px; }
        .qty { font-weight: 700; }
        .desc { color: #94a3b8; font-size: 12px; }

        @media print {
          @page { size: A4 portrait; margin: 8mm 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head><body>${pages}</body></html>`

    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 400)
  }

  // ── locale ────────────────────────────────────────────────────────────────────
  const T = {
    es: {
      enable: 'Visible para los clubes',
      enableHint: 'Cuando está activo, los clubes pueden ver las opciones y enviar su selección. Puedes configurar las opciones antes de activarlo.',
      lock: 'Periodo de solicitud cerrado',
      lockHint: 'Cuando está cerrado, los clubes pueden consultar su pedido pero no pueden realizar cambios ni enviar nuevas solicitudes.',
      optionsTitle: 'Opciones de comida',
      optionsHint: 'Crea franjas (fecha + tipo) y añade artículos a cada categoría.',
      addSlot: '+ Añadir franja',
      lunch: 'Comida',
      dinner: 'Cena',
      createSlot: 'Crear franja',
      addItem: '+ Añadir artículo',
      itemNamePlaceholder: 'Ej: Pasta con tomate',
      descPlaceholder: 'Descripción (opcional)',
      price: 'Precio (€)',
      saveItem: 'Guardar',
      cancel: 'Cancelar',
      deleteItem: 'Eliminar',
      editItem: 'Editar',
      addType: '+ Añadir tipo',
      typeNamePlaceholder: 'Ej: Manzana, Naranja…',
      saveType: 'Guardar',
      copySlot: 'Copiar franja',
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
      printByClub: 'Imprimir por club',
    },
    en: {
      enable: 'Visible to clubs',
      enableHint: 'When active, clubs can see the options and submit their selection. You can configure options before activating.',
      lock: 'Submission period closed',
      lockHint: 'When closed, clubs can view their order but cannot make changes or submit new requests.',
      optionsTitle: 'Meal options',
      optionsHint: 'Create slots (date + type) and add items to each category.',
      addSlot: '+ Add slot',
      lunch: 'Lunch',
      dinner: 'Dinner',
      createSlot: 'Create slot',
      addItem: '+ Add item',
      itemNamePlaceholder: 'E.g. Pasta with tomato sauce',
      descPlaceholder: 'Description (optional)',
      price: 'Price (€)',
      saveItem: 'Save',
      cancel: 'Cancel',
      deleteItem: 'Delete',
      editItem: 'Edit',
      addType: '+ Add type',
      typeNamePlaceholder: 'E.g. Apple, Orange…',
      saveType: 'Save',
      copySlot: 'Copy slot',
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
      printByClub: 'Print per club',
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
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
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
        {mealsEnabled && (
          <div className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">{t.lock}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t.lockHint}</p>
            </div>
            <button
              disabled={togglingLocked}
              onClick={async () => { setTogglingLocked(true); await onToggleLocked(!mealsLocked); setTogglingLocked(false) }}
              className={['relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none',
                mealsLocked ? 'bg-amber-500' : 'bg-slate-200'].join(' ')}>
              <span className={['pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform',
                mealsLocked ? 'translate-x-5' : 'translate-x-0'].join(' ')} />
            </button>
          </div>
        )}
      </div>

      {/* Options management */}
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
            return (
              <div key={slot.key} className="rounded-xl overflow-hidden border border-slate-200">

                {/* Slot header */}
                {editingSlot === slot.key ? (
                  <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={editSlotDay}
                      onChange={e => setEditSlotDay(e.target.value)}
                      className={`flex-1 min-w-40 ${inputCls}`}
                      autoFocus
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
                    <button onClick={() => toggleCollapse(slot.key)} className="flex-1 flex items-center gap-1.5 text-left min-w-0">
                      <svg className={['w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform', collapsedSlots.has(slot.key) ? '-rotate-90' : ''].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {slotLabel(slot.day_label, slot.meal_type, lang)}
                      </p>
                    </button>
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

                {!collapsedSlots.has(slot.key) && (<>

                {/* Copy slot form */}
                {copyingSlot === slot.key && (
                  <div className="px-3 py-2.5 bg-blue-50/50 border-b border-slate-100 flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={copyDay}
                      onChange={e => setCopyDay(e.target.value)}
                      className={`flex-1 min-w-40 ${inputCls}`}
                      autoFocus
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

                {/* Category columns from meal_categories table */}
                <div className="flex flex-col md:flex-row md:divide-x divide-y md:divide-y-0 divide-slate-100">
                  {mealCategories.map(cat => {
                    const catOpts = slot.options.filter(o => o.course_label === cat.name)
                    const lk = labelKey(slot.key, cat.name)
                    return (
                      <div key={cat.id} className="flex-1 min-w-0 px-3 py-2.5">
                        <div className="flex items-center mb-2">
                          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{cat.name}</p>
                        </div>

                        {catOpts.filter(o => !o.parent_option_id).length > 0 && (
                          <div className="space-y-2 mb-2">
                            {catOpts.filter(o => !o.parent_option_id).map(opt => {
                              const types = options.filter(o => o.parent_option_id === opt.id)
                              return (
                                <div key={opt.id} className="rounded-lg border border-slate-100 bg-slate-50 overflow-hidden">
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
                                onClick={() => handleAddItem(slot.key, cat.name)}
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

                  {/* Fallback column for items with no matching category (backward compat) */}
                  {slot.options.some(o => o.course_label === null && !o.parent_option_id) && (
                    <div key="__none__" className="flex-1 min-w-0 px-3 py-2.5">
                      <div className="flex items-center mb-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">—</p>
                      </div>
                      <div className="space-y-2">
                        {slot.options.filter(o => o.course_label === null && !o.parent_option_id).map(opt => {
                          const types = options.filter(o => o.parent_option_id === opt.id)
                          return (
                            <div key={opt.id} className="rounded-lg border border-slate-100 bg-slate-50 overflow-hidden">
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
                                    {opt.description && <span className="text-xs text-slate-400 ml-1.5">{opt.description}</span>}
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
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
                </>)}
              </div>
            )
          })}

          {/* Add slot form */}
          {addingSlot ? (
            <div className="border border-blue-200 rounded-xl p-3 bg-blue-50/30 space-y-2">
              <div className="flex gap-2">
                <input
                  type="date"
                  value={slotDay}
                  onChange={e => setSlotDay(e.target.value)}
                  className={`flex-1 ${inputCls}`}
                  autoFocus
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
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-800">{t.submissionsTitle}</p>
            {submissions.some(s => s.items.length > 0 && (s.status === 'submitted' || s.status === 'approved')) && (
              <button
                onClick={() => { void handlePrintByClub() }}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                {t.printByClub}
              </button>
            )}
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
                  {sub.items.length > 0 && (() => {
                    const grouped = new Map<string, { day: string; type: 'lunch' | 'dinner'; items: typeof sub.items }>()
                    for (const item of sub.items) {
                      const k = slotKey(item.option.day_label, item.option.meal_type)
                      if (!grouped.has(k)) grouped.set(k, { day: item.option.day_label, type: item.option.meal_type as 'lunch' | 'dinner', items: [] })
                      grouped.get(k)!.items.push(item)
                    }
                    const slots = Array.from(grouped.values()).sort((a, b) => {
                      const dc = a.day.localeCompare(b.day)
                      return dc !== 0 ? dc : (a.type === 'lunch' ? -1 : 1)
                    })
                    return (
                      <div className="pl-1 space-y-2">
                        {slots.map(slot => (
                          <div key={slotKey(slot.day, slot.type)}>
                            <p className="text-xs font-semibold text-slate-500 mb-0.5">
                              {slotLabel(slot.day, slot.type, lang)}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 pl-2">
                              {mealCategories.map(cat => {
                                const catItems = slot.items.filter(i => i.option.course_label === cat.name)
                                if (catItems.length === 0) return null
                                return (
                                  <div key={cat.id}>
                                    <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-0.5">{cat.name}</p>
                                    {catItems.map(item => (
                                      <p key={item.option.id} className="text-xs text-slate-500">
                                        {item.quantity}× {item.option.name}
                                        {item.option.description && <span className="text-slate-400"> ({item.option.description})</span>}
                                      </p>
                                    ))}
                                  </div>
                                )
                              })}
                              {slot.items.filter(i => i.option.course_label === null).map(item => (
                                <p key={item.option.id} className="text-xs text-slate-500 self-end">
                                  {item.quantity}× {item.option.name}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
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
