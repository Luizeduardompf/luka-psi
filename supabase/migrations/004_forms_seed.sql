-- ============================================================
-- Luka — Migration 004: Seeds — Templates clínicos de sistema
-- 4 formulários realistas: Anamnese Adulto, Anamnese Infantil,
-- GAD-7 (Ansiedade) e PHQ-9 (Depressão)
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- TEMPLATE 1: Anamnese de Adulto — Completa
-- ════════════════════════════════════════════════════════════
with t1 as (
  insert into form_templates (psychologist_id, title, description, send_message, is_system, is_archived, sort_order)
  values (
    null,
    'Anamnese de Adulto — Completa',
    'Formulário completo de anamnese para pacientes adultos. Abrange identificação, queixa principal, histórico de saúde mental, histórico médico, família e contexto de vida.',
    E'Olá <<nome_paciente>>, tudo bem?\n\nSeu(sua) psicólogo(a) enviou um formulário para você preencher antes da consulta.\n\n📋 Formulário: <<nome_formulario>>\n🔗 Link de acesso: <<link>>\n🔑 Senha: <<senha>>\n\nPreencha com calma e honestidade. Suas respostas são confidenciais.\n\nQualquer dúvida, estou à disposição.',
    true, false, 1
  )
  returning id
),
-- Seção 1
s1_1 as (
  insert into form_sections (template_id, title, description, sort_order)
  select id, 'Identificação', 'Informações básicas de identificação.', 1 from t1
  returning id, template_id
),
-- Seção 2
s1_2 as (
  insert into form_sections (template_id, title, description, sort_order)
  select id, 'Queixa Principal', 'O motivo que trouxe você à terapia.', 2 from t1
  returning id, template_id
),
-- Seção 3
s1_3 as (
  insert into form_sections (template_id, title, description, sort_order)
  select id, 'Histórico de Saúde Mental', 'Experiências anteriores com saúde mental.', 3 from t1
  returning id, template_id
),
-- Seção 4
s1_4 as (
  insert into form_sections (template_id, title, description, sort_order)
  select id, 'Histórico Médico', 'Condições de saúde física e medicamentos.', 4 from t1
  returning id, template_id
),
-- Seção 5
s1_5 as (
  insert into form_sections (template_id, title, description, sort_order)
  select id, 'Histórico Familiar', 'Contexto familiar e relações.', 5 from t1
  returning id, template_id
),
-- Seção 6
s1_6 as (
  insert into form_sections (template_id, title, description, sort_order)
  select id, 'Contexto Social e de Vida', 'Vida social, trabalho e expectativas.', 6 from t1
  returning id, template_id
),
-- Perguntas S1: Identificação
q1_01 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'short_text','Nome completo',true,1 from s1_1 s join (select template_id from s1_1) t on true returning id, template_id),
q1_02 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'date','Data de nascimento',true,2 from s1_1 s join (select template_id from s1_1) t on true returning id),
q1_03 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'single_choice','Gênero',true,3 from s1_1 s join (select template_id from s1_1) t on true returning id),
q1_04 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'single_choice','Estado civil',false,4 from s1_1 s join (select template_id from s1_1) t on true returning id),
q1_05 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'single_choice','Escolaridade',false,5 from s1_1 s join (select template_id from s1_1) t on true returning id),
q1_06 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'short_text','Profissão / Ocupação',false,6 from s1_1 s join (select template_id from s1_1) t on true returning id),
q1_07 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'short_text','Cidade / Estado',false,7 from s1_1 s join (select template_id from s1_1) t on true returning id),
-- Opções q1_03 Gênero
o1_03a as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_03),'Masculino',1) returning id),
o1_03b as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_03),'Feminino',2) returning id),
o1_03c as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_03),'Não-binário',3) returning id),
o1_03d as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_03),'Prefiro não informar',4) returning id),
-- Opções q1_04 Estado civil
o1_04a as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_04),'Solteiro(a)',1) returning id),
o1_04b as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_04),'Casado(a)',2) returning id),
o1_04c as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_04),'Divorciado(a)',3) returning id),
o1_04d as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_04),'Viúvo(a)',4) returning id),
o1_04e as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_04),'União estável',5) returning id),
-- Opções q1_05 Escolaridade
o1_05a as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_05),'Ensino Fundamental',1) returning id),
o1_05b as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_05),'Ensino Médio',2) returning id),
o1_05c as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_05),'Superior incompleto',3) returning id),
o1_05d as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_05),'Superior completo',4) returning id),
o1_05e as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_05),'Pós-graduação',5) returning id),
-- Perguntas S2: Queixa Principal
q1_08 as (insert into form_questions (template_id,section_id,type,title,help_text,is_required,sort_order) select t.template_id,s.id,'long_text','Qual é o motivo da sua consulta?','Descreva em suas próprias palavras o que te trouxe à terapia.',true,1 from s1_2 s join (select template_id from s1_2) t on true returning id),
q1_09 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'short_text','Há quanto tempo você sente isso?',false,2 from s1_2 s join (select template_id from s1_2) t on true returning id),
q1_10 as (insert into form_questions (template_id,section_id,type,title,help_text,is_required,sort_order) select t.template_id,s.id,'long_text','O que aconteceu que te fez procurar ajuda agora?','Pode ser um evento específico, uma mudança na sua vida, ou algo que foi aumentando.',false,3 from s1_2 s join (select template_id from s1_2) t on true returning id),
-- Perguntas S3: Histórico Saúde Mental
q1_11 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'boolean','Você já fez terapia ou acompanhamento psicológico antes?',true,1 from s1_3 s join (select template_id from s1_3) t on true returning id),
q1_12 as (insert into form_questions (template_id,section_id,type,title,help_text,is_required,sort_order) select t.template_id,s.id,'long_text','Se sim, por quanto tempo e por qual motivo?','Deixe em branco se não se aplica.',false,2 from s1_3 s join (select template_id from s1_3) t on true returning id),
q1_13 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'boolean','Você já recebeu algum diagnóstico psicológico ou psiquiátrico?',false,3 from s1_3 s join (select template_id from s1_3) t on true returning id),
q1_14 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'long_text','Se sim, qual diagnóstico?',false,4 from s1_3 s join (select template_id from s1_3) t on true returning id),
q1_15 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'boolean','Você faz uso de medicação psiquiátrica atualmente?',false,5 from s1_3 s join (select template_id from s1_3) t on true returning id),
q1_16 as (insert into form_questions (template_id,section_id,type,title,help_text,is_required,sort_order) select t.template_id,s.id,'short_text','Se sim, qual medicação e dosagem?','Ex: Escitalopram 10mg, Sertralina 50mg',false,6 from s1_3 s join (select template_id from s1_3) t on true returning id),
-- Perguntas S4: Histórico Médico
q1_17 as (insert into form_questions (template_id,section_id,type,title,help_text,is_required,sort_order) select t.template_id,s.id,'long_text','Você tem alguma condição médica diagnosticada?','Ex: diabetes, hipertensão, hipotireoidismo. Deixe em branco se não.',false,1 from s1_4 s join (select template_id from s1_4) t on true returning id),
q1_18 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'long_text','Faz uso de outros medicamentos? Quais?',false,2 from s1_4 s join (select template_id from s1_4) t on true returning id),
q1_19 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'short_text','Tem alergias a algum medicamento ou substância?',false,3 from s1_4 s join (select template_id from s1_4) t on true returning id),
q1_20 as (insert into form_questions (template_id,section_id,type,title,help_text,is_required,sort_order) select t.template_id,s.id,'long_text','Como está seu sono? Dorme bem? Quantas horas por noite?','Descreva sua qualidade de sono nos últimos tempos.',false,4 from s1_4 s join (select template_id from s1_4) t on true returning id),
q1_21 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'single_choice','Como está seu apetite?',false,5 from s1_4 s join (select template_id from s1_4) t on true returning id),
o1_21a as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_21),'Bom — como normalmente',1) returning id),
o1_21b as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_21),'Regular — algumas variações',2) returning id),
o1_21c as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_21),'Ruim — pouco apetite',3) returning id),
o1_21d as (insert into form_question_options(question_id,label,sort_order) values((select id from q1_21),'Muito alterado — excessivo ou muito reduzido',4) returning id),
-- Perguntas S5: Histórico Familiar
q1_22 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'short_text','Com quem você mora atualmente?',false,1 from s1_5 s join (select template_id from s1_5) t on true returning id),
q1_23 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'long_text','Relate brevemente sua relação com sua família de origem (pais, irmãos).',false,2 from s1_5 s join (select template_id from s1_5) t on true returning id),
q1_24 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'boolean','Há histórico de doenças mentais na sua família?',false,3 from s1_5 s join (select template_id from s1_5) t on true returning id),
q1_25 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'long_text','Se sim, relate quem e qual condição.',false,4 from s1_5 s join (select template_id from s1_5) t on true returning id),
q1_26 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'boolean','Você tem filhos?',true,5 from s1_5 s join (select template_id from s1_5) t on true returning id),
-- Perguntas S6: Contexto Social e de Vida
q1_27 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'long_text','Como você descreveria sua vida social? Tem amigos, pessoas próximas?',false,1 from s1_6 s join (select template_id from s1_6) t on true returning id),
q1_28 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'long_text','Você tem hobbies ou atividades de lazer? Quais?',false,2 from s1_6 s join (select template_id from s1_6) t on true returning id),
q1_29 as (insert into form_questions (template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'long_text','Como está sua vida profissional? Está trabalhando? Como se sente nela?',false,3 from s1_6 s join (select template_id from s1_6) t on true returning id),
q1_30 as (insert into form_questions (template_id,section_id,type,title,description,help_text,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Como você avalia seu nível de estresse atual?','0 = sem estresse · 10 = estresse extremo','Considere as últimas duas semanas.',true,4,0,10,1 from s1_6 s join (select template_id from s1_6) t on true returning id),
q1_31 as (insert into form_questions (template_id,section_id,type,title,help_text,is_required,sort_order) select t.template_id,s.id,'long_text','O que você espera da terapia?','Pode ser objetivos específicos, uma sensação, ou simplesmente explorar.',true,5 from s1_6 s join (select template_id from s1_6) t on true returning id)
select 'T1: Anamnese Adulto OK' as ok;

-- ════════════════════════════════════════════════════════════
-- TEMPLATE 2: Anamnese Infantil — Para Responsáveis
-- ════════════════════════════════════════════════════════════
with t2 as (
  insert into form_templates (psychologist_id, title, description, send_message, is_system, is_archived, sort_order)
  values (
    null,
    'Anamnese Infantil — Para Responsáveis',
    'Formulário de anamnese para ser preenchido por pais ou responsáveis de crianças em atendimento psicológico.',
    E'Olá <<nome_paciente>>,\n\nSeu(sua) psicólogo(a) preparou um formulário sobre o desenvolvimento e histórico da criança.\n\n📋 Formulário: <<nome_formulario>>\n🔗 Link: <<link>>\n🔑 Senha: <<senha>>\n\nPreencha com calma. Suas informações são sigilosas e muito importantes para o atendimento.',
    true, false, 2
  )
  returning id
),
s2_1 as (insert into form_sections(template_id,title,description,sort_order) select id,'Dados da Criança','Informações básicas sobre a criança.',1 from t2 returning id,template_id),
s2_2 as (insert into form_sections(template_id,title,description,sort_order) select id,'Motivo da Consulta','O que motivou buscar ajuda psicológica.',2 from t2 returning id,template_id),
s2_3 as (insert into form_sections(template_id,title,description,sort_order) select id,'Desenvolvimento','Histórico de desenvolvimento da criança.',3 from t2 returning id,template_id),
s2_4 as (insert into form_sections(template_id,title,description,sort_order) select id,'Saúde','Condições de saúde e medicamentos.',4 from t2 returning id,template_id),
s2_5 as (insert into form_sections(template_id,title,description,sort_order) select id,'Escola e Vida Social','Desempenho escolar e relacionamentos.',5 from t2 returning id,template_id),
s2_6 as (insert into form_sections(template_id,title,description,sort_order) select id,'Contexto Familiar','Estrutura e dinâmica familiar.',6 from t2 returning id,template_id),
-- S1
q2_01 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'short_text','Nome completo da criança',true,1 from s2_1 s join(select template_id from s2_1)t on true returning id),
q2_02 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'date','Data de nascimento da criança',true,2 from s2_1 s join(select template_id from s2_1)t on true returning id),
q2_03 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'single_choice','Gênero da criança',false,3 from s2_1 s join(select template_id from s2_1)t on true returning id),
q2_04 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'short_text','Escola e série/ano que frequenta',false,4 from s2_1 s join(select template_id from s2_1)t on true returning id),
q2_05 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'short_text','Nome do responsável que está preenchendo',true,5 from s2_1 s join(select template_id from s2_1)t on true returning id),
q2_06 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'single_choice','Parentesco com a criança',true,6 from s2_1 s join(select template_id from s2_1)t on true returning id),
o2_03a as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_03),'Menino',1) returning id),
o2_03b as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_03),'Menina',2) returning id),
o2_03c as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_03),'Outro / Prefiro não informar',3) returning id),
o2_06a as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_06),'Mãe',1) returning id),
o2_06b as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_06),'Pai',2) returning id),
o2_06c as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_06),'Avó',3) returning id),
o2_06d as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_06),'Avô',4) returning id),
o2_06e as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_06),'Tutor(a) legal',5) returning id),
o2_06f as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_06),'Outro',6) returning id),
-- S2
q2_07 as (insert into form_questions(template_id,section_id,type,title,help_text,is_required,sort_order) select t.template_id,s.id,'long_text','Por que está buscando atendimento psicológico para a criança?','Descreva as dificuldades observadas com o máximo de detalhes possível.',true,1 from s2_2 s join(select template_id from s2_2)t on true returning id),
q2_08 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'short_text','Há quanto tempo você observa essas dificuldades?',false,2 from s2_2 s join(select template_id from s2_2)t on true returning id),
q2_09 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'single_choice','Quem sugeriu buscar ajuda psicológica?',false,3 from s2_2 s join(select template_id from s2_2)t on true returning id),
o2_09a as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_09),'Escola / professores',1) returning id),
o2_09b as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_09),'Médico / pediatra',2) returning id),
o2_09c as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_09),'Família',3) returning id),
o2_09d as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_09),'Decisão própria',4) returning id),
o2_09e as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_09),'Outro',5) returning id),
-- S3
q2_10 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'boolean','A gestação foi de risco?',false,1 from s2_3 s join(select template_id from s2_3)t on true returning id),
q2_11 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'boolean','Houve complicações no parto?',false,2 from s2_3 s join(select template_id from s2_3)t on true returning id),
q2_12 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'boolean','A criança atingiu os marcos de desenvolvimento dentro do esperado? (sentar, andar, falar)',false,3 from s2_3 s join(select template_id from s2_3)t on true returning id),
q2_13 as (insert into form_questions(template_id,section_id,type,title,help_text,is_required,sort_order) select t.template_id,s.id,'long_text','Se houve atrasos no desenvolvimento, relate quais e quando foram percebidos.','Deixe em branco se o desenvolvimento foi típico.',false,4 from s2_3 s join(select template_id from s2_3)t on true returning id),
q2_14 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'short_text','A criança foi amamentada? Por quanto tempo?',false,5 from s2_3 s join(select template_id from s2_3)t on true returning id),
-- S4
q2_15 as (insert into form_questions(template_id,section_id,type,title,help_text,is_required,sort_order) select t.template_id,s.id,'long_text','A criança tem alguma condição médica diagnosticada?','Ex: asma, epilepsia, alergias graves. Deixe em branco se não.',false,1 from s2_4 s join(select template_id from s2_4)t on true returning id),
q2_16 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'boolean','A criança faz uso de algum medicamento?',false,2 from s2_4 s join(select template_id from s2_4)t on true returning id),
q2_17 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'short_text','Se sim, qual medicamento e para que serve?',false,3 from s2_4 s join(select template_id from s2_4)t on true returning id),
q2_18 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'long_text','Como é o sono da criança? Dorme bem? Quantas horas por noite?',false,4 from s2_4 s join(select template_id from s2_4)t on true returning id),
q2_19 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'boolean','A criança tem bom apetite?',false,5 from s2_4 s join(select template_id from s2_4)t on true returning id),
-- S5
q2_20 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'single_choice','Como avalia o desempenho escolar da criança?',false,1 from s2_5 s join(select template_id from s2_5)t on true returning id),
q2_21 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'boolean','A criança tem amigos? Consegue se relacionar bem com outras crianças?',false,2 from s2_5 s join(select template_id from s2_5)t on true returning id),
q2_22 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'boolean','A criança já sofreu ou sofre bullying?',false,3 from s2_5 s join(select template_id from s2_5)t on true returning id),
q2_23 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'long_text','Relate situações relevantes no ambiente escolar ou social.',false,4 from s2_5 s join(select template_id from s2_5)t on true returning id),
o2_20a as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_20),'Ótimo',1) returning id),
o2_20b as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_20),'Bom',2) returning id),
o2_20c as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_20),'Regular',3) returning id),
o2_20d as (insert into form_question_options(question_id,label,sort_order) values((select id from q2_20),'Abaixo do esperado',4) returning id),
-- S6
q2_24 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'boolean','Os pais são separados?',false,1 from s2_6 s join(select template_id from s2_6)t on true returning id),
q2_25 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'long_text','Como é a relação da criança com cada responsável?',false,2 from s2_6 s join(select template_id from s2_6)t on true returning id),
q2_26 as (insert into form_questions(template_id,section_id,type,title,help_text,is_required,sort_order) select t.template_id,s.id,'long_text','Houve eventos traumáticos recentes na vida da criança ou da família?','Ex: perdas, separação dos pais, mudanças, acidentes, etc.',false,3 from s2_6 s join(select template_id from s2_6)t on true returning id),
q2_27 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'boolean','Há outras crianças em casa? (irmãos)',false,4 from s2_6 s join(select template_id from s2_6)t on true returning id)
select 'T2: Anamnese Infantil OK' as ok;

-- ════════════════════════════════════════════════════════════
-- TEMPLATE 3: Avaliação de Ansiedade — GAD-7
-- ════════════════════════════════════════════════════════════
with t3 as (
  insert into form_templates (psychologist_id, title, description, send_message, is_system, is_archived, sort_order)
  values (
    null,
    'Avaliação de Ansiedade — GAD-7',
    'Escala de triagem para transtorno de ansiedade generalizada. Baseada no GAD-7, adaptada para contexto clínico brasileiro.',
    E'Olá <<nome_paciente>>,\n\nSeu(sua) psicólogo(a) gostaria que você respondesse uma escala de avaliação de ansiedade.\n\n📋 Formulário: <<nome_formulario>>\n🔗 Link: <<link>>\n🔑 Senha: <<senha>>\n\nSão poucas perguntas e leva menos de 5 minutos. Responda pensando nas últimas 2 semanas.',
    true, false, 3
  )
  returning id
),
s3_1 as (insert into form_sections(template_id,title,description,sort_order) select id,'Sintomas de Ansiedade','Nas últimas 2 semanas, com que frequência você foi incomodado pelos seguintes problemas?'||chr(10)||'0 = Nenhuma vez · 1 = Vários dias · 2 = Mais da metade dos dias · 3 = Quase todos os dias',1 from t3 returning id,template_id),
s3_2 as (insert into form_sections(template_id,title,description,sort_order) select id,'Impacto na Vida Diária',null,2 from t3 returning id,template_id),
q3_01 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Sentiu-se nervoso(a), ansioso(a) ou no limite',true,1,0,3,1 from s3_1 s join(select template_id from s3_1)t on true returning id),
q3_02 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Não conseguiu parar ou controlar as preocupações',true,2,0,3,1 from s3_1 s join(select template_id from s3_1)t on true returning id),
q3_03 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Preocupou-se demais com diferentes coisas',true,3,0,3,1 from s3_1 s join(select template_id from s3_1)t on true returning id),
q3_04 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Teve dificuldade para relaxar',true,4,0,3,1 from s3_1 s join(select template_id from s3_1)t on true returning id),
q3_05 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Ficou tão agitado(a) que ficou difícil ficar parado(a)',true,5,0,3,1 from s3_1 s join(select template_id from s3_1)t on true returning id),
q3_06 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Ficou facilmente irritado(a) ou irritável',true,6,0,3,1 from s3_1 s join(select template_id from s3_1)t on true returning id),
q3_07 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Sentiu medo como se algo terrível fosse acontecer',true,7,0,3,1 from s3_1 s join(select template_id from s3_1)t on true returning id),
q3_08 as (insert into form_questions(template_id,section_id,type,title,description,is_required,sort_order) select t.template_id,s.id,'single_choice','Se você marcou algum dos problemas acima, qual o nível de dificuldade que eles causaram no seu trabalho, relacionamentos ou vida social?',null,true,1 from s3_2 s join(select template_id from s3_2)t on true returning id),
q3_09 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'long_text','Observações adicionais (opcional)',false,2 from s3_2 s join(select template_id from s3_2)t on true returning id),
o3_08a as (insert into form_question_options(question_id,label,sort_order) values((select id from q3_08),'Nenhuma dificuldade',1) returning id),
o3_08b as (insert into form_question_options(question_id,label,sort_order) values((select id from q3_08),'Algumas dificuldades',2) returning id),
o3_08c as (insert into form_question_options(question_id,label,sort_order) values((select id from q3_08),'Muitas dificuldades',3) returning id),
o3_08d as (insert into form_question_options(question_id,label,sort_order) values((select id from q3_08),'Dificuldades extremas',4) returning id)
select 'T3: GAD-7 OK' as ok;

-- ════════════════════════════════════════════════════════════
-- TEMPLATE 4: Avaliação de Depressão — PHQ-9
-- ════════════════════════════════════════════════════════════
with t4 as (
  insert into form_templates (psychologist_id, title, description, send_message, is_system, is_archived, sort_order)
  values (
    null,
    'Avaliação de Depressão — PHQ-9',
    'Escala de triagem para depressão. Baseada no PHQ-9 (Patient Health Questionnaire), adaptada para contexto clínico brasileiro.',
    E'Olá <<nome_paciente>>,\n\nSeu(sua) psicólogo(a) gostaria que você respondesse uma escala de avaliação de humor.\n\n📋 Formulário: <<nome_formulario>>\n🔗 Link: <<link>>\n🔑 Senha: <<senha>>\n\nResponda com honestidade, pensando em como você esteve nas últimas 2 semanas.',
    true, false, 4
  )
  returning id
),
s4_1 as (insert into form_sections(template_id,title,description,sort_order) select id,'Sintomas de Depressão','Nas últimas 2 semanas, com que frequência você foi incomodado pelos seguintes problemas?'||chr(10)||'0 = Nenhuma vez · 1 = Vários dias · 2 = Mais da metade dos dias · 3 = Quase todos os dias',1 from t4 returning id,template_id),
s4_2 as (insert into form_sections(template_id,title,description,sort_order) select id,'Impacto e Observações',null,2 from t4 returning id,template_id),
q4_01 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Pouco interesse ou prazer em fazer as coisas',true,1,0,3,1 from s4_1 s join(select template_id from s4_1)t on true returning id),
q4_02 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Sentiu-se para baixo, deprimido(a) ou sem esperança',true,2,0,3,1 from s4_1 s join(select template_id from s4_1)t on true returning id),
q4_03 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Dificuldade para adormecer, continuar dormindo, ou dormiu demais',true,3,0,3,1 from s4_1 s join(select template_id from s4_1)t on true returning id),
q4_04 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Sentiu-se cansado(a) ou com pouca energia',true,4,0,3,1 from s4_1 s join(select template_id from s4_1)t on true returning id),
q4_05 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Falta de apetite ou comeu demais',true,5,0,3,1 from s4_1 s join(select template_id from s4_1)t on true returning id),
q4_06 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Sentiu-se mal consigo mesmo(a) — ou achou que é um fracasso ou que decepcionou a família',true,6,0,3,1 from s4_1 s join(select template_id from s4_1)t on true returning id),
q4_07 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Dificuldade para se concentrar nas coisas',true,7,0,3,1 from s4_1 s join(select template_id from s4_1)t on true returning id),
q4_08 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Lentidão para se movimentar ou falar, ou agitação tão grande que os outros podem ter notado',true,8,0,3,1 from s4_1 s join(select template_id from s4_1)t on true returning id),
q4_09 as (insert into form_questions(template_id,section_id,type,title,help_text,is_required,sort_order,scale_min,scale_max,scale_step) select t.template_id,s.id,'scale','Pensamentos de que seria melhor estar morto(a) ou de se machucar de alguma forma','Se você marcou qualquer frequência para este item, por favor informe ao seu psicólogo.',true,9,0,3,1 from s4_1 s join(select template_id from s4_1)t on true returning id),
q4_10 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'single_choice','Se você marcou algum dos problemas acima, qual o nível de dificuldade que eles causaram no seu trabalho, relacionamentos ou vida social?',true,1 from s4_2 s join(select template_id from s4_2)t on true returning id),
q4_11 as (insert into form_questions(template_id,section_id,type,title,is_required,sort_order) select t.template_id,s.id,'long_text','Há algo mais que queira compartilhar com seu psicólogo?',false,2 from s4_2 s join(select template_id from s4_2)t on true returning id),
o4_10a as (insert into form_question_options(question_id,label,sort_order) values((select id from q4_10),'Nenhuma dificuldade',1) returning id),
o4_10b as (insert into form_question_options(question_id,label,sort_order) values((select id from q4_10),'Algumas dificuldades',2) returning id),
o4_10c as (insert into form_question_options(question_id,label,sort_order) values((select id from q4_10),'Muitas dificuldades',3) returning id),
o4_10d as (insert into form_question_options(question_id,label,sort_order) values((select id from q4_10),'Dificuldades extremas',4) returning id)
select 'T4: PHQ-9 OK' as ok;
