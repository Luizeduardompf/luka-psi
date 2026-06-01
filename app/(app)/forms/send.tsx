/**
 * Fluxo de envio de formulário para paciente — 7 etapas.
 * Parâmetros de rota: ?patientId=...
 */
import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Switch,
  Linking,
  Clipboard,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/constants/theme'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useFormTemplates, useSendForm } from '@/hooks/useForms'
import { usePatient } from '@/hooks/usePatients'
import { useSessionStore } from '@/stores/session.store'
import { useGenders, getPronounTreatment } from '@/hooks/useGenders'
import {
  FormTemplate,
  SendFormInput,
  DEFAULT_SEND_MESSAGE,
  SnapshotQuestion,
  QuestionType,
  QUESTION_TYPE_LABELS,
} from '@/types/forms.types'
import { formsService } from '@/services/forms.service'

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7

const STEP_TITLES: Record<Step, string> = {
  1: 'Escolher Formulário',
  2: 'Personalizar Envio',
  3: 'Definir Senha',
  4: 'Prazo de Preenchimento',
  5: 'Mensagem ao Paciente',
  6: 'Visualização Prévia',
  7: 'Enviar',
}

export default function SendFormScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>()
  const insets = useSafeAreaInsets()
  const { profile } = useSessionStore()

  const { data: patient } = usePatient(patientId ?? '')
  const { data: templates = [], isLoading: templatesLoading } = useFormTemplates()
  const { data: genders } = useGenders()
  const sendFormMutation = useSendForm()

  // Tratamento Dr./Dra. baseado no gênero do psicólogo
  const pronoun = getPronounTreatment(genders, profile?.gender_id)
  const psicologoDisplayName = `${pronoun} ${profile?.commercial_name ?? profile?.preferred_name ?? profile?.full_name ?? ''}`

  const [step, setStep] = useState<Step>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(true)
  const [hasExpiry, setHasExpiry] = useState(false)
  const [expiryDate, setExpiryDate] = useState('')
  const [customMessage, setCustomMessage] = useState(DEFAULT_SEND_MESSAGE)
  const [sentSubmission, setSentSubmission] = useState<{
    id: string
    token: string
  } | null>(null)
  const [extraSections, setExtraSections] = useState<
    Array<{
      title: string
      questions: Array<{ type: QuestionType; title: string; is_required: boolean }>
    }>
  >([])
  const [addExtraSectionTitle, setAddExtraSectionTitle] = useState('')
  const [addExtraQuestionTitle, setAddExtraQuestionTitle] = useState('')
  const [addExtraQuestionType, setAddExtraQuestionType] = useState<QuestionType>('short_text')
  const [editingExtraSection, setEditingExtraSection] = useState<number | null>(null)
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)
  const [expiryDateError, setExpiryDateError] = useState('')

  const validateExpiryDate = (d: string): string => {
    if (!d.trim()) return ''
    const parts = d.split('/')
    if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
      return 'Formato inválido. Use DD/MM/AAAA.'
    }
    const [dd, mm, yyyy] = parts.map(Number)
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return 'Data inválida.'
    const parsed = new Date(yyyy, mm - 1, dd)
    if (parsed.getMonth() !== mm - 1 || parsed.getDate() !== dd) return 'Data inválida.'
    if (parsed <= new Date()) return 'O prazo deve ser uma data futura.'
    return ''
  }

  const handleExpiryChange = (v: string) => {
    // Auto-mask: insert '/' at positions 2 and 5
    const digits = v.replace(/\D/g, '').slice(0, 8)
    let masked = digits
    if (digits.length > 2) masked = digits.slice(0, 2) + '/' + digits.slice(2)
    if (digits.length > 4) masked = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4)
    setExpiryDate(masked)
    if (masked.length === 10) setExpiryDateError(validateExpiryDate(masked))
    else setExpiryDateError('')
  }

  const canAdvance = (): boolean => {
    switch (step) {
      case 1: return !!selectedTemplate
      case 2: return true
      case 3: return password.trim().length >= 4
      case 4: return !hasExpiry || (expiryDate.length === 10 && !validateExpiryDate(expiryDate))
      case 5: return !!customMessage.trim()
      case 6: return true
      case 7: return true
    }
  }

  const handleSend = useCallback(async () => {
    if (!selectedTemplate || !patientId || !profile) return

    let expiresAt: string | null = null
    if (hasExpiry && expiryDate) {
      const [d, m, y] = expiryDate.split('/')
      if (d && m && y) {
        expiresAt = new Date(`${y}-${m}-${d}T23:59:59`).toISOString()
      }
    }

    // Token será gerado pelo banco; substituímos após receber o token real
    const dataLimiteStr = hasExpiry && expiryDate ? expiryDate : 'Sem prazo definido'
    const tokenPlaceholder = '[link gerado pelo sistema]'
    const interpolated = customMessage
      .replace(/<<nome_paciente>>/g, patient?.full_name ?? '')
      .replace(/<<nome_formulario>>/g, selectedTemplate.title)
      .replace(/<<senha>>/g, '')        // senha não armazenada na mensagem pública
      .replace(/<<link>>/g, tokenPlaceholder)
      .replace(/<<data_limite>>/g, dataLimiteStr)
      // Suporte a placeholders legados
      .replace(/<<nome_psicologo>>/g, psicologoDisplayName)
      .replace(/<<senha_acesso>>/g, '')  // senha não armazenada na mensagem pública
      .replace(/<<link_formulario>>/g, tokenPlaceholder)
      .trim()

    const input: SendFormInput = {
      patient_id: patientId,
      template_id: selectedTemplate.id,
      access_password: password,
      expires_at: expiresAt,
      custom_message: interpolated,
      extra_sections:
        extraSections.length > 0
          ? extraSections.map((s) => ({
              title: s.title,
              questions: s.questions.map((q) => ({
                type: q.type,
                title: q.title,
                is_required: q.is_required,
              })),
            }))
          : undefined,
    }

    try {
      const sub = await sendFormMutation.mutateAsync(input)
      setSentSubmission({ id: sub.id, token: sub.token })
      setStep(7)
    } catch (e: unknown) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Erro ao enviar formulário.')
    }
  }, [
    selectedTemplate,
    patientId,
    profile,
    patient,
    password,
    hasExpiry,
    expiryDate,
    customMessage,
    extraSections,
    sendFormMutation,
  ])

  const publicUrl = sentSubmission
    ? formsService.buildPublicUrl(sentSubmission.token)
    : ''

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={{ gap: 10 }}>
            {templatesLoading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              templates
                .filter((t) => !t.is_archived)
                .map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setSelectedTemplate(t)}
                    style={{
                      padding: 16,
                      borderRadius: theme.radius.md,
                      borderWidth: 2,
                      borderColor:
                        selectedTemplate?.id === t.id
                          ? theme.colors.primary
                          : theme.colors.border,
                      backgroundColor:
                        selectedTemplate?.id === t.id
                          ? theme.colors.primaryLight
                          : theme.colors.surface,
                      gap: 4,
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '600',
                          color:
                            selectedTemplate?.id === t.id
                              ? theme.colors.primary
                              : theme.colors.text.primary,
                          flex: 1,
                        }}
                      >
                        {t.title}
                      </Text>
                      {t.is_system && (
                        <Text
                          style={{
                            fontSize: 10,
                            color: theme.colors.text.tertiary,
                            fontWeight: '600',
                          }}
                        >
                          SISTEMA
                        </Text>
                      )}
                      {selectedTemplate?.id === t.id && (
                        <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                      )}
                    </View>
                    {t.description && (
                      <Text
                        style={{ fontSize: 13, color: theme.colors.text.secondary }}
                        numberOfLines={2}
                      >
                        {t.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
            )}
          </View>
        )

      case 2:
        return (
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: 14, color: theme.colors.text.secondary, lineHeight: 20 }}>
              Adicione seções ou perguntas extras apenas para este envio.{'\n'}
              O formulário original não será alterado.
            </Text>

            {extraSections.map((section, idx) => (
              <Card key={idx} style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={{
                      flex: 1,
                      fontWeight: '700',
                      color: theme.colors.text.primary,
                    }}
                  >
                    {section.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setExtraSections((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
                {section.questions.map((q, qi) => (
                  <Text key={qi} style={{ fontSize: 13, color: theme.colors.text.secondary }}>
                    • {q.title} ({QUESTION_TYPE_LABELS[q.type]})
                  </Text>
                ))}
                <Button
                  title="Adicionar pergunta nesta seção"
                  variant="ghost"
                  size="sm"
                  onPress={() => setEditingExtraSection(idx)}
                />
              </Card>
            ))}

            <Card>
              <Text style={sectionLabel}>Nova seção extra</Text>
              <TextInput
                value={addExtraSectionTitle}
                onChangeText={setAddExtraSectionTitle}
                style={inputStyle}
                placeholder="Título da seção"
                placeholderTextColor={theme.colors.text.tertiary}
              />
              <Button
                title="Adicionar seção"
                variant="outline"
                size="sm"
                disabled={!addExtraSectionTitle.trim()}
                onPress={() => {
                  if (!addExtraSectionTitle.trim()) return
                  setExtraSections((prev) => [
                    ...prev,
                    { title: addExtraSectionTitle.trim(), questions: [] },
                  ])
                  setAddExtraSectionTitle('')
                }}
                style={{ marginTop: 8 }}
              />
            </Card>

            {/* Modal adicionar pergunta extra */}
            <Modal
              visible={editingExtraSection !== null}
              transparent
              animationType="slide"
              onRequestClose={() => setEditingExtraSection(null)}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    padding: 24,
                    paddingBottom: insets.bottom + 24,
                    gap: 12,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text.primary }}>
                    Nova pergunta extra
                  </Text>
                  <TextInput
                    value={addExtraQuestionTitle}
                    onChangeText={setAddExtraQuestionTitle}
                    style={inputStyle}
                    placeholder="Título da pergunta"
                    placeholderTextColor={theme.colors.text.tertiary}
                  />
                  <View>
                    <Text style={sectionLabel}>Tipo de campo</Text>
                    <TouchableOpacity
                      onPress={() => setTypeDropdownOpen((v) => !v)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        borderColor: typeDropdownOpen ? theme.colors.primary : '#E5E7EB',
                        borderRadius: 10,
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        backgroundColor: '#F9FAFB',
                      }}
                    >
                      <Text style={{ fontSize: 15, color: '#111827', fontWeight: '500' }}>
                        {QUESTION_TYPE_LABELS[addExtraQuestionType]}
                      </Text>
                      <Ionicons
                        name={typeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={theme.colors.text.secondary}
                      />
                    </TouchableOpacity>
                    {typeDropdownOpen && (
                      <View style={{
                        borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
                        backgroundColor: theme.colors.surface, marginTop: 4, overflow: 'hidden',
                      }}>
                        {(['short_text', 'long_text', 'single_choice', 'multi_choice', 'dropdown', 'boolean', 'scale', 'date', 'number'] as QuestionType[]).map(
                          (t, idx, arr) => (
                            <TouchableOpacity
                              key={t}
                              onPress={() => { setAddExtraQuestionType(t); setTypeDropdownOpen(false) }}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingVertical: 12,
                                paddingHorizontal: 14,
                                backgroundColor: addExtraQuestionType === t ? theme.colors.primaryLight : 'transparent',
                                borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                                borderBottomColor: '#F3F4F6',
                              }}
                            >
                              <Text style={{ fontSize: 14, color: addExtraQuestionType === t ? theme.colors.primary : theme.colors.text.primary, fontWeight: addExtraQuestionType === t ? '600' : '400' }}>
                                {QUESTION_TYPE_LABELS[t]}
                              </Text>
                              {addExtraQuestionType === t && (
                                <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                              )}
                            </TouchableOpacity>
                          ),
                        )}
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Button
                      title="Cancelar"
                      variant="outline"
                      style={{ flex: 1 }}
                      onPress={() => setEditingExtraSection(null)}
                    />
                    <Button
                      title="Adicionar"
                      style={{ flex: 1 }}
                      disabled={!addExtraQuestionTitle.trim()}
                      onPress={() => {
                        if (editingExtraSection === null || !addExtraQuestionTitle.trim()) return
                        setExtraSections((prev) =>
                          prev.map((s, i) =>
                            i === editingExtraSection
                              ? {
                                  ...s,
                                  questions: [
                                    ...s.questions,
                                    {
                                      type: addExtraQuestionType,
                                      title: addExtraQuestionTitle.trim(),
                                      is_required: false,
                                    },
                                  ],
                                }
                              : s,
                          ),
                        )
                        setAddExtraQuestionTitle('')
                        setEditingExtraSection(null)
                      }}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        )

      case 3:
        return (
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: 14, color: theme.colors.text.secondary, lineHeight: 20 }}>
              O paciente precisará informar esta senha para acessar o formulário.
            </Text>
            <View>
              <Text style={sectionLabel}>Senha de acesso *</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={inputStyle}
                placeholder="Defina uma senha"
                placeholderTextColor={theme.colors.text.tertiary}
                secureTextEntry={false}
                autoCapitalize="none"
              />
              <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: 4 }}>
                Compartilhe esta senha com o paciente junto ao link.
              </Text>
            </View>
          </View>
        )

      case 4:
        return (
          <View style={{ gap: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontSize: 15, color: theme.colors.text.primary }}>
                Definir prazo de preenchimento
              </Text>
              <Switch
                value={hasExpiry}
                onValueChange={setHasExpiry}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#FFF"
              />
            </View>
            {hasExpiry && (
              <View>
                <Text style={sectionLabel}>Data limite (DD/MM/AAAA)</Text>
                <TextInput
                  value={expiryDate}
                  onChangeText={handleExpiryChange}
                  style={[inputStyle, expiryDateError ? { borderColor: theme.colors.error } : {}]}
                  placeholder="Ex: 15/06/2026"
                  placeholderTextColor={theme.colors.text.tertiary}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                {expiryDateError ? (
                  <Text style={{ fontSize: 12, color: theme.colors.error, marginTop: 4 }}>
                    {expiryDateError}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, marginTop: 4 }}>
                    Após esta data, o formulário será bloqueado automaticamente.
                  </Text>
                )}
              </View>
            )}
          </View>
        )

      case 5:
        return (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 14, color: theme.colors.text.secondary, lineHeight: 20 }}>
              Esta mensagem será enviada ao paciente junto com o link.
              {'\n'}Use os placeholders abaixo — eles serão substituídos automaticamente.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {['<<nome_paciente>>', '<<nome_formulario>>', '<<nome_psicologo>>', '<<senha>>', '<<link>>', '<<data_limite>>'].map(
                (p) => (
                  <View
                    key={p}
                    style={{
                      backgroundColor: theme.colors.primaryLight,
                      borderRadius: 99,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: theme.colors.primary, fontFamily: 'monospace' }}>
                      {p}
                    </Text>
                  </View>
                ),
              )}
            </View>
            <TextInput
              value={customMessage}
              onChangeText={setCustomMessage}
              style={[inputStyle, { minHeight: 200, textAlignVertical: 'top' }]}
              multiline
              numberOfLines={10}
              placeholderTextColor={theme.colors.text.tertiary}
            />
            <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, lineHeight: 18 }}>
              💡 O link real e os dados completos serão gerados após confirmar o envio (etapa 6). Na etapa final você poderá copiar e enviar a mensagem completa.
            </Text>
          </View>
        )

      case 6:
        return (
          <View style={{ gap: 16 }}>
            <Card>
              <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginBottom: 4 }}>
                Formulário
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
                {selectedTemplate?.title}
              </Text>
              {selectedTemplate?.description && (
                <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginTop: 4 }}>
                  {selectedTemplate.description}
                </Text>
              )}
            </Card>

            <Card>
              <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginBottom: 4 }}>
                Paciente
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
                {patient?.full_name}
              </Text>
              {patient?.email && (
                <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginTop: 2 }}>
                  {patient.email}
                </Text>
              )}
            </Card>

            <Card>
              <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginBottom: 4 }}>
                Senha de acesso
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: theme.colors.primary,
                  letterSpacing: 2,
                }}
              >
                {password}
              </Text>
            </Card>

            {hasExpiry && expiryDate && (
              <Card>
                <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginBottom: 4 }}>
                  Prazo
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text.primary }}>
                  {expiryDate}
                </Text>
              </Card>
            )}

            {extraSections.length > 0 && (
              <Card>
                <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginBottom: 4 }}>
                  Personalizações extras
                </Text>
                {extraSections.map((s, i) => (
                  <Text key={i} style={{ fontSize: 14, color: theme.colors.text.primary }}>
                    • {s.title} ({s.questions.length} pergunta(s))
                  </Text>
                ))}
              </Card>
            )}

            <Card>
              <Text style={{ fontSize: 13, color: theme.colors.text.secondary, marginBottom: 8 }}>
                Mensagem ao paciente
              </Text>
              <Text style={{ fontSize: 14, color: theme.colors.text.primary, lineHeight: 20 }}>
                {customMessage
                  .replace(/<<nome_paciente>>/g, patient?.full_name ?? '{paciente}')
                  .replace(/<<nome_formulario>>/g, selectedTemplate?.title ?? '{formulário}')
                  .replace(/<<nome_psicologo>>/g, psicologoDisplayName)
                  .replace(/<<senha>>/g, password || '{senha}')
                  .replace(/<<link>>/g, '[link gerado após confirmar envio]')
                  .replace(/<<data_limite>>/g, hasExpiry && expiryDate ? expiryDate : 'Sem prazo definido')
                  .replace(/<<senha_acesso>>/g, password || '{senha}')
                  .replace(/<<link_formulario>>/g, '[link gerado após confirmar envio]')}
              </Text>
            </Card>
          </View>
        )

      case 7: {
        // Mensagem compilada com URL real
        const compiledMsg = customMessage
          .replace(/<<nome_paciente>>/g, patient?.full_name ?? '')
          .replace(/<<nome_formulario>>/g, selectedTemplate?.title ?? '')
          .replace(/<<nome_psicologo>>/g, psicologoDisplayName)
          .replace(/<<senha>>/g, password)
          .replace(/<<link>>/g, publicUrl)
          .replace(/<<data_limite>>/g, hasExpiry && expiryDate ? expiryDate : 'Sem prazo definido')
          .replace(/<<senha_acesso>>/g, password)
          .replace(/<<link_formulario>>/g, publicUrl)

        return (
          <View style={{ gap: 20, alignItems: 'center', paddingTop: 8 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: '#D1FAE5',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="checkmark-circle" size={40} color="#10B981" />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: theme.colors.text.primary,
                textAlign: 'center',
              }}
            >
              Formulário enviado!
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              Compartilhe o link e a senha com {patient?.full_name ?? 'o paciente'}.
            </Text>

            <Card style={{ width: '100%', gap: 12 }}>
              <Text style={sectionLabel}>Link público</Text>
              <View
                style={{
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderRadius: theme.radius.md,
                  padding: 12,
                }}
              >
                <Text
                  style={{ fontSize: 13, color: theme.colors.primary, fontFamily: 'monospace' }}
                  selectable
                >
                  {publicUrl}
                </Text>
              </View>
              <Button
                title="Copiar link"
                variant="outline"
                leftIcon={<Ionicons name="copy-outline" size={16} color={theme.colors.primary} />}
                onPress={() => {
                  Clipboard.setString(publicUrl)
                  Alert.alert('Copiado!', 'Link copiado para a área de transferência.')
                }}
                fullWidth
              />
            </Card>

            <Card style={{ width: '100%' }}>
              <Text style={sectionLabel}>Senha de acesso</Text>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '700',
                  color: theme.colors.primary,
                  letterSpacing: 3,
                  textAlign: 'center',
                  marginVertical: 8,
                }}
              >
                {password}
              </Text>
            </Card>

            {/* Canais de envio com mensagem compilada + URL real */}
            <Card style={{ width: '100%', gap: 8 }}>
              <Text style={sectionLabel}>Enviar mensagem ao paciente</Text>
              {patient?.phone ? (
                <>
                  <TouchableOpacity
                    style={channelButtonStyle}
                    onPress={() => {
                      const phone = patient.phone?.replace(/\D/g, '') ?? ''
                      void Linking.openURL(`whatsapp://send?phone=55${phone}&text=${encodeURIComponent(compiledMsg)}`)
                    }}
                  >
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>WhatsApp</Text>
                      <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>{patient.phone}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.text.tertiary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={channelButtonStyle}
                    onPress={() => {
                      const phone = patient.phone?.replace(/\D/g, '') ?? ''
                      void Linking.openURL(`sms:+55${phone}?body=${encodeURIComponent(compiledMsg)}`)
                    }}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color="#3B82F6" />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>SMS</Text>
                      <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>{patient.phone}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.text.tertiary} />
                  </TouchableOpacity>
                </>
              ) : null}
              {patient?.email ? (
                <TouchableOpacity
                  style={channelButtonStyle}
                  onPress={() => {
                    void Linking.openURL(
                      `mailto:${patient.email}?subject=${encodeURIComponent(`Formulário - ${selectedTemplate?.title ?? ''}`)}&body=${encodeURIComponent(compiledMsg)}`
                    )
                  }}
                >
                  <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>E-mail</Text>
                    <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>{patient.email}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                style={channelButtonStyle}
                onPress={() => {
                  Clipboard.setString(compiledMsg)
                  Alert.alert('Copiado!', 'Mensagem completa copiada para a área de transferência.')
                }}
              >
                <Ionicons name="copy-outline" size={20} color={theme.colors.text.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.text.primary }}>Copiar mensagem</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>Cole onde preferir</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.text.tertiary} />
              </TouchableOpacity>
            </Card>
          </View>
        )
      }
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 14,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => {
              if (step === 1 || step === 7) router.back()
              else setStep((s) => (s - 1) as Step)
            }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.text.primary }}>
              {STEP_TITLES[step]}
            </Text>
            {step < 7 && (
              <Text style={{ fontSize: 12, color: theme.colors.text.tertiary }}>
                Etapa {step} de 6 · {patient?.full_name}
              </Text>
            )}
          </View>
        </View>

        {/* Progress bar */}
        {step < 7 && (
          <View
            style={{
              height: 3,
              backgroundColor: theme.colors.border,
              borderRadius: 99,
              marginTop: 12,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${((step - 1) / 5) * 100}%`,
                backgroundColor: theme.colors.primary,
                borderRadius: 99,
              }}
            />
          </View>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {/* Footer */}
      {step !== 7 && (
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
          {step === 6 ? (
            <Button
              title="Confirmar e Enviar"
              onPress={handleSend}
              loading={sendFormMutation.isPending}
              disabled={!canAdvance()}
              fullWidth
              leftIcon={<Ionicons name="send-outline" size={18} color="#FFF" />}
            />
          ) : (
            <Button
              title="Próximo"
              onPress={() => setStep((s) => (s + 1) as Step)}
              disabled={!canAdvance()}
              fullWidth
              rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
            />
          )}
        </View>
      )}

      {/* Footer step 7 */}
      {step === 7 && (
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
            title="Concluir"
            onPress={() => router.back()}
            fullWidth
          />
        </View>
      )}
    </View>
  )
}

const sectionLabel = {
  fontSize: 12,
  fontWeight: '600' as const,
  color: '#6B7280',
  marginBottom: 6,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.4,
}

const inputStyle = {
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 10,
  paddingVertical: 12,
  paddingHorizontal: 14,
  fontSize: 15,
  color: '#111827',
  backgroundColor: '#F9FAFB',
}

const channelButtonStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 12,
  padding: 14,
  backgroundColor: '#F9FAFB',
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#E5E7EB',
}
