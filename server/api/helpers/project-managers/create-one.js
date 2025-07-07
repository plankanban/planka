/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    webhooks: {
      type: 'ref',
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    projectInValuesMustBePrivate: {},
    userInValuesMustBeAdminOrProjectOwner: {},
    userAlreadyProjectManager: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (values.project.ownerProjectManagerId) {
      throw 'projectInValuesMustBePrivate';
    }

    if (!sails.helpers.users.isAdminOrProjectOwner(values.user)) {
      throw 'userInValuesMustBeAdminOrProjectOwner';
    }

    let projectManager;
    try {
      projectManager = await ProjectManager.qm.createOne({
        projectId: values.project.id,
        userId: values.user.id,
      });
    } catch (error) {
      if (error.code === 'E_UNIQUE') {
        throw 'userAlreadyProjectManager';
      }

      throw error;
    }

    const scoper = sails.helpers.projects.makeScoper.with({
      record: values.project,
    });

    const projectRelatedUserIds = await scoper.getProjectRelatedUserIds();

    projectRelatedUserIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'projectManagerCreate',
        {
          item: projectManager,
          included: {
            users: [sails.helpers.users.presentOne(values.user, {})], // FIXME: hack
          },
        },
        inputs.request,
      );
    });

    const { webhooks = await Webhook.qm.getAll() } = inputs;

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.PROJECT_MANAGER_CREATE,
      buildData: () => ({
        item: projectManager,
        included: {
          users: [sails.helpers.users.presentOne(values.user)],
          projects: [values.project],
        },
      }),
      user: inputs.actorUser,
    });

    return projectManager;
  },
};
