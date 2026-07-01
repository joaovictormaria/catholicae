# Catholicaê — Arquitetura

## 🧱 Stack

- Frontend: React Native + Expo
- Backend: NestJS
- DB: PostgreSQL + PostGIS
- ORM: Prisma
- Monorepo: Turborepo + pnpm

---

## 📁 Estrutura

apps/
  api/
  mobile/

packages/
  shared/
  types/
  utils/

prisma/

---

## 🧠 Princípios

- Simplicidade acima de tudo
- MVP primeiro
- Dados reais antes de features
- Geolocalização como core

---

## 🗄️ Banco de dados

Tabela principal:

Church

Campos:

- id
- name
- latitude
- longitude
- address
- city
- state
- source

---

## 🌍 Geolocalização

Sempre baseada em:

- latitude
- longitude
- raio de busca

Usando PostGIS:

- ST_Distance
- ST_DWithin

---

## 🚫 Fora do escopo inicial

- Login
- Admin painel
- Diocese
- Padre
- Roles
- Permissões

---

## 🧭 Regra principal

O sistema é somente leitura no MVP.