import React, { memo } from 'react'
import { View, ViewProps } from 'react-native'
import { theme } from '@/constants/theme'

interface CardProps extends ViewProps {
  elevated?: boolean
  padding?: keyof typeof theme.spacing
}

export const Card = memo(function Card({
  elevated = false,
  padding = 'md',
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing[padding],
          borderWidth: 1,
          borderColor: theme.colors.border,
          ...(elevated ? theme.shadow.md : theme.shadow.sm),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  )
})
