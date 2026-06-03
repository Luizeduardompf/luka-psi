/**
 * Testes unitários — formsService
 * Mocka o cliente Supabase com um chainable thenable para suportar o builder pattern.
 */

// ─── Setup do mock thenable ───────────────────────────────────────────────────

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

// Chainable builder: todos os métodos retornam `chainable` (via mockReturnThis).
// `then` faz com que `await chainable` resolva com o próximo resultado da fila.
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

// Todos os métodos do builder retornam o próprio chainable
Object.keys(chainable).forEach((key) => {
  chainable[key].mockReturnValue(chainable)
})

// `then` torna o chainable "thenable" — `await chainable` chama `then`
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

jest.mock('@/utils/errors', () => ({
  formatSupabaseError: (err: unknown) => {
    if (err && typeof err === 'object' && 'message' in err) {
      return (err as { message: string }).message
    }
    if (err instanceof Error) return err.message
    return 'Erro desconhecido.'
  },
}))

// ─── Importar após os mocks ───────────────────────────────────────────────────
import { formsService } from '@/services/forms.service'
import {
  FormTemplate,
  FormSubmission,
  FormSnapshot,
  SubmissionStatus,
  FormResponse,
} from '@/types/forms.types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeTemplate(overrides: Partial<FormTemplate> = {}): FormTemplate {
  return {
    id: 'tmpl-1',
    psychologist_id: 'psych-1',
    title: 'Anamnese Adulto',
    description: 'Descrição',
    send_message: 'Olá <<nome_paciente>>',
    is_system: false,
    is_archived: false,
    cloned_from_id: null,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

function makeSnapshot(): FormSnapshot {
  return {
    template_id: 'tmpl-1',
    template_title: 'Anamnese Adulto',
    template_description: null,
    sections: [{ id: 's1', title: 'Seção 1', description: null, sort_order: 1 }],
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
    ],
    custom_message: null,
    expires_at: null,
    snapshotted_at: new Date().toISOString(),
  }
}

function makeSubmission(overrides: Partial<FormSubmission> = {}): FormSubmission {
  return {
    id: 'sub-1',
    psychologist_id: 'psych-1',
    patient_id: 'patient-1',
    template_id: 'tmpl-1',
    token: 'abc123token',
    access_password: 'senha123',
    expires_at: null,
    status: 'pending' as SubmissionStatus,
    custom_message: null,
    first_opened_at: null,
    last_opened_at: null,
    completed_at: null,
    snapshot: makeSnapshot(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

// ─── Reset entre testes ───────────────────────────────────────────────────────

beforeEach(() => {
  resetQueue()
  jest.clearAllMocks()
  // Reconfigurar mocks após clearAllMocks
  Object.keys(chainable).forEach((key) => {
    if (key !== 'then') {
      chainable[key] = jest.fn().mockReturnValue(chainable)
    }
  })
  chainable.then = jest.fn((resolve: (v: unknown) => void) => {
    resolve(nextResult())
  })
  const { supabase, supabasePublic } = require('@/services/supabase')
  supabase.from = jest.fn().mockReturnValue(chainable)
  supabase.rpc = jest.fn().mockResolvedValue({ data: null, error: null })
  supabasePublic.from = jest.fn().mockReturnValue(chainable)
  supabasePublic.rpc = jest.fn().mockResolvedValue({ data: null, error: null })
})

// ─── listTemplates ────────────────────────────────────────────────────────────

describe('formsService.listTemplates', () => {
  it('retorna templates quando sucesso', async () => {
    const templates = [makeTemplate(), makeTemplate({ id: 'tmpl-2', is_system: true })]
    queueResult({ data: templates, error: null })

    const result = await formsService.listTemplates('psych-1')

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(2)
  })

  it('retorna erro quando supabase falha', async () => {
    queueResult({ data: null, error: { message: 'Network error', code: '500' } })

    const result = await formsService.listTemplates('psych-1')

    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
  })
})

// ─── createTemplate ───────────────────────────────────────────────────────────

describe('formsService.createTemplate', () => {
  it('cria template e retorna dados', async () => {
    const created = makeTemplate()
    queueResult({ data: null, error: null }) // duplicate check: not found
    queueResult({ data: created, error: null })

    const result = await formsService.createTemplate('psych-1', {
      title: 'Anamnese Adulto',
      description: 'Descrição',
    })

    expect(result.error).toBeNull()
    expect(result.data?.title).toBe('Anamnese Adulto')
    expect(result.data?.is_system).toBe(false)
  })

  it('retorna erro quando insert falha', async () => {
    queueResult({ data: null, error: null }) // duplicate check: not found
    queueResult({ data: null, error: { message: 'duplicate key', code: '23505' } })

    const result = await formsService.createTemplate('psych-1', { title: 'X' })

    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
  })
})

// ─── updateTemplate ───────────────────────────────────────────────────────────

describe('formsService.updateTemplate', () => {
  it('impede edição de template do sistema', async () => {
    queueResult({ data: { is_system: true }, error: null }) // select is_system

    const result = await formsService.updateTemplate('tmpl-sys', { title: 'Novo' })

    expect(result.data).toBeNull()
    expect(result.error).toContain('sistema')
  })

  it('atualiza template próprio', async () => {
    queueResult({ data: { is_system: false }, error: null }) // select is_system
    queueResult({ data: makeTemplate({ title: 'Atualizado' }), error: null }) // update

    const result = await formsService.updateTemplate('tmpl-1', { title: 'Atualizado' })

    expect(result.error).toBeNull()
    expect(result.data?.title).toBe('Atualizado')
  })
})

// ─── deleteTemplate ───────────────────────────────────────────────────────────

describe('formsService.deleteTemplate', () => {
  it('impede exclusão de template do sistema', async () => {
    queueResult({ data: { is_system: true }, error: null })

    const result = await formsService.deleteTemplate('tmpl-sys')

    expect(result.error).toContain('sistema')
  })

  it('exclui template próprio', async () => {
    queueResult({ data: { is_system: false }, error: null })
    queueResult({ data: null, error: null }) // delete

    const result = await formsService.deleteTemplate('tmpl-1')

    expect(result.error).toBeNull()
  })
})

// ─── validateAccess ───────────────────────────────────────────────────────────

describe('formsService.validateAccess', () => {
  it('retorna not_found quando token não existe', async () => {
    queueResult({ data: null, error: { code: 'PGRST116', message: 'Not found' } })

    const result = await formsService.validateAccess('invalid-token', 'senha')

    expect(result.valid).toBe(false)
    expect(result.reason).toBe('not_found')
  })

  it('retorna wrong_password quando senha incorreta', async () => {
    const sub = makeSubmission({ access_password: 'correta', status: 'pending' })
    queueResult({ data: sub, error: null })

    const result = await formsService.validateAccess('abc123token', 'errada')

    expect(result.valid).toBe(false)
    expect(result.reason).toBe('wrong_password')
  })

  it('retorna expired quando prazo venceu', async () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString()
    const sub = makeSubmission({
      expires_at: pastDate,
      access_password: 'senha',
      status: 'pending',
    })
    queueResult({ data: sub, error: null }) // getSubmissionByToken
    queueResult({ data: null, error: null }) // update to expired

    const result = await formsService.validateAccess('abc123token', 'senha')

    expect(result.valid).toBe(false)
    expect(result.reason).toBe('expired')
  })

  it('retorna completed quando formulário já foi concluído', async () => {
    const sub = makeSubmission({ status: 'completed', access_password: 'senha' })
    queueResult({ data: sub, error: null })

    const result = await formsService.validateAccess('abc123token', 'senha')

    expect(result.valid).toBe(false)
    expect(result.reason).toBe('completed')
  })

  it('concede acesso com credenciais corretas', async () => {
    const sub = makeSubmission({ access_password: 'correta', status: 'pending' })
    queueResult({ data: sub, error: null })  // getSubmissionByToken
    queueResult({ data: { ...sub, status: 'in_progress' }, error: null }) // update
    queueResult({ data: {}, error: null }) // audit log insert

    const result = await formsService.validateAccess('abc123token', 'correta')

    expect(result.valid).toBe(true)
    expect(result.submission).toBeDefined()
  })
})

// ─── completeSubmission ───────────────────────────────────────────────────────

describe('formsService.completeSubmission', () => {
  it('retorna erro se formulário já está concluído', async () => {
    const sub = makeSubmission({ status: 'completed' })
    queueResult({ data: sub, error: null })

    const result = await formsService.completeSubmission('sub-1', [])

    expect(result.error).toContain('concluído')
  })

  it('retorna erro se obrigatórias não respondidas', async () => {
    const snapshot = makeSnapshot() // q1 is_required=true
    const sub = makeSubmission({ snapshot, status: 'in_progress' })
    queueResult({ data: sub, error: null })

    const result = await formsService.completeSubmission('sub-1', [])

    expect(result.data).toBeNull()
    expect(result.error).toContain('obrigatórias')
  })

  it('conclui formulário quando todas obrigatórias respondidas', async () => {
    const snapshot = makeSnapshot()
    const sub = makeSubmission({ snapshot, status: 'in_progress' })
    const completed = { ...sub, status: 'completed' }

    queueResult({ data: sub, error: null })       // select submission
    queueResult({ data: completed, error: null })  // update to completed
    queueResult({ data: {}, error: null })          // audit log

    const responses: FormResponse[] = [
      {
        id: 'r1',
        submission_id: 'sub-1',
        question_id: 'q1',
        answer_text: 'João Silva',
        answer_options: null,
        answer_number: null,
        answer_date: null,
        answer_boolean: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    const result = await formsService.completeSubmission('sub-1', responses)

    expect(result.error).toBeNull()
    expect(result.data).toBeDefined()
  })
})

// ─── saveResponse ─────────────────────────────────────────────────────────────

describe('formsService.saveResponse', () => {
  it('impede salvar resposta em formulário concluído', async () => {
    queueResult({ data: { status: 'completed', completed_at: new Date().toISOString() }, error: null })

    const result = await formsService.saveResponse({
      submission_id: 'sub-1',
      question_id: 'q1',
      answer_text: 'Resposta',
    })

    expect(result.data).toBeNull()
    expect(result.error).toContain('concluído')
  })

  it('salva resposta com upsert', async () => {
    const savedResponse: FormResponse = {
      id: 'r1',
      submission_id: 'sub-1',
      question_id: 'q1',
      answer_text: 'Resposta',
      answer_options: null,
      answer_number: null,
      answer_date: null,
      answer_boolean: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    queueResult({ data: { status: 'in_progress', completed_at: null }, error: null })
    queueResult({ data: savedResponse, error: null })

    const result = await formsService.saveResponse({
      submission_id: 'sub-1',
      question_id: 'q1',
      answer_text: 'Resposta',
    })

    expect(result.error).toBeNull()
    expect(result.data?.answer_text).toBe('Resposta')
  })
})

// ─── buildPublicUrl ───────────────────────────────────────────────────────────

describe('formsService.buildPublicUrl', () => {
  it('gera URL correta com token', () => {
    const url = formsService.buildPublicUrl('abc123xyz')
    expect(url).toContain('abc123xyz')
    expect(url).toContain('https://')
  })
})
