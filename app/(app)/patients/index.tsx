import React, { useState, useCallback } from 'react'
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
        size={56}
        color={theme.colors.text.tertiary}
      />
      <Text
        style={{
          ...theme.typography.h3,
          color: theme.colors.text.secondary,
        }}
      >
        {hasSearch ? 'Nenhum resultado' : 'Nenhum paciente ainda'}
      </Text>
      <Text
        style={{
          ...theme.typography.body,
          color: theme.colors.text.tertiary,
          textAlign: 'center',
          paddingHorizontal: 40,
        }}
      >
        {hasSearch
          ? 'Tente outro termo de busca.'
          : 'Toque no botao + para adicionar o primeiro paciente.'}
      </Text>
    </View>
  )
}

export default function PatientsListScreen() {
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PatientStatusFilter>('all')

  const {
    data: patients,
    isLoading,
    refetch,
    isFetching,
  } = usePatients({
    status: statusFilter,
    search: search.trim() || undefined,
  })

  const deleteMutation = useDeletePatient()

  const filtered = patients ?? []

  const handleDelete = useCallback(
    (patient: Patient) => {
      Alert.alert(
        'Excluir paciente',
        `Tem certeza que deseja excluir ${patient.full_name}? Esta acao nao pode ser desfeita.`,
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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
          <Text
            style={{
              ...theme.typography.h1,
              color: theme.colors.text.primary,
            }}
          >
            Pacientes
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(app)/patients/new')}
            activeOpacity={0.8}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              ...theme.shadow.sm,
            }}
          >
            <Ionicons name="add" size={24} color={theme.colors.text.inverse} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceSecondary,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            height: 44,
            gap: 10,
          }}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.colors.text.tertiary}
          />
          <TextInput
            placeholder="Buscar por nome, NIF, CPF, tutor..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={search}
            onChangeText={setSearch}
            style={{
              flex: 1,
              ...theme.typography.body,
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
                  paddingHorizontal: 14,
                  borderRadius: theme.radius.full,
                  backgroundColor: active
                    ? theme.colors.primary
                    : theme.colors.surface,
                  borderWidth: 1,
                  borderColor: active
                    ? theme.colors.primary
                    : theme.colors.border,
                }}
              >
                <Text
                  style={{
                    ...theme.typography.label,
                    fontWeight: active ? '600' : '400',
                    color: active
                      ? theme.colors.text.inverse
                      : theme.colors.text.secondary,
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
          <Text
            style={{
              ...theme.typography.body,
              color: theme.colors.text.tertiary,
            }}
          >
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
        />
      )}

    </View>
  )
}
