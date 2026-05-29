import React, { useCallback } from 'react'
import { View, Text, Alert, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PatientForm } from '@/components/patients/PatientForm'
import { theme } from '@/constants/theme'
import { useCreatePatient } from '@/hooks/usePatients'
import { PatientSchemaData } from '@/utils/validators'

export default function NewPatientScreen() {
  const insets = useSafeAreaInsets()
  const createMutation = useCreatePatient()

  const handleSubmit = useCallback(
    async (data: PatientSchemaData) => {
      const payload = {
        full_name: data.full_name,
        email: data.email || null,
        phone: data.phone || null,
        cpf: data.cpf || null,
        date_of_birth: data.date_of_birth || null,
        gender: (data.gender || null) as
          | 'male'
          | 'female'
          | 'other'
          | 'prefer_not_to_say'
          | null,
        status: data.status,
        notes: data.notes || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
      }

      await new Promise<void>((resolve, reject) => {
        createMutation.mutate(payload, {
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
      {/* Header */}
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
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text.primary}
          />
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
