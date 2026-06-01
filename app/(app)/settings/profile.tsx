import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { theme } from '@/constants/theme'
import { profileSchema, ProfileFormData } from '@/utils/validators'
import { maskPhone } from '@/utils/format'
import { useSessionStore } from '@/stores/session.store'
import { useUpdateProfile } from '@/hooks/useProfile'
import { profileService } from '@/services/profile.service'
import { useGenders } from '@/hooks/useGenders'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { profile } = useSessionStore()
  const { mutateAsync, isPending } = useUpdateProfile()
  const { data: genders = [] } = useGenders()

  const [selectedGenderId, setSelectedGenderId] = useState<string | null>(profile?.gender_id ?? null)
  const [logoUrl, setLogoUrl] = useState<string>(profile?.logo_url ?? '')
  const [logoInput, setLogoInput] = useState<string>(profile?.logo_url ?? '')
  const [isSavingLogo, setIsSavingLogo] = useState(false)

  const handleSaveLogo = async () => {
    const url = logoInput.trim()
    if (url && !url.startsWith('http')) {
      Alert.alert('URL inválida', 'Insira uma URL completa iniciando com http:// ou https://')
      return
    }
    if (!profile?.id) return
    setIsSavingLogo(true)
    try {
      const result = await profileService.updateProfile(profile.id, { logo_url: url || null })
      if (result.error) throw new Error(result.error)
      setLogoUrl(url)
      Alert.alert('Salvo', 'Logo profissional atualizada!')
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a logo.')
    } finally {
      setIsSavingLogo(false)
    }
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      preferred_name: profile?.preferred_name ?? '',
      commercial_name: profile?.commercial_name ?? '',
      ordem_psicologos: profile?.ordem_psicologos ?? '',
      phone: profile?.phone ?? '',
      address: profile?.address ?? '',
      postal_code: profile?.postal_code ?? '',
      city: profile?.city ?? '',
      country: profile?.country ?? '',
      nif: profile?.nif ?? '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await mutateAsync({
        full_name: data.full_name,
        preferred_name: data.preferred_name || null,
        commercial_name: data.commercial_name || null,
        gender_id: selectedGenderId || null,
        ordem_psicologos: data.ordem_psicologos || null,
        phone: data.phone || null,
        address: data.address || null,
        postal_code: data.postal_code || null,
        city: data.city || null,
        country: data.country || null,
        nif: data.nif || null,
      })
      Alert.alert('Salvo', 'Perfil atualizado com sucesso!')
      router.back()
    } catch (err: unknown) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao salvar.')
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          Editar perfil
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <View style={{ position: 'relative' }}>
            <Avatar name={profile?.full_name ?? '?'} url={profile?.avatar_url ?? null} size="xl" />
            <View
              style={{
                position: 'absolute', bottom: 0, right: 0, width: 30, height: 30,
                borderRadius: 15, backgroundColor: theme.colors.primary,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderColor: theme.colors.background,
              }}
            >
              <Ionicons name="camera" size={15} color="#fff" />
            </View>
          </View>
          <Text style={{ fontSize: 13, color: theme.colors.text.tertiary, marginTop: theme.spacing.sm }}>
            Toque para alterar a foto
          </Text>
        </View>

        {/* Dados pessoais */}
        <Text style={sectionStyle}>Dados pessoais</Text>

        <Controller
          control={control} name="full_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Nome completo *" placeholder="Seu nome completo"
              leftIcon="person-outline" autoCapitalize="words"
              onChangeText={onChange} onBlur={onBlur} value={value}
              error={errors.full_name?.message} />
          )}
        />
        <Controller
          control={control} name="preferred_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Nome preferencial" placeholder="Como prefere ser chamado(a)"
              leftIcon="happy-outline" autoCapitalize="words"
              onChangeText={onChange} onBlur={onBlur} value={value}
              error={errors.preferred_name?.message} />
          )}
        />
        <Controller
          control={control} name="commercial_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Nome comercial" placeholder="Nome usado em mensagens aos pacientes (ex: Ana Silva)"
              leftIcon="briefcase-outline" autoCapitalize="words"
              onChangeText={onChange} onBlur={onBlur} value={value ?? ''} />
          )}
        />

        {/* Gênero — usado para Dr./Dra. nas mensagens */}
        <View style={{ marginBottom: theme.spacing.sm }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.text.secondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Gênero (para tratamento nas mensagens)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {genders.map((g) => (
              <TouchableOpacity
                key={g.id}
                onPress={() => setSelectedGenderId(g.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 99,
                  borderWidth: 1.5,
                  borderColor: selectedGenderId === g.id ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selectedGenderId === g.id ? theme.colors.primaryLight : theme.colors.surface,
                }}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: selectedGenderId === g.id ? theme.colors.primary : theme.colors.text.secondary,
                }}>
                  {g.pronoun_treatment} — {g.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setSelectedGenderId(null)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 99,
                borderWidth: 1.5,
                borderColor: selectedGenderId === null ? theme.colors.primary : theme.colors.border,
                backgroundColor: selectedGenderId === null ? theme.colors.primaryLight : theme.colors.surface,
              }}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: selectedGenderId === null ? theme.colors.primary : theme.colors.text.secondary,
              }}>
                Não informar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Controller
          control={control} name="ordem_psicologos"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Nº Ordem dos Psicólogos / CRP" placeholder="Ex: OPP 12345 ou CRP 06/123456"
              leftIcon="id-card-outline" autoCapitalize="characters"
              onChangeText={onChange} onBlur={onBlur} value={value}
              error={errors.ordem_psicologos?.message} />
          )}
        />
        <Controller
          control={control} name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Telefone" placeholder="(11) 99999-9999"
              leftIcon="call-outline" keyboardType="phone-pad"
              onChangeText={(v) => onChange(maskPhone(v))} onBlur={onBlur} value={value}
              error={errors.phone?.message} />
          )}
        />
        <Controller
          control={control} name="nif"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="CPF / NIF" placeholder="Número de identificação fiscal"
              leftIcon="card-outline" keyboardType="numeric"
              onChangeText={onChange} onBlur={onBlur} value={value}
              error={errors.nif?.message} />
          )}
        />

        {/* Endereço */}
        <Text style={sectionStyle}>Endereço</Text>

        <Controller
          control={control} name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Endereço" placeholder="Rua, número, complemento"
              leftIcon="location-outline" autoCapitalize="words"
              onChangeText={onChange} onBlur={onBlur} value={value}
              error={errors.address?.message} />
          )}
        />
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control} name="postal_code"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="CEP / Código postal" placeholder="00000-000" keyboardType="numeric"
                  onChangeText={onChange} onBlur={onBlur} value={value}
                  error={errors.postal_code?.message} />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control} name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Cidade" placeholder="São Paulo" autoCapitalize="words"
                  onChangeText={onChange} onBlur={onBlur} value={value}
                  error={errors.city?.message} />
              )}
            />
          </View>
        </View>
        <Controller
          control={control} name="country"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="País" placeholder="Brasil" autoCapitalize="words"
              onChangeText={onChange} onBlur={onBlur} value={value}
              error={errors.country?.message} />
          )}
        />

        {/* Logo profissional */}
        <Text style={sectionStyle}>Logo profissional</Text>
        <View
          style={{
            backgroundColor: '#fff', borderRadius: 12, padding: theme.spacing.md,
            borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.md,
            gap: theme.spacing.md,
          }}
        >
          {/* Preview */}
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 100, height: 100, borderRadius: 12, backgroundColor: '#F3F4F6',
                alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                borderWidth: 1, borderColor: theme.colors.border,
              }}
            >
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={{ width: 100, height: 100 }} resizeMode="contain" />
              ) : (
                <Ionicons name="image-outline" size={36} color={theme.colors.text.tertiary} />
              )}
              {isSavingLogo && (
                <View
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ActivityIndicator color={theme.colors.primary} />
                </View>
              )}
            </View>
          </View>

          <Text style={{ fontSize: 13, color: theme.colors.text.tertiary, textAlign: 'center' }}>
            Esta logo aparece nos formulários enviados aos seus pacientes.
          </Text>

          {/* URL input */}
          <View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text.secondary, marginBottom: 6 }}>
              URL da logo (https://...)
            </Text>
            <TextInput
              value={logoInput}
              onChangeText={setLogoInput}
              placeholder="https://exemplo.com/logo.png"
              placeholderTextColor={theme.colors.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={{
                borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8,
                paddingHorizontal: 12, paddingVertical: 10,
                fontSize: 14, color: theme.colors.text.primary, backgroundColor: '#FAFAFA',
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleSaveLogo}
            disabled={isSavingLogo}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              gap: 8, paddingVertical: 10, borderRadius: 8,
              borderWidth: 1, borderColor: theme.colors.primary,
              opacity: isSavingLogo ? 0.6 : 1,
            }}
          >
            <Ionicons name="cloud-upload-outline" size={18} color={theme.colors.primary} />
            <Text style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '600' }}>
              {isSavingLogo ? 'Salvando...' : 'Salvar logo'}
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Salvar alterações"
          onPress={handleSubmit(onSubmit)}
          loading={isPending}
          fullWidth
          size="lg"
          style={{ marginTop: theme.spacing.md }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const sectionStyle = {
  fontSize: 13,
  fontWeight: '700' as const,
  color: theme.colors.primary,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
  marginBottom: theme.spacing.sm,
  marginTop: theme.spacing.md,
}
