import { Stack } from 'expo-router'
import { theme } from '@/constants/theme'

export default function PublicFormsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="[token]" />
    </Stack>
  )
}
