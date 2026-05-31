import { supabase } from './supabase'
import { formatSupabaseError } from '@/utils/errors'
import { Profile, ServiceResult } from '@/types/app.types'
import { TablesUpdate } from '@/types/database.types'

export const profileService = {
  async getProfile(id: string): Promise<ServiceResult<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as Profile, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async updateProfile(
    id: string,
    updates: TablesUpdate<'profiles'>,
  ): Promise<ServiceResult<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()
      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as Profile, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async completeOnboarding(
    id: string,
    data: TablesUpdate<'profiles'>,
  ): Promise<ServiceResult<Profile>> {
    return profileService.updateProfile(id, {
      ...data,
      onboarding_completed: true,
    })
  },
}
