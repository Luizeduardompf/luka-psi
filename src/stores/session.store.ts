import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { Profile } from '@/types/app.types'

interface SessionState {
  session: Session | null
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean

  setSession: (session: Session | null) => void
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  reset: () => void
}

const initialState = {
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
}

export const useSessionStore = create<SessionState>()((set) => ({
  ...initialState,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  reset: () => set({ ...initialState, isLoading: false, isInitialized: true }),
}))
