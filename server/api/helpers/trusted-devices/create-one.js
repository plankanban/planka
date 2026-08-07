/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { TRUST_DEVICE_EXPIRES_IN_DAYS } = require('../../../constants');

const TOKEN_BYTES = 32;
const BCRYPT_ROUNDS = 10;

const buildUserAgentSummary = (userAgent) => {
  if (!userAgent) return null;
  return userAgent.length > 200 ? userAgent.slice(0, 200) : userAgent;
};

module.exports = {
  inputs: {
    userId: {
      type: 'string',
      required: true,
    },
    userAgent: {
      type: 'string',
      allowNull: true,
    },
  },

  async fn(inputs) {
    const plainToken = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
    const tokenHash = await bcrypt.hash(plainToken, BCRYPT_ROUNDS);

    const expiresAt = new Date(
      Date.now() + TRUST_DEVICE_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const fingerprint = sails.helpers.utils.parseUserAgent.with({ userAgent: inputs.userAgent });

    const record = await TrustedDevice.qm.createOne({
      userId: inputs.userId,
      tokenHash,
      userAgentSummary: buildUserAgentSummary(inputs.userAgent),
      browserName: fingerprint.browserName,
      browserVersion: fingerprint.browserVersion,
      osName: fingerprint.osName,
      osVersion: fingerprint.osVersion,
      deviceType: fingerprint.deviceType,
      deviceVendor: fingerprint.deviceVendor,
      deviceModel: fingerprint.deviceModel,
      expiresAt,
      lastUsedAt: new Date().toISOString(),
    });

    return { record, plainToken };
  },
};
