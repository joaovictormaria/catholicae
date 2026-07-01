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
cp backend/.env.example backend/.env
pnpm install
docker compose -f docker/docker-compose.yml up -d
pnpm --filter @catholicae/backend run prisma:migrate
pnpm --filter @catholicae/backend run import:osm
pnpm dev
```

**Nota (mapa no mobile):** o app usa `react-native-maps`. No Expo Go, o Android usa a chave de desenvolvimento do próprio Expo — funciona sem configuração. Para builds de produção (EAS Build) é preciso configurar `android.config.googleMaps.apiKey` em `frontend/app.json` com uma chave real do Google Maps.
