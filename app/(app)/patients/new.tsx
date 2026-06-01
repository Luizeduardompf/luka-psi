import React, { useCallback } from 'react'
import { View, Text, Alert, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PatientForm } from '@/components/patients/PatientForm'
import { theme } from '@/constants/theme'
import { useCreatePatient } from '@/hooks/usePatients'
import { PatientSchemaData } from '@/utils/validators'

function schemaToInsert(data: PatientSchemaData) {
  return {
    full_name: data.full_name,
    preferred_name: data.preferred_name || null,
    email: data.email || null,
    phone: data.phone || null,
    phone_ddi: data.phone_ddi || null,
    cpf: data.cpf || null,
    nif: data.nif || null,
    date_of_birth: data.date_of_birth || null,
    gender: data.gender || null,
    profession: data.profession || null,
    education: data.education || null,
    civil_status_id: data.civil_status_id || null,
    status: data.status,
    address: data.address || null,
    billing_address: data.billing_address || null,
    postal_code: data.postal_code || null,
    city: data.city || null,
    spouse_name: data.spouse_name || null,
    spouse_phone: data.spouse_phone || null,
    spouse_email: data.spouse_email || null,
    tutor_name: data.tutor_name || null,
    tutor_phone: data.tutor_phone || null,
    tutor_email: data.tutor_email || null,
    additional_contacts: data.additional_contacts ?? [],
    emergency_contact_name: data.emergency_contact_name || null,
    emergency_contact_phone: data.emergency_contact_phone || null,
    insurer_id: data.insurer_id || null,
    plan_id: data.plan_id || null,
    sns_user_number: data.sns_user_number || null,
    local_protocol: data.local_protocol || null,
    consent_rgpd: data.consent_rgpd ?? false,
    consent_informed: data.consent_informed ?? false,
    consent_minors: data.consent_minors ?? false,
    notes: data.notes || null,
  }
}

export default function NewPatientScreen() {
  const insets = useSafeAreaInsets()
  const createMutation = useCreatePatient()

  const handleSubmit = useCallback(
    async (data: PatientSchemaData) => {
      await new Promise<void>((resolve, reject) => {
        createMutation.mutate(schemaToInsert(data), {
          onSuccess: () => {
            resolve()
            router.back()
          },
          onError: (err) => {
            Alert.alert('Erro ao salvar', err.message)
            reject(err)
          },
        })
      })
    },
    [createMutation],
  )

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          gap: theme.spacing.sm,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text.primary,
          }}
        >
          Novo paciente
        </Text>
      </View>

      <PatientForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        submitLabel="Salvar paciente"
      />
    </View>
  )
}
