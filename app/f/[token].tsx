/**
 * Pagina publica de preenchimento de formulario pelo paciente.
 * Rota: /f/:token
 * Sem autenticacao. Controlada por senha + expiracao + status.
 *
 * Token especial: "preview-{templateId}" → modo leitura (preview para psicologo).
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/constants/theme'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { QuestionRenderer } from '@/components/forms/QuestionRenderer'
import { formsService } from '@/services/forms.service'
import {
  FormSubmission,
  FormResponse,
  SnapshotSection,
  SnapshotQuestion,
  FormQuestionOption,
} from '@/types/forms.types'

type PageState = 'loading' | 'auth' | 'filling' | 'preview' | 'completed' | 'expired' | 'not_found' | 'already_done'

// Snapshot sintético para o modo preview
interface PreviewSnapshot {
  template_title: string
  template_description: string | null
  sections: SnapshotSection[]
  questions: SnapshotQuestion[]
}

export default function PublicFormPage() {
  const { token: routerToken } = useLocalSearchParams<{ token: string }>()

  // Fallback: no Expo Router SPA export, useLocalSearchParams pode retornar undefined
  // no carregamento inicial via URL direta. Lemos window.location.pathname diretamente.
  const webFallbackToken = Platform.OS === 'web' && typeof window !== 'undefined'
    ? (() => {
        const parts = window.location.pathname.split('/')
        const last = parts[parts.length - 1]
        return last && last.length > 8 ? last : undefined
      })()
    : undefined
  const token = routerToken ?? webFallbackToken

  const insets = useSafeAreaInsets()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [submission, setSubmission] = useState<FormSubmission | null>(null)
  const [psychProfile, setPsychProfile] = useState<{
    full_name: string
    logo_url: string | null
  } | null>(null)
  const [previewSnap, setPreviewSnap] = useState<PreviewSnapshot | null>(null)

  // Auth
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Respostas locais (acumuladas enquanto preenche)
  const [responses, setResponses] = useState<Map<string, Partial<FormResponse>>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [requiredErrors, setRequiredErrors] = useState<Set<string>>(new Set())
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(new Map())

  // Auto-save: batch único após 5s de inatividade
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const dirtyRef = useRef<Set<string>>(new Set())       // questionIds com mudanças não salvas
  const responsesRef = useRef(responses)                 // ref sempre actualizada
  const submissionRef = useRef<typeof submission>(null)  // ref para submission
  const batchSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { responsesRef.current = responses }, [responses])
  useEffect(() => { submissionRef.current = submission }, [submission])

  // Flush imediato (para beforeunload — usa fetch sync ou beacon)
  const flushDirty = useCallback(async () => {
    const sub = submissionRef.current
    if (!sub?.id || dirtyRef.current.size === 0) return
    const toSave = Array.from(dirtyRef.current)
    dirtyRef.current.clear()
    await Promise.all(toSave.map((qId) => {
      const r = responsesRef.current.get(qId)
      if (!r) return Promise.resolve()
      return formsService.saveResponse({
        submission_id: sub.id,
        question_id: qId,
        answer_text: r.answer_text ?? null,
        answer_options: r.answer_options ?? null,
        answer_number: r.answer_number ?? null,
        answer_date: r.answer_date ?? null,
        answer_boolean: r.answer_boolean ?? null,
      })
    }))
  }, [])

  const scheduleBatchSave = useCallback(() => {
    if (batchSaveTimer.current) clearTimeout(batchSaveTimer.current)
    batchSaveTimer.current = setTimeout(async () => {
      setSaveStatus('saving')
      await flushDirty()
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 2000) // 2s de inatividade
  }, [flushDirty])

  // Salva ao fechar/recarregar a aba (web)
  useEffect(() => {
    if (Platform.OS !== 'web') return
    const handleUnload = () => {
      if (batchSaveTimer.current) clearTimeout(batchSaveTimer.current)
      void flushDirty()
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [flushDirty])

  useEffect(() => {
    if (!token) {
      setPageState('not_found')
      return
    }

    // Modo preview: token = "preview-{templateId}"
    if (token.startsWith('preview-')) {
      const templateId = token.slice('preview-'.length)
      void loadPreview(templateId)
      return
    }

    void loadSubmission()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function loadPreview(templateId: string) {
    setPageState('loading')
    const result = await formsService.getTemplatePreview(templateId)

    if (result.error || !result.data) {
      setPageState('not_found')
      return
    }

    const { template, sections, questions, options } = result.data as {
      template: { title: string; description: string | null }
      sections: Array<{ id: string; title: string; description: string | null; sort_order: number }>
      questions: Array<{
        id: string
        section_id: string | null
        type: string
        title: string
        description: string | null
        help_text: string | null
        is_required: boolean
        sort_order: number
        scale_min: number
        scale_max: number
        scale_step: number
      }>
      options: FormQuestionOption[]
    }

    // Mapear opções às perguntas
    const snapshotQuestions: SnapshotQuestion[] = questions.map((q) => ({
      ...q,
      type: q.type as SnapshotQuestion['type'],
      options: options.filter((o) => o.question_id === q.id).sort((a, b) => a.sort_order - b.sort_order),
    }))

    setPreviewSnap({
      template_title: template.title,
      template_description: template.description,
      sections: sections.sort((a, b) => a.sort_order - b.sort_order),
      questions: snapshotQuestions,
    })
    setPageState('preview')
  }

  async function loadSubmission() {
    setPageState('loading')
    const result = await formsService.getSubmissionByToken(token!)
    if (!result.data) {
      setPageState('not_found')
      return
    }
    const sub = result.data

    if (sub.status === 'completed') {
      setPageState('already_done')
      setSubmission(sub)
      return
    }

    if (
      sub.status === 'expired' ||
      (sub.expires_at && new Date(sub.expires_at) < new Date())
    ) {
      setPageState('expired')
      setSubmission(sub)
      return
    }

    setSubmission(sub)

    // Carregar profile do psicologo
    const profileResult = await formsService.getPsychologistPublicProfile(sub.psychologist_id)
    if (profileResult.data) {
      setPsychProfile(profileResult.data)
    }

    setPageState('auth')
  }

  async function handleAuth() {
    if (!token || !passwordInput.trim()) return
    setAuthLoading(true)
    setAuthError('')

    const result = await formsService.validateAccess(token, passwordInput.trim())

    if (!result.valid) {
      const msgs: Record<string, string> = {
        not_found: 'Formulario nao encontrado.',
        wrong_password: 'Senha incorreta. Verifique com o seu psicologo.',
        expired: 'O prazo para preenchimento expirou.',
        completed: 'Este formulario ja foi concluido.',
      }
      setAuthError(msgs[result.reason ?? ''] ?? 'Acesso negado.')
      setAuthLoading(false)
      return
    }

    // Carregar respostas ja salvas
    const savedResult = await formsService.getResponses(result.submission!.id)
    if (savedResult.data) {
      const map = new Map<string, Partial<FormResponse>>()
      for (const r of savedResult.data) {
        map.set(r.question_id, r)
      }
      setResponses(map)
    }

    setSubmission(result.submission!)
    setAuthLoading(false)
    setPageState('filling')
  }

  const handleResponseChange = useCallback(
    (questionId: string, partial: Partial<FormResponse>) => {
      setResponses((prev) => {
        const updated = new Map(prev)
        updated.set(questionId, { ...(prev.get(questionId) ?? {}), ...partial, question_id: questionId })
        return updated
      })
      // Marca como dirty e agenda batch save
      dirtyRef.current.add(questionId)
      scheduleBatchSave()
      // Limpa erros ao editar
      setFieldErrors((prev) => {
        if (!prev.has(questionId)) return prev
        const next = new Map(prev)
        next.delete(questionId)
        return next
      })
      setRequiredErrors((prev) => {
        if (!prev.has(questionId)) return prev
        const next = new Set(prev)
        next.delete(questionId)
        return next
      })
    },
    [scheduleBatchSave],
  )

  async function handleComplete() {
    if (!submission) return
    setSubmitError(null)
    setFieldErrors(new Map())
    setRequiredErrors(new Set())

    const snap = submission.snapshot
    const newFieldErrors = new Map<string, string>()
    const newMissing = new Set<string>()

    const hasAnswer = (r: Partial<FormResponse> | undefined): boolean => {
      if (!r) return false
      if (r.answer_text != null && r.answer_text.trim() !== '') return true
      if (r.answer_options != null && (r.answer_options as unknown[]).length > 0) return true
      if (r.answer_number != null) return true
      if (r.answer_date != null) return true
      if (r.answer_boolean != null) return true
      return false
    }

    // Validar cada pergunta
    for (const q of snap.questions) {
      const r = responses.get(q.id)

      // Validar formato de data
      if (q.type === 'date' && r?.answer_date) {
        // Se não está em ISO (YYYY-MM-DD), é inválido
        if (!/^\d{4}-\d{2}-\d{2}$/.test(r.answer_date)) {
          newFieldErrors.set(q.id, 'Data inválida. Use o formato DD/MM/AAAA.')
        }
      }

      // Obrigatório sem resposta
      if (q.is_required && !hasAnswer(r)) {
        newMissing.add(q.id)
      }
    }

    if (newFieldErrors.size > 0 || newMissing.size > 0) {
      setFieldErrors(newFieldErrors)
      setRequiredErrors(newMissing)

      const dateProblems = snap.questions
        .filter((q) => newFieldErrors.has(q.id))
        .map((q) => `"${q.title}": data inválida`)

      const missingProblems = snap.questions
        .filter((q) => newMissing.has(q.id))
        .map((q) => `"${q.title}" é obrigatório`)

      setSubmitError([...missingProblems, ...dateProblems].join('\n'))
      return
    }

    setIsSubmitting(true)

    // Cancelar batch save pendente — vamos salvar tudo agora
    if (batchSaveTimer.current) clearTimeout(batchSaveTimer.current)
    dirtyRef.current.clear()

    // Salvar todas as respostas de uma vez no submit
    const allResponses = Array.from(responses.entries()).map(([questionId, r]) => ({
      ...(r as FormResponse),
      question_id: questionId,
    }))

    for (const r of allResponses) {
      await formsService.saveResponse({
        submission_id: submission.id,
        question_id: r.question_id,
        answer_text: r.answer_text ?? null,
        answer_options: r.answer_options ?? null,
        answer_number: r.answer_number ?? null,
        answer_date: r.answer_date ?? null,
        answer_boolean: r.answer_boolean ?? null,
      })
    }

    const result = await formsService.completeSubmission(
      submission.id,
      allResponses as FormResponse[],
    )

    if (result.error) {
      setSubmitError('Ocorreu um erro ao enviar o formulário. Por favor tente novamente.')
      setIsSubmitting(false)
      return
    }

    setPageState('completed')
    setIsSubmitting(false)
  }

  // ─── Render states ───────────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <View style={centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  if (pageState === 'not_found') {
    return (
      <StateScreen
        icon="alert-circle-outline"
        iconColor={theme.colors.error}
        title="Formulario nao encontrado"
        message="O link que voce acessou e invalido ou nao existe."
      />
    )
  }

  if (pageState === 'expired') {
    return (
      <StateScreen
        icon="time-outline"
        iconColor={theme.colors.warning}
        title="Prazo expirado"
        message="O prazo para preenchimento deste formulario encerrou. Entre em contato com o seu psicologo."
        psychProfile={psychProfile}
      />
    )
  }

  if (pageState === 'already_done') {
    return (
      <StateScreen
        icon="checkmark-circle-outline"
        iconColor={theme.colors.success}
        title="Formulario ja concluido"
        message="Voce ja respondeu este formulario. Obrigado!"
        psychProfile={psychProfile}
      />
    )
  }

  if (pageState === 'completed') {
    return (
      <StateScreen
        icon="checkmark-circle"
        iconColor={theme.colors.success}
        title="Formulario enviado!"
        message="Suas respostas foram registradas com sucesso. Obrigado!"
        psychProfile={psychProfile}
      />
    )
  }

  // ─── Modo Preview ────────────────────────────────────────────────────────────

  if (pageState === 'preview' && previewSnap) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Banner de preview */}
        <View
          style={{
            backgroundColor: '#FEF3C7',
            paddingVertical: 10,
            paddingHorizontal: 16,
            paddingTop: insets.top + 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Ionicons name="eye-outline" size={16} color="#D97706" />
          <Text style={{ fontSize: 13, color: '#D97706', fontWeight: '600', flex: 1 }}>
            MODO PREVIEW — visualização do formulário como o paciente verá
          </Text>
          {router.canGoBack() && (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={20} color="#D97706" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: theme.colors.text.primary,
              marginBottom: 6,
            }}
          >
            {previewSnap.template_title}
          </Text>
          {previewSnap.template_description ? (
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.text.secondary,
                marginBottom: 20,
                lineHeight: 20,
              }}
            >
              {previewSnap.template_description}
            </Text>
          ) : (
            <View style={{ height: 20 }} />
          )}

          {/* Seções e perguntas */}
          {previewSnap.sections.map((section) => {
            const sectionQuestions = previewSnap.questions
              .filter((q) => q.section_id === section.id)
              .sort((a, b) => a.sort_order - b.sort_order)

            if (sectionQuestions.length === 0) return null

            return (
              <View key={section.id} style={{ marginBottom: 28 }}>
                {section.title ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: theme.colors.primary,
                        textTransform: 'uppercase',
                        letterSpacing: 0.6,
                      }}
                    >
                      {section.title}
                    </Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
                  </View>
                ) : null}
                {sectionQuestions.map((q) => (
                  <View
                    key={q.id}
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.radius.md,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      opacity: 0.85,
                    }}
                  >
                    <QuestionRenderer
                      question={q}
                      response={null}
                      onChange={() => {/* read-only no preview */}}
                    />
                  </View>
                ))}
              </View>
            )
          })}

          {/* Perguntas sem seção */}
          {previewSnap.questions
            .filter((q) => !q.section_id)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((q) => (
              <View
                key={q.id}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.md,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  opacity: 0.85,
                }}
              >
                <QuestionRenderer
                  question={q}
                  response={null}
                  onChange={() => {/* read-only */}}
                />
              </View>
            ))}

          {/* Botão fake desabilitado */}
          <View style={{ marginTop: 8, opacity: 0.4 }}>
            <Button
              title="Concluir e enviar (desabilitado no preview)"
              fullWidth
              disabled
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  // ─── Autenticação ────────────────────────────────────────────────────────────

  if (pageState === 'auth') {
    const snap = submission?.snapshot
    const expiresAt = snap?.expires_at

    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 24,
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            {psychProfile?.logo_url ? (
              <Image
                source={{ uri: psychProfile.logo_url }}
                style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 12 }}
                resizeMode="contain"
              />
            ) : (
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: theme.colors.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <Ionicons name="person" size={28} color={theme.colors.primary} />
              </View>
            )}
            {psychProfile?.full_name && (
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.text.secondary,
                  fontWeight: '500',
                  textAlign: 'center',
                }}
              >
                {psychProfile.full_name}
              </Text>
            )}
          </View>

          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: theme.colors.text.primary,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {snap?.template_title ?? 'Formulario'}
          </Text>

          {snap?.template_description && (
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginBottom: 16,
                lineHeight: 20,
              }}
            >
              {snap.template_description}
            </Text>
          )}

          {snap?.custom_message && (
            <Card style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, color: theme.colors.text.primary, lineHeight: 22 }}>
                {snap.custom_message}
              </Text>
            </Card>
          )}

          {expiresAt && (
            <View
              style={{
                backgroundColor: '#FEF3C7',
                borderRadius: theme.radius.md,
                padding: 12,
                marginBottom: 20,
                flexDirection: 'row',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <Ionicons name="time-outline" size={18} color="#D97706" />
              <Text style={{ fontSize: 13, color: '#D97706', flex: 1 }}>
                Por favor responda antes de{' '}
                {new Date(expiresAt).toLocaleDateString('pt-BR')}.
              </Text>
            </View>
          )}

          <View style={{ marginBottom: 16 }}>
            <Text style={fieldLabel}>Senha de acesso</Text>
            <TextInput
              value={passwordInput}
              onChangeText={setPasswordInput}
              placeholder="Digite a senha fornecida"
              placeholderTextColor={theme.colors.text.tertiary}
              secureTextEntry={false}
              autoCapitalize="none"
              style={{
                borderWidth: 1.5,
                borderColor: authError ? theme.colors.error : theme.colors.border,
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
                fontSize: 16,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.surface,
                letterSpacing: 1,
              }}
              onSubmitEditing={handleAuth}
              returnKeyType="done"
            />
            {authError ? (
              <Text style={{ fontSize: 13, color: theme.colors.error, marginTop: 6 }}>
                {authError}
              </Text>
            ) : null}
          </View>

          <Button
            title="Acessar formulario"
            onPress={handleAuth}
            loading={authLoading}
            disabled={!passwordInput.trim()}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  // ─── Preenchimento ───────────────────────────────────────────────────────────

  if (pageState === 'filling' && submission) {
    const snap = submission.snapshot

    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 14,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            alignItems: 'center',
            gap: 8,
          }}
        >
          {psychProfile?.logo_url ? (
            <Image
              source={{ uri: psychProfile.logo_url }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              resizeMode="contain"
            />
          ) : null}
          {psychProfile?.full_name ? (
            <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>
              {psychProfile.full_name}
            </Text>
          ) : null}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: theme.colors.text.primary,
              textAlign: 'center',
            }}
          >
            {snap.template_title}
          </Text>
          {snap.expires_at && (
            <Text style={{ fontSize: 11, color: theme.colors.warning }}>
              Prazo: {new Date(snap.expires_at).toLocaleDateString('pt-BR')}
            </Text>
          )}
          {saveStatus === 'saving' && (
            <Text style={{ fontSize: 11, color: theme.colors.text.tertiary }}>
              A guardar...
            </Text>
          )}
          {saveStatus === 'saved' && (
            <Text style={{ fontSize: 11, color: theme.colors.success }}>
              ✓ Guardado
            </Text>
          )}
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
        >
          {snap.custom_message ? (
            <Card style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, color: theme.colors.text.primary, lineHeight: 22 }}>
                {snap.custom_message}
              </Text>
            </Card>
          ) : null}

          {snap.sections
            .sort((a: SnapshotSection, b: SnapshotSection) => a.sort_order - b.sort_order)
            .map((section: SnapshotSection) => {
              const sectionQuestions = snap.questions
                .filter((q: SnapshotQuestion) => q.section_id === section.id)
                .sort((a: SnapshotQuestion, b: SnapshotQuestion) => a.sort_order - b.sort_order)

              if (sectionQuestions.length === 0) return null

              return (
                <View key={section.id} style={{ marginBottom: 28 }}>
                  {section.title && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 16,
                      }}
                    >
                      <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '700',
                          color: theme.colors.primary,
                          textTransform: 'uppercase',
                          letterSpacing: 0.6,
                        }}
                      >
                        {section.title}
                      </Text>
                      <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
                    </View>
                  )}
                  {sectionQuestions.map((q: SnapshotQuestion) => {
                    const isRequired = requiredErrors.has(q.id)
                    const fieldErr = fieldErrors.get(q.id) ?? null
                    const hasError = isRequired || !!fieldErr
                    return (
                      <View
                        key={q.id}
                        style={{
                          backgroundColor: theme.colors.surface,
                          borderRadius: theme.radius.md,
                          padding: 16,
                          marginBottom: 12,
                          borderWidth: hasError ? 2 : 1,
                          borderColor: hasError ? theme.colors.error : theme.colors.border,
                        }}
                      >
                        {isRequired && (
                          <Text style={{ fontSize: 11, color: theme.colors.error, marginBottom: 4, fontWeight: '600' }}>
                            ⚠ Campo obrigatório
                          </Text>
                        )}
                        <QuestionRenderer
                          question={q}
                          response={(responses.get(q.id) as FormResponse) ?? null}
                          onChange={(partial) => handleResponseChange(q.id, partial)}
                          error={fieldErr}
                          profileFieldOptions={snap.profile_field_options ?? {}}
                        />
                      </View>
                    )
                  })}
                </View>
              )
            })}
        </ScrollView>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            padding: 16,
            paddingBottom: insets.bottom + 16,
            gap: 8,
          }}
        >
          {submitError ? (
            <View style={{
              backgroundColor: '#FEF2F2', borderRadius: 8, padding: 12,
              borderWidth: 1, borderColor: '#FECACA', gap: 4,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#DC2626', marginBottom: 4 }}>
                ⚠ Corrija os erros antes de enviar:
              </Text>
              {submitError.split('\n').map((line, i) => (
                <Text key={i} style={{ fontSize: 13, color: '#DC2626', lineHeight: 18 }}>
                  · {line}
                </Text>
              ))}
            </View>
          ) : null}
          <Button
            title="Concluir e enviar"
            onPress={handleComplete}
            loading={isSubmitting}
            fullWidth
            leftIcon={<Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />}
          />
        </View>
      </KeyboardAvoidingView>
    )
  }

  return null
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function StateScreen({
  icon,
  iconColor,
  title,
  message,
  psychProfile,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  iconColor: string
  title: string
  message: string
  psychProfile?: { full_name: string; logo_url: string | null } | null
}) {
  const insets = useSafeAreaInsets()
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        paddingTop: insets.top + 32,
        paddingBottom: insets.bottom + 32,
      }}
    >
      {psychProfile?.logo_url && (
        <Image
          source={{ uri: psychProfile.logo_url }}
          style={{ width: 64, height: 64, borderRadius: 32, marginBottom: 20 }}
          resizeMode="contain"
        />
      )}
      <Ionicons name={icon} size={64} color={iconColor} style={{ marginBottom: 20 }} />
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: theme.colors.text.primary,
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          lineHeight: 22,
        }}
      >
        {message}
      </Text>
      {psychProfile?.full_name && (
        <Text
          style={{
            marginTop: 24,
            fontSize: 13,
            color: theme.colors.text.tertiary,
            textAlign: 'center',
          }}
        >
          {psychProfile.full_name}
        </Text>
      )}
    </View>
  )
}

const centeredContainer = {
  flex: 1,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  backgroundColor: '#F8F7FF',
}

const fieldLabel = {
  fontSize: 12,
  fontWeight: '600' as const,
  color: '#6B7280',
  marginBottom: 8,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.4,
}
