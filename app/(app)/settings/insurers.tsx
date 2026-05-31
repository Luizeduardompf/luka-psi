import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/constants/theme'
import { useInsurers } from '@/hooks/useLookups'

export default function InsurersScreen() {
  const insets = useSafeAreaInsets()
  const { data: insurers, isLoading } = useInsurers()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          gap: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text.primary,
            flex: 1,
          }}
        >
          Seguradoras e planos
        </Text>
      </View>

      <Text
        style={{
          fontSize: 13,
          color: theme.colors.text.secondary,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          lineHeight: 18,
        }}
      >
        Lista de seguradoras e sistemas de saúde disponíveis para vinculação aos pacientes.
      </Text>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.colors.text.tertiary }}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={insurers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: theme.spacing.md,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: theme.colors.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: theme.spacing.md,
                }}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color={theme.colors.primary}
                />
              </View>
              <Text
                style={{ flex: 1, fontSize: 15, color: theme.colors.text.primary }}
              >
                {item.name}
              </Text>
              {item.psychologist_id === null && (
                <View
                  style={{
                    backgroundColor: theme.colors.primary + '15',
                    borderRadius: theme.radius.full,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: theme.colors.primary,
                    }}
                  >
                    Global
                  </Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  )
}
