import { supabase } from './supabase'
import { formatSupabaseError } from '@/utils/errors'
import { ServiceResult } from '@/types/app.types'
import type { Session, User } from '@supabase/supabase-js'

export interface SignInResult {
  user: User
  session: Session
}

export const authService = {
  async signInWithEmail(
    email: string,
    password: string,
  ): Promise<ServiceResult<SignInResult>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (error) return { data: null, error: formatSupabaseError(error) }
      if (!data.user || !data.session)
        return { data: null, error: 'Resposta inválida do servidor.' }
      return { data: { user: data.user, session: data.session }, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async signUpWithEmail(
    email: string,
    password: string,
    fullName: string,
  ): Promise<ServiceResult<SignInResult>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      })
      if (error) return { data: null, error: formatSupabaseError(error) }
      if (!data.user)
        return { data: null, error: 'Não foi possível criar a conta.' }

      // Some Supabase projects require email confirmation; session may be null
      if (!data.session) {
        return {
          data: null,
          error:
            'Conta criada! Verifique seu e-mail para confirmar o cadastro.',
        }
      }
      return { data: { user: data.user, session: data.session }, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async signOut(): Promise<ServiceResult<null>> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async resetPassword(email: string): Promise<ServiceResult<null>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: 'luka://reset-password' },
      )
      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  onAuthStateChange(
    callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
  ) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
