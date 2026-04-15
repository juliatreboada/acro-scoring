export type UserRole = 'admin' | 'comp-admin' | 'judge' | 'club'

export type MockUser = {
  id: string
  name: string
  email: string
  role: UserRole
  redirectTo: string
}

export const MOCK_USERS: MockUser[] = [
  { id: 'u-admin',      name: 'Laura González', email: 'admin@acro.es',  role: 'admin',      redirectTo: '/admin'      },
  { id: 'u-comp-admin', name: 'Marcos Ruiz',    email: 'comp@acro.es',   role: 'comp-admin', redirectTo: '/comp-admin' },
  { id: 'u-judge',      name: 'García López',   email: 'judge@acro.es',  role: 'judge',      redirectTo: '/judge'      },
  { id: 'u-club',       name: 'RC Olimpia',     email: 'club@acro.es',   role: 'club',       redirectTo: '/club'       },
]

const PASSWORDS: Record<string, string> = {
  'admin@acro.es': 'admin',
  'comp@acro.es':  'comp',
  'judge@acro.es': 'judge',
  'club@acro.es':  'club',
}

const STORAGE_KEY = 'acro_mock_user'

export function mockLogin(email: string, password: string): MockUser | null {
  const user = MOCK_USERS.find((u) => u.email === email.trim().toLowerCase())
  if (!user || PASSWORDS[user.email] !== password) return null
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return user
}

export function mockLogout() {
  if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
}

export function getStoredUser(): MockUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as MockUser } catch { return null }
}
