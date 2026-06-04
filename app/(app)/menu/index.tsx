import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '@/components/ui/Avatar'
import { theme } from '@/constants/theme'
import { useSession } from '@/hooks/useSession'

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  description?: string
  onPress: () => void
  color?: string
  showChevron?: boolean
}

function MenuItem({
  icon,
  label,
  description,
  onPress,
  color = theme.colors.text.primary,
  showChevron = true,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.sm,
        ...theme.shadow.sm,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radius.md,
          backgroundColor: color + '14',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            ...theme.typography.bodyMedium,
            color: theme.colors.text.primary,
          }}
        >
          {label}
        </Text>
        {description && (
          <Text
            style={{
              ...theme.typography.caption,
              color: theme.colors.text.tertiary,
              marginTop: 2,
            }}
          >
            {description}
          </Text>
        )}
      </View>
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.text.tertiary}
        />
      )}
    </TouchableOpacity>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        ...theme.typography.overline,
        color: theme.colors.text.secondary,
        textTransform: 'uppercase',
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.md,
        paddingHorizontal: theme.spacing.xs,
      }}
    >
      {title}
    </Text>
  )
}

export default function MenuScreen() {
  const insets = useSafeAreaInsets()
  const { displayName, profile } = useSession()

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing.xl,
          paddingHorizontal: theme.spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text
          style={{
            ...theme.typography.h1,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.lg,
          }}
        >
          Menu
        </Text>

        {/* Profile Card */}
        <TouchableOpacity
          onPress={() => router.push('/(app)/settings')}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.md,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            ...theme.shadow.sm,
          }}
        >
          <Avatar name={displayName} uri={profile?.avatar_url} size="lg" />
          <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
            <Text
              style={{
                ...theme.typography.h3,
                color: theme.colors.text.primary,
              }}
            >
              {displayName}
            </Text>
            <Text
              style={{
                ...theme.typography.bodySmall,
                color: theme.colors.text.secondary,
              }}
            >
              Ver perfil e configuracoes
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.text.tertiary}
          />
        </TouchableOpacity>

        {/* Tools Section */}
        <SectionHeader title="Ferramentas" />
        <MenuItem
          icon="document-text-outline"
          label="Formularios"
          description="Gerencie seus formularios de avaliacao"
          onPress={() => router.push('/(app)/forms')}
          color={theme.colors.primary}
        />
        <MenuItem
          icon="folder-outline"
          label="Documentos"
          description="Modelos e documentos salvos"
          onPress={() => {}}
          color={theme.colors.info}
        />
        <MenuItem
          icon="stats-chart-outline"
          label="Relatorios"
          description="Estatisticas e exportacoes"
          onPress={() => {}}
          color={theme.colors.accent}
        />

        {/* Settings Section */}
        <SectionHeader title="Configuracoes" />
        <MenuItem
          icon="settings-outline"
          label="Configuracoes"
          description="Perfil, conta e preferencias"
          onPress={() => router.push('/(app)/settings')}
          color={theme.colors.text.secondary}
        />
        <MenuItem
          icon="notifications-outline"
          label="Notificacoes"
          description="Gerenciar alertas e lembretes"
          onPress={() => {}}
          color={theme.colors.warning}
        />
        <MenuItem
          icon="help-circle-outline"
          label="Ajuda e Suporte"
          description="FAQ e contato"
          onPress={() => {}}
          color={theme.colors.success}
        />
        {/* Sobre */}
        <MenuItem
          icon="information-circle-outline"
          label="Sobre o Luka"
          description="Versão, créditos e informações"
          onPress={() => router.push('/(app)/menu/sobre')}
          color={theme.colors.text.tertiary}
        />
      </ScrollView>
    </View>
  )
}
