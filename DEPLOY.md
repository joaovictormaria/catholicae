# Deploy — Catholicaê

Guia para publicar a API e o app mobile. Os arquivos de config já estão no repo
(`backend/Dockerfile`, `railway.json`, `render.yaml`, `frontend/eas.json`) —
este documento cobre o que só pode ser feito com contas reais.

---

## ⚠️ Antes de tudo: banco com PostGIS

Railway e Render oferecem Postgres gerenciado, mas **nenhum dos dois vem com
a extensão PostGIS habilitada por padrão**. O app depende de PostGIS (Sprint 2)
para a busca por distância — sem ela, a API sobe mas `/churches/nearby` falha.

Opções, em ordem de preferência:

1. **Provedor gerenciado com suporte a PostGIS**: Neon, Supabase, DigitalOcean
   Managed Postgres, ou Crunchy Bridge — todos permitem `CREATE EXTENSION postgis`
   num Postgres gerenciado real.
2. **Serviço Docker próprio** no Railway/Render rodando a imagem
   `postgis/postgis:17-3.5` (a mesma do `docker/docker-compose.yml`) com um
   disco persistente — mais trabalho de operar, mas idêntico ao ambiente local.

Qualquer que seja a escolha, a `DATABASE_URL` final deve apontar pra um Postgres
que já tenha (ou permita habilitar) a extensão `postgis`.

---

## Backend (API)

### Build local (já testado)

```bash
docker build -f backend/Dockerfile -t catholicae-api .
docker run -e DATABASE_URL="postgresql://user:pass@host:5432/db" -p 3000:3000 catholicae-api
```

O container roda `prisma migrate deploy` antes de iniciar o servidor — as
migrations em `backend/prisma/migrations/` são aplicadas automaticamente a
cada deploy, sem passo manual.

### Railway

1. Criar projeto novo, conectar este repositório.
2. Railway detecta `railway.json` (builder Docker, `backend/Dockerfile`).
3. Adicionar variável de ambiente `DATABASE_URL` (do banco com PostGIS escolhido acima).
4. Deploy. Healthcheck em `/health` já configurado.

### Render

1. New → Blueprint, apontar pro repositório (`render.yaml` já define o serviço).
2. Render vai pedir pra preencher `DATABASE_URL` (marcado `sync: false` — não
   fica em texto no blueprint).
3. Deploy.

### Variáveis de produção — backend

| Variável       | Obrigatória        | Exemplo                                                                            |
| -------------- | ------------------ | ---------------------------------------------------------------------------------- |
| `DATABASE_URL` | sim                | `postgresql://user:pass@host:5432/catholicae?schema=public` (Postgres com PostGIS) |
| `PORT`         | não (default 3000) | `3000`                                                                             |

---

## Mobile (Android)

### Pré-requisito: chave real do Google Maps

O app usa `react-native-maps`. Em dev, o Android usa a chave de teste do
próprio Expo Go — **não funciona em build de produção**. Antes do primeiro
build de produção:

1. Criar uma chave de API no [Google Cloud Console](https://console.cloud.google.com/)
   com a _Maps SDK for Android_ habilitada.
2. Adicionar em `frontend/app.json`:
   ```json
   "android": {
     "config": {
       "googleMaps": { "apiKey": "SUA_CHAVE_AQUI" }
     }
   }
   ```

### Build via EAS

```bash
cd frontend
npx eas login          # conta Expo
npx eas init            # gera o projectId real em app.json (extra.eas.projectId)
npx eas build --platform android --profile preview     # gera APK pra testar
npx eas build --platform android --profile production  # gera AAB pra Play Store
```

`frontend/eas.json` já define os 3 perfis (`development`, `preview`,
`production`). `appVersionSource: "remote"` deixa o EAS controlar o
`versionCode` automaticamente — não precisa incrementar manualmente.

### Variáveis de produção — mobile

| Variável              | Obrigatória | Exemplo                                                                     |
| --------------------- | ----------- | --------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL` | sim         | URL pública da API deployada (ex.: `https://catholicae-api.up.railway.app`) |

Configurar via `eas.json` (`env` por profile) ou `eas secret:create` antes do
build de produção — `frontend/.env` local não vai junto no build.

### Publicar na Play Store

Requer conta de desenvolvedor Google Play (paga, única vez) e assinatura do
app — `eas build` já assina automaticamente se configurado via
`eas credentials`. `eas submit --platform android` envia o AAB direto pra
Play Console depois do build.
