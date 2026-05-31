/**
 * Editor / visualizador de formulário.
 * Permite editar título, seções e perguntas.
 * Templates do sistema são somente leitura (mas podem ser duplicados).
 */
import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/constants/theme'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormBuilderQuestion } from '@/components/forms/FormBuilderQuestion'
import {
  useFormTemplateDetail,
  useUpdateTemplate,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useAddOption,
  useUpdateOption,
  useDeleteOption,
  useCloneTemplate,
} from '@/hooks/useForms'
import { QuestionType, QUESTION_TYPE_LABELS } from '@/types/forms.types'

const QUESTION_TYPES: QuestionType[] = [
  'short_text',
  'long_text',
  'single_choice',
  'multi_choice',
  'dropdown',
  'date',
  'number',
  'scale',
  'boolean',
]

export default function FormEditorScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>()
  const insets = useSafeAreaInsets()

  const { data: template, isLoading } = useFormTemplateDetail(templateId ?? null)

  const updateTemplate = useUpdateTemplate()
  const createSection = useCreateSection()
  const updateSection = useUpdateSection()
  const deleteSection = useDeleteSection()
  const createQuestion = useCreateQuestion()
  const updateQuestion = useUpdateQuestion()
  const deleteQuestion = useDeleteQuestion()
  const addOption = useAddOption()
  const updateOption = useUpdateOption()
  const deleteOption = useDeleteOption()
  const cloneTemplate = useCloneTemplate()

  const [addQuestionModal, setAddQuestionModal] = useState<{
    sectionId: string | null
  } | null>(null)
  const [addSectionVisible, setAddSectionVisible] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [localTitle, setLocalTitle] = useState('')

  const isReadOnly = template?.is_system ?? false

  const handleTitleSave = useCallback(async () => {
    if (!templateId || !localTitle.trim()) return
    try {
      await updateTemplate.mutateAsync({ templateId, input: { title: localTitle.trim() } })
      setEditingTitle(false)
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao salvar.')
    }
  }, [templateId, localTitle, updateTemplate])

  const handleAddSection = useCallback(async () => {
    if (!templateId || !newSectionTitle.trim()) return
    const sortOrder = (template?.sections.length ?? 0) + 1
    try {
      await createSection.mutateAsync({
        template_id: templateId,
        title: newSectionTitle.trim(),
        sort_order: sortOrder,
      })
      setNewSectionTitle('')
      setAddSectionVisible(false)
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao criar seção.')
    }
  }, [templateId, newSectionTitle, template, createSection])

  const handleAddQuestion = useCallback(
    async (type: QuestionType, sectionId: string | null) => {
      if (!templateId) return
      const section = template?.sections.find((s) => s.id === sectionId)
      const sortOrder = (section?.questions.length ?? 0) + 1
      try {
        await createQuestion.mutateAsync({
          template_id: templateId,
          section_id: sectionId,
          type,
          title: QUESTION_TYPE_LABELS[type],
          sort_order: sortOrder,
        })
        setAddQuestionModal(null)
      } catch (e: unknown) {
        Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao criar pergunta.')
      }
    },
    [templateId, template, createQuestion],
  )

  const handleUpdateQuestion = useCallback(
    async (questionId: string, field: string, value: string | boolean | number) => {
      if (!templateId) return
      await updateQuestion.mutateAsync({
        questionId,
        templateId,
        input: { [field]: value } as Parameters<typeof updateQuestion.mutateAsync>[0]['input'],
      })
    },
    [templateId, updateQuestion],
  )

  const handleDeleteQuestion = useCallback(
    async (questionId: string) => {
      if (!templateId) return
      await deleteQuestion.mutateAsync({ questionId, templateId })
    },
    [templateId, deleteQuestion],
  )

  const handleAddOption = useCallback(
    async (questionId: string, label: string) => {
      if (!templateId) return
      const section = template?.sections.find((s) =>
        s.questions.some((q) => q.id === questionId),
      )
      const question = section?.questions.find((q) => q.id === questionId)
      const sortOrder = (question?.options.length ?? 0) + 1
      await addOption.mutateAsync({ questionId, templateId, label, sortOrder })
    },
    [templateId, template, addOption],
  )

  const handleClone = useCallback(async () => {
    if (!templateId || !template) return
    try {
      const result = await cloneTemplate.mutateAsync({
        sourceTemplateId: templateId,
        newTitle: `${template.title} (cópia)`,
      })
      router.replace(`/(app)/forms/${result.id}`)
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao duplicar.')
    }
  }, [templateId, template, cloneTemplate])

  if (isLoading || !template) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 14,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            {editingTitle ? (
              <TextInput
                value={localTitle}
                onChangeText={setLocalTitle}
                autoFocus
                onBlur={handleTitleSave}
                onSubmitEditing={handleTitleSave}
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: theme.colors.text.primary,
                  borderBottomWidth: 2,
                  borderBottomColor: theme.colors.primary,
                  paddingBottom: 2,
                }}
              />
            ) : (
              <TouchableOpacity
                onPress={() => {
                  if (!isReadOnly) {
                    setLocalTitle(template.title)
                    setEditingTitle(true)
                  }
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: theme.colors.text.primary,
                  }}
                  numberOfLines={1}
                >
                  {template.title}
                </Text>
              </TouchableOpacity>
            )}
            {isReadOnly && (
              <Text style={{ fontSize: 11, color: theme.colors.text.tertiary }}>
                Template do sistema · somente leitura
              </Text>
            )}
          </View>
          <Button
            title="Duplicar"
            variant="outline"
            size="sm"
            onPress={handleClone}
            loading={cloneTemplate.isPending}
          />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Seções e perguntas */}
        {template.sections
          .filter((s) => s.id !== '__orphan__')
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((section) => (
            <View key={section.id} style={{ marginBottom: 20 }}>
              {/* Cabeçalho da seção */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 10,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: theme.colors.border,
                  }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: theme.colors.primary,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {section.title}
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: theme.colors.border,
                  }}
                />
                {!isReadOnly && (
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Excluir seção', `Excluir "${section.title}" e todas as suas perguntas?`, [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Excluir',
                          style: 'destructive',
                          onPress: () =>
                            deleteSection.mutate({ sectionId: section.id, templateId: templateId! }),
                        },
                      ])
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={14} color={theme.colors.error} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Perguntas */}
              {section.questions
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((q) => (
                  <FormBuilderQuestion
                    key={q.id}
                    question={q}
                    isReadOnly={isReadOnly}
                    onUpdate={handleUpdateQuestion}
                    onDelete={handleDeleteQuestion}
                    onAddOption={handleAddOption}
                    onDeleteOption={(optId) =>
                      deleteOption.mutate({ optionId: optId, templateId: templateId! })
                    }
                    onUpdateOption={(optId, label) =>
                      updateOption.mutate({
                        optionId: optId,
                        templateId: templateId!,
                        input: { label },
                      })
                    }
                  />
                ))}

              {!isReadOnly && (
                <Button
                  title="Adicionar pergunta"
                  variant="ghost"
                  size="sm"
                  leftIcon={<Ionicons name="add-circle-outline" size={16} color={theme.colors.primary} />}
                  onPress={() => setAddQuestionModal({ sectionId: section.id })}
                  style={{ alignSelf: 'flex-start' }}
                />
              )}
            </View>
          ))}

        {!isReadOnly && (
          <Button
            title="Adicionar seção"
            variant="outline"
            leftIcon={<Ionicons name="add" size={18} color={theme.colors.primary} />}
            onPress={() => setAddSectionVisible(true)}
            fullWidth
            style={{ marginTop: 8 }}
          />
        )}
      </ScrollView>

      {/* Modal: Adicionar pergunta */}
      <Modal
        visible={!!addQuestionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setAddQuestionModal(null)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              paddingBottom: insets.bottom + 20,
              maxHeight: '70%',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: theme.colors.text.primary,
                marginBottom: 16,
              }}
            >
              Tipo de pergunta
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {QUESTION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() =>
                    handleAddQuestion(type, addQuestionModal?.sectionId ?? null)
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: theme.radius.sm,
                      backgroundColor: theme.colors.primaryLight,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name={
                        type === 'short_text'
                          ? 'remove-outline'
                          : type === 'long_text'
                            ? 'reorder-four-outline'
                            : type === 'single_choice'
                              ? 'radio-button-on-outline'
                              : type === 'multi_choice'
                                ? 'checkbox-outline'
                                : type === 'dropdown'
                                  ? 'chevron-down-outline'
                                  : type === 'date'
                                    ? 'calendar-outline'
                                    : type === 'number'
                                      ? 'calculator-outline'
                                      : type === 'scale'
                                        ? 'bar-chart-outline'
                                        : 'toggle-outline'
                      }
                      size={18}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={{ fontSize: 15, color: theme.colors.text.primary, fontWeight: '500' }}>
                    {QUESTION_TYPE_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button
              title="Cancelar"
              variant="ghost"
              onPress={() => setAddQuestionModal(null)}
              fullWidth
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>

      {/* Modal: Adicionar seção */}
      <Modal
        visible={addSectionVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddSectionVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: insets.bottom + 24,
              gap: 16,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text.primary }}
            >
              Nova seção
            </Text>
            <TextInput
              value={newSectionTitle}
              onChangeText={setNewSectionTitle}
              placeholder="Título da seção"
              placeholderTextColor={theme.colors.text.tertiary}
              autoFocus
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 10,
                paddingVertical: 12,
                paddingHorizontal: 14,
                fontSize: 15,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.surfaceSecondary,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setAddSectionVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Adicionar"
                onPress={handleAddSection}
                loading={createSection.isPending}
                disabled={!newSectionTitle.trim()}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
