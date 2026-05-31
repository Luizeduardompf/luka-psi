import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/constants/theme'
import { Session, SessionStatus, PaymentStatus } from '@/types/app.types'

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; color: string; icon: React.ComponentProps<typeof Ionicons>['name'] }
> = {
  scheduled: { label: 'Agendada', color: theme.colors.primary, icon: 'calendar-outline' },
  completed: { label: 'Realizada', color: theme.colors.success, icon: 'checkmark-circle-outline' },
  cancelled: { label: 'Cancelada', color: theme.colors.error, icon: 'close-circle-outline' },
  no_show: { label: 'Faltou', color: theme.colors.warning, icon: 'alert-circle-outline' },
}

const PAYMENT_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string }
> = {
  pending: { label: 'Pendente', color: theme.colors.warning },
  paid: { label: 'Pago', color: theme.colors.success },
  waived: { label: 'Isento', color: theme.colors.text.tertiary },
}

interface SessionCardProps {
  session: Session
  patientName?: string
  onPress?: () => void
  showPatient?: boolean
}

export function SessionCard({
  session,
  patientName,
  onPress,
  showPatient = false,
}: SessionCardProps) {
  const status = STATUS_CONFIG[session.status as SessionStatus] ?? STATUS_CONFIG.scheduled
  const payment =
    session.payment_status
      ? PAYMENT_CONFIG[session.payment_status as PaymentStatus]
      : null

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!onPress}
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        flexDirection: 'row',
        ...theme.shadow.sm,
      }}
    >
      {/* Color stripe */}
      <View
        style={{
          width: 4,
          backgroundColor: status.color,
        }}
      />

      <View style={{ flex: 1, padding: theme.spacing.md }}>
        {/* Top row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="time-outline" size={14} color={theme.colors.text.tertiary} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.text.primary,
              }}
            >
              {session.start_time}
              {session.end_time ? ` – ${session.end_time}` : ''}
            </Text>
            {session.session_number && (
              <View
                style={{
                  backgroundColor: theme.colors.primaryLight,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: theme.radius.sm,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: theme.colors.primary,
                  }}
                >
                  #{session.session_number}
                </Text>
              </View>
            )}
          </View>

          {/* Status badge */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: status.color + '15',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: theme.radius.full,
            }}
          >
            <Ionicons name={status.icon} size={12} color={status.color} />
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: status.color,
              }}
            >
              {status.label}
            </Text>
          </View>
        </View>

        {/* Patient name (if shown) */}
        {showPatient && patientName && (
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: theme.colors.text.primary,
              marginBottom: 4,
            }}
          >
            {patientName}
          </Text>
        )}

        {/* Bottom row: type + payment + fee */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons
              name={session.type === 'online' ? 'videocam-outline' : 'location-outline'}
              size={13}
              color={theme.colors.text.tertiary}
            />
            <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>
              {session.type === 'online' ? 'Online' : 'Presencial'}
            </Text>
          </View>

          {payment && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: theme.colors.text.tertiary,
                }}
              />
              <Text style={{ fontSize: 12, color: payment.color, fontWeight: '500' }}>
                {payment.label}
              </Text>
            </View>
          )}

          {session.fee != null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: theme.colors.text.tertiary,
                }}
              />
              <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>
                €{Number(session.fee).toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Notes snippet */}
        {session.notes ? (
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.text.tertiary,
              marginTop: 6,
              fontStyle: 'italic',
            }}
            numberOfLines={1}
          >
            {session.notes}
          </Text>
        ) : null}
      </View>

      {onPress && (
        <View
          style={{
            justifyContent: 'center',
            paddingRight: theme.spacing.sm,
          }}
        >
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.text.tertiary}
          />
        </View>
      )}
    </TouchableOpacity>
  )
}
