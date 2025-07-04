/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    project: {
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

    const baseCustomFieldGroup = await BaseCustomFieldGroup.qm.updateOne(inputs.record.id, values);

    if (baseCustomFieldGroup) {
      const scoper = sails.helpers.projects.makeScoper.with({
        record: inputs.project,
      });

      const projectRelatedUserIds = await scoper.getProjectRelatedUserIds();

      projectRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'baseCustomFieldGroupUpdate',
          {
            item: baseCustomFieldGroup,
          },
          inputs.request,
        );
      });

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.BASE_CUSTOM_FIELD_GROUP_UPDATE,
        buildData: () => ({
          item: baseCustomFieldGroup,
          included: {
            projects: [inputs.project],
          },
        }),
        buildPrevData: () => ({
          item: inputs.record,
        }),
        user: inputs.actorUser,
      });
    }

    return baseCustomFieldGroup;
  },
};
