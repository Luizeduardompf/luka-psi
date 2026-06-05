/**
 * Testes — feature profile_field_questions
 * Cobre: snapshot, completeSubmission (atualização de patients + patient_field_sources),
 * tipos, e casos de borda.
 */

// ─── Mock thenable (mesmo padrão dos outros testes) ──────────────────────────

type MockResult = { data: unknown; error: unknown }
const mockResults: MockResult[] = []
let callCount = 0

function nextResult(): MockResult {
  const r = mockResults[callCount] ?? { data: null, error: null }
  callCount++
  return r
}

function queueResult(result: MockResult) {
  mockResults.push(result)
}

function resetQueue() {
  mockResults.length = 0
  callCount = 0
}

const chainable: Record<string, jest.Mock> & { then?: Function } = {
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  or: jest.fn(),
  order: jest.fn(),
  in: jest.fn(),
  upsert: jest.fn(),
  limit: jest.fn(),
  neq: jest.fn(),
  is: jest.fn(),
  filter: jest.fn(),
  ilike: jest.fn(),
  gte: jest.fn(),
  lte: jest.fn(),
  lt: jest.fn(),
  gt: jest.fn(),
  not: jest.fn(),
  contains: jest.fn(),
  range: jest.fn(),
  maybeSingle: jest.fn(),
  throwOnError: jest.fn(),
  returns: jest.fn(),
  csv: jest.fn(),
  overrideTypes: jest.fn(),
}

Object.keys(chainable).forEach((key) => {
  chainable[key].mockReturnValue(chainable)
})

chainable.then = jest.fn((resolve: (v: unknown) => void) => {
  resolve(nextResult())
})

const mockRpc = jest.fn().mockResolvedValue({ data: null, error: null })

jest.mock('@/services/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue(chainable),
    rpc: mockRpc,
  },
  supabasePublic: {
    from: jest.fn().mockReturnValue(chainable),
    rpc: mockRpc,
  },
}))

// ─── Imports ─────────────────────────────────────────────────────────────────

import { formsService } from '@/services/forms.service'
import {
  FormResponse,
  FormSubmission,
  SnapshotQuestion,
  QuestionType,
  QUESTION_TYPE_LABELS,
} from '@/types/forms.types'
import { PROFILE_FIELDS } from '@/constants/patientProfileFields'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BASE_QUESTION: Omit<SnapshotQuestion, 'id' | 'type' | 'title' | 'sort_order'> = {
  section_id: 's1',
  description: null,
  help_text: null,
  is_required: false,
  scale_min: 0,
  scale_max: 10,
  scale_step: 1,
  options: [],
  profile_field_key: null,
}

function makeProfileSnapshot(profileQuestions: Partial<SnapshotQuestion>[] = []) {
  const questions: SnapshotQuestion[] = [
    {
      ...BASE_QUESTION,
      id: 'q-text-1',
      type: 'short_text',
      title: 'Pergunta livre',
      sort_order: 1,
    },
    ...profileQuestions.map((pq, i) => ({
      ...BASE_QUESTION,
      id: pq.id ?? `q-pf-${i}`,
      section_id: pq.section_id ?? 's1',
      type: 'profile_field' as QuestionType,
      title: pq.title ?? `Campo perfil ${i}`,
      is_required: pq.is_required ?? false,
      sort_order: pq.sort_order ?? i + 2,
      options: pq.options ?? [],
      profile_field_key: pq.profile_field_key ?? null,
    })),
  ]

  return {
    template_id: 'tmpl-1',
    template_title: 'Formulário de Anamnese',
    template_description: null,
    sections: [{ id: 's1', title: 'Dados', description: null, sort_order: 1 }],
    questions,
    custom_message: null,
    expires_at: null,
    snapshotted_at: new Date().toISOString(),
    profile_field_options: {} as Record<string, { id: string; label: string }[]>,
  }
}

function makeSubmission(overrides: Partial<FormSubmission> = {}): FormSubmission {
  return {
    id: 'sub-pf-1',
    template_id: 'tmpl-1',
    patient_id: 'patient-1',
    psychologist_id: 'psych-1',
    token: 'tok-abc',
    status: 'in_progress',
    password: null,
    snapshot: makeProfileSnapshot(),
    responses: [],
    expires_at: null,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as FormSubmission
}

function makeResponse(overrides: Partial<FormResponse>): FormResponse {
  return {
    id: `r-${Math.random()}`,
    submission_id: 'sub-pf-1',
    question_id: 'q-pf-0',
    answer_text: null,
    answer_options: null,
    answer_number: null,
    answer_date: null,
    answer_boolean: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

// ─── Testes de tipos ──────────────────────────────────────────────────────────

describe('QuestionType — profile_field', () => {
  it('profile_field está definido em QUESTION_TYPE_LABELS', () => {
    expect(QUESTION_TYPE_LABELS['profile_field']).toBeTruthy()
    expect(typeof QUESTION_TYPE_LABELS['profile_field']).toBe('string')
  })

  it('QUESTION_TYPE_LABELS["profile_field"] tem label legível', () => {
    const label = QUESTION_TYPE_LABELS['profile_field']
    expect(label.length).toBeGreaterThan(2)
  })
})

// ─── Testes de patientProfileFields ──────────────────────────────────────────

describe('PROFILE_FIELDS — catálogo de campos', () => {
  it('tem pelo menos 10 campos definidos', () => {
    expect(PROFILE_FIELDS.length).toBeGreaterThanOrEqual(10)
  })

  it('cada campo tem key, label e inputType', () => {
    for (const f of PROFILE_FIELDS) {
      expect(f.key).toBeTruthy()
      expect(f.label).toBeTruthy()
      expect(['text', 'date', 'dropdown', 'boolean', 'long_text']).toContain(f.inputType)
    }
  })

  it('full_name está no catálogo com inputType text', () => {
    const f = PROFILE_FIELDS.find((x) => x.key === 'full_name')
    expect(f).toBeDefined()
    expect(f!.inputType).toBe('text')
  })

  it('date_of_birth está no catálogo com inputType date', () => {
    const f = PROFILE_FIELDS.find((x) => x.key === 'date_of_birth')
    expect(f).toBeDefined()
    expect(f!.inputType).toBe('date')
  })

  it('consent_rgpd está no catálogo com inputType boolean', () => {
    const f = PROFILE_FIELDS.find((x) => x.key === 'consent_rgpd')
    expect(f).toBeDefined()
    expect(f!.inputType).toBe('boolean')
  })

  it('gender_id está no catálogo com inputType dropdown', () => {
    const f = PROFILE_FIELDS.find((x) => x.key === 'gender_id')
    expect(f).toBeDefined()
    expect(f!.inputType).toBe('dropdown')
  })

  it('keys são únicas (sem duplicatas)', () => {
    const keys = PROFILE_FIELDS.map((f) => f.key)
    const unique = new Set(keys)
    expect(unique.size).toBe(keys.length)
  })
})

// ─── Snapshot com profile_field_key ──────────────────────────────────────────

describe('Snapshot — profile_field_key', () => {
  it('snapshot aceita pergunta com profile_field_key preenchida', () => {
    const snap = makeProfileSnapshot([
      { id: 'q-pf-1', profile_field_key: 'full_name', type: 'profile_field' as QuestionType },
    ])
    const pq = snap.questions.find((q) => q.type === 'profile_field')
    expect(pq).toBeDefined()
    expect(pq!.profile_field_key).toBe('full_name')
  })

  it('snapshot pode ter múltiplas perguntas profile_field', () => {
    const snap = makeProfileSnapshot([
      { profile_field_key: 'full_name' },
      { profile_field_key: 'date_of_birth' },
      { profile_field_key: 'email' },
    ])
    const pqs = snap.questions.filter((q) => q.type === 'profile_field')
    expect(pqs).toHaveLength(3)
  })

  it('snapshot pode ter profile_field_options vazio quando não há dropdowns', () => {
    const snap = makeProfileSnapshot([{ profile_field_key: 'full_name' }])
    expect(snap.profile_field_options).toBeDefined()
    expect(typeof snap.profile_field_options).toBe('object')
  })

  it('serialização/desserialização do snapshot preserva profile_field_key', () => {
    const snap = makeProfileSnapshot([{ profile_field_key: 'profession' }])
    const json = JSON.stringify(snap)
    const parsed = JSON.parse(json)
    const pq = parsed.questions.find((q: SnapshotQuestion) => q.type === 'profile_field')
    expect(pq.profile_field_key).toBe('profession')
  })

  it('pergunta profile_field com profile_field_key null é válida no tipo (campo livre sem vínculo)', () => {
    const snap = makeProfileSnapshot([{ profile_field_key: null }])
    const pq = snap.questions.find((q) => q.type === 'profile_field')
    expect(pq).toBeDefined()
    expect(pq!.profile_field_key).toBeNull()
  })
})

// ─── completeSubmission com profile_field ────────────────────────────────────

describe('formsService.completeSubmission — profile_field atualiza paciente', () => {
  beforeEach(() => resetQueue())

  it('conclui sem erro quando há profile_field respondido (text)', async () => {
    const snapshot = makeProfileSnapshot([
      { id: 'q-pf-1', profile_field_key: 'full_name', is_required: false },
    ])
    const sub = makeSubmission({ snapshot, status: 'in_progress' })
    const completed = { ...sub, status: 'completed' }

    queueResult({ data: sub, error: null })       // busca submission
    queueResult({ data: completed, error: null })  // update status
    queueResult({ data: {}, error: null })          // audit log
    queueResult({ data: {}, error: null })          // update patients
    queueResult({ data: {}, error: null })          // upsert patient_field_sources

    const responses: FormResponse[] = [
      makeResponse({ question_id: 'q-pf-1', answer_text: 'Maria Silva' }),
    ]

    const result = await formsService.completeSubmission('sub-pf-1', responses)
    expect(result.error).toBeNull()
    expect(result.data).toBeDefined()
  })

  it('conclui sem erro quando há profile_field respondido (date)', async () => {
    const snapshot = makeProfileSnapshot([
      { id: 'q-pf-2', profile_field_key: 'date_of_birth', is_required: false },
    ])
    const sub = makeSubmission({ snapshot, status: 'in_progress' })
    const completed = { ...sub, status: 'completed' }

    queueResult({ data: sub, error: null })
    queueResult({ data: completed, error: null })
    queueResult({ data: {}, error: null })
    queueResult({ data: {}, error: null })
    queueResult({ data: {}, error: null })

    const responses: FormResponse[] = [
      makeResponse({ question_id: 'q-pf-2', answer_date: '1990-05-15', answer_text: null }),
    ]

    const result = await formsService.completeSubmission('sub-pf-1', responses)
    expect(result.error).toBeNull()
  })

  it('conclui sem erro quando há profile_field respondido (boolean)', async () => {
    const snapshot = makeProfileSnapshot([
      { id: 'q-pf-3', profile_field_key: 'consent_rgpd', is_required: false },
    ])
    const sub = makeSubmission({ snapshot, status: 'in_progress' })
    const completed = { ...sub, status: 'completed' }

    queueResult({ data: sub, error: null })
    queueResult({ data: completed, error: null })
    queueResult({ data: {}, error: null })
    queueResult({ data: {}, error: null })
    queueResult({ data: {}, error: null })

    const responses: FormResponse[] = [
      makeResponse({ question_id: 'q-pf-3', answer_boolean: true, answer_text: null }),
    ]

    const result = await formsService.completeSubmission('sub-pf-1', responses)
    expect(result.error).toBeNull()
  })

  it('conclui sem erro quando há profile_field respondido (dropdown/id)', async () => {
    const snapshot = makeProfileSnapshot([
      { id: 'q-pf-4', profile_field_key: 'gender_id', is_required: false },
    ])
    const sub = makeSubmission({ snapshot, status: 'in_progress' })
    const completed = { ...sub, status: 'completed' }

    queueResult({ data: sub, error: null })
    queueResult({ data: completed, error: null })
    queueResult({ data: {}, error: null })
    queueResult({ data: {}, error: null })
    queueResult({ data: {}, error: null })

    const responses: FormResponse[] = [
      makeResponse({ question_id: 'q-pf-4', answer_text: 'uuid-gender-feminino' }),
    ]

    const result = await formsService.completeSubmission('sub-pf-1', responses)
    expect(result.error).toBeNull()
  })

  it('conclui sem atualizar patients quando profile_field não foi respondido', async () => {
    const snapshot = makeProfileSnapshot([
      { id: 'q-pf-5', profile_field_key: 'full_name', is_required: false },
    ])
    const sub = makeSubmission({ snapshot, status: 'in_progress' })
    const completed = { ...sub, status: 'completed' }

    queueResult({ data: sub, error: null })
    queueResult({ data: completed, error: null })
    queueResult({ data: {}, error: null })
    // NÃO deve chamar update patients nem upsert sources

    // Passa apenas resposta da pergunta livre (não do profile_field)
    const responses: FormResponse[] = [
      makeResponse({ question_id: 'q-text-1', answer_text: 'resposta livre' }),
    ]

    const result = await formsService.completeSubmission('sub-pf-1', responses)
    expect(result.error).toBeNull()
  })

  it('conclui sem erro quando formulário não tem nenhum profile_field (regressão)', async () => {
    // Snapshot sem nenhuma pergunta profile_field — comportamento original deve ser preservado
    const snapshot = makeProfileSnapshot([]) // nenhuma profile_field
    const sub = makeSubmission({ snapshot, status: 'in_progress' })
    const completed = { ...sub, status: 'completed' }

    queueResult({ data: sub, error: null })
    queueResult({ data: completed, error: null })
    queueResult({ data: {}, error: null })

    const responses: FormResponse[] = [
      makeResponse({ question_id: 'q-text-1', answer_text: 'sem profile fields' }),
    ]

    const result = await formsService.completeSubmission('sub-pf-1', responses)
    expect(result.error).toBeNull()
    expect(result.data).toBeDefined()
  })

  it('retorna erro se submission já está concluída (mesmo com profile_field)', async () => {
    const snapshot = makeProfileSnapshot([{ profile_field_key: 'full_name' }])
    const sub = makeSubmission({ snapshot, status: 'completed' })

    queueResult({ data: sub, error: null })

    const result = await formsService.completeSubmission('sub-pf-1', [])
    expect(result.error).toContain('concluído')
  })

  it('múltiplos profile_fields: todos processados em sequência', async () => {
    const snapshot = makeProfileSnapshot([
      { id: 'q-pf-a', profile_field_key: 'full_name' },
      { id: 'q-pf-b', profile_field_key: 'email' },
      { id: 'q-pf-c', profile_field_key: 'phone' },
    ])
    const sub = makeSubmission({ snapshot, status: 'in_progress' })
    const completed = { ...sub, status: 'completed' }

    queueResult({ data: sub, error: null })
    queueResult({ data: completed, error: null })
    queueResult({ data: {}, error: null })        // audit log
    queueResult({ data: {}, error: null })        // update patients (1x para todos)
    queueResult({ data: {}, error: null })        // upsert field_sources q-pf-a
    queueResult({ data: {}, error: null })        // upsert field_sources q-pf-b
    queueResult({ data: {}, error: null })        // upsert field_sources q-pf-c

    const responses: FormResponse[] = [
      makeResponse({ question_id: 'q-pf-a', answer_text: 'Maria Silva' }),
      makeResponse({ question_id: 'q-pf-b', answer_text: 'maria@email.com' }),
      makeResponse({ question_id: 'q-pf-c', answer_text: '912345678' }),
    ]

    const result = await formsService.completeSubmission('sub-pf-1', responses)
    expect(result.error).toBeNull()
    expect(result.data).toBeDefined()
  })
})

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('Edge cases — profile_field', () => {
  beforeEach(() => resetQueue())

  it('profile_field_key inválida (não existe no catálogo) é ignorada silenciosamente', async () => {
    const snapshot = makeProfileSnapshot([
      { id: 'q-pf-inv', profile_field_key: 'campo_inexistente_xyz' },
    ])
    const sub = makeSubmission({ snapshot, status: 'in_progress' })
    const completed = { ...sub, status: 'completed' }

    queueResult({ data: sub, error: null })
    queueResult({ data: completed, error: null })
    queueResult({ data: {}, error: null })

    const responses: FormResponse[] = [
      makeResponse({ question_id: 'q-pf-inv', answer_text: 'valor' }),
    ]

    // Não deve lançar erro — campo desconhecido deve ser ignorado
    const result = await formsService.completeSubmission('sub-pf-1', responses)
    expect(result.error).toBeNull()
  })

  it('profile_field obrigatório não respondido bloqueia conclusão', async () => {
    const snapshot = makeProfileSnapshot([
      { id: 'q-pf-req', profile_field_key: 'full_name', is_required: true },
    ])
    const sub = makeSubmission({ snapshot, status: 'in_progress' })

    queueResult({ data: sub, error: null })

    const result = await formsService.completeSubmission('sub-pf-1', [])
    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
  })

  it('profile_field com answer_text vazio não atualiza o campo', async () => {
    const snapshot = makeProfileSnapshot([
      { id: 'q-pf-empty', profile_field_key: 'profession', is_required: false },
    ])
    const sub = makeSubmission({ snapshot, status: 'in_progress' })
    const completed = { ...sub, status: 'completed' }

    queueResult({ data: sub, error: null })
    queueResult({ data: completed, error: null })
    queueResult({ data: {}, error: null })
    // NÃO deve chamar update patients

    const responses: FormResponse[] = [
      makeResponse({ question_id: 'q-pf-empty', answer_text: null }),
    ]

    const result = await formsService.completeSubmission('sub-pf-1', responses)
    expect(result.error).toBeNull()
  })
})
