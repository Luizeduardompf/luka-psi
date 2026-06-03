import React, { memo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/constants/theme'
import { getInitials } from '@/utils/format'
import { useUploadPatientPhoto, useDeletePatientPhoto } from '@/hooks/usePatientPhoto'

interface PatientPhotoEditorProps {
  patientId: string
  patientName: string
  photoUrl?: string | null
}

const PHOTO_SIZE = 96

function nameToColor(name: string): string {
  const COLORS = [
    '#7C3AED', '#06B6D4', '#10B981', '#F59E0B',
    '#EF4444', '#8B5CF6', '#EC4899', '#3B82F6',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length] ?? COLORS[0]
}

export const PatientPhotoEditor = memo(function PatientPhotoEditor({
  patientId,
  patientName,
  photoUrl,
}: PatientPhotoEditorProps) {
  const [localUri, setLocalUri] = useState<string | null>(null)
  const uploadMutation = useUploadPatientPhoto()
  const deleteMutation = useDeletePatientPhoto()

  const isLoading = uploadMutation.isPending || deleteMutation.isPending
  const displayUri = localUri ?? photoUrl ?? null

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria de fotos nas configurações do dispositivo.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      setLocalUri(asset.uri)
      uploadMutation.mutate(
        { patientId, localUri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' },
        { onError: (err) => Alert.alert('Erro ao enviar foto', err.message ?? String(err)) },
      )
    }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera nas configurações do dispositivo.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      setLocalUri(asset.uri)
      uploadMutation.mutate(
        { patientId, localUri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' },
        { onError: (err) => Alert.alert('Erro ao enviar foto', err.message ?? String(err)) },
      )
    }
  }

  function handleRemove() {
    Alert.alert('Remover foto', 'Tem certeza que deseja remover a foto do paciente?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          setLocalUri(null)
          deleteMutation.mutate(patientId, {
            onError: (err) => Alert.alert('Erro ao remover foto', err.message),
          })
        },
      },
    ])
  }

  function showOptions() {
    const options = ['Escolher da galeria', 'Tirar foto']
    if (displayUri) options.push('Remover foto')
    options.push('Cancelar')

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: displayUri ? options.length - 2 : undefined,
          cancelButtonIndex: options.length - 1,
        },
        (index) => {
          if (index === 0) pickFromGallery()
          else if (index === 1) takePhoto()
          else if (index === 2 && displayUri) handleRemove()
        },
      )
    } else {
      // Android: Alert como fallback (sem ActionSheet nativo)
      Alert.alert('Foto do paciente', 'Escolha uma opção', [
        { text: 'Galeria', onPress: pickFromGallery },
        { text: 'Câmera', onPress: takePhoto },
        ...(displayUri ? [{ text: 'Remover', style: 'destructive' as const, onPress: handleRemove }] : []),
        { text: 'Cancelar', style: 'cancel' },
      ])
    }
  }

  const bg = nameToColor(patientName)
  const initials = getInitials(patientName)

  return (
    <View style={{ alignItems: 'center', paddingVertical: theme.spacing.lg }}>
      <TouchableOpacity onPress={showOptions} disabled={isLoading} activeOpacity={0.8}>
        <View style={{ position: 'relative' }}>
          {displayUri ? (
            <Image
              source={{ uri: displayUri }}
              style={{
                width: PHOTO_SIZE,
                height: PHOTO_SIZE,
                borderRadius: PHOTO_SIZE / 2,
                backgroundColor: theme.colors.primaryLight,
              }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                width: PHOTO_SIZE,
                height: PHOTO_SIZE,
                borderRadius: PHOTO_SIZE / 2,
                backgroundColor: bg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 32, fontWeight: '700', letterSpacing: 0.5 }}>
                {initials}
              </Text>
            </View>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <View style={{
              position: 'absolute', inset: 0,
              borderRadius: PHOTO_SIZE / 2,
              backgroundColor: 'rgba(0,0,0,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ActivityIndicator color="#fff" />
            </View>
          )}

          {/* Edit badge */}
          {!isLoading && (
            <View style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: theme.colors.background,
            }}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          )}
        </View>
      </TouchableOpacity>

      <Text style={{ ...theme.typography.caption, color: theme.colors.text.tertiary, marginTop: 8 }}>
        Toque para alterar foto
      </Text>
    </View>
  )
})
