import { Tabs, Redirect, useSegments } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSessionStore } from '@/stores/session.store'
import { theme } from '@/constants/theme'

export default function AppLayout() {
  const { session, profile, isInitialized } = useSessionStore()
  const isAuthenticated = !!session
  // useSegments returns the active URL segments.
  // When deep-linking to /forms/[token], segments[0] = 'forms' (not '(app)'),
  // so we skip the auth redirect and let the public route render.
  const segments = useSegments()
  const isInAppGroup = segments[0] === '(app)'

  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    )
  }

  if (!isAuthenticated && isInAppGroup) {
    return <Redirect href="/(auth)/splash" />
  }

  if (!isAuthenticated) {
    // Background-mounted for a public route — render nothing
    return null
  }

  // First login: redirect to onboarding
  if (session && profile && !profile.onboarding_completed) {
    return <Redirect href="/(auth)/onboarding" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Pacientes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="forms"
        options={{
          title: 'Formularios',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configuracoes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
