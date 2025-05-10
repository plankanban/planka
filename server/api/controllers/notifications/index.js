/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const notifications = await Notification.qm.getUnreadByUserId(currentUser.id);

    const userIds = sails.helpers.utils.mapRecords(notifications, 'creatorUserId', true, true);
    const users = await User.qm.getByIds(userIds);

    return {
      items: notifications,
      included: {
        users: sails.helpers.users.presentMany(users, currentUser),
      },
    };
  },
};
