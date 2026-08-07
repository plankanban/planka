/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * TrustedDevice.js
 *
 * @description :: Stores per-browser trust tokens that allow TOTP-protected users
 *                 to skip the TOTP step for a limited time period.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    tokenHash: {
      type: 'string',
      required: true,
      columnName: 'token_hash',
    },
    userAgentSummary: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      columnName: 'user_agent_summary',
    },
    browserName: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      columnName: 'browser_name',
    },
    browserVersion: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      columnName: 'browser_version',
    },
    osName: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      columnName: 'os_name',
    },
    osVersion: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      columnName: 'os_version',
    },
    deviceType: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      columnName: 'device_type',
    },
    deviceVendor: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      columnName: 'device_vendor',
    },
    deviceModel: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
      columnName: 'device_model',
    },
    label: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    expiresAt: {
      type: 'ref',
      required: true,
      columnName: 'expires_at',
    },
    lastUsedAt: {
      type: 'ref',
      columnName: 'last_used_at',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    userId: {
      model: 'User',
      required: true,
      columnName: 'user_id',
    },
  },

  tableName: 'trusted_device',
};
