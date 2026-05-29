import React, { memo, useState, forwardRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/constants/theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  hint?: string
  leftIcon?: keyof typeof Ionicons.glyphMap
  rightIcon?: keyof typeof Ionicons.glyphMap
  onRightIconPress?: () => void
  isPassword?: boolean
}

export const Input = memo(
  forwardRef<TextInput, InputProps>(function Input(
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      isPassword = false,
      ...props
    },
    ref,
  ) {
    const [focused, setFocused] = useState(false)
    const [secureText, setSecureText] = useState(isPassword)

    const borderColor = error
      ? theme.colors.error
      : focused
        ? theme.colors.primary
        : theme.colors.border

    const passwordIcon: keyof typeof Ionicons.glyphMap = secureText
      ? 'eye-outline'
      : 'eye-off-outline'

    return (
      <View style={{ marginBottom: theme.spacing.md }}>
        {label && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: theme.colors.text.secondary,
              marginBottom: 6,
            }}
          >
            {label}
          </Text>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.md,
            borderWidth: 1.5,
            borderColor,
            paddingHorizontal: theme.spacing.md,
            minHeight: 52,
          }}
        >
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={20}
              color={
                focused ? theme.colors.primary : theme.colors.text.tertiary
              }
              style={{ marginRight: 10 }}
            />
          )}

          <TextInput
            ref={ref}
            secureTextEntry={secureText}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
            placeholderTextColor={theme.colors.text.tertiary}
            style={{
              flex: 1,
              fontSize: 16,
              color: theme.colors.text.primary,
              paddingVertical: 12,
            }}
            {...props}
          />

          {isPassword && (
            <TouchableOpacity
              onPress={() => setSecureText((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={passwordIcon}
                size={20}
                color={theme.colors.text.tertiary}
              />
            </TouchableOpacity>
          )}

          {rightIcon && !isPassword && (
            <TouchableOpacity
              onPress={onRightIconPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={rightIcon}
                size={20}
                color={theme.colors.text.tertiary}
              />
            </TouchableOpacity>
          )}
        </View>

        {error ? (
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.error,
              marginTop: 4,
            }}
          >
            {error}
          </Text>
        ) : hint ? (
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.text.tertiary,
              marginTop: 4,
            }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    )
  }),
)
