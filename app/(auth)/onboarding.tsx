import React from 'react'
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'
import { onboardingSchema, OnboardingFormData } from '@/utils/validators'
import { maskPhone } from '@/utils/format'
import { useCompleteOnboarding } from '@/hooks/useProfile'

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets()
  const { mutateAsync, isPending } = useCompleteOnboarding()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      full_name: '',
      preferred_name: '',
      ordem_psicologos: '',
      phone: '',
      address: '',
      postal_code: '',
      city: '',
      country: 'Brasil',
      nif: '',
    },
  })

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      await mutateAsync({
        full_name: data.full_name,
        preferred_name: data.preferred_name || null,
        ordem_psicologos: data.ordem_psicologos || null,
        phone: data.phone || null,
        address: data.address || null,
        postal_code: data.postal_code || null,
        city: data.city || null,
        country: data.country || null,
        nif: data.nif || null,
        onboarding_completed: true,
      })
      router.replace('/(app)')
    } catch (err: unknown) {
      Alert.alert(
        'Erro',
        err instanceof Error ? err.message : 'Erro ao salvar perfil.',
      )
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + theme.spacing.lg,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: theme.spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.md,
              ...theme.shadow.md,
            }}
          >
            <Ionicons name="person-add" size={30} color="#FFFFFF" />
          </View>
          <Text
            style={{
              fontSize: 26,
              fontWeight: '800',
              color: theme.colors.text.primary,
              letterSpacing: -0.5,
              textAlign: 'center',
            }}
          >
            Configure seu perfil
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              marginTop: 6,
              lineHeight: 22,
            }}
          >
            Esses dados serão usados nas sessões e relatórios.{'\n'}Pode alterar depois nas configurações.
          </Text>
        </View>

        {/* Dados pessoais */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: theme.colors.primary,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: theme.spacing.sm,
          }}
        >
          Dados pessoais
        </Text>

        <Controller
          control={control}
          name="full_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nome completo *"
              placeholder="Seu nome completo"
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
          name="preferred_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nome preferencial"
              placeholder="Como prefere ser chamado(a)"
              leftIcon="happy-outline"
              autoCapitalize="words"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.preferred_name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="ordem_psicologos"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nº Ordem dos Psicólogos / CRP"
              placeholder="Ex: OPP 12345 ou CRP 06/123456"
              leftIcon="id-card-outline"
              autoCapitalize="characters"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.ordem_psicologos?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Telefone"
              placeholder="(11) 99999-9999"
              leftIcon="call-outline"
              keyboardType="phone-pad"
              onChangeText={(v) => onChange(maskPhone(v))}
              onBlur={onBlur}
              value={value}
              error={errors.phone?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="nif"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="CPF / NIF"
              placeholder="Número de identificação fiscal"
              leftIcon="card-outline"
              keyboardType="numeric"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.nif?.message}
            />
          )}
        />

        {/* Endereço */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: theme.colors.primary,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.sm,
          }}
        >
          Endereço do consultório
        </Text>

        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Endereço"
              placeholder="Rua, número, complemento"
              leftIcon="location-outline"
              autoCapitalize="words"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.address?.message}
            />
          )}
        />

        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="postal_code"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="CEP / Código postal"
                  placeholder="00000-000"
                  keyboardType="numeric"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.postal_code?.message}
                />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Cidade"
                  placeholder="São Paulo"
                  autoCapitalize="words"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.city?.message}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="country"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="País"
              placeholder="Brasil"
              autoCapitalize="words"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.country?.message}
            />
          )}
        />

        <Button
          title="Começar a usar o Luka"
          onPress={handleSubmit(onSubmit)}
          loading={isPending}
          fullWidth
          size="lg"
          style={{ marginTop: theme.spacing.lg }}
        />

        <Button
          title="Pular por agora"
          variant="ghost"
          onPress={() => {
            router.replace('/(app)')
          }}
          fullWidth
          style={{ marginTop: theme.spacing.sm }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
