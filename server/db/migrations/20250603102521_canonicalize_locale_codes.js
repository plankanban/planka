/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = (knex) =>
  knex.raw(`
    UPDATE user_account
    SET language =
      CASE
        WHEN language = 'sr-Cyrl-CS' THEN 'sr-Cyrl-RS'
        WHEN language = 'sr-Latn-CS' THEN 'sr-Latn-RS'
      END
    WHERE language IN ('sr-Cyrl-CS', 'sr-Latn-CS');
  `);

exports.down = (knex) =>
  knex.raw(`
    UPDATE user_account
    SET language =
      CASE
        WHEN language = 'sr-Cyrl-RS' THEN 'sr-Cyrl-CS'
        WHEN language = 'sr-Latn-RS' THEN 'sr-Latn-CS'
      END
    WHERE language IN ('sr-Cyrl-RS', 'sr-Latn-RS');
  `);
