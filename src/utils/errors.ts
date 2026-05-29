import { AuthError, PostgrestError } from '@supabase/supabase-js'

// ─── Maps Supabase error codes / messages to PT-BR strings ────────────────────
export function formatSupabaseError(
  error: AuthError | PostgrestError | Error | unknown,
): string {
  if (!error) return 'Erro desconhecido.'

  const msg =
    (error as AuthError).message ??
    (error as PostgrestError).message ??
    String(error)

  // Auth errors
  if (msg.includes('Invalid login credentials'))
    return 'E-mail ou senha incorretos.'
  if (msg.includes('Email not confirmed'))
    return 'Confirme seu e-mail antes de entrar.'
  if (msg.includes('User already registered'))
    return 'Este e-mail já está cadastrado.'
  if (msg.includes('Password should be at least'))
    return 'A senha deve ter pelo menos 6 caracteres.'
  if (msg.includes('Unable to validate email address'))
    return 'Endereço de e-mail inválido.'
  if (msg.includes('Email rate limit exceeded'))
    return 'Muitas tentativas. Tente novamente em alguns minutos.'
  if (msg.includes('Token has expired') || msg.includes('token is expired'))
    return 'Sessão expirada. Faça login novamente.'
  if (msg.includes('Network request failed') || msg.includes('fetch'))
    return 'Sem conexão com a internet. Verifique sua rede.'

  // Postgres / RLS errors
  if (msg.includes('duplicate key')) return 'Registro já existe.'
  if (msg.includes('violates row-level security'))
    return 'Acesso negado.'
  if (msg.includes('violates foreign key'))
    return 'Referência inválida no banco de dados.'
  if (msg.includes('value too long'))
    return 'Um ou mais campos excedem o tamanho máximo permitido.'

  // Fallback
  return 'Ocorreu um erro inesperado. Tente novamente.'
}
