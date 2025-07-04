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

  'webhooks/index': ['is-admin'],
  'webhooks/create': ['is-admin'],
  'webhooks/update': ['is-admin'],
  'webhooks/delete': ['is-admin'],

  'users/create': ['is-authenticated', 'is-admin'],
  'users/delete': ['is-authenticated', 'is-admin'],

  'projects/create': ['is-authenticated', 'is-admin-or-project-owner'],

  'config/show': true,
  'access-tokens/create': true,
  'access-tokens/exchange-with-oidc': true,
};
