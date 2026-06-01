import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/constants/theme'
import { useSessionStore } from '@/stores/session.store'
import { profileService } from '@/services/profile.service'

const TERMINOLOGY_OPTIONS = [
  { value: 'Paciente', description: 'Padrão clínico em Portugal e Brasil' },
  { value: 'Cliente', description: 'Comum em contexto de coaching e terapias alternativas' },
  { value: 'Utente', description: 'Usado no sistema público de saúde português' },
  { value: 'Beneficiário', description: 'Utilizado em contextos de planos de saúde' },
  { value: 'Participante', description: 'Adequado para contextos de investigação ou grupos' },
  { value: 'Colaborador', description: 'Usado em psicologia organizacional' },
]

export default function TerminologyScreen() {
  const insets = useSafeAreaInsets()
  const { profile, setProfile } = useSessionStore()
  const [current, setCurrent] = useState(profile?.patient_terminology ?? 'Paciente')
  const [saving, setSaving] = useState(false)

  const handleSelect = async (value: string) => {
    if (!profile?.id) return
    setSaving(true)
    try {
      const result = await profileService.updateProfile(profile.id, { patient_terminology: value } as never)
      if (result.error) throw new Error(result.error)
      setCurrent(value)
      if (result.data) setProfile(result.data)
      Alert.alert('Guardado', `Terminologia alterada para "${value}".`)
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao guardar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{
        paddingTop: insets.top + theme.spacing.sm,
        paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary, flex: 1 }}>
          Terminologia de pacientes
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: insets.bottom + 40 }}>
        <Text style={{ fontSize: 14, color: theme.colors.text.secondary, marginBottom: theme.spacing.lg, lineHeight: 20 }}>
          Escolha o termo usado para referir as pessoas que acompanha. Esta configuração aplica-se a menus, formulários, agenda e relatórios.
        </Text>

        {TERMINOLOGY_OPTIONS.map((opt) => {
          const selected = current === opt.value
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => handleSelect(opt.value)}
              disabled={saving}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: selected ? theme.colors.primaryLight : theme.colors.surface,
                borderRadius: 12, padding: theme.spacing.md, marginBottom: 10,
                borderWidth: 1.5, borderColor: selected ? theme.colors.primary : theme.colors.border,
                opacity: saving ? 0.6 : 1,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: selected ? theme.colors.primary : theme.colors.text.primary }}>
                  {opt.value}
                </Text>
                <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginTop: 2 }}>
                  {opt.description}
                </Text>
              </View>
              {selected && <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}
