import React, { useState, useEffect } from 'react'
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
  Modal,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { theme } from '@/constants/theme'
import { profileSchema, ProfileFormData } from '@/utils/validators'
import { maskPhone } from '@/utils/format'
import { useSessionStore } from '@/stores/session.store'
import { useUpdateProfile } from '@/hooks/useProfile'
import { profileService } from '@/services/profile.service'
import { supabase } from '@/services/supabase'
import { useGenders } from '@/hooks/useGenders'
import { Toast, useToast } from '@/components/ui/Toast'

// ─── Gender dropdown ──────────────────────────────────────────────────────────
function GenderDropdown({
  genders,
  value,
  onChange,
}: {
  genders: { id: string; name: string; terminology?: string | null }[]
  value: string | null
  onChange: (v: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const options = [
    { id: null, label: 'Não informar', sub: '' },
    ...genders.map((g) => ({
      id: g.id,
      label: g.name,
      sub: g.terminology ?? '',
    })),
  ]
  const selected = options.find((o) => o.id === value)

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <Text style={fieldLabel}>Género / Sexo</Text>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          borderWidth: 1.5, borderColor: open ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.md, paddingHorizontal: 14, minHeight: 52,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Text style={{ fontSize: 15, color: selected?.id !== undefined ? theme.colors.text.primary : theme.colors.text.tertiary, flex: 1 }}>
          {selected ? selected.label : 'Selecionar...'}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.text.tertiary} />
      </TouchableOpacity>
      {open && (
        <View style={{
          borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface, marginTop: 4, overflow: 'hidden',
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08,
          shadowRadius: 6, elevation: 3,
        }}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.id ?? '__none__'}
              onPress={() => { onChange(opt.id); setOpen(false) }}
              style={{
                flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
                paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border,
                backgroundColor: opt.id === value ? theme.colors.primaryLight : 'transparent',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, color: theme.colors.text.primary, fontWeight: opt.id === value ? '600' : '400' }}>
                  {opt.label}
                </Text>
                {opt.sub ? <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: 1 }}>{opt.sub}</Text> : null}
              </View>
              {opt.id === value && <Ionicons name="checkmark" size={18} color={theme.colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

// ─── Image upload helper ─────────────────────────────────────────────────────
async function pickAndUpload(
  bucket: string,
  path: string,
): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!perm.granted) {
    Alert.alert('Permissão necessária', 'Acesse as configurações do dispositivo para permitir o acesso à galeria.')
    return null
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  })
  if (result.canceled || !result.assets?.[0]) return null

  const asset = result.assets[0]
  const ext = asset.uri.split('.').pop() ?? 'jpg'
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg'

  const fetchResp = await fetch(asset.uri)
  const blob = await fetchResp.blob()

  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: mime, upsert: true })
  if (error) { Alert.alert('Erro', 'Não foi possível fazer o upload da imagem.'); return null }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
  return urlData.publicUrl + '?t=' + Date.now()
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { profile } = useSessionStore()
  const { mutateAsync, isPending } = useUpdateProfile()
  const { data: genders = [] } = useGenders()

  const { toast, showToast, hideToast } = useToast()
  const [selectedGenderId, setSelectedGenderId] = useState<string | null>(profile?.gender_id ?? null)
  const [genderError, setGenderError] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string>(profile?.logo_url ?? '')
  const [signatureUrl, setSignatureUrl] = useState<string>(profile?.signature_url ?? '')
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingSignature, setIsUploadingSignature] = useState(false)
  const [authEmail, setAuthEmail] = useState<string>('')

  // Load auth email
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthEmail(data?.user?.email ?? '')
    })
  }, [])

  const handleUploadLogo = async () => {
    if (!profile?.id) return
    setIsUploadingLogo(true)
    try {
      const url = await pickAndUpload('avatars', `logos/${profile.id}.jpg`)
      if (!url) return
      const result = await profileService.updateProfile(profile.id, { logo_url: url })
      if (result.error) throw new Error(result.error)
      setLogoUrl(url)
      Alert.alert('Salvo', 'Logo profissional atualizada!')
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a logo.')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleUploadSignature = async () => {
    if (!profile?.id) return
    setIsUploadingSignature(true)
    try {
      const url = await pickAndUpload('avatars', `signatures/${profile.id}.jpg`)
      if (!url) return
      const result = await profileService.updateProfile(profile.id, { signature_url: url } as never)
      if (result.error) throw new Error(result.error)
      setSignatureUrl(url)
      Alert.alert('Salvo', 'Assinatura atualizada!')
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a assinatura.')
    } finally {
      setIsUploadingSignature(false)
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
      professional_name: profile?.professional_name ?? '',
      ordem_psicologos: profile?.ordem_psicologos ?? '',
      phone: profile?.phone ?? '',
      address: profile?.address ?? '',
      postal_code: profile?.postal_code ?? '',
      city: profile?.city ?? '',
      country: profile?.country ?? '',
      nif: profile?.nif ?? '',
      birth_date: (profile as unknown as { birth_date?: string | null })?.birth_date
        ? (() => {
            const d = (profile as unknown as { birth_date: string }).birth_date
            const [y, m, day] = d.split('-')
            return `${day}/${m}/${y}`
          })()
        : '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    // Validate gender required
    if (!selectedGenderId) {
      setGenderError('Género é obrigatório')
      return
    }
    setGenderError(null)
    try {
      // Convert birth_date from DD/MM/YYYY to YYYY-MM-DD for storage
      let birthDateISO: string | null = null
      if (data.birth_date && data.birth_date.includes('/')) {
        const [d, m, y] = data.birth_date.split('/')
        birthDateISO = `${y}-${m}-${d}`
      }
      await mutateAsync({
        full_name: data.full_name,
        professional_name: data.professional_name || null,
        gender_id: selectedGenderId,
        ordem_psicologos: data.ordem_psicologos || null,
        phone: data.phone || null,
        address: data.address || null,
        postal_code: data.postal_code || null,
        city: data.city || null,
        country: data.country || null,
        nif: data.nif || null,
        ...(birthDateISO !== null ? { birth_date: birthDateISO } : {}),
      } as never)
      showToast('Perfil atualizado com sucesso!')
      setTimeout(() => router.back(), 800)
    } catch (err: unknown) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao salvar.')
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
          <TouchableOpacity style={{ position: 'relative' }} activeOpacity={0.8}>
            <Avatar name={profile?.full_name ?? '?'} url={profile?.avatar_url ?? null} size="xl" />
            <View style={{
              position: 'absolute', bottom: 0, right: 0, width: 30, height: 30,
              borderRadius: 15, backgroundColor: theme.colors.primary,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 2, borderColor: theme.colors.background,
            }}>
              <Ionicons name="camera" size={15} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: 13, color: theme.colors.text.tertiary, marginTop: theme.spacing.sm }}>
            Toque para alterar a foto
          </Text>
        </View>

        {/* Acesso */}
        <Text style={sectionStyle}>Acesso à conta</Text>

        {/* Email — read-only display */}
        <View style={{ marginBottom: theme.spacing.md }}>
          <Text style={fieldLabel}>E-mail de login *</Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            borderWidth: 1.5, borderColor: theme.colors.border,
            borderRadius: theme.radius.md, paddingHorizontal: 14, minHeight: 52,
            backgroundColor: theme.colors.surface, gap: 10,
          }}>
            <Ionicons name="mail-outline" size={18} color={theme.colors.text.tertiary} />
            <Text style={{ fontSize: 15, color: theme.colors.text.secondary, flex: 1 }}>
              {authEmail || '...'}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: theme.colors.text.tertiary, marginTop: 4 }}>
            Para alterar o e-mail, entre em contacto com o suporte.
          </Text>
        </View>

        {/* Password change */}
        <TouchableOpacity
          onPress={() => router.push('/(app)/settings/change-password')}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            borderWidth: 1.5, borderColor: theme.colors.border,
            borderRadius: theme.radius.md, paddingHorizontal: 14, minHeight: 52,
            backgroundColor: theme.colors.surface, marginBottom: theme.spacing.md,
          }}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.colors.text.tertiary} />
            <Text style={{ fontSize: 15, color: theme.colors.text.primary }}>Alterar senha</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.text.tertiary} />
        </TouchableOpacity>

        {/* Dados pessoais */}
        <Text style={sectionStyle}>Dados pessoais</Text>

        <Controller control={control} name="full_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Nome completo *" placeholder="Seu nome completo"
              leftIcon="person-outline" autoCapitalize="words"
              onChangeText={onChange} onBlur={onBlur} value={value}
              error={errors.full_name?.message} />
          )}
        />
        <Controller control={control} name="professional_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Nome profissional" placeholder="Nome exibido nas mensagens aos pacientes (ex: Ana Silva)"
              leftIcon="briefcase-outline" autoCapitalize="words"
              onChangeText={onChange} onBlur={onBlur} value={value ?? ''} />
          )}
        />

        {/* Género/Sexo — dropdown (obrigatório) */}
        <GenderDropdown
          genders={genders}
          value={selectedGenderId}
          onChange={(v) => { setSelectedGenderId(v); if (v) setGenderError(null) }}
        />
        {genderError && (
          <Text style={{ fontSize: 12, color: theme.colors.error, marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm }}>
            {genderError}
          </Text>
        )}

        <Controller control={control} name="ordem_psicologos"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Nº Ordem dos Psicólogos / CRP" placeholder="Ex: OPP 12345 ou CRP 06/123456"
              leftIcon="id-card-outline" autoCapitalize="characters"
              onChangeText={onChange} onBlur={onBlur} value={value}
              error={errors.ordem_psicologos?.message} />
          )}
        />
        <Controller control={control} name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Telefone" placeholder="Ex: 351 912 345 678"
              leftIcon="call-outline" keyboardType="phone-pad"
              onChangeText={(v) => onChange(maskPhone(v))} onBlur={onBlur} value={value}
              error={errors.phone?.message} />
          )}
        />
        <Controller control={control} name="nif"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="CPF / NIF" placeholder="Número de identificação fiscal"
              leftIcon="card-outline" keyboardType="numeric"
              onChangeText={onChange} onBlur={onBlur} value={value}
              error={errors.nif?.message} />
          )}
        />
        <Controller control={control} name="birth_date"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Data de nascimento" placeholder="DD/MM/AAAA"
              leftIcon="calendar-outline" keyboardType="numeric"
              onChangeText={(v) => {
                // Auto-mask DD/MM/YYYY
                const digits = v.replace(/\D/g, '').slice(0, 8)
                let masked = digits
                if (digits.length > 2) masked = digits.slice(0, 2) + '/' + digits.slice(2)
                if (digits.length > 4) masked = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4)
                onChange(masked)
              }}
              onBlur={onBlur} value={value ?? ''}
              error={(errors as { birth_date?: { message?: string } }).birth_date?.message} />
          )}
        />

        {/* Morada / Endereço */}
        <Text style={sectionStyle}>Morada</Text>

        <Controller control={control} name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Endereço" placeholder="Rua, número, complemento"
              leftIcon="location-outline" autoCapitalize="words"
              onChangeText={onChange} onBlur={onBlur} value={value}
              error={errors.address?.message} />
          )}
        />
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Controller control={control} name="postal_code"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Código postal" placeholder="0000-000" keyboardType="numeric"
                  onChangeText={onChange} onBlur={onBlur} value={value}
                  error={errors.postal_code?.message} />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller control={control} name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Cidade" placeholder="Lisboa" autoCapitalize="words"
                  onChangeText={onChange} onBlur={onBlur} value={value}
                  error={errors.city?.message} />
              )}
            />
          </View>
        </View>
        <Controller control={control} name="country"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="País" placeholder="Portugal" autoCapitalize="words"
              onChangeText={onChange} onBlur={onBlur} value={value}
              error={errors.country?.message} />
          )}
        />

        {/* Logo profissional */}
        <Text style={sectionStyle}>Logo profissional</Text>
        <View style={{
          backgroundColor: theme.colors.surface, borderRadius: 12, padding: theme.spacing.md,
          borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.md, gap: theme.spacing.md,
        }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{
              width: 100, height: 100, borderRadius: 12, backgroundColor: '#F3F4F6',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              borderWidth: 1, borderColor: theme.colors.border,
            }}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={{ width: 100, height: 100 }} resizeMode="contain" />
              ) : (
                <Ionicons name="image-outline" size={36} color={theme.colors.text.tertiary} />
              )}
              {isUploadingLogo && (
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ActivityIndicator color={theme.colors.primary} />
                </View>
              )}
            </View>
          </View>
          <Text style={{ fontSize: 13, color: theme.colors.text.tertiary, textAlign: 'center' }}>
            Esta logo aparece nos formulários enviados aos seus pacientes.
          </Text>
          <TouchableOpacity
            onPress={handleUploadLogo}
            disabled={isUploadingLogo}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              gap: 8, paddingVertical: 12, borderRadius: 8,
              backgroundColor: theme.colors.primaryLight,
              opacity: isUploadingLogo ? 0.6 : 1,
            }}
          >
            <Ionicons name="cloud-upload-outline" size={18} color={theme.colors.primary} />
            <Text style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '600' }}>
              {isUploadingLogo ? 'Enviando...' : logoUrl ? 'Alterar logo' : 'Carregar logo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Assinatura digital */}
        <Text style={sectionStyle}>Assinatura digital</Text>
        <View style={{
          backgroundColor: theme.colors.surface, borderRadius: 12, padding: theme.spacing.md,
          borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.md, gap: theme.spacing.md,
        }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{
              width: '100%', height: 100, borderRadius: 8, backgroundColor: '#F9FAFB',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed',
            }}>
              {signatureUrl ? (
                <Image source={{ uri: signatureUrl }} style={{ width: '100%', height: 100 }} resizeMode="contain" />
              ) : (
                <View style={{ alignItems: 'center', gap: 6 }}>
                  <Ionicons name="create-outline" size={28} color={theme.colors.text.tertiary} />
                  <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>Sem assinatura</Text>
                </View>
              )}
              {isUploadingSignature && (
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ActivityIndicator color={theme.colors.primary} />
                </View>
              )}
            </View>
          </View>
          <Text style={{ fontSize: 13, color: theme.colors.text.tertiary, textAlign: 'center' }}>
            Usada em documentos e relatórios gerados pelo sistema.
          </Text>
          <TouchableOpacity
            onPress={handleUploadSignature}
            disabled={isUploadingSignature}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              gap: 8, paddingVertical: 12, borderRadius: 8,
              backgroundColor: theme.colors.primaryLight,
              opacity: isUploadingSignature ? 0.6 : 1,
            }}
          >
            <Ionicons name="cloud-upload-outline" size={18} color={theme.colors.primary} />
            <Text style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '600' }}>
              {isUploadingSignature ? 'Enviando...' : signatureUrl ? 'Alterar assinatura' : 'Carregar assinatura'}
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

const fieldLabel = {
  fontSize: 12,
  fontWeight: '600' as const,
  color: theme.colors.text.secondary,
  marginBottom: 6,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.4,
}
