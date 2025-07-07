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

  exits: {
    nameInValuesMustNotBeNull: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (!inputs.record.baseCustomFieldGroupId && _.isNull(values.name)) {
      throw 'nameInValuesMustNotBeNull';
    }

    if (!_.isUndefined(values.position)) {
      const customFieldGroups = await CustomFieldGroup.qm.getByBoardId(inputs.record.boardId, {
        exceptIdOrIds: inputs.record.id,
      });

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        customFieldGroups,
      );

      values.position = position;

      if (repositions.length > 0) {
        // eslint-disable-next-line no-restricted-syntax
        for (const reposition of repositions) {
          // eslint-disable-next-line no-await-in-loop
          await CustomFieldGroup.qm.updateOne(
            {
              id: reposition.record.id,
              boardId: reposition.record.boardId,
            },
            {
              position: reposition.position,
            },
          );

          sails.sockets.broadcast(`board:${inputs.record.boardId}`, 'customFieldGroupUpdate', {
            item: {
              id: reposition.record.id,
              position: reposition.position,
            },
          });

          // TODO: send webhooks
        }
      }
    }

    const customFieldGroup = await CustomFieldGroup.qm.updateOne(inputs.record.id, values);

    if (customFieldGroup) {
      sails.sockets.broadcast(
        `board:${customFieldGroup.boardId}`,
        'customFieldGroupUpdate',
        {
          item: customFieldGroup,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.CUSTOM_FIELD_GROUP_UPDATE,
        buildData: () => ({
          item: customFieldGroup,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
          },
        }),
        buildPrevData: () => ({
          item: inputs.record,
        }),
        user: inputs.actorUser,
      });
    }

    return customFieldGroup;
  },
};
