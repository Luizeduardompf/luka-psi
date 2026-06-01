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

// ─── Stat card ─────────────────────────────────────────────────────────────────
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
    <Card style={{ flex: 1, alignItems: 'flex-start' }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radius.md,
          backgroundColor: color + '22',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.sm,
        }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text
        style={{
          fontSize: 28,
          fontWeight: '800',
          color: theme.colors.text.primary,
          letterSpacing: -0.5,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: theme.colors.text.secondary,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </Card>
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
          fontSize: 12,
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
  const pronoun = profile?.gender_id ? getPronounTreatment(genders, profile.gender_id) : ''
  const professionalName = profile?.professional_name || displayName
  const greetingName = pronoun ? `${pronoun} ${professionalName}` : professionalName
  const firstName = greetingName.split(' ')[0] ?? greetingName

  return (
    <View
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + theme.spacing.md,
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
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: avatar + greeting */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <Avatar name={displayName} uri={profile?.avatar_url} size="lg" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: theme.colors.text.secondary }}>
                {greetingByHour()},
              </Text>
              <Text style={{
                fontSize: 20, fontWeight: '700',
                color: theme.colors.text.primary, letterSpacing: -0.3,
              }}>
                {firstName}! 👋
              </Text>
            </View>
          </View>
          {/* Right: notification + settings */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <TouchableOpacity
              style={{
                width: 40, height: 40, borderRadius: 20,
                alignItems: 'center', justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(app)/settings')}
              style={{
                width: 40, height: 40, borderRadius: 20,
                alignItems: 'center', justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: theme.colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: theme.spacing.sm,
            }}
          >
            Visão geral
          </Text>
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
              label="Consultas hoje"
              value="—"
              icon="calendar"
              color={theme.colors.secondary}
            />
          </View>
        </View>

        {/* Quick actions */}
        <View>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: theme.colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: theme.spacing.sm,
            }}
          >
            Ações rápidas
          </Text>
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
                color={theme.colors.secondary}
                onPress={() => {}}
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
        </View>

        {/* Recent patients */}
        <View>
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
                fontSize: 13,
                fontWeight: '700',
                color: theme.colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              Pacientes recentes
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(app)/patients')}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.primary,
                  fontWeight: '600',
                }}
              >
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>

          {recentPatients.isLoading ? (
            <View
              style={{
                height: 80,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: theme.colors.text.tertiary }}>
                Carregando...
              </Text>
            </View>
          ) : recentPatients.data?.length === 0 ? (
            <Card>
              <View style={{ alignItems: 'center', paddingVertical: theme.spacing.lg, gap: 8 }}>
                <Ionicons
                  name="people-outline"
                  size={40}
                  color={theme.colors.text.tertiary}
                />
                <Text
                  style={{
                    color: theme.colors.text.secondary,
                    fontSize: 15,
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
