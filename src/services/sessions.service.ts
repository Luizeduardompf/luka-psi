import { supabase } from './supabase'
import { formatSupabaseError } from '@/utils/errors'
import {
  Session,
  SessionInsert,
  SessionUpdate,
  SessionFilters,
  ServiceResult,
} from '@/types/app.types'

export const sessionsService = {
  async getSessionsByPatient(
    patientId: string,
  ): Promise<ServiceResult<Session[]>> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false })
        .order('start_time', { ascending: false })

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as Session[], error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async getSessionsForRange(
    psychologistId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<ServiceResult<Session[]>> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .gte('date', dateFrom)
        .lte('date', dateTo)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as Session[], error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async getSessionsForDay(
    psychologistId: string,
    date: string,
  ): Promise<ServiceResult<Session[]>> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .eq('date', date)
        .order('start_time', { ascending: true })

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as Session[], error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async createSession(
    sessionData: SessionInsert,
  ): Promise<ServiceResult<Session>> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionData as never)
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as Session, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async updateSession(
    id: string,
    sessionData: SessionUpdate,
  ): Promise<ServiceResult<Session>> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update(sessionData as never)
        .eq('id', id)
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as Session, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async deleteSession(id: string): Promise<ServiceResult<null>> {
    try {
      const { error } = await supabase.from('sessions').delete().eq('id', id)
      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async getNextSessionNumber(
    psychologistId: string,
    patientId: string,
  ): Promise<number> {
    try {
      const { data } = await supabase
        .from('sessions')
        .select('session_number')
        .eq('psychologist_id', psychologistId)
        .eq('patient_id', patientId)
        .order('session_number', { ascending: false })
        .limit(1)
        .single()

      return (((data as { session_number?: number | null } | null)?.session_number ?? 0)) + 1
    } catch {
      return 1
    }
  },
}
