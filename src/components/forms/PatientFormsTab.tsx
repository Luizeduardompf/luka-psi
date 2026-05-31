/**
 * Aba "Formulários" na ficha do paciente.
 * Lista todos os formulários enviados com status, datas e ações.
 */
import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  Clipboard,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/constants/theme'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SubmissionStatusBadge } from './SubmissionStatusBadge'
import { QuestionRenderer } from './QuestionRenderer'
import { useSubmissionsForPatient, useSubmissionDetail } from '@/hooks/useForms'
import { formsService } from '@/services/forms.service'
import { FormSubmission, SnapshotSection, SnapshotQuestion } from '@/types/forms.types'
import { formatDate } from '@/utils/format'

interface Props {
  patientId: string
  patientName: string
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function PatientFormsTab({ patientId, patientName }: Props) {
  const { data: submissions = [], isLoading } = useSubmissionsForPatient(patientId)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: selectedDetail } = useSubmissionDetail(selectedId)

  if (isLoading) {
    return (
      <View style={{ padding: 32, alignItems: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    )
  }

  const renderResponsesModal = () => {
    if (!selectedDetail) return null
    const snapshot = selectedDetail.snapshot
    const responses = selectedDetail.responses ?? []

    const getResponse = (questionId: string) =>
      responses.find((r) => r.question_id === questionId) ?? null

    return (
      <Modal
        visible={!!selectedId}
        animationType="slide"
        onRequestClose={() => setSelectedId(null)}
      >
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {/* Header */}
          <View
            style={{
              paddingTop: 56,
              paddingHorizontal: 20,
              paddingBottom: 14,
              backgroundColor: theme.colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={() => setSelectedId(null)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '700',
                    color: theme.colors.text.primary,
                  }}
                  numberOfLines={1}
                >
                  {snapshot.template_title}
                </Text>
                <SubmissionStatusBadge status={selectedDetail.status} size="sm" />
              </View>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Metadados */}
            <Card style={{ marginBottom: 20, gap: 8 }}>
              <MetaRow label="Enviado em" value={formatDateTime(selectedDetail.created_at)} />
              <MetaRow label="Primeiro acesso" value={formatDateTime(selectedDetail.first_opened_at)} />
              <MetaRow label="Último acesso" value={formatDateTime(selectedDetail.last_opened_at)} />
              <MetaRow label="Concluído em" value={formatDateTime(selectedDetail.completed_at)} />
              {selectedDetail.expires_at && (
                <MetaRow label="Prazo" value={formatDateTime(selectedDetail.expires_at)} />
              )}
            </Card>

            {/* Respostas */}
            {snapshot.sections.map((section: SnapshotSection) => {
              const sectionQuestions = snapshot.questions.filter(
                (q: SnapshotQuestion) =>
                  section.id === '__orphan__'
                    ? q.section_id === '__orphan__' || q.section_id === null
                    : q.section_id === section.id,
              )
              if (sectionQuestions.length === 0) return null

              return (
                <View key={section.id} style={{ marginBottom: 24 }}>
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
                        letterSpacing: 0.5,
                      }}
                    >
                      {section.title}
                    </Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
                  </View>

                  {sectionQuestions
                    .sort((a: SnapshotQuestion, b: SnapshotQuestion) => a.sort_order - b.sort_order)
                    .map((q: SnapshotQuestion) => (
                      <Card key={q.id} style={{ marginBottom: 12 }}>
                        <QuestionRenderer
                          question={q}
                          response={getResponse(q.id)}
                          onChange={() => {}}
                          isReadOnly
                        />
                      </Card>
                    ))}
                </View>
              )
            })}

            {responses.length === 0 && (
              <Text
                style={{
                  textAlign: 'center',
                  color: theme.colors.text.tertiary,
                  marginTop: 40,
                }}
              >
                Nenhuma resposta registrada ainda.
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Botão enviar */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <Button
          title="Enviar Formulário"
          leftIcon={<Ionicons name="send-outline" size={18} color="#FFF" />}
          onPress={() =>
            router.push({
              pathname: '/(app)/forms/send',
              params: { patientId },
            })
          }
          fullWidth
        />
      </View>

      {submissions.length === 0 ? (
        <View style={{ padding: 32, alignItems: 'center', gap: 8 }}>
          <Ionicons name="document-text-outline" size={40} color={theme.colors.text.tertiary} />
          <Text style={{ color: theme.colors.text.tertiary, textAlign: 'center' }}>
            Nenhum formulário enviado ainda.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {submissions.map((sub) => (
            <SubmissionCard
              key={sub.id}
              submission={sub}
              onViewResponses={() => setSelectedId(sub.id)}
            />
          ))}
        </ScrollView>
      )}

      {renderResponsesModal()}
    </View>
  )
}

function SubmissionCard({
  submission,
  onViewResponses,
}: {
  submission: FormSubmission
  onViewResponses: () => void
}) {
  const publicUrl = formsService.buildPublicUrl(submission.token)

  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: theme.colors.text.primary,
              marginBottom: 4,
            }}
          >
            {submission.snapshot.template_title}
          </Text>
          <SubmissionStatusBadge status={submission.status} />
        </View>
        <Ionicons name="document-text-outline" size={20} color={theme.colors.text.tertiary} />
      </View>

      <View style={{ gap: 4 }}>
        <MetaRow label="Enviado" value={formatDateTime(submission.created_at)} />
        <MetaRow label="Aberto" value={formatDateTime(submission.first_opened_at)} />
        <MetaRow label="Concluído" value={formatDateTime(submission.completed_at)} />
        {submission.expires_at && (
          <MetaRow label="Prazo" value={formatDateTime(submission.expires_at)} />
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        {submission.status === 'completed' ? (
          <Button
            title="Ver respostas"
            size="sm"
            leftIcon={<Ionicons name="eye-outline" size={14} color="#FFF" />}
            onPress={onViewResponses}
          />
        ) : (
          <Button
            title="Ver respostas"
            variant="outline"
            size="sm"
            leftIcon={<Ionicons name="eye-outline" size={14} color={theme.colors.primary} />}
            onPress={onViewResponses}
          />
        )}
        <Button
          title="Copiar link"
          variant="ghost"
          size="sm"
          leftIcon={<Ionicons name="copy-outline" size={14} color={theme.colors.primary} />}
          onPress={async () => {
            try {
              if (Platform.OS === 'web') {
                await navigator.clipboard.writeText(publicUrl)
              } else {
                Clipboard.setString(publicUrl)
              }
              Alert.alert('Copiado!', 'Link copiado para a área de transferência.')
            } catch {
              Alert.alert('Erro', 'Não foi possível copiar o link.')
            }
          }}
        />
      </View>
    </Card>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      <Text style={{ fontSize: 12, color: theme.colors.text.tertiary, width: 80 }}>{label}:</Text>
      <Text style={{ fontSize: 12, color: theme.colors.text.secondary, flex: 1 }}>{value}</Text>
    </View>
  )
}

