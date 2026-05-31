import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService } from '@/services/profile.service'
import { useSession } from './useSession'
import { useSessionStore } from '@/stores/session.store'
import { TablesUpdate } from '@/types/database.types'

export function useUpdateProfile() {
  const qc = useQueryClient()
  const { userId } = useSession()
  const { setProfile } = useSessionStore()

  return useMutation({
    mutationFn: async (data: TablesUpdate<'profiles'>) => {
      if (!userId) throw new Error('Não autenticado')
      const result = await profileService.updateProfile(userId, data)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: (data) => {
      if (data) setProfile(data)
      void qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useCompleteOnboarding() {
  const { userId } = useSession()
  const { setProfile } = useSessionStore()

  return useMutation({
    mutationFn: async (data: TablesUpdate<'profiles'>) => {
      if (!userId) throw new Error('Não autenticado')
      const result = await profileService.completeOnboarding(userId, data)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: (data) => {
      if (data) setProfile(data)
    },
  })
}
