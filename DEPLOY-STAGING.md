# Deploy Staging — Instruções para o dev

> Staging em **https://pdviewerp-stagging.fourtuna.com.br/** (form em https://form-pdviewerp-stagging.fourtuna.com.br/)
> Servidor: hostinger-beta (76.13.239.198), pasta `/opt/hostinger-beta/planka/`

## TL;DR — como deployar

```bash
git checkout deploy/staging
git merge develop  # ou cherry-pick dos commits que quer deployar
git push origin deploy/staging
```

GitHub Actions detecta o push, faz rsync + build + restart + smoke automático.
Acompanhe em https://github.com/GGhiaroni/planka/actions

Tempo total: ~3-5 minutos.

## Pre-requisitos (one-time setup)

Estas secrets precisam estar configuradas no repo (Settings → Secrets and variables → Actions):

| Secret | Valor |
|--------|-------|
| `STAGING_DEPLOY_SSH_KEY` | Private key (fornecida separadamente — gerada em `/root/.ssh/deploy_planka_actions` no servidor) |
| `STAGING_DEPLOY_HOST` | `76.13.239.198` |
| `STAGING_DEPLOY_USER` | `root` |

A operação que criou esse fluxo gerou a SSH key e adicionou a pública ao `authorized_keys` do servidor. Pegar a private key com o operador (vai entregar separado, fora do repo).

## O que acontece quando você pusha em `deploy/staging`

1. **Checkout** do código no runner GitHub
2. **SSH** ao servidor hostinger-beta (key autenticada)
3. **rsync** do código → `/opt/hostinger-beta/planka/` (preservando `.env`, `docker-compose.hostinger-beta.yml`, e excluindo `node_modules`, `.git`, `_a4tunados`, etc.)
4. **`scripts/deploy.sh`** roda:
   - pg_dump preventivo do DB
   - Tag da imagem atual como `pre-deploy` (rollback safety)
   - `docker compose build planka` (rebuild da imagem)
   - `docker compose up -d --force-recreate planka` (restart preservando volumes)
   - Healthcheck (timeout 90s)
   - Smoke HTTP externo
   - Bonus: restart ticket-form pra reler .env
5. **Smoke final** do runner

## Em caso de falha

O `scripts/deploy.sh` tem **rollback automático**:
- Se healthcheck falha em 90s → volta imagem `pre-deploy` e restart
- Se smoke HTTP falha → idem
- O DB **nunca** é tocado (volume preservado em todos os casos)

Backups pg_dump ficam em `/opt/hostinger-beta/backups/planka-pre-deploy-*.dump` no servidor.

## Estrutura local do staging

```
/opt/hostinger-beta/planka/
├── .env                                   # ← preservado em todos rsync (creds + IDs do board)
├── docker-compose.prod.yml                # do repo
├── docker-compose.hostinger-beta.yml      # ← preservado (override staging-specific, NÃO no repo)
├── scripts/deploy.sh                      # do repo (este script)
└── ... (todo o source do Planka)
```

O `.env` no servidor tem as keys reais (PLANKA_DOMAIN, ADMIN_*, POSTGRES_PASSWORD, SECRET_KEY, PLANKA_LIST_ID, etc.).
**NÃO** tente subir `.env` para o repo — o rsync deliberadamente exclui.

## Rollback manual (caso necessário)

```bash
git checkout deploy/staging
git revert <commit-hash>
git push origin deploy/staging
# Actions roda novo deploy com código revertido
```

Ou, no servidor, voltar imagem manualmente:

```bash
ssh root@76.13.239.198
cd /opt/hostinger-beta/planka
docker tag planka-custom:pre-deploy planka-custom:latest
docker compose -f docker-compose.prod.yml -f docker-compose.hostinger-beta.yml --env-file .env up -d --force-recreate planka
```

## Outros projetos no servidor B (não tocar)

Estes rodam no mesmo servidor — o deploy do Planka NÃO os impacta:

- **a4tunados-mural** (PM2 cluster, port 1337) — `mural.a4tunados.tuninho.ai`
- **tuninho-ai** (PM2 fork, Next.js port 3100) — `tuninho.ai`, `dev.tuninho.ai`

O deploy do Planka usa porta `127.0.0.1:1338` (loopback only), via override `docker-compose.hostinger-beta.yml`. Sem colisão.

## Bug conhecido — fix aplicado nesta op

`sails.io.js` v1.2.1 + `socket.io-client` v4 incompat: `socket.request` retornava `undefined` no upgrade WebSocket, quebrando `fetchCore`. Workaround aplicado em `client/src/api/socket.js`: substitui `socket.request` por `fetch` REST puro (mesmo backend Sails responde em /api/* via HTTP). Workaround também adicionado no nginx do servidor B (`location /engine.io/` proxia pra `/socket.io/`).

Solução estrutural pendente (idealmente):
- Atualizar `sails.io.js` ou substituir wrapper por uso direto de `socket.io-client`
- OU downgrade `socket.io-client` para v3 (compatível com sails.io.js v1.2.1)

Por enquanto: aplicação funciona sem regressão visível pro usuário final.

## Histórico

- **2026-05-06**: Setup inicial via Op 01 deploy-planka-hostinger-redeploy. Deploy validado, ticket-form funcional, CI/CD configurada.
- **2026-05-08**: Auto-deploy via push em `deploy/staging` validado independentemente no Card 377530 — commit cirúrgico só nesta linha do histórico, sem qualquer execução manual de `deploy.sh`, pra confirmar que GitHub Actions trigga e completa o ciclo sozinho (rsync + build + restart + healthcheck + smoke + rollback automático).
