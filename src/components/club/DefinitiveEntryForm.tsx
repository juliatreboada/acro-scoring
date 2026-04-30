'use client'

import { useRef, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { Competition, AgeGroupRule } from '@/components/admin/types'
import { categoriesForRuleset, categoryLabel, CATEGORY_SIZE } from '@/components/admin/types'

// ─── translations ──────────────────────────────────────────────────────────────

const T = {
  en: {
    title: 'Definitive Entry',
    contact: 'Contact person',
    contactName: 'Full name',
    contactPhone: 'Phone',
    contactEmail: 'Email',
    teams: 'Teams per category',
    judge: 'Judge nomination',
    judgeName: 'Judge name (optional)',
    judgeHint: 'Leave blank if your club cannot provide a judge.',
    totalTitle: 'Estimated total',
    feePerTeam: (n: number) => `${n} team${n !== 1 ? 's' : ''} × fee`,
    feePerGymnast: (n: number) => `${n} gymnast${n !== 1 ? 's' : ''} × fee`,
    judgeFine: 'No judge fine',
    save: 'Submit entry',
    saving: 'Saving…',
    saved: 'Entry submitted',
    edit: 'Update entry',
    close: 'Close',
    error: 'Failed to save. Please try again.',
    paymentTitle: 'Payment proof',
    paymentHint: 'Upload your transfer receipt or proof of payment.',
    uploadPayment: 'Upload payment document',
    paymentUploaded: 'Payment document uploaded',
    replace: 'Replace',
    uploading: 'Uploading…',
    uploadError: 'Upload failed. Please try again.',
    status: {
      pending: 'Pending review',
      payment_uploaded: 'Payment uploaded — awaiting approval',
      approved: 'Approved',
      rejected: 'Rejected — contact the organiser',
    } as Record<string, string>,
    statusBadge: {
      pending: 'bg-amber-100 text-amber-700',
      payment_uploaded: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    } as Record<string, string>,
    readOnly: 'This entry has been approved and can no longer be edited.',
    required: 'Required',
  },
  es: {
    title: 'Inscripción definitiva',
    contact: 'Persona de contacto',
    contactName: 'Nombre completo',
    contactPhone: 'Teléfono',
    contactEmail: 'Email',
    teams: 'Equipos por categoría',
    judge: 'Nominación de juez',
    judgeName: 'Nombre del juez (opcional)',
    judgeHint: 'Déjalo en blanco si tu club no puede aportar juez.',
    totalTitle: 'Total estimado',
    feePerTeam: (n: number) => `${n} equipo${n !== 1 ? 's' : ''} × tarifa`,
    feePerGymnast: (n: number) => `${n} gimnasta${n !== 1 ? 's' : ''} × tarifa`,
    judgeFine: 'Recargo sin juez',
    save: 'Enviar inscripción',
    saving: 'Guardando…',
    saved: 'Inscripción enviada',
    edit: 'Actualizar inscripción',
    close: 'Cerrar',
    error: 'Error al guardar. Inténtalo de nuevo.',
    paymentTitle: 'Justificante de pago',
    paymentHint: 'Sube el justificante de transferencia o recibo de pago.',
    uploadPayment: 'Subir justificante',
    paymentUploaded: 'Justificante subido',
    replace: 'Reemplazar',
    uploading: 'Subiendo…',
    uploadError: 'Error al subir. Inténtalo de nuevo.',
    status: {
      pending: 'Pendiente de revisión',
      payment_uploaded: 'Pago subido — pendiente de aprobación',
      approved: 'Aprobada',
      rejected: 'Rechazada — contacta al organizador',
    } as Record<string, string>,
    statusBadge: {
      pending: 'bg-amber-100 text-amber-700',
      payment_uploaded: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    } as Record<string, string>,
    readOnly: 'Esta inscripción ha sido aprobada y ya no puede editarse.',
    required: 'Obligatorio',
  },
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function calcTotal(
  counts: Record<string, number>,
  competition: Competition,
  judgeProvided: boolean,
): { lines: { label: string; amount: number }[]; total: number } {
  const lines: { label: string; amount: number }[] = []
  let teamTotal = 0
  let gymnasts = 0

  for (const [, count] of Object.entries(counts)) {
    if (count === 0) continue
    teamTotal += count
    // key format: "ageGroupId|category"
  }
  for (const [key, count] of Object.entries(counts)) {
    if (count === 0) continue
    const category = key.split('|')[1] ?? ''
    gymnasts += count * (CATEGORY_SIZE[category] ?? 2)
  }

  if (competition.fee_per_team && teamTotal > 0) {
    lines.push({ label: `${teamTotal} × €${competition.fee_per_team}`, amount: teamTotal * competition.fee_per_team })
  } else if (competition.fee_per_gymnast && gymnasts > 0) {
    lines.push({ label: `${gymnasts} × €${competition.fee_per_gymnast}`, amount: gymnasts * competition.fee_per_gymnast })
  }

  if (!judgeProvided && competition.judge_missing_fine) {
    lines.push({ label: `+€${competition.judge_missing_fine}`, amount: competition.judge_missing_fine })
  }

  const total = lines.reduce((s, l) => s + l.amount, 0)
  return { lines, total }
}

// ─── component ─────────────────────────────────────────────────────────────────

type Props = {
  lang: Lang
  competition: Competition
  clubId: string
  clubName: string
  ageGroupRules: AgeGroupRule[]
  onClose: () => void
}

type EntryStatus = 'pending' | 'payment_uploaded' | 'approved' | 'rejected'

export default function DefinitiveEntryForm({ lang, competition, clubId, clubName, ageGroupRules, onClose }: Props) {
  const t = T[lang]
  const supabase = createClient()
  const paymentInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [entryId, setEntryId] = useState<string | null>(null)
  const [entryStatus, setEntryStatus] = useState<EntryStatus | null>(null)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)

  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [judgeName, setJudgeName] = useState('')
  const [counts, setCounts] = useState<Record<string, number>>({})

  const competitionRules = ageGroupRules.filter(r => competition.age_groups.includes(r.id))
  const isApproved = entryStatus === 'approved'
  const hasPaymentFee = !!(competition.fee_per_team || competition.fee_per_gymnast)
  const { lines, total } = calcTotal(counts, competition, !!judgeName.trim())

  useEffect(() => {
    async function load() {
      const { data } = await (supabase as any)
        .from('definitive_entries')
        .select('id,contact_name,contact_phone,contact_email,judge_name,teams_per_category,status,payment_document_url')
        .eq('competition_id', competition.id)
        .eq('club_id', clubId)
        .maybeSingle()
      if (data) {
        setEntryId(data.id)
        setContactName(data.contact_name ?? '')
        setContactPhone(data.contact_phone ?? '')
        setContactEmail(data.contact_email ?? '')
        setJudgeName(data.judge_name ?? '')
        setCounts((data.teams_per_category as Record<string, number>) ?? {})
        setEntryStatus(data.status as EntryStatus)
        setPaymentUrl(data.payment_document_url ?? null)
        setSaved(true)
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function setCount(key: string, delta: number) {
    setCounts(prev => ({ ...prev, [key]: Math.max(0, (prev[key] ?? 0) + delta) }))
    setSaved(false)
  }

  async function handleSave() {
    if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) return
    setSaving(true); setError(null); setSaved(false)
    try {
      const payload = {
        competition_id: competition.id,
        club_id: clubId,
        contact_name: contactName.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim(),
        judge_name: judgeName.trim() || null,
        teams_per_category: counts,
        total_amount: total,
        status: entryStatus ?? 'pending',
        updated_at: new Date().toISOString(),
      }
      const { data, error: err } = await (supabase as any)
        .from('definitive_entries')
        .upsert(
          entryId ? { ...payload, id: entryId } : payload,
          { onConflict: 'competition_id,club_id' },
        )
        .select('id,status')
        .single()
      if (err) throw err
      if (data) {
        setEntryId(data.id)
        setEntryStatus(data.status as EntryStatus)
      }
      setSaved(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  async function handlePaymentUpload(file: File) {
    if (!entryId) return
    setUploading(true); setUploadError(null)
    try {
      const ext = file.name.split('.').pop() ?? 'pdf'
      const path = `${competition.id}/${clubId}/payment.${ext}`
      const { error: upErr } = await supabase.storage
        .from('payment-documents')
        .upload(path, file, { upsert: true })
      if (upErr) throw upErr

      const { error: dbErr } = await (supabase as any)
        .from('definitive_entries')
        .update({ payment_document_url: path, status: 'payment_uploaded', updated_at: new Date().toISOString() })
        .eq('id', entryId)
      if (dbErr) throw dbErr

      setPaymentUrl(path)
      setEntryStatus('payment_uploaded')
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : String(e))
    } finally {
      setUploading(false)
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400'

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">

        {/* header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-slate-800">{t.title}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{competition.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* status banner */}
          {entryStatus && (
            <div className={['flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium', t.statusBadge[entryStatus]].join(' ')}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
              {t.status[entryStatus]}
            </div>
          )}

          {isApproved && (
            <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">{t.readOnly}</p>
          )}

          {/* club */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Club:</span>
            <span className="text-sm font-semibold text-slate-700">{clubName}</span>
          </div>

          {/* contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">{t.contact}</p>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t.contactName} *</label>
                <input type="text" value={contactName} onChange={e => { setContactName(e.target.value); setSaved(false) }}
                  disabled={isApproved} placeholder={t.contactName} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{t.contactPhone} *</label>
                  <input type="tel" value={contactPhone} onChange={e => { setContactPhone(e.target.value); setSaved(false) }}
                    disabled={isApproved} placeholder={t.contactPhone} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{t.contactEmail} *</label>
                  <input type="email" value={contactEmail} onChange={e => { setContactEmail(e.target.value); setSaved(false) }}
                    disabled={isApproved} placeholder={t.contactEmail} className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* teams grid */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">{t.teams}</p>
            <div className="space-y-4">
              {competitionRules.map(rule => {
                const categories = categoriesForRuleset(rule.age_group)
                return (
                  <div key={rule.id}>
                    <p className="text-xs font-medium text-slate-500 mb-1.5">{rule.age_group}</p>
                    <div className="space-y-1.5">
                      {categories.map(cat => {
                        const key = `${rule.id}|${cat}`
                        const count = counts[key] ?? 0
                        return (
                          <div key={key} className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-slate-50">
                            <span className="text-sm text-slate-700">{categoryLabel(cat, lang)}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setCount(key, -1)} disabled={count === 0 || isApproved}
                                className="w-7 h-7 rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center text-lg leading-none transition-all">
                                −
                              </button>
                              <span className="w-6 text-center text-sm font-bold text-slate-800 tabular-nums">{count}</span>
                              <button onClick={() => setCount(key, +1)} disabled={isApproved}
                                className="w-7 h-7 rounded-full border border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 disabled:opacity-30 flex items-center justify-center text-lg leading-none transition-all">
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

          {/* judge */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">{t.judge}</p>
            <input type="text" value={judgeName} onChange={e => { setJudgeName(e.target.value); setSaved(false) }}
              disabled={isApproved} placeholder={t.judgeName} className={inputCls} />
            {competition.judge_missing_fine && (
              <p className="text-xs text-slate-400 mt-1">{t.judgeHint}</p>
            )}
          </div>

          {/* total */}
          {hasPaymentFee && (
            <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t.totalTitle}</p>
              {lines.map((line, i) => (
                <div key={i} className="flex items-center justify-between text-sm text-slate-600">
                  <span>{line.label}</span>
                  <span className="font-medium">€{line.amount.toFixed(2)}</span>
                </div>
              ))}
              {lines.length > 0 && (
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-sm font-bold text-slate-800">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              )}
              {lines.length === 0 && (
                <p className="text-sm text-slate-400">{lang === 'es' ? 'Añade equipos para calcular el total.' : 'Add teams to calculate the total.'}</p>
              )}
            </div>
          )}

          {/* payment upload — shown after entry is saved */}
          {saved && entryId && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">{t.paymentTitle}</p>
              <p className="text-xs text-slate-500 mb-2">{t.paymentHint}</p>
              <input ref={paymentInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePaymentUpload(f) }} />
              {paymentUrl ? (
                <div className="flex items-center gap-3 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
                  <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-green-700 flex-1">{t.paymentUploaded}</span>
                  {!isApproved && (
                    <button onClick={() => paymentInputRef.current?.click()} disabled={uploading}
                      className="text-xs text-green-600 hover:text-green-800 font-medium shrink-0">
                      {uploading ? t.uploading : t.replace}
                    </button>
                  )}
                </div>
              ) : (
                <button onClick={() => paymentInputRef.current?.click()} disabled={uploading || isApproved}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 transition-all">
                  {uploading ? t.uploading : t.uploadPayment}
                </button>
              )}
              {uploadError && <p className="text-xs text-red-600 mt-1">{t.uploadError}</p>}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-3 shrink-0">
          <div className="flex-1 min-w-0">
            {error && <p className="text-xs text-red-600">{t.error}</p>}
            {saved && !error && !saving && (
              <p className="text-xs text-green-600">{t.saved} ✓</p>
            )}
          </div>
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all shrink-0">
            {t.close}
          </button>
          {!isApproved && (
            <button onClick={handleSave}
              disabled={saving || !contactName.trim() || !contactPhone.trim() || !contactEmail.trim()}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-all shrink-0">
              {saving ? t.saving : saved ? t.edit : t.save}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
