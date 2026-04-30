import CheckIcon from './CheckIcon'

export function RoleTabBar({ tabs, activeTab, onChange }: {
  tabs: Array<{ id: string; label: string; submitted: boolean }>
  activeTab: string
  onChange: (id: string) => void
}) {
  const small = tabs.length >= 3
  return (
    <div className="flex gap-0.5 bg-slate-100 rounded-xl p-1 mx-4 mb-4">
      {tabs.map(({ id, label, submitted }) => (
        <button key={id} onClick={() => onChange(id)}
          className={[
            'flex-1 py-2 rounded-lg font-semibold transition-all flex items-center justify-center',
            small ? 'text-xs gap-1' : 'text-sm gap-1.5',
            activeTab === id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          ].join(' ')}>
          {label}
          {submitted && <CheckIcon />}
        </button>
      ))}
    </div>
  )
}
