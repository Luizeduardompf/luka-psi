import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(
  dateStr: string | null | undefined,
  pattern = 'dd/MM/yyyy',
): string {
  if (!dateStr) return '—'
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return '—'
    return format(date, pattern, { locale: ptBR })
  } catch {
    return '—'
  }
}

export function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/** Formata documento conforme tipo */
export function formatDocument(number: string | null | undefined, type: string | null | undefined): string {
  if (!number) return '—'
  if (type === 'cpf') return formatCpf(number)
  if (type === 'nif') {
    const d = number.replace(/\D/g, '')
    if (d.length === 9) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
  }
  return number
}

/** Máscara de documento: aplica formato conforme tipo selecionado */
export function maskDocument(value: string, type: string): string {
  const digits = value.replace(/\D/g, '')
  if (type === 'cpf') {
    const d = digits.slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
  }
  if (type === 'nif') {
    const d = digits.slice(0, 9)
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
  }
  return digits
}

// Sem máscara — retorna o valor como está (campo livre: dígitos, espaços e pontos)
export function formatPhone(phone: string): string {
  return phone
}

// Sanitiza input de telefone: só permite dígitos, espaços e pontos
export function sanitizePhone(value: string): string {
  return value.replace(/[^\d\s.+]/g, '')
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

// Sem máscara — só filtra caracteres inválidos
export function maskPhone(value: string): string {
  return sanitizePhone(value)
}

export function maskNif(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

export function maskPostalCode(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function greetingByHour(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Deterministic portrait URL from randomuser.me based on name hash + gender */
export function getPatientAvatarUrl(
  name: string,
  gender?: string | null,
): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = Math.abs(hash) % 70
  const type =
    gender === 'F' || gender === 'female' || gender === 'feminino'
      ? 'women'
      : 'men'
  return `https://randomuser.me/api/portraits/${type}/${idx}.jpg`
}
