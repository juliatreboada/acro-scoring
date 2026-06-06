'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { MealCategory, MealOption, MealSubmission } from '@/components/admin/types'

type Props = {
  competitionId: string
  clubId: string
  lang: Lang
  initiallyOpen?: boolean
}

type Slot = {
  day_label: string
  meal_type: 'lunch' | 'dinner'
  key: string
  options: MealOption[]
}

function slotKey(day: string, type: string) { return `${day}||${type}` }

function formatSlotDay(day: string, lang: Lang) {
  const d = new Date(day + 'T00:00:00')
  if (isNaN(d.getTime())) return day
  const locale = lang === 'es' ? 'es-ES' : 'en-GB'
  return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function MealsSection({ competitionId, clubId, lang, initiallyOpen = false }: Props) {
  const supabase = createClient()
  const [open, setOpen] = useState(initiallyOpen)
  const [options, setOptions] = useState<MealOption[]>([])
  const [mealCategories, setMealCategories] = useState<MealCategory[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({}) // meal_option_id → qty
  const [submission, setSubmission] = useState<MealSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploadingProof, setUploadingProof] = useState(false)
  const proofInputRef = useRef<HTMLInputElement>(null)
  const [openSlots, setOpenSlots] = useState<Record<string, boolean>>({})
  const isSlotOpen = (key: string) => openSlots[key] !== false

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [optRes, ordRes, subRes, catRes] = await Promise.all([
        supabase.from('meal_options').select('*').eq('competition_id', competitionId).order('day_label').order('meal_type').order('sort_order'),
        supabase.from('meal_orders').select('*').eq('competition_id', competitionId).eq('club_id', clubId),
        supabase.from('meal_submissions').select('*').eq('competition_id', competitionId).eq('club_id', clubId).maybeSingle(),
        supabase.from('meal_categories').select('*').order('sort_order'),
      ])
      if (cancelled) return
      const opts = ((optRes.data ?? []) as unknown as MealOption[]).map(o => ({ ...o, price: Number(o.price) }))
      setOptions(opts)
      setMealCategories((catRes.data ?? []) as unknown as MealCategory[])
      const qmap: Record<string, number> = {}
      for (const row of (ordRes.data ?? []) as any[]) qmap[row.meal_option_id] = row.quantity
      setQuantities(qmap)
      if (subRes.data) {
        const s = subRes.data as unknown as MealSubmission
        setSubmission({ ...s, total_amount: s.total_amount != null ? Number(s.total_amount) : null })
      }
      setLoading(false)
    }
    void load()
    return () => { cancelled = true }
  }, [competitionId, clubId]) // eslint-disable-line react-hooks/exhaustive-deps

  const slots = useMemo<Slot[]>(() => {
    const map = new Map<string, MealOption[]>()
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

  const total = useMemo(() => {
    const parentIds = new Set(options.filter(o => o.parent_option_id).map(o => o.parent_option_id!))
    return options.reduce((sum, opt) => {
      if (parentIds.has(opt.id)) return sum
      return sum + (quantities[opt.id] ?? 0) * opt.price
    }, 0)
  }, [options, quantities])

  const isLocked = submission?.status === 'submitted' || submission?.status === 'approved'
  const isEditable = !submission || submission.status === 'draft' || submission.status === 'rejected'

  async function handleQuantityChange(optionId: string, qty: number) {
    if (!isEditable) return
    const clamped = Math.max(0, qty)
    setQuantities(prev => ({ ...prev, [optionId]: clamped }))
    setSaving(true)
    if (clamped > 0) {
      await supabase.from('meal_orders').upsert(
        { competition_id: competitionId, club_id: clubId, meal_option_id: optionId, quantity: clamped },
        { onConflict: 'club_id,meal_option_id' }
      )
    } else {
      await supabase.from('meal_orders').delete()
        .eq('club_id', clubId).eq('meal_option_id', optionId)
    }
    setSaving(false)
  }

  async function handleUploadProof(file: File) {
    setUploadingProof(true)
    try {
      const ext = file.name.split('.').pop() ?? 'pdf'
      const path = `${competitionId}/${clubId}/proof.${ext}`
      await supabase.storage.from('meal-payments').upload(path, file, { upsert: true })
      const { data } = supabase.storage.from('meal-payments').getPublicUrl(path)
      const url = data.publicUrl + `?t=${Date.now()}`
      const sub = await ensureSubmission()
      await supabase.from('meal_submissions').update({ payment_proof_url: url }).eq('id', sub.id)
      setSubmission(prev => prev ? { ...prev, payment_proof_url: url } : { ...sub, payment_proof_url: url })
    } finally {
      setUploadingProof(false)
    }
  }

  async function ensureSubmission(): Promise<MealSubmission> {
    if (submission) return submission
    const { data } = await supabase.from('meal_submissions').upsert(
      { competition_id: competitionId, club_id: clubId, status: 'draft', total_amount: total },
      { onConflict: 'competition_id,club_id' }
    ).select().single()
    const s = data as unknown as MealSubmission
    const sub = { ...s, total_amount: s.total_amount != null ? Number(s.total_amount) : null }
    setSubmission(sub)
    return sub
  }

  async function handleSend() {
    if (!isEditable || total === 0) return
    setSending(true)
    try {
      const sub = await ensureSubmission()
      await supabase.from('meal_submissions').update({
        status: 'submitted',
        total_amount: total,
        submitted_at: new Date().toISOString(),
        admin_notes: null,
      }).eq('id', sub.id)
      setSubmission(prev => prev ? { ...prev, status: 'submitted', total_amount: total, submitted_at: new Date().toISOString(), admin_notes: null } : prev)
    } finally {
      setSending(false)
    }
  }

  const T = {
    es: {
      title: 'Comidas',
      lunch: 'Comida',
      dinner: 'Cena',
      each: (p: number) => `${p.toFixed(2)} €/ud`,
      total: 'Total',
      paymentProof: 'Comprobante de transferencia',
      uploadProof: '+ Subir comprobante',
      replaceProof: 'Reemplazar',
      viewProof: 'Ver comprobante',
      persons: 'personas',
      mealSubtotal: 'Subtotal comida',
      send: 'Enviar solicitud',
      sending: 'Enviando…',
      sent: 'Solicitud enviada',
      sentHint: 'El administrador revisará tu solicitud y te notificará el resultado.',
      approved: 'Solicitud aprobada',
      approvedHint: 'Tu pedido de comidas ha sido aprobado.',
      rejected: 'Solicitud rechazada',
      rejectedHint: 'El administrador ha rechazado tu solicitud. Puedes modificarla y reenviarla.',
      noOptions: 'El administrador todavía no ha configurado las opciones de comida.',
      sendDisabled: 'Añade al menos una comida antes de enviar.',
      proofRequired: 'Sube el comprobante de transferencia antes de enviar.',
    },
    en: {
      title: 'Meals',
      lunch: 'Lunch',
      dinner: 'Dinner',
      each: (p: number) => `€${p.toFixed(2)}/ea`,
      total: 'Total',
      paymentProof: 'Transfer proof',
      uploadProof: '+ Upload proof',
      replaceProof: 'Replace',
      viewProof: 'View proof',
      persons: 'persons',
      mealSubtotal: 'Meal subtotal',
      send: 'Submit request',
      sending: 'Submitting…',
      sent: 'Request submitted',
      sentHint: 'The admin will review your request and let you know the result.',
      approved: 'Request approved',
      approvedHint: 'Your meal order has been approved.',
      rejected: 'Request rejected',
      rejectedHint: 'The admin rejected your request. You can edit it and resubmit.',
      noOptions: 'The admin has not configured meal options yet.',
      sendDisabled: 'Add at least one meal before submitting.',
      proofRequired: 'Upload the transfer proof before submitting.',
    },
  }
  const t = T[lang]

  if (loading || options.length === 0) return null

  const statusColors: Record<string, string> = {
    submitted: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
  }

  const canSend = isEditable && total > 0 && !!submission?.payment_proof_url

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">{t.title}</p>
          {submission && submission.status !== 'draft' && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[submission.status] ?? ''}`}>
              {submission.status === 'submitted' ? t.sent : submission.status === 'approved' ? t.approved.split(' ')[0] : t.rejected.split(' ')[0]}
            </span>
          )}
          {total > 0 && isEditable && (
            <span className="text-xs font-semibold text-blue-600">{total.toFixed(2)} €</span>
          )}
        </div>
        <svg className={['w-4 h-4 transition-transform text-slate-300', open ? 'rotate-180' : ''].join(' ')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-3">

          {/* Status banners */}
          {submission?.status === 'submitted' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-amber-800">{t.sent}</p>
              <p className="text-xs text-amber-600 mt-0.5">{t.sentHint}</p>
            </div>
          )}
          {submission?.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-green-800">{t.approved}</p>
              <p className="text-xs text-green-600 mt-0.5">{t.approvedHint}</p>
            </div>
          )}
          {submission?.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-red-700">{t.rejected}</p>
              <p className="text-xs text-red-500 mt-0.5">{t.rejectedHint}</p>
              {submission.admin_notes && (
                <p className="text-xs text-red-600 mt-1 italic">"{submission.admin_notes}"</p>
              )}
            </div>
          )}

          {/* Meal slots */}
          {slots.map(slot => {
            const isCourseBased = slot.options.some(o => o.course_label)

            // Group options by course_label within the slot
            const courseMap = new Map<string | null, MealOption[]>()
            for (const opt of slot.options) {
              const k = opt.course_label ?? null
              if (!courseMap.has(k)) courseMap.set(k, [])
              courseMap.get(k)!.push(opt)
            }
            const courseGroups: { label: string | null; opts: MealOption[] }[] = []
            for (const [label, opts] of courseMap.entries()) {
              courseGroups.push({ label, opts })
            }
            const catOrder = new Map(mealCategories.map(c => [c.name, c.sort_order]))
            courseGroups.sort((a, b) => {
              const orderA = a.label != null ? (catOrder.get(a.label) ?? 999) : 999
              const orderB = b.label != null ? (catOrder.get(b.label) ?? 999) : 999
              return orderA - orderB
            })

            // Slot totals
            const slotParentIds = new Set(slot.options.filter(o => o.parent_option_id).map(o => o.parent_option_id!))
            const slotTotal = slot.options.reduce((sum, o) => {
              if (slotParentIds.has(o.id)) return sum
              return sum + (quantities[o.id] ?? 0) * o.price
            }, 0)
            const slotPeople = (() => {
              if (isCourseBased) {
                // 1 person = 1 item per category → count = max qty across categories
                const labelTotals = new Map<string | null, number>()
                for (const o of slot.options) {
                  if (slotParentIds.has(o.id)) continue
                  const lbl = o.course_label ?? null
                  labelTotals.set(lbl, (labelTotals.get(lbl) ?? 0) + (quantities[o.id] ?? 0))
                }
                return labelTotals.size > 0 ? Math.max(...Array.from(labelTotals.values())) : 0
              }
              return slot.options.reduce((sum, o) => {
                if (slotParentIds.has(o.id)) return sum
                return sum + (quantities[o.id] ?? 0)
              }, 0)
            })()

            return (
              <div key={slot.key} className="rounded-xl border border-slate-200 overflow-hidden">
                {/* Slot header */}
                <button
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  onClick={() => setOpenSlots(prev => ({ ...prev, [slot.key]: !isSlotOpen(slot.key) }))}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      {formatSlotDay(slot.day_label, lang)} — {slot.meal_type === 'lunch' ? t.lunch : t.dinner}
                    </p>
                    {slotPeople > 0 && (
                      <span className="text-xs text-slate-400 tabular-nums">{slotPeople} {t.persons}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {slotTotal > 0 && (
                      <span className="text-sm font-bold tabular-nums text-slate-700">{slotTotal.toFixed(2)} €</span>
                    )}
                    <svg className={['w-4 h-4 transition-transform text-slate-300', isSlotOpen(slot.key) ? 'rotate-180' : ''].join(' ')}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isSlotOpen(slot.key) && (
                <div className="px-3 py-3 border-t border-slate-100">
                <div className="flex flex-col md:flex-row md:divide-x divide-y md:divide-y-0 divide-slate-100">
                {courseGroups.map(({ label, opts }) => {
                  const courseParentIds = new Set(opts.filter(o => o.parent_option_id).map(o => o.parent_option_id!))
                  const courseCount = opts.reduce((s, o) => courseParentIds.has(o.id) ? s : s + (quantities[o.id] ?? 0), 0)
                  const topLevel = opts.filter(o => !o.parent_option_id)
                  return (
                    <div key={label ?? '__none__'} className="flex-1 min-w-0 py-2 md:py-0 md:px-3 first:md:pl-0 last:md:pr-0">
                      {label && (
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{label}</p>
                          {isCourseBased && courseCount > 0 && (
                            <span className="text-xs text-slate-400 tabular-nums">{courseCount} {t.persons}</span>
                          )}
                        </div>
                      )}
                      <div className="space-y-2">
                        {topLevel.map(opt => {
                          const types = opts.filter(o => o.parent_option_id === opt.id)
                          if (types.length > 0) {
                            return (
                              <div key={opt.id} className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                                <p className="px-3 pt-2 pb-1 text-sm font-medium text-slate-700">
                                  {opt.name}
                                  {opt.description && <span className="text-xs text-slate-400 ml-1.5">{opt.description}</span>}
                                </p>
                                {types.map(tp => (
                                  <div key={tp.id} className="flex items-center gap-3 px-3 py-1.5 border-t border-slate-100 bg-white">
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm text-slate-700">{tp.name}</span>
                                      {!isCourseBased && <span className="text-xs text-slate-400 ml-2">{t.each(tp.price)}</span>}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        disabled={isLocked || (quantities[tp.id] ?? 0) === 0}
                                        onClick={() => handleQuantityChange(tp.id, (quantities[tp.id] ?? 0) - 1)}
                                        className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-30 transition-all text-base leading-none">
                                        −
                                      </button>
                                      <span className="w-8 text-center text-sm font-semibold tabular-nums text-slate-800">
                                        {quantities[tp.id] ?? 0}
                                      </span>
                                      <button
                                        disabled={isLocked}
                                        onClick={() => handleQuantityChange(tp.id, (quantities[tp.id] ?? 0) + 1)}
                                        className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-30 transition-all text-base leading-none">
                                        +
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          }
                          return (
                            <div key={opt.id} className="flex items-center gap-3 py-1.5 px-3 rounded-xl border border-slate-100 bg-slate-50">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-800 font-medium">{opt.name}</p>
                                {opt.description && (
                                  <p className="text-xs text-slate-400 truncate mt-0.5">{opt.description}</p>
                                )}
                                {!isCourseBased && (
                                  <p className="text-xs text-slate-500 mt-0.5">{t.each(opt.price)}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  disabled={isLocked || (quantities[opt.id] ?? 0) === 0}
                                  onClick={() => handleQuantityChange(opt.id, (quantities[opt.id] ?? 0) - 1)}
                                  className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-30 transition-all text-base leading-none">
                                  −
                                </button>
                                <span className="w-8 text-center text-sm font-semibold tabular-nums text-slate-800">
                                  {quantities[opt.id] ?? 0}
                                </span>
                                <button
                                  disabled={isLocked}
                                  onClick={() => handleQuantityChange(opt.id, (quantities[opt.id] ?? 0) + 1)}
                                  className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-30 transition-all text-base leading-none">
                                  +
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                </div>
                </div>
                )}
              </div>
            )
          })}

          {/* Total */}
          {total > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <p className="text-sm font-semibold text-slate-700">{t.total}</p>
              <p className="text-lg font-bold tabular-nums text-slate-800">{total.toFixed(2)} €</p>
            </div>
          )}

          {/* Payment proof */}
          {isEditable && total > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1.5">{t.paymentProof}</p>
              {submission?.payment_proof_url ? (
                <div className="flex items-center gap-2">
                  <a href={submission.payment_proof_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline font-medium">{t.viewProof}</a>
                  <button onClick={() => proofInputRef.current?.click()}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors">{t.replaceProof}</button>
                </div>
              ) : (
                <button onClick={() => proofInputRef.current?.click()}
                  disabled={uploadingProof}
                  className="text-xs text-slate-400 hover:text-blue-600 border border-dashed border-slate-300 hover:border-blue-400 rounded-full px-3 py-1 transition-all disabled:opacity-50">
                  {uploadingProof ? '…' : t.uploadProof}
                </button>
              )}
              <input
                ref={proofInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadProof(f); if (proofInputRef.current) proofInputRef.current.value = '' }}
              />
            </div>
          )}

          {/* Send button */}
          {isEditable && (
            <button
              disabled={!canSend || sending}
              onClick={handleSend}
              title={total === 0 ? t.sendDisabled : !submission?.payment_proof_url ? t.proofRequired : undefined}
              className="w-full py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-40
                bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed">
              {sending ? t.sending : t.send}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
