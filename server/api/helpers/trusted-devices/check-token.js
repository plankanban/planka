/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const bcrypt = require('bcrypt');

module.exports = {
  inputs: {
    userId: {
      type: 'string',
      required: true,
    },
    plainToken: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const candidates = await TrustedDevice.qm.getActiveByUserId(inputs.userId);

    // eslint-disable-next-line no-restricted-syntax
    for (const candidate of candidates) {
      // eslint-disable-next-line no-await-in-loop
      const matched = await bcrypt.compare(inputs.plainToken, candidate.tokenHash);
      if (matched) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await TrustedDevice.qm.updateOne(
            { id: candidate.id },
            { lastUsedAt: new Date().toISOString() },
          );
        } catch (error) {
          sails.log.warn(
            `Failed to update lastUsedAt for trusted device ${candidate.id}: ${error.message}`,
          );
        }
        return true;
      }
    }

    return false;
  },
};
