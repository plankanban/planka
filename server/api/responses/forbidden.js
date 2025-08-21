/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * forbidden.js
 *
 * A custom response.
 *
 * Example usage:
 * ```
 *     return res.forbidden();
 *     // -or-
 *     return res.forbidden(optionalData);
 * ```
 *
 * Or with actions2:
 * ```
 *     exits: {
 *       somethingHappened: {
 *         responseType: 'forbidden'
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

module.exports = function forbidden(message) {
  const { res } = this;

  const data = {
    code: 'E_FORBIDDEN',
  };

  if (_.isPlainObject(message)) {
    Object.assign(data, message);
  } else {
    data.message = message;
  }

  return res.status(403).json(data);
};
