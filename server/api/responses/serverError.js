/**
 * serverError.js
 *
 * A custom response.
 *
 * Example usage:
 * ```
 *     return res.serverError();
 *     // -or-
 *     return res.serverError(optionalData);
 * ```
 *
 * Or with actions2:
 * ```
 *     exits: {
 *       somethingHappened: {
 *         responseType: 'serverError'
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

module.exports = function serverError(message) {
  const { res } = this;

  return res.status(500).json({
    code: 'E_SERVER_ERROR',
    message,
  });
};
