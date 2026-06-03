import React, { memo, useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native'
import { Image } from 'expo-image'
import * as FileSystem from 'expo-file-system/legacy'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/constants/theme'

interface PhotoViewerProps {
  visible: boolean
  uri: string
  patientName: string
  onClose: () => void
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

export const PhotoViewer = memo(function PhotoViewer({
  visible,
  uri,
  patientName,
  onClose,
}: PhotoViewerProps) {
  const [saving, setSaving] = useState(false)

  async function saveToLibrary() {
    setSaving(true)
    try {
      // Importação dinâmica — requer `npx expo install expo-media-library`
      let MediaLibrary: typeof import('expo-media-library')
      try {
        MediaLibrary = require('expo-media-library')
      } catch {
        Alert.alert(
          'Funcionalidade indisponível',
          'Execute `npx expo install expo-media-library` para habilitar o salvamento de fotos.',
        )
        return
      }

      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permita o acesso à galeria nas configurações do dispositivo.')
        return
      }

      const filename = `${FileSystem.cacheDirectory}patient_photo_${Date.now()}.jpg`
      const { uri: localUri } = await FileSystem.downloadAsync(uri, filename)
      await MediaLibrary.saveToLibraryAsync(localUri)
      Alert.alert('Foto salva', 'A foto foi salva no rolo de câmera.')
    } catch (err: any) {
      Alert.alert('Erro', err?.message ?? 'Não foi possível salvar a foto.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {Platform.OS === 'ios' && <StatusBar barStyle="light-content" />}

        {/* Header */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 56,
          paddingHorizontal: theme.spacing.md,
          paddingBottom: theme.spacing.md,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' }} numberOfLines={1}>
            {patientName}
          </Text>

          <TouchableOpacity
            onPress={saveToLibrary}
            disabled={saving}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Ionicons name="download-outline" size={26} color="#fff" />
            }
          </TouchableOpacity>
        </View>

        {/* Photo */}
        <Image
          source={{ uri }}
          style={{ width: SCREEN_W, height: SCREEN_H }}
          contentFit="contain"
          transition={150}
        />
      </View>
    </Modal>
  )
})
