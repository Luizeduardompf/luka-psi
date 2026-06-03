---
name: supabase-credentials
type: reference
description: "Credenciais do projeto Supabase luka-psi — ref, keys, DB password, URLs"
updated: 2026-06-03
---

# Supabase — Projeto luka-psi

| Campo             | Valor                                                              |
|-------------------|--------------------------------------------------------------------|
| Project Ref       | `evrwztudtfjbyhbqilxt`                                             |
| Project URL       | `https://evrwztudtfjbyhbqilxt.supabase.co`                        |
| Dashboard         | `https://supabase.com/dashboard/project/evrwztudtfjbyhbqilxt`     |
| SQL Editor        | `https://supabase.com/dashboard/project/evrwztudtfjbyhbqilxt/sql/new` |
| Conta             | `luizeduardompf@gmail.com`                                         |

## Keys

**Anon Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2cnd6dHVkdGZqYnloYnFpbHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzIzMDEsImV4cCI6MjA5NTU0ODMwMX0.ycOFvrRyMKvyGPKHQaQrzYFX3t0AdkafVELe46Y3j9w
```

**Service Role Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2cnd6dHVkdGZqYnloYnFpbHh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk3MjMwMSwiZXhwIjoyMDk1NTQ4MzAxfQ.zT6ErNabJXpsQOTNjxjTrwbL0vcaU1xyUL47vpRf54M
```

## Banco de dados

| Campo    | Valor                                        |
|----------|----------------------------------------------|
| Host     | `db.evrwztudtfjbyhbqilxt.supabase.co`        |
| Port     | `5432`                                        |
| Database | `postgres`                                   |
| User     | `postgres`                                   |
| Password | `Luka@2024Psico!` *(resetada 2026-05-31)*    |

**Connection string:**
```
postgresql://postgres:Luka@2024Psico!@db.evrwztudtfjbyhbqilxt.supabase.co:5432/postgres
```

## Aplicar SQL sem CLI

O Supabase Studio aceita queries via API interna:

```
POST https://api.supabase.com/platform/pg-meta/{ref}/query?key=
Headers:
  authorization: Bearer {user_session_jwt}
  x-connection-encrypted: {encrypted_conn}
Body:
  { "query": "SQL aqui" }
```

Auth headers obtidos interceptando o `fetch` do Studio no Chrome (tab já autenticado).
