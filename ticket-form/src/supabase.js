'use strict';

/**
 * Supabase client + write helpers used by the ticket-form handlers.
 *
 * Reads:
 *   SUPABASE_URL         e.g. https://gyplupcueedpttkmxckk.supabase.co
 *   SUPABASE_SECRET_KEY  service_role (server-only — never exposed to the form)
 *
 * If either env var is missing, the client is disabled and write helpers
 * become no-ops (logged once). This keeps the form working even when the
 * Supabase mirror is not configured yet.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || null;

let client = null;
let warned = false;

if (SUPABASE_URL && SUPABASE_SECRET_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
} else if (!warned) {
  console.warn(
    '[ticket-form] Supabase mirror disabled — set SUPABASE_URL and SUPABASE_SECRET_KEY to enable.',
  );
  warned = true;
}

function isEnabled() {
  return !!client;
}

/**
 * Insert a row in form_submissions describing what the form posted.
 *
 *   formType: 'design' | 'chamado'
 *   payload:  the raw object that was submitted
 *   plankaCardId: optional — id of the card just created on Planka
 *   osNumber: optional — only for chamado
 *   status: 'created' | 'failed'
 *   errorMessage: optional — only when status='failed'
 */
async function logFormSubmission({
  formType,
  payload,
  plankaCardId = null,
  osNumber = null,
  status = 'created',
  errorMessage = null,
}) {
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('form_submissions')
      .insert({
        form_type: formType,
        payload,
        planka_card_id: plankaCardId ? String(plankaCardId) : null,
        os_number: osNumber,
        status,
        error_message: errorMessage,
      })
      .select('id')
      .single();
    if (error) {
      console.error(`[ticket-form] supabase form_submissions failed: ${error.message}`);
      return null;
    }
    return data && data.id;
  } catch (err) {
    console.error(`[ticket-form] supabase form_submissions threw: ${err.message}`);
    return null;
  }
}

/**
 * Upsert the canonical state of a card. Called right after the card is
 * created on Planka, so we already have the snapshot of name + list + labels
 * + custom fields.
 */
async function upsertCard(card) {
  if (!client) return;
  if (!card || !card.planka_id) return;
  try {
    const { error } = await client
      .from('cards')
      .upsert(card, { onConflict: 'planka_id' });
    if (error) {
      console.error(`[ticket-form] supabase cards upsert failed: ${error.message}`);
    }
  } catch (err) {
    console.error(`[ticket-form] supabase cards upsert threw: ${err.message}`);
  }
}

/** Append an event to the card_events timeline. Best-effort, never throws. */
async function logCardEvent({ plankaCardId, eventType, data = {}, userEmail = null }) {
  if (!client) return;
  if (!plankaCardId) return;
  try {
    const { error } = await client.from('card_events').insert({
      planka_card_id: String(plankaCardId),
      event_type: eventType,
      data,
      user_email: userEmail,
    });
    if (error) {
      console.error(`[ticket-form] supabase card_events failed: ${error.message}`);
    }
  } catch (err) {
    console.error(`[ticket-form] supabase card_events threw: ${err.message}`);
  }
}

module.exports = {
  isEnabled,
  logFormSubmission,
  upsertCard,
  logCardEvent,
};
