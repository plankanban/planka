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
    await sails.helpers.baseCustomFieldGroups.deleteRelated(inputs.record);

    const baseCustomFieldGroup = await BaseCustomFieldGroup.qm.deleteOne(inputs.record.id);

    if (baseCustomFieldGroup) {
      const scoper = sails.helpers.projects.makeScoper.with({
        record: inputs.project,
      });

      const projectRelatedUserIds = await scoper.getProjectRelatedUserIds();

      projectRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'baseCustomFieldGroupDelete',
          {
            item: baseCustomFieldGroup,
          },
          inputs.request,
        );
      });

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.BASE_CUSTOM_FIELD_GROUP_DELETE,
        buildData: () => ({
          item: baseCustomFieldGroup,
          included: {
            projects: [inputs.project],
          },
        }),
        user: inputs.actorUser,
      });
    }

    return baseCustomFieldGroup;
  },
};
