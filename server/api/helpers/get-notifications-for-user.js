module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: value => _.isString(value) || _.isArray(value),
      required: true
    }
  },

  fn: async function(inputs, exits) {
    const notifications = await sails.helpers.getNotifications({
      isRead: false,
      userId: inputs.id
    });

    return exits.success(notifications);
  }
};
