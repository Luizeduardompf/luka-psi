import React, { useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { PatientCard } from '@/components/patients/PatientCard'
import { theme } from '@/constants/theme'
import { useSession } from '@/hooks/useSession'
import { usePatients, useRecentPatients } from '@/hooks/usePatients'
import { greetingByHour } from '@/utils/format'
import { useGenders, getPronounTreatment } from '@/hooks/useGenders'

// ─── Stat card (compact) ───────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ComponentProps<typeof Ionicons>['name']
  color: string
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        ...theme.shadow.sm,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.sm,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: theme.radius.sm,
            backgroundColor: color + '14',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={16} color={color} />
        </View>
      </View>
      <Text
        style={{
          ...theme.typography.display,
          fontSize: 24,
          color: theme.colors.text.primary,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          ...theme.typography.caption,
          color: theme.colors.text.tertiary,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  )
}

// ─── Quick action ──────────────────────────────────────────────────────────────
function QuickAction({
  label,
  icon,
  color,
  onPress,
  disabled,
}: {
  label: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  color: string
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={{
        flex: 1,
        alignItems: 'center',
        gap: 8,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: theme.radius.lg,
          backgroundColor: color + '18',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: color + '30',
        }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text
        style={{
          ...theme.typography.caption,
          fontWeight: '500',
          color: theme.colors.text.secondary,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
      }}
    >
      <Text
        style={{
          ...theme.typography.overline,
          color: theme.colors.text.secondary,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text
            style={{
              ...theme.typography.label,
              color: theme.colors.primary,
            }}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

// ─── Dashboard screen ──────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const insets = useSafeAreaInsets()
  const { displayName, profile } = useSession()

  const allPatients = usePatients()
  const activePatients = usePatients({ status: 'active' })
  const recentPatients = useRecentPatients(5)

  const { data: genders = [] } = useGenders()

  const isRefreshing =
    allPatients.isFetching ||
    activePatients.isFetching ||
    recentPatients.isFetching

  const handleRefresh = useCallback(() => {
    void allPatients.refetch()
    void activePatients.refetch()
    void recentPatients.refetch()
  }, [allPatients, activePatients, recentPatients])

  // Greeting: pronome + nome profissional (ou nome completo como fallback)
  const pronoun = profile?.gender_id
    ? getPronounTreatment(genders, profile.gender_id)
    : ''
  const rawName = profile?.professional_name || displayName
  // Remove prefixos de título que possam vir no campo (ex: "Dr. Luiz" → "Luiz")
  const nameWithoutPrefix = rawName.replace(/^(Dr[a]?\.?\s+|Prof\.?\s+)/i, '').trim()
  const firstName = nameWithoutPrefix.split(' ')[0] || rawName
  const greetingName = pronoun ? `${pronoun} ${firstName}` : firstName

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header fixo fora do scroll */}
      <View
        style={{
          paddingTop: insets.top + theme.spacing.sm,
          paddingBottom: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: theme.colors.background,
        }}
      >
        {/* Left: avatar + greeting */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <Avatar name={displayName} uri={profile?.avatar_url} size="lg" />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                ...theme.typography.bodySmall,
                color: theme.colors.text.secondary,
              }}
            >
              {greetingByHour()},
            </Text>
            <Text
              style={{
                ...theme.typography.h2,
                color: theme.colors.text.primary,
              }}
            >
              {greetingName}
            </Text>
          </View>
        </View>
        {/* Right: notifications */}
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.spacing.xl,
          paddingHorizontal: theme.spacing.md,
          gap: theme.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Quick Actions */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <QuickAction
              label="Novo Paciente"
              icon="person-add"
              color={theme.colors.primary}
              onPress={() => router.push('/(app)/patients/new')}
            />
            <QuickAction
              label="Agenda"
              icon="calendar"
              color={theme.colors.accent}
              onPress={() => router.push('/(app)/agenda' as never)}
              disabled
            />
            <QuickAction
              label="Relatórios"
              icon="bar-chart"
              color={theme.colors.warning}
              onPress={() => {}}
              disabled
            />
          </View>
        </Card>

        {/* Stats */}
        <View>
          <SectionHeader title="Visao geral" />
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <StatCard
              label="Total"
              value={allPatients.data?.length ?? 0}
              icon="people"
              color={theme.colors.primary}
            />
            <StatCard
              label="Ativos"
              value={activePatients.data?.length ?? 0}
              icon="checkmark-circle"
              color={theme.colors.success}
            />
            <StatCard
              label="Hoje"
              value="-"
              icon="calendar"
              color={theme.colors.accent}
            />
          </View>
        </View>

        {/* Recent patients */}
        <View>
          <SectionHeader
            title="Pacientes recentes"
            actionLabel="Ver todos"
            onAction={() => router.push('/(app)/patients')}
          />

          {recentPatients.isLoading ? (
            <View
              style={{
                height: 80,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  ...theme.typography.body,
                  color: theme.colors.text.tertiary,
                }}
              >
                Carregando...
              </Text>
            </View>
          ) : recentPatients.data?.length === 0 ? (
            <Card>
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: theme.spacing.lg,
                  gap: 8,
                }}
              >
                <Ionicons
                  name="people-outline"
                  size={40}
                  color={theme.colors.text.tertiary}
                />
                <Text
                  style={{
                    ...theme.typography.body,
                    color: theme.colors.text.secondary,
                    textAlign: 'center',
                  }}
                >
                  Nenhum paciente ainda.{'\n'}Adicione o primeiro!
                </Text>
              </View>
            </Card>
          ) : (
            recentPatients.data?.map((p) => (
              <PatientCard
                key={p.id}
                patient={p}
                onPress={() => router.push(`/(app)/patients/${p.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}
