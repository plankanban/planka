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
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const baseCustomFieldGroup = await BaseCustomFieldGroup.qm.createOne({
      ...values,
      projectId: values.project.id,
    });

    const scoper = sails.helpers.projects.makeScoper.with({
      record: values.project,
    });

    const projectRelatedUserIds = await scoper.getProjectRelatedUserIds();

    projectRelatedUserIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'baseCustomFieldGroupCreate',
        {
          item: baseCustomFieldGroup,
        },
        inputs.request,
      );
    });

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.BASE_CUSTOM_FIELD_GROUP_CREATE,
      buildData: () => ({
        item: baseCustomFieldGroup,
        included: {
          projects: [values.project],
        },
      }),
      user: inputs.actorUser,
    });

    return baseCustomFieldGroup;
  },
};
