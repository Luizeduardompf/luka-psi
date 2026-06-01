-- Migration 008: RPC pública para preview de template (sem auth)
-- Usada pela rota /f/preview-{templateId} para renderizar o formulário em modo leitura.

CREATE OR REPLACE FUNCTION get_form_template_preview(p_template_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template   jsonb;
  v_sections   jsonb;
  v_questions  jsonb;
  v_options    jsonb;
BEGIN
  -- Template
  SELECT to_jsonb(t) INTO v_template
  FROM form_templates t
  WHERE t.id = p_template_id;

  IF v_template IS NULL THEN
    RETURN NULL;
  END IF;

  -- Seções
  SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.sort_order), '[]'::jsonb)
  INTO v_sections
  FROM form_sections s
  WHERE s.template_id = p_template_id;

  -- Perguntas
  SELECT COALESCE(jsonb_agg(to_jsonb(q) ORDER BY q.sort_order), '[]'::jsonb)
  INTO v_questions
  FROM form_questions q
  WHERE q.template_id = p_template_id;

  -- Opções das perguntas
  SELECT COALESCE(jsonb_agg(to_jsonb(o) ORDER BY o.sort_order), '[]'::jsonb)
  INTO v_options
  FROM form_question_options o
  WHERE o.question_id IN (
    SELECT id FROM form_questions WHERE template_id = p_template_id
  );

  RETURN jsonb_build_object(
    'template',  v_template,
    'sections',  v_sections,
    'questions', v_questions,
    'options',   v_options
  );
END;
$$;

-- Permitir acesso anônimo ao preview
GRANT EXECUTE ON FUNCTION get_form_template_preview(uuid) TO anon;
GRANT EXECUTE ON FUNCTION get_form_template_preview(uuid) TO authenticated;
