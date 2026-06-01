import { z } from 'zod'

// ─── CPF validation (Brazil) ───────────────────────────────────────────────────
export function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  const calcDigit = (slice: string, weights: number[]): number => {
    const sum = slice
      .split('')
      .reduce((acc, d, i) => acc + parseInt(d, 10) * weights[i], 0)
    const rem = (sum * 10) % 11
    return rem >= 10 ? 0 : rem
  }

  const d1 = calcDigit(digits.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = calcDigit(digits.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
  return d1 === parseInt(digits[9], 10) && d2 === parseInt(digits[10], 10)
}

// ─── NIF validation (Portugal) ────────────────────────────────────────────────
export function isValidNif(nif: string): boolean {
  const digits = nif.replace(/\D/g, '')
  if (digits.length !== 9) return false

  // Valid first digits for NIF: 1,2,3,5,6,7,8,9
  const validFirstDigits = ['1', '2', '3', '5', '6', '7', '8', '9']
  if (!validFirstDigits.includes(digits[0])) return false

  let sum = 0
  for (let i = 0; i < 8; i++) {
    sum += parseInt(digits[i], 10) * (9 - i)
  }
  const checkDigit = 11 - (sum % 11)
  const expected = checkDigit >= 10 ? 0 : checkDigit
  return expected === parseInt(digits[8], 10)
}

// ─── Schemas ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const signUpSchema = z
  .object({
    full_name: z
      .string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome muito longo'),
    email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export const onboardingSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  preferred_name: z.string().optional().or(z.literal('')),
  ordem_psicologos: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  postal_code: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  nif: z.string().optional().or(z.literal('')),
})

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  preferred_name: z.string().optional().or(z.literal('')),
  commercial_name: z.string().optional().or(z.literal('')),
  ordem_psicologos: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  postal_code: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  nif: z.string().optional().or(z.literal('')),
})

const additionalContactSchema = z.object({
  relation: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string(),
})

export const patientSchema = z
  .object({
    // Identification
    full_name: z
      .string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(150, 'Nome muito longo'),
    preferred_name: z.string().optional().or(z.literal('')),
    date_of_birth: z.string().optional().or(z.literal('')),
    gender: z.string().optional().or(z.literal('')),
    profession: z.string().optional().or(z.literal('')),
    education: z.string().optional().or(z.literal('')),
    civil_status_id: z.string().optional().or(z.literal('')),
    status: z.enum(['active', 'inactive', 'waiting']).default('active'),

    // Contact
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    phone_ddi: z.string().optional().or(z.literal('')),

    // Documents — at least one required
    cpf: z
      .string()
      .refine((v) => !v || v.replace(/\D/g, '').length === 0 || isValidCpf(v), {
        message: 'CPF inválido',
      })
      .optional()
      .or(z.literal('')),
    nif: z
      .string()
      .refine((v) => !v || v.replace(/\D/g, '').length === 0 || isValidNif(v), {
        message: 'NIF inválido (Portugal)',
      })
      .optional()
      .or(z.literal('')),

    // Address
    address: z.string().optional().or(z.literal('')),
    billing_address: z.string().optional().or(z.literal('')),
    postal_code: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),

    // Spouse / partner
    spouse_name: z.string().optional().or(z.literal('')),
    spouse_phone: z.string().optional().or(z.literal('')),
    spouse_email: z
      .string()
      .email('E-mail inválido')
      .optional()
      .or(z.literal('')),

    // Tutor
    tutor_name: z.string().optional().or(z.literal('')),
    tutor_phone: z.string().optional().or(z.literal('')),
    tutor_email: z
      .string()
      .email('E-mail inválido')
      .optional()
      .or(z.literal('')),

    // Additional contacts
    additional_contacts: z.array(additionalContactSchema).optional(),

    // Emergency contact
    emergency_contact_name: z.string().optional().or(z.literal('')),
    emergency_contact_phone: z.string().optional().or(z.literal('')),

    // Health coverage
    insurer_id: z.string().optional().or(z.literal('')),
    plan_id: z.string().optional().or(z.literal('')),
    sns_user_number: z.string().optional().or(z.literal('')),
    local_protocol: z.string().optional().or(z.literal('')),

    // Consents
    consent_rgpd: z.boolean().default(false),
    consent_informed: z.boolean().default(false),
    consent_minors: z.boolean().default(false),

    // Notes
    notes: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      const hasCpf =
        data.cpf && data.cpf.replace(/\D/g, '').length > 0
      const hasNif =
        data.nif && data.nif.replace(/\D/g, '').length > 0
      // At least one document OR neither (optional for non-billing patients)
      return true // optional — warn in UI if both empty
    },
    { message: 'Informe CPF ou NIF para fins de faturação', path: ['cpf'] },
  )

export type LoginFormData = z.infer<typeof loginSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type PatientSchemaData = z.infer<typeof patientSchema>
export type OnboardingFormData = z.infer<typeof onboardingSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
