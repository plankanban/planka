/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  async fn() {
    const webhooks = await Webhook.qm.getAll();

    return {
      items: webhooks,
    };
  },
};
