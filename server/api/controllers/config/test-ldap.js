/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /config/test-ldap:
 *   post:
 *     summary: Test LDAP configuration
 *     description: Attempts to bind to the LDAP server and read the base DN to verify LDAP is configured correctly. Only available when LDAP is enabled.
 *     tags:
 *       - Config
 *     operationId: testLdapConfig
 *     responses:
 *       200:
 *         description: Test completed (see included logs for the outcome)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Config'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

const { search } = require('../../../utils/ldap');

const Errors = {
  NOT_AVAILABLE: {
    notAvailable: 'Not available',
  },
};

module.exports = {
  exits: {
    notAvailable: {
      responseType: 'forbidden',
    },
  },

  async fn() {
    const initialConfig = await Config.qm.getOneMain();

    if (!initialConfig.ldapEnabled) {
      return Errors.NOT_AVAILABLE;
    }

    const logs = ['🔌 Connecting to LDAP server...'];

    let config = initialConfig;
    let close = async () => {};

    try {
      const ldapClient = await sails.helpers.utils.makeLdapClient();
      ({ config, close } = ldapClient);
      const { client } = ldapClient;

      logs.push('✅ Bind successful.', '');

      logs.push('🔍 Reading base DN...');
      await search(client, config.ldapBaseDn, {
        filter: '(objectClass=*)',
        scope: 'base',
        attributes: [config.ldapUsernameAttribute || 'uid'],
      });

      logs.push('✅ Base DN is reachable.', '');
      logs.push('🎉 Your configuration is working correctly.');
    } catch (error) {
      logs.push('❌ Connection failed.', '');

      if (error.code) {
        logs.push(`⚠️ Error code: ${error.code}`);
      }
      logs.push(`💬 Reason: ${(error.message || String(error)).trim()}`);

      if (['ECONNREFUSED', 'ETIMEDOUT', 'EHOSTUNREACH'].includes(error.code)) {
        logs.push('', '💡 Hint: Check your host and port settings.');
      } else if (error.name === 'InvalidCredentialsError') {
        logs.push('', '💡 Hint: Check your bind DN and bind password.');
      } else if (error.name === 'NoSuchObjectError') {
        logs.push('', '💡 Hint: Check your base DN.');
      } else if (error.message && error.message.toLowerCase().includes('certificate')) {
        logs.push('', '💡 Hint: Check your TLS (LDAPS) settings.');
      }
    } finally {
      await close();
    }

    return {
      item: sails.helpers.config.presentOne(config),
      included: {
        logs,
      },
    };
  },
};
