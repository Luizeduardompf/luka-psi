import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/constants/theme'
import {
  useCivilStatuses,
  useCreateCivilStatus,
  useUpdateCivilStatus,
  useDeleteCivilStatus,
} from '@/hooks/useLookups'
import { CivilStatus } from '@/types/app.types'
import { Button } from '@/components/ui/Button'

function EditModal({
  visible,
  initialValue,
  onSave,
  onClose,
  loading,
}: {
  visible: boolean
  initialValue: string
  onSave: (name: string) => void
  onClose: () => void
  loading: boolean
}) {
  const [value, setValue] = useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue, visible])

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              padding: theme.spacing.lg,
              gap: theme.spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: theme.colors.text.primary,
              }}
            >
              {initialValue ? 'Editar estado civil' : 'Novo estado civil'}
            </Text>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder="Ex: Solteiro(a)"
              autoFocus
              style={{
                borderWidth: 1.5,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: 14,
                fontSize: 16,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background,
              }}
            />
            <Button
              title="Salvar"
              onPress={() => {
                if (value.trim()) onSave(value.trim())
              }}
              loading={loading}
              fullWidth
            />
            <Button title="Cancelar" variant="ghost" onPress={onClose} fullWidth />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export default function CivilStatusesScreen() {
  const insets = useSafeAreaInsets()
  const { data: statuses, isLoading } = useCivilStatuses()
  const createMutation = useCreateCivilStatus()
  const updateMutation = useUpdateCivilStatus()
  const deleteMutation = useDeleteCivilStatus()

  const [modalVisible, setModalVisible] = useState(false)
  const [editing, setEditing] = useState<CivilStatus | null>(null)

  const openCreate = () => {
    setEditing(null)
    setModalVisible(true)
  }

  const openEdit = (cs: CivilStatus) => {
    setEditing(cs)
    setModalVisible(true)
  }

  const handleSave = async (name: string) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, name })
      } else {
        await createMutation.mutateAsync(name)
      }
      setModalVisible(false)
    } catch (err: unknown) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao salvar.')
    }
  }

  const handleDelete = (cs: CivilStatus) => {
    Alert.alert(
      'Excluir',
      `Excluir "${cs.name}"? Pacientes vinculados perderão esta informação.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(cs.id),
        },
      ],
    )
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          gap: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text.primary,
            flex: 1,
          }}
        >
          Estado civil
        </Text>
        <TouchableOpacity
          onPress={openCreate}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.colors.text.tertiary }}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={statuses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingVertical: theme.spacing.sm,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 80,
              }}
            >
              <Ionicons name="heart-outline" size={48} color={theme.colors.text.tertiary} />
              <Text
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: 16,
                  marginTop: 12,
                  fontWeight: '600',
                }}
              >
                Nenhum estado civil
              </Text>
              <Text
                style={{
                  color: theme.colors.text.tertiary,
                  fontSize: 14,
                  marginTop: 4,
                  textAlign: 'center',
                  paddingHorizontal: 40,
                }}
              >
                Toque no + para adicionar opções como "Solteiro", "Casado", etc.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                marginHorizontal: theme.spacing.md,
                marginBottom: 2,
                borderRadius: theme.radius.md,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: theme.colors.text.primary,
                }}
              >
                {item.name}
              </Text>
              <TouchableOpacity
                onPress={() => openEdit(item)}
                style={{ padding: 8, marginRight: 4 }}
              >
                <Ionicons name="pencil-outline" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={{ padding: 8 }}
              >
                <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <EditModal
        visible={modalVisible}
        initialValue={editing?.name ?? ''}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </View>
  )
}
