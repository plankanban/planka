/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {
  /**
   *
   * Default policy for all controllers and actions, unless overridden.
   * (`true` allows public access)
   *
   */

  '*': 'is-authenticated',

  // 'users/index': ['is-authenticated', 'is-admin'],
  'users/create': ['is-authenticated', 'is-admin'],
  'users/delete': ['is-authenticated', 'is-admin'],

  'projects/create': ['is-authenticated', 'is-admin'],
  // 'projects/update': ['is-authenticated', 'is-admin'],
  // 'projects/update-background-image': ['is-authenticated', 'is-admin'],
  // 'projects/delete': ['is-authenticated', 'is-admin'],

  // 'project-memberships/create': ['is-authenticated', 'is-admin'],
  // 'project-memberships/delete': ['is-authenticated', 'is-admin'],

  // 'boards/create': ['is-authenticated', 'is-admin'],
  // 'boards/update': ['is-authenticated', 'is-admin'],
  // 'boards/delete': ['is-authenticated', 'is-admin'],

  'access-tokens/create': true,
  'access-tokens/exchange': true,
};
