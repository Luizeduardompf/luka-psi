import React from 'react'
import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/constants/theme'

export default function AgendaScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
      }}
    >
      <View
        style={{
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
        }}
      >
        <Text
          style={{
            ...theme.typography.h1,
            color: theme.colors.text.primary,
          }}
        >
          Agenda
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.md,
          paddingBottom: 80,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: theme.radius.xl,
            backgroundColor: theme.colors.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={36}
            color={theme.colors.primary}
          />
        </View>
        <Text
          style={{
            ...theme.typography.h3,
            color: theme.colors.text.primary,
          }}
        >
          Em breve
        </Text>
        <Text
          style={{
            ...theme.typography.body,
            color: theme.colors.text.tertiary,
            textAlign: 'center',
            paddingHorizontal: 48,
          }}
        >
          A agenda de consultas está sendo desenvolvida e estará disponível em breve.
        </Text>
      </View>
    </View>
  )
}
