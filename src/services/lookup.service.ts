import { supabase } from './supabase'
import { formatSupabaseError } from '@/utils/errors'
import { CivilStatus, Insurer, Plan, ServiceResult } from '@/types/app.types'

export const lookupService = {
  // ─── Civil Statuses ──────────────────────────────────────────
  async getCivilStatuses(psychologistId: string): Promise<ServiceResult<CivilStatus[]>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('civil_statuses')
        .select('*')
        .eq('psychologist_id', psychologistId)
        .order('sort_order', { ascending: true })
      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as CivilStatus[], error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async createCivilStatus(psychologistId: string, name: string): Promise<ServiceResult<CivilStatus>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('civil_statuses')
        .insert({ psychologist_id: psychologistId, name })
        .select()
        .single()
      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as CivilStatus, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async updateCivilStatus(id: string, name: string): Promise<ServiceResult<CivilStatus>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('civil_statuses')
        .update({ name })
        .eq('id', id)
        .select()
        .single()
      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as CivilStatus, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async deleteCivilStatus(id: string): Promise<ServiceResult<null>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('civil_statuses').delete().eq('id', id)
      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // ─── Insurers ────────────────────────────────────────────────
  async getInsurers(): Promise<ServiceResult<Insurer[]>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('insurers')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as Insurer[], error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // ─── Plans ───────────────────────────────────────────────────
  async getPlans(insurerId?: string): Promise<ServiceResult<Plan[]>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true })

      if (insurerId) {
        query = query.or(`insurer_id.eq.${insurerId},insurer_id.is.null`)
      }

      const { data, error } = await query
      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as Plan[], error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },
}
