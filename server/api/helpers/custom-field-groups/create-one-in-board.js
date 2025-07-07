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

  exits: {
    boardMustBeInValues: {},
    baseCustomFieldGroupOrNameMustBeInValues: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (!values.board) {
      throw 'boardMustBeInValues';
    }

    if (values.baseCustomFieldGroup) {
      values.baseCustomFieldGroupId = values.baseCustomFieldGroup.id;
    } else if (!values.name) {
      throw 'baseCustomFieldGroupOrNameMustBeInValues';
    }

    const customFieldGroups = await CustomFieldGroup.qm.getByBoardId(values.board.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      values.position,
      customFieldGroups,
    );

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

        sails.sockets.broadcast(`board:${values.board.id}`, 'customFieldGroupUpdate', {
          item: {
            id: reposition.record.id,
            position: reposition.position,
          },
        });

        // TODO: send webhooks
      }
    }

    const customFieldGroup = await CustomFieldGroup.qm.createOne({
      ...values,
      position,
      boardId: values.board.id,
    });

    sails.sockets.broadcast(
      `board:${customFieldGroup.boardId}`,
      'customFieldGroupCreate',
      {
        item: customFieldGroup,
      },
      inputs.request,
    );

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.CUSTOM_FIELD_GROUP_CREATE,
      buildData: () => ({
        item: customFieldGroup,
        included: {
          projects: [inputs.project],
          boards: [values.board],
        },
      }),
      user: inputs.actorUser,
    });

    return customFieldGroup;
  },
};
