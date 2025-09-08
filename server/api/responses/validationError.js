/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * validationError.js
 *
 * A custom response.
 *
 * Example usage:
 * ```
 *     return res.validationError();
 *     // -or-
 *     return res.validationError(optionalData);
 * ```
 *
 * Or with actions2:
 * ```
 *     exits: {
 *       somethingHappened: {
 *         responseType: 'validationError'
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
 *     ValidationError:
 *       description: Request validation failed due to missing or invalid parameters
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - problems
 *               - message
 *             properties:
 *               code:
 *                 type: string
 *                 description: Error code
 *                 example: E_MISSING_OR_INVALID_PARAMS
 *               problems:
 *                 type: array
 *                 description: Array of specific validation error messages
 *                 items:
 *                   type: string
 *                 example: [
 *                   "\"emailOrUsername\" is required, but it was not defined.",
 *                   "\"password\" is required, but it was not defined."
 *                 ]
 *               message:
 *                 type: string
 *                 description: Error message
 *                 example: The server could not fulfill this request (`POST /api/access-tokens`) due to 2 missing or invalid parameters.
 */

module.exports = function validationError() {};
