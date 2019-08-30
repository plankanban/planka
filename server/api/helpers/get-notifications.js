module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: value => _.isArray(value) || _.isPlainObject(value)
    }
  },

  fn: async function(inputs, exits) {
    const notifications = await Notification.find(inputs.criteria).sort(
      'id DESC'
    );

    return exits.success(notifications);
  }
};
