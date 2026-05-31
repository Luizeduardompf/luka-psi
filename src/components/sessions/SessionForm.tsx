import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import { theme } from '@/constants/theme'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Patient, Session, SessionStatus, SessionType, PaymentStatus } from '@/types/app.types'

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface SessionFormData {
  patient_id: string
  date: string           // YYYY-MM-DD
  start_time: string     // HH:MM
  end_time: string       // HH:MM
  status: SessionStatus
  type: SessionType
  notes: string
  fee: string            // string for input, parsed on submit
  payment_status: PaymentStatus
}

interface SessionFormProps {
  patients: Patient[]
  initialData?: Partial<Session>
  defaultPatientId?: string
  defaultDate?: string
  onSubmit: (data: SessionFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function toDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toTime(timeStr: string): Date {
  const [h, min] = timeStr.split(':').map(Number)
  const d = new Date()
  d.setHours(h, min, 0, 0)
  return d
}

function formatDateDisplay(dateStr: string): string {
  try {
    const d = toDate(dateStr)
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function dateToString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function timeToString(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function todayString(): string {
  return dateToString(new Date())
}

// ─── Segmented control ─────────────────────────────────────────────────────────
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.surfaceSecondary,
        borderRadius: theme.radius.md,
        padding: 3,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: theme.radius.sm,
              backgroundColor: active ? theme.colors.surface : 'transparent',
              alignItems: 'center',
              ...(active ? theme.shadow.sm : {}),
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: active ? '600' : '400',
                color: active ? theme.colors.text.primary : theme.colors.text.secondary,
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

// ─── Patient picker ────────────────────────────────────────────────────────────
function PatientPicker({
  patients,
  value,
  onChange,
}: {
  patients: Patient[]
  value: string
  onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = patients.find((p) => p.id === value)

  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.md,
          borderWidth: 1.5,
          borderColor: open ? theme.colors.primary : theme.colors.border,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: 12,
          gap: 10,
        }}
      >
        <Ionicons
          name="person-outline"
          size={18}
          color={theme.colors.text.tertiary}
        />
        <Text
          style={{
            flex: 1,
            fontSize: 15,
            color: selected
              ? theme.colors.text.primary
              : theme.colors.text.tertiary,
          }}
        >
          {selected?.preferred_name ?? selected?.full_name ?? 'Selecionar paciente'}
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
            marginTop: 4,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            maxHeight: 220,
            overflow: 'hidden',
            ...theme.shadow.md,
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {patients.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  onChange(p.id)
                  setOpen(false)
                }}
                style={{
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                  backgroundColor:
                    p.id === value ? theme.colors.primaryLight : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: theme.colors.text.primary,
                    fontWeight: p.id === value ? '600' : '400',
                  }}
                >
                  {p.preferred_name ?? p.full_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

// ─── FieldLabel ────────────────────────────────────────────────────────────────
function FieldLabel({ text }: { text: string }) {
  return (
    <Text
      style={{
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        marginBottom: 6,
      }}
    >
      {text}
    </Text>
  )
}

// ─── Main form ─────────────────────────────────────────────────────────────────
export function SessionForm({
  patients,
  initialData,
  defaultPatientId,
  defaultDate,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel = 'Salvar sessão',
}: SessionFormProps) {
  const [patientId, setPatientId] = useState(
    initialData?.patient_id ?? defaultPatientId ?? '',
  )
  const [date, setDate] = useState(
    initialData?.date ?? defaultDate ?? todayString(),
  )
  const [startTime, setStartTime] = useState(
    initialData?.start_time ?? '09:00',
  )
  const [endTime, setEndTime] = useState(
    initialData?.end_time ?? '10:00',
  )
  const [status, setStatus] = useState<SessionStatus>(
    initialData?.status ?? 'scheduled',
  )
  const [type, setType] = useState<SessionType>(
    initialData?.type ?? 'presencial',
  )
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [fee, setFee] = useState(
    initialData?.fee != null ? String(initialData.fee) : '',
  )
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    initialData?.payment_status ?? 'pending',
  )

  // DateTimePicker state
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  const handleSubmit = async () => {
    if (!patientId) {
      Alert.alert('Atenção', 'Selecione um paciente.')
      return
    }
    await onSubmit({
      patient_id: patientId,
      date,
      start_time: startTime,
      end_time: endTime,
      status,
      type,
      notes,
      fee,
      payment_status: paymentStatus,
    })
  }

  const onDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(Platform.OS === 'ios')
    if (selected) setDate(dateToString(selected))
  }

  const onStartChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShowStartPicker(Platform.OS === 'ios')
    if (selected) setStartTime(timeToString(selected))
  }

  const onEndChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShowEndPicker(Platform.OS === 'ios')
    if (selected) setEndTime(timeToString(selected))
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        padding: theme.spacing.md,
        paddingBottom: 40,
        gap: theme.spacing.md,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Paciente */}
      <View>
        <FieldLabel text="Paciente *" />
        <PatientPicker
          patients={patients}
          value={patientId}
          onChange={setPatientId}
        />
      </View>

      {/* Data */}
      <View>
        <FieldLabel text="Data" />
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
            paddingVertical: 12,
            gap: 10,
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={theme.colors.text.tertiary}
          />
          <Text
            style={{
              flex: 1,
              fontSize: 15,
              color: theme.colors.text.primary,
              textTransform: 'capitalize',
            }}
          >
            {formatDateDisplay(date)}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={toDate(date)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            locale="pt-BR"
          />
        )}
      </View>

      {/* Horário */}
      <View>
        <FieldLabel text="Horário" />
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 11,
                color: theme.colors.text.tertiary,
                marginBottom: 4,
              }}
            >
              Início
            </Text>
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.md,
                borderWidth: 1.5,
                borderColor: theme.colors.border,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: 12,
                gap: 8,
              }}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={theme.colors.text.tertiary}
              />
              <Text style={{ fontSize: 15, color: theme.colors.text.primary }}>
                {startTime}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={toTime(startTime)}
                mode="time"
                is24Hour
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onStartChange}
              />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 11,
                color: theme.colors.text.tertiary,
                marginBottom: 4,
              }}
            >
              Fim
            </Text>
            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.md,
                borderWidth: 1.5,
                borderColor: theme.colors.border,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: 12,
                gap: 8,
              }}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={theme.colors.text.tertiary}
              />
              <Text style={{ fontSize: 15, color: theme.colors.text.primary }}>
                {endTime}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={toTime(endTime)}
                mode="time"
                is24Hour
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onEndChange}
              />
            )}
          </View>
        </View>
      </View>

      {/* Tipo */}
      <View>
        <FieldLabel text="Tipo" />
        <SegmentedControl
          options={[
            { label: 'Presencial', value: 'presencial' },
            { label: 'Online', value: 'online' },
          ]}
          value={type}
          onChange={setType}
        />
      </View>

      {/* Status */}
      <View>
        <FieldLabel text="Status" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(
            [
              { label: 'Agendada', value: 'scheduled' as SessionStatus },
              { label: 'Realizada', value: 'completed' as SessionStatus },
              { label: 'Cancelada', value: 'cancelled' as SessionStatus },
              { label: 'Faltou', value: 'no_show' as SessionStatus },
            ] as const
          ).map((opt) => {
            const active = status === opt.value
            const statusColors: Record<SessionStatus, string> = {
              scheduled: theme.colors.primary,
              completed: theme.colors.success,
              cancelled: theme.colors.error,
              no_show: theme.colors.warning,
            }
            const color = statusColors[opt.value]
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setStatus(opt.value)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: theme.radius.full,
                  backgroundColor: active ? color + '18' : theme.colors.surfaceSecondary,
                  borderWidth: 1.5,
                  borderColor: active ? color : theme.colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: active ? '600' : '400',
                    color: active ? color : theme.colors.text.secondary,
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Valor + Pagamento */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <FieldLabel text="Valor (€)" />
          <Input
            placeholder="0,00"
            value={fee}
            onChangeText={setFee}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={{ flex: 1.6 }}>
          <FieldLabel text="Pagamento" />
          <SegmentedControl
            options={[
              { label: 'Pendente', value: 'pending' as PaymentStatus },
              { label: 'Pago', value: 'paid' as PaymentStatus },
              { label: 'Isento', value: 'waived' as PaymentStatus },
            ]}
            value={paymentStatus}
            onChange={setPaymentStatus}
          />
        </View>
      </View>

      {/* Notas */}
      <View>
        <FieldLabel text="Notas da sessão" />
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Observações sobre a sessão..."
          placeholderTextColor={theme.colors.text.tertiary}
          multiline
          numberOfLines={4}
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.md,
            borderWidth: 1.5,
            borderColor: theme.colors.border,
            padding: theme.spacing.md,
            fontSize: 15,
            color: theme.colors.text.primary,
            minHeight: 100,
            textAlignVertical: 'top',
          }}
        />
      </View>

      {/* Actions */}
      <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
        <Button
          title={submitLabel}
          onPress={handleSubmit}
          loading={isLoading}
        />
        <Button
          title="Cancelar"
          onPress={onCancel}
          variant="ghost"
          disabled={isLoading}
        />
      </View>
    </ScrollView>
  )
}
