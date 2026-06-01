import { supabase } from './supabase'
import { formatSupabaseError } from '@/utils/errors'
import {
  FormTemplate,
  FormTemplateWithDetails,
  FormSection,
  FormSectionWithQuestions,
  FormQuestion,
  FormQuestionWithOptions,
  FormQuestionOption,
  FormSubmission,
  FormSubmissionWithDetails,
  FormResponse,
  FormSnapshot,
  SnapshotQuestion,
  SnapshotSection,
  CreateFormTemplateInput,
  UpdateFormTemplateInput,
  CreateSectionInput,
  CreateQuestionInput,
  SendFormInput,
  SubmitResponseInput,
  ServiceResult,
  DEFAULT_SEND_MESSAGE,
} from '@/types/forms.types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

// URL pública acessível pelo paciente via browser
// Em produção: https://app.luka.com.br/forms/<token>
// Em desenvolvimento: deep link luka://forms/<token>
const PUBLIC_BASE_URL =
  process.env.EXPO_PUBLIC_APP_URL ?? 'https://app.luka.com.br'

function buildPublicUrl(token: string): string {
  return `${PUBLIC_BASE_URL}/f/${token}`
}

function buildSnapshot(
  template: FormTemplateWithDetails,
  customMessage: string | null,
  expiresAt: string | null,
  extraSections: SendFormInput['extra_sections'],
): FormSnapshot {
  const sections: SnapshotSection[] = template.sections.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    sort_order: s.sort_order,
  }))

  const questions: SnapshotQuestion[] = template.sections.flatMap((s) =>
    s.questions.map((q) => ({
      id: q.id,
      // Orphan questions (no section_id in DB) are grouped under '__orphan__' section
      section_id: q.section_id ?? (s.id === '__orphan__' ? '__orphan__' : null),
      type: q.type,
      title: q.title,
      description: q.description,
      help_text: q.help_text,
      is_required: q.is_required,
      sort_order: q.sort_order,
      scale_min: q.scale_min,
      scale_max: q.scale_max,
      scale_step: q.scale_step,
      options: q.options.map((o) => ({
        id: o.id,
        label: o.label,
        sort_order: o.sort_order,
      })),
    })),
  )

  // Extras: gerar IDs locais para seções/perguntas ad-hoc
  if (extraSections && extraSections.length > 0) {
    let sectionOrder = sections.length + 1
    for (const extra of extraSections) {
      const sectionId = `extra_${Date.now()}_${Math.random().toString(36).slice(2)}`
      sections.push({
        id: sectionId,
        title: extra.title,
        description: extra.description ?? null,
        sort_order: sectionOrder++,
      })
      let qOrder = 1
      for (const eq of extra.questions) {
        const qId = `extra_q_${Date.now()}_${Math.random().toString(36).slice(2)}`
        questions.push({
          id: qId,
          section_id: sectionId,
          type: eq.type,
          title: eq.title,
          description: eq.description ?? null,
          help_text: eq.help_text ?? null,
          is_required: eq.is_required ?? false,
          sort_order: qOrder++,
          scale_min: eq.scale_min ?? 1,
          scale_max: eq.scale_max ?? 10,
          scale_step: eq.scale_step ?? 1,
          options: [],
        })
      }
    }
  }

  return {
    template_id: template.id,
    template_title: template.title,
    template_description: template.description,
    sections,
    questions,
    custom_message: customMessage,
    expires_at: expiresAt,
    snapshotted_at: new Date().toISOString(),
  }
}

// ─── Templates ────────────────────────────────────────────────────────────────

export const formsService = {
  // Lista templates do sistema + próprios do psicólogo
  async listTemplates(psychologistId: string): Promise<ServiceResult<FormTemplate[]>> {
    try {
      const { data, error } = await supabase
        .from('form_templates')
        .select('*')
        .or(`is_system.eq.true,psychologist_id.eq.${psychologistId}`)
        .eq('is_archived', false)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as FormTemplate[], error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // Template completo com seções, perguntas e opções
  async getTemplateWithDetails(
    templateId: string,
  ): Promise<ServiceResult<FormTemplateWithDetails>> {
    try {
      const { data: template, error: te } = await supabase
        .from('form_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (te) return { data: null, error: formatSupabaseError(te) }

      const { data: sections, error: se } = await supabase
        .from('form_sections')
        .select('*')
        .eq('template_id', templateId)
        .order('sort_order', { ascending: true })

      if (se) return { data: null, error: formatSupabaseError(se) }

      const { data: questions, error: qe } = await supabase
        .from('form_questions')
        .select('*')
        .eq('template_id', templateId)
        .order('sort_order', { ascending: true })

      if (qe) return { data: null, error: formatSupabaseError(qe) }

      const typedQuestions = (questions ?? []) as unknown as FormQuestion[]
      const questionIds = typedQuestions.map((q) => q.id)
      let options: FormQuestionOption[] = []

      if (questionIds.length > 0) {
        const { data: opts, error: oe } = await supabase
          .from('form_question_options')
          .select('*')
          .in('question_id', questionIds)
          .order('sort_order', { ascending: true })

        if (oe) return { data: null, error: formatSupabaseError(oe) }
        options = (opts ?? []) as unknown as FormQuestionOption[]
      }

      const typedSections = (sections ?? []) as unknown as FormSection[]

      const sectionsWithQuestions: FormSectionWithQuestions[] = typedSections.map(
        (s) => ({
          ...s,
          questions: typedQuestions
            .filter((q) => q.section_id === s.id)
            .map((q) => ({
              ...q,
              options: options.filter((o) => o.question_id === q.id),
            })) as FormQuestionWithOptions[],
        }),
      )

      // Perguntas sem seção
      const orphanQuestions = typedQuestions
        .filter((q) => !q.section_id)
        .map((q) => ({
          ...q,
          options: options.filter((o) => o.question_id === q.id),
        })) as FormQuestionWithOptions[]

      if (orphanQuestions.length > 0) {
        sectionsWithQuestions.push({
          id: '__orphan__',
          template_id: templateId,
          title: '',
          description: null,
          sort_order: 999,
          created_at: '',
          questions: orphanQuestions,
        })
      }

      return {
        data: {
          ...(template as FormTemplate),
          sections: sectionsWithQuestions,
        },
        error: null,
      }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // Criar template próprio
  async createTemplate(
    psychologistId: string,
    input: CreateFormTemplateInput,
  ): Promise<ServiceResult<FormTemplate>> {
    try {
      const { data, error } = await supabase
        .from('form_templates')
        .insert({
          psychologist_id: psychologistId,
          title: input.title,
          description: input.description ?? null,
          send_message: input.send_message ?? DEFAULT_SEND_MESSAGE,
          is_system: false,
          is_archived: false,
        } as never)
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as FormTemplate, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // Atualizar template próprio (jamais sistema)
  async updateTemplate(
    templateId: string,
    input: UpdateFormTemplateInput,
  ): Promise<ServiceResult<FormTemplate>> {
    try {
      // Garantia: não editar templates de sistema
      const { data: existing } = await supabase
        .from('form_templates')
        .select('is_system')
        .eq('id', templateId)
        .single()

      if ((existing as { is_system?: boolean } | null)?.is_system) {
        return { data: null, error: 'Templates do sistema não podem ser editados.' }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('form_templates')
        .update(input)
        .eq('id', templateId)
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as FormTemplate, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // Clonar template (sistema → psicólogo, ou psicólogo → psicólogo)
  async cloneTemplate(
    sourceTemplateId: string,
    psychologistId: string,
    newTitle?: string,
  ): Promise<ServiceResult<FormTemplate>> {
    try {
      const sourceResult = await formsService.getTemplateWithDetails(sourceTemplateId)
      if (sourceResult.error || !sourceResult.data) {
        return { data: null, error: sourceResult.error ?? 'Template não encontrado.' }
      }

      const source = sourceResult.data

      // Criar novo template
      const { data: newTemplate, error: te } = await supabase
        .from('form_templates')
        .insert({
          psychologist_id: psychologistId,
          title: newTitle ?? `${source.title} (cópia)`,
          description: source.description,
          send_message: source.send_message,
          is_system: false,
          is_archived: false,
          cloned_from_id: sourceTemplateId,
        } as never)
        .select()
        .single()

      if (te) return { data: null, error: formatSupabaseError(te) }
      const newTemplateId = (newTemplate as FormTemplate).id

      // Clonar seções e perguntas
      for (const section of source.sections) {
        if (section.id === '__orphan__') continue

        const { data: newSection, error: se } = await supabase
          .from('form_sections')
          .insert({
            template_id: newTemplateId,
            title: section.title,
            description: section.description,
            sort_order: section.sort_order,
          } as never)
          .select()
          .single()

        if (se) return { data: null, error: formatSupabaseError(se) }
        const newSectionId = (newSection as FormSection).id

        for (const question of section.questions) {
          const { data: newQuestion, error: qe } = await supabase
            .from('form_questions')
            .insert({
              template_id: newTemplateId,
              section_id: newSectionId,
              type: question.type,
              title: question.title,
              description: question.description,
              help_text: question.help_text,
              is_required: question.is_required,
              sort_order: question.sort_order,
              scale_min: question.scale_min,
              scale_max: question.scale_max,
              scale_step: question.scale_step,
            } as never)
            .select()
            .single()

          if (qe) return { data: null, error: formatSupabaseError(qe) }
          const newQuestionId = (newQuestion as FormQuestion).id

          if (question.options.length > 0) {
            const optInserts = question.options.map((o) => ({
              question_id: newQuestionId,
              label: o.label,
              sort_order: o.sort_order,
            }))

            const { error: oe } = await supabase
              .from('form_question_options')
              .insert(optInserts as never)

            if (oe) return { data: null, error: formatSupabaseError(oe) }
          }
        }
      }

      return { data: newTemplate as FormTemplate, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // Deletar template próprio
  async deleteTemplate(templateId: string): Promise<ServiceResult<void>> {
    try {
      const { data: existing } = await supabase
        .from('form_templates')
        .select('is_system')
        .eq('id', templateId)
        .single()

      if ((existing as { is_system?: boolean } | null)?.is_system) {
        return { data: null, error: 'Templates do sistema não podem ser excluídos.' }
      }

      const { error } = await supabase
        .from('form_templates')
        .delete()
        .eq('id', templateId)

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: undefined, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // ─── Seções ──────────────────────────────────────────────────────────────────

  async createSection(input: CreateSectionInput): Promise<ServiceResult<FormSection>> {
    try {
      const { data, error } = await supabase
        .from('form_sections')
        .insert(input as never)
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as FormSection, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async updateSection(
    sectionId: string,
    input: Partial<Pick<FormSection, 'title' | 'description' | 'sort_order'>>,
  ): Promise<ServiceResult<FormSection>> {
    try {
      const { data, error } = await supabase
        .from('form_sections')
        .update(input as never)
        .eq('id', sectionId)
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as FormSection, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async deleteSection(sectionId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('form_sections')
        .delete()
        .eq('id', sectionId)

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: undefined, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // ─── Perguntas ────────────────────────────────────────────────────────────────

  async createQuestion(
    input: CreateQuestionInput,
  ): Promise<ServiceResult<FormQuestionWithOptions>> {
    try {
      const { data, error } = await supabase
        .from('form_questions')
        .insert({
          template_id: input.template_id,
          section_id: input.section_id ?? null,
          type: input.type,
          title: input.title,
          description: input.description ?? null,
          help_text: input.help_text ?? null,
          is_required: input.is_required ?? false,
          sort_order: input.sort_order ?? 0,
          scale_min: input.scale_min ?? 1,
          scale_max: input.scale_max ?? 10,
          scale_step: input.scale_step ?? 1,
        } as never)
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: { ...(data as FormQuestion), options: [] }, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async updateQuestion(
    questionId: string,
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
    >,
  ): Promise<ServiceResult<FormQuestion>> {
    try {
      const { data, error } = await supabase
        .from('form_questions')
        .update(input as never)
        .eq('id', questionId)
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as FormQuestion, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async deleteQuestion(questionId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('form_questions')
        .delete()
        .eq('id', questionId)

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: undefined, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // ─── Opções ───────────────────────────────────────────────────────────────────

  async addOption(
    questionId: string,
    label: string,
    sortOrder: number,
  ): Promise<ServiceResult<FormQuestionOption>> {
    try {
      const { data, error } = await supabase
        .from('form_question_options')
        .insert({ question_id: questionId, label, sort_order: sortOrder } as never)
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as FormQuestionOption, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async updateOption(
    optionId: string,
    input: Partial<Pick<FormQuestionOption, 'label' | 'sort_order'>>,
  ): Promise<ServiceResult<FormQuestionOption>> {
    try {
      const { data, error } = await supabase
        .from('form_question_options')
        .update(input as never)
        .eq('id', optionId)
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as FormQuestionOption, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async deleteOption(optionId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('form_question_options')
        .delete()
        .eq('id', optionId)

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: undefined, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // Reordenar opções de uma vez
  async reorderOptions(
    updates: Array<{ id: string; sort_order: number }>,
  ): Promise<ServiceResult<void>> {
    try {
      for (const u of updates) {
        await supabase
          .from('form_question_options')
          .update({ sort_order: u.sort_order } as never)
          .eq('id', u.id)
      }
      return { data: undefined, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // ─── Submissions ──────────────────────────────────────────────────────────────

  async sendForm(
    psychologistId: string,
    input: SendFormInput,
  ): Promise<ServiceResult<FormSubmission>> {
    try {
      // Carregar template completo
      const templateResult = await formsService.getTemplateWithDetails(input.template_id)
      if (templateResult.error || !templateResult.data) {
        return { data: null, error: templateResult.error ?? 'Formulário não encontrado.' }
      }

      // Construir snapshot imutável
      const snapshot = buildSnapshot(
        templateResult.data,
        input.custom_message ?? null,
        input.expires_at ?? null,
        input.extra_sections,
      )

      const { data, error } = await supabase
        .from('form_submissions')
        .insert({
          psychologist_id: psychologistId,
          patient_id: input.patient_id,
          template_id: input.template_id,
          access_password: input.access_password,
          expires_at: input.expires_at ?? null,
          custom_message: input.custom_message ?? null,
          status: 'pending',
          snapshot,
        } as never)
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }

      // Auditoria
      await supabase.from('form_audit_logs').insert({
        submission_id: (data as FormSubmission).id,
        event: 'created',
        metadata: { template_id: input.template_id, patient_id: input.patient_id },
      } as never)

      return { data: data as FormSubmission, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // Listar envios de um paciente
  async listSubmissionsForPatient(
    patientId: string,
    psychologistId: string,
  ): Promise<ServiceResult<FormSubmission[]>> {
    try {
      // Expirar automaticamente antes de listar
      await supabase.rpc('expire_form_submissions' as never)

      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('psychologist_id', psychologistId)
        .order('created_at', { ascending: false })

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as FormSubmission[], error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // Detalhe de uma submission (com respostas e perfil do psicólogo)
  async getSubmissionWithResponses(
    submissionId: string,
  ): Promise<ServiceResult<FormSubmissionWithDetails>> {
    try {
      const { data: submission, error: se } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('id', submissionId)
        .single()

      if (se) return { data: null, error: formatSupabaseError(se) }

      const sub = submission as FormSubmission

      type PsychRow = { full_name: string; logo_url: string | null }

      const [responsesResult, psychResult] = await Promise.all([
        supabase
          .from('form_responses')
          .select('*')
          .eq('submission_id', submissionId),
        (supabase
          .from('profiles')
          .select('full_name, logo_url')
          .eq('id', sub.psychologist_id)
          .single() as unknown) as Promise<{ data: PsychRow | null; error: unknown }>,
      ])

      if (responsesResult.error) {
        return { data: null, error: formatSupabaseError(responsesResult.error) }
      }

      return {
        data: {
          ...sub,
          responses: (responsesResult.data ?? []) as FormResponse[],
          psychologist: psychResult.data
            ? {
                full_name: psychResult.data.full_name,
                logo_url: psychResult.data.logo_url,
              }
            : undefined,
        },
        error: null,
      }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // ─── Acesso público (paciente) ────────────────────────────────────────────────

  // Buscar submission por token (sem autenticação)
  async getSubmissionByToken(
    token: string,
  ): Promise<ServiceResult<FormSubmission | null>> {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('token', token)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return { data: null, error: null } // not found
        return { data: null, error: formatSupabaseError(error) }
      }
      return { data: data as FormSubmission, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // Validar acesso: token + senha + expiração + status
  async validateAccess(
    token: string,
    password: string,
  ): Promise<{
    valid: boolean
    reason?: 'not_found' | 'wrong_password' | 'expired' | 'completed'
    submission?: FormSubmission
  }> {
    const result = await formsService.getSubmissionByToken(token)

    if (!result.data) return { valid: false, reason: 'not_found' }

    const sub = result.data

    // Verificar expiração
    if (sub.expires_at && new Date(sub.expires_at) < new Date()) {
      if (sub.status !== 'expired') {
        await supabase
          .from('form_submissions')
          .update({ status: 'expired' } as never)
          .eq('id', sub.id)
      }
      return { valid: false, reason: 'expired' }
    }

    if (sub.status === 'completed') return { valid: false, reason: 'completed' }
    if (sub.status === 'expired') return { valid: false, reason: 'expired' }
    if (sub.access_password !== password) return { valid: false, reason: 'wrong_password' }

    // Registrar acesso
    const now = new Date().toISOString()
    const isFirstAccess = !sub.first_opened_at

    await supabase
      .from('form_submissions')
      .update({
        status: 'in_progress',
        first_opened_at: isFirstAccess ? now : sub.first_opened_at,
        last_opened_at: now,
      } as never)
      .eq('id', sub.id)

    await supabase.from('form_audit_logs').insert({
      submission_id: sub.id,
      event: isFirstAccess ? 'opened' : 'reopened',
    } as never)

    return { valid: true, submission: { ...sub, status: 'in_progress' } }
  },

  // Buscar respostas salvas para uma submission
  async getResponses(submissionId: string): Promise<ServiceResult<FormResponse[]>> {
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('submission_id', submissionId)

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as FormResponse[], error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // Salvar/atualizar resposta de uma pergunta (upsert)
  async saveResponse(input: SubmitResponseInput): Promise<ServiceResult<FormResponse>> {
    try {
      // Verificar que submission não está concluída
      const { data: sub } = await supabase
        .from('form_submissions')
        .select('status, completed_at')
        .eq('id', input.submission_id)
        .single()

      if ((sub as { status?: string } | null)?.status === 'completed') {
        return { data: null, error: 'Este formulário já foi concluído e não pode ser alterado.' }
      }

      const { data, error } = await supabase
        .from('form_responses')
        .upsert(
          {
            submission_id: input.submission_id,
            question_id: input.question_id,
            answer_text: input.answer_text ?? null,
            answer_options: input.answer_options ?? null,
            answer_number: input.answer_number ?? null,
            answer_date: input.answer_date ?? null,
            answer_boolean: input.answer_boolean ?? null,
          } as never,
          { onConflict: 'submission_id,question_id' },
        )
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as FormResponse, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // Concluir formulário (valida obrigatórios + bloqueia edição)
  async completeSubmission(
    submissionId: string,
    responses: FormResponse[],
  ): Promise<ServiceResult<FormSubmission>> {
    try {
      const { data: sub } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('id', submissionId)
        .single()

      if (!sub) return { data: null, error: 'Formulário não encontrado.' }
      if ((sub as FormSubmission).status === 'completed') {
        return { data: null, error: 'Formulário já concluído.' }
      }

      const snapshot = (sub as FormSubmission).snapshot
      const requiredQIds = snapshot.questions
        .filter((q) => q.is_required)
        .map((q) => q.id)

      // Considera respondida se houver qualquer valor não-nulo/vazio
      const hasAnswer = (r: FormResponse): boolean => {
        if (r.answer_text !== null && r.answer_text.trim() !== '') return true
        if (r.answer_options !== null && r.answer_options.length > 0) return true
        if (r.answer_number !== null) return true
        if (r.answer_date !== null) return true
        if (r.answer_boolean !== null) return true
        return false
      }

      const answeredIds = new Set(
        responses.filter(hasAnswer).map((r) => r.question_id),
      )
      const missingRequired = requiredQIds.filter((id) => !answeredIds.has(id))

      if (missingRequired.length > 0) {
        const missingTitles = snapshot.questions
          .filter((q) => missingRequired.includes(q.id))
          .map((q) => q.title)
        return {
          data: null,
          error: `Responda as perguntas obrigatórias: ${missingTitles.join(', ')}`,
        }
      }

      const { data, error } = await supabase
        .from('form_submissions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        } as never)
        .eq('id', submissionId)
        .select()
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }

      await supabase.from('form_audit_logs').insert({
        submission_id: submissionId,
        event: 'completed',
      } as never)

      return { data: data as FormSubmission, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // Buscar profile do psicólogo para a página pública
  async getPsychologistPublicProfile(
    psychologistId: string,
  ): Promise<ServiceResult<{ full_name: string; logo_url: string | null }>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, logo_url')
        .eq('id', psychologistId)
        .single()

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: data as { full_name: string; logo_url: string | null }, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // Atualizar logo do psicólogo (URL já conhecida)
  async updateLogo(
    psychologistId: string,
    logoUrl: string,
  ): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ logo_url: logoUrl } as never)
        .eq('id', psychologistId)

      if (error) return { data: null, error: formatSupabaseError(error) }
      return { data: undefined, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  // Upload de logo via Supabase Storage + atualiza profiles.logo_url
  async uploadLogo(
    psychologistId: string,
    fileUri: string,
    mimeType: string = 'image/jpeg',
  ): Promise<ServiceResult<string>> {
    try {
      // Converter URI para Blob/ArrayBuffer compatível com RN
      const response = await fetch(fileUri)
      const blob = await response.blob()

      const ext = mimeType === 'image/png' ? 'png' : 'jpg'
      const path = `logos/${psychologistId}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, blob, {
          contentType: mimeType,
          upsert: true,
        })

      if (uploadError) return { data: null, error: formatSupabaseError(uploadError) }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      const publicUrl = publicUrlData.publicUrl

      // Atualizar profile
      const updateResult = await formsService.updateLogo(psychologistId, publicUrl)
      if (updateResult.error) return { data: null, error: updateResult.error }

      return { data: publicUrl, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  async getTemplatePreview(templateId: string): Promise<ServiceResult<{
    template: { title: string; description: string | null }
    sections: Array<{ id: string; title: string; description: string | null; sort_order: number }>
    questions: Array<{
      id: string; section_id: string | null; type: string; title: string
      description: string | null; help_text: string | null; is_required: boolean
      sort_order: number; scale_min: number; scale_max: number; scale_step: number
    }>
    options: Array<{ id: string; question_id: string; label: string; value: string; sort_order: number }>
  }>> {
    try {
      const { data, error } = await supabase.rpc('get_form_template_preview', {
        p_template_id: templateId,
      })
      if (error) return { data: null, error: formatSupabaseError(error) }
      if (!data) return { data: null, error: 'Template não encontrado.' }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { data: data as any, error: null }
    } catch (err) {
      return { data: null, error: formatSupabaseError(err) }
    }
  },

  buildPublicUrl,
}
