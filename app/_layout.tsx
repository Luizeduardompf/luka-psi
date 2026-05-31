import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { supabase } from '@/services/supabase'
import { useSessionStore } from '@/stores/session.store'
import { config } from '@/constants/config'
import '../global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: config.query.staleTime,
      gcTime: config.query.gcTime,
      retry: 1,
    },
  },
})

function AuthGuard({ children }: { children: React.ReactNode }) {
  const {
    setSession,
    setUser,
    setProfile,
    setLoading,
    setInitialized,
    reset,
  } = useSessionStore()

  useEffect(() => {
    // Hydrate session on mount
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      setInitialized(true)

      if (session?.user) {
        void supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data))
      }
    })

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (!session) {
          reset()
        } else {
          void supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => setProfile(data))
        }
      },
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [setSession, setUser, setProfile, setLoading, setInitialized, reset])

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="forms" />
            </Stack>
          </AuthGuard>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
