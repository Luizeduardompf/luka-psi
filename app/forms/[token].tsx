/**
 * Página pública de preenchimento de formulário pelo paciente.
 * Rota: /forms/:token
 * Sem autenticação. Controlada por senha + expiração + status.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
} from '@/types/forms.types'

type PageState = 'loading' | 'auth' | 'filling' | 'completed' | 'expired' | 'not_found' | 'already_done'

export default function PublicFormPage() {
  const { token } = useLocalSearchParams<{ token: string }>()
  const insets = useSafeAreaInsets()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [submission, setSubmission] = useState<FormSubmission | null>(null)
  const [psychProfile, setPsychProfile] = useState<{
    full_name: string
    logo_url: string | null
  } | null>(null)

  // Auth
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Respostas locais (acumuladas enquanto preenche)
  const [responses, setResponses] = useState<Map<string, Partial<FormResponse>>>(new Map())
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-save debounce
  const saveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    if (!token) {
      setPageState('not_found')
      return
    }
    void loadSubmission()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

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

    // Carregar profile do psicólogo
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
        not_found: 'Formulário não encontrado.',
        wrong_password: 'Senha incorreta. Verifique com o seu psicólogo.',
        expired: 'O prazo para preenchimento expirou.',
        completed: 'Este formulário já foi concluído.',
      }
      setAuthError(msgs[result.reason ?? ''] ?? 'Acesso negado.')
      setAuthLoading(false)
      return
    }

    // Carregar respostas já salvas
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

      // Auto-save com debounce 1.5s
      if (saveTimers.current.has(questionId)) {
        clearTimeout(saveTimers.current.get(questionId)!)
      }
      const timer = setTimeout(async () => {
        if (!submission?.id) return
        const resp = { ...(responses.get(questionId) ?? {}), ...partial, question_id: questionId }
        await formsService.saveResponse({
          submission_id: submission.id,
          question_id: questionId,
          answer_text: resp.answer_text ?? null,
          answer_options: resp.answer_options ?? null,
          answer_number: resp.answer_number ?? null,
          answer_date: resp.answer_date ?? null,
          answer_boolean: resp.answer_boolean ?? null,
        })
      }, 1500)
      saveTimers.current.set(questionId, timer)
    },
    [submission?.id, responses],
  )

  async function handleComplete() {
    if (!submission) return
    setIsSubmitting(true)

    // Salvar todas as respostas pendentes
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
      Alert.alert('Atenção', result.error)
      setIsSubmitting(false)
      return
    }

    setPageState('completed')
    setIsSubmitting(false)
  }

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (pageState === 'loading') {
    return (
      <View style={centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  // ─── Not found ──────────────────────────────────────────────────────────────
  if (pageState === 'not_found') {
    return (
      <StateScreen
        icon="alert-circle-outline"
        iconColor={theme.colors.error}
        title="Formulário não encontrado"
        message="O link que você acessou é inválido ou não existe."
      />
    )
  }

  // ─── Expirado ───────────────────────────────────────────────────────────────
  if (pageState === 'expired') {
    return (
      <StateScreen
        icon="time-outline"
        iconColor={theme.colors.warning}
        title="Prazo expirado"
        message="O prazo para preenchimento deste formulário encerrou. Entre em contato com o seu psicólogo."
        psychProfile={psychProfile}
      />
    )
  }

  // ─── Já concluído ───────────────────────────────────────────────────────────
  if (pageState === 'already_done') {
    return (
      <StateScreen
        icon="checkmark-circle-outline"
        iconColor={theme.colors.success}
        title="Formulário já concluído"
        message="Você já respondeu este formulário. Obrigado!"
        psychProfile={psychProfile}
      />
    )
  }

  // ─── Concluído agora ─────────────────────────────────────────────────────────
  if (pageState === 'completed') {
    return (
      <StateScreen
        icon="checkmark-circle"
        iconColor={theme.colors.success}
        title="Formulário enviado!"
        message="Suas respostas foram registradas com sucesso. Obrigado!"
        psychProfile={psychProfile}
      />
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
          {/* Logo / psicólogo */}
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
            {snap?.template_title ?? 'Formulário'}
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

          {/* Campo senha */}
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
            title="Acessar formulário"
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
        {/* Header */}
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
          {isSaving && (
            <Text style={{ fontSize: 11, color: theme.colors.text.tertiary }}>
              Salvando...
            </Text>
          )}
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Mensagem do psicólogo */}
          {snap.custom_message ? (
            <Card style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, color: theme.colors.text.primary, lineHeight: 22 }}>
                {snap.custom_message}
              </Text>
            </Card>
          ) : null}

          {/* Seções e perguntas */}
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
                  {sectionQuestions.map((q: SnapshotQuestion) => (
                    <View
                      key={q.id}
                      style={{
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.radius.md,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <QuestionRenderer
                        question={q}
                        response={(responses.get(q.id) as FormResponse) ?? null}
                        onChange={(partial) => handleResponseChange(q.id, partial)}
                      />
                    </View>
                  ))}
                </View>
              )
            })}
        </ScrollView>

        {/* Footer: botão concluir */}
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
          }}
        >
          <Button
            title="Concluir e enviar"
            onPress={() => {
              Alert.alert(
                'Concluir formulário',
                'Após enviar, suas respostas não poderão ser alteradas. Deseja continuar?',
                [
                  { text: 'Revisar', style: 'cancel' },
                  { text: 'Enviar', onPress: handleComplete },
                ],
              )
            }}
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
