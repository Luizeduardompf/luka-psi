import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { config } from '@/constants/config'
import { Database } from '@/types/database.types'

// ─── Storage adapter: SecureStore on native, localStorage on web ───────────────
const ExpoSecureStoreAdapter = Platform.OS === 'web'
  ? {
      getItem: (key: string): Promise<string | null> =>
        Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: string): Promise<void> => {
        localStorage.setItem(key, value)
        return Promise.resolve()
      },
      removeItem: (key: string): Promise<void> => {
        localStorage.removeItem(key)
        return Promise.resolve()
      },
    }
  : {
      getItem: (key: string): Promise<string | null> =>
        SecureStore.getItemAsync(key),
      setItem: (key: string, value: string): Promise<void> =>
        SecureStore.setItemAsync(key, value),
      removeItem: (key: string): Promise<void> =>
        SecureStore.deleteItemAsync(key),
    }

if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error(
    '[Supabase] EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be set.',
  )
}

export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
)
