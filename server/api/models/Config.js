/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Config.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Config:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the config (always set to '1')
 *           example: "1"
 *         smtpHost:
 *           type: string
 *           nullable: true
 *           description: Hostname or IP address of the SMTP server
 *           example: smtp.example.com
 *         smtpPort:
 *           type: number
 *           nullable: true
 *           description: Port number of the SMTP server
 *           example: 587
 *         smtpName:
 *           type: string
 *           nullable: true
 *           description: Client hostname used in the EHLO command for SMTP
 *           example: localhost
 *         smtpSecure:
 *           type: boolean
 *           description: Whether to use a secure connection for SMTP
 *           example: false
 *         smtpTlsRejectUnauthorized:
 *           type: boolean
 *           description: Whether to reject unauthorized or self-signed TLS certificates for SMTP connections
 *           example: true
 *         smtpUser:
 *           type: string
 *           nullable: true
 *           description: Username for authenticating with the SMTP server
 *           example: no-reply@example.com
 *         smtpPassword:
 *           type: string
 *           nullable: true
 *           description: Password for authenticating with the SMTP server
 *           example: SecurePassword123!
 *         smtpFrom:
 *           type: string
 *           nullable: true
 *           description: Default "from" used for outgoing SMTP emails
 *           example: no-reply@example.com
 *         ldapEnabled:
 *           type: boolean
 *           description: Whether LDAP authentication is enabled
 *           example: false
 *         ldapHost:
 *           type: string
 *           nullable: true
 *           description: Hostname or IP address of the LDAP server
 *           example: ldap.example.com
 *         ldapPort:
 *           type: number
 *           nullable: true
 *           description: Port number of the LDAP server
 *           example: 389
 *         ldapTls:
 *           type: boolean
 *           description: Whether to use LDAPS (LDAP over TLS)
 *           example: false
 *         ldapBindDn:
 *           type: string
 *           nullable: true
 *           description: Distinguished name of the service account used to search the directory
 *           example: cn=admin,dc=example,dc=com
 *         ldapBindPassword:
 *           type: string
 *           nullable: true
 *           description: Password of the LDAP service account
 *           example: SecurePassword123!
 *         ldapBaseDn:
 *           type: string
 *           nullable: true
 *           description: Base distinguished name to search for users under
 *           example: dc=example,dc=com
 *         ldapUserFilter:
 *           type: string
 *           nullable: true
 *           description: Search filter used to locate a user by username, containing a `{{username}}` placeholder
 *           example: (uid={{username}})
 *         ldapNameAttribute:
 *           type: string
 *           nullable: true
 *           description: LDAP attribute mapped to the user's display name
 *           example: cn
 *         ldapEmailAttribute:
 *           type: string
 *           nullable: true
 *           description: LDAP attribute mapped to the user's email
 *           example: mail
 *         ldapUsernameAttribute:
 *           type: string
 *           nullable: true
 *           description: LDAP attribute mapped to the user's username
 *           example: uid
 *         ldapRolesAttribute:
 *           type: string
 *           nullable: true
 *           description: LDAP attribute containing the user's group memberships
 *           example: memberOf
 *         ldapAdminRoles:
 *           type: array
 *           items:
 *             type: string
 *           description: Group DNs/names mapped to the admin role
 *         ldapProjectOwnerRoles:
 *           type: array
 *           items:
 *             type: string
 *           description: Group DNs/names mapped to the project owner role
 *         ldapBoardUserRoles:
 *           type: array
 *           items:
 *             type: string
 *           description: Group DNs/names mapped to the board user role
 *         ldapSshTunnelEnabled:
 *           type: boolean
 *           description: Whether to route the LDAP connection through an SSH tunnel
 *           example: false
 *         ldapSshHost:
 *           type: string
 *           nullable: true
 *           description: Hostname or IP address of the SSH jump host
 *         ldapSshPort:
 *           type: number
 *           nullable: true
 *           description: Port number of the SSH jump host
 *           example: 22
 *         ldapSshUsername:
 *           type: string
 *           nullable: true
 *           description: Username for authenticating with the SSH jump host
 *         ldapSshPassword:
 *           type: string
 *           nullable: true
 *           description: Password for authenticating with the SSH jump host
 *         ldapSshRemoteHost:
 *           type: string
 *           nullable: true
 *           description: Hostname or IP address of the LDAP server as seen from the SSH jump host
 *         ldapSshRemotePort:
 *           type: number
 *           nullable: true
 *           description: Port number of the LDAP server as seen from the SSH jump host
 *         ldapSshHostKeyFingerprint:
 *           type: string
 *           nullable: true
 *           description: Expected SHA256 fingerprint of the SSH jump host's public key, used to verify its identity and prevent MITM attacks
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the config was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the config was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

const MAIN_ID = '1';

const SMTP_FIELD_NAMES = [
  'smtpHost',
  'smtpPort',
  'smtpName',
  'smtpSecure',
  'smtpTlsRejectUnauthorized',
  'smtpUser',
  'smtpPassword',
  'smtpFrom',
];

const LDAP_FIELD_NAMES = [
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
];

module.exports = {
  MAIN_ID,
  SMTP_FIELD_NAMES,
  LDAP_FIELD_NAMES,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    smtpHost: {
      type: 'string',
      allowNull: true,
      columnName: 'smtp_host',
    },
    smtpPort: {
      type: 'number',
      allowNull: true,
      columnName: 'smtp_port',
    },
    smtpName: {
      type: 'string',
      allowNull: true,
      columnName: 'smtp_name',
    },
    smtpSecure: {
      type: 'boolean',
      required: true,
      columnName: 'smtp_secure',
    },
    smtpTlsRejectUnauthorized: {
      type: 'boolean',
      required: true,
      columnName: 'smtp_tls_reject_unauthorized',
    },
    smtpUser: {
      type: 'string',
      allowNull: true,
      columnName: 'smtp_user',
    },
    smtpPassword: {
      type: 'string',
      allowNull: true,
      columnName: 'smtp_password',
    },
    smtpFrom: {
      type: 'string',
      allowNull: true,
      columnName: 'smtp_from',
    },

    ldapEnabled: {
      type: 'boolean',
      required: true,
      columnName: 'ldap_enabled',
    },
    ldapHost: {
      type: 'string',
      allowNull: true,
      columnName: 'ldap_host',
    },
    ldapPort: {
      type: 'number',
      allowNull: true,
      columnName: 'ldap_port',
    },
    ldapTls: {
      type: 'boolean',
      required: true,
      columnName: 'ldap_tls',
    },
    ldapBindDn: {
      type: 'string',
      allowNull: true,
      columnName: 'ldap_bind_dn',
    },
    ldapBindPassword: {
      type: 'string',
      allowNull: true,
      columnName: 'ldap_bind_password',
    },
    ldapBaseDn: {
      type: 'string',
      allowNull: true,
      columnName: 'ldap_base_dn',
    },
    ldapUserFilter: {
      type: 'string',
      allowNull: true,
      columnName: 'ldap_user_filter',
    },
    ldapNameAttribute: {
      type: 'string',
      allowNull: true,
      columnName: 'ldap_name_attribute',
    },
    ldapEmailAttribute: {
      type: 'string',
      allowNull: true,
      columnName: 'ldap_email_attribute',
    },
    ldapUsernameAttribute: {
      type: 'string',
      allowNull: true,
      columnName: 'ldap_username_attribute',
    },
    ldapRolesAttribute: {
      type: 'string',
      allowNull: true,
      columnName: 'ldap_roles_attribute',
    },
    ldapAdminRoles: {
      type: 'json',
      defaultsTo: [],
      columnName: 'ldap_admin_roles',
    },
    ldapProjectOwnerRoles: {
      type: 'json',
      defaultsTo: [],
      columnName: 'ldap_project_owner_roles',
    },
    ldapBoardUserRoles: {
      type: 'json',
      defaultsTo: [],
      columnName: 'ldap_board_user_roles',
    },
    ldapSshTunnelEnabled: {
      type: 'boolean',
      required: true,
      columnName: 'ldap_ssh_tunnel_enabled',
    },
    ldapSshHost: {
      type: 'string',
      allowNull: true,
      columnName: 'ldap_ssh_host',
    },
    ldapSshPort: {
      type: 'number',
      allowNull: true,
      columnName: 'ldap_ssh_port',
    },
    ldapSshUsername: {
      type: 'string',
      allowNull: true,
      columnName: 'ldap_ssh_username',
    },
    ldapSshPassword: {
      type: 'string',
      allowNull: true,
      columnName: 'ldap_ssh_password',
    },
    ldapSshRemoteHost: {
      type: 'string',
      allowNull: true,
      columnName: 'ldap_ssh_remote_host',
    },
    ldapSshRemotePort: {
      type: 'number',
      allowNull: true,
      columnName: 'ldap_ssh_remote_port',
    },
    ldapSshHostKeyFingerprint: {
      type: 'string',
      allowNull: true,
      columnName: 'ldap_ssh_host_key_fingerprint',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
  },
};
