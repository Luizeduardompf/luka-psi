import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { formsService } from '@/services/forms.service'
import { useSession } from './useSession'
import {
  CreateFormTemplateInput,
  UpdateFormTemplateInput,
  CreateSectionInput,
  CreateQuestionInput,
  SendFormInput,
  SubmitResponseInput,
  FormSection,
  FormQuestion,
  FormQuestionOption,
} from '@/types/forms.types'

// ─── Query keys ────────────────────────────────────────────────────────────────
export const formKeys = {
  all: ['forms'] as const,
  templates: () => [...formKeys.all, 'templates'] as const,
  templateList: (userId: string) => [...formKeys.templates(), 'list', userId] as const,
  templateDetail: (id: string) => [...formKeys.templates(), 'detail', id] as const,
  submissions: () => [...formKeys.all, 'submissions'] as const,
  submissionsForPatient: (patientId: string) =>
    [...formKeys.submissions(), 'patient', patientId] as const,
  submissionDetail: (id: string) => [...formKeys.submissions(), 'detail', id] as const,
  submissionByToken: (token: string) => [...formKeys.submissions(), 'token', token] as const,
  responses: (submissionId: string) => [...formKeys.all, 'responses', submissionId] as const,
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function useFormTemplates() {
  const { userId } = useSession()

  return useQuery({
    queryKey: formKeys.templateList(userId ?? ''),
    queryFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado.')
      const result = await formsService.listTemplates(userId)
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useFormTemplateDetail(templateId: string | null) {
  return useQuery({
    queryKey: formKeys.templateDetail(templateId ?? ''),
    queryFn: async () => {
      if (!templateId) throw new Error('Template ID é obrigatório.')
      const result = await formsService.getTemplateWithDetails(templateId)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!templateId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateTemplate() {
  const { userId } = useSession()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateFormTemplateInput) => {
      if (!userId) throw new Error('Usuário não autenticado.')
      const result = await formsService.createTemplate(userId, input)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: formKeys.templates() })
    },
  })
}

export function useUpdateTemplate() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      templateId,
      input,
    }: {
      templateId: string
      input: UpdateFormTemplateInput
    }) => {
      const result = await formsService.updateTemplate(templateId, input)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: formKeys.templates() })
      void qc.invalidateQueries({ queryKey: formKeys.templateDetail(data.id) })
    },
  })
}

export function useCloneTemplate() {
  const { userId } = useSession()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sourceTemplateId,
      newTitle,
    }: {
      sourceTemplateId: string
      newTitle?: string
    }) => {
      if (!userId) throw new Error('Usuário não autenticado.')
      const result = await formsService.cloneTemplate(sourceTemplateId, userId, newTitle)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: formKeys.templates() })
    },
  })
}

export function useDeleteTemplate() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (templateId: string) => {
      const result = await formsService.deleteTemplate(templateId)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: formKeys.templates() })
    },
  })
}

// ─── Seções ───────────────────────────────────────────────────────────────────

export function useCreateSection() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateSectionInput) => {
      const result = await formsService.createSection(input)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: formKeys.templateDetail(data.template_id) })
    },
  })
}

export function useUpdateSection() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sectionId,
      templateId,
      input,
    }: {
      sectionId: string
      templateId: string
      input: Partial<Pick<FormSection, 'title' | 'description' | 'sort_order'>>
    }) => {
      const result = await formsService.updateSection(sectionId, input)
      if (result.error) throw new Error(result.error)
      return { data: result.data!, templateId }
    },
    onSuccess: ({ templateId }) => {
      void qc.invalidateQueries({ queryKey: formKeys.templateDetail(templateId) })
    },
  })
}

export function useDeleteSection() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sectionId,
      templateId,
    }: {
      sectionId: string
      templateId: string
    }) => {
      const result = await formsService.deleteSection(sectionId)
      if (result.error) throw new Error(result.error)
      return templateId
    },
    onSuccess: (templateId) => {
      void qc.invalidateQueries({ queryKey: formKeys.templateDetail(templateId) })
    },
  })
}

// ─── Perguntas ────────────────────────────────────────────────────────────────

export function useCreateQuestion() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateQuestionInput) => {
      const result = await formsService.createQuestion(input)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: formKeys.templateDetail(data.template_id) })
    },
  })
}

export function useUpdateQuestion() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      questionId,
      templateId,
      input,
    }: {
      questionId: string
      templateId: string
      input: Partial<
        Pick<
          FormQuestion,
          | 'title'
          | 'description'
          | 'help_text'
          | 'is_required'
          | 'sort_order'
          | 'scale_min'
          | 'scale_max'
          | 'scale_step'
        >
      >
    }) => {
      const result = await formsService.updateQuestion(questionId, input)
      if (result.error) throw new Error(result.error)
      return { data: result.data!, templateId }
    },
    onSuccess: ({ templateId }) => {
      void qc.invalidateQueries({ queryKey: formKeys.templateDetail(templateId) })
    },
  })
}

export function useDeleteQuestion() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      questionId,
      templateId,
    }: {
      questionId: string
      templateId: string
    }) => {
      const result = await formsService.deleteQuestion(questionId)
      if (result.error) throw new Error(result.error)
      return templateId
    },
    onSuccess: (templateId) => {
      void qc.invalidateQueries({ queryKey: formKeys.templateDetail(templateId) })
    },
  })
}

export function useAddOption() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      questionId,
      templateId,
      label,
      sortOrder,
    }: {
      questionId: string
      templateId: string
      label: string
      sortOrder: number
    }) => {
      const result = await formsService.addOption(questionId, label, sortOrder)
      if (result.error) throw new Error(result.error)
      return { data: result.data!, templateId }
    },
    onSuccess: ({ templateId }) => {
      void qc.invalidateQueries({ queryKey: formKeys.templateDetail(templateId) })
    },
  })
}

export function useUpdateOption() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      optionId,
      templateId,
      input,
    }: {
      optionId: string
      templateId: string
      input: Partial<Pick<FormQuestionOption, 'label' | 'sort_order'>>
    }) => {
      const result = await formsService.updateOption(optionId, input)
      if (result.error) throw new Error(result.error)
      return { data: result.data!, templateId }
    },
    onSuccess: ({ templateId }) => {
      void qc.invalidateQueries({ queryKey: formKeys.templateDetail(templateId) })
    },
  })
}

export function useDeleteOption() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      optionId,
      templateId,
    }: {
      optionId: string
      templateId: string
    }) => {
      const result = await formsService.deleteOption(optionId)
      if (result.error) throw new Error(result.error)
      return templateId
    },
    onSuccess: (templateId) => {
      void qc.invalidateQueries({ queryKey: formKeys.templateDetail(templateId) })
    },
  })
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export function useSubmissionsForPatient(patientId: string | null) {
  const { userId } = useSession()

  return useQuery({
    queryKey: formKeys.submissionsForPatient(patientId ?? ''),
    queryFn: async () => {
      if (!patientId || !userId) throw new Error('IDs são obrigatórios.')
      const result = await formsService.listSubmissionsForPatient(patientId, userId)
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
    enabled: !!patientId && !!userId,
    staleTime: 1000 * 60 * 1,
  })
}

export function useSubmissionDetail(submissionId: string | null) {
  return useQuery({
    queryKey: formKeys.submissionDetail(submissionId ?? ''),
    queryFn: async () => {
      if (!submissionId) throw new Error('Submission ID é obrigatório.')
      const result = await formsService.getSubmissionWithResponses(submissionId)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!submissionId,
  })
}

export function useSendForm() {
  const { userId } = useSession()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: SendFormInput) => {
      if (!userId) throw new Error('Usuário não autenticado.')
      const result = await formsService.sendForm(userId, input)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({
        queryKey: formKeys.submissionsForPatient(data.patient_id),
      })
    },
  })
}

// ─── Respostas (uso público — paciente) ───────────────────────────────────────

export function usePublicResponses(submissionId: string | null) {
  return useQuery({
    queryKey: formKeys.responses(submissionId ?? ''),
    queryFn: async () => {
      if (!submissionId) throw new Error('Submission ID é obrigatório.')
      const result = await formsService.getResponses(submissionId)
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
    enabled: !!submissionId,
  })
}

export function useSaveResponse() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: SubmitResponseInput) => {
      const result = await formsService.saveResponse(input)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: formKeys.responses(vars.submission_id) })
    },
  })
}

export function useCompleteSubmission() {
  return useMutation({
    mutationFn: async ({
      submissionId,
      responses,
    }: {
      submissionId: string
      responses: import('@/types/forms.types').FormResponse[]
    }) => {
      const result = await formsService.completeSubmission(submissionId, responses)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
  })
}

// ─── Logo do psicólogo ────────────────────────────────────────────────────────

export function useUpdateLogo() {
  const { userId } = useSession()

  return useMutation({
    mutationFn: async ({
      fileUri,
      mimeType,
    }: {
      fileUri: string
      mimeType?: string
    }) => {
      if (!userId) throw new Error('Usuário não autenticado.')
      const result = await formsService.uploadLogo(userId, fileUri, mimeType)
      if (result.error) throw new Error(result.error)
      return result.data!
    },
  })
}
