import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { Gender } from '@/types/app.types'

export function useGenders() {
  return useQuery<Gender[]>({
    queryKey: ['genders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genders')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      if (error) throw error
      return data as Gender[]
    },
    staleTime: Infinity, // genders não mudam em runtime
  })
}

/** Retorna o tratamento adequado (Dr./Dra./Dr(a).) dado um gender_id e a lista de genders */
export function getPronounTreatment(
  genders: Gender[] | undefined,
  genderId: string | null | undefined,
): string {
  if (!genders || !genderId) return 'Dr(a).'
  return genders.find((g) => g.id === genderId)?.pronoun_treatment ?? 'Dr(a).'
}
