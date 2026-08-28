/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Counts wrong second-factor codes against the one half-finished login they
// were entered into. A pending token stays valid for ten minutes, and six
// digits fall to patience — without a counter those ten minutes are ten
// minutes of free guessing. When the count runs out the session is destroyed
// and the login starts over from the password.
//
// It lives on the row rather than in memory so it survives a restart and holds
// across every process serving the instance.

module.exports.up = (knex) =>
  knex.schema.alterTable('session', (table) => {
    // The default belongs on the column: sessions are also created by raw
    // inserts that never pass through the model, and those would write NULL.
    table.integer('pending_token_attempts').notNullable().defaultTo(0);
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('session', (table) => {
    table.dropColumn('pending_token_attempts');
  });
