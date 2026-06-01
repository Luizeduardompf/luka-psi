import { Tables, TablesInsert, TablesUpdate, AdditionalContact } from './database.types'

// ─── Domain aliases ────────────────────────────────────────────────────────────
export type Profile = Tables<'profiles'>
export type Gender = Tables<'genders'>
export type Patient = Tables<'patients'>
export type PatientInsert = TablesInsert<'patients'>
export type PatientUpdate = TablesUpdate<'patients'>
export type CivilStatus = Tables<'civil_statuses'>
export type Insurer = Tables<'insurers'>
export type Plan = Tables<'plans'>
export type Session = Tables<'sessions'>
export type SessionInsert = TablesInsert<'sessions'>
export type SessionUpdate = TablesUpdate<'sessions'>
export type { AdditionalContact }

// ─── Session types ─────────────────────────────────────────────────────────────
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'
export type SessionType = 'presencial' | 'online'
export type PaymentStatus = 'pending' | 'paid' | 'waived'

export const SESSION_STATUS_OPTIONS: SelectOption<SessionStatus>[] = [
  { label: 'Agendada', value: 'scheduled' },
  { label: 'Realizada', value: 'completed' },
  { label: 'Cancelada', value: 'cancelled' },
  { label: 'Faltou', value: 'no_show' },
]

export const SESSION_TYPE_OPTIONS: SelectOption<SessionType>[] = [
  { label: 'Presencial', value: 'presencial' },
  { label: 'Online', value: 'online' },
]

export const PAYMENT_STATUS_OPTIONS: SelectOption<PaymentStatus>[] = [
  { label: 'Pendente', value: 'pending' },
  { label: 'Pago', value: 'paid' },
  { label: 'Isento', value: 'waived' },
]

export interface SessionFilters {
  patientId?: string
  dateFrom?: string
  dateTo?: string
  status?: SessionStatus
}

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
export type PatientStatus = 'active' | 'inactive' | 'waiting'

export interface SelectOption<T extends string = string> {
  label: string
  value: T
}

export const GENDER_OPTIONS: SelectOption[] = [
  { label: 'Sem indicação', value: '' },
  { label: 'Feminino (cisgênero)', value: 'female_cis' },
  { label: 'Masculino (cisgênero)', value: 'male_cis' },
  { label: 'Feminino (transgênero)', value: 'female_trans' },
  { label: 'Masculino (transgênero)', value: 'male_trans' },
  { label: 'Não binário', value: 'non_binary' },
  { label: 'Prefiro não informar', value: 'prefer_not_to_say' },
]

export const STATUS_OPTIONS: SelectOption<PatientStatus>[] = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' },
  { label: 'Lista de espera', value: 'waiting' },
]

export const EDUCATION_OPTIONS: SelectOption[] = [
  { label: 'Sem indicação', value: '' },
  { label: 'Ensino fundamental', value: 'elementary' },
  { label: 'Ensino médio', value: 'high_school' },
  { label: 'Ensino superior incompleto', value: 'college_incomplete' },
  { label: 'Ensino superior completo', value: 'college' },
  { label: 'Pós-graduação', value: 'postgrad' },
  { label: 'Mestrado', value: 'masters' },
  { label: 'Doutorado', value: 'phd' },
]

// ─── API responses ─────────────────────────────────────────────────────────────
export interface ServiceResult<T> {
  data: T | null
  error: string | null
}
