import { Tabs, Redirect } from 'expo-router'
import { StackActions } from '@react-navigation/native'
import { View, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useSessionStore } from '@/stores/session.store'
import { theme } from '@/constants/theme'

/**
 * Comportamento standard (Instagram, Gmail, etc.):
 * - Tap no tab já focado → popToTop (volta para a raiz do stack)
 * - Tap num tab diferente → restaura o último estado do stack (tela onde estava)
 * O estado local da tela index (ex: search filter) é preservado pois ela nunca é desmontada.
 */
function makeTabResetListener(_tabName: string) {
  return ({ navigation, route }: { navigation: any; route: any }) => ({
    tabPress: (e: any) => {
      const state = navigation.getState()
      const isFocused = state?.routes?.[state.index]?.name === route.name
      const tabRoute = state?.routes?.find((r: any) => r.name === route.name)
      if (isFocused && tabRoute?.state && (tabRoute.state.index ?? 0) > 0) {
        e.preventDefault()
        navigation.dispatch({
          ...StackActions.popToTop(),
          target: tabRoute.state.key,
        })
      }
    },
  })
}

export default function AppLayout() {
  const { session, profile, isInitialized } = useSessionStore()
  const insets = useSafeAreaInsets()
  const isAuthenticated = !!session

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

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/splash" />
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
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          ...theme.typography.caption,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
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
        listeners={makeTabResetListener('patients')}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
        listeners={makeTabResetListener('agenda')}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" size={size} color={color} />
          ),
        }}
        listeners={makeTabResetListener('menu')}
      />
      {/* Hidden tabs - accessible via navigation but not shown in tab bar */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="forms"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}
