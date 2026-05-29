import { useCallback, useState } from 'react'
import { router } from 'expo-router'
import { authService } from '@/services/auth.service'
import { supabase } from '@/services/supabase'
import { useSessionStore } from '@/stores/session.store'

export function useAuth() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setSession, setUser, setProfile, reset } = useSessionStore()

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      setIsSubmitting(true)
      try {
        const result = await authService.signInWithEmail(email, password)
        if (result.error) return result.error

        if (result.data) {
          setSession(result.data.session)
          setUser(result.data.user)

          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', result.data.user.id)
            .single()

          setProfile(profile)
          router.replace('/(app)')
        }
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [setSession, setUser, setProfile],
  )

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
    ): Promise<string | null> => {
      setIsSubmitting(true)
      try {
        const result = await authService.signUpWithEmail(
          email,
          password,
          fullName,
        )
        if (result.error) {
          // "Conta criada! Verifique..." is a success message returned as error
          if (result.error.startsWith('Conta criada')) return result.error
          return result.error
        }

        if (result.data) {
          setSession(result.data.session)
          setUser(result.data.user)

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', result.data.user.id)
            .single()

          setProfile(profile)
          router.replace('/(app)')
        }
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [setSession, setUser, setProfile],
  )

  const signOut = useCallback(async (): Promise<void> => {
    await authService.signOut()
    reset()
    router.replace('/(auth)/login')
  }, [reset])

  const resetPassword = useCallback(
    async (email: string): Promise<string | null> => {
      const result = await authService.resetPassword(email)
      return result.error
    },
    [],
  )

  return { signIn, signUp, signOut, resetPassword, isSubmitting }
}
