/**
 * Testes unitários — Snapshot de formulário
 * Valida a imutabilidade e a estrutura do snapshot gerado.
 */

import {
  FormSnapshot,
  SnapshotQuestion,
  SnapshotSection,
} from '@/types/forms.types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSnapshot(overrides: Partial<FormSnapshot> = {}): FormSnapshot {
  return {
    template_id: 'tmpl-1',
    template_title: 'Anamnese Adulto',
    template_description: 'Formulário completo',
    sections: [
      { id: 's1', title: 'Dados Pessoais', description: null, sort_order: 1 },
      { id: 's2', title: 'Saúde', description: null, sort_order: 2 },
    ],
    questions: [
      {
        id: 'q1',
        section_id: 's1',
        type: 'short_text',
        title: 'Nome completo',
        description: null,
        help_text: null,
        is_required: true,
        sort_order: 1,
        scale_min: 1,
        scale_max: 10,
        scale_step: 1,
        options: [],
      },
      {
        id: 'q2',
        section_id: 's1',
        type: 'date',
        title: 'Data de nascimento',
        description: null,
        help_text: null,
        is_required: true,
        sort_order: 2,
        scale_min: 1,
        scale_max: 10,
        scale_step: 1,
        options: [],
      },
      {
        id: 'q3',
        section_id: 's2',
        type: 'boolean',
        title: 'Possui condição médica?',
        description: null,
        help_text: null,
        is_required: false,
        sort_order: 1,
        scale_min: 1,
        scale_max: 10,
        scale_step: 1,
        options: [],
      },
    ],
    custom_message: 'Olá, preencha este formulário.',
    expires_at: null,
    snapshotted_at: new Date().toISOString(),
    ...overrides,
  }
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('FormSnapshot — estrutura', () => {
  it('contém template_id, title e sections', () => {
    const snap = makeSnapshot()
    expect(snap.template_id).toBe('tmpl-1')
    expect(snap.template_title).toBe('Anamnese Adulto')
    expect(snap.sections).toHaveLength(2)
    expect(snap.questions).toHaveLength(3)
  })

  it('cada pergunta tem todos os campos obrigatórios', () => {
    const snap = makeSnapshot()
    for (const q of snap.questions) {
      expect(q).toHaveProperty('id')
      expect(q).toHaveProperty('type')
      expect(q).toHaveProperty('title')
      expect(q).toHaveProperty('is_required')
      expect(q).toHaveProperty('sort_order')
      expect(q).toHaveProperty('options')
    }
  })

  it('cada seção tem todos os campos obrigatórios', () => {
    const snap = makeSnapshot()
    for (const s of snap.sections) {
      expect(s).toHaveProperty('id')
      expect(s).toHaveProperty('title')
      expect(s).toHaveProperty('sort_order')
    }
  })

  it('perguntas são associadas às seções corretas', () => {
    const snap = makeSnapshot()
    const s1Questions = snap.questions.filter((q) => q.section_id === 's1')
    const s2Questions = snap.questions.filter((q) => q.section_id === 's2')
    expect(s1Questions).toHaveLength(2)
    expect(s2Questions).toHaveLength(1)
  })

  it('identifica perguntas obrigatórias corretamente', () => {
    const snap = makeSnapshot()
    const required = snap.questions.filter((q) => q.is_required)
    expect(required).toHaveLength(2)
    expect(required.map((q) => q.id)).toContain('q1')
    expect(required.map((q) => q.id)).toContain('q2')
  })
})

describe('FormSnapshot — imutabilidade', () => {
  it('snapshot pode ser serializado e desserializado sem perda', () => {
    const snap = makeSnapshot()
    const json = JSON.stringify(snap)
    const restored = JSON.parse(json) as FormSnapshot
    expect(restored.template_id).toBe(snap.template_id)
    expect(restored.sections).toHaveLength(snap.sections.length)
    expect(restored.questions).toHaveLength(snap.questions.length)
  })

  it('snapshot tem timestamp de criação', () => {
    const snap = makeSnapshot()
    expect(snap.snapshotted_at).toBeTruthy()
    expect(new Date(snap.snapshotted_at).getTime()).not.toBeNaN()
  })
})

describe('FormSnapshot — lógica de obrigatórios', () => {
  function checkRequiredAnswered(
    snap: FormSnapshot,
    answeredIds: string[],
  ): { valid: boolean; missing: string[] } {
    const requiredIds = snap.questions.filter((q) => q.is_required).map((q) => q.id)
    const answeredSet = new Set(answeredIds)
    const missing = requiredIds.filter((id) => !answeredSet.has(id))
    return { valid: missing.length === 0, missing }
  }

  it('válido quando todas as obrigatórias respondidas', () => {
    const snap = makeSnapshot()
    const { valid } = checkRequiredAnswered(snap, ['q1', 'q2'])
    expect(valid).toBe(true)
  })

  it('inválido quando falta obrigatória', () => {
    const snap = makeSnapshot()
    const { valid, missing } = checkRequiredAnswered(snap, ['q1'])
    expect(valid).toBe(false)
    expect(missing).toContain('q2')
  })

  it('válido quando formulário não tem obrigatórias', () => {
    const snap = makeSnapshot({
      questions: [
        {
          id: 'q1',
          section_id: 's1',
          type: 'short_text',
          title: 'Opcional',
          description: null,
          help_text: null,
          is_required: false,
          sort_order: 1,
          scale_min: 1,
          scale_max: 10,
          scale_step: 1,
          options: [],
        },
      ],
    })
    const { valid } = checkRequiredAnswered(snap, [])
    expect(valid).toBe(true)
  })
})

describe('FormSnapshot — tipos de pergunta', () => {
  const allTypes: SnapshotQuestion['type'][] = [
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

  it('aceita todos os tipos de pergunta', () => {
    for (const type of allTypes) {
      const q: SnapshotQuestion = {
        id: 'q-test',
        section_id: 's1',
        type,
        title: `Pergunta ${type}`,
        description: null,
        help_text: null,
        is_required: false,
        sort_order: 1,
        scale_min: 1,
        scale_max: 10,
        scale_step: 1,
        options: [],
      }
      expect(q.type).toBe(type)
    }
  })

  it('pergunta de escala tem min < max', () => {
    const snap = makeSnapshot({
      questions: [
        {
          id: 'q-scale',
          section_id: 's1',
          type: 'scale',
          title: 'Avaliação',
          description: null,
          help_text: null,
          is_required: false,
          sort_order: 1,
          scale_min: 1,
          scale_max: 10,
          scale_step: 1,
          options: [],
        },
      ],
    })
    const scaleQ = snap.questions.find((q) => q.type === 'scale')!
    expect(scaleQ.scale_min).toBeLessThan(scaleQ.scale_max)
  })
})
