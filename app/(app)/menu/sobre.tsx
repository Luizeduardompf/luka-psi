import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/constants/theme'
import { APP_VERSION } from '@/constants/version'

const CHANGELOG = [
  { version: 'v0.1.6', desc: 'Histórico de versões na tela Sobre' },
  { version: 'v0.1.5', desc: 'Splash fix, EAS Update para iPhone' },
  { version: 'v0.1.4', desc: 'Upgrade SDK 52 → 54, expo-router v5, React 19' },
  { version: 'v0.1.3', desc: 'Foto do paciente, reordenação do formulário' },
  { version: 'v0.1.2', desc: 'Perfil com logo/assinatura, configurações' },
  { version: 'v0.1.1', desc: 'Formulários públicos /f/:token' },
  { version: 'v0.1.0', desc: 'MVP inicial — pacientes, formulários, agenda' },
]

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

        {/* Histórico de versões */}
        <Text
          style={{
            ...theme.typography.overline,
            color: theme.colors.primary,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginTop: theme.spacing.xl,
            marginBottom: theme.spacing.sm,
          }}
        >
          Histórico
        </Text>
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            paddingHorizontal: theme.spacing.md,
            ...theme.shadow.sm,
          }}
        >
          {CHANGELOG.map((item, index) => (
            <View
              key={item.version}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                paddingVertical: 12,
                borderBottomWidth: index < CHANGELOG.length - 1 ? 1 : 0,
                borderBottomColor: theme.colors.border,
                gap: 12,
              }}
            >
              <View
                style={{
                  backgroundColor: index === 0 ? theme.colors.primary : theme.colors.surfaceSecondary,
                  borderRadius: theme.radius.sm,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  minWidth: 54,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: index === 0 ? '#fff' : theme.colors.text.secondary,
                  }}
                >
                  {item.version}
                </Text>
              </View>
              <Text
                style={{
                  flex: 1,
                  ...theme.typography.body,
                  color: theme.colors.text.primary,
                  lineHeight: 20,
                }}
              >
                {item.desc}
              </Text>
            </View>
          ))}
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
