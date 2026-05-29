import React, { memo } from 'react'
import { View, Text } from 'react-native'
import { theme } from '@/constants/theme'
import { PatientStatus } from '@/types/app.types'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
}

const variantMap: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#D1FAE5', text: '#065F46' },
  warning: { bg: '#FEF3C7', text: '#92400E' },
  error: { bg: '#FEE2E2', text: '#991B1B' },
  info: { bg: '#DBEAFE', text: '#1E40AF' },
  default: { bg: theme.colors.surfaceSecondary, text: theme.colors.text.secondary },
}

export const statusVariantMap: Record<PatientStatus, BadgeVariant> = {
  active: 'success',
  inactive: 'default',
  waiting: 'warning',
}

export const statusLabelMap: Record<PatientStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  waiting: 'Lista de espera',
}

export const Badge = memo(function Badge({
  label,
  variant = 'default',
}: BadgeProps) {
  const styles = variantMap[variant]

  return (
    <View
      style={{
        backgroundColor: styles.bg,
        borderRadius: theme.radius.full,
        paddingVertical: 3,
        paddingHorizontal: 10,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: styles.text,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  )
})
