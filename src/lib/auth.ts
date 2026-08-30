import { supabase } from './supabaseClient'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  avatar_color: string
}

const DEFAULT_COLOR = '#3454D1'

async function fetchProfile(id: string, fallbackEmail: string, fallbackName?: string): Promise<AuthUser> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (error || !data) {
    // The DB trigger that creates a profile row can take a beat right after
    // sign-up — fall back to what we already know rather than failing.
    return { id, email: fallbackEmail, full_name: fallbackName ?? fallbackEmail, avatar_color: DEFAULT_COLOR }
  }
  return { id: data.id, email: data.email, full_name: data.full_name, avatar_color: data.avatar_color }
}

export async function signUp(fullName: string, email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Sign up did not return a user. Please try again.')
  return fetchProfile(data.user.id, email, fullName)
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Sign in did not return a user.')
  return fetchProfile(data.user.id, data.user.email ?? email)
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export async function getSession(): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  if (!user) return null
  return fetchProfile(user.id, user.email ?? '')
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    if (!session?.user) {
      callback(null)
      return
    }
    fetchProfile(session.user.id, session.user.email ?? '').then(callback)
  })
}

export async function updateProfile(patch: Partial<Pick<AuthUser, 'full_name' | 'avatar_color'>>): Promise<AuthUser> {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) throw new Error('Not signed in')
  const { data, error } = await supabase.from('profiles').update(patch).eq('id', userId).select().single()
  if (error) throw new Error(error.message)
  return { id: data.id, email: data.email, full_name: data.full_name, avatar_color: data.avatar_color }
}
