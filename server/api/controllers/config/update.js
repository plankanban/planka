/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /config:
 *   patch:
 *     summary: Update application configuration
 *     description: Updates the application configuration. Requires admin privileges.
 *     tags:
 *       - Config
 *     operationId: updateConfig
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               smtpHost:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: Hostname or IP address of the SMTP server
 *                 example: smtp.example.com
 *               smtpPort:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 65535
 *                 nullable: true
 *                 description: Port number of the SMTP server
 *                 example: 587
 *               smtpName:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: Client hostname used in the EHLO command for SMTP
 *                 example: localhost
 *               smtpSecure:
 *                 type: boolean
 *                 description: Whether to use a secure connection for SMTP
 *                 example: false
 *               smtpTlsRejectUnauthorized:
 *                 type: boolean
 *                 description: Whether to reject unauthorized or self-signed TLS certificates for SMTP connections
 *                 example: true
 *               smtpUser:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: Username for authenticating with the SMTP server
 *                 example: no-reply@example.com
 *               smtpPassword:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: Password for authenticating with the SMTP server
 *                 example: SecurePassword123!
 *               smtpFrom:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: Default "from" used for outgoing SMTP emails
 *                 example: no-reply@example.com
 *               ldapEnabled:
 *                 type: boolean
 *                 description: Whether LDAP authentication is enabled
 *                 example: false
 *               ldapHost:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: Hostname or IP address of the LDAP server
 *                 example: ldap.example.com
 *               ldapPort:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 65535
 *                 nullable: true
 *                 description: Port number of the LDAP server
 *                 example: 389
 *               ldapTls:
 *                 type: boolean
 *                 description: Whether to use LDAPS (LDAP over TLS)
 *                 example: false
 *               ldapBindDn:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: Distinguished name of the service account used to search the directory
 *                 example: cn=admin,dc=example,dc=com
 *               ldapBindPassword:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: Password of the LDAP service account
 *                 example: SecurePassword123!
 *               ldapBaseDn:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: Base distinguished name to search for users under
 *                 example: dc=example,dc=com
 *               ldapUserFilter:
 *                 type: string
 *                 maxLength: 512
 *                 nullable: true
 *                 description: Search filter used to locate a user by username, containing a `{{username}}` placeholder
 *                 example: (uid={{username}})
 *               ldapNameAttribute:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: LDAP attribute mapped to the user's display name
 *                 example: cn
 *               ldapEmailAttribute:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: LDAP attribute mapped to the user's email
 *                 example: mail
 *               ldapUsernameAttribute:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: LDAP attribute mapped to the user's username
 *                 example: uid
 *               ldapRolesAttribute:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: LDAP attribute containing the user's group memberships
 *                 example: memberOf
 *               ldapAdminRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Group DNs/names mapped to the admin role
 *               ldapProjectOwnerRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Group DNs/names mapped to the project owner role
 *               ldapBoardUserRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Group DNs/names mapped to the board user role
 *               ldapSshTunnelEnabled:
 *                 type: boolean
 *                 description: Whether to route the LDAP connection through an SSH tunnel
 *                 example: false
 *               ldapSshHost:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: Hostname or IP address of the SSH jump host
 *               ldapSshPort:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 65535
 *                 nullable: true
 *                 description: Port number of the SSH jump host
 *                 example: 22
 *               ldapSshUsername:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: Username for authenticating with the SSH jump host
 *               ldapSshPassword:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: Password for authenticating with the SSH jump host
 *               ldapSshRemoteHost:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: Hostname or IP address of the LDAP server as seen from the SSH jump host
 *               ldapSshRemotePort:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 65535
 *                 nullable: true
 *                 description: Port number of the LDAP server as seen from the SSH jump host
 *               ldapSshHostKeyFingerprint:
 *                 type: string
 *                 maxLength: 256
 *                 nullable: true
 *                 description: Expected SHA256 fingerprint of the SSH jump host's public key, used to verify its identity and prevent MITM attacks
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Config'
 */

module.exports = {
  inputs: {
    smtpHost: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    smtpPort: {
      type: 'number',
      min: 0,
      max: 65535,
      allowNull: true,
    },
    smtpName: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    smtpSecure: {
      type: 'boolean',
    },
    smtpTlsRejectUnauthorized: {
      type: 'boolean',
    },
    smtpUser: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    smtpPassword: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    smtpFrom: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },

    ldapEnabled: {
      type: 'boolean',
    },
    ldapHost: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    ldapPort: {
      type: 'number',
      min: 0,
      max: 65535,
      allowNull: true,
    },
    ldapTls: {
      type: 'boolean',
    },
    ldapBindDn: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    ldapBindPassword: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    ldapBaseDn: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    ldapUserFilter: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 512,
      allowNull: true,
    },
    ldapNameAttribute: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    ldapEmailAttribute: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    ldapUsernameAttribute: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    ldapRolesAttribute: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    ldapAdminRoles: {
      type: 'json',
      custom: (value) => Array.isArray(value) && value.every((item) => typeof item === 'string'),
    },
    ldapProjectOwnerRoles: {
      type: 'json',
      custom: (value) => Array.isArray(value) && value.every((item) => typeof item === 'string'),
    },
    ldapBoardUserRoles: {
      type: 'json',
      custom: (value) => Array.isArray(value) && value.every((item) => typeof item === 'string'),
    },
    ldapSshTunnelEnabled: {
      type: 'boolean',
    },
    ldapSshHost: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    ldapSshPort: {
      type: 'number',
      min: 0,
      max: 65535,
      allowNull: true,
    },
    ldapSshUsername: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    ldapSshPassword: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    ldapSshRemoteHost: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    ldapSshRemotePort: {
      type: 'number',
      min: 0,
      max: 65535,
      allowNull: true,
    },
    ldapSshHostKeyFingerprint: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, [
      'smtpHost',
      'smtpPort',
      'smtpName',
      'smtpSecure',
      'smtpTlsRejectUnauthorized',
      'smtpUser',
      'smtpPassword',
      'smtpFrom',
      'ldapEnabled',
      'ldapHost',
      'ldapPort',
      'ldapTls',
      'ldapBindDn',
      'ldapBindPassword',
      'ldapBaseDn',
      'ldapUserFilter',
      'ldapNameAttribute',
      'ldapEmailAttribute',
      'ldapUsernameAttribute',
      'ldapRolesAttribute',
      'ldapAdminRoles',
      'ldapProjectOwnerRoles',
      'ldapBoardUserRoles',
      'ldapSshTunnelEnabled',
      'ldapSshHost',
      'ldapSshPort',
      'ldapSshUsername',
      'ldapSshPassword',
      'ldapSshRemoteHost',
      'ldapSshRemotePort',
      'ldapSshHostKeyFingerprint',
    ]);

    const config = await sails.helpers.config.updateMain.with({
      values,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: sails.helpers.config.presentOne(config),
    };
  },
};
