/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  async fn() {
    const { storageLimit } = sails.config.custom;

    if (storageLimit === null) {
      return null;
    }

    const storageUsage = await StorageUsage.qm.getOneMain();
    return BigInt(storageLimit) - BigInt(storageUsage.total);
  },
};
