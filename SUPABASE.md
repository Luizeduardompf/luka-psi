# Supabase

## Princípios

Sempre executar alterações completas.

Não deixar tarefas de banco pendentes para execução manual.

---

## Alterações Estruturais

Ao modificar banco:

1. Criar migration
2. Executar migration
3. Validar resultado
4. Validar RLS
5. Validar policies
6. Validar leitura
7. Validar escrita

---

## Segurança

Nunca desabilitar RLS sem necessidade explícita.

Sempre validar:

* SELECT
* INSERT
* UPDATE
* DELETE

---

## Credenciais

Utilizar apenas credenciais e sessões já disponíveis.

Nunca armazenar senhas em código.

Consultar:

supabase_credentials.md

quando necessário.

---

## Validação

Após alterações:

* testar consultas;
* testar autenticação;
* testar acesso dos usuários;
* validar impacto na aplicação.
