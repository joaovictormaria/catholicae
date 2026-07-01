# Catholicaê

Plataforma de gestão e engajamento para comunidades católicas — conectando paróquias, grupos e fiéis em um único ecossistema digital.

---

## Objetivos

- Facilitar a comunicação entre lideranças paroquiais e comunidade
- Centralizar agenda de missas, eventos e grupos pastorais
- Oferecer ferramentas de engajamento (doações, intenções de missa, avisos)
- Permitir gestão de membros e sacramentos
- Disponibilizar conteúdo espiritual (reflexões, leituras do dia, podcasts)

---

## Tecnologias Previstas

| Camada | Tecnologia |
|---|---|
| Mobile | React Native + Expo |
| Backend | NestJS (Node.js) |
| Banco de dados | PostgreSQL + Prisma ORM |
| Cache | Redis |
| Armazenamento | AWS S3 / Cloudflare R2 |
| Autenticação | JWT + OAuth2 |
| Infra | Docker + CI/CD GitHub Actions |
| Monorepo | Turborepo |

---

## Estrutura de Pastas

```
catholicae/
├── apps/           # Aplicações (mobile, web, admin)
├── packages/       # Pacotes compartilhados (UI, utils, types)
├── docs/           # Documentação técnica e de produto
├── prisma/         # Schema e migrations do banco de dados
├── docker/         # Configurações Docker
└── .github/        # CI/CD workflows e templates
```

---

## Como Iniciar

> Documentação de setup será adicionada na Sprint 0.

```bash
# Em breve
```

---

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [PRODUCT.md](./PRODUCT.md) | Visão de produto, personas e roadmap de features |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura do sistema e decisões técnicas |
| [SPRINTS.md](./SPRINTS.md) | Histórico e planejamento de sprints |
| [CHANGELOG.md](./CHANGELOG.md) | Registro de mudanças por versão |
| [CLAUDE.md](./CLAUDE.md) | Instruções para Claude Code neste repositório |

---

## Roadmap

| Sprint | Foco |
|---|---|
| Sprint 0 | Setup do monorepo, infraestrutura base, CI/CD |
| Sprint 1 | Autenticação, cadastro de paróquias e usuários |
| Sprint 2 | Agenda de missas e eventos |
| Sprint 3 | Grupos pastorais e comunicados |
| Sprint 4 | Doações e intenções de missa |
| Sprint 5 | Conteúdo espiritual e notificações push |

---

## Licença

MIT © 2026 Catholicaê
