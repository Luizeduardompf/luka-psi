// ─── Enums ────────────────────────────────────────────────────────────────────

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multi_choice'
  | 'dropdown'
  | 'date'
  | 'number'
  | 'scale'
  | 'boolean'
  | 'profile_field'

export type SubmissionStatus = 'pending' | 'in_progress' | 'completed' | 'expired'

// ─── Database rows ────────────────────────────────────────────────────────────

export interface FormTemplate {
  id: string
  psychologist_id: string | null
  title: string
  description: string | null
  send_message: string | null
  is_system: boolean
  is_archived: boolean
  cloned_from_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface FormSection {
  id: string
  template_id: string
  title: string
  description: string | null
  sort_order: number
  created_at: string
}

export interface FormQuestion {
  id: string
  template_id: string
  section_id: string | null
  type: QuestionType
  title: string
  description: string | null
  help_text: string | null
  is_required: boolean
  sort_order: number
  scale_min: number
  scale_max: number
  scale_step: number
  /** Chave do campo do paciente mapeado. Presente apenas quando type === 'profile_field'. */
  profile_field_key?: string | null
  created_at: string
}

export interface FormQuestionOption {
  id: string
  question_id: string
  label: string
  sort_order: number
  created_at?: string
}

export interface FormSubmission {
  id: string
  psychologist_id: string
  patient_id: string
  template_id: string | null
  token: string
  access_password: string
  expires_at: string | null
  status: SubmissionStatus
  custom_message: string | null
  first_opened_at: string | null
  last_opened_at: string | null
  completed_at: string | null
  snapshot: FormSnapshot
  created_at: string
  updated_at: string
}

export interface FormResponse {
  id: string
  submission_id: string
  question_id: string
  answer_text: string | null
  answer_options: string[] | null
  answer_number: number | null
  answer_date: string | null
  answer_boolean: boolean | null
  created_at: string
  updated_at: string
}

export interface FormAuditLog {
  id: string
  submission_id: string
  event: string
  metadata: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// ─── Snapshot (imutável) ──────────────────────────────────────────────────────

export interface SnapshotOption {
  id: string
  label: string
  sort_order: number
}

export interface SnapshotQuestion {
  id: string
  section_id: string | null
  type: QuestionType
  title: string
  description: string | null
  help_text: string | null
  is_required: boolean
  sort_order: number
  scale_min: number
  scale_max: number
  scale_step: number
  options: SnapshotOption[]
  /** Chave do campo do paciente mapeado. Presente apenas quando type === 'profile_field'. */
  profile_field_key?: string | null
}

export interface SnapshotSection {
  id: string
  title: string
  description: string | null
  sort_order: number
}

export interface FormSnapshot {
  template_id: string | null
  template_title: string
  template_description: string | null
  sections: SnapshotSection[]
  questions: SnapshotQuestion[]
  custom_message: string | null
  expires_at: string | null
  snapshotted_at: string
  /**
   * Opções de lookup para campos de perfil com dropdown.
   * Chave = profile_field_key (ex: 'gender_id'), valor = lista de { id, label }.
   * Populado no momento do envio do formulário.
   */
  profile_field_options?: Record<string, { id: string; label: string }[]>
}

// ─── Rich types (com joins) ───────────────────────────────────────────────────

export interface FormTemplateWithDetails extends FormTemplate {
  sections: FormSectionWithQuestions[]
}

export interface FormSectionWithQuestions extends FormSection {
  questions: FormQuestionWithOptions[]
}

export interface FormQuestionWithOptions extends FormQuestion {
  options: FormQuestionOption[]
}

export interface FormSubmissionWithDetails extends FormSubmission {
  patient_name?: string
  patient_email?: string | null
  template_title?: string | null
  responses?: FormResponse[]
  psychologist?: {
    full_name: string
    logo_url: string | null
  }
}

// ─── Inputs ───────────────────────────────────────────────────────────────────

export interface CreateFormTemplateInput {
  title: string
  description?: string | null
  send_message?: string | null
}

export interface UpdateFormTemplateInput {
  title?: string
  description?: string | null
  send_message?: string | null
  is_archived?: boolean
}

export interface CreateSectionInput {
  template_id: string
  title: string
  description?: string | null
  sort_order?: number
}

export interface CreateQuestionInput {
  template_id: string
  section_id?: string | null
  type: QuestionType
  title: string
  description?: string | null
  help_text?: string | null
  is_required?: boolean
  sort_order?: number
  scale_min?: number
  scale_max?: number
  scale_step?: number
  /** Chave do campo do paciente. Obrigatório quando type === 'profile_field'. */
  profile_field_key?: string | null
}

export interface SendFormInput {
  patient_id: string
  template_id: string
  access_password: string
  expires_at?: string | null
  custom_message?: string | null
  /** Customizações ad-hoc para este envio (seções e perguntas extras) */
  extra_sections?: Array<{
    title: string
    description?: string | null
    questions: Array<Omit<CreateQuestionInput, 'template_id' | 'section_id'>>
  }>
}

export interface SubmitResponseInput {
  submission_id: string
  question_id: string
  answer_text?: string | null
  answer_options?: string[] | null
  answer_number?: number | null
  answer_date?: string | null
  answer_boolean?: boolean | null
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_text: 'Resposta curta',
  long_text: 'Resposta longa',
  single_choice: 'Escolha única',
  multi_choice: 'Múltipla escolha',
  dropdown: 'Lista suspensa',
  date: 'Data',
  number: 'Número',
  scale: 'Escala',
  boolean: 'Sim / Não',
  profile_field: 'Dado do perfil',
}

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'Não aberto',
  in_progress: 'Em preenchimento',
  completed: 'Concluído',
  expired: 'Expirado',
}

export const SUBMISSION_STATUS_COLORS: Record<SubmissionStatus, string> = {
  pending: '#6B7280',
  in_progress: '#F59E0B',
  completed: '#10B981',
  expired: '#EF4444',
}

export const DEFAULT_SEND_MESSAGE = `Olá <<nome_paciente>>, tudo bem?

<<nome_psicologo>> enviou um formulário para você preencher.

📋 Formulário: <<nome_formulario>>
🔗 Link de acesso: <<link>>
📅 Prazo: <<data_limite>>

Preencha com calma e honestidade. Suas respostas são confidenciais.`

// ─── ServiceResult ────────────────────────────────────────────────────────────
export interface ServiceResult<T> {
  data: T | null
  error: string | null
}
