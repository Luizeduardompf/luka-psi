export const config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },
  app: {
    env: (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as
      | 'development'
      | 'staging'
      | 'production',
    name: 'Luka',
    version: '1.0.0',
  },
  storage: {
    sessionKey: 'luka_session',
  },
  query: {
    staleTime: 1000 * 60 * 5,  // 5 min
    gcTime: 1000 * 60 * 30,    // 30 min
  },
  splash: {
    duration: 2500,
  },
} as const
