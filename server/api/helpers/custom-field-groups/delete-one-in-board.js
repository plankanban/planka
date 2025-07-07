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
    board: {
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
    await sails.helpers.customFieldGroups.deleteRelated(inputs.record);

    const customFieldGroup = await CustomFieldGroup.qm.deleteOne(inputs.record.id);

    if (customFieldGroup) {
      sails.sockets.broadcast(
        `board:${customFieldGroup.boardId}`,
        'customFieldGroupDelete',
        {
          item: customFieldGroup,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.CUSTOM_FIELD_GROUP_DELETE,
        buildData: () => ({
          item: customFieldGroup,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
          },
        }),
        user: inputs.actorUser,
      });
    }

    return customFieldGroup;
  },
};
