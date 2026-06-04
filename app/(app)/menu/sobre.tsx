import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/constants/theme'
import { APP_VERSION } from '@/constants/version'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Text style={{ ...theme.typography.body, color: theme.colors.text.secondary }}>
        {label}
      </Text>
      <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.text.primary }}>
        {value}
      </Text>
    </View>
  )
}

export default function SobreScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text.primary,
            marginHorizontal: theme.spacing.sm,
          }}
        >
          Sobre o Luka
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / ícone */}
        <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.md,
              ...theme.shadow.md,
            }}
          >
            <Ionicons name="heart-outline" size={40} color="#fff" />
          </View>
          <Text style={{ ...theme.typography.h1, color: theme.colors.text.primary }}>
            Luka
          </Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.text.tertiary, marginTop: 4 }}>
            Plataforma para psicólogos
          </Text>
        </View>

        {/* Info */}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            paddingHorizontal: theme.spacing.md,
            ...theme.shadow.sm,
          }}
        >
          <Row label="Versão" value={APP_VERSION} />
          <Row label="Plataforma" value="iOS · Android · Web" />
          <Row label="Ambiente" value="MVP" />
        </View>

        {/* Rodapé */}
        <Text
          style={{
            ...theme.typography.caption,
            color: theme.colors.text.tertiary,
            textAlign: 'center',
            marginTop: theme.spacing.xl,
            lineHeight: 18,
          }}
        >
          Feito com cuidado para profissionais de saúde mental.{'\n'}
          © {new Date().getFullYear()} Luka
        </Text>
      </ScrollView>
    </View>
  )
}
