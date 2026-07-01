# SPRINTS.md — Catholicaê

Registro de planejamento e entregáveis por sprint.

---

## Sprint 0 — Fundação
**Período:** A definir
**Objetivo:** Setup completo do ambiente de desenvolvimento

### Escopo

- [ ] Configurar monorepo com Turborepo
- [ ] Setup NestJS (apps/api)
- [ ] Setup Expo (apps/mobile)
- [ ] Setup Next.js (apps/web)
- [ ] Configurar packages compartilhados (types, ui, utils)
- [ ] Schema Prisma inicial (users, parishes)
- [ ] Docker Compose para desenvolvimento local
- [ ] Pipeline CI/CD no GitHub Actions (lint, test, build)
- [ ] Ambientes: dev, staging, prod
- [ ] Variáveis de ambiente documentadas

### Critérios de Aceite

- `turbo run build` passa sem erros
- `docker-compose up` sobe banco + api localmente
- CI verde no PR de exemplo

---

## Sprint 1 — Autenticação e Paróquias
**Período:** A definir
**Objetivo:** Usuários cadastrados e vinculados a paróquias

### Escopo (planejado)

- [ ] Registro e login (email/senha)
- [ ] JWT + refresh tokens
- [ ] Perfil de usuário
- [ ] CRUD de paróquias
- [ ] Vínculo usuário-paróquia (membro, líder, admin)
- [ ] Tela de onboarding mobile

---

## Sprint 2 — Agenda
**Período:** A definir

### Escopo (planejado)

- [ ] CRUD de missas (horário, intenção, celebrante)
- [ ] CRUD de eventos
- [ ] Calendário no app mobile
- [ ] Painel de gestão web

---

## Sprints Futuras

Ver [PRODUCT.md](./PRODUCT.md) para roadmap completo de features.
