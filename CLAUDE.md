# CLAUDE.md — Catholicaê

Instruções para Claude Code neste repositório.

## Projeto

Monorepo — plataforma católica com mobile (React Native/Expo), backend (NestJS), painel web (Next.js).

## Estrutura

```
apps/        # Aplicações: mobile, web, api
packages/    # Compartilhados: ui, types, utils, config
prisma/      # Schema e migrations
docker/      # Docker configs
docs/        # Documentação adicional
.github/     # CI/CD workflows
```

## Convenções

- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`)
- **Branches:** `feat/nome`, `fix/nome`, `chore/nome`
- **PRs:** sempre para `develop`; `develop` → `main` via release
- **Idioma:** código em inglês, docs em português

## Stack

- Backend: NestJS + Prisma + PostgreSQL
- Mobile: React Native + Expo
- Web: Next.js
- Monorepo: Turborepo

## Restrições

- Não instalar dependências sem consultar
- Não alterar schema Prisma sem migration correspondente
- Não fazer push direto para `main`
- Não commitar `.env` ou secrets

## Testes

- Unit: Jest
- E2E: Supertest (backend), Detox (mobile — futuro)
- Rodar antes de commit: `turbo run test`
