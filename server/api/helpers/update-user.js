const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: (value) => _.isPlainObject(value)
        && (_.isUndefined(value.email) || _.isString(value.email))
        && (_.isUndefined(value.password) || _.isString(value.password)),
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    conflict: {},
  },

  async fn(inputs, exits) {
    if (!_.isUndefined(inputs.values.email)) {
      inputs.values.email = inputs.values.email.toLowerCase();
    }

    let isOnlyPasswordChange = false;

    if (!_.isUndefined(inputs.values.password)) {
      inputs.values.password = bcrypt.hashSync(inputs.values.password, 10);

      if (Object.keys(inputs.values).length === 1) {
        isOnlyPasswordChange = true;
      }
    }

    const user = await User.updateOne({
      id: inputs.record.id,
      deletedAt: null,
    })
      .set(inputs.values)
      .intercept(
        {
          message:
            'Unexpected error from database adapter: conflicting key value violates exclusion constraint "user_email_unique"',
        },
        'conflict',
      );

    if (user) {
      if (inputs.record.avatar && user.avatar !== inputs.record.avatar) {
        try {
          fs.unlinkSync(path.join(sails.config.custom.uploadsPath, inputs.record.avatar));
        } catch (error) {
          console.warn(error.stack); // eslint-disable-line no-console
        }
      }

      if (!isOnlyPasswordChange) {
        const adminUserIds = await sails.helpers.getAdminUserIds();

        const projectIds = await sails.helpers.getMembershipProjectIdsForUser(user.id);

        const userIdsForProject = await sails.helpers.getMembershipUserIdsForProject(projectIds);

        const userIds = _.union([user.id], adminUserIds, userIdsForProject);

        userIds.forEach((userId) => {
          sails.sockets.broadcast(
            `user:${userId}`,
            'userUpdate',
            {
              item: user,
            },
            inputs.request,
          );
        });
      }
    }

    return exits.success(user);
  },
};
