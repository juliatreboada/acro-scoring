'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Lang } from '@/components/scoring/types'
import type { Gymnast, Coach, Judge } from '@/components/admin/types'

type TshirtOrder = {
  id: string
  person_type: string
  person_id: string
  size: string
}

type Person = {
  id: string
  name: string
  club_id: string | null
  club_name: string
  type: 'gymnast' | 'coach' | 'judge'
}

type Props = {
  lang: Lang
  competitionGymnasts: Gymnast[]
  competitionCoaches: Coach[]
  globalJudges: Judge[]
  judgePool: string[]
  competitionId: string
  sizes: string[]
  deadline: string | null
  onUpdateConfig: (sizes: string[], deadline: string | null) => Promise<void>
}

export default function TshirtTab({ lang, competitionGymnasts, competitionCoaches, globalJudges, judgePool, competitionId, sizes, deadline, onUpdateConfig }: Props) {
  const supabase = createClient()
  const [orders, setOrders] = useState<TshirtOrder[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [adminJudges, setAdminJudges] = useState<{ id: string; name: string }[]>([])
  const [adminJudgeSizes, setAdminJudgeSizes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  // ── names list (must be before any early return) ────────────────────────────
  const gymnastNames = useMemo(() =>
    [...competitionGymnasts]
      .map(g => `${g.first_name} ${g.last_name_1}${g.last_name_2 ? ' ' + g.last_name_2 : ''}`)
      .sort((a, b) => a.localeCompare(b, 'es')),
    [competitionGymnasts])

  const coachNames = useMemo(() =>
    [...competitionCoaches].map(c => c.full_name).sort((a, b) => a.localeCompare(b, 'es')),
    [competitionCoaches])

  const judgeNames = useMemo(() =>
    globalJudges.filter(j => judgePool.includes(j.id)).map(j => j.full_name).sort((a, b) => a.localeCompare(b, 'es')),
    [globalJudges, judgePool])

  // config editing
  const [editingConfig, setEditingConfig] = useState(false)
  const [sizeInput, setSizeInput] = useState('')
  const [sizesForm, setSizesForm] = useState<string[]>(sizes)
  const [deadlineForm, setDeadlineForm] = useState(deadline ?? '')

  useEffect(() => { setSizesForm(sizes) }, [sizes])
  useEffect(() => { setDeadlineForm(deadline ?? '') }, [deadline])

  async function load() {
    setLoading(true)
    const { data: ordersData } = await supabase
      .from('tshirt_orders' as any)
      .select('id,person_type,person_id,size')
      .eq('competition_id', competitionId)

    const rawOrders = (ordersData ?? []) as unknown as TshirtOrder[]
    setOrders(rawOrders)

    // Load admin-added judges (nominations with no club)
    const { data: adminNomData } = await supabase
      .from('competition_judge_nominations')
      .select('judge_id')
      .eq('competition_id', competitionId)
      .is('club_id', null)
    const adminJudgeIds = (adminNomData ?? []).map((n: any) => n.judge_id as string)

    // Person IDs by type
    const gymnastIds  = rawOrders.filter(o => o.person_type === 'gymnast').map(o => o.person_id)
    const coachIds    = rawOrders.filter(o => o.person_type === 'coach').map(o => o.person_id)
    const judgeOrderIds = rawOrders.filter(o => o.person_type === 'judge').map(o => o.person_id)
    const allJudgeIds = [...new Set([...judgeOrderIds, ...adminJudgeIds])]

    const [gymnastsRes, coachesRes, judgesRes] = await Promise.all([
      gymnastIds.length > 0
        ? supabase.from('gymnasts' as any).select('id,first_name,last_name_1,club_id').in('id', gymnastIds)
        : Promise.resolve({ data: [] }),
      coachIds.length > 0
        ? supabase.from('coaches' as any).select('id,full_name,club_id').in('id', coachIds)
        : Promise.resolve({ data: [] }),
      allJudgeIds.length > 0
        ? supabase.from('judges').select('id,full_name').in('id', allJudgeIds)
        : Promise.resolve({ data: [] }),
    ])

    // For judges in orders, find their nominating club
    const judgeNomRes = judgeOrderIds.length > 0
      ? await supabase.from('competition_judge_nominations')
          .select('judge_id,club_id')
          .eq('competition_id', competitionId)
          .in('judge_id', judgeOrderIds)
      : { data: [] }
    const judgeClubMap: Record<string, string | null> = {}
    for (const n of (judgeNomRes.data ?? []) as any[]) {
      judgeClubMap[n.judge_id] = n.club_id
    }

    // Fetch all club names
    const clubIds = [
      ...new Set([
        ...((gymnastsRes.data ?? []) as any[]).map((g: any) => g.club_id),
        ...((coachesRes.data ?? []) as any[]).map((c: any) => c.club_id),
        ...Object.values(judgeClubMap).filter(Boolean),
      ].filter(Boolean))
    ]
    const clubsRes = clubIds.length > 0
      ? await supabase.from('clubs').select('id,club_name').in('id', clubIds)
      : { data: [] }
    const clubNameMap: Record<string, string> = Object.fromEntries(
      ((clubsRes.data ?? []) as any[]).map((c: any) => [c.id, c.club_name])
    )

    const judgeNameMap: Record<string, string> = Object.fromEntries(
      ((judgesRes.data ?? []) as any[]).map((j: any) => [j.id, j.full_name])
    )

    const all: Person[] = [
      ...((gymnastsRes.data ?? []) as any[]).map((g: any) => ({
        id: g.id,
        name: [g.first_name, g.last_name_1].filter(Boolean).join(' '),
        club_id: g.club_id,
        club_name: clubNameMap[g.club_id] ?? '—',
        type: 'gymnast' as const,
      })),
      ...((coachesRes.data ?? []) as any[]).map((c: any) => ({
        id: c.id,
        name: c.full_name,
        club_id: c.club_id,
        club_name: clubNameMap[c.club_id] ?? '—',
        type: 'coach' as const,
      })),
      ...judgeOrderIds.map((jid) => ({
        id: jid,
        name: judgeNameMap[jid] ?? jid,
        club_id: judgeClubMap[jid] ?? null,
        club_name: judgeClubMap[jid] ? (clubNameMap[judgeClubMap[jid]!] ?? '—') : 'Administración',
        type: 'judge' as const,
      })),
    ]
    setPeople(all)

    // Admin judges (no club) + their current sizes
    const adminJudgeList = adminJudgeIds.map(id => ({ id, name: judgeNameMap[id] ?? id }))
    setAdminJudges(adminJudgeList)
    const sizeMap: Record<string, string> = {}
    for (const o of rawOrders) {
      if (o.person_type === 'judge' && adminJudgeIds.includes(o.person_id)) {
        sizeMap[o.person_id] = o.size
      }
    }
    setAdminJudgeSizes(sizeMap)

    setLoading(false)
  }

  useEffect(() => { void load() }, [competitionId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdminJudgeSize(judgeId: string, size: string) {
    setAdminJudgeSizes(prev => ({ ...prev, [judgeId]: size }))
    if (size) {
      await supabase.from('tshirt_orders' as any).upsert(
        { competition_id: competitionId, person_type: 'judge', person_id: judgeId, size },
        { onConflict: 'competition_id,person_type,person_id' }
      )
      setOrders(prev => {
        const existing = prev.find(o => o.person_type === 'judge' && o.person_id === judgeId)
        if (existing) return prev.map(o => o.person_type === 'judge' && o.person_id === judgeId ? { ...o, size } : o)
        return [...prev, { id: '', person_type: 'judge', person_id: judgeId, size }]
      })
    } else {
      await supabase.from('tshirt_orders' as any)
        .delete()
        .eq('competition_id', competitionId)
        .eq('person_type', 'judge')
        .eq('person_id', judgeId)
      setOrders(prev => prev.filter(o => !(o.person_type === 'judge' && o.person_id === judgeId)))
    }
  }

  // totals per size
  const totals = useMemo(() => {
    const map: Record<string, number> = {}
    for (const o of orders) map[o.size] = (map[o.size] ?? 0) + 1
    return map
  }, [orders])

  // orders grouped by club (including 'Administración' for admin-set judges)
  const byClub = useMemo(() => {
    const map: Record<string, { club_name: string; rows: { person: Person; size: string }[] }> = {}
    for (const order of orders) {
      const person = people.find(p => p.id === order.person_id && p.type === order.person_type)
      if (!person) continue
      const key = person.club_id ?? '__admin__'
      if (!map[key]) map[key] = { club_name: person.club_name, rows: [] }
      map[key].rows.push({ person, size: order.size })
    }
    return Object.values(map).sort((a, b) => {
      if (a.club_name === 'Administración') return 1
      if (b.club_name === 'Administración') return -1
      return a.club_name.localeCompare(b.club_name)
    })
  }, [orders, people])

  const totalOrders = orders.length

  function handlePrint() {
    const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Tallas camisetas</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 24px; }
        h1 { font-size: 16px; margin-bottom: 4px; }
        h2 { font-size: 13px; margin: 16px 0 4px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th, td { border: 1px solid #ddd; padding: 4px 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: 600; }
        .totals td { font-weight: bold; }
        @media print { body { margin: 10px; } }
      </style>
      </head><body>
      <h1>Tallas camisetas</h1>
      <p style="color:#666;margin-bottom:12px">Total pedidos: ${totalOrders}</p>
      <h2>Resumen por talla</h2>
      <table class="totals"><thead><tr><th>Talla</th><th>Cantidad</th></tr></thead><tbody>
      ${sizes.map(s => `<tr><td>${s}</td><td>${totals[s] ?? 0}</td></tr>`).join('')}
      </tbody></table>
      ${byClub.map(club => `
        <h2>${club.club_name} (${club.rows.length})</h2>
        <table><thead><tr><th>Nombre</th><th>Tipo</th><th>Talla</th></tr></thead><tbody>
        ${club.rows.map(r => `<tr><td>${r.person.name}</td><td>${r.person.type === 'gymnast' ? 'Gimnasta' : r.person.type === 'coach' ? 'Entrenador/a' : 'Juez/a'}</td><td>${r.size}</td></tr>`).join('')}
        </tbody></table>
      `).join('')}
      </body></html>`
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
  }

  if (loading) return <div className="text-sm text-slate-500 py-8 text-center">Cargando...</div>

  function copyToClipboard(names: string[]) {
    navigator.clipboard.writeText(names.join('\n'))
  }

  function copyAll() {
    const parts: string[] = []
    if (gymnastNames.length) parts.push(`--- Gimnastas (${gymnastNames.length}) ---\n` + gymnastNames.join('\n'))
    if (coachNames.length)   parts.push(`--- Entrenadores/as (${coachNames.length}) ---\n` + coachNames.join('\n'))
    if (judgeNames.length)   parts.push(`--- Jueces/as (${judgeNames.length}) ---\n` + judgeNames.join('\n'))
    navigator.clipboard.writeText(parts.join('\n\n'))
  }

  return (
    <div className="space-y-6">

      {/* Config card */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Configuración de tallas</p>
            <p className="text-xs text-slate-500 mt-0.5">Define las tallas disponibles y el plazo para que los clubes elijan.</p>
          </div>
          {!editingConfig && (
            <button onClick={() => setEditingConfig(true)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
              Editar
            </button>
          )}
        </div>
        <div className="p-4">
          {editingConfig ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Tallas disponibles</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {sizesForm.map(s => (
                    <span key={s} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-full">
                      {s}
                      <button onClick={() => setSizesForm(prev => prev.filter(x => x !== s))} className="text-blue-400 hover:text-blue-700 font-bold">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={sizeInput}
                    onChange={e => setSizeInput(e.target.value.toUpperCase())}
                    onKeyDown={e => {
                      if ((e.key === 'Enter' || e.key === ',') && sizeInput.trim()) {
                        e.preventDefault()
                        const s = sizeInput.trim()
                        if (!sizesForm.includes(s)) setSizesForm(prev => [...prev, s])
                        setSizeInput('')
                      }
                    }}
                    placeholder="Ej: XS, S, M, L, XL… (Enter para añadir)"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const s = sizeInput.trim()
                      if (s && !sizesForm.includes(s)) setSizesForm(prev => [...prev, s])
                      setSizeInput('')
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Fecha límite para elegir talla</label>
                <input
                  type="date"
                  value={deadlineForm}
                  onChange={e => setDeadlineForm(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={async () => { await onUpdateConfig(sizesForm, deadlineForm || null); setEditingConfig(false) }}
                  className="px-4 py-1.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                >
                  Guardar
                </button>
                <button onClick={() => { setSizesForm(sizes); setDeadlineForm(deadline ?? ''); setEditingConfig(false) }}
                  className="px-4 py-1.5 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">
                  Cancelar
                </button>
              </div>
            </div>
          ) : sizes.length === 0 ? (
            <p className="text-sm text-slate-400">No hay tallas configuradas. Pulsa Editar para añadir.</p>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {sizes.map(s => (
                  <span key={s} className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium rounded-full">{s}</span>
                ))}
              </div>
              {deadline && (
                <p className="text-xs text-slate-500">Plazo: <span className="font-medium text-slate-700">{deadline}</span></p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin judges section */}
      {sizes.length > 0 && adminJudges.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-sm font-semibold text-slate-800">Jueces (sin club)</p>
            <p className="text-xs text-slate-500 mt-0.5">Jueces asignados directamente por el administrador, no nominados por ningún club.</p>
          </div>
          <div className="p-4 space-y-2">
            {adminJudges.map(j => (
              <div key={j.id} className="flex items-center gap-3 py-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 font-medium truncate">{j.name}</p>
                  <p className="text-xs text-slate-400">Juez/a</p>
                </div>
                <select
                  value={adminJudgeSizes[j.id] ?? ''}
                  onChange={e => handleAdminJudgeSize(j.id, e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option value="">Sin talla</option>
                  {sizes.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary + breakdown */}
      {sizes.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              {totalOrders} pedido{totalOrders !== 1 ? 's' : ''} recibido{totalOrders !== 1 ? 's' : ''}
            </p>
            {totalOrders > 0 && (
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                </svg>
                Imprimir
              </button>
            )}
          </div>

          {/* Totals per size */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {sizes.map(s => (
              <div key={s} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center">
                <p className="text-xl font-bold tabular-nums text-slate-800">{totals[s] ?? 0}</p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{s}</p>
              </div>
            ))}
          </div>

          {/* Per-club breakdown */}
          {byClub.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Ningún club ha enviado tallas todavía.</p>
          ) : (
            <div className="space-y-3">
              {byClub.map(club => (
                <div key={club.club_name} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">{club.club_name}</p>
                    <span className="text-xs text-slate-500">{club.rows.length} persona{club.rows.length !== 1 ? 's' : ''}</span>
                  </div>
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50/60 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-slate-500">Nombre</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-500">Rol</th>
                        <th className="px-4 py-2 text-right font-semibold text-slate-500">Talla</th>
                      </tr>
                    </thead>
                    <tbody>
                      {club.rows.map(({ person, size }, i) => (
                        <tr key={person.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                          <td className="px-4 py-2 font-medium text-slate-800">{person.name}</td>
                          <td className="px-4 py-2 text-slate-500">
                            {person.type === 'gymnast' ? 'Gimnasta' : person.type === 'coach' ? 'Entrenador/a' : 'Juez/a'}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-slate-700">{size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Names list */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Lista de participantes</p>
            <p className="text-xs text-slate-500 mt-0.5">Nombres de todos los participantes en esta competición.</p>
          </div>
          <button
            onClick={copyAll}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
            </svg>
            Copiar todo
          </button>
        </div>
        <div className="p-4 space-y-4">
          {[
            { label: `Gimnastas (${gymnastNames.length})`, names: gymnastNames },
            { label: `Entrenadores/as (${coachNames.length})`, names: coachNames },
            { label: `Jueces/as (${judgeNames.length})`, names: judgeNames },
          ].map(({ label, names }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
                <button
                  onClick={() => copyToClipboard(names)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Copiar
                </button>
              </div>
              {names.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Sin participantes</p>
              ) : (
                <textarea
                  readOnly
                  value={names.join('\n')}
                  rows={Math.min(names.length, 8)}
                  className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 resize-none bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
