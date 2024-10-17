module.exports = {
  inputs: {
    ids: {
      type: 'string',
      required: true,
      regex: /^[0-9]+(,[0-9]+)*$/,
    },
    isRead: {
      type: 'boolean',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, ['isRead']);

    const notifications = await sails.helpers.notifications.updateMany.with({
      values,
      recordsOrIds: inputs.ids.split(','),
      actorUser: currentUser,
      request: this.req,
    });

    return {
      items: notifications,
    };
  },
};
