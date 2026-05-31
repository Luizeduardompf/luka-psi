import { Stack } from 'expo-router'
import { theme } from '@/constants/theme'

export default function FormsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[templateId]" />
      <Stack.Screen name="send" />
    </Stack>
  )
}
