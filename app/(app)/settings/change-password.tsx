import React, { useState } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'
import { changePasswordSchema, ChangePasswordFormData } from '@/utils/validators'
import { supabase } from '@/services/supabase'
import { Toast, useToast } from '@/components/ui/Toast'

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets()
  const { toast, showToast, hideToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password })
      if (error) throw error
      reset()
      showToast('Senha alterada com sucesso!')
      setTimeout(() => router.back(), 1000)
    } catch (err: unknown) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível alterar a senha.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + theme.spacing.sm,
          paddingBottom: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          backgroundColor: theme.colors.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary, flex: 1 }}>
          Alterar senha
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{
          backgroundColor: theme.colors.primaryLight,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          flexDirection: 'row',
          gap: 10,
          marginBottom: theme.spacing.lg,
        }}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} style={{ marginTop: 1 }} />
          <Text style={{ fontSize: 13, color: theme.colors.primary, flex: 1, lineHeight: 18 }}>
            A nova senha deve ter pelo menos 6 caracteres.
          </Text>
        </View>

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nova senha *"
              placeholder="Mínimo 6 caracteres"
              leftIcon="lock-closed-outline"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirmar senha *"
              placeholder="Repita a nova senha"
              leftIcon="lock-closed-outline"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <Button
          title="Alterar senha"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          fullWidth
          size="lg"
          style={{ marginTop: theme.spacing.md }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
