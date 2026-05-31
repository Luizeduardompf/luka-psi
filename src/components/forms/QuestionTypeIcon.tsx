import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { QuestionType } from '@/types/forms.types'

const ICON_MAP: Record<QuestionType, React.ComponentProps<typeof Ionicons>['name']> = {
  short_text: 'remove-outline',
  long_text: 'reorder-four-outline',
  single_choice: 'radio-button-on-outline',
  multi_choice: 'checkbox-outline',
  dropdown: 'chevron-down-outline',
  date: 'calendar-outline',
  number: 'calculator-outline',
  scale: 'bar-chart-outline',
  boolean: 'toggle-outline',
}

interface Props {
  type: QuestionType
  size?: number
  color?: string
}

export function QuestionTypeIcon({ type, size = 18, color = '#7C3AED' }: Props) {
  return <Ionicons name={ICON_MAP[type]} size={size} color={color} />
}
