import React, { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  TextInput, Modal, ActivityIndicator, RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { theme } from '@/constants/theme'
import { supabase } from '@/services/supabase'
import { Button } from '@/components/ui/Button'
import { Toast, useToast } from '@/components/ui/Toast'

interface Gender {
  id: string
  name: string
  pronoun_treatment: string
  terminology: string | null
  sort_order: number
  is_active: boolean
}

function useGendersCRUD() {
  const qc = useQueryClient()
  const query = useQuery<Gender[]>({
    queryKey: ['genders-crud'],
    queryFn: async () => {
      const { data, error } = await supabase.from('genders').select('*').order('sort_order')
      if (error) throw error
      return data as Gender[]
    },
  })

  const create = useMutation({
    mutationFn: async (g: Omit<Gender, 'id'>) => {
      const { error } = await supabase.from('genders').insert(g as never)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['genders-crud'] }),
  })

  const update = useMutation({
    mutationFn: async ({ id, ...g }: Partial<Gender> & { id: string }) => {
      const { error } = await supabase.from('genders').update(g as never).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['genders-crud'] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('genders').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['genders-crud'] }),
  })

  return { query, create, update, remove }
}

const EMPTY: Omit<Gender, 'id'> = { name: '', pronoun_treatment: '', terminology: '', sort_order: 0, is_active: true }

export default function GendersScreen() {
  const insets = useSafeAreaInsets()
  const { query, create, update, remove } = useGendersCRUD()
  const { toast, showToast, hideToast } = useToast()
  const [modalVisible, setModalVisible] = useState(false)
  const [editing, setEditing] = useState<Gender | null>(null)
  const [form, setForm] = useState<Omit<Gender, 'id'>>(EMPTY)

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalVisible(true) }
  const openEdit = (g: Gender) => { setEditing(g); setForm({ name: g.name, pronoun_treatment: g.pronoun_treatment, terminology: g.terminology ?? '', sort_order: g.sort_order, is_active: g.is_active }); setModalVisible(true) }

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) { Alert.alert('Erro', 'Nome é obrigatório.'); return }
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...form, terminology: null })
      } else {
        await create.mutateAsync({ ...form, terminology: null, sort_order: (query.data?.length ?? 0) + 1 })
      }
      setModalVisible(false)
      showToast(editing ? 'Género atualizado com sucesso!' : 'Género criado com sucesso!')
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao guardar.')
    }
  }, [form, editing, create, update, query.data])

  const handleDelete = (g: Gender) => {
    Alert.alert('Eliminar', `Eliminar "${g.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => remove.mutate(g.id) },
    ])
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
      <View style={{
        paddingTop: insets.top + theme.spacing.sm,
        paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md,
        backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary, flex: 1 }}>
          Géneros / Sexo
        </Text>
        <Button title="Novo" size="sm" leftIcon={<Ionicons name="add" size={16} color="#FFF" />} onPress={openCreate} />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: insets.bottom + 40 }}
        refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} tintColor={theme.colors.primary} />}
      >
        {query.isLoading ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (query.data ?? []).map((g) => (
          <View key={g.id} style={{
            backgroundColor: theme.colors.surface, borderRadius: 12, padding: theme.spacing.md,
            marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border,
            flexDirection: 'row', alignItems: 'center', gap: 12,
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>{g.name}</Text>
              <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginTop: 2 }}>
                Pronome: {g.pronoun_treatment || '—'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => openEdit(g)} style={{ padding: 4 }}>
              <Ionicons name="pencil-outline" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(g)} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{
            backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 24, paddingBottom: insets.bottom + 24, gap: 14,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text.primary }}>
              {editing ? 'Editar género' : 'Novo género'}
            </Text>
            {([
              { key: 'name', label: 'Nome *', placeholder: 'Ex: Feminino' },
              { key: 'pronoun_treatment', label: 'Pronome (usado em mensagens)', placeholder: 'Ex: Dra.' },
            ] as const).map(({ key, label, placeholder }) => (
              <View key={key}>
                <Text style={fl}>{label}</Text>
                <TextInput
                  value={String(form[key] ?? '')}
                  onChangeText={(v) => setForm((p) => ({ ...p, [key]: v }))}
                  placeholder={placeholder}
                  placeholderTextColor={theme.colors.text.tertiary}
                  style={fi}
                />
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button title="Cancelar" variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <Button title="Guardar" onPress={handleSave} loading={create.isPending || update.isPending} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const fl = { fontSize: 12, fontWeight: '600' as const, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: 0.4 }
const fi = { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, fontSize: 15, color: '#111827', backgroundColor: '#F9FAFB' }
