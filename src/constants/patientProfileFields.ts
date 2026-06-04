/**
 * Catálogo de campos do paciente mapeáveis em perguntas de formulário.
 * Usado no editor de formulários e no renderizador público.
 */

export type ProfileFieldKey =
  // Identificação
  | 'full_name'
  | 'preferred_name'
  | 'date_of_birth'
  | 'gender_id'
  | 'profession'
  | 'education'
  | 'civil_status_id'
  | 'status'
  // Contacto
  | 'email'
  | 'phone_ddi'
  | 'phone'
  // Documento
  | 'document_type'
  | 'document_number'
  // Morada
  | 'address'
  | 'billing_address'
  | 'postal_code'
  | 'city'
  | 'country_id'
  // Cônjuge
  | 'spouse_name'
  | 'spouse_phone_ddi'
  | 'spouse_phone'
  | 'spouse_email'
  // Responsável / Tutor
  | 'tutor_name'
  | 'tutor_phone_ddi'
  | 'tutor_phone'
  | 'tutor_email'
  // Contacto de emergência
  | 'emergency_contact_name'
  | 'emergency_contact_phone_ddi'
  | 'emergency_contact_phone'
  // Cobertura
  | 'insurer_id'
  | 'plan_name'
  | 'sns_user_number'
  | 'local_protocol'
  // Local de prática
  | 'practice_location_id'
  // Consentimentos
  | 'consent_rgpd'
  | 'consent_informed'
  | 'consent_minors'
  // Observações
  | 'notes'

export type ProfileFieldInputType = 'text' | 'date' | 'dropdown' | 'boolean' | 'long_text'

export interface ProfileFieldDef {
  key: ProfileFieldKey
  label: string
  section: string
  inputType: ProfileFieldInputType
  /**
   * Quando presente, as opções de lookup devem ser buscadas no banco
   * e incluídas no snapshot do formulário em profile_field_options[key].
   * Valor = nome da tabela Supabase.
   */
  lookupTable?: 'genders' | 'civil_statuses' | 'countries' | 'insurers' | 'practice_locations'
  /**
   * Quando presente, as opções vêm de uma constante local (sem query ao banco).
   * Valor = identificador da constante em app.types.ts.
   */
  lookupConstant?: 'EDUCATION_OPTIONS' | 'STATUS_OPTIONS' | 'DOCUMENT_TYPE_OPTIONS'
}

export const PROFILE_FIELDS: ProfileFieldDef[] = [
  // ── Identificação ────────────────────────────────────────────────────────────
  { key: 'full_name',       label: 'Nome completo',       section: 'Identificação', inputType: 'text' },
  { key: 'preferred_name',  label: 'Nome preferencial',   section: 'Identificação', inputType: 'text' },
  { key: 'date_of_birth',   label: 'Data de nascimento',  section: 'Identificação', inputType: 'date' },
  { key: 'gender_id',       label: 'Género / Sexo',       section: 'Identificação', inputType: 'dropdown', lookupTable: 'genders' },
  { key: 'profession',      label: 'Profissão',           section: 'Identificação', inputType: 'text' },
  { key: 'education',       label: 'Escolaridade',        section: 'Identificação', inputType: 'dropdown', lookupConstant: 'EDUCATION_OPTIONS' },
  { key: 'civil_status_id', label: 'Estado civil',        section: 'Identificação', inputType: 'dropdown', lookupTable: 'civil_statuses' },
  { key: 'status',          label: 'Status do paciente',  section: 'Identificação', inputType: 'dropdown', lookupConstant: 'STATUS_OPTIONS' },

  // ── Contacto ─────────────────────────────────────────────────────────────────
  { key: 'email',     label: 'E-mail',           section: 'Contacto', inputType: 'text' },
  { key: 'phone_ddi', label: 'DDI (telefone)',    section: 'Contacto', inputType: 'text' },
  { key: 'phone',     label: 'Telefone',          section: 'Contacto', inputType: 'text' },

  // ── Documento ────────────────────────────────────────────────────────────────
  { key: 'document_type',   label: 'Tipo de documento',   section: 'Documento', inputType: 'dropdown', lookupConstant: 'DOCUMENT_TYPE_OPTIONS' },
  { key: 'document_number', label: 'Número do documento', section: 'Documento', inputType: 'text' },

  // ── Morada ───────────────────────────────────────────────────────────────────
  { key: 'address',         label: 'Morada',              section: 'Morada', inputType: 'text' },
  { key: 'billing_address', label: 'Morada de faturação', section: 'Morada', inputType: 'text' },
  { key: 'postal_code',     label: 'Código postal',       section: 'Morada', inputType: 'text' },
  { key: 'city',            label: 'Localidade',          section: 'Morada', inputType: 'text' },
  { key: 'country_id',      label: 'País',                section: 'Morada', inputType: 'dropdown', lookupTable: 'countries' },

  // ── Cônjuge ──────────────────────────────────────────────────────────────────
  { key: 'spouse_name',      label: 'Nome do cônjuge',        section: 'Cônjuge', inputType: 'text' },
  { key: 'spouse_phone_ddi', label: 'DDI (cônjuge)',          section: 'Cônjuge', inputType: 'text' },
  { key: 'spouse_phone',     label: 'Telefone do cônjuge',    section: 'Cônjuge', inputType: 'text' },
  { key: 'spouse_email',     label: 'Email do cônjuge',       section: 'Cônjuge', inputType: 'text' },

  // ── Responsável / Tutor ──────────────────────────────────────────────────────
  { key: 'tutor_name',      label: 'Nome do responsável',     section: 'Responsável', inputType: 'text' },
  { key: 'tutor_phone_ddi', label: 'DDI (responsável)',       section: 'Responsável', inputType: 'text' },
  { key: 'tutor_phone',     label: 'Telefone do responsável', section: 'Responsável', inputType: 'text' },
  { key: 'tutor_email',     label: 'Email do responsável',    section: 'Responsável', inputType: 'text' },

  // ── Contacto de emergência ───────────────────────────────────────────────────
  { key: 'emergency_contact_name',      label: 'Nome (emergência)',     section: 'Emergência', inputType: 'text' },
  { key: 'emergency_contact_phone_ddi', label: 'DDI (emergência)',      section: 'Emergência', inputType: 'text' },
  { key: 'emergency_contact_phone',     label: 'Telefone (emergência)', section: 'Emergência', inputType: 'text' },

  // ── Cobertura / Protocolo ────────────────────────────────────────────────────
  { key: 'insurer_id',    label: 'Seguradora',      section: 'Cobertura', inputType: 'dropdown', lookupTable: 'insurers' },
  { key: 'plan_name',     label: 'Plano',           section: 'Cobertura', inputType: 'text' },
  { key: 'sns_user_number', label: 'Nº utente SNS', section: 'Cobertura', inputType: 'text' },
  { key: 'local_protocol', label: 'Protocolo local', section: 'Cobertura', inputType: 'text' },

  // ── Local de prática ─────────────────────────────────────────────────────────
  { key: 'practice_location_id', label: 'Local de prática', section: 'Local de prática', inputType: 'dropdown', lookupTable: 'practice_locations' },

  // ── Consentimentos ───────────────────────────────────────────────────────────
  { key: 'consent_rgpd',     label: 'Consentimento RGPD/LGPD',           section: 'Consentimentos', inputType: 'boolean' },
  { key: 'consent_informed', label: 'Consentimento informado',            section: 'Consentimentos', inputType: 'boolean' },
  { key: 'consent_minors',   label: 'Consentimento intervenção menores',  section: 'Consentimentos', inputType: 'boolean' },

  // ── Observações ──────────────────────────────────────────────────────────────
  { key: 'notes', label: 'Notas', section: 'Observações', inputType: 'long_text' },
]

/** Lookup rápido por key */
export const PROFILE_FIELD_BY_KEY = Object.fromEntries(
  PROFILE_FIELDS.map((f) => [f.key, f])
) as Record<ProfileFieldKey, ProfileFieldDef>

/** Campos agrupados por seção */
export const PROFILE_FIELDS_BY_SECTION = PROFILE_FIELDS.reduce<Record<string, ProfileFieldDef[]>>(
  (acc, field) => {
    if (!acc[field.section]) acc[field.section] = []
    acc[field.section].push(field)
    return acc
  },
  {}
)

/** Opções estáticas para campos com lookupConstant */
export const PROFILE_FIELD_CONSTANT_OPTIONS: Record<string, { label: string; value: string }[]> = {
  EDUCATION_OPTIONS: [
    { label: 'Sem indicação', value: '' },
    { label: 'Ensino fundamental', value: 'elementary' },
    { label: 'Ensino médio', value: 'high_school' },
    { label: 'Ensino superior incompleto', value: 'college_incomplete' },
    { label: 'Ensino superior completo', value: 'college' },
    { label: 'Pós-graduação', value: 'postgrad' },
    { label: 'Mestrado', value: 'masters' },
    { label: 'Doutorado', value: 'phd' },
  ],
  STATUS_OPTIONS: [
    { label: 'Ativo', value: 'active' },
    { label: 'Inativo', value: 'inactive' },
    { label: 'Lista de espera', value: 'waiting' },
  ],
  DOCUMENT_TYPE_OPTIONS: [
    { label: 'CPF (Brasil)', value: 'cpf' },
    { label: 'NIF (Portugal)', value: 'nif' },
    { label: 'Outro', value: 'other' },
  ],
}
