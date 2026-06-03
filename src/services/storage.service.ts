import { supabase } from './supabase'
import { formatSupabaseError } from '@/utils/errors'
import { ServiceResult } from '@/types/app.types'
import * as FileSystem from 'expo-file-system/legacy'

/** Converte base64 string para ArrayBuffer sem dependências externas */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

const BUCKET = 'patient-photos'

export const storageService = {
  /**
   * Faz upload de foto de paciente.
   * Path: {psychologistId}/{patientId}/photo.{ext}
   * Retorna a URL pública assinada (válida por 1 ano).
   */
  async uploadPatientPhoto(
    psychologistId: string,
    patientId: string,
    localUri: string,
    mimeType: string = 'image/jpeg',
  ): Promise<ServiceResult<string>> {
    try {
      const ext = mimeType === 'image/png' ? 'png' : 'jpg'
      const path = `${psychologistId}/${patientId}/photo.${ext}`

      // React Native não suporta fetch() para URIs locais de forma confiável.
      // Lê o ficheiro como base64 via FileSystem e converte para ArrayBuffer.
      const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      const arrayBuffer = base64ToArrayBuffer(base64)

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, arrayBuffer, {
          contentType: mimeType,
          upsert: true,
        })

      if (uploadError) {
        return { data: null, error: formatSupabaseError(uploadError) }
      }

      // Signed URL com 1 ano de validade
      const { data: signedData, error: signedError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, 60 * 60 * 24 * 365)

      if (signedError || !signedData?.signedUrl) {
        return { data: null, error: formatSupabaseError(signedError ?? new Error('Erro ao gerar URL')) }
      }

      return { data: signedData.signedUrl, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  /**
   * Remove foto do storage.
   * Path: {psychologistId}/{patientId}/photo.{ext}
   */
  async deletePatientPhoto(
    psychologistId: string,
    patientId: string,
  ): Promise<ServiceResult<null>> {
    try {
      // Tenta remover jpg e png (não sabemos qual foi salvo sem consultar)
      const paths = [
        `${psychologistId}/${patientId}/photo.jpg`,
        `${psychologistId}/${patientId}/photo.png`,
      ]

      const { error } = await supabase.storage.from(BUCKET).remove(paths)

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },
}
