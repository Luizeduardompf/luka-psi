import { useSessionStore } from '@/stores/session.store'

export function useSession() {
  const session = useSessionStore((s) => s.session)
  const user = useSessionStore((s) => s.user)
  const profile = useSessionStore((s) => s.profile)
  const isLoading = useSessionStore((s) => s.isLoading)
  const isInitialized = useSessionStore((s) => s.isInitialized)

  return {
    session,
    user,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated: !!session,
    userId: user?.id ?? null,
    displayName: profile?.full_name ?? user?.email ?? 'Usuário',
  }
}
