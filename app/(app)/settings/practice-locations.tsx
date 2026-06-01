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
import { useSessionStore } from '@/stores/session.store'
import { Toast, useToast } from '@/components/ui/Toast'

interface PracticeLocation {
  id: string
  psychologist_id: string
  name: string
  address: string | null
  postal_code: string | null
  city: string | null
  contact_person: string | null
  phone: string | null
  phone_ddi: string | null
  email: string | null
  commission_type: 'percentage' | 'fixed' | 'none'
  commission_value: number | null
  payment_conditions: string | null
  notes: string | null
  color: string
  is_active: boolean
}

const EMPTY_FORM = {
  name: '', address: '', postal_code: '', city: '',
  contact_person: '', phone: '', phone_ddi: '', email: '',
  commission_type: 'none' as const, commission_value: '',
  payment_conditions: '', notes: '', color: '#6366F1',
}

const COLOR_PRESETS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#3B82F6']

export default function PracticeLocationsScreen() {
  const insets = useSafeAreaInsets()
  const { profile } = useSessionStore()
  const qc = useQueryClient()

  const query = useQuery<PracticeLocation[]>({
    queryKey: ['practice-locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('practice_locations').select('*').order('sort_order')
      if (error) throw error
      return data as PracticeLocation[]
    },
  })

  const save = useMutation({
    mutationFn: async ({ id, ...d }: any) => {
      const payload = { ...d, psychologist_id: profile?.id, commission_value: d.commission_value ? Number(d.commission_value) : null }
      if (id) {
        const { error } = await supabase.from('practice_locations').update(payload).eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('practice_locations').insert({ ...payload, sort_order: (query.data?.length ?? 0) + 1 })
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['practice-locations'] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('practice_locations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['practice-locations'] }),
  })

  const { toast, showToast, hideToast } = useToast()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<PracticeLocation | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }))

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true) }
  const openEdit = (l: PracticeLocation) => {
    setEditing(l)
    setForm({
      name: l.name, address: l.address ?? '', postal_code: l.postal_code ?? '',
      city: l.city ?? '', contact_person: l.contact_person ?? '',
      phone: l.phone ?? '', phone_ddi: l.phone_ddi ?? '', email: l.email ?? '',
      commission_type: l.commission_type, commission_value: l.commission_value?.toString() ?? '',
      payment_conditions: l.payment_conditions ?? '', notes: l.notes ?? '', color: l.color,
    })
    setModal(true)
  }

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) { Alert.alert('Erro', 'Nome é obrigatório.'); return }
    try {
      await save.mutateAsync({ id: editing?.id, ...form })
      setModal(false)
      showToast(editing ? 'Local atualizado com sucesso!' : 'Local criado com sucesso!')
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao guardar.')
    }
  }, [form, editing, save])

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
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary, flex: 1 }}>Locais de prática</Text>
        <Button title="Novo" size="sm" leftIcon={<Ionicons name="add" size={16} color="#FFF" />} onPress={openCreate} />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: insets.bottom + 40 }}
        refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} tintColor={theme.colors.primary} />}
      >
        {query.isLoading ? <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} /> :
          (query.data ?? []).length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
              <Ionicons name="business-outline" size={48} color={theme.colors.text.tertiary} />
              <Text style={{ fontSize: 16, color: theme.colors.text.secondary, textAlign: 'center' }}>
                Nenhum local de prática.{'\n'}Adicione consultórios, clínicas, etc.
              </Text>
            </View>
          ) : (query.data ?? []).map((l) => (
            <View key={l.id} style={{
              backgroundColor: theme.colors.surface, borderRadius: 12, padding: theme.spacing.md,
              marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border,
              flexDirection: 'row', alignItems: 'center', gap: 12,
            }}>
              <View style={{ width: 14, height: 52, borderRadius: 7, backgroundColor: l.color }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>{l.name}</Text>
                {l.city && <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 }}>{[l.city, l.address].filter(Boolean).join(' · ')}</Text>}
                {(l.phone || l.email) && <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: 1 }}>{[l.phone_ddi, l.phone].filter(Boolean).join(' ')} {l.email}</Text>}
              </View>
              <TouchableOpacity onPress={() => openEdit(l)} style={{ padding: 4 }}>
                <Ionicons name="pencil-outline" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('Eliminar', `Eliminar "${l.name}"?`, [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => remove.mutate(l.id) },
              ])} style={{ padding: 4 }}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <ScrollView style={{ maxHeight: '90%' }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled">
            <View style={{
              backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
              padding: 24, paddingBottom: insets.bottom + 24, gap: 12,
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text.primary }}>
                {editing ? 'Editar local' : 'Novo local de prática'}
              </Text>

              {/* Name */}
              <View><Text style={fl}>Nome *</Text><TextInput value={form.name} onChangeText={(v) => set('name', v)} placeholder="Ex: Consultório Lisboa" placeholderTextColor={theme.colors.text.tertiary} style={fi} /></View>

              {/* Address */}
              <View><Text style={fl}>Endereço</Text><TextInput value={form.address} onChangeText={(v) => set('address', v)} placeholder="Rua, nº, andar" placeholderTextColor={theme.colors.text.tertiary} style={fi} /></View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}><Text style={fl}>Código postal</Text><TextInput value={form.postal_code} onChangeText={(v) => set('postal_code', v)} placeholder="0000-000" placeholderTextColor={theme.colors.text.tertiary} style={fi} /></View>
                <View style={{ flex: 1 }}><Text style={fl}>Cidade</Text><TextInput value={form.city} onChangeText={(v) => set('city', v)} placeholder="Lisboa" placeholderTextColor={theme.colors.text.tertiary} style={fi} /></View>
              </View>

              {/* Contact */}
              <View><Text style={fl}>Pessoa de contacto</Text><TextInput value={form.contact_person} onChangeText={(v) => set('contact_person', v)} placeholder="Nome" placeholderTextColor={theme.colors.text.tertiary} style={fi} /></View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ width: 80 }}><Text style={fl}>DDI</Text><TextInput value={form.phone_ddi} onChangeText={(v) => set('phone_ddi', v)} placeholder="+351" placeholderTextColor={theme.colors.text.tertiary} style={fi} keyboardType="phone-pad" /></View>
                <View style={{ flex: 1 }}><Text style={fl}>Telefone</Text><TextInput value={form.phone} onChangeText={(v) => set('phone', v)} placeholder="912 345 678" placeholderTextColor={theme.colors.text.tertiary} style={fi} keyboardType="phone-pad" /></View>
              </View>

              <View><Text style={fl}>Email</Text><TextInput value={form.email} onChangeText={(v) => set('email', v)} placeholder="info@clinica.pt" placeholderTextColor={theme.colors.text.tertiary} style={fi} keyboardType="email-address" autoCapitalize="none" /></View>

              {/* Commission */}
              <View>
                <Text style={fl}>Comissão</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(['none', 'percentage', 'fixed'] as const).map((t) => (
                    <TouchableOpacity key={t} onPress={() => set('commission_type', t)}
                      style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
                        backgroundColor: form.commission_type === t ? theme.colors.primary : theme.colors.surfaceSecondary,
                        borderWidth: 1, borderColor: form.commission_type === t ? theme.colors.primary : theme.colors.border }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: form.commission_type === t ? '#FFF' : theme.colors.text.secondary }}>
                        {t === 'none' ? 'Sem' : t === 'percentage' ? '%' : 'Fixo'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {form.commission_type !== 'none' && (
                  <TextInput value={form.commission_value} onChangeText={(v) => set('commission_value', v)}
                    placeholder={form.commission_type === 'percentage' ? 'Ex: 20' : 'Ex: 50.00'}
                    placeholderTextColor={theme.colors.text.tertiary} style={[fi, { marginTop: 8 }]} keyboardType="decimal-pad" />
                )}
              </View>

              <View><Text style={fl}>Condições de pagamento</Text><TextInput value={form.payment_conditions} onChangeText={(v) => set('payment_conditions', v)} placeholder="Ex: 30 dias após sessão" placeholderTextColor={theme.colors.text.tertiary} style={fi} /></View>
              <View><Text style={fl}>Notas</Text><TextInput value={form.notes} onChangeText={(v) => set('notes', v)} placeholder="Notas internas..." placeholderTextColor={theme.colors.text.tertiary} style={[fi, { minHeight: 60, textAlignVertical: 'top' }]} multiline /></View>

              {/* Color */}
              <View>
                <Text style={fl}>Cor identificadora</Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {COLOR_PRESETS.map((c) => (
                    <TouchableOpacity key={c} onPress={() => set('color', c)}
                      style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c,
                        borderWidth: form.color === c ? 3 : 1.5,
                        borderColor: form.color === c ? theme.colors.text.primary : 'transparent' }} />
                  ))}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                <Button title="Cancelar" variant="outline" onPress={() => setModal(false)} style={{ flex: 1 }} />
                <Button title="Guardar" onPress={handleSave} loading={save.isPending} style={{ flex: 1 }} />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const fl = { fontSize: 12, fontWeight: '600' as const, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: 0.4 }
const fi = { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, fontSize: 15, color: '#111827', backgroundColor: '#F9FAFB' }
