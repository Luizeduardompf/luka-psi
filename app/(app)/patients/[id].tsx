import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Badge, statusVariantMap, statusLabelMap } from '@/components/ui/Badge'
import { PatientForm } from '@/components/patients/PatientForm'
import { theme } from '@/constants/theme'
import { usePatient, useUpdatePatient, useDeletePatient } from '@/hooks/usePatients'
import { formatDate, formatPhone, formatCpf } from '@/utils/format'
import { PatientSchemaData } from '@/utils/validators'
import { PatientStatus } from '@/types/app.types'

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 8,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: theme.radius.sm,
          backgroundColor: theme.colors.primaryLight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={16} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 12, color: theme.colors.text.tertiary, marginBottom: 2 }}
        >
          {label}
        </Text>
        <Text style={{ fontSize: 15, color: theme.colors.text.primary }}>
          {value}
        </Text>
      </View>
    </View>
  )
}

const GENDER_LABEL: Record<string, string> = {
  male: 'Masculino',
  female: 'Feminino',
  other: 'Outro',
  prefer_not_to_say: 'Prefere não informar',
}

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const [editVisible, setEditVisible] = useState(false)

  const { data: patient, isLoading, refetch } = usePatient(id)
  const updateMutation = useUpdatePatient(id)
  const deleteMutation = useDeletePatient()

  const handleDelete = useCallback(() => {
    if (!patient) return
    Alert.alert(
      'Excluir paciente',
      `Tem certeza que deseja excluir ${patient.full_name}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(patient.id, {
              onSuccess: () => router.back(),
              onError: (err) => Alert.alert('Erro', err.message),
            })
          },
        },
      ],
    )
  }, [patient, deleteMutation])

  const handleUpdate = useCallback(
    async (data: PatientSchemaData) => {
      await new Promise<void>((resolve, reject) => {
        updateMutation.mutate(
          {
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
          },
          {
            onSuccess: () => {
              resolve()
              setEditVisible(false)
              void refetch()
            },
            onError: (err) => {
              Alert.alert('Erro ao atualizar', err.message)
              reject(err)
            },
          },
        )
      })
    },
    [updateMutation, refetch],
  )

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    )
  }

  if (!patient) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text.secondary }}>Paciente não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const status = patient.status as PatientStatus

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
      }}
    >
      {/* Header bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
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
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text.primary,
            flex: 1,
            textAlign: 'center',
            marginHorizontal: theme.spacing.sm,
          }}
          numberOfLines={1}
        >
          Detalhes do paciente
        </Text>

        <TouchableOpacity
          onPress={() => setEditVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing.xl,
          gap: theme.spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <Card elevated>
          <View style={{ alignItems: 'center', gap: 12 }}>
            <Avatar name={patient.full_name} size="xl" />
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '700',
                  color: theme.colors.text.primary,
                  textAlign: 'center',
                }}
              >
                {patient.full_name}
              </Text>
              <Badge
                label={statusLabelMap[status] ?? status}
                variant={statusVariantMap[status] ?? 'default'}
              />
            </View>
          </View>
        </Card>

        {/* Personal info */}
        <View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: theme.colors.text.tertiary,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: theme.spacing.sm,
            }}
          >
            Informações pessoais
          </Text>
          <Card>
            <InfoRow
              icon="calendar-outline"
              label="Data de nascimento"
              value={formatDate(patient.date_of_birth)}
            />
            <InfoRow
              icon="transgender-outline"
              label="Gênero"
              value={patient.gender ? GENDER_LABEL[patient.gender] : null}
            />
            <InfoRow
              icon="card-outline"
              label="CPF"
              value={patient.cpf ? formatCpf(patient.cpf) : null}
            />
          </Card>
        </View>

        {/* Contact */}
        <View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: theme.colors.text.tertiary,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: theme.spacing.sm,
            }}
          >
            Contato
          </Text>
          <Card>
            <InfoRow
              icon="mail-outline"
              label="E-mail"
              value={patient.email}
            />
            <InfoRow
              icon="call-outline"
              label="Telefone"
              value={patient.phone ? formatPhone(patient.phone) : null}
            />
            {(patient.emergency_contact_name ||
              patient.emergency_contact_phone) && (
              <>
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.colors.border,
                    marginVertical: 8,
                  }}
                />
                <InfoRow
                  icon="people-outline"
                  label="Contato de emergência"
                  value={patient.emergency_contact_name}
                />
                <InfoRow
                  icon="call-outline"
                  label="Telefone do contato"
                  value={
                    patient.emergency_contact_phone
                      ? formatPhone(patient.emergency_contact_phone)
                      : null
                  }
                />
              </>
            )}
          </Card>
        </View>

        {/* Notes */}
        {patient.notes && (
          <View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: theme.colors.text.tertiary,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: theme.spacing.sm,
              }}
            >
              Notas clínicas
            </Text>
            <Card>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.text.primary,
                  lineHeight: 22,
                }}
              >
                {patient.notes}
              </Text>
            </Card>
          </View>
        )}

        {/* Sessions placeholder */}
        <View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: theme.colors.text.tertiary,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: theme.spacing.sm,
            }}
          >
            Sessões
          </Text>
          <Card>
            <View
              style={{
                alignItems: 'center',
                paddingVertical: theme.spacing.lg,
                gap: 8,
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={36}
                color={theme.colors.text.tertiary}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                }}
              >
                Histórico de sessões em breve.{'\n'}Esta funcionalidade está
                sendo desenvolvida.
              </Text>
            </View>
          </Card>
        </View>

        {/* Delete button */}
        <TouchableOpacity
          onPress={handleDelete}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: theme.radius.lg,
            borderWidth: 1.5,
            borderColor: theme.colors.error + '60',
            backgroundColor: '#FEE2E2',
          }}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
          <Text
            style={{
              color: theme.colors.error,
              fontSize: 15,
              fontWeight: '600',
            }}
          >
            Excluir paciente
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit modal */}
      <Modal
        visible={editVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            paddingTop: theme.spacing.md,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: theme.spacing.md,
              paddingBottom: theme.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: theme.colors.text.primary,
              }}
            >
              Editar paciente
            </Text>
            <TouchableOpacity onPress={() => setEditVisible(false)}>
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          <PatientForm
            initialData={patient}
            onSubmit={handleUpdate}
            isLoading={updateMutation.isPending}
            submitLabel="Salvar alterações"
          />
        </View>
      </Modal>
    </View>
  )
}
