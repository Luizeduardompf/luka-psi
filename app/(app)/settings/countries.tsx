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

interface Country {
  id: string
  name: string
  code: string
  ddi: string
  tax_id_type: 'nif' | 'cpf' | 'other'
  is_active: boolean
  sort_order: number
}

const TAX_LABELS: Record<string, string> = { nif: 'NIF', cpf: 'CPF', other: 'Outro' }

type CountryForm = { name: string; code: string; ddi: string; tax_id_type: 'nif' | 'cpf' | 'other'; is_active: boolean; sort_order: number }
const EMPTY: CountryForm = { name: '', code: '', ddi: '', tax_id_type: 'other', is_active: true, sort_order: 0 }

export default function CountriesScreen() {
  const insets = useSafeAreaInsets()
  const qc = useQueryClient()

  const query = useQuery<Country[]>({
    queryKey: ['countries-crud'],
    queryFn: async () => {
      const { data, error } = await supabase.from('countries').select('*').order('sort_order')
      if (error) throw error
      return data as Country[]
    },
  })

  const save = useMutation({
    mutationFn: async ({ id, ...d }: Partial<Country> & { id?: string }) => {
      if (id) {
        const { error } = await supabase.from('countries').update(d as never).eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('countries').insert(d as never)
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['countries-crud'] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('countries').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['countries-crud'] }),
  })

  const { toast, showToast, hideToast } = useToast()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Country | null>(null)
  const [form, setForm] = useState<CountryForm>(EMPTY)

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (c: Country) => {
    setEditing(c)
    setForm({ name: c.name, code: c.code, ddi: c.ddi, tax_id_type: c.tax_id_type, is_active: c.is_active, sort_order: c.sort_order })
    setModal(true)
  }

  const handleSave = useCallback(async () => {
    if (!form.name.trim() || !form.code.trim()) { Alert.alert('Erro', 'Nome e código são obrigatórios.'); return }
    try {
      await save.mutateAsync({ id: editing?.id, ...form, sort_order: editing?.sort_order ?? (query.data?.length ?? 0) + 1 })
      setModal(false)
      showToast(editing ? 'País atualizado com sucesso!' : 'País criado com sucesso!')
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao guardar.')
    }
  }, [form, editing, save, query.data])

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
      <View style={{
        paddingTop: insets.top + theme.spacing.sm, paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md,
        backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary, flex: 1 }}>Países</Text>
        <Button title="Novo" size="sm" leftIcon={<Ionicons name="add" size={16} color="#FFF" />} onPress={openCreate} />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: insets.bottom + 40 }}
        refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} tintColor={theme.colors.primary} />}
      >
        {query.isLoading ? <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} /> :
          (query.data ?? []).map((c) => (
            <View key={c.id} style={{
              backgroundColor: theme.colors.surface, borderRadius: 12, padding: theme.spacing.md,
              marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border,
              flexDirection: 'row', alignItems: 'center', gap: 12,
            }}>
              <View style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.primary }}>{c.code}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>{c.name}</Text>
                <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 }}>
                  DDI: {c.ddi || '—'} · Documento: {TAX_LABELS[c.tax_id_type]}
                </Text>
              </View>
              <TouchableOpacity onPress={() => openEdit(c)} style={{ padding: 4 }}>
                <Ionicons name="pencil-outline" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('Eliminar', `Eliminar "${c.name}"?`, [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => remove.mutate(c.id) },
              ])} style={{ padding: 4 }}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{
            backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 24, paddingBottom: insets.bottom + 24, gap: 14,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text.primary }}>
              {editing ? 'Editar país' : 'Novo país'}
            </Text>
            {([
              { key: 'name', label: 'Nome *', placeholder: 'Ex: Portugal' },
              { key: 'code', label: 'Código ISO *', placeholder: 'Ex: PT' },
              { key: 'ddi', label: 'DDI', placeholder: 'Ex: +351' },
            ] as const).map(({ key, label, placeholder }) => (
              <View key={key}>
                <Text style={fl}>{label}</Text>
                <TextInput value={form[key]} onChangeText={(v) => setForm((p) => ({ ...p, [key]: v }))}
                  placeholder={placeholder} placeholderTextColor={theme.colors.text.tertiary} style={fi} />
              </View>
            ))}
            <View>
              <Text style={fl}>Documento fiscal</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['nif', 'cpf', 'other'] as const).map((t) => (
                  <TouchableOpacity key={t} onPress={() => setForm((p) => ({ ...p, tax_id_type: t }))}
                    style={{
                      flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
                      backgroundColor: form.tax_id_type === t ? theme.colors.primary : theme.colors.surfaceSecondary,
                      borderWidth: 1, borderColor: form.tax_id_type === t ? theme.colors.primary : theme.colors.border,
                    }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: form.tax_id_type === t ? '#FFF' : theme.colors.text.secondary }}>
                      {TAX_LABELS[t]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button title="Cancelar" variant="outline" onPress={() => setModal(false)} style={{ flex: 1 }} />
              <Button title="Guardar" onPress={handleSave} loading={save.isPending} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const fl = { fontSize: 12, fontWeight: '600' as const, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: 0.4 }
const fi = { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, fontSize: 15, color: '#111827', backgroundColor: '#F9FAFB' }
