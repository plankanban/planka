const path = require('path');
const bcrypt = require('bcrypt');
const rimraf = require('rimraf');
const { v4: uuid } = require('uuid');

const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isUndefined(value.email) && !_.isString(value.email)) {
    return false;
  }

  if (!_.isUndefined(value.password) && !_.isString(value.password)) {
    return false;
  }

  if (!_.isNil(value.username) && !_.isString(value.username)) {
    return false;
  }

  if (!_.isNil(value.avatar) && !_.isPlainObject(value.avatar)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: valuesValidator,
      required: true,
    },
    actorUser: {
      type: 'ref',
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
    const { values } = inputs;

    if (!_.isUndefined(values.email)) {
      values.email = values.email.toLowerCase();
    }

    let isOnlyPasswordChange = false;

    if (!_.isUndefined(values.password)) {
      if (Object.keys(values).length === 1) {
        isOnlyPasswordChange = true;
      }

      Object.assign(values, {
        password: bcrypt.hashSync(values.password, 10),
        passwordChangedAt: new Date().toUTCString(), // FIXME: hack
      });
    }

    if (values.username) {
      values.username = values.username.toLowerCase();
    }

    const user = await User.updateOne({
      id: inputs.record.id,
      deletedAt: null,
    })
      .set({ ...values })
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
      if (
        inputs.record.avatar &&
        (!user.avatar || user.avatar.dirname !== inputs.record.avatar.dirname)
      ) {
        try {
          if (sails.config.custom.s3Config) {
            const client = await sails.helpers.utils.getSimpleStorageServiceClient();
            if (client && inputs.record.avatar && inputs.record.avatar.original) {
              const parsedUrl = new URL(inputs.record.avatar.original);
              await client.delete({ Key: parsedUrl.pathname.replace(/^\/+/, '') });
            }
            if (client && inputs.record.avatar && inputs.record.avatar.square) {
              const parsedUrl = new URL(inputs.record.avatar.square);
              await client.delete({ Key: parsedUrl.pathname.replace(/^\/+/, '') });
            }
          }
        } catch (error) {
          console.warn(error.stack); // eslint-disable-line no-console
        }
        try {
          rimraf.sync(path.join(sails.config.custom.userAvatarsPath, inputs.record.avatar.dirname));
        } catch (error) {
          console.warn(error.stack); // eslint-disable-line no-console
        }
      }

      if (!_.isUndefined(values.password)) {
        sails.sockets.broadcast(
          `user:${user.id}`,
          'userDelete', // TODO: introduce separate event
          {
            item: user,
          },
          inputs.request,
        );

        if (user.id === inputs.actorUser.id && inputs.request && inputs.request.isSocket) {
          const tempRoom = uuid();

          sails.sockets.addRoomMembersToRooms(`@user:${user.id}`, tempRoom, () => {
            sails.sockets.leave(inputs.request, tempRoom, () => {
              sails.sockets.leaveAll(tempRoom);
            });
          });
        } else {
          sails.sockets.leaveAll(`@user:${user.id}`);
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

        sails.helpers.utils.sendWebhooks.with({
          event: 'userUpdate',
          data: {
            item: user,
          },
          prevData: {
            item: inputs.record,
          },
          user: inputs.actorUser,
        });
      }
    }

    return user;
  },
};
