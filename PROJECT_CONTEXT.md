# Luka.app — Contexto do Projeto

## Objetivo do Produto

Luka é uma plataforma para psicólogos gerenciarem:

* pacientes;
* sessões;
* formulários;
* agenda;
* documentos clínicos;
* acompanhamento terapêutico.

---

## Público-Alvo

* Psicólogos
* Clínicas
* Profissionais da saúde mental

---

## Plataformas

* Web
* iOS
* Android

---

## Stack

* React Native
* Expo SDK 54
* TypeScript
* Supabase
* Vercel

---

## Arquitetura

Priorizar:

* componentes reutilizáveis;
* tipagem forte;
* simplicidade;
* manutenção fácil;
* baixo acoplamento.

---

## Princípios

* UX simples
* Mobile First
* Performance
* Segurança
* Privacidade de dados

---

## Rotas Críticas

Formulários públicos:

/f/:token

Nunca utilizar:

/forms/:token

---

## Versionamento

Arquivo:

src/constants/version.ts

Variável:

APP_VERSION
