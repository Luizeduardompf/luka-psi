import { Tables, TablesInsert, TablesUpdate } from './database.types'

// ─── Domain aliases ────────────────────────────────────────────────────────────
export type Profile = Tables<'profiles'>
export type Patient = Tables<'patients'>
export type PatientInsert = TablesInsert<'patients'>
export type PatientUpdate = TablesUpdate<'patients'>

// ─── Patient filters ───────────────────────────────────────────────────────────
export type PatientStatusFilter = 'all' | 'active' | 'inactive' | 'waiting'

export interface PatientFilters {
  status?: PatientStatusFilter
  search?: string
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}

// ─── UI helpers ────────────────────────────────────────────────────────────────
export type PatientGender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type PatientStatus = 'active' | 'inactive' | 'waiting'

export interface SelectOption<T extends string = string> {
  label: string
  value: T
}

export const GENDER_OPTIONS: SelectOption<PatientGender>[] = [
  { label: 'Masculino', value: 'male' },
  { label: 'Feminino', value: 'female' },
  { label: 'Outro', value: 'other' },
  { label: 'Prefiro não informar', value: 'prefer_not_to_say' },
]

export const STATUS_OPTIONS: SelectOption<PatientStatus>[] = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' },
  { label: 'Lista de espera', value: 'waiting' },
]

// ─── Form data ─────────────────────────────────────────────────────────────────
export interface PatientFormData {
  full_name: string
  email: string
  phone: string
  cpf: string
  date_of_birth: string
  gender: PatientGender | ''
  status: PatientStatus
  notes: string
  emergency_contact_name: string
  emergency_contact_phone: string
}

// ─── API responses ─────────────────────────────────────────────────────────────
export interface ServiceResult<T> {
  data: T | null
  error: string | null
}
