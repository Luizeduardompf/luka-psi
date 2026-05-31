import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/constants/theme'
import { useSessionStore } from '@/stores/session.store'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'

interface SettingsRowProps {
  icon: string
  label: string
  value?: string
  onPress?: () => void
  dangerous?: boolean
}

function SettingsRow({ icon, label, value, onPress, dangerous }: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        gap: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: dangerous
            ? '#FEE2E2'
            : theme.colors.primaryLight ?? theme.colors.primary + '15',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={dangerous ? theme.colors.error : theme.colors.primary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            color: dangerous ? theme.colors.error : theme.colors.text.primary,
          }}
        >
          {label}
        </Text>
        {value ? (
          <Text style={{ fontSize: 13, color: theme.colors.text.tertiary, marginTop: 2 }}>
            {value}
          </Text>
        ) : null}
      </View>
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.text.tertiary}
        />
      )}
    </TouchableOpacity>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.xs,
      }}
    >
      {title}
    </Text>
  )
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const { profile } = useSessionStore()
  const { signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true)
          await signOut()
        },
      },
    ])
  }

  const displayName =
    profile?.preferred_name || profile?.full_name || 'Psicólogo'

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
            fontSize: 28,
            fontWeight: '800',
            color: theme.colors.text.primary,
            letterSpacing: -0.5,
          }}
        >
          Configurações
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Profile card */}
        <TouchableOpacity
          onPress={() => router.push('/(app)/settings/profile')}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: theme.spacing.md,
            marginVertical: theme.spacing.sm,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.md,
            gap: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            ...theme.shadow.sm,
          }}
        >
          <Avatar
            name={profile?.full_name ?? '?'}
            url={profile?.avatar_url ?? null}
            size="lg"
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '700',
                color: theme.colors.text.primary,
              }}
            >
              {displayName}
            </Text>
            {profile?.ordem_psicologos ? (
              <Text
                style={{ fontSize: 13, color: theme.colors.text.tertiary, marginTop: 2 }}
              >
                {profile.ordem_psicologos}
              </Text>
            ) : null}
            <Text
              style={{
                fontSize: 13,
                color: theme.colors.primary,
                fontWeight: '500',
                marginTop: 4,
              }}
            >
              Editar perfil →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Gestão clínica */}
        <SectionTitle title="Gestão clínica" />
        <View
          style={{
            marginHorizontal: theme.spacing.md,
            borderRadius: theme.radius.lg,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <SettingsRow
            icon="heart-outline"
            label="Estado civil"
            value="Gerenciar opções"
            onPress={() => router.push('/(app)/settings/civil-statuses')}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Seguradoras e planos"
            value="Ver seguradoras disponíveis"
            onPress={() => router.push('/(app)/settings/insurers')}
          />
        </View>

        {/* Conta */}
        <SectionTitle title="Conta" />
        <View
          style={{
            marginHorizontal: theme.spacing.md,
            borderRadius: theme.radius.lg,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <SettingsRow
            icon="log-out-outline"
            label={signingOut ? 'Saindo...' : 'Sair da conta'}
            onPress={handleSignOut}
            dangerous
          />
        </View>

        {/* Version */}
        <Text
          style={{
            textAlign: 'center',
            color: theme.colors.text.tertiary,
            fontSize: 12,
            marginTop: theme.spacing.xl,
          }}
        >
          Luka v1.0.0
        </Text>
      </ScrollView>

      {signingOut && (
        <View
          style={{
            ...StyleSheet_absoluteFill,
            backgroundColor: 'rgba(0,0,0,0.3)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      )}
    </View>
  )
}

// inline fallback for absoluteFillObject
const StyleSheet_absoluteFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}
