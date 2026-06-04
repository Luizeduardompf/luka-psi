import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/constants/theme'
import {
  FormQuestionWithOptions,
  QuestionType,
  QUESTION_TYPE_LABELS,
} from '@/types/forms.types'
import { PROFILE_FIELD_BY_KEY } from '@/constants/patientProfileFields'
import { QuestionTypeIcon } from './QuestionTypeIcon'

interface Props {
  question: FormQuestionWithOptions
  isReadOnly?: boolean
  onUpdate?: (
    questionId: string,
    field: string,
    value: string | boolean | number,
  ) => void
  onDelete?: (questionId: string) => void
  onAddOption?: (questionId: string, label: string) => void
  onDeleteOption?: (optionId: string, questionId: string) => void
  onUpdateOption?: (optionId: string, label: string) => void
}

const CHOICE_TYPES: QuestionType[] = ['single_choice', 'multi_choice', 'dropdown']

export function FormBuilderQuestion({
  question,
  isReadOnly = false,
  onUpdate,
  onDelete,
  onAddOption,
  onDeleteOption,
  onUpdateOption,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newOptionLabel, setNewOptionLabel] = useState('')
  const isChoiceType = CHOICE_TYPES.includes(question.type)

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 8,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <TouchableOpacity
        onPress={() => setIsExpanded((v) => !v)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          padding: 14,
        }}
        activeOpacity={0.7}
      >
        <QuestionTypeIcon type={question.type} />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.text.primary,
            }}
            numberOfLines={2}
          >
            {question.title || '(sem título)'}
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: 2 }}>
            {QUESTION_TYPE_LABELS[question.type]}
            {question.is_required ? ' · Obrigatória' : ''}
          </Text>
          {question.type === 'profile_field' && question.profile_field_key && (
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 4,
              marginTop: 4, alignSelf: 'flex-start',
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: theme.radius.sm,
              paddingHorizontal: 6, paddingVertical: 2,
            }}>
              <Ionicons name="person-outline" size={10} color={theme.colors.text.tertiary} />
              <Text style={{ fontSize: 11, color: theme.colors.text.tertiary }}>
                Perfil: {PROFILE_FIELD_BY_KEY[question.profile_field_key as keyof typeof PROFILE_FIELD_BY_KEY]?.label ?? question.profile_field_key}
              </Text>
            </View>
          )}
        </View>
        {!isReadOnly && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Excluir pergunta', `Excluir "${question.title}"?`, [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Excluir',
                  style: 'destructive',
                  onPress: () => onDelete?.(question.id),
                },
              ])
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
          </TouchableOpacity>
        )}
        <Ionicons
          name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={16}
          color={theme.colors.text.tertiary}
        />
      </TouchableOpacity>

      {/* Body */}
      {isExpanded && (
        <View
          style={{
            padding: 14,
            paddingTop: 0,
            gap: 12,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}
        >
          {/* Título */}
          <View>
            <Text style={labelStyle}>Título da pergunta</Text>
            {isReadOnly ? (
              <Text style={{ fontSize: 14, color: theme.colors.text.primary }}>
                {question.title}
              </Text>
            ) : (
              <TextInput
                value={question.title}
                onChangeText={(v) => onUpdate?.(question.id, 'title', v)}
                style={inputStyle}
                placeholder="Ex: Qual o seu nome?"
                placeholderTextColor={theme.colors.text.tertiary}
              />
            )}
          </View>

          {/* Descrição */}
          <View>
            <Text style={labelStyle}>Descrição (opcional)</Text>
            {isReadOnly ? (
              question.description ? (
                <Text style={{ fontSize: 13, color: theme.colors.text.secondary }}>
                  {question.description}
                </Text>
              ) : null
            ) : (
              <TextInput
                value={question.description ?? ''}
                onChangeText={(v) => onUpdate?.(question.id, 'description', v)}
                style={inputStyle}
                placeholder="Explicação adicional"
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
              />
            )}
          </View>

          {/* Escala: min/max */}
          {question.type === 'scale' && (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Mínimo</Text>
                <TextInput
                  value={String(question.scale_min)}
                  onChangeText={(v) =>
                    onUpdate?.(question.id, 'scale_min', parseInt(v) || 1)
                  }
                  keyboardType="numeric"
                  style={inputStyle}
                  editable={!isReadOnly}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Máximo</Text>
                <TextInput
                  value={String(question.scale_max)}
                  onChangeText={(v) =>
                    onUpdate?.(question.id, 'scale_max', parseInt(v) || 10)
                  }
                  keyboardType="numeric"
                  style={inputStyle}
                  editable={!isReadOnly}
                />
              </View>
            </View>
          )}

          {/* Opções */}
          {isChoiceType && (
            <View>
              <Text style={labelStyle}>Opções</Text>
              {question.options.map((opt) => (
                <View
                  key={opt.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <Ionicons
                    name={
                      question.type === 'single_choice'
                        ? 'radio-button-off-outline'
                        : question.type === 'multi_choice'
                          ? 'square-outline'
                          : 'chevron-forward-outline'
                    }
                    size={14}
                    color={theme.colors.text.tertiary}
                  />
                  {isReadOnly ? (
                    <Text style={{ flex: 1, fontSize: 14, color: theme.colors.text.primary }}>
                      {opt.label}
                    </Text>
                  ) : (
                    <TextInput
                      value={opt.label}
                      onChangeText={(v) => onUpdateOption?.(opt.id, v)}
                      style={[inputStyle, { flex: 1, marginBottom: 0 }]}
                      placeholder="Opção"
                      placeholderTextColor={theme.colors.text.tertiary}
                    />
                  )}
                  {!isReadOnly && (
                    <TouchableOpacity
                      onPress={() => onDeleteOption?.(opt.id, question.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={16}
                        color={theme.colors.text.tertiary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {!isReadOnly && (
                <View
                  style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}
                >
                  <TextInput
                    value={newOptionLabel}
                    onChangeText={setNewOptionLabel}
                    style={[inputStyle, { flex: 1, marginBottom: 0 }]}
                    placeholder="Nova opção..."
                    placeholderTextColor={theme.colors.text.tertiary}
                    onSubmitEditing={() => {
                      if (newOptionLabel.trim()) {
                        onAddOption?.(question.id, newOptionLabel.trim())
                        setNewOptionLabel('')
                      }
                    }}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      if (newOptionLabel.trim()) {
                        onAddOption?.(question.id, newOptionLabel.trim())
                        setNewOptionLabel('')
                      }
                    }}
                    style={{
                      backgroundColor: theme.colors.primary,
                      borderRadius: theme.radius.sm,
                      padding: 10,
                    }}
                  >
                    <Ionicons name="add" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Obrigatória */}
          {!isReadOnly && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, color: theme.colors.text.secondary }}>
                Pergunta obrigatória
              </Text>
              <Switch
                value={question.is_required}
                onValueChange={(v) => onUpdate?.(question.id, 'is_required', v)}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor="#FFF"
              />
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const labelStyle = {
  fontSize: 12,
  fontWeight: '600' as const,
  color: '#6B7280',
  marginBottom: 4,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.4,
}

const inputStyle = {
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 8,
  paddingVertical: 10,
  paddingHorizontal: 12,
  fontSize: 14,
  color: '#111827',
  backgroundColor: '#F9FAFB',
  marginBottom: 4,
}
