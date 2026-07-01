# Catholicaê

> Encontre uma igreja católica perto de você.

O Catholicaê é um aplicativo que mostra igrejas católicas próximas com base na sua localização, permitindo que qualquer pessoa encontre rapidamente uma paróquia para participar da Santa Missa.

---

## 🎯 Objetivo

Permitir que usuários encontrem igrejas católicas próximas de forma simples, rápida e confiável.

---

## 📱 MVP

- Visualizar igrejas próximas no mapa
- Listar igrejas por proximidade
- Ver detalhes da igreja
- Abrir rota no mapa

Sem login. Sem cadastro. Sem complexidade.

---

## 🗺️ Fonte de dados

As igrejas são obtidas automaticamente do OpenStreetMap (Overpass API):

- amenity=place_of_worship
- denomination=catholic ou roman_catholic

---

## 🧱 Arquitetura

Monorepo com:

- API (NestJS)
- Mobile (Expo)
- Admin (futuro)
- PostgreSQL + PostGIS

---

## 🚀 Como rodar

```bash
cp .env.example .env
pnpm install
docker compose -f docker/docker-compose.yml up -d
pnpm prisma:migrate
pnpm --filter @catholicae/api run import:osm
pnpm dev
```
