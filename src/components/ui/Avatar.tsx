import React, { memo } from 'react'
import { View, Text } from 'react-native'
import { Image } from 'expo-image'
import { theme } from '@/constants/theme'
import { getInitials } from '@/utils/format'

// Deterministic color from name
const COLORS = [
  '#7C3AED', '#06B6D4', '#10B981', '#F59E0B',
  '#EF4444', '#8B5CF6', '#EC4899', '#3B82F6',
]

function nameToColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length] ?? COLORS[0]
}

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const sizePx: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 80,
}

const fontPx: Record<AvatarSize, number> = {
  xs: 11,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
}

interface AvatarProps {
  name: string
  uri?: string | null
  url?: string | null   // alias for uri
  size?: AvatarSize | number
}

export const Avatar = memo(function Avatar({
  name,
  uri,
  url,
  size = 'md',
}: AvatarProps) {
  const resolvedUri = uri ?? url ?? null
  const px = typeof size === 'number' ? size : sizePx[size]
  const fs = typeof size === 'number' ? Math.round(size * 0.33) : fontPx[size as AvatarSize]
  const bg = nameToColor(name)
  const initials = getInitials(name)

  if (resolvedUri) {
    return (
      <Image
        source={{ uri: resolvedUri }}
        style={{
          width: px,
          height: px,
          borderRadius: px / 2,
          backgroundColor: theme.colors.primaryLight,
        }}
        contentFit="cover"
        transition={200}
      />
    )
  }

  return (
    <View
      style={{
        width: px,
        height: px,
        borderRadius: px / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: fs,
          fontWeight: '700',
          letterSpacing: 0.5,
        }}
      >
        {initials}
      </Text>
    </View>
  )
})
