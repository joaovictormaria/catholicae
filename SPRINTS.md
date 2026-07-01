# SPRINTS.md — Catholicaê (MVP v1)

> Versão ajustada para MVP: **catálogo de igrejas + geolocalização + busca**

---

# 🧭 Visão do MVP

O Catholicaê v1 é um aplicativo para:

> Encontrar igrejas católicas próximas de forma rápida e precisa.

Sem login.
Sem gestão de paróquias.
Sem dioceses.
Sem administração.

Apenas leitura de dados + mapa.

---

# Sprint 0 — Infraestrutura do Projeto

## Objetivo

Criar base técnica do sistema.

## Entregas

* [x] Monorepo (pnpm + Turborepo)
* [x] Estrutura backend/, frontend/
* [x] Prisma configurado
* [x] PostgreSQL + PostGIS via Docker
* [x] ESLint + Prettier
* [x] Config base TypeScript
* [x] README inicial

---

# Sprint 1 — Base de Dados de Igrejas (CRÍTICA)

## Objetivo

Popular o sistema com igrejas reais.

## Fonte principal

* OpenStreetMap (Overpass API)

## Entregas

* [x] Script de importação OSM
* [x] Filtro: `amenity=place_of_worship + denomination=catholic|roman_catholic` (ajustado — OSM Brasil não usa `religion=catholic`, ver nota abaixo)
* [x] Normalização de dados
* [x] Persistência no PostgreSQL
* [x] Deduplicação básica (nome + distância)
* [x] Estrutura inicial da tabela Church
* [x] Seed inicial funcionando (12.738 igrejas importadas)

> Nota: o filtro real do OSM no Brasil marca igrejas católicas como
> `amenity=place_of_worship` + `religion=christian` + `denomination=catholic`
> (ou `roman_catholic`), não `religion=catholic` como descrito originalmente
> acima — confirmado testando contra a Overpass API real.

## Resultado esperado

> Banco já com igrejas reais no Brasil

---

# Sprint 2 — Modelo de Dados + PostGIS

## Objetivo

Garantir consultas geográficas eficientes.

## Entregas

* [x] Configuração PostGIS
* [x] Tabela Church otimizada (coluna `location geography(Point,4326)` sincronizada via trigger)
* [x] Índice geoespacial (GIST)
* [x] Campos:

  * id
  * name
  * latitude
  * longitude
  * address
  * city
  * state
  * source
* [x] Query de distância (`ST_DWithin`/`ST_Distance`, confirmado uso do índice GIST via EXPLAIN)

---

# Sprint 3 — API Base

## Objetivo

Criar backend funcional.

## Entregas

* [x] NestJS estruturado
* [x] PrismaModule (PrismaService via `@prisma/adapter-pg`, global)
* [x] ChurchesModule (service com `count()`, base para Sprint 4/5)
* [x] Endpoint healthcheck (`GET /health` — status + contagem real de igrejas)
* [x] Padronização de respostas (`ResponseInterceptor` global — `{ success, data }`)
* [x] Tratamento de erros global (`AllExceptionsFilter` — `{ success: false, statusCode, path, message }`)

---

# Sprint 4 — Busca de Igrejas Próximas (CORE FEATURE)

## Objetivo

Implementar o coração do produto.

## Endpoint principal

```
GET /churches/nearby
```

## Entregas

* [x] Query por latitude/longitude
* [x] Raio configurável (km) — `radiusKm`, padrão 5, máx 100
* [x] Ordenação por distância
* [x] Paginação profissional (`page`/`limit`, `total`/`totalPages` via window function)
* [x] Performance com índice geográfico (mesmo GIST do Sprint 2, validado em produção real via `GET /churches/nearby`)

## Resultado esperado

> Usuário encontra igrejas ao redor dele em segundos

---

# Sprint 5 — Busca e Detalhes

## Objetivo

Permitir exploração do catálogo.

## Entregas

* [ ] GET /churches/:id
* [ ] Busca por nome
* [ ] Filtro por cidade
* [ ] Filtro por estado

---

# Sprint 6 — App Mobile Base

## Objetivo

Criar estrutura do aplicativo.

## Entregas

* [ ] Expo + React Native configurado
* [ ] Navegação básica
* [ ] Tela inicial
* [ ] Integração com API
* [ ] React Query
* [ ] Axios configurado

---

# Sprint 7 — Localização do Usuário

## Objetivo

Capturar posição do usuário.

## Entregas

* [ ] Permissão de localização
* [ ] Obtenção de GPS
* [ ] Atualização dinâmica
* [ ] Tratamento de erro (sem permissão)

---

# Sprint 8 — Tela Home (Lista de Igrejas)

## Objetivo

Primeira experiência do usuário.

## Entregas

* [ ] Lista de igrejas próximas
* [ ] Distância exibida
* [ ] Loading state
* [ ] Empty state
* [ ] Pull to refresh

---

# Sprint 9 — Mapa

## Objetivo

Visualização geográfica.

## Entregas

* [ ] Integração Google Maps / Mapbox
* [ ] Markers de igrejas
* [ ] Seleção de igreja
* [ ] Navegação para rota externa

---

# Sprint 10 — Detalhes da Igreja

## Objetivo

Mostrar informações completas.

## Entregas

* [ ] Nome
* [ ] Endereço
* [ ] Botão “como chegar”
* [ ] Telefone (se existir)
* [ ] Abrir no mapa externo

---

# Sprint 11 — Favoritos (OPCIONAL MVP+)

## Objetivo

Salvar igrejas preferidas.

## Entregas

* [ ] Criar usuário local (device-based)
* [ ] Salvar favoritos localmente
* [ ] Listar favoritos
* [ ] Remover favoritos

---

# Sprint 12 — Melhorias de Dados

## Objetivo

Melhorar qualidade da base OSM.

## Entregas

* [ ] Normalização de nomes
* [ ] Remoção de duplicados
* [ ] Correção de coordenadas inválidas
* [ ] Filtragem de falsos positivos

---

# Sprint 13 — Performance

## Objetivo

Garantir escalabilidade.

## Entregas

* [ ] Paginação eficiente
* [ ] Cache de queries
* [ ] Índices otimizados
* [ ] Redução de payload

---

# Sprint 14 — Polimento UX

## Objetivo

Deixar o app utilizável em produção.

## Entregas

* [ ] Loading states
* [ ] Skeletons
* [ ] Feedback de erro
* [ ] UI consistente
* [ ] Ícones e branding

---

# Sprint 15 — Deploy

## Objetivo

Publicar sistema.

## Entregas

* [ ] Deploy API (Railway/Render)
* [ ] Build mobile Android
* [ ] Configuração de ambiente
* [ ] Variáveis de produção

---

# Sprint 16 — Versão 1.0 (MVP FINAL)

## Objetivo

Release público.

## Entregas

* [ ] Busca funcionando
* [ ] Mapa funcional
* [ ] Dados reais carregados
* [ ] Performance aceitável
* [ ] Sem bugs críticos

---

# 📌 Backlog futuro (NÃO MVP)

## Enriquecimento de dados

* Horários de missa
* Confissões
* Eventos
* Fotos oficiais

## Plataforma

* Login
* Favoritos sincronizados
* Perfil de usuário

## Igreja (fase futura)

* Dioceses
* Padres
* Admin de paróquia
* Reivindicação de perfil
* Aprovação de dados

## Expansão

* API pública
* Web app
* Integração com dioceses
* Internacionalização
