import type { CompetitionStatus } from '@/components/admin/types'

export const STATUS_BADGE: Record<CompetitionStatus, string> = {
  draft:                'bg-slate-100 text-slate-500',
  provisional_entry:    'bg-violet-100 text-violet-700',
  definitive_entry:     'bg-orange-100 text-orange-700',
  registration_open:    'bg-green-100 text-green-700',
  registration_closed:  'bg-amber-100 text-amber-700',
  published:            'bg-indigo-100 text-indigo-700',
  active:               'bg-blue-600 text-white',
  finished:             'bg-slate-100 text-slate-400',
}

export const INPUT_CLS = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
