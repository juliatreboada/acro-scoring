'use client'

export function SubTabSwitcher<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly { key: T; label: string }[]
  active: T
  onChange: (key: T) => void
}) {
  return (
    <div className="flex border-b border-slate-200 mb-5 gap-0">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={[
            'px-4 py-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
            active === key
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-600',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
