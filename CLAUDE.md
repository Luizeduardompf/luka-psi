# Luka.app

## Objetivo

Entregar tarefas completas, funcionais, testadas e prontas para uso.

Assuma que o usuário frequentemente inicia uma tarefa e se ausenta.

O objetivo é concluir o trabalho sem depender de acompanhamento constante.

---

## Autonomia

Se você possui acesso para executar uma ação, execute.

Não delegue tarefas ao usuário quando puder realizá-las.

Isso inclui:

* Terminal
* Navegador autenticado
* GitHub
* Supabase
* Vercel
* Expo
* EAS Update
* MCPs
* APIs
* Simuladores

Somente solicitar ajuda quando existir:

* falta de acesso;
* autenticação pendente;
* MFA/2FA;
* CAPTCHA;
* permissão insuficiente;
* risco de perda de dados.

---

# Documentação Complementar

Antes de iniciar qualquer tarefa, leia também:

- PROJECT_CONTEXT.md
- ARCHITECTURE.md
- SUPABASE.md
- DEPLOY.md
- ACCOUNTS.md

Esses arquivos fazem parte das instruções do projeto e devem ser considerados juntamente com este documento.

---

## Verificação Inicial (Obrigatória)

Antes de iniciar qualquer tarefa:

Verifique acesso a:

* Terminal
* Navegador
* GitHub
* Supabase
* Vercel
* Expo
* Simulador iOS
* Simulador Android

Se faltar algo:

Liste TODAS as permissões necessárias de uma única vez.

---

## Stack Oficial

* React Native
* Expo SDK 54
* TypeScript
* Supabase
* GitHub
* Vercel
* EAS Update

---

## Desenvolvimento

Priorizar:

1. Desenvolvimento local
2. Simulador iOS
3. Simulador Android
4. Testes locais

Evitar depender exclusivamente do Expo Go durante o desenvolvimento.

---

## Versionamento

Após qualquer alteração de código:

bash scripts/bump-version.sh

Arquivo:

src/constants/version.ts

Variável:

APP_VERSION

---

## Banco de Dados

Sempre que necessário:

* criar migration;
* executar migration;
* validar resultado;
* validar RLS;
* validar policies.

Não deixar migrations pendentes para o usuário executar.

---

## Deploy

Após concluir:

* Commitar alterações
* Fazer push para GitHub
* Validar Vercel
* Publicar EAS Update
* Confirmar atualização disponível no Expo Go

---

## Qualidade

Antes de concluir:

* TypeScript sem erros
* Build sem erros
* Sem código morto
* Sem logs temporários
* Testes executados

---

## Relatório Final

Informar:

* alterações realizadas;
* arquivos modificados;
* versão gerada;
* testes executados;
* migrations aplicadas;
* deploy realizado.
