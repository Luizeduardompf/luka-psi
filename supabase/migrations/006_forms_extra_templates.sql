-- ============================================================
-- Luka — Migration 006: Templates clínicos adicionais
-- PSS-10, BAI, AUDIT, Rosenberg, Nota de Sessão, Contrato
-- ============================================================

do $$
declare
  -- Template IDs
  pss_id     uuid := gen_random_uuid();
  bai_id     uuid := gen_random_uuid();
  audit_id   uuid := gen_random_uuid();
  rosen_id   uuid := gen_random_uuid();
  sessao_id  uuid := gen_random_uuid();
  contrato_id uuid := gen_random_uuid();

  -- Section IDs
  s1 uuid; s2 uuid; s3 uuid; s4 uuid; s5 uuid; s6 uuid;

  send_msg text := E'Olá <<nome_paciente>>, tudo bem?\n\nSeu(sua) psicólogo(a) enviou um formulário para você preencher.\n\n📋 Formulário: <<nome_formulario>>\n🔗 Link de acesso: <<link>>\n🔑 Senha: <<senha>>\n\nPreencha com calma e honestidade. Suas respostas são confidenciais.';

begin

-- ─────────────────────────────────────────────────────────────
-- 1. PSS-10 — Escala de Estresse Percebido
-- ─────────────────────────────────────────────────────────────
insert into form_templates (id, psychologist_id, title, description, send_message, is_system, is_archived, sort_order)
values (pss_id, null,
  'PSS-10 — Escala de Estresse Percebido',
  'Avalia o grau em que situações da vida são percebidas como estressantes nos últimos 30 dias. Pontuação 0–40: 0-13 (baixo), 14-26 (moderado), 27-40 (alto).',
  send_msg, true, false, 5);

s1 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s1, pss_id, 'Instruções', 'As perguntas abaixo referem-se aos seus sentimentos e pensamentos durante o último mês. Responda com qual frequência você se sentiu dessa forma.', 1);

s2 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s2, pss_id, 'Questões', null, 2);

-- Questões PSS-10 (escala 0=Nunca a 4=Sempre)
do $inner$
declare q uuid;
questions text[] := array[
  'Com que frequência você ficou chateado(a) por causa de algo que aconteceu inesperadamente?',
  'Com que frequência você se sentiu incapaz de controlar as coisas importantes da sua vida?',
  'Com que frequência você se sentiu nervoso(a) e estressado(a)?',
  'Com que frequência você se sentiu confiante para lidar com seus problemas pessoais?',
  'Com que frequência você sentiu que as coisas estavam indo ao seu favor?',
  'Com que frequência você percebeu que não conseguia lidar com todas as coisas que precisava fazer?',
  'Com que frequência você conseguiu controlar as irritações na sua vida?',
  'Com que frequência você sentiu que estava por cima das situações?',
  'Com que frequência você ficou bravo(a) por causa de coisas que estavam fora de seu controle?',
  'Com que frequência você sentiu que as dificuldades se acumulavam tanto que não conseguia superá-las?'
];
labels text[] := array['0 – Nunca','1 – Quase nunca','2 – Às vezes','3 – Com alguma frequência','4 – Muito frequentemente'];
i int;
begin
  for i in 1..array_length(questions, 1) loop
    q := gen_random_uuid();
    insert into form_questions (id, template_id, section_id, type, title, is_required, sort_order, scale_min, scale_max, scale_step)
    values (q, pss_id, s2, 'scale', questions[i], true, i, 0, 4, 1);
    insert into form_question_options (id, question_id, label, sort_order)
    select gen_random_uuid(), q, unnest(labels), generate_series(1, 5);
  end loop;
end $inner$;

-- ─────────────────────────────────────────────────────────────
-- 2. BAI — Inventário de Ansiedade de Beck
-- ─────────────────────────────────────────────────────────────
insert into form_templates (id, psychologist_id, title, description, send_message, is_system, is_archived, sort_order)
values (bai_id, null,
  'BAI — Inventário de Ansiedade de Beck',
  'Mede a gravidade dos sintomas de ansiedade na última semana. Pontuação 0–63: 0-7 (mínima), 8-15 (leve), 16-25 (moderada), 26-63 (grave).',
  send_msg, true, false, 6);

s1 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s1, bai_id, 'Instruções', 'Abaixo está uma lista de sintomas comuns de ansiedade. Por favor, leia cada item com atenção. Indique o quanto você foi incomodado(a) por cada sintoma durante a última semana, incluindo hoje.', 1);

s2 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s2, bai_id, 'Sintomas', null, 2);

do $inner$
declare q uuid;
symptoms text[] := array[
  'Dormência ou formigamento',
  'Sensação de calor',
  'Tremor nas pernas',
  'Incapaz de relaxar',
  'Medo que aconteça o pior',
  'Atordoado(a) ou tonto(a)',
  'Palpitação ou aceleração do coração',
  'Sem equilíbrio',
  'Aterrorizado(a)',
  'Nervoso(a)',
  'Sensação de sufocamento',
  'Mãos tremendo',
  'Trêmulo(a)',
  'Medo de perder o controle',
  'Dificuldade de respirar',
  'Medo de morrer',
  'Assustado(a)',
  'Indigestão ou desconforto no abdômen',
  'Sensação de desmaio',
  'Rosto afogueado',
  'Suor (não devido ao calor)'
];
i int;
begin
  for i in 1..array_length(symptoms, 1) loop
    q := gen_random_uuid();
    insert into form_questions (id, template_id, section_id, type, title, is_required, sort_order, scale_min, scale_max, scale_step)
    values (q, bai_id, s2, 'scale', symptoms[i], true, i, 0, 3, 1);
    insert into form_question_options (id, question_id, label, sort_order) values
      (gen_random_uuid(), q, '0 – Absolutamente não', 1),
      (gen_random_uuid(), q, '1 – Levemente (não me incomodou muito)', 2),
      (gen_random_uuid(), q, '2 – Moderadamente (foi muito desagradável, mas pude suportar)', 3),
      (gen_random_uuid(), q, '3 – Gravemente (quase não pude suportar)', 4);
  end loop;
end $inner$;

-- ─────────────────────────────────────────────────────────────
-- 3. AUDIT — Teste de Identificação de Transtornos por Uso de Álcool
-- ─────────────────────────────────────────────────────────────
insert into form_templates (id, psychologist_id, title, description, send_message, is_system, is_archived, sort_order)
values (audit_id, null,
  'AUDIT — Uso de Álcool (OMS)',
  'Instrumento da OMS para identificar uso nocivo e dependência de álcool. 10 questões. Pontuação ≥8 indica risco.',
  send_msg, true, false, 7);

s1 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s1, audit_id, 'Consumo de álcool', 'Responda sobre seu consumo de bebidas alcoólicas nos últimos 12 meses.', 1);

s2 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s2, audit_id, 'Dependência e problemas', null, 2);

-- Q1
do $inner$
declare q1 uuid := gen_random_uuid();
begin
  insert into form_questions (id, template_id, section_id, type, title, is_required, sort_order)
  values (q1, audit_id, s1, 'single_choice', 'Com que frequência você consome bebidas que contêm álcool?', true, 1);
  insert into form_question_options (id, question_id, label, sort_order) values
    (gen_random_uuid(), q1, '0 – Nunca', 1),
    (gen_random_uuid(), q1, '1 – Mensalmente ou menos', 2),
    (gen_random_uuid(), q1, '2 – De 2 a 4 vezes por mês', 3),
    (gen_random_uuid(), q1, '3 – De 2 a 3 vezes por semana', 4),
    (gen_random_uuid(), q1, '4 – 4 ou mais vezes por semana', 5);
end $inner$;

-- Q2
do $inner$
declare q2 uuid := gen_random_uuid();
begin
  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (q2, audit_id, s1, 'single_choice', 'Quantas doses você consome num dia típico quando está bebendo?', 'Uma dose = 1 lata de cerveja, 1 taça de vinho, 1 dose de destilado', true, 2);
  insert into form_question_options (id, question_id, label, sort_order) values
    (gen_random_uuid(), q2, '0 – 1 ou 2', 1),
    (gen_random_uuid(), q2, '1 – 3 ou 4', 2),
    (gen_random_uuid(), q2, '2 – 5 ou 6', 3),
    (gen_random_uuid(), q2, '3 – 7 a 9', 4),
    (gen_random_uuid(), q2, '4 – 10 ou mais', 5);
end $inner$;

-- Q3
do $inner$
declare q3 uuid := gen_random_uuid();
begin
  insert into form_questions (id, template_id, section_id, type, title, is_required, sort_order)
  values (q3, audit_id, s1, 'single_choice', 'Com que frequência você consome 6 ou mais doses numa única ocasião?', true, 3);
  insert into form_question_options (id, question_id, label, sort_order) values
    (gen_random_uuid(), q3, '0 – Nunca', 1),
    (gen_random_uuid(), q3, '1 – Menos de uma vez por mês', 2),
    (gen_random_uuid(), q3, '2 – Mensalmente', 3),
    (gen_random_uuid(), q3, '3 – Semanalmente', 4),
    (gen_random_uuid(), q3, '4 – Todos os dias ou quase todos os dias', 5);
end $inner$;

-- Q4-Q6 (dependência)
do $inner$
declare q uuid;
qtitles text[] := array[
  'Com que frequência, durante o último ano, você achou que não conseguia parar de beber depois que começou?',
  'Com que frequência, durante o último ano, o efeito do álcool fez com que você não conseguisse fazer o que era esperado de você?',
  'Com que frequência, durante o último ano, você precisou beber pela manhã para se sentir bem depois de ter bebido muito?'
];
i int;
begin
  for i in 1..3 loop
    q := gen_random_uuid();
    insert into form_questions (id, template_id, section_id, type, title, is_required, sort_order)
    values (q, audit_id, s2, 'single_choice', qtitles[i], true, 3 + i);
    insert into form_question_options (id, question_id, label, sort_order) values
      (gen_random_uuid(), q, '0 – Nunca', 1),
      (gen_random_uuid(), q, '1 – Menos de uma vez por mês', 2),
      (gen_random_uuid(), q, '2 – Mensalmente', 3),
      (gen_random_uuid(), q, '3 – Semanalmente', 4),
      (gen_random_uuid(), q, '4 – Todos os dias ou quase todos os dias', 5);
  end loop;
end $inner$;

-- Q7-Q8
do $inner$
declare q uuid;
qtitles text[] := array[
  'Com que frequência, durante o último ano, você se sentiu culpado(a) ou com remorso depois de beber?',
  'Com que frequência, durante o último ano, você foi incapaz de lembrar o que aconteceu à noite anterior porque você tinha bebido?'
];
i int;
begin
  for i in 1..2 loop
    q := gen_random_uuid();
    insert into form_questions (id, template_id, section_id, type, title, is_required, sort_order)
    values (q, audit_id, s2, 'single_choice', qtitles[i], true, 6 + i);
    insert into form_question_options (id, question_id, label, sort_order) values
      (gen_random_uuid(), q, '0 – Nunca', 1),
      (gen_random_uuid(), q, '1 – Menos de uma vez por mês', 2),
      (gen_random_uuid(), q, '2 – Mensalmente', 3),
      (gen_random_uuid(), q, '3 – Semanalmente', 4),
      (gen_random_uuid(), q, '4 – Todos os dias ou quase todos os dias', 5);
  end loop;
end $inner$;

-- Q9
do $inner$
declare q9 uuid := gen_random_uuid();
begin
  insert into form_questions (id, template_id, section_id, type, title, is_required, sort_order)
  values (q9, audit_id, s2, 'single_choice', 'Você ou alguém já se machucou porque você bebeu?', true, 9);
  insert into form_question_options (id, question_id, label, sort_order) values
    (gen_random_uuid(), q9, '0 – Não', 1),
    (gen_random_uuid(), q9, '2 – Sim, mas não nos últimos 12 meses', 2),
    (gen_random_uuid(), q9, '4 – Sim, nos últimos 12 meses', 3);
end $inner$;

-- Q10
do $inner$
declare q10 uuid := gen_random_uuid();
begin
  insert into form_questions (id, template_id, section_id, type, title, is_required, sort_order)
  values (q10, audit_id, s2, 'single_choice', 'Algum familiar, amigo, médico ou profissional de saúde já se preocupou com o seu modo de beber ou sugeriu que você reduzisse?', true, 10);
  insert into form_question_options (id, question_id, label, sort_order) values
    (gen_random_uuid(), q10, '0 – Não', 1),
    (gen_random_uuid(), q10, '2 – Sim, mas não nos últimos 12 meses', 2),
    (gen_random_uuid(), q10, '4 – Sim, nos últimos 12 meses', 3);
end $inner$;

-- ─────────────────────────────────────────────────────────────
-- 4. Escala de Autoestima de Rosenberg
-- ─────────────────────────────────────────────────────────────
insert into form_templates (id, psychologist_id, title, description, send_message, is_system, is_archived, sort_order)
values (rosen_id, null,
  'Escala de Autoestima de Rosenberg',
  'Mede a autoestima global com 10 afirmações. Pontuação 0–30: 0-14 (baixa), 15-25 (média), 26-30 (alta).',
  send_msg, true, false, 8);

s1 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s1, rosen_id, 'Instruções', 'Para cada afirmação abaixo, indique o quanto você concorda ou discorda.', 1);

s2 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s2, rosen_id, 'Afirmações', null, 2);

do $inner$
declare q uuid;
items text[] := array[
  'De um modo geral, estou satisfeito(a) comigo mesmo(a).',
  'Às vezes, eu acho que não presto para nada.',
  'Eu acho que eu tenho muitas boas qualidades.',
  'Eu sou capaz de fazer coisas tão bem quanto a maioria das pessoas.',
  'Eu acho que não tenho muito do que me orgulhar.',
  'Às vezes, eu me sinto inútil.',
  'Eu me sinto uma pessoa de valor, pelo menos do mesmo nível que as outras pessoas.',
  'Eu gostaria de poder ter mais respeito por mim mesmo(a).',
  'De tudo, eu me inclino a achar que sou um fracasso.',
  'Eu tenho uma atitude positiva com relação a mim mesmo(a).'
];
i int;
begin
  for i in 1..10 loop
    q := gen_random_uuid();
    insert into form_questions (id, template_id, section_id, type, title, is_required, sort_order, scale_min, scale_max, scale_step)
    values (q, rosen_id, s2, 'scale', items[i], true, i, 0, 3, 1);
    insert into form_question_options (id, question_id, label, sort_order) values
      (gen_random_uuid(), q, '0 – Discordo totalmente', 1),
      (gen_random_uuid(), q, '1 – Discordo', 2),
      (gen_random_uuid(), q, '2 – Concordo', 3),
      (gen_random_uuid(), q, '3 – Concordo totalmente', 4);
  end loop;
end $inner$;

-- ─────────────────────────────────────────────────────────────
-- 5. Nota de Sessão (SOAP)
-- ─────────────────────────────────────────────────────────────
insert into form_templates (id, psychologist_id, title, description, send_message, is_system, is_archived, sort_order)
values (sessao_id, null,
  'Nota de Sessão — Relatório do Paciente',
  'Formulário pós-sessão para o paciente registrar percepções, humor e pontos de trabalho. Complementa as notas clínicas do psicólogo.',
  send_msg, true, false, 9);

s1 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s1, sessao_id, 'Como você está hoje', null, 1);

s2 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s2, sessao_id, 'Sobre a sessão', null, 2);

s3 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s3, sessao_id, 'Para a próxima semana', null, 3);

do $inner$
declare q uuid;
begin
  -- Q1: Humor atual
  q := gen_random_uuid();
  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order, scale_min, scale_max, scale_step)
  values (q, sessao_id, s1, 'scale', 'Como você avalia seu humor hoje?', '1 = muito mal, 10 = excelente', true, 1, 1, 10, 1);

  -- Q2: O que trouxe hoje
  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (gen_random_uuid(), sessao_id, s1, 'long_text', 'O que você trouxe de mais importante para a sessão de hoje?', null, true, 2);

  -- Q3: Acontecimentos desde última sessão
  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (gen_random_uuid(), sessao_id, s1, 'long_text', 'Algo importante aconteceu desde a última sessão?', null, false, 3);

  -- Q4: O que foi mais útil
  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (gen_random_uuid(), sessao_id, s2, 'long_text', 'O que foi mais útil ou significativo na sessão de hoje?', null, false, 4);

  -- Q5: O que não foi útil ou ficou incompleto
  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (gen_random_uuid(), sessao_id, s2, 'long_text', 'Algo que não foi abordado ou que você gostaria de explorar mais?', null, false, 5);

  -- Q6: Satisfação com a sessão
  q := gen_random_uuid();
  insert into form_questions (id, template_id, section_id, type, title, is_required, sort_order, scale_min, scale_max, scale_step)
  values (q, sessao_id, s2, 'scale', 'Como você avalia a sessão de hoje?', true, 6, 1, 10, 1);

  -- Q7: Tarefa / compromisso
  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (gen_random_uuid(), sessao_id, s3, 'long_text', 'Qual tarefa ou reflexão você se compromete a fazer antes da próxima sessão?', null, false, 7);

  -- Q8: Algo a dizer ao psicólogo
  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (gen_random_uuid(), sessao_id, s3, 'long_text', 'Há algo que você queira dizer ao seu psicólogo mas tem dificuldade de falar na sessão?', null, false, 8);
end $inner$;

-- ─────────────────────────────────────────────────────────────
-- 6. Contrato Terapêutico
-- ─────────────────────────────────────────────────────────────
insert into form_templates (id, psychologist_id, title, description, send_message, is_system, is_archived, sort_order)
values (contrato_id, null,
  'Contrato Terapêutico',
  'Documento inicial que formaliza o acordo entre psicólogo e paciente: objetivos, regras de cancelamento, sigilo e consentimento.',
  send_msg, true, false, 10);

s1 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s1, contrato_id, 'Identificação', null, 1);

s2 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s2, contrato_id, 'Objetivos da terapia', null, 2);

s3 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s3, contrato_id, 'Regras e combinados', null, 3);

s4 := gen_random_uuid();
insert into form_sections (id, template_id, title, description, sort_order)
values (s4, contrato_id, 'Consentimento', null, 4);

do $inner$
declare q uuid;
begin
  -- Identificação
  insert into form_questions (id, template_id, section_id, type, title, is_required, sort_order)
  values (gen_random_uuid(), contrato_id, s1, 'short_text', 'Nome completo', true, 1);

  insert into form_questions (id, template_id, section_id, type, title, is_required, sort_order)
  values (gen_random_uuid(), contrato_id, s1, 'date', 'Data de nascimento', true, 2);

  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (gen_random_uuid(), contrato_id, s1, 'short_text', 'Como prefere ser chamado(a) nas sessões?', null, false, 3);

  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (gen_random_uuid(), contrato_id, s1, 'short_text', 'Quem indicou / como chegou até aqui?', null, false, 4);

  -- Objetivos
  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (gen_random_uuid(), contrato_id, s2, 'long_text', 'O que te trouxe até a terapia agora?', 'Descreva com suas palavras o que está sentindo ou vivendo.', true, 5);

  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (gen_random_uuid(), contrato_id, s2, 'long_text', 'O que você espera alcançar com a terapia?', 'Quais mudanças ou resultados você gostaria de ver?', false, 6);

  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (gen_random_uuid(), contrato_id, s2, 'long_text', 'Você já fez terapia antes? Se sim, como foi a experiência?', null, false, 7);

  -- Regras
  q := gen_random_uuid();
  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (q, contrato_id, s3, 'single_choice',
    'Li e compreendi as regras de cancelamento (avisar com mínimo 24h de antecedência).',
    'Sessões canceladas com menos de 24h de antecedência podem ser cobradas integralmente.',
    true, 8);
  insert into form_question_options (id, question_id, label, sort_order) values
    (gen_random_uuid(), q, 'Sim, concordo', 1),
    (gen_random_uuid(), q, 'Tenho dúvidas e gostaria de conversar sobre isso', 2);

  q := gen_random_uuid();
  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (q, contrato_id, s3, 'single_choice',
    'Compreendo que as sessões têm duração de 50 minutos e frequência semanal.',
    null, true, 9);
  insert into form_question_options (id, question_id, label, sort_order) values
    (gen_random_uuid(), q, 'Sim, concordo', 1),
    (gen_random_uuid(), q, 'Preciso de ajuste — vou conversar com o psicólogo', 2);

  -- Consentimento
  q := gen_random_uuid();
  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (q, contrato_id, s4, 'boolean',
    'Consinto com o sigilo e a confidencialidade das informações compartilhadas nas sessões.',
    'As informações são sigilosas, exceto nos casos previstos em lei (risco iminente de vida).',
    true, 10);

  q := gen_random_uuid();
  insert into form_questions (id, template_id, section_id, type, title, description, is_required, sort_order)
  values (q, contrato_id, s4, 'boolean',
    'Autorizo o uso das informações para fins de supervisão clínica (sempre de forma anônima).',
    'A supervisão é uma prática que garante a qualidade do atendimento.',
    false, 11);

  q := gen_random_uuid();
  insert into form_questions (id, template_id, section_id, type, title, is_required, sort_order)
  values (q, contrato_id, s4, 'single_choice',
    'Confirmo que li e concordo com todos os termos acima e desejo iniciar o processo terapêutico.',
    true, 12);
  insert into form_question_options (id, question_id, label, sort_order) values
    (gen_random_uuid(), q, 'Sim, confirmo', 1),
    (gen_random_uuid(), q, 'Tenho dúvidas que preciso esclarecer antes', 2);

end $inner$;

end $$;
