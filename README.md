# K-Slim Members App

Area de membros K-Slim com login por link magico, liberacao de acesso por compra
e webhook Cakto.

## Deploy

Configure as variaveis de ambiente do arquivo `.env.example` no provedor de deploy.
Nao publique `.env` no GitHub.

Comandos padrao:

```bash
npm ci
npm run build
npm start
```

O build gera a saida Nitro em `.output/`.

## Variaveis obrigatorias

- `PUBLIC_SITE_URL`: dominio final da aplicacao.
- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_PUBLISHABLE_KEY`: chave publica do Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: chave secreta server-side do Supabase.
- `CAKTO_WEBHOOK_SECRET`: segredo compartilhado com o webhook da Cakto.

Tambem configure as equivalentes `VITE_*` listadas em `.env.example` para o bundle
do cliente.

## Webhook Cakto

URL:

```txt
https://seu-dominio-final.com/api/public/webhooks/cakto
```

Evento esperado:

```txt
purchase_approved
```

O valor configurado como segredo na Cakto deve ser exatamente o mesmo de
`CAKTO_WEBHOOK_SECRET`.

## Supabase Auth

No Supabase, configure:

- Site URL: `https://seu-dominio-final.com`
- Redirect URLs: `https://seu-dominio-final.com` e `https://seu-dominio-final.com/**`
