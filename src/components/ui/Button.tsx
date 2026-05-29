import React, { memo } from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native'
import { theme } from '@/constants/theme'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<
  ButtonVariant,
  { bg: string; text: string; border?: string }
> = {
  primary: { bg: theme.colors.primary, text: '#FFFFFF' },
  secondary: { bg: theme.colors.secondary, text: '#FFFFFF' },
  outline: {
    bg: 'transparent',
    text: theme.colors.primary,
    border: theme.colors.primary,
  },
  ghost: { bg: 'transparent', text: theme.colors.primary },
  danger: { bg: theme.colors.error, text: '#FFFFFF' },
}

const sizeStyles: Record<ButtonSize, { py: number; px: number; fontSize: number; radius: number }> = {
  sm: { py: 8, px: 14, fontSize: 14, radius: theme.radius.sm },
  md: { py: 14, px: 20, fontSize: 16, radius: theme.radius.lg },
  lg: { py: 18, px: 24, fontSize: 17, radius: theme.radius.xl },
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
  ...rest
}: ButtonProps) {
  const vs = variantStyles[variant]
  const ss = sizeStyles[size]
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
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
        opacity: isDisabled ? 0.55 : 1,
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        ...(variant === 'primary' && !isDisabled
          ? theme.shadow.sm
          : undefined),
      }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={vs.text}
        />
      ) : (
        <>
          {leftIcon && <View>{leftIcon}</View>}
          <Text
            style={{
              color: vs.text,
              fontSize: ss.fontSize,
              fontWeight: '600',
              letterSpacing: 0.2,
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
