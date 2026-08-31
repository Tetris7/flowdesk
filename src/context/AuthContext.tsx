import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as auth from '../lib/auth'
import type { AuthUser } from '../lib/auth'
import { ensureWorkspace } from '../lib/db'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signUp: (fullName: string, email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (patch: Partial<Pick<AuthUser, 'full_name' | 'avatar_color'>>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Seeding a starter project is a nice-to-have, not something that should
// ever be allowed to block someone from actually logging in.
async function trySeedWorkspace(u: AuthUser) {
  try {
    await ensureWorkspace(u.id, u.full_name, u.email)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Starter workspace seeding failed (non-fatal):', err)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    auth.getSession().then((session) => {
      if (!mounted) return
      if (session) trySeedWorkspace(session)
      setUser(session)
      setLoading(false)
    })

    const { data: subscription } = auth.onAuthStateChange((nextUser) => {
      if (!mounted) return
      setUser(nextUser)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    signUp: async (fullName, email, password) => {
      const u = await auth.signUp(fullName, email, password)
      await trySeedWorkspace(u)
      setUser(u)
    },
    signIn: async (email, password) => {
      const u = await auth.signIn(email, password)
      await trySeedWorkspace(u)
      setUser(u)
    },
    signOut: async () => {
      await auth.signOut()
      setUser(null)
    },
    updateProfile: async (patch) => setUser(await auth.updateProfile(patch)),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

