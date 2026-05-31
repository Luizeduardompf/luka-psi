/**
 * Renderiza uma pergunta para o paciente preencher.
 * Exibe o campo correto com base no tipo da pergunta.
 */
import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/constants/theme'
import { SnapshotQuestion } from '@/types/forms.types'
import { FormResponse } from '@/types/forms.types'

interface Props {
  question: SnapshotQuestion
  response: FormResponse | null
  onChange: (response: Partial<FormResponse>) => void
  isReadOnly?: boolean
}

export function QuestionRenderer({ question, response, onChange, isReadOnly = false }: Props) {
  const [scaleValue, setScaleValue] = useState<number | null>(
    response?.answer_number ?? null,
  )

  const handleText = (v: string) => onChange({ answer_text: v })
  const handleNumber = (v: string) => onChange({ answer_number: parseFloat(v) || null })
  const handleDate = (v: string) => onChange({ answer_date: v })
  const handleBoolean = (v: boolean) => onChange({ answer_boolean: v })

  const handleSingleChoice = (label: string) => {
    onChange({ answer_text: label })
  }

  const handleMultiChoice = (label: string) => {
    const current = response?.answer_options ?? []
    const updated = current.includes(label)
      ? current.filter((v) => v !== label)
      : [...current, label]
    onChange({ answer_options: updated })
  }

  const handleScale = (v: number) => {
    setScaleValue(v)
    onChange({ answer_number: v })
  }

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Título */}
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: theme.colors.text.primary,
            flex: 1,
          }}
        >
          {question.title}
        </Text>
        {question.is_required && (
          <Text style={{ color: theme.colors.error, fontSize: 15 }}>*</Text>
        )}
      </View>

      {/* Descrição */}
      {question.description ? (
        <Text
          style={{
            fontSize: 13,
            color: theme.colors.text.secondary,
            marginBottom: 10,
            lineHeight: 18,
          }}
        >
          {question.description}
        </Text>
      ) : (
        <View style={{ marginBottom: 8 }} />
      )}

      {/* Campo de resposta */}
      {question.type === 'short_text' && (
        <TextInput
          value={response?.answer_text ?? ''}
          onChangeText={handleText}
          editable={!isReadOnly}
          style={inputStyle}
          placeholder="Sua resposta"
          placeholderTextColor={theme.colors.text.tertiary}
        />
      )}

      {question.type === 'long_text' && (
        <TextInput
          value={response?.answer_text ?? ''}
          onChangeText={handleText}
          editable={!isReadOnly}
          style={[inputStyle, { minHeight: 100, textAlignVertical: 'top' }]}
          placeholder="Sua resposta"
          placeholderTextColor={theme.colors.text.tertiary}
          multiline
          numberOfLines={4}
        />
      )}

      {question.type === 'number' && (
        <TextInput
          value={response?.answer_number != null ? String(response.answer_number) : ''}
          onChangeText={handleNumber}
          editable={!isReadOnly}
          keyboardType="numeric"
          style={inputStyle}
          placeholder="0"
          placeholderTextColor={theme.colors.text.tertiary}
        />
      )}

      {question.type === 'date' && (
        <TextInput
          value={response?.answer_date ?? ''}
          onChangeText={handleDate}
          editable={!isReadOnly}
          style={inputStyle}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={theme.colors.text.tertiary}
          keyboardType="numbers-and-punctuation"
        />
      )}

      {question.type === 'boolean' && (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[true, false].map((val) => (
            <TouchableOpacity
              key={String(val)}
              onPress={() => !isReadOnly && handleBoolean(val)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: theme.radius.md,
                borderWidth: 2,
                borderColor:
                  response?.answer_boolean === val
                    ? theme.colors.primary
                    : theme.colors.border,
                backgroundColor:
                  response?.answer_boolean === val
                    ? theme.colors.primaryLight
                    : theme.colors.surface,
                alignItems: 'center',
              }}
              activeOpacity={isReadOnly ? 1 : 0.7}
            >
              <Text
                style={{
                  fontWeight: '600',
                  color:
                    response?.answer_boolean === val
                      ? theme.colors.primary
                      : theme.colors.text.secondary,
                }}
              >
                {val ? 'Sim' : 'Não'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {question.type === 'single_choice' && (
        <View style={{ gap: 8 }}>
          {question.options.map((opt) => {
            const selected = response?.answer_text === opt.label
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => !isReadOnly && handleSingleChoice(opt.label)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 12,
                  borderRadius: theme.radius.md,
                  borderWidth: 1.5,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selected ? theme.colors.primaryLight : theme.colors.surface,
                }}
                activeOpacity={isReadOnly ? 1 : 0.7}
              >
                <Ionicons
                  name={selected ? 'radio-button-on' : 'radio-button-off-outline'}
                  size={18}
                  color={selected ? theme.colors.primary : theme.colors.text.tertiary}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: selected ? theme.colors.primary : theme.colors.text.primary,
                    fontWeight: selected ? '600' : '400',
                    flex: 1,
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}

      {question.type === 'multi_choice' && (
        <View style={{ gap: 8 }}>
          {question.options.map((opt) => {
            const selected = (response?.answer_options ?? []).includes(opt.label)
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => !isReadOnly && handleMultiChoice(opt.label)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  padding: 12,
                  borderRadius: theme.radius.md,
                  borderWidth: 1.5,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selected ? theme.colors.primaryLight : theme.colors.surface,
                }}
                activeOpacity={isReadOnly ? 1 : 0.7}
              >
                <Ionicons
                  name={selected ? 'checkbox' : 'square-outline'}
                  size={18}
                  color={selected ? theme.colors.primary : theme.colors.text.tertiary}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: selected ? theme.colors.primary : theme.colors.text.primary,
                    fontWeight: selected ? '600' : '400',
                    flex: 1,
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}

      {question.type === 'dropdown' && (
        <View style={{ gap: 8 }}>
          {question.options.map((opt) => {
            const selected = response?.answer_text === opt.label
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => !isReadOnly && handleSingleChoice(opt.label)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  borderRadius: theme.radius.md,
                  borderWidth: 1.5,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selected ? theme.colors.primaryLight : theme.colors.surface,
                }}
                activeOpacity={isReadOnly ? 1 : 0.7}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: selected ? theme.colors.primary : theme.colors.text.primary,
                    fontWeight: selected ? '600' : '400',
                  }}
                >
                  {opt.label}
                </Text>
                {selected && (
                  <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      )}

      {question.type === 'scale' && (
        <View>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 6,
              justifyContent: 'center',
            }}
          >
            {Array.from(
              {
                length:
                  Math.floor(
                    (question.scale_max - question.scale_min) / question.scale_step,
                  ) + 1,
              },
              (_, i) => question.scale_min + i * question.scale_step,
            ).map((v) => {
              const selected = scaleValue === v
              return (
                <TouchableOpacity
                  key={v}
                  onPress={() => !isReadOnly && handleScale(v)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                    borderWidth: 1.5,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  activeOpacity={isReadOnly ? 1 : 0.7}
                >
                  <Text
                    style={{
                      fontWeight: '600',
                      color: selected ? '#FFF' : theme.colors.text.secondary,
                      fontSize: 13,
                    }}
                  >
                    {v}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 6,
            }}
          >
            <Text style={{ fontSize: 11, color: theme.colors.text.tertiary }}>
              {question.scale_min} = mínimo
            </Text>
            <Text style={{ fontSize: 11, color: theme.colors.text.tertiary }}>
              {question.scale_max} = máximo
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

const inputStyle = {
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 10,
  paddingVertical: 12,
  paddingHorizontal: 14,
  fontSize: 15,
  color: '#111827',
  backgroundColor: '#FAFAFA',
}
