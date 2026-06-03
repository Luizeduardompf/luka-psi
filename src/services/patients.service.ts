import { supabase } from './supabase'
import { formatSupabaseError } from '@/utils/errors'
import {
  Patient,
  PatientInsert,
  PatientUpdate,
  PatientFilters,
  ServiceResult,
} from '@/types/app.types'

export const patientsService = {
  async getPatients(
    psychologistId: string,
    filters?: PatientFilters,
  ): Promise<ServiceResult<Patient[]>> {
    try {
      let query = supabase
        .from('patients')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('created_at', { ascending: false })

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      // Search: name, phone, email, CPF, NIF, tutor name
      if (filters?.search) {
        const q = `%${filters.search.toLowerCase()}%`
        query = query.or(
          `full_name.ilike.${q},phone.ilike.${q},email.ilike.${q},document_number.ilike.${q},tutor_name.ilike.${q}`,
        )
      }

      const { data, error } = await query
      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as Patient[], error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async getPatientById(id: string): Promise<ServiceResult<Patient>> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as Patient, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async createPatient(
    patientData: PatientInsert,
  ): Promise<ServiceResult<Patient>> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData as never)
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as Patient, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async updatePatient(
    id: string,
    patientData: PatientUpdate,
  ): Promise<ServiceResult<Patient>> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(patientData as never)
        .eq('id', id)
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as Patient, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async deletePatient(id: string): Promise<ServiceResult<null>> {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id)

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async getRecentPatients(
    psychologistId: string,
    limit = 5,
  ): Promise<ServiceResult<Patient[]>> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as Patient[], error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },
}
