module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const notifications = await sails.helpers.users.getNotifications(currentUser.id);

    const actionIds = sails.helpers.utils.mapRecords(notifications, 'actionId');
    const actions = await sails.helpers.actions.getMany(actionIds);

    const userIds = sails.helpers.utils.mapRecords(actions, 'userId', true);
    const users = await sails.helpers.users.getMany(userIds, true);

    const cardIds = sails.helpers.utils.mapRecords(notifications, 'cardId');
    const cards = await sails.helpers.cards.getMany(cardIds);

    return {
      items: notifications,
      included: {
        users,
        cards,
        actions,
      },
    };
  },
};
