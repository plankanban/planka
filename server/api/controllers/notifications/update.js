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

  exits: {
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, ['isRead']);

    const notifications = await sails.helpers.updateNotificationsForUser(
      inputs.ids.split(','),
      currentUser,
      values,
      this.req,
    );

    return exits.success({
      items: notifications,
    });
  },
};
