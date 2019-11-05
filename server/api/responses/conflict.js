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

module.exports = function conflict(message) {
  const { res } = this;

  return res.status(409).json({
    code: 'E_CONFLICT',
    message,
  });
};
