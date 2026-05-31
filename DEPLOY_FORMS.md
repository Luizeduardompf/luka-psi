# Luka — Módulo de Formulários: Guia de Deploy

## 1. Commitar e merge (rodar no terminal)

```bash
cd ~/Documents/Claude/Projects/Luka/Luka

# Remover locks presos de sessões anteriores
rm -f .git/index.lock .git/HEAD.lock

# Commitar tudo
git add -A
git commit -m "feat(forms): módulo completo de formulários clínicos

- 10 templates padrão do sistema (Anamnese Adulto/Infantil, GAD-7, PHQ-9,
  PSS-10, BAI, AUDIT, Rosenberg, Nota de Sessão, Contrato Terapêutico)
- Construtor de formulários (seções, questões, opções)
- 9 tipos de questão: short_text, long_text, single_choice, multi_choice,
  dropdown, date, number, scale, boolean
- Fluxo de envio em 7 passos com snapshot imutável
- Customizações ad-hoc por paciente (seções/perguntas extras)
- Mensagem com placeholders + botões WhatsApp/SMS/Email/Copiar
- Página pública do paciente (/forms/:token) com auto-save
- Aba Formulários na ficha do paciente
- Upload de logo profissional (Supabase Storage bucket avatars)
- 82 testes passando (unit + integração + E2E)
- tsc: zero erros"

# Merge na main
git checkout main
git merge feature/custom-forms
git push origin main   # se usar remote
```

## 2. Aplicar migrations no Supabase

Acesse o painel do Supabase → SQL Editor e execute na ordem:

```
003_forms.sql           ← tabelas principais
004_forms_seed.sql      ← templates padrão originais (4)
005_forms_fix.sql       ← RLS fixes + bucket avatars
006_forms_extra_templates.sql ← 6 novos templates padrão
```

Ou via CLI:
```bash
supabase db push
```

## 3. Variáveis de ambiente

Adicionar ao `.env`:
```
EXPO_PUBLIC_APP_URL=https://app.luka.com.br
```

Sem essa variável, a URL dos formulários usa `https://app.luka.com.br` como fallback.

## 4. Verificar storage

No Supabase → Storage, confirmar que o bucket `avatars` existe e está público.
Se não existir, a migration 005 o cria automaticamente.

## 5. Templates padrão disponíveis (10 total)

| # | Template | Tipo | Questões |
|---|----------|------|----------|
| 1 | Anamnese de Adulto | Clínico | ~31 |
| 2 | Anamnese Infantil | Clínico | ~27 |
| 3 | GAD-7 — Ansiedade | Escala | 7 + 1 |
| 4 | PHQ-9 — Depressão | Escala | 9 + 1 |
| 5 | PSS-10 — Estresse | Escala | 10 |
| 6 | BAI — Ansiedade de Beck | Inventário | 21 |
| 7 | AUDIT — Uso de Álcool (OMS) | Triagem | 10 |
| 8 | Escala de Autoestima de Rosenberg | Escala | 10 |
| 9 | Nota de Sessão | Pós-sessão | 8 |
| 10 | Contrato Terapêutico | Inicial | 12 |

## 6. Resultado dos testes

```
Test Suites: 4 passed, 4 total
Tests:       82 passed, 82 total
tsc:         0 errors
```
