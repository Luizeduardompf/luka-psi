import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { sessionsService } from '@/services/sessions.service'
import { useSession } from './useSession'
import { SessionInsert, SessionUpdate } from '@/types/app.types'

// ─── Query keys ────────────────────────────────────────────────────────────────
export const sessionKeys = {
  all: ['sessions'] as const,
  byPatient: (patientId: string) =>
    [...sessionKeys.all, 'patient', patientId] as const,
  forDay: (userId: string, date: string) =>
    [...sessionKeys.all, 'day', userId, date] as const,
  forRange: (userId: string, from: string, to: string) =>
    [...sessionKeys.all, 'range', userId, from, to] as const,
}

// ─── Sessions by patient ───────────────────────────────────────────────────────
export function useSessionsByPatient(patientId: string) {
  return useQuery({
    queryKey: sessionKeys.byPatient(patientId),
    queryFn: async () => {
      const result = await sessionsService.getSessionsByPatient(patientId)
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 2,
  })
}

// ─── Sessions for a specific day ───────────────────────────────────────────────
export function useSessionsForDay(date: string) {
  const { userId } = useSession()

  return useQuery({
    queryKey: sessionKeys.forDay(userId ?? '', date),
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado.')
      const result = await sessionsService.getSessionsForDay(userId, date)
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
    enabled: !!userId && !!date,
    staleTime: 1000 * 60 * 2,
  })
}

// ─── Sessions for a date range ─────────────────────────────────────────────────
export function useSessionsForRange(dateFrom: string, dateTo: string) {
  const { userId } = useSession()

  return useQuery({
    queryKey: sessionKeys.forRange(userId ?? '', dateFrom, dateTo),
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado.')
      const result = await sessionsService.getSessionsForRange(
        userId,
        dateFrom,
        dateTo,
      )
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
    enabled: !!userId && !!dateFrom && !!dateTo,
    staleTime: 1000 * 60 * 2,
  })
}

// ─── Create ────────────────────────────────────────────────────────────────────
export function useCreateSession() {
  const qc = useQueryClient()
  const { userId } = useSession()

  return useMutation({
    mutationFn: async (data: Omit<SessionInsert, 'psychologist_id'>) => {
      if (!userId) throw new Error('Usuário não autenticado.')

      // Auto-assign session number
      const sessionNumber = await sessionsService.getNextSessionNumber(
        userId,
        data.patient_id,
      )

      const result = await sessionsService.createSession({
        ...data,
        psychologist_id: userId,
        session_number: sessionNumber,
      })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: sessionKeys.all })
      void qc.invalidateQueries({
        queryKey: sessionKeys.byPatient(vars.patient_id),
      })
    },
  })
}

// ─── Update ────────────────────────────────────────────────────────────────────
export function useUpdateSession(id: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: SessionUpdate) => {
      const result = await sessionsService.updateSession(id, data)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sessionKeys.all })
    },
  })
}

// ─── Delete ────────────────────────────────────────────────────────────────────
export function useDeleteSession() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await sessionsService.deleteSession(id)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sessionKeys.all })
    },
  })
}
