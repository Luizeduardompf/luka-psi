/**
 * Biblioteca de formulários do psicólogo.
 * Lista templates do sistema + próprios, com opções de criar, clonar e editar.
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
import { router } from 'expo-router'
import { Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formsService } from '@/services/forms.service'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/constants/theme'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  useFormTemplates,
  useCreateTemplate,
  useCloneTemplate,
  useDeleteTemplate,
} from '@/hooks/useForms'
import { FormTemplate } from '@/types/forms.types'
import { formatDate } from '@/utils/format'

export default function FormsLibraryScreen() {
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState('')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const { data: templates = [], isLoading } = useFormTemplates()
  const createMutation = useCreateTemplate()
  const cloneMutation = useCloneTemplate()
  const deleteMutation = useDeleteTemplate()

  const systemTemplates = templates.filter(
    (t) => t.is_system && !t.is_archived,
  )
  const myTemplates = templates.filter(
    (t) => !t.is_system && !t.is_archived,
  )

  const filtered = (list: FormTemplate[]) =>
    list.filter(
      (t) =>
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase()),
    )

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) return
    try {
      const result = await createMutation.mutateAsync({
        title: newTitle.trim(),
        description: newDesc.trim() || null,
      })
      setCreateModalVisible(false)
      setNewTitle('')
      setNewDesc('')
      router.push(`/(app)/forms/${result.id}`)
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao criar formulário.')
    }
  }, [createMutation, newTitle, newDesc])

  const handleClone = useCallback(
    async (source: FormTemplate) => {
      try {
        const result = await cloneMutation.mutateAsync({
          sourceTemplateId: source.id,
          newTitle: `${source.title} (cópia)`,
        })
        router.push(`/(app)/forms/${result.id}`)
      } catch (e: unknown) {
        Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao clonar formulário.')
      }
    },
    [cloneMutation],
  )

  const handleDelete = useCallback(
    (template: FormTemplate) => {
      Alert.alert(
        'Excluir formulário',
        `Excluir "${template.title}"? Esta ação não pode ser desfeita.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteMutation.mutateAsync(template.id)
              } catch (e: unknown) {
                Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao excluir.')
              }
            },
          },
        ],
      )
    },
    [deleteMutation],
  )

  const renderTemplate = (template: FormTemplate, allowEdit: boolean) => (
    <Card
      key={template.id}
      style={{ marginBottom: 10 }}
    >
      <TouchableOpacity
        onPress={() => router.push(`/(app)/forms/${template.id}`)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: theme.radius.md,
              backgroundColor: template.is_system
                ? theme.colors.primaryLight
                : '#F0FDF4',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Ionicons
              name={template.is_system ? 'document-text-outline' : 'create-outline'}
              size={20}
              color={template.is_system ? theme.colors.primary : '#16A34A'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  flex: 1,
                }}
                numberOfLines={2}
              >
                {template.title}
              </Text>
              {template.is_system && (
                <View
                  style={{
                    backgroundColor: theme.colors.primaryLight,
                    borderRadius: 99,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ fontSize: 10, color: theme.colors.primary, fontWeight: '600' }}>
                    SISTEMA
                  </Text>
                </View>
              )}
            </View>
            {template.description ? (
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.text.secondary,
                  marginTop: 2,
                  lineHeight: 18,
                }}
                numberOfLines={2}
              >
                {template.description}
              </Text>
            ) : null}
            <Text
              style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: 4 }}
            >
              Criado {formatDate(template.created_at)}
            </Text>
          </View>
        </View>

        {/* Ações */}
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            flexWrap: 'wrap',
          }}
        >
          <Button
            title="Duplicar"
            variant="outline"
            size="sm"
            leftIcon={<Ionicons name="copy-outline" size={14} color={theme.colors.primary} />}
            onPress={() => handleClone(template)}
            loading={cloneMutation.isPending}
          />
          <Button
            title="Preview"
            variant="ghost"
            size="sm"
            leftIcon={<Ionicons name="open-outline" size={14} color={theme.colors.secondary} />}
            onPress={() => {
              const url = formsService.buildPublicUrl(`preview-${template.id}`)
              void Linking.openURL(url)
            }}
          />
          {allowEdit && (
            <>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                onPress={() => handleDelete(template)}
                style={{ padding: 4 }}
              >
                <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  )

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary, flex: 1 }}>
            Formulários
          </Text>
          <Button
            title="Novo"
            size="sm"
            leftIcon={<Ionicons name="add" size={16} color="#FFF" />}
            onPress={() => setCreateModalVisible(true)}
          />
        </View>
        {/* Busca */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceSecondary,
            borderRadius: theme.radius.lg,
            paddingHorizontal: 12,
            marginTop: 12,
          }}
        >
          <Ionicons name="search-outline" size={16} color={theme.colors.text.tertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar formulário..."
            placeholderTextColor={theme.colors.text.tertiary}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 8,
              fontSize: 14,
              color: theme.colors.text.primary,
            }}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Meus formulários */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: theme.colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              Meus Formulários ({filtered(myTemplates).length})
            </Text>
            {filtered(myTemplates).length === 0 ? (
              <Card style={{ marginBottom: 20 }}>
                <Text style={{ color: theme.colors.text.secondary, textAlign: 'center', paddingVertical: 16 }}>
                  Nenhum formulário criado ainda.{'\n'}Clique em "Novo" ou duplique um template do sistema.
                </Text>
              </Card>
            ) : (
              filtered(myTemplates).map((t) => renderTemplate(t, true))
            )}

            <View style={{ height: 8 }} />

            {/* Templates do sistema */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: theme.colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              Templates do Sistema ({filtered(systemTemplates).length})
            </Text>
            {filtered(systemTemplates).map((t) => renderTemplate(t, false))}
          </>
        )}
      </ScrollView>

      {/* Modal: Criar formulário */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
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
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text.primary }}>
              Novo formulário
            </Text>
            <View>
              <Text style={fieldLabel}>Nome do formulário *</Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                style={fieldInput}
                placeholder="Ex: Anamnese Adulto"
                placeholderTextColor={theme.colors.text.tertiary}
                autoFocus
              />
            </View>
            <View>
              <Text style={fieldLabel}>Descrição (opcional)</Text>
              <TextInput
                value={newDesc}
                onChangeText={setNewDesc}
                style={[fieldInput, { minHeight: 80, textAlignVertical: 'top' }]}
                placeholder="Breve descrição..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setCreateModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Criar"
                onPress={handleCreate}
                loading={createMutation.isPending}
                disabled={!newTitle.trim()}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const fieldLabel = {
  fontSize: 12,
  fontWeight: '600' as const,
  color: '#6B7280',
  marginBottom: 6,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.4,
}

const fieldInput = {
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 10,
  paddingVertical: 12,
  paddingHorizontal: 14,
  fontSize: 15,
  color: '#111827',
  backgroundColor: '#F9FAFB',
}
