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

  /**
   * Busca as origens de campos preenchidos via formulário para um paciente.
   * Retorna um Record<fieldKey, { submission_id, filled_at }>.
   */
  async getPatientFieldSources(
    patientId: string,
  ): Promise<ServiceResult<Record<string, { submission_id: string | null; filled_at: string }>>> {
    try {
      const { data, error } = await supabase
        .from('patient_field_sources')
        .select('field_key, submission_id, filled_at')
        .eq('patient_id', patientId)

      if (error) return { data: null, error: formatSupabaseError(error) }

      const result: Record<string, { submission_id: string | null; filled_at: string }> = {}
      for (const row of (data ?? []) as { field_key: string; submission_id: string | null; filled_at: string }[]) {
        result[row.field_key] = { submission_id: row.submission_id, filled_at: row.filled_at }
      }

      return { data: result, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  /**
   * Remove as flags de origem para os campos que o psicólogo editou manualmente.
   * Chamado após updatePatient para limpar os indicativos dos campos alterados.
   */
  async clearPatientFieldSources(
    patientId: string,
    fieldKeys: string[],
  ): Promise<ServiceResult<null>> {
    if (fieldKeys.length === 0) return { data: null, error: null }
    try {
      const { error } = await supabase
        .from('patient_field_sources')
        .delete()
        .eq('patient_id', patientId)
        .in('field_key', fieldKeys)

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },
}
