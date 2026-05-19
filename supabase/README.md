# Supabase mirror

Espelho dos dados do Planka num projeto Supabase. O Planka segue sendo a
aplicação primária (continua usando seu Postgres); este projeto Supabase
existe pra que n8n, Streamlit e outras integrações consumam os dados sem
precisar autenticar contra a API do Planka.

## Tabelas

| Tabela | Conteúdo |
|---|---|
| `form_submissions` | Snapshot de cada envio dos formulários públicos (Design + Chamado). Inclui o payload completo, vínculo com o card criado, e status. |
| `cards` | Estado atual de cada card no Planka. Chave: `planka_id` (string). Atualizado em create / move / update / delete (soft). |
| `card_events` | Timeline de eventos por card: `create`, `move`, `update`, `delete`, `label_add`, `label_remove`, `form_submit_design`, `form_submit_chamado`. |

## Aplicar o schema

1. Abra **Supabase Dashboard** → seu projeto → **SQL Editor**.
2. Cole o conteúdo de [`migrations/001_initial_schema.sql`](migrations/001_initial_schema.sql).
3. Clique em **Run**. Espera ~1s.

Ou via Supabase CLI:

```bash
supabase link --project-ref <ref>
supabase db push
```

## Configurar as variáveis de ambiente

Tanto o backend do Planka quanto o `ticket-form` precisam dessas duas variáveis.
Adicione no `.env` da raiz do projeto (mesmo arquivo que o
`docker-compose.prod.yml` consome):

```env
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_xxxxxxx        # ou a service_role JWT (compatível)
```

**Importante:** use a chave `service_role` / `sb_secret_*`. A chave `anon` /
`sb_publishable_*` não tem permissão de bypass de RLS e os writes vão falhar.
A chave nunca é exposta ao browser — fica só nos serviços backend.

Se essas variáveis não estiverem setadas, o mirror **fica desligado
silenciosamente** (o Planka e o form continuam funcionando normalmente, só
não escrevem no Supabase).

## Como verificar que está funcionando

Depois de subir, mande um chamado pelo formulário e rode no SQL Editor:

```sql
select created_at, form_type, planka_card_id, status
from form_submissions
order by created_at desc
limit 5;

select planka_id, name, list_name, is_closed, updated_at
from cards
order by updated_at desc
limit 5;

select created_at, event_type, planka_card_id, data
from card_events
order by created_at desc
limit 10;
```

Cada linha nova significa que o mirror está respondendo.

## Eventos emitidos pelo Planka

Cada ação no Planka gera um `card_events.event_type`:

| Origem | event_type |
|---|---|
| Card criado pelo usuário | `create` |
| Card movido entre listas | `move` |
| Card editado (nome, descrição, etc.) | `update` |
| Card excluído | `delete` |
| Label adicionada a um card | `label_add` |
| Label removida de um card | `label_remove` |
| Formulário "Pedido de Artes" submetido | `form_submit_design` |
| Formulário "Chamado Técnico" submetido | `form_submit_chamado` |
