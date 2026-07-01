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

* [x] GET /churches/:id (404 padronizado se não existir)
* [x] Busca por nome (`?name=` substring, case-insensitive)
* [x] Filtro por cidade (`?city=`)
* [x] Filtro por estado (`?state=`)

---

# Sprint 6 — App Mobile Base

## Objetivo

Criar estrutura do aplicativo.

## Entregas

* [x] Expo + React Native configurado (Sprint 0)
* [x] Navegação básica (`@react-navigation` native-stack, tela Home registrada)
* [x] Tela inicial (`HomeScreen`)
* [x] Integração com API (`GET /health` chamado ao vivo, mostra contagem real de igrejas)
* [x] React Query (`QueryClientProvider` + `useHealth()`)
* [x] Axios configurado (`apiClient`, `EXPO_PUBLIC_API_URL`)

---

# Sprint 7 — Localização do Usuário

## Objetivo

Capturar posição do usuário.

## Entregas

* [x] Permissão de localização (`requestForegroundPermissionsAsync`, plugin `expo-location` no app.json)
* [x] Obtenção de GPS (`getCurrentPositionAsync`)
* [x] Atualização dinâmica (`watchPositionAsync`, 50m/10s)
* [x] Tratamento de erro (sem permissão) — mensagem exibida na Home

---

# Sprint 8 — Tela Home (Lista de Igrejas)

## Objetivo

Primeira experiência do usuário.

## Entregas

* [x] Lista de igrejas próximas (`useNearbyChurches`, raio 10km)
* [x] Distância exibida (`formatDistance` — m/km)
* [x] Loading state (localização + busca)
* [x] Empty state (`ListEmptyComponent`)
* [x] Pull to refresh (`RefreshControl`)

---

# Sprint 9 — Mapa

## Objetivo

Visualização geográfica.

## Entregas

* [x] Integração Google Maps / Mapbox (`react-native-maps`, aba "Mapa" nova)
* [x] Markers de igrejas (uma por igreja próxima)
* [x] Seleção de igreja (toque no marker mostra barra inferior)
* [x] Navegação para rota externa (`openDirections` — abre Google Maps)

---

# Sprint 10 — Detalhes da Igreja

## Objetivo

Mostrar informações completas.

## Entregas

* [x] Nome
* [x] Endereço
* [x] Botão "como chegar"
* [x] Telefone (se existir) — campo `phone` novo no schema, capturado do OSM quando disponível (863/12.738 igrejas têm)
* [x] Abrir no mapa externo (`openInMaps` — pin sem rota, distinto de "como chegar")

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

* [x] Normalização de nomes (aspas/traços soltos, espaços) + rejeita nomes placeholder ("sem nome", "test", etc.)
* [x] Remoção de duplicados (haversine real por nome, 100m — achou 89 vs 79 do método antigo por grid)
* [x] Correção de coordenadas inválidas (bbox Brasil, rejeita null-island 0,0)
* [x] Filtragem de falsos positivos (nomes sem letra nenhuma são descartados)

---

# Sprint 13 — Performance

## Objetivo

Garantir escalabilidade.

## Entregas

* [x] Paginação eficiente (já feita em Sprint 4/5 — window function, 1 query só; revisada aqui)
* [x] Cache de queries (`CacheModule` global, TTL 60s, `CacheInterceptor` em todas as rotas GET)
* [x] Índices otimizados (removido btree morto lat/lng; adicionado GIN trigram em `name`, btree em `city`/`state`)
* [x] Redução de payload (`compression` — gzip confirmado via `Content-Encoding` real)

---

# Sprint 14 — Polimento UX

## Objetivo

Deixar o app utilizável em produção.

## Entregas

* [x] Loading states (localização, busca, detalhe — já existiam, revisados)
* [x] Skeletons (`ChurchListSkeleton` na lista, substitui spinner cru)
* [x] Feedback de erro (`ErrorState` com botão "Tentar novamente" em Home/Mapa/Detalhe)
* [x] UI consistente (estilização migrada pra Tailwind/NativeWind, paleta única em `tailwind.config.js`)
* [x] Ícones e branding (ícones nas tabs via `@expo/vector-icons`, cor de marca no app icon/header/tabs — sem arte/logo nova, não inventada)
* [x] Ícones flutuantes mostrando se a igreja está aberta ou fechada (campo `openingHours` novo, capturado do OSM; parser `opening_hours` real; badge em lista/mapa/detalhe — 141/12.728 igrejas têm horário)

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
* [ ] rode o sistema

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
