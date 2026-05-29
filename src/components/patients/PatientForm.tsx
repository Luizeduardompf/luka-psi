import React, { memo, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format, parseISO, isValid } from 'date-fns'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { theme } from '@/constants/theme'
import { patientSchema, PatientSchemaData } from '@/utils/validators'
import { maskCpf, maskPhone } from '@/utils/format'
import { GENDER_OPTIONS, STATUS_OPTIONS, Patient } from '@/types/app.types'
import { useState } from 'react'

interface PatientFormProps {
  initialData?: Partial<Patient>
  onSubmit: (data: PatientSchemaData) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

type SectionHeaderProps = { title: string }

const SectionHeader = memo(function SectionHeader({
  title,
}: SectionHeaderProps) {
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

export const PatientForm = memo(function PatientForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = 'Salvar',
}: PatientFormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientSchemaData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      full_name: initialData?.full_name ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      cpf: initialData?.cpf ?? '',
      date_of_birth: initialData?.date_of_birth ?? '',
      gender: (initialData?.gender as PatientSchemaData['gender']) ?? '',
      status: initialData?.status ?? 'active',
      notes: initialData?.notes ?? '',
      emergency_contact_name: initialData?.emergency_contact_name ?? '',
      emergency_contact_phone: initialData?.emergency_contact_phone ?? '',
    },
  })

  const dobValue = watch('date_of_birth')

  const handleDateChange = useCallback(
    (_: unknown, selectedDate?: Date) => {
      setShowDatePicker(Platform.OS === 'ios')
      if (selectedDate) {
        setValue('date_of_birth', format(selectedDate, 'yyyy-MM-dd'))
      }
    },
    [setValue],
  )

  const parsedDob = dobValue && isValid(parseISO(dobValue))
    ? parseISO(dobValue)
    : new Date()

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Dados pessoais */}
        <SectionHeader title="Dados pessoais" />
        <Card>
          <Controller
            control={control}
            name="full_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nome completo *"
                placeholder="Nome do paciente"
                leftIcon="person-outline"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.full_name?.message}
                autoCapitalize="words"
              />
            )}
          />

          <Controller
            control={control}
            name="date_of_birth"
            render={({ field: { value } }) => (
              <View style={{ marginBottom: theme.spacing.md }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: theme.colors.text.secondary,
                    marginBottom: 6,
                  }}
                >
                  Data de nascimento
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.radius.md,
                    borderWidth: 1.5,
                    borderColor: theme.colors.border,
                    paddingHorizontal: theme.spacing.md,
                    minHeight: 52,
                    gap: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: value
                        ? theme.colors.text.primary
                        : theme.colors.text.tertiary,
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

          {/* Gender select */}
          <View style={{ marginBottom: theme.spacing.md }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: theme.colors.text.secondary,
                marginBottom: 6,
              }}
            >
              Gênero
            </Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {GENDER_OPTIONS.map((opt) => {
                    const selected = value === opt.value
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => onChange(opt.value)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 14,
                          borderRadius: theme.radius.full,
                          backgroundColor: selected
                            ? theme.colors.primary
                            : theme.colors.surfaceSecondary,
                          borderWidth: 1,
                          borderColor: selected
                            ? theme.colors.primary
                            : theme.colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: selected ? '600' : '400',
                            color: selected
                              ? '#FFFFFF'
                              : theme.colors.text.secondary,
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

          {/* Status */}
          <View style={{ marginBottom: theme.spacing.xs }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: theme.colors.text.secondary,
                marginBottom: 6,
              }}
            >
              Status
            </Text>
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
                          borderColor: selected
                            ? theme.colors.primary
                            : theme.colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: selected ? '600' : '400',
                            color: selected
                              ? '#FFFFFF'
                              : theme.colors.text.secondary,
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

        {/* Contato */}
        <SectionHeader title="Contato" />
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
                value={value}
                error={errors.email?.message}
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
            name="cpf"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                leftIcon="card-outline"
                keyboardType="numeric"
                onChangeText={(v) => onChange(maskCpf(v))}
                onBlur={onBlur}
                value={value}
                error={errors.cpf?.message}
              />
            )}
          />

          <SectionHeader title="Contato de emergência" />

          <Controller
            control={control}
            name="emergency_contact_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nome"
                placeholder="Nome do contato"
                leftIcon="person-add-outline"
                autoCapitalize="words"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.emergency_contact_name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="emergency_contact_phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Telefone do contato"
                placeholder="(11) 99999-9999"
                leftIcon="call-outline"
                keyboardType="phone-pad"
                onChangeText={(v) => onChange(maskPhone(v))}
                onBlur={onBlur}
                value={value}
                error={errors.emergency_contact_phone?.message}
              />
            )}
          />
        </Card>

        {/* Observações */}
        <SectionHeader title="Observações" />
        <Card>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Notas clínicas"
                placeholder="Informações relevantes sobre o paciente..."
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
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
