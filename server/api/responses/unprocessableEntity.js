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

/**
 * @swagger
 * components:
 *   responses:
 *     UnprocessableEntity:
 *       description: Request contains semantic errors or validation failures
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
 *                 example: E_UNPROCESSABLE_ENTITY
 *               message:
 *                 type: string
 *                 description: Error message
 *                 example: Validation failed
 */

module.exports = function unprocessableEntity(message) {
  const { res } = this;

  return res.status(422).json({
    code: 'E_UNPROCESSABLE_ENTITY',
    message,
  });
};
