/**
 * Testes de tipos e constantes do módulo de formulários.
 */

import {
  QUESTION_TYPE_LABELS,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_COLORS,
  QuestionType,
  SubmissionStatus,
  DEFAULT_SEND_MESSAGE,
} from '@/types/forms.types'

describe('QUESTION_TYPE_LABELS', () => {
  const expectedTypes: QuestionType[] = [
    'short_text',
    'long_text',
    'single_choice',
    'multi_choice',
    'dropdown',
    'date',
    'number',
    'scale',
    'boolean',
  ]

  it('tem label para todos os tipos', () => {
    for (const type of expectedTypes) {
      expect(QUESTION_TYPE_LABELS[type]).toBeTruthy()
      expect(typeof QUESTION_TYPE_LABELS[type]).toBe('string')
    }
  })

  it('labels são em português', () => {
    expect(QUESTION_TYPE_LABELS.short_text).toContain('curta')
    expect(QUESTION_TYPE_LABELS.long_text).toContain('longa')
    expect(QUESTION_TYPE_LABELS.boolean).toContain('Sim')
  })
})

describe('SUBMISSION_STATUS_LABELS', () => {
  const statuses: SubmissionStatus[] = ['pending', 'in_progress', 'completed', 'expired']

  it('tem label para todos os status', () => {
    for (const status of statuses) {
      expect(SUBMISSION_STATUS_LABELS[status]).toBeTruthy()
    }
  })

  it('labels são descritivos', () => {
    expect(SUBMISSION_STATUS_LABELS.pending).toBe('Não aberto')
    expect(SUBMISSION_STATUS_LABELS.completed).toBe('Concluído')
    expect(SUBMISSION_STATUS_LABELS.expired).toBe('Expirado')
  })
})

describe('SUBMISSION_STATUS_COLORS', () => {
  const statuses: SubmissionStatus[] = ['pending', 'in_progress', 'completed', 'expired']

  it('tem cor para todos os status', () => {
    for (const status of statuses) {
      expect(SUBMISSION_STATUS_COLORS[status]).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('completed é verde', () => {
    expect(SUBMISSION_STATUS_COLORS.completed).toBe('#10B981')
  })

  it('expired é vermelho', () => {
    expect(SUBMISSION_STATUS_COLORS.expired).toBe('#EF4444')
  })
})

describe('DEFAULT_SEND_MESSAGE', () => {
  it('contém todos os placeholders esperados', () => {
    expect(DEFAULT_SEND_MESSAGE).toContain('<<nome_paciente>>')
    expect(DEFAULT_SEND_MESSAGE).toContain('<<link>>')
    expect(DEFAULT_SEND_MESSAGE).toContain('<<nome_formulario>>')
    expect(DEFAULT_SEND_MESSAGE).toContain('<<nome_psicologo>>')
  })

  it('é uma string não vazia', () => {
    expect(DEFAULT_SEND_MESSAGE.length).toBeGreaterThan(50)
  })
})
