import React, { memo } from 'react'
import { View, ViewProps } from 'react-native'
import { theme } from '@/constants/theme'

type CardVariant = 'default' | 'outlined' | 'ghost'

interface CardProps extends ViewProps {
  elevated?: boolean
  padding?: keyof typeof theme.spacing
  variant?: CardVariant
}

export const Card = memo(function Card({
  elevated = false,
  padding = 'md',
  variant = 'default',
  style,
  children,
  ...rest
}: CardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border,
        }
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderColor: 'transparent',
        }
      default:
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <View
      style={[
        {
          ...variantStyles,
          borderRadius: theme.radius.lg,
          padding: theme.spacing[padding],
          ...(elevated ? theme.shadow.md : variant === 'default' ? theme.shadow.sm : undefined),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  )
})
