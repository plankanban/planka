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
    baseCustomFieldGroup: {
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
    await sails.helpers.customFields.deleteRelated(inputs.record);

    const customField = await CustomField.qm.deleteOne(inputs.record.id);

    if (customField) {
      const scoper = sails.helpers.projects.makeScoper.with({
        record: inputs.project,
      });

      const customFieldGroupRelatedUserIds = await scoper.getProjectRelatedUserIds();

      customFieldGroupRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'customFieldDelete',
          {
            item: customField,
          },
          inputs.request,
        );
      });

      sails.helpers.utils.sendWebhooks.with({
        event: 'customFieldDelete',
        buildData: () => ({
          item: customField,
          included: {
            projects: [inputs.project],
            baseCustomFieldGroups: [inputs.baseCustomFieldGroup],
          },
        }),
        user: inputs.actorUser,
      });
    }

    return customField;
  },
};
