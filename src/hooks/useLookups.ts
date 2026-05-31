import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { lookupService } from '@/services/lookup.service'
import { useSession } from './useSession'

export const lookupKeys = {
  civilStatuses: (userId: string) => ['civil_statuses', userId] as const,
  insurers: () => ['insurers'] as const,
  plans: (insurerId?: string) => ['plans', insurerId] as const,
}

export function useCivilStatuses() {
  const { userId } = useSession()
  return useQuery({
    queryKey: lookupKeys.civilStatuses(userId ?? ''),
    queryFn: async () => {
      if (!userId) return []
      const result = await lookupService.getCivilStatuses(userId)
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  })
}

export function useCreateCivilStatus() {
  const qc = useQueryClient()
  const { userId } = useSession()
  return useMutation({
    mutationFn: async (name: string) => {
      if (!userId) throw new Error('Não autenticado')
      const result = await lookupService.createCivilStatus(userId, name)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: lookupKeys.civilStatuses(userId ?? '') })
    },
  })
}

export function useUpdateCivilStatus() {
  const qc = useQueryClient()
  const { userId } = useSession()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const result = await lookupService.updateCivilStatus(id, name)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: lookupKeys.civilStatuses(userId ?? '') })
    },
  })
}

export function useDeleteCivilStatus() {
  const qc = useQueryClient()
  const { userId } = useSession()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await lookupService.deleteCivilStatus(id)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: lookupKeys.civilStatuses(userId ?? '') })
    },
  })
}

export function useInsurers() {
  return useQuery({
    queryKey: lookupKeys.insurers(),
    queryFn: async () => {
      const result = await lookupService.getInsurers()
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
    staleTime: 1000 * 60 * 60, // 1h — global list doesn't change often
  })
}

export function usePlans(insurerId?: string) {
  return useQuery({
    queryKey: lookupKeys.plans(insurerId),
    queryFn: async () => {
      const result = await lookupService.getPlans(insurerId)
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
    staleTime: 1000 * 60 * 60,
  })
}
