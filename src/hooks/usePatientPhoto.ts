import { useMutation, useQueryClient } from '@tanstack/react-query'
import { storageService } from '@/services/storage.service'
import { patientsService } from '@/services/patients.service'
import { useSession } from './useSession'
import { patientKeys } from './usePatients'

interface UploadPhotoParams {
  patientId: string
  localUri: string
  mimeType?: string
}

/**
 * Upload de foto: envia para o storage e salva a URL no paciente.
 * Invalida o cache do paciente após sucesso.
 */
export function useUploadPatientPhoto() {
  const qc = useQueryClient()
  const { userId } = useSession()

  return useMutation({
    mutationFn: async ({ patientId, localUri, mimeType }: UploadPhotoParams) => {
      if (!userId) throw new Error('Usuário não autenticado.')

      const uploadResult = await storageService.uploadPatientPhoto(
        userId,
        patientId,
        localUri,
        mimeType,
      )
      if (uploadResult.error) throw new Error(uploadResult.error)

      const updateResult = await patientsService.updatePatient(patientId, {
        photo_url: uploadResult.data,
      })
      if (updateResult.error) throw new Error(updateResult.error)

      return uploadResult.data!
    },
    onSuccess: (_data, { patientId }) => {
      void qc.invalidateQueries({ queryKey: patientKeys.detail(patientId) })
      void qc.invalidateQueries({ queryKey: patientKeys.lists() })
      void qc.invalidateQueries({ queryKey: patientKeys.recent(userId ?? '') })
    },
  })
}

/**
 * Remove foto do storage e limpa photo_url no paciente.
 */
export function useDeletePatientPhoto() {
  const qc = useQueryClient()
  const { userId } = useSession()

  return useMutation({
    mutationFn: async (patientId: string) => {
      if (!userId) throw new Error('Usuário não autenticado.')

      const deleteResult = await storageService.deletePatientPhoto(userId, patientId)
      if (deleteResult.error) throw new Error(deleteResult.error)

      const updateResult = await patientsService.updatePatient(patientId, {
        photo_url: null,
      })
      if (updateResult.error) throw new Error(updateResult.error)
    },
    onSuccess: (_data, patientId) => {
      void qc.invalidateQueries({ queryKey: patientKeys.detail(patientId) })
      void qc.invalidateQueries({ queryKey: patientKeys.lists() })
      void qc.invalidateQueries({ queryKey: patientKeys.recent(userId ?? '') })
    },
  })
}
