import { z } from 'zod'

// ─── CPF validation ────────────────────────────────────────────────────────────
function isValidCpf(cpf: string): boolean {
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

// ─── Schemas ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const signUpSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  email: z
    .string()
    .min(1, 'E-mail obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

export const patientSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(150, 'Nome muito longo'),
  email: z
    .string()
    .email('E-mail inválido')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .optional()
    .or(z.literal('')),
  cpf: z
    .string()
    .refine((v) => !v || v.replace(/\D/g, '').length === 0 || isValidCpf(v), {
      message: 'CPF inválido',
    })
    .optional()
    .or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say', ''])
    .optional(),
  status: z.enum(['active', 'inactive', 'waiting']).default('active'),
  notes: z.string().optional().or(z.literal('')),
  emergency_contact_name: z.string().optional().or(z.literal('')),
  emergency_contact_phone: z.string().optional().or(z.literal('')),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type PatientSchemaData = z.infer<typeof patientSchema>
