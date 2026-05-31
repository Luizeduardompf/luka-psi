import { Stack, Redirect } from 'expo-router'
import { useSessionStore } from '@/stores/session.store'
import { View, ActivityIndicator } from 'react-native'
import { theme } from '@/constants/theme'

export default function AuthLayout() {
  const { session, isInitialized } = useSessionStore()
  const isAuthenticated = !!session

  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
        }}
      >
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    )
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
    </Stack>
  )
}
