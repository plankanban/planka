const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true
    },
    values: {
      type: 'json',
      custom: value =>
        _.isPlainObject(value) &&
        (_.isUndefined(value.email) || _.isString(value.email)) &&
        (_.isUndefined(value.password) || _.isString(value.password)),
      required: true
    },
    request: {
      type: 'ref'
    }
  },

  fn: async function(inputs, exits) {
    if (!_.isUndefined(inputs.values.email)) {
      inputs.values.email = inputs.values.email.toLowerCase();
    }

    if (!_.isUndefined(inputs.values.password)) {
      inputs.values.password = bcrypt.hashSync(inputs.values.password, 10);
    }

    const user = await User.updateOne({
      id: inputs.record.id,
      deletedAt: null
    }).set(inputs.values);

    if (user) {
      if (inputs.record.avatar && user.avatar !== inputs.record.avatar) {
        try {
          fs.unlinkSync(
            path.join(sails.config.custom.uploadsPath, inputs.record.avatar)
          );
        } catch (unusedError) {}
      }

      const adminUserIds = await sails.helpers.getAdminUserIds();

      const projectIds = await sails.helpers.getMembershipProjectIdsForUser(
        user.id
      );

      const userIdsForProject = await sails.helpers.getMembershipUserIdsForProject(
        projectIds
      );

      const userIds = _.union([user.id], adminUserIds, userIdsForProject);

      userIds.forEach(userId => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'userUpdate',
          {
            item: user
          },
          inputs.request
        );
      });
    }

    return exits.success(user);
  }
};
