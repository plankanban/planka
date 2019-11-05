/**
 * unauthorized.js
 *
 * A custom response.
 *
 * Example usage:
 * ```
 *     return res.unauthorized();
 *     // -or-
 *     return res.unauthorized(optionalData);
 * ```
 *
 * Or with actions2:
 * ```
 *     exits: {
 *       somethingHappened: {
 *         responseType: 'unauthorized'
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

module.exports = function unauthorized(message) {
  const { res } = this;

  return res.status(401).json({
    code: 'E_UNAUTHORIZED',
    message,
  });
};
