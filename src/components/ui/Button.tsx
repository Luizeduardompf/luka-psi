import React, { memo } from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native'
import { theme } from '@/constants/theme'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  style?: ViewStyle
}

const variantStyles: Record<
  ButtonVariant,
  { bg: string; text: string; border?: string }
> = {
  primary: { bg: theme.colors.primary, text: theme.colors.text.inverse },
  secondary: { bg: theme.colors.surfaceSecondary, text: theme.colors.text.primary },
  outline: {
    bg: 'transparent',
    text: theme.colors.primary,
    border: theme.colors.border,
  },
  ghost: { bg: 'transparent', text: theme.colors.primary },
  danger: { bg: theme.colors.error, text: theme.colors.text.inverse },
}

const sizeStyles: Record<ButtonSize, { py: number; px: number; fontSize: number; radius: number }> = {
  sm: { py: 8, px: 14, fontSize: 13, radius: theme.radius.sm },
  md: { py: 12, px: 18, fontSize: 14, radius: theme.radius.md },
  lg: { py: 16, px: 24, fontSize: 15, radius: theme.radius.lg },
}

export const Button = memo(function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  fullWidth = false,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const vs = variantStyles[variant]
  const ss = sizeStyles[size]
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: vs.bg,
        borderRadius: ss.radius,
        paddingVertical: ss.py,
        paddingHorizontal: ss.px,
        borderWidth: vs.border ? 1.5 : 0,
        borderColor: vs.border ?? 'transparent',
        opacity: isDisabled ? 0.5 : 1,
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        ...(variant === 'primary' && !isDisabled ? theme.shadow.sm : undefined),
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vs.text} />
      ) : (
        <>
          {leftIcon && <View>{leftIcon}</View>}
          <Text
            style={{
              color: vs.text,
              fontSize: ss.fontSize,
              fontWeight: '500',
              letterSpacing: 0.1,
            }}
          >
            {title}
          </Text>
          {rightIcon && <View>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  )
})
