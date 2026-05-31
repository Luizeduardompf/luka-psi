import React from 'react'
import { View, Text } from 'react-native'
import { SubmissionStatus, SUBMISSION_STATUS_LABELS, SUBMISSION_STATUS_COLORS } from '@/types/forms.types'

interface Props {
  status: SubmissionStatus
  size?: 'sm' | 'md'
}

export function SubmissionStatusBadge({ status, size = 'sm' }: Props) {
  const color = SUBMISSION_STATUS_COLORS[status]
  const label = SUBMISSION_STATUS_LABELS[status]

  return (
    <View
      style={{
        backgroundColor: color + '20',
        borderRadius: 99,
        paddingHorizontal: size === 'sm' ? 8 : 12,
        paddingVertical: size === 'sm' ? 3 : 5,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ color, fontSize: size === 'sm' ? 11 : 13, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  )
}
