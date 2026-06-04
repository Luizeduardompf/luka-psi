# Memory Index — Projeto Luka
*Atualizado: 2026-06-03 | Arquivos: 1*

## Referências

- [supabase-credentials.md](supabase-credentials.md) — Credenciais completas do Supabase (luka-psi): ref, anon key, service role key, DB password, connection string, SQL via API interna

## Contexto do projeto

- App React Native (Expo) para psicólogos — gestão de pacientes, formulários, agendamentos
- Stack: React Native + Expo, react-hook-form + zod, Supabase (auth + DB + storage)
- Pasta do projeto: `Luka/` (workspace conectado)

## Versionamento

- Arquivo: `src/constants/version.ts` — exporta `APP_VERSION` (ex: `v0.1.2`)
- Formato: `v0.{minor}.{patch}` — `0` = MVP, patch incrementado a cada alteração
- **Sempre rodar antes de commitar:** `bash scripts/bump-version.sh`
- Exibido no rodapé do Menu no app

## Preferências do utilizador (Luiz)

- Resposta em português BR, código/identificadores técnicos em inglês
- Direto ao ponto — sem elogios, sem introduções desnecessárias
- Prioridade: correção técnica > confiabilidade > clareza > manutenção
- Soluções prontas para produção; discordar quando houver overengineering
