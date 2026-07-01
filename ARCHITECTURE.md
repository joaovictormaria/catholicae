# ARCHITECTURE.md — Catholicaê

## Visão Geral

Monorepo com arquitetura cliente-servidor. Backend REST + WebSocket, mobile React Native, painel web Next.js.

```
┌─────────────────────────────────────────────────────┐
│                   Clients                            │
│  [Mobile: React Native/Expo]  [Web Admin: Next.js]  │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS / WSS
┌──────────────────▼──────────────────────────────────┐
│              API Gateway / Nginx                     │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│           Backend — NestJS (Node.js)                 │
│  Auth │ Parishes │ Events │ Groups │ Content │ Push  │
└──────────────────┬──────────────────────────────────┘
                   │
       ┌───────────┼────────────┐
       ▼           ▼            ▼
  [PostgreSQL]  [Redis]    [S3/R2]
```

---

## Stack

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Mobile | React Native + Expo | Cross-platform, ecossistema maduro |
| Web Admin | Next.js | SSR, rotas, autenticação simplificada |
| Backend | NestJS | Estrutura opinada, DI, módulos |
| ORM | Prisma | Type-safe, migrations, DX |
| Banco | PostgreSQL | Relacional, confiável, suporte JSON |
| Cache | Redis | Sessions, filas, pub/sub |
| Storage | Cloudflare R2 | Custo baixo, compatível S3 |
| Auth | JWT + Refresh Tokens | Stateless, seguro |
| Push | Firebase FCM | Notificações iOS/Android |
| Infra | Docker + GitHub Actions | CI/CD, ambientes reproduzíveis |
| Monorepo | Turborepo | Build caching, pipelines |

---

## Estrutura de Módulos (Backend)

```
src/
├── auth/           # Login, registro, JWT, refresh
├── users/          # Perfis de usuário
├── parishes/       # Paróquias e configurações
├── events/         # Missas e eventos
├── groups/         # Grupos pastorais
├── announcements/  # Comunicados e avisos
├── intentions/     # Intenções de missa
├── donations/      # Doações e dízimo
├── content/        # Reflexões, podcasts, leitura do dia
└── notifications/  # Push notifications (FCM)
```

---

## Decisões Arquiteturais (ADRs)

### ADR-001: Monorepo com Turborepo
**Decisão:** Usar Turborepo para gerenciar apps e packages compartilhados.
**Motivo:** Compartilhamento de tipos TypeScript, componentes UI e utilitários sem publicar pacotes npm.

### ADR-002: Prisma como ORM
**Decisão:** Prisma em vez de TypeORM ou Sequelize.
**Motivo:** Type safety gerado automaticamente, migrations declarativas, DX superior.

### ADR-003: REST + WebSocket
**Decisão:** REST para CRUD, WebSocket para comunicados em tempo real.
**Motivo:** GraphQL adiciona complexidade desnecessária no estágio atual.

---

## Ambientes

| Ambiente | Branch | Deploy |
|---|---|---|
| Development | `feat/*`, `fix/*` | Local (Docker) |
| Staging | `develop` | CI automático |
| Production | `main` | Manual com aprovação |
