/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * unprocessableEntity.js
 *
 * A custom response.
 *
 * Example usage:
 * ```
 *     return res.unprocessableEntity();
 *     // -or-
 *     return res.unprocessableEntity(optionalData);
 * ```
 *
 * Or with actions2:
 * ```
 *     exits: {
 *       somethingHappened: {
 *         responseType: 'unprocessableEntity'
 *       }
 *     }
 * ```
 *
 * ```
 *     throw 'somethingHappened';
 *     // -or-
 *     throw { somethingHappened: optionalData }
 * ```
 */

module.exports = function unprocessableEntity(message) {
  const { res } = this;

  return res.status(422).json({
    code: 'E_UNPROCESSABLE_ENTITY',
    message,
  });
};
