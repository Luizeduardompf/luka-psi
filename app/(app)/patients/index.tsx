import React, { useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PatientCard } from '@/components/patients/PatientCard'
import { theme } from '@/constants/theme'
import { usePatients, useDeletePatient } from '@/hooks/usePatients'
import { PatientStatusFilter, Patient } from '@/types/app.types'

type FilterChip = { label: string; value: PatientStatusFilter }

const FILTER_CHIPS: FilterChip[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Ativos', value: 'active' },
  { label: 'Inativos', value: 'inactive' },
  { label: 'Lista de espera', value: 'waiting' },
]

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        gap: 12,
      }}
    >
      <Ionicons
        name={hasSearch ? 'search-outline' : 'people-outline'}
        size={64}
        color={theme.colors.text.tertiary}
      />
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.text.secondary,
        }}
      >
        {hasSearch ? 'Nenhum resultado' : 'Nenhum paciente ainda'}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: theme.colors.text.tertiary,
          textAlign: 'center',
          paddingHorizontal: 40,
        }}
      >
        {hasSearch
          ? 'Tente outro termo de busca.'
          : 'Toque no botão + para adicionar o primeiro paciente.'}
      </Text>
    </View>
  )
}

export default function PatientsListScreen() {
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PatientStatusFilter>('all')

  const { data: patients, isLoading, refetch, isFetching } = usePatients({
    status: statusFilter,
  })

  const deleteMutation = useDeletePatient()

  const filtered = useMemo(() => {
    if (!search.trim()) return patients ?? []
    const q = search.toLowerCase().trim()
    return (patients ?? []).filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q),
    )
  }, [patients, search])

  const handleDelete = useCallback(
    (patient: Patient) => {
      Alert.alert(
        'Excluir paciente',
        `Tem certeza que deseja excluir ${patient.full_name}? Esta ação não pode ser desfeita.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => {
              deleteMutation.mutate(patient.id, {
                onError: (err) => {
                  Alert.alert('Erro', err.message)
                },
              })
            },
          },
        ],
      )
    },
    [deleteMutation],
  )

  const renderItem = useCallback(
    ({ item }: { item: Patient }) => (
      <PatientCard
        patient={item}
        onPress={() => router.push(`/(app)/patients/${item.id}`)}
      />
    ),
    [],
  )

  const keyExtractor = useCallback((item: Patient) => item.id, [])

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
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          backgroundColor: theme.colors.background,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: theme.colors.text.primary,
            letterSpacing: -0.5,
            marginBottom: theme.spacing.md,
          }}
        >
          Pacientes
        </Text>

        {/* Search bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            borderWidth: 1.5,
            borderColor: theme.colors.border,
            paddingHorizontal: theme.spacing.md,
            height: 48,
            gap: 10,
          }}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.colors.text.tertiary}
          />
          <TextInput
            placeholder="Buscar por nome, telefone ou e-mail..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={search}
            onChangeText={setSearch}
            style={{
              flex: 1,
              fontSize: 15,
              color: theme.colors.text.primary,
            }}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: theme.spacing.sm }}
          contentContainerStyle={{ gap: 8 }}
        >
          {FILTER_CHIPS.map((chip) => {
            const active = statusFilter === chip.value
            return (
              <TouchableOpacity
                key={chip.value}
                onPress={() => setStatusFilter(chip.value)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  borderRadius: theme.radius.full,
                  backgroundColor: active
                    ? theme.colors.primary
                    : theme.colors.surface,
                  borderWidth: 1.5,
                  borderColor: active
                    ? theme.colors.primary
                    : theme.colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: active ? '600' : '400',
                    color: active ? '#FFFFFF' : theme.colors.text.secondary,
                  }}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* List */}
      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: theme.colors.text.tertiary }}>
            Carregando...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.md,
            paddingBottom: insets.bottom + 80,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState hasSearch={search.trim().length > 0} />
          }
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => void refetch()}
              tintColor={theme.colors.primary}
            />
          }
          // Long press to delete
          onLongPress={undefined}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/patients/new')}
        activeOpacity={0.85}
        style={{
          position: 'absolute',
          right: theme.spacing.lg,
          bottom: insets.bottom + theme.spacing.lg,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          ...theme.shadow.md,
        }}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  )
}
