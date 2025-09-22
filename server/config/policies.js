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

  '*': ['is-authenticated', 'is-external'],

  'config/show': ['is-authenticated', 'is-admin'],
  'config/update': ['is-authenticated', 'is-admin'],
  'config/test-smtp': ['is-authenticated', 'is-admin'],

  'webhooks/index': ['is-authenticated', 'is-external', 'is-admin'],
  'webhooks/create': ['is-authenticated', 'is-external', 'is-admin'],
  'webhooks/update': ['is-authenticated', 'is-external', 'is-admin'],
  'webhooks/delete': ['is-authenticated', 'is-external', 'is-admin'],

  'users/index': 'is-authenticated',
  'users/create': ['is-authenticated', 'is-admin'],
  'users/show': 'is-authenticated',
  'users/update': 'is-authenticated',
  'users/update-email': 'is-authenticated',
  'users/update-password': 'is-authenticated',
  'users/update-username': 'is-authenticated',
  'users/update-avatar': 'is-authenticated',
  'users/delete': ['is-authenticated', 'is-admin'],

  'projects/create': ['is-authenticated', 'is-external', 'is-admin-or-project-owner'],

  'bootstrap/show': true,
  'terms/show': true,
  'access-tokens/create': true,
  'access-tokens/exchange-with-oidc': true,
  'access-tokens/accept-terms': true,
  'access-tokens/revoke-pending-token': true,
};
