/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const notifications = await sails.helpers.notifications.readAllForUser.with({
      user: currentUser,
      request: this.req,
    });

    return {
      items: notifications,
    };
  },
};
