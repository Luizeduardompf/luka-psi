import React, { memo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, statusVariantMap, statusLabelMap } from '@/components/ui/Badge'
import { theme } from '@/constants/theme'
import { formatPhone, getPatientAvatarUrl } from '@/utils/format'
import { Patient } from '@/types/app.types'

interface PatientCardProps {
  patient: Patient
  onPress?: () => void
}

export const PatientCard = memo(function PatientCard({
  patient,
  onPress,
}: PatientCardProps) {
  const status = patient.status as keyof typeof statusVariantMap
  const phone = patient.phone ? formatPhone(patient.phone) : null
  const tutorName = patient.tutor_name

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadow.sm,
      }}
    >
      <Avatar
        name={patient.full_name}
        uri={getPatientAvatarUrl(patient.full_name, patient.gender)}
        size="md"
      />

      <View style={{ flex: 1, marginLeft: theme.spacing.md, gap: 3 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text.primary,
          }}
          numberOfLines={1}
        >
          {patient.preferred_name || patient.full_name}
        </Text>

        {/* Full name if preferred_name is different */}
        {patient.preferred_name && patient.preferred_name !== patient.full_name && (
          <Text
            style={{ fontSize: 12, color: theme.colors.text.tertiary }}
            numberOfLines={1}
          >
            {patient.full_name}
          </Text>
        )}

        {/* Tutor name (shown below patient name, before phone) */}
        {tutorName ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons
              name="people-outline"
              size={12}
              color={theme.colors.text.tertiary}
            />
            <Text
              style={{ fontSize: 12, color: theme.colors.text.secondary, fontStyle: 'italic' }}
              numberOfLines={1}
            >
              Resp: {tutorName}
            </Text>
          </View>
        ) : null}

        {phone && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons
              name="call-outline"
              size={13}
              color={theme.colors.text.tertiary}
            />
            <Text style={{ fontSize: 13, color: theme.colors.text.tertiary }}>
              {phone}
            </Text>
          </View>
        )}

        <Badge
          label={statusLabelMap[status] ?? status}
          variant={statusVariantMap[status] ?? 'default'}
        />
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={theme.colors.text.tertiary}
      />
    </TouchableOpacity>
  )
})
