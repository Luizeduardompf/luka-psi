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
  success: { bg: theme.colors.successLight, text: '#166534' },
  warning: { bg: theme.colors.warningLight, text: '#92400E' },
  error: { bg: theme.colors.errorLight, text: '#991B1B' },
  info: { bg: theme.colors.infoLight, text: '#1E40AF' },
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
        paddingVertical: 2,
        paddingHorizontal: 8,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          ...theme.typography.caption,
          fontWeight: '500',
          color: styles.text,
        }}
      >
        {label}
      </Text>
    </View>
  )
})
