import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { patientsService } from '@/services/patients.service'
import { useSession } from './useSession'
import {
  PatientFilters,
  PatientInsert,
  PatientUpdate,
} from '@/types/app.types'

// ─── Query keys ────────────────────────────────────────────────────────────────
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (userId: string, filters: PatientFilters) =>
    [...patientKeys.lists(), userId, filters] as const,
  recent: (userId: string) =>
    [...patientKeys.all, 'recent', userId] as const,
  detail: (id: string) => [...patientKeys.all, 'detail', id] as const,
}

// ─── List ──────────────────────────────────────────────────────────────────────
export function usePatients(filters: PatientFilters = {}) {
  const { userId } = useSession()

  return useQuery({
    queryKey: patientKeys.list(userId ?? '', filters),
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado.')
      const result = await patientsService.getPatients(userId, filters)
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
    enabled: !!userId,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Recent ────────────────────────────────────────────────────────────────────
export function useRecentPatients(limit = 5) {
  const { userId } = useSession()

  return useQuery({
    queryKey: patientKeys.recent(userId ?? ''),
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado.')
      const result = await patientsService.getRecentPatients(userId, limit)
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Single ────────────────────────────────────────────────────────────────────
export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: async () => {
      const result = await patientsService.getPatientById(id)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Create ────────────────────────────────────────────────────────────────────
export function useCreatePatient() {
  const qc = useQueryClient()
  const { userId } = useSession()

  return useMutation({
    mutationFn: async (data: Omit<PatientInsert, 'psychologist_id'>) => {
      if (!userId) throw new Error('Usuário não autenticado.')
      const result = await patientsService.createPatient({
        ...data,
        psychologist_id: userId,
      })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: patientKeys.lists() })
      void qc.invalidateQueries({ queryKey: patientKeys.recent(userId ?? '') })
    },
  })
}

// ─── Update ────────────────────────────────────────────────────────────────────
export function useUpdatePatient(id: string) {
  const qc = useQueryClient()
  const { userId } = useSession()

  return useMutation({
    mutationFn: async (data: PatientUpdate) => {
      const result = await patientsService.updatePatient(id, data)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: patientKeys.detail(id) })
      void qc.invalidateQueries({ queryKey: patientKeys.lists() })
      void qc.invalidateQueries({ queryKey: patientKeys.recent(userId ?? '') })
    },
  })
}

// ─── Delete ────────────────────────────────────────────────────────────────────
export function useDeletePatient() {
  const qc = useQueryClient()
  const { userId } = useSession()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await patientsService.deletePatient(id)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: patientKeys.lists() })
      void qc.invalidateQueries({ queryKey: patientKeys.recent(userId ?? '') })
    },
  })
}
