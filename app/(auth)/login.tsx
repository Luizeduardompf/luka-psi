import React, { useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'
import {
  loginSchema,
  signUpSchema,
  LoginFormData,
  SignUpFormData,
} from '@/utils/validators'
import { useAuth } from '@/hooks/useAuth'

// ─── Reset password modal ──────────────────────────────────────────────────────
function ForgotPasswordModal({
  visible,
  onClose,
}: {
  visible: boolean
  onClose: () => void
}) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Digite seu e-mail.')
      return
    }
    setLoading(true)
    const error = await resetPassword(email)
    setLoading(false)
    if (error) {
      Alert.alert('Erro', error)
    } else {
      Alert.alert(
        'E-mail enviado',
        'Verifique sua caixa de entrada para redefinir a senha.',
        [{ text: 'OK', onPress: onClose }],
      )
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: theme.colors.text.primary,
            }}
          >
            Redefinir senha
          </Text>
          <Text style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
            Enviaremos um link de redefinição para seu e-mail.
          </Text>
          <Input
            label="E-mail"
            placeholder="seu@email.com"
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Button
            title="Enviar link"
            onPress={handleReset}
            loading={loading}
            fullWidth
          />
          <Button
            title="Cancelar"
            variant="ghost"
            onPress={onClose}
            fullWidth
          />
        </View>
      </View>
    </Modal>
  )
}

// ─── Sign up modal ─────────────────────────────────────────────────────────────
function SignUpModal({
  visible,
  onClose,
}: {
  visible: boolean
  onClose: () => void
}) {
  const { signUp, isSubmitting } = useAuth()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormData) => {
    const error = await signUp(data.email, data.password, data.full_name)
    if (error) {
      Alert.alert(
        error.startsWith('Conta criada') ? 'Cadastro realizado' : 'Erro',
        error,
      )
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              padding: theme.spacing.lg,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.lg,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '700',
                  color: theme.colors.text.primary,
                }}
              >
                Criar conta
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <Controller
              control={control}
              name="full_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nome completo"
                  placeholder="Seu nome"
                  leftIcon="person-outline"
                  autoCapitalize="words"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.full_name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="E-mail"
                  placeholder="seu@email.com"
                  leftIcon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Senha"
                  placeholder="Mínimo 6 caracteres"
                  leftIcon="lock-closed-outline"
                  isPassword
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
                  label="Confirmar senha"
                  placeholder="Repita a senha"
                  leftIcon="lock-closed-outline"
                  isPassword
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Button
              title="Criar conta"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              fullWidth
              size="lg"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ─── Login screen ──────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const insets = useSafeAreaInsets()
  const { signIn, isSubmitting } = useAuth()
  const [forgotVisible, setForgotVisible] = useState(false)
  const [signUpVisible, setSignUpVisible] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const passwordRef = useRef<TextInput>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      setLoginError(null)
      const error = await signIn(data.email, data.password)
      if (error) setLoginError(error)
    },
    [signIn],
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + theme.spacing.xl,
          paddingBottom: insets.bottom + theme.spacing.xl,
          paddingHorizontal: theme.spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xxl }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.md,
              ...theme.shadow.md,
            }}
          >
            <Ionicons name="heart" size={36} color="#FFFFFF" />
          </View>
          <Text
            style={{
              fontSize: 36,
              fontWeight: '800',
              color: theme.colors.text.primary,
              letterSpacing: -1,
            }}
          >
            Luka
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: theme.colors.text.secondary,
              marginTop: 4,
            }}
          >
            Gestão humanizada para psicólogos
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: 0 }}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="E-mail"
                placeholder="seu@email.com"
                leftIcon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={passwordRef}
                label="Senha"
                placeholder="Sua senha"
                leftIcon="lock-closed-outline"
                isPassword
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.password?.message}
              />
            )}
          />

          {loginError && (
            <View
              style={{
                backgroundColor: '#FEE2E2',
                borderRadius: theme.radius.md,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Ionicons
                name="alert-circle"
                size={18}
                color={theme.colors.error}
              />
              <Text
                style={{ color: theme.colors.error, fontSize: 14, flex: 1 }}
              >
                {loginError}
              </Text>
            </View>
          )}

          <Button
            title={isSubmitting ? 'Entrando...' : 'Entrar'}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            fullWidth
            size="lg"
          />

          <TouchableOpacity
            onPress={() => setForgotVisible(true)}
            style={{ alignItems: 'center', marginTop: theme.spacing.md }}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 14,
                fontWeight: '500',
              }}
            >
              Esqueci minha senha
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.spacing.xl,
            gap: theme.spacing.sm,
          }}
        >
          <View
            style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }}
          />
          <Text
            style={{ color: theme.colors.text.tertiary, fontSize: 13 }}
          >
            ou
          </Text>
          <View
            style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }}
          />
        </View>

        {/* Google login button (UI only) */}
        <TouchableOpacity
          onPress={() => Alert.alert('Em breve', 'Login com Google em desenvolvimento.')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderWidth: 1.5,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            paddingVertical: 14,
            marginTop: theme.spacing.md,
            backgroundColor: theme.colors.surface,
          }}
        >
          {/* Google "G" icon */}
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#4285F4',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>
              G
            </Text>
          </View>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '500',
              color: theme.colors.text.primary,
            }}
          >
            Continuar com Google
          </Text>
        </TouchableOpacity>

        {/* Sign up */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: theme.spacing.xxl,
            gap: 4,
          }}
        >
          <Text style={{ color: theme.colors.text.secondary, fontSize: 15 }}>
            Ainda não tem conta?
          </Text>
          <TouchableOpacity onPress={() => setSignUpVisible(true)}>
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 15,
                fontWeight: '600',
              }}
            >
              Criar conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ForgotPasswordModal
        visible={forgotVisible}
        onClose={() => setForgotVisible(false)}
      />
      <SignUpModal
        visible={signUpVisible}
        onClose={() => setSignUpVisible(false)}
      />
    </KeyboardAvoidingView>
  )
}
