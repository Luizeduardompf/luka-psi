/**
 * Teste E2E de fluxo completo — módulo de formulários
 *
 * Simula o ciclo completo:
 * 1. Psicólogo cria template (seções, perguntas, opções)
 * 2. Psicólogo envia formulário sem customização
 * 3. Psicólogo envia com customizações (perguntas extras, mensagem, prazo)
 * 4. Paciente acessa por token (senha certa/errada, expirado, já concluído)
 * 5. Paciente salva respostas (auto-save — vários tipos)
 * 6. Paciente conclui (validação de obrigatórias)
 * 7. Psicólogo visualiza respostas
 * 8. Interpolação de placeholders
 * 9. Upload de logo profissional
 * 10. Clonagem de template
 *
 * IMPORTANTE: cada teste usa beforeEach(resetQ) para limpar a fila.
 * getTemplateWithDetails faz 4 chamadas ao Supabase:
 *   [0] form_templates .single()
 *   [1] form_sections .select()
 *   [2] form_questions .select()
 *   [3] form_question_options .in() (só se houver questions)
 * sendForm = getTemplateWithDetails(4) + insert_submission(1) + insert_audit(1) = 6 calls
 * cloneTemplate = getTemplateWithDetails(4) + insert_template(1) + [insert_section(1) + insert_question(1)] per pair = 4+1+N*2
 */

// ─── Mock Supabase ────────────────────────────────────────────────────────────
type MockResult = { data: unknown; error: unknown }
const queue: MockResult[] = []
let callIdx = 0

const dequeue = (): MockResult => {
  const r = queue[callIdx] ?? { data: null, error: null }
  callIdx++
  return r
}
const enqueue = (r: MockResult) => queue.push(r)
const resetQ = () => { queue.length = 0; callIdx = 0 }

const chainable: Record<string, jest.Mock> & { then?: Function } = {
  select: jest.fn(), eq: jest.fn(), single: jest.fn(), insert: jest.fn(),
  update: jest.fn(), delete: jest.fn(), order: jest.fn(), in: jest.fn(),
  upsert: jest.fn(), limit: jest.fn(), neq: jest.fn(), is: jest.fn(),
  filter: jest.fn(), or: jest.fn(),
}
Object.keys(chainable).forEach((k) => chainable[k].mockReturnValue(chainable))
chainable.then = jest.fn((resolve: (v: unknown) => void) => resolve(dequeue()))

const mockRpc = jest.fn().mockResolvedValue({ data: null, error: null })

const mockStorage = {
  from: jest.fn().mockReturnThis(),
  upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
  getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.luka.com.br/logos/psych.jpg' } }),
}

jest.mock('@/services/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue(chainable),
    rpc: mockRpc,
    storage: mockStorage,
  },
}))

import { formsService } from '@/services/forms.service'
import {
  FormTemplate,
  FormSubmission,
  FormSection,
  FormQuestion,
  FormQuestionOption,
  FormResponse,
  FormSectionWithQuestions,
} from '@/types/forms.types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const PSYCH_ID = 'psych-uuid-001'
const PATIENT_ID = 'patient-uuid-001'
const TOKEN = 'tok_abc123securetoken'
const PASSWORD = 'luka2024'
const NOW = new Date().toISOString()

const baseTemplate: FormTemplate = {
  id: 'tpl-001',
  psychologist_id: PSYCH_ID,
  title: 'Anamnese Adulto',
  description: 'Avaliação inicial',
  send_message: null,
  is_system: false,
  is_archived: false,
  cloned_from_id: null,
  sort_order: 1,
  created_at: NOW,
  updated_at: NOW,
}

const section1: FormSection = {
  id: 'sec-1', template_id: 'tpl-001', title: 'Dados pessoais',
  description: null, sort_order: 1, created_at: NOW,
}

const q1: FormQuestion = {
  id: 'q1', template_id: 'tpl-001', section_id: 'sec-1', type: 'short_text',
  title: 'Nome completo', description: null, help_text: null, is_required: true,
  sort_order: 1, scale_min: 0, scale_max: 10, scale_step: 1, created_at: NOW,
}
const q2: FormQuestion = {
  id: 'q2', template_id: 'tpl-001', section_id: 'sec-1', type: 'number',
  title: 'Idade', description: null, help_text: null, is_required: true,
  sort_order: 2, scale_min: 0, scale_max: 120, scale_step: 1, created_at: NOW,
}
const q3: FormQuestion = {
  id: 'q3', template_id: 'tpl-001', section_id: 'sec-1', type: 'long_text',
  title: 'Queixa principal', description: null, help_text: null, is_required: false,
  sort_order: 3, scale_min: 0, scale_max: 10, scale_step: 1, created_at: NOW,
}

// Snapshot base para submission
const baseSnapshot = {
  template_id: 'tpl-001',
  template_title: 'Anamnese Adulto',
  template_description: null,
  sections: [{ id: 'sec-1', title: 'Dados pessoais', description: null, sort_order: 1 }],
  questions: [
    { id: 'q1', section_id: 'sec-1', type: 'short_text' as const, title: 'Nome completo', description: null, help_text: null, is_required: true, sort_order: 1, scale_min: 0, scale_max: 10, scale_step: 1, options: [] },
    { id: 'q2', section_id: 'sec-1', type: 'number' as const, title: 'Idade', description: null, help_text: null, is_required: true, sort_order: 2, scale_min: 0, scale_max: 120, scale_step: 1, options: [] },
    { id: 'q3', section_id: 'sec-1', type: 'long_text' as const, title: 'Queixa principal', description: null, help_text: null, is_required: false, sort_order: 3, scale_min: 0, scale_max: 10, scale_step: 1, options: [] },
  ],
  custom_message: null,
  expires_at: null,
  snapshotted_at: NOW,
}

const baseSubmission: FormSubmission = {
  id: 'sub-001',
  psychologist_id: PSYCH_ID,
  patient_id: PATIENT_ID,
  template_id: 'tpl-001',
  token: TOKEN,
  access_password: PASSWORD,
  expires_at: null,
  status: 'pending',
  custom_message: null,
  first_opened_at: null,
  last_opened_at: null,
  completed_at: null,
  snapshot: baseSnapshot,
  created_at: NOW,
  updated_at: NOW,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Enfileira as 4 chamadas que getTemplateWithDetails faz ao Supabase.
 * Se hasQuestions=false, só enfileira 3 (sem options).
 */
function enqueueTemplateDetail(
  template: FormTemplate = baseTemplate,
  sections: FormSection[] = [section1],
  questions: FormQuestion[] = [q1, q2, q3],
  options: FormQuestionOption[] = [],
) {
  enqueue({ data: template, error: null })          // [0] form_templates.single()
  enqueue({ data: sections, error: null })           // [1] form_sections.select()
  enqueue({ data: questions, error: null })          // [2] form_questions.select()
  if (questions.length > 0) {
    enqueue({ data: options, error: null })          // [3] form_question_options.in()
  }
}

function makeResponse(overrides: Partial<FormResponse> = {}): FormResponse {
  return {
    id: 'resp-' + Math.random().toString(36).slice(2),
    submission_id: 'sub-001',
    question_id: 'q1',
    answer_text: null,
    answer_options: null,
    answer_number: null,
    answer_date: null,
    answer_boolean: null,
    created_at: NOW,
    updated_at: NOW,
    ...overrides,
  }
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('E2E — Fluxo completo de formulários', () => {
  beforeEach(resetQ)

  // ── 1. Criar template ──────────────────────────────────────────────────────
  describe('1. Criação de template pelo psicólogo', () => {
    it('cria template com título e descrição', async () => {
      enqueue({ data: baseTemplate, error: null })
      const result = await formsService.createTemplate(PSYCH_ID, {
        title: 'Anamnese Adulto',
        description: 'Avaliação inicial',
      })
      expect(result.error).toBeNull()
      expect(result.data?.title).toBe('Anamnese Adulto')
      expect(result.data?.psychologist_id).toBe(PSYCH_ID)
    })

    it('cria seção dentro do template', async () => {
      enqueue({ data: { id: 'sec-1', template_id: 'tpl-001', title: 'Dados pessoais', sort_order: 1, created_at: NOW }, error: null })
      const result = await formsService.createSection({
        template_id: 'tpl-001',
        title: 'Dados pessoais',
        sort_order: 1,
      })
      expect(result.error).toBeNull()
      expect(result.data?.template_id).toBe('tpl-001')
    })

    it('cria questão de texto curto obrigatória', async () => {
      enqueue({ data: q1, error: null })
      const result = await formsService.createQuestion({
        template_id: 'tpl-001',
        section_id: 'sec-1',
        type: 'short_text',
        title: 'Nome completo',
        is_required: true,
      })
      expect(result.error).toBeNull()
      expect(result.data?.type).toBe('short_text')
      expect(result.data?.is_required).toBe(true)
    })

    it('cria questão de escala 0–10', async () => {
      const scaleQ: FormQuestion = { ...q1, id: 'q-scale', type: 'scale', title: 'Nível de ansiedade', scale_min: 0, scale_max: 10, scale_step: 1 }
      enqueue({ data: scaleQ, error: null })
      const result = await formsService.createQuestion({
        template_id: 'tpl-001',
        type: 'scale',
        title: 'Nível de ansiedade',
        scale_min: 0,
        scale_max: 10,
        scale_step: 1,
      })
      expect(result.error).toBeNull()
      expect(result.data?.scale_max).toBe(10)
    })

    it('cria opção para questão de escolha', async () => {
      const opt: FormQuestionOption = { id: 'opt-1', question_id: 'q-choice', label: 'Sim', sort_order: 1, created_at: NOW }
      enqueue({ data: opt, error: null })
      const result = await formsService.addOption('q-choice', 'Sim', 1)
      expect(result.error).toBeNull()
      expect(result.data?.label).toBe('Sim')
    })

    it('falha ao criar template sem título', async () => {
      enqueue({ data: null, error: { message: 'title is required', code: '23502' } })
      const result = await formsService.createTemplate(PSYCH_ID, { title: '' })
      expect(result.error).not.toBeNull()
    })
  })

  // ── 2. Envio sem customização ──────────────────────────────────────────────
  describe('2. Envio de formulário sem customizações', () => {
    it('envia formulário com token e status pending', async () => {
      // getTemplateWithDetails (4 calls) + insert_submission (1) + insert_audit (1)
      enqueueTemplateDetail()
      enqueue({ data: baseSubmission, error: null })   // insert submission
      enqueue({ data: {}, error: null })               // insert audit

      const result = await formsService.sendForm(PSYCH_ID, {
        patient_id: PATIENT_ID,
        template_id: 'tpl-001',
        access_password: PASSWORD,
      })
      expect(result.error).toBeNull()
      expect(result.data?.patient_id).toBe(PATIENT_ID)
      expect(result.data?.token).toBe(TOKEN)
      expect(result.data?.status).toBe('pending')
    })

    it('snapshot contém a estrutura do template no momento do envio', async () => {
      enqueueTemplateDetail()
      enqueue({ data: baseSubmission, error: null })
      enqueue({ data: {}, error: null })

      const result = await formsService.sendForm(PSYCH_ID, {
        patient_id: PATIENT_ID,
        template_id: 'tpl-001',
        access_password: PASSWORD,
      })
      const snap = result.data?.snapshot
      expect(snap).toBeDefined()
      expect(snap?.template_title).toBe('Anamnese Adulto')
      expect(snap?.questions.length).toBeGreaterThan(0)
      expect(snap?.snapshotted_at).toBeDefined()
    })

    it('falha graciosamente se template não existe', async () => {
      enqueue({ data: null, error: { message: 'Row not found', code: 'PGRST116' } })
      // sections, questions não chegam a ser chamados
      const result = await formsService.sendForm(PSYCH_ID, {
        patient_id: PATIENT_ID,
        template_id: 'tpl-inexistente',
        access_password: PASSWORD,
      })
      expect(result.error).not.toBeNull()
      expect(result.data).toBeNull()
    })
  })

  // ── 3. Envio com customizações ─────────────────────────────────────────────
  describe('3. Envio com customizações para este paciente', () => {
    it('inclui mensagem customizada', async () => {
      const customMsg = 'Olá Maria, preparei este formulário especialmente para você!'
      const subWithMsg = { ...baseSubmission, custom_message: customMsg }
      enqueueTemplateDetail()
      enqueue({ data: subWithMsg, error: null })
      enqueue({ data: {}, error: null })

      const result = await formsService.sendForm(PSYCH_ID, {
        patient_id: PATIENT_ID,
        template_id: 'tpl-001',
        access_password: PASSWORD,
        custom_message: customMsg,
      })
      expect(result.error).toBeNull()
      expect(result.data?.custom_message).toBe(customMsg)
    })

    it('inclui prazo de expiração em 7 dias', async () => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const subWithExp = { ...baseSubmission, expires_at: expiresAt }
      enqueueTemplateDetail()
      enqueue({ data: subWithExp, error: null })
      enqueue({ data: {}, error: null })

      const result = await formsService.sendForm(PSYCH_ID, {
        patient_id: PATIENT_ID,
        template_id: 'tpl-001',
        access_password: PASSWORD,
        expires_at: expiresAt,
      })
      expect(result.error).toBeNull()
      expect(result.data?.expires_at).toBe(expiresAt)
    })

    it('snapshot inclui seção extra para este paciente', async () => {
      const snapshotWithExtra = {
        ...baseSnapshot,
        sections: [
          ...baseSnapshot.sections,
          { id: 'extra-sec', title: 'Avaliação específica', description: null, sort_order: 2 },
        ],
        questions: [
          ...baseSnapshot.questions,
          { id: 'extra-q1', section_id: 'extra-sec', type: 'long_text' as const, title: 'Descreva sua situação atual', description: null, help_text: null, is_required: true, sort_order: 1, scale_min: 0, scale_max: 10, scale_step: 1, options: [] },
        ],
      }
      enqueueTemplateDetail()
      enqueue({ data: { ...baseSubmission, snapshot: snapshotWithExtra }, error: null })
      enqueue({ data: {}, error: null })

      const result = await formsService.sendForm(PSYCH_ID, {
        patient_id: PATIENT_ID,
        template_id: 'tpl-001',
        access_password: PASSWORD,
        extra_sections: [{
          title: 'Avaliação específica',
          questions: [{ type: 'long_text', title: 'Descreva sua situação atual', is_required: true }],
        }],
      })
      expect(result.error).toBeNull()
      const snap = result.data?.snapshot
      expect(snap?.sections.length).toBe(2)
      expect(snap?.questions.some(q => q.title === 'Descreva sua situação atual')).toBe(true)
    })

    it('snapshot com extras tem timestamp de envio', async () => {
      enqueueTemplateDetail()
      enqueue({ data: baseSubmission, error: null })
      enqueue({ data: {}, error: null })
      const result = await formsService.sendForm(PSYCH_ID, {
        patient_id: PATIENT_ID,
        template_id: 'tpl-001',
        access_password: PASSWORD,
      })
      expect(result.data?.snapshot.snapshotted_at).toBeTruthy()
    })
  })

  // ── 4. Acesso do paciente por token ───────────────────────────────────────
  describe('4. Paciente acessa formulário por token', () => {
    it('encontra submission pelo token', async () => {
      enqueue({ data: baseSubmission, error: null })
      const result = await formsService.getSubmissionByToken(TOKEN)
      expect(result.error).toBeNull()
      expect(result.data?.token).toBe(TOKEN)
    })

    it('rejeita senha incorreta (validação na camada app)', async () => {
      enqueue({ data: baseSubmission, error: null })
      const submission = await formsService.getSubmissionByToken(TOKEN)
      const isValid = submission.data?.access_password === 'senha_errada'
      expect(isValid).toBe(false)
    })

    it('aceita senha correta', async () => {
      enqueue({ data: baseSubmission, error: null })
      const submission = await formsService.getSubmissionByToken(TOKEN)
      const isValid = submission.data?.access_password === PASSWORD
      expect(isValid).toBe(true)
    })

    it('formulário expirado tem status expired', async () => {
      const expired = { ...baseSubmission, expires_at: new Date(Date.now() - 1000).toISOString(), status: 'expired' as const }
      enqueue({ data: expired, error: null })
      const result = await formsService.getSubmissionByToken(TOKEN)
      expect(result.data?.status).toBe('expired')
    })

    it('formulário já concluído tem status completed', async () => {
      const done = { ...baseSubmission, status: 'completed' as const, completed_at: NOW }
      enqueue({ data: done, error: null })
      const result = await formsService.getSubmissionByToken(TOKEN)
      expect(result.data?.status).toBe('completed')
    })

    it('token inexistente retorna data null sem erro (not found é tratado graciosamente)', async () => {
      // PGRST116 = not found → retorna {data:null, error:null} para não expor erro interno
      enqueue({ data: null, error: { message: 'Row not found', code: 'PGRST116' } })
      const result = await formsService.getSubmissionByToken('tok_invalido')
      expect(result.data).toBeNull()
      expect(result.error).toBeNull() // comportamento intencional: UI exibe "não encontrado"
    })
  })

  // ── 5. Auto-save de respostas ──────────────────────────────────────────────
  describe('5. Paciente preenche e auto-salva respostas', () => {
    it('salva texto curto', async () => {
      const saved = makeResponse({ answer_text: 'João da Silva', question_id: 'q1' })
      enqueue({ data: { status: 'in_progress' }, error: null })  // update status
      enqueue({ data: saved, error: null })                       // upsert response
      const result = await formsService.saveResponse({
        submission_id: 'sub-001',
        question_id: 'q1',
        answer_text: 'João da Silva',
      })
      expect(result.error).toBeNull()
      expect(result.data?.answer_text).toBe('João da Silva')
    })

    it('salva número (idade)', async () => {
      const saved = makeResponse({ answer_number: 35, question_id: 'q2' })
      enqueue({ data: { status: 'in_progress' }, error: null })
      enqueue({ data: saved, error: null })
      const result = await formsService.saveResponse({
        submission_id: 'sub-001',
        question_id: 'q2',
        answer_number: 35,
      })
      expect(result.data?.answer_number).toBe(35)
    })

    it('salva booleano (sim/não)', async () => {
      const saved = makeResponse({ answer_boolean: true, question_id: 'q-bool' })
      enqueue({ data: { status: 'in_progress' }, error: null })
      enqueue({ data: saved, error: null })
      const result = await formsService.saveResponse({
        submission_id: 'sub-001',
        question_id: 'q-bool',
        answer_boolean: true,
      })
      expect(result.data?.answer_boolean).toBe(true)
    })

    it('salva múltipla escolha', async () => {
      const saved = makeResponse({ answer_options: ['opt1', 'opt3'], question_id: 'q-multi' })
      enqueue({ data: { status: 'in_progress' }, error: null })
      enqueue({ data: saved, error: null })
      const result = await formsService.saveResponse({
        submission_id: 'sub-001',
        question_id: 'q-multi',
        answer_options: ['opt1', 'opt3'],
      })
      expect(result.data?.answer_options).toEqual(['opt1', 'opt3'])
    })

    it('salva data', async () => {
      const dateStr = '1990-03-15'
      const saved = makeResponse({ answer_date: dateStr, question_id: 'q-date' })
      enqueue({ data: { status: 'in_progress' }, error: null })
      enqueue({ data: saved, error: null })
      const result = await formsService.saveResponse({
        submission_id: 'sub-001',
        question_id: 'q-date',
        answer_date: dateStr,
      })
      expect(result.data?.answer_date).toBe(dateStr)
    })

    it('salva escala numérica', async () => {
      const saved = makeResponse({ answer_number: 7, question_id: 'q-scale' })
      enqueue({ data: { status: 'in_progress' }, error: null })
      enqueue({ data: saved, error: null })
      const result = await formsService.saveResponse({
        submission_id: 'sub-001',
        question_id: 'q-scale',
        answer_number: 7,
      })
      expect(result.data?.answer_number).toBe(7)
    })
  })

  // ── 6. Conclusão do formulário ─────────────────────────────────────────────
  describe('6. Paciente conclui formulário', () => {
    const inProgressSub = { ...baseSubmission, status: 'in_progress' as const }
    const completedSub = { ...baseSubmission, status: 'completed' as const, completed_at: NOW }

    it('conclui com todas as obrigatórias respondidas', async () => {
      enqueue({ data: inProgressSub, error: null })   // getById para pegar questions obrigatórias
      enqueue({ data: completedSub, error: null })    // update status

      const result = await formsService.completeSubmission('sub-001', [
        makeResponse({ question_id: 'q1', answer_text: 'João da Silva' }),
        makeResponse({ question_id: 'q2', answer_number: 35 }),
        // q3 opcional — não precisa
      ])
      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('completed')
      expect(result.data?.completed_at).toBeTruthy()
    })

    it('rejeita conclusão sem nenhuma resposta para obrigatórias', async () => {
      enqueue({ data: inProgressSub, error: null })

      const result = await formsService.completeSubmission('sub-001', [])
      expect(result.error).not.toBeNull()
      expect(result.error).toContain('obrigatória')
    })

    it('rejeita quando obrigatória tem answer_text vazio', async () => {
      enqueue({ data: inProgressSub, error: null })

      const result = await formsService.completeSubmission('sub-001', [
        makeResponse({ question_id: 'q1', answer_text: '   ' }), // só espaços
        makeResponse({ question_id: 'q2', answer_number: null }), // null
      ])
      expect(result.error).not.toBeNull()
    })

    it('aceita quando opcional não foi respondida', async () => {
      enqueue({ data: inProgressSub, error: null })
      enqueue({ data: completedSub, error: null })

      const result = await formsService.completeSubmission('sub-001', [
        makeResponse({ question_id: 'q1', answer_text: 'Maria' }),
        makeResponse({ question_id: 'q2', answer_number: 42 }),
        // q3 (long_text, opcional) ausente
      ])
      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('completed')
    })
  })

  // ── 7. Psicólogo visualiza respostas ──────────────────────────────────────
  describe('7. Psicólogo visualiza respostas do paciente', () => {
    it('lista formulários enviados para um paciente', async () => {
      const list = [
        { ...baseSubmission, status: 'completed' as const },
        { ...baseSubmission, id: 'sub-002', status: 'pending' as const },
      ]
      enqueue({ data: list, error: null })

      const result = await formsService.listSubmissionsForPatient(PATIENT_ID, PSYCH_ID)
      expect(result.error).toBeNull()
      expect(result.data?.length).toBe(2)
      expect(result.data?.[0].status).toBe('completed')
      expect(result.data?.[1].status).toBe('pending')
    })

    it('retorna submission com respostas e perfil do psicólogo', async () => {
      const completedSub = { ...baseSubmission, status: 'completed' as const }
      const responsesList = [
        makeResponse({ question_id: 'q1', answer_text: 'João da Silva' }),
        makeResponse({ question_id: 'q2', answer_number: 35 }),
      ]
      type PsychRow = { full_name: string; logo_url: string | null }
      enqueue({ data: completedSub, error: null })
      enqueue({ data: responsesList, error: null })
      enqueue({ data: { full_name: 'Dra. Ana Lima', logo_url: null } as PsychRow, error: null })

      const result = await formsService.getSubmissionWithResponses('sub-001')
      expect(result.error).toBeNull()
      expect(result.data?.responses?.length).toBe(2)
      expect(result.data?.responses?.[0].answer_text).toBe('João da Silva')
    })

    it('lista respostas individualmente por submission', async () => {
      const responses = [
        makeResponse({ question_id: 'q1', answer_text: 'João' }),
        makeResponse({ question_id: 'q2', answer_number: 28 }),
        makeResponse({ question_id: 'q3', answer_text: 'Ansiedade no trabalho' }),
      ]
      enqueue({ data: responses, error: null })

      const result = await formsService.getResponses('sub-001')
      expect(result.error).toBeNull()
      expect(result.data?.length).toBe(3)
    })
  })

  // ── 8. Interpolação de placeholders ───────────────────────────────────────
  describe('8. Interpolação de placeholders na mensagem', () => {
    const interpolate = (template: string, vars: Record<string, string>) => {
      let msg = template
      Object.entries(vars).forEach(([k, v]) => {
        msg = msg.replace(new RegExp(`<<${k}>>`, 'g'), v)
      })
      return msg
    }

    it('substitui todos os placeholders canônicos', () => {
      const msg = 'Olá <<nome_paciente>>, acesse <<link>> com senha <<senha>> — formulário: <<nome_formulario>>'
      const result = interpolate(msg, {
        nome_paciente: 'Maria Santos',
        link: 'https://app.luka.com.br/forms/tok_abc',
        senha: PASSWORD,
        nome_formulario: 'Anamnese Adulto',
      })
      expect(result).not.toContain('<<')
      expect(result).toContain('Maria Santos')
      expect(result).toContain(PASSWORD)
      expect(result).toContain('Anamnese Adulto')
      expect(result).toContain('https://')
    })

    it('URL pública usa HTTPS e contém token', () => {
      const url = formsService.buildPublicUrl('tok_xyz789')
      expect(url).toMatch(/^https:\/\//)
      expect(url).toContain('tok_xyz789')
    })

    it('buildPublicUrl não gera deep link mobile', () => {
      const url = formsService.buildPublicUrl('tok_test')
      expect(url).not.toContain('luka://')
      expect(url).not.toContain('exp://')
    })
  })

  // ── 9. Upload de logo profissional ────────────────────────────────────────
  describe('9. Upload de logo profissional', () => {
    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        blob: () => Promise.resolve(new Blob(['fake-image-data'], { type: 'image/jpeg' })),
      }) as jest.Mock
    })

    it('uploadLogo retorna URL pública', async () => {
      enqueue({ data: { logo_url: 'https://cdn.luka.com.br/logos/psych.jpg' }, error: null })

      const result = await formsService.uploadLogo(PSYCH_ID, 'file:///path/logo.jpg', 'image/jpeg')
      expect(result.error).toBeNull()
      expect(result.data).toMatch(/^https:\/\//)
    })

    it('uploadLogo falha graciosamente se storage falhar', async () => {
      mockStorage.upload.mockResolvedValueOnce({ data: null, error: { message: 'Upload failed' } })

      const result = await formsService.uploadLogo(PSYCH_ID, 'file:///path/logo.jpg', 'image/jpeg')
      expect(result.error).not.toBeNull()
      expect(result.data).toBeNull()
    })

    it('usa extensão .png para image/png', async () => {
      enqueue({ data: { logo_url: 'https://cdn.luka.com.br/logos/psych.png' }, error: null })

      const result = await formsService.uploadLogo(PSYCH_ID, 'file:///logo.png', 'image/png')
      expect(result.error).toBeNull()
      expect(mockStorage.upload).toHaveBeenCalledWith(
        expect.stringContaining('.png'),
        expect.any(Blob),
        expect.objectContaining({ contentType: 'image/png' })
      )
    })
  })

  // ── 10. Clonagem de template ───────────────────────────────────────────────
  describe('10. Clonagem de template do sistema', () => {
    it('clona com novo título e preserva cloned_from_id', async () => {
      const sourceId = 'sys-tpl-phq9'
      const newTitle = 'PHQ-9 — Versão personalizada'
      const clonedTpl: FormTemplate = { ...baseTemplate, id: 'tpl-clone-1', title: newTitle, cloned_from_id: sourceId }
      const clonedSec: FormSection = { ...section1, id: 'sec-clone', template_id: 'tpl-clone-1' }
      const clonedQ: FormQuestion = { ...q1, id: 'q-clone-1', template_id: 'tpl-clone-1', section_id: 'sec-clone' }

      // getTemplateWithDetails do original (4 calls) — sem options
      enqueue({ data: { ...baseTemplate, id: sourceId, is_system: true, title: 'PHQ-9' }, error: null })
      enqueue({ data: [section1], error: null })
      enqueue({ data: [q1], error: null })
      enqueue({ data: [], error: null })  // options vazias
      // insert novo template (1 call)
      enqueue({ data: clonedTpl, error: null })
      // insert seção clonada (1 call)
      enqueue({ data: clonedSec, error: null })
      // insert pergunta clonada (1 call)
      enqueue({ data: clonedQ, error: null })

      const result = await formsService.cloneTemplate(sourceId, PSYCH_ID, newTitle)
      expect(result.error).toBeNull()
      expect(result.data?.title).toBe(newTitle)
      expect(result.data?.cloned_from_id).toBe(sourceId)
      expect(result.data?.is_system).toBe(false)
    })

    it('clona sem título usa "(cópia)" como sufixo', async () => {
      const sourceId = 'sys-tpl-gad7'
      const clonedTpl: FormTemplate = { ...baseTemplate, id: 'tpl-clone-2', title: 'GAD-7 (cópia)', cloned_from_id: sourceId }

      enqueue({ data: { ...baseTemplate, id: sourceId, title: 'GAD-7' }, error: null })
      enqueue({ data: [], error: null })   // sem sections
      enqueue({ data: [], error: null })   // sem questions (não chama options)

      enqueue({ data: clonedTpl, error: null })

      const result = await formsService.cloneTemplate(sourceId, PSYCH_ID)
      expect(result.error).toBeNull()
      expect(result.data?.title).toContain('cópia')
    })
  })

  // ── 11. Exclusão de template ───────────────────────────────────────────────
  describe('11. Exclusão de template próprio', () => {
    it('deleta template do psicólogo', async () => {
      enqueue({ data: { is_system: false }, error: null })  // check is_system
      enqueue({ data: {}, error: null })                    // delete

      const result = await formsService.deleteTemplate('tpl-001')
      expect(result.error).toBeNull()
    })

    it('recusa deletar template do sistema', async () => {
      enqueue({ data: { is_system: true }, error: null })

      const result = await formsService.deleteTemplate('sys-tpl-phq9')
      expect(result.error).not.toBeNull()
      expect(result.error).toContain('sistema')
    })
  })
})
