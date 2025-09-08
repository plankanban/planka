/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * conflict.js
 *
 * A custom response.
 *
 * Example usage:
 * ```
 *     return res.conflict();
 *     // -or-
 *     return res.conflict(optionalData);
 * ```
 *
 * Or with actions2:
 * ```
 *     exits: {
 *       somethingHappened: {
 *         responseType: 'conflict'
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

/**
 * @swagger
 * components:
 *   responses:
 *     Conflict:
 *       description: Request conflicts with current state of the resource
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - message
 *             properties:
 *               code:
 *                 type: string
 *                 description: Error code
 *                 example: E_CONFLICT
 *               message:
 *                 type: string
 *                 description: Error message
 *                 example: Resource already exists
 */

module.exports = function conflict(message) {
  const { res } = this;

  return res.status(409).json({
    code: 'E_CONFLICT',
    message,
  });
};
