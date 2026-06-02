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
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Badge, statusVariantMap, statusLabelMap } from '@/components/ui/Badge'
import { PatientForm } from '@/components/patients/PatientForm'
import { PatientFormsTab } from '@/components/forms/PatientFormsTab'
import { theme } from '@/constants/theme'
import { usePatient, useUpdatePatient, useDeletePatient } from '@/hooks/usePatients'
import { useCivilStatuses, useInsurers, usePlans, useCountries, usePracticeLocations } from '@/hooks/useLookups'
import { formatDate, formatPhone, formatCpf, getPatientAvatarUrl } from '@/utils/format'

function calcAge(dob: string | null | undefined): string | null {
  if (!dob) return null
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return `${age} anos`
}
import { PatientSchemaData } from '@/utils/validators'
import { PatientStatus } from '@/types/app.types'
import { useGenders } from '@/hooks/useGenders'
import { Toast, useToast } from '@/components/ui/Toast'

type ActiveTab = 'info' | 'sessions' | 'forms' | 'attachments'

const TAB_LABELS: Record<ActiveTab, string> = {
  info: 'Informações',
  sessions: 'Sessões',
  forms: 'Formulários',
  attachments: 'Anexos',
}

function PlaceholderTab({ icon, label, description }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; description: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.xl }}>
      <View style={{
        width: 72, height: 72, borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons name={icon} size={36} color={theme.colors.primary} />
      </View>
      <Text style={{ ...theme.typography.h3, color: theme.colors.text.primary }}>{label}</Text>
      <Text style={{ ...theme.typography.body, color: theme.colors.text.tertiary, textAlign: 'center' }}>{description}</Text>
    </View>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text style={{
      ...theme.typography.overline,
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.xs,
      paddingHorizontal: 2,
    }}>
      {title}
    </Text>
  )
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.sm }} />
}

function ConsentRow({ label, granted }: { label: string; granted: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
      <View style={{
        width: 32, height: 32, borderRadius: theme.radius.sm,
        backgroundColor: granted ? theme.colors.successLight : theme.colors.surfaceSecondary,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons
          name={granted ? 'checkmark-circle' : 'ellipse-outline'}
          size={16}
          color={granted ? theme.colors.success : theme.colors.text.tertiary}
        />
      </View>
      <Text style={{ ...theme.typography.body, color: granted ? theme.colors.text.primary : theme.colors.text.tertiary, flex: 1 }}>
        {label}
      </Text>
      <Text style={{ ...theme.typography.caption, color: granted ? theme.colors.success : theme.colors.text.tertiary, fontWeight: '600' }}>
        {granted ? 'Concedido' : 'Pendente'}
      </Text>
    </View>
  )
}

function FichaItem({ label, value, flex }: { label: string; value: string; flex?: number }) {
  return (
    <View style={{ flex: flex ?? 1 }}>
      <Text style={{ ...theme.typography.caption, color: theme.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 }}>
        {label}
      </Text>
      <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.text.primary }}>
        {value}
      </Text>
    </View>
  )
}

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

function ContactInfoRow({
  icon,
  label,
  name,
  phone,
  email,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  name: string | null | undefined
  phone?: string | null | undefined
  email?: string | null | undefined
}) {
  if (!name) return null
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 }}>
      <View style={{
        width: 32, height: 32, borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons name={icon} size={16} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginBottom: 2 }}>{label}</Text>
        <Text style={{ fontSize: 15, color: theme.colors.text.primary, fontWeight: '500' }}>{name}</Text>
        {phone ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <Ionicons name="call-outline" size={12} color={theme.colors.text.tertiary} />
            <Text style={{ ...theme.typography.bodySmall, color: theme.colors.text.secondary }}>{phone}</Text>
          </View>
        ) : null}
        {email ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Ionicons name="mail-outline" size={12} color={theme.colors.text.tertiary} />
            <Text style={{ ...theme.typography.bodySmall, color: theme.colors.text.secondary }}>{email}</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

const GENDER_LABEL: Record<string, string> = {
  female_cis: 'Feminino (cisgênero)',
  male_cis: 'Masculino (cisgênero)',
  female_trans: 'Feminino (transgênero)',
  male_trans: 'Masculino (transgênero)',
  non_binary: 'Não binário',
  prefer_not_to_say: 'Prefere não informar',
  male: 'Masculino',
  female: 'Feminino',
  other: 'Outro',
}

export default function PatientDetailScreen() {
  const { id, tab: initialTab } = useLocalSearchParams<{ id: string; tab?: string }>()
  const insets = useSafeAreaInsets()
  const [editVisible, setEditVisible] = useState(false)
  const validTabs: ActiveTab[] = ['info', 'sessions', 'forms', 'attachments']
  const [activeTab, setActiveTab] = useState<ActiveTab>('info')

  // Ao ganhar foco: reseta para 'info' excepto se vier com param `tab` explícito (pilha)
  useFocusEffect(
    useCallback(() => {
      const target = validTabs.includes(initialTab as ActiveTab)
        ? (initialTab as ActiveTab)
        : 'info'
      setActiveTab(target)
    }, [initialTab])
  )

  const { data: patient, isLoading, refetch } = usePatient(id)
  const updateMutation = useUpdatePatient(id)
  const deleteMutation = useDeletePatient()
  const { data: gendersData = [] } = useGenders()
  const { data: civilStatuses = [] } = useCivilStatuses()
  const { data: insurers = [] } = useInsurers()
  const { data: plans = [] } = usePlans(patient?.insurer_id ?? undefined)
  const { data: countries = [] } = useCountries()
  const { data: practiceLocations = [] } = usePracticeLocations()
  const { toast, showToast, hideToast } = useToast()

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
            preferred_name: data.preferred_name || null,
            email: data.email || null,
            phone: data.phone || null,
            cpf: data.cpf || null,
            nif: data.nif || null,
            date_of_birth: data.date_of_birth || null,
            gender: data.gender || null,
            gender_id: data.gender_id || null,
            profession: data.profession || null,
            education: data.education || null,
            civil_status_id: data.civil_status_id || null,
            status: data.status,
            address: data.address || null,
            billing_address: data.billing_address || null,
            postal_code: data.postal_code || null,
            city: data.city || null,
            country_id: data.country_id || null,
            practice_location_id: data.practice_location_id || null,
            spouse_name: data.spouse_name || null,
            spouse_phone_ddi: data.spouse_phone_ddi || null,
            spouse_phone: data.spouse_phone || null,
            spouse_email: data.spouse_email || null,
            tutor_name: data.tutor_name || null,
            tutor_phone_ddi: data.tutor_phone_ddi || null,
            tutor_phone: data.tutor_phone || null,
            tutor_email: data.tutor_email || null,
            additional_contacts: data.additional_contacts ?? [],
            emergency_contact_name: data.emergency_contact_name || null,
            emergency_contact_phone_ddi: data.emergency_contact_phone_ddi || null,
            emergency_contact_phone: data.emergency_contact_phone || null,
            insurer_id: data.insurer_id || null,
            plan_id: data.plan_id || null,
            plan_name: data.plan_name || null,
            sns_user_number: data.sns_user_number || null,
            local_protocol: data.local_protocol || null,
            consent_rgpd: data.consent_rgpd ?? false,
            consent_informed: data.consent_informed ?? false,
            consent_minors: data.consent_minors ?? false,
            notes: data.notes || null,
          },
          {
            onSuccess: () => {
              resolve()
              setEditVisible(false)
              showToast('Paciente atualizado com sucesso!')
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
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
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

      {/* Tab switcher */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        {(['info', 'sessions', 'forms', 'attachments'] as ActiveTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor:
                activeTab === tab ? theme.colors.primary : 'transparent',
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color:
                  activeTab === tab
                    ? theme.colors.primary
                    : theme.colors.text.tertiary,
              }}
            >
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'forms' ? (
        <PatientFormsTab patientId={patient.id} patientName={patient.full_name} />
      ) : activeTab === 'sessions' ? (
        <PlaceholderTab icon="calendar-outline" label="Sessões" description="O histórico de sessões estará disponível em breve." />
      ) : activeTab === 'attachments' ? (
        <PlaceholderTab icon="attach-outline" label="Anexos" description="Gestão de documentos e anexos estará disponível em breve." />
      ) : (

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
            <Avatar
              name={patient.full_name}
              uri={getPatientAvatarUrl(patient.full_name, patient.gender)}
              size="xl"
            />
            <View style={{ alignItems: 'center', gap: 4 }}>
              {patient.preferred_name && patient.preferred_name !== patient.full_name && (
                <Text
                  style={{
                    ...theme.typography.h3,
                    color: theme.colors.primary,
                    textAlign: 'center',
                  }}
                >
                  {patient.preferred_name}
                </Text>
              )}
              <Text
                style={{
                  fontSize: patient.preferred_name && patient.preferred_name !== patient.full_name ? 14 : 22,
                  fontWeight: patient.preferred_name && patient.preferred_name !== patient.full_name ? '400' : '700',
                  color: patient.preferred_name && patient.preferred_name !== patient.full_name
                    ? theme.colors.text.secondary
                    : theme.colors.text.primary,
                  textAlign: 'center',
                }}
              >
                {patient.full_name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <Badge
                  label={statusLabelMap[status] ?? status}
                  variant={statusVariantMap[status] ?? 'default'}
                />
                {patient.practice_location_id && (() => {
                  const loc = practiceLocations.find((l) => l.id === patient.practice_location_id)
                  if (!loc) return null
                  return (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.radius.full, backgroundColor: theme.colors.surfaceSecondary }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: loc.color }} />
                      <Text style={{ ...theme.typography.caption, fontWeight: '500', color: theme.colors.text.secondary }}>{loc.name}</Text>
                    </View>
                  )
                })()}
              </View>
            </View>
          </View>
        </Card>

        {/* Ficha de resumo */}
        <Card>
          <View style={{ gap: theme.spacing.md }}>

            <View style={{ flexDirection: 'row' }}>
              <FichaItem
                label="Nascimento"
                value={`${formatDate(patient.date_of_birth)}${calcAge(patient.date_of_birth) ? ` · ${calcAge(patient.date_of_birth)}` : ''}`}
              />
              <FichaItem
                label="Cidade"
                value={[
                  patient.city,
                  countries.find((c) => c.id === patient.country_id)?.name,
                ].filter(Boolean).join(', ') || '—'}
              />
            </View>

            <View style={{ flexDirection: 'row' }}>
              {patient.tutor_name
                ? <FichaItem label="Responsável" value={patient.tutor_name} />
                : <View style={{ flex: 1 }} />
              }
              <FichaItem label="Cadastro" value={formatDate(patient.created_at)} />
            </View>

            <View style={{ width: '100%', height: 1, backgroundColor: theme.colors.border }} />

            {/* 1ª consulta */}
            <View style={{ width: '100%', flexDirection: 'row' }}>
              <FichaItem label="1ª Consulta" value="—" />
              <FichaItem label="Valor" value="—" />
            </View>

            <View style={{ width: '100%', height: 1, backgroundColor: theme.colors.borderLight }} />

            {/* Última consulta */}
            <View style={{ width: '100%', flexDirection: 'row' }}>
              <FichaItem label="Última Consulta" value="—" />
              <FichaItem label="Valor" value="—" />
            </View>

            <View style={{ width: '100%', height: 1, backgroundColor: theme.colors.borderLight }} />

            {/* Próxima consulta */}
            <View style={{ width: '100%', flexDirection: 'row' }}>
              <FichaItem label="Próxima Consulta" value="—" />
            </View>

          </View>
        </Card>

        {/* ── Contato ──────────────────────────────────────────────── */}
        <SectionTitle title="Contato" />
        <Card>
          <InfoRow icon="mail-outline" label="E-mail" value={patient.email} />
          <InfoRow icon="call-outline" label="Telefone" value={patient.phone ? formatPhone(patient.phone) : null} />
          <InfoRow icon="phone-portrait-outline" label="Telefone alternativo" value={null} />
          {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
            <>
              <Divider />
              <ContactInfoRow icon="alert-circle-outline" label="Contato de emergência" name={patient.emergency_contact_name} phone={patient.emergency_contact_phone ? formatPhone(patient.emergency_contact_phone) : null} />
            </>
          )}
          {(patient.tutor_name || patient.tutor_phone || patient.tutor_email) && (
            <>
              <Divider />
              <ContactInfoRow icon="people-outline" label="Responsável" name={patient.tutor_name} phone={patient.tutor_phone ? formatPhone(patient.tutor_phone) : null} email={patient.tutor_email} />
            </>
          )}
          {(patient.spouse_name || patient.spouse_phone || patient.spouse_email) && (
            <>
              <Divider />
              <ContactInfoRow icon="heart-outline" label="Cônjuge" name={patient.spouse_name} phone={patient.spouse_phone ? formatPhone(patient.spouse_phone) : null} email={patient.spouse_email} />
            </>
          )}
        </Card>

        {/* ── Informações pessoais ──────────────────────────────────── */}
        <SectionTitle title="Informações pessoais" />
        <Card>
          <InfoRow
            icon="calendar-outline"
            label="Data de nascimento"
            value={patient.date_of_birth
              ? `${formatDate(patient.date_of_birth)}${calcAge(patient.date_of_birth) ? ` · ${calcAge(patient.date_of_birth)}` : ''}`
              : null}
          />
          <InfoRow
            icon="transgender-outline"
            label="Gênero"
            value={
              patient.gender_id
                ? (gendersData.find((g) => g.id === patient.gender_id)?.name ?? null)
                : patient.gender ? GENDER_LABEL[patient.gender] : null
            }
          />
          <InfoRow
            icon="ribbon-outline"
            label="Estado civil"
            value={patient.civil_status_id
              ? (civilStatuses.find((c) => c.id === patient.civil_status_id)?.name ?? null)
              : null}
          />
          <InfoRow icon="briefcase-outline" label="Profissão" value={patient.profession ?? null} />
          <InfoRow icon="school-outline" label="Escolaridade" value={patient.education ?? null} />
          <Divider />
          <InfoRow icon="card-outline" label="CPF" value={patient.cpf ? formatCpf(patient.cpf) : null} />
          <InfoRow icon="card-outline" label="NIF" value={patient.nif ?? null} />
          <InfoRow icon="medkit-outline" label="N.º Utente SNS" value={patient.sns_user_number ?? null} />
          <InfoRow icon="document-text-outline" label="Protocolo local" value={patient.local_protocol ?? null} />
          <Divider />
          <InfoRow icon="location-outline" label="Morada" value={patient.address ?? null} />
          <InfoRow icon="home-outline" label="Morada de faturação" value={patient.billing_address ?? null} />
          <InfoRow icon="mail-outline" label="Código postal" value={patient.postal_code ?? null} />
          <InfoRow icon="business-outline" label="Cidade" value={patient.city ?? null} />
        </Card>

        {/* ── Seguro / Plano ────────────────────────────────────────── */}
        {(patient.insurer_id || patient.plan_name) && (
          <>
            <SectionTitle title="Seguro de saúde" />
            <Card>
              <InfoRow
                icon="shield-checkmark-outline"
                label="Seguradora"
                value={patient.insurer_id ? (insurers.find((i) => i.id === patient.insurer_id)?.name ?? null) : null}
              />
              <InfoRow
                icon="list-outline"
                label="Plano / Modalidade"
                value={patient.plan_name ?? null}
              />
            </Card>
          </>
        )}

        {/* ── Consentimentos ────────────────────────────────────────── */}
        <SectionTitle title="Consentimentos" />
        <Card>
          <ConsentRow label="RGPD / Proteção de dados" granted={patient.consent_rgpd} />
          <ConsentRow label="Consentimento informado" granted={patient.consent_informed} />
          <ConsentRow label="Autorização de menores" granted={patient.consent_minors} />
        </Card>

        {/* ── Notas clínicas ────────────────────────────────────────── */}
        {patient.notes && (
          <>
            <SectionTitle title="Notas clínicas" />
            <Card>
              <Text style={{ ...theme.typography.body, color: theme.colors.text.primary, lineHeight: 22 }}>
                {patient.notes}
              </Text>
            </Card>
          </>
        )}

        {/* ── Excluir ───────────────────────────────────────────────── */}
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
            backgroundColor: theme.colors.errorLight,
          }}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
          <Text style={{ color: theme.colors.error, fontSize: 15, fontWeight: '600' }}>
            Excluir paciente
          </Text>
        </TouchableOpacity>
      </ScrollView>

      )}

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
