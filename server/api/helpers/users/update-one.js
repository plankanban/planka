const path = require('path');
const bcrypt = require('bcrypt');
const rimraf = require('rimraf');

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: (value) => {
        if (!_.isPlainObject(value)) {
          return false;
        }

        if (!_.isUndefined(value.email) && !_.isString(value.email)) {
          return false;
        }

        if (!_.isUndefined(value.password) && !_.isString(value.password)) {
          return false;
        }

        if (value.username && !_.isString(value.username)) {
          return false;
        }

        if (!_.isUndefined(value.avatarUrl) && !_.isNull(value.avatarUrl)) {
          return false;
        }

        return true;
      },
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    emailAlreadyInUse: {},
    usernameAlreadyInUse: {},
  },

  async fn(inputs) {
    if (!_.isUndefined(inputs.values.email)) {
      // eslint-disable-next-line no-param-reassign
      inputs.values.email = inputs.values.email.toLowerCase();
    }

    let isOnlyPasswordChange = false;

    if (!_.isUndefined(inputs.values.password)) {
      // eslint-disable-next-line no-param-reassign
      inputs.values.password = bcrypt.hashSync(inputs.values.password, 10);

      if (Object.keys(inputs.values).length === 1) {
        isOnlyPasswordChange = true;
      }
    }

    if (inputs.values.username) {
      // eslint-disable-next-line no-param-reassign
      inputs.values.username = inputs.values.username.toLowerCase();
    }

    if (!_.isUndefined(inputs.values.avatarUrl)) {
      /* eslint-disable no-param-reassign */
      inputs.values.avatarDirname = null;
      delete inputs.values.avatarUrl;
      /* eslint-enable no-param-reassign */
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
        'emailAlreadyInUse',
      )
      .intercept(
        {
          message:
            'Unexpected error from database adapter: conflicting key value violates exclusion constraint "user_username_unique"',
        },
        'usernameAlreadyInUse',
      );

    if (user) {
      if (inputs.record.avatarDirname && user.avatarDirname !== inputs.record.avatarDirname) {
        try {
          rimraf.sync(path.join(sails.config.custom.userAvatarsPath, inputs.record.avatarDirname));
        } catch (error) {
          console.warn(error.stack); // eslint-disable-line no-console
        }
      }

      if (!isOnlyPasswordChange) {
        /* const projectIds = await sails.helpers.users.getManagerProjectIds(user.id);

        const userIds = _.union(
          [user.id],
          await sails.helpers.users.getAdminIds(),
          await sails.helpers.projects.getManagerAndBoardMemberUserIds(projectIds),
        ); */

        const users = await sails.helpers.users.getMany();
        const userIds = sails.helpers.utils.mapRecords(users);

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

    return user;
  },
};
