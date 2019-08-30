module.exports = {
  fn: async function(inputs, exits) {
    const { currentUser } = this.req;

    const notifications = await sails.helpers.getNotificationsForUser(
      currentUser.id
    );

    const actionIds = sails.helpers.mapRecords(notifications, 'actionId');
    const actions = await sails.helpers.getActions(actionIds);

    const cardIds = sails.helpers.mapRecords(notifications, 'cardId');
    const cards = await sails.helpers.getCards(cardIds);

    const userIds = sails.helpers.mapRecords(actions, 'userId', true);
    const users = await sails.helpers.getUsers(userIds);

    return exits.success({
      items: notifications,
      included: {
        users,
        cards,
        actions
      }
    });
  }
};
