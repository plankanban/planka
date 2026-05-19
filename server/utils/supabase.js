/*!
 * Supabase mirror — write-side client + helpers used by the Planka backend.
 *
 * The Planka primary store (Postgres / Waterline) remains untouched; this
 * module writes a parallel copy of cards + events into Supabase so external
 * tooling (n8n, Streamlit, …) can read the data without hitting Planka APIs.
 *
 * Env vars:
 *   SUPABASE_URL         — https://<ref>.supabase.co
 *   SUPABASE_SECRET_KEY  — service_role (server-only)
 *
 * If either is missing, every helper is a silent no-op.
 *
 * Design notes:
 *   - We fire-and-forget. None of these helpers throw or block the
 *     primary Planka write path — failures are logged and dropped.
 *   - Card payloads use string ids (Planka issues bigint snowflake ids
 *     that don't fit a JS Number safely).
 */

const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL } = process.env;
const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || null;

let client = null;
if (SUPABASE_URL && SUPABASE_SECRET_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
} else {
  // eslint-disable-next-line no-console
  console.warn('[planka:supabase] mirror disabled (set SUPABASE_URL + SUPABASE_SECRET_KEY)');
}

const log = (msg) => {
  // eslint-disable-next-line no-console
  console.error(`[planka:supabase] ${msg}`);
};

function isEnabled() {
  return !!client;
}

/**
 * Build a snapshot row for the `cards` table.
 * `extras` lets callers attach board/list/project names already in scope.
 */
function buildCardRow(card, extras = {}) {
  if (!card || !card.id) return null;
  return {
    planka_id: String(card.id),
    board_id: card.boardId ? String(card.boardId) : null,
    list_id: card.listId ? String(card.listId) : null,
    project_name: extras.projectName || null,
    board_name: extras.boardName || null,
    list_name: extras.listName || null,
    list_type: extras.listType || null,
    name: card.name || null,
    description: card.description || null,
    position: typeof card.position === 'number' ? card.position : null,
    is_closed: !!card.isClosed,
    finalized_at: extras.finalizedAt || null,
    prev_list_id: card.prevListId ? String(card.prevListId) : null,
    labels: extras.labels || [],
    custom_fields: extras.customFields || {},
    creator_user_id: card.creatorUserId ? String(card.creatorUserId) : null,
  };
}

async function upsertCard(card, extras = {}) {
  if (!client) return;
  const row = buildCardRow(card, extras);
  if (!row) return;
  try {
    const { error } = await client.from('cards').upsert(row, { onConflict: 'planka_id' });
    if (error) log(`upsert card ${row.planka_id} failed: ${error.message}`);
  } catch (err) {
    log(`upsert card threw: ${err.message}`);
  }
}

/** Soft-delete: marca o card como deletado em vez de remover a linha. */
async function markCardDeleted(cardId) {
  if (!client) return;
  if (!cardId) return;
  try {
    const { error } = await client
      .from('cards')
      .update({ deleted_at: new Date().toISOString() })
      .eq('planka_id', String(cardId));
    if (error) log(`mark deleted ${cardId} failed: ${error.message}`);
  } catch (err) {
    log(`mark deleted threw: ${err.message}`);
  }
}

/** Patch específico de uma coluna no row do card (ex: list_id, name). */
async function patchCard(cardId, patch) {
  if (!client) return;
  if (!cardId) return;
  try {
    const { error } = await client.from('cards').update(patch).eq('planka_id', String(cardId));
    if (error) log(`patch card ${cardId} failed: ${error.message}`);
  } catch (err) {
    log(`patch card threw: ${err.message}`);
  }
}

async function logEvent({ cardId, eventType, data = {}, userEmail = null, userId = null }) {
  if (!client) return;
  if (!cardId) return;
  try {
    const { error } = await client.from('card_events').insert({
      planka_card_id: String(cardId),
      event_type: eventType,
      data,
      user_email: userEmail,
      user_id: userId ? String(userId) : null,
    });
    if (error) log(`log event ${eventType} for ${cardId} failed: ${error.message}`);
  } catch (err) {
    log(`log event threw: ${err.message}`);
  }
}

module.exports = {
  isEnabled,
  buildCardRow,
  upsertCard,
  markCardDeleted,
  patchCard,
  logEvent,
};
