import React, { memo, useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
  Alert,
} from 'react-native'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format, parseISO, isValid } from 'date-fns'
import { Ionicons } from '@expo/vector-icons'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { theme } from '@/constants/theme'
import { patientSchema, PatientSchemaData } from '@/utils/validators'
import { maskCpf, maskNif, maskPhone } from '@/utils/format'
import {
  STATUS_OPTIONS,
  EDUCATION_OPTIONS,
  Patient,
} from '@/types/app.types'
import { useCivilStatuses, useInsurers, usePlans } from '@/hooks/useLookups'
import { useGenders } from '@/hooks/useGenders'

interface PatientFormProps {
  initialData?: Partial<Patient>
  onSubmit: (data: PatientSchemaData) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

const SectionHeader = memo(function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.md,
      }}
    >
      {title}
    </Text>
  )
})

function ChipSelector({
  options,
  value,
  onChange,
  wrap = true,
}: {
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
  wrap?: boolean
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: wrap ? 'wrap' : undefined, gap: 8 }}>
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(selected ? '' : opt.value)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: theme.radius.full,
              backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceSecondary,
              borderWidth: 1,
              borderColor: selected ? theme.colors.primary : theme.colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: selected ? '600' : '400',
                color: selected ? '#FFFFFF' : theme.colors.text.secondary,
              }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

function SelectDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecionar...',
}: {
  label: string
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: theme.colors.text.secondary,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1.5,
          borderColor: open ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.md,
          minHeight: 52,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: selected ? theme.colors.text.primary : theme.colors.text.tertiary,
            flex: 1,
          }}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={theme.colors.text.tertiary}
        />
      </TouchableOpacity>

      {open && (
        <View
          style={{
            borderWidth: 1.5,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            marginTop: 4,
            backgroundColor: theme.colors.surface,
            maxHeight: 220,
            overflow: 'hidden',
          }}
        >
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: theme.spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                  backgroundColor:
                    value === opt.value ? theme.colors.primary + '10' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color:
                      value === opt.value
                        ? theme.colors.primary
                        : theme.colors.text.primary,
                    fontWeight: value === opt.value ? '600' : '400',
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

function ConsentRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Text
        style={{
          flex: 1,
          fontSize: 14,
          color: theme.colors.text.primary,
          paddingRight: 12,
          lineHeight: 20,
        }}
      >
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
        thumbColor={value ? theme.colors.primary : '#fff'}
      />
    </View>
  )
}

export const PatientForm = memo(function PatientForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = 'Salvar',
}: PatientFormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedInsurerId, setSelectedInsurerId] = useState<string>(
    initialData?.insurer_id ?? '',
  )

  const { data: civilStatuses } = useCivilStatuses()
  const { data: insurers } = useInsurers()
  const { data: plans } = usePlans(selectedInsurerId || undefined)
  const { data: gendersData = [] } = useGenders()

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientSchemaData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      // Identification
      full_name: initialData?.full_name ?? '',
      preferred_name: initialData?.preferred_name ?? '',
      date_of_birth: initialData?.date_of_birth ?? '',
      gender: initialData?.gender ?? '',
      gender_id: initialData?.gender_id ?? '',
      profession: initialData?.profession ?? '',
      education: initialData?.education ?? '',
      civil_status_id: initialData?.civil_status_id ?? '',
      status: initialData?.status ?? 'active',

      // Contact
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      phone_ddi: (initialData as any)?.phone_ddi ?? '',

      // Documents
      cpf: initialData?.cpf ?? '',
      nif: initialData?.nif ?? '',

      // Address
      address: initialData?.address ?? '',
      billing_address: initialData?.billing_address ?? '',
      postal_code: initialData?.postal_code ?? '',
      city: initialData?.city ?? '',

      // Spouse
      spouse_name: initialData?.spouse_name ?? '',
      spouse_phone: initialData?.spouse_phone ?? '',
      spouse_email: initialData?.spouse_email ?? '',

      // Tutor
      tutor_name: initialData?.tutor_name ?? '',
      tutor_phone: initialData?.tutor_phone ?? '',
      tutor_email: initialData?.tutor_email ?? '',

      // Additional contacts
      additional_contacts: (initialData?.additional_contacts as PatientSchemaData['additional_contacts']) ?? [],

      // Emergency contact
      emergency_contact_name: initialData?.emergency_contact_name ?? '',
      emergency_contact_phone: initialData?.emergency_contact_phone ?? '',

      // Health coverage
      insurer_id: initialData?.insurer_id ?? '',
      plan_id: initialData?.plan_id ?? '',
      sns_user_number: initialData?.sns_user_number ?? '',
      local_protocol: initialData?.local_protocol ?? '',

      // Consents
      consent_rgpd: initialData?.consent_rgpd ?? false,
      consent_informed: initialData?.consent_informed ?? false,
      consent_minors: initialData?.consent_minors ?? false,

      // Notes
      notes: initialData?.notes ?? '',
    },
  })

  const { fields: contactFields, append: appendContact, remove: removeContact } =
    useFieldArray({ control, name: 'additional_contacts' })

  const dobValue = watch('date_of_birth')
  const cpfValue = watch('cpf')
  const nifValue = watch('nif')

  const handleDateChange = useCallback(
    (_: unknown, selectedDate?: Date) => {
      setShowDatePicker(Platform.OS === 'ios')
      if (selectedDate) {
        setValue('date_of_birth', format(selectedDate, 'yyyy-MM-dd'))
      }
    },
    [setValue],
  )

  const parsedDob =
    dobValue && isValid(parseISO(dobValue)) ? parseISO(dobValue) : new Date()

  const genderOptions = [
    { label: 'Sem indicação', value: '' },
    ...(gendersData ?? []).map((g) => ({ label: g.name, value: g.id })),
  ]

  const civilStatusOptions = [
    { label: 'Sem indicação', value: '' },
    ...(civilStatuses ?? []).map((cs) => ({ label: cs.name, value: cs.id })),
  ]

  const insurerOptions = [
    { label: 'Sem seguradora', value: '' },
    ...(insurers ?? []).map((i) => ({ label: i.name, value: i.id })),
  ]

  const planOptions = [
    { label: 'Sem plano específico', value: '' },
    ...(plans ?? []).map((p) => ({ label: p.name, value: p.id })),
  ]

  const hasCpf = cpfValue && cpfValue.replace(/\D/g, '').length > 0
  const hasNif = nifValue && nifValue.replace(/\D/g, '').length > 0

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── IDENTIFICAÇÃO ── */}
        <SectionHeader title="Identificação" />
        <Card>
          <Controller
            control={control}
            name="full_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nome completo *"
                placeholder="Nome do paciente"
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
                value={value ?? ''}
                error={errors.preferred_name?.message}
              />
            )}
          />

          {/* Date of birth */}
          <Controller
            control={control}
            name="date_of_birth"
            render={({ field: { value } }) => (
              <View style={{ marginBottom: theme.spacing.md }}>
                <Text style={labelStyle}>Data de nascimento</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={datePickerStyle}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={theme.colors.text.tertiary}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      color: value ? theme.colors.text.primary : theme.colors.text.tertiary,
                    }}
                  >
                    {value && isValid(parseISO(value))
                      ? format(parseISO(value), 'dd/MM/yyyy')
                      : 'Selecionar data'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={parsedDob}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                  />
                )}
              </View>
            )}
          />

          {/* Gender — dropdown from genders table */}
          <Controller
            control={control}
            name="gender_id"
            render={({ field: { onChange, value } }) => (
              <SelectDropdown
                label="Género / Sexo"
                options={genderOptions}
                value={value ?? ''}
                onChange={onChange}
                placeholder="Selecionar género..."
              />
            )}
          />

          <Controller
            control={control}
            name="profession"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Profissão"
                placeholder="Ex: Engenheiro, Professor..."
                leftIcon="briefcase-outline"
                autoCapitalize="words"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.profession?.message}
              />
            )}
          />

          {/* Education */}
          <Controller
            control={control}
            name="education"
            render={({ field: { onChange, value } }) => (
              <SelectDropdown
                label="Escolaridade"
                options={EDUCATION_OPTIONS}
                value={value ?? ''}
                onChange={onChange}
                placeholder="Selecionar escolaridade..."
              />
            )}
          />

          {/* Civil status */}
          <Controller
            control={control}
            name="civil_status_id"
            render={({ field: { onChange, value } }) => (
              <SelectDropdown
                label="Estado civil"
                options={civilStatusOptions}
                value={value ?? ''}
                onChange={onChange}
                placeholder="Selecionar estado civil..."
              />
            )}
          />

          {/* Status */}
          <View>
            <Text style={labelStyle}>Status</Text>
            <Controller
              control={control}
              name="status"
              render={({ field: { onChange, value } }) => (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {STATUS_OPTIONS.map((opt) => {
                    const selected = value === opt.value
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => onChange(opt.value)}
                        style={{
                          flex: 1,
                          paddingVertical: 8,
                          borderRadius: theme.radius.md,
                          backgroundColor: selected
                            ? theme.colors.primary
                            : theme.colors.surfaceSecondary,
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: selected ? theme.colors.primary : theme.colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: selected ? '600' : '400',
                            color: selected ? '#FFFFFF' : theme.colors.text.secondary,
                          }}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              )}
            />
          </View>
        </Card>

        {/* ── CONTACTO ── */}
        <SectionHeader title="Contacto" />
        <Card>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="E-mail"
                placeholder="email@exemplo.com"
                leftIcon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.email?.message}
              />
            )}
          />

          {/* Phone + DDI */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ width: 90 }}>
              <Controller
                control={control}
                name="phone_ddi"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="DDI"
                    placeholder="+351"
                    keyboardType="phone-pad"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value ?? ''}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Telefone"
                    placeholder="912 345 678"
                    leftIcon="call-outline"
                    keyboardType="phone-pad"
                    onChangeText={(v) => onChange(maskPhone(v))}
                    onBlur={onBlur}
                    value={value ?? ''}
                    error={errors.phone?.message}
                  />
                )}
              />
            </View>
          </View>
        </Card>

        {/* ── DOCUMENTOS ── */}
        <SectionHeader title="Documentos" />
        <Card>
          {!hasCpf && !hasNif && (
            <View
              style={{
                backgroundColor: '#FEF3C7',
                borderRadius: theme.radius.md,
                padding: theme.spacing.sm,
                marginBottom: theme.spacing.md,
                flexDirection: 'row',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <Ionicons name="information-circle-outline" size={18} color="#D97706" />
              <Text style={{ fontSize: 13, color: '#92400E', flex: 1, lineHeight: 18 }}>
                Informe CPF ou NIF para identificação em faturação.
              </Text>
            </View>
          )}

          <Controller
            control={control}
            name="cpf"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="CPF (Brasil)"
                placeholder="000.000.000-00"
                leftIcon="card-outline"
                keyboardType="numeric"
                onChangeText={(v) => onChange(maskCpf(v))}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.cpf?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="nif"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="NIF (Portugal)"
                placeholder="000 000 000"
                leftIcon="card-outline"
                keyboardType="numeric"
                onChangeText={(v) => onChange(maskNif(v))}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.nif?.message}
              />
            )}
          />
        </Card>

        {/* ── MORADA ── */}
        <SectionHeader title="Morada" />
        <Card>
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Morada"
                placeholder="Rua, número, complemento"
                leftIcon="location-outline"
                autoCapitalize="words"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.address?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="billing_address"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Morada de faturação (se diferente)"
                placeholder="Morada de faturação"
                leftIcon="receipt-outline"
                autoCapitalize="words"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.billing_address?.message}
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
                    label="Código postal"
                    placeholder="0000-000"
                    keyboardType="numeric"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value ?? ''}
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
                    label="Localidade"
                    placeholder="Lisboa"
                    autoCapitalize="words"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value ?? ''}
                    error={errors.city?.message}
                  />
                )}
              />
            </View>
          </View>
        </Card>

        {/* ── CÔNJUGE / COMPANHEIR@ ── */}
        <SectionHeader title="Cônjuge / Companheir@" />
        <Card>
          <Controller
            control={control}
            name="spouse_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nome"
                placeholder="Nome do cônjuge"
                leftIcon="person-outline"
                autoCapitalize="words"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.spouse_name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="spouse_phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Contacto"
                placeholder="(11) 99999-9999"
                leftIcon="call-outline"
                keyboardType="phone-pad"
                onChangeText={(v) => onChange(maskPhone(v))}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.spouse_phone?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="spouse_email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="email@exemplo.com"
                leftIcon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.spouse_email?.message}
              />
            )}
          />
        </Card>

        {/* ── RESPONSÁVEL (menores / tutela) ── */}
        <SectionHeader title="Responsável (menores / tutela)" />
        <Card>
          <Controller
            control={control}
            name="tutor_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nome do responsável"
                placeholder="Nome"
                leftIcon="people-outline"
                autoCapitalize="words"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.tutor_name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="tutor_phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Contacto do responsável"
                placeholder="(11) 99999-9999"
                leftIcon="call-outline"
                keyboardType="phone-pad"
                onChangeText={(v) => onChange(maskPhone(v))}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.tutor_phone?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="tutor_email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email do responsável"
                placeholder="email@exemplo.com"
                leftIcon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.tutor_email?.message}
              />
            )}
          />
        </Card>

        {/* ── CONTACTOS ADICIONAIS ── */}
        <SectionHeader title="Contactos adicionais" />
        <Card>
          {contactFields.map((field, index) => (
            <View
              key={field.id}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                padding: theme.spacing.sm,
                marginBottom: theme.spacing.sm,
                gap: 0,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: theme.colors.text.secondary,
                  }}
                >
                  Contacto {index + 1}
                </Text>
                <TouchableOpacity onPress={() => removeContact(index)}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
              <Controller
                control={control}
                name={`additional_contacts.${index}.relation`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Relação"
                    placeholder="Ex: Mãe, Irmão..."
                    autoCapitalize="words"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              <Controller
                control={control}
                name={`additional_contacts.${index}.name`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Nome"
                    placeholder="Nome completo"
                    autoCapitalize="words"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              <Controller
                control={control}
                name={`additional_contacts.${index}.phone`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Telefone"
                    placeholder="(11) 99999-9999"
                    keyboardType="phone-pad"
                    onChangeText={(v) => onChange(maskPhone(v))}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              <Controller
                control={control}
                name={`additional_contacts.${index}.email`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
                    placeholder="email@exemplo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
            </View>
          ))}
          <TouchableOpacity
            onPress={() =>
              appendContact({ relation: '', name: '', phone: '', email: '' })
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingVertical: theme.spacing.sm,
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.primary,
                fontWeight: '500',
              }}
            >
              Adicionar contacto
            </Text>
          </TouchableOpacity>
        </Card>

        {/* ── CONTACTO DE EMERGÊNCIA ── */}
        <SectionHeader title="Contacto de emergência" />
        <Card>
          <Controller
            control={control}
            name="emergency_contact_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nome"
                placeholder="Nome do contacto"
                leftIcon="person-add-outline"
                autoCapitalize="words"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.emergency_contact_name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="emergency_contact_phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Telefone"
                placeholder="(11) 99999-9999"
                leftIcon="call-outline"
                keyboardType="phone-pad"
                onChangeText={(v) => onChange(maskPhone(v))}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.emergency_contact_phone?.message}
              />
            )}
          />
        </Card>

        {/* ── COBERTURA / PROTOCOLO ── */}
        <SectionHeader title="Cobertura / Protocolo" />
        <Card>
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.md,
              lineHeight: 18,
            }}
          >
            Seguradora, plano de saúde, número de utente do SNS ou protocolo local.
          </Text>

          <Controller
            control={control}
            name="insurer_id"
            render={({ field: { onChange, value } }) => (
              <SelectDropdown
                label="Seguradora / Sistema"
                options={insurerOptions}
                value={value ?? ''}
                onChange={(v) => {
                  onChange(v)
                  setSelectedInsurerId(v)
                  setValue('plan_id', '')
                }}
                placeholder="Sem seguradora"
              />
            )}
          />

          <Controller
            control={control}
            name="plan_id"
            render={({ field: { onChange, value } }) => (
              <SelectDropdown
                label="Plano / Modalidade"
                options={planOptions}
                value={value ?? ''}
                onChange={onChange}
                placeholder="Sem plano específico"
              />
            )}
          />

          <Controller
            control={control}
            name="sns_user_number"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nº de utente SNS"
                placeholder="Ex: 123456789"
                leftIcon="medical-outline"
                keyboardType="numeric"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.sns_user_number?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="local_protocol"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Protocolo local"
                placeholder="Protocolo institucional ou local"
                leftIcon="document-text-outline"
                autoCapitalize="words"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                error={errors.local_protocol?.message}
              />
            )}
          />
        </Card>

        {/* ── CONSENTIMENTOS ── */}
        <SectionHeader title="Consentimentos" />
        <Card>
          <Controller
            control={control}
            name="consent_rgpd"
            render={({ field: { onChange, value } }) => (
              <ConsentRow
                label="Recolhido o consentimento para o tratamento de dados (RGPD/LGPD)"
                value={value ?? false}
                onChange={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="consent_informed"
            render={({ field: { onChange, value } }) => (
              <ConsentRow
                label="Recolhido o consentimento informado"
                value={value ?? false}
                onChange={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="consent_minors"
            render={({ field: { onChange, value } }) => (
              <ConsentRow
                label="Recolhido o consentimento para intervenção com menores"
                value={value ?? false}
                onChange={onChange}
              />
            )}
          />
        </Card>

        {/* ── OBSERVAÇÕES ── */}
        <SectionHeader title="Observações" />
        <Card>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Notas gerais"
                placeholder="Informações relevantes sobre o paciente..."
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={{ minHeight: 120 }}
              />
            )}
          />
        </Card>
      </ScrollView>

      {/* Fixed bottom button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.background,
          padding: theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <Button
          title={submitLabel}
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  )
})

const labelStyle = {
  fontSize: 14,
  fontWeight: '500' as const,
  color: theme.colors.text.secondary,
  marginBottom: 6,
}

const datePickerStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 10,
  backgroundColor: theme.colors.surface,
  borderRadius: theme.radius.md,
  borderWidth: 1.5,
  borderColor: theme.colors.border,
  paddingHorizontal: theme.spacing.md,
  minHeight: 52,
}
