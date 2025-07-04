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
    board: {
      type: 'ref',
      required: true,
    },
    list: {
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
    cardMustBeInValues: {},
    baseCustomFieldGroupOrNameMustBeInValues: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (!values.card) {
      throw 'cardMustBeInValues';
    }

    if (values.baseCustomFieldGroup) {
      values.baseCustomFieldGroupId = values.baseCustomFieldGroup.id;
    } else if (!values.name) {
      throw 'baseCustomFieldGroupOrNameMustBeInValues';
    }

    const customFieldGroups = await CustomFieldGroup.qm.getByCardId(values.card.id);

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
            cardId: reposition.record.cardId,
          },
          {
            position: reposition.position,
          },
        );

        sails.sockets.broadcast(`board:${inputs.board.id}`, 'customFieldGroupUpdate', {
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
      cardId: values.card.id,
    });

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
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
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card],
        },
      }),
      user: inputs.actorUser,
    });

    return customFieldGroup;
  },
};
