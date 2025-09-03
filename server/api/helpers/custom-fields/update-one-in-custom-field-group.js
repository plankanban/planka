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
    list: {
      type: 'ref',
    },
    card: {
      type: 'ref',
    },
    customFieldGroup: {
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
    listMustBePresent: {},
    cardMustBePresent: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (inputs.customFieldGroup.cardId) {
      if (!inputs.list) {
        throw 'listMustBePresent';
      }

      if (!inputs.card) {
        throw 'cardMustBePresent';
      }
    }

    if (!_.isUndefined(values.position)) {
      const customFields = await CustomField.qm.getByCustomFieldGroupId(
        inputs.record.customFieldGroupId,
        {
          exceptIdOrIds: inputs.record.id,
        },
      );

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        customFields,
      );

      values.position = position;

      // eslint-disable-next-line no-restricted-syntax
      for (const reposition of repositions) {
        // eslint-disable-next-line no-await-in-loop
        await CustomField.qm.updateOne(
          {
            id: reposition.record.id,
            customFieldGroupId: reposition.record.customFieldGroupId,
          },
          {
            position: reposition.position,
          },
        );

        sails.sockets.broadcast(`board:${inputs.board.id}`, 'customFieldUpdate', {
          item: {
            id: reposition.record.id,
            position: reposition.position,
          },
        });

        // TODO: send webhooks
      }
    }

    const customField = await CustomField.qm.updateOne(inputs.record.id, values);

    if (customField) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'customFieldUpdate',
        {
          item: customField,
        },
        inputs.request,
      );

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.CUSTOM_FIELD_UPDATE,
        buildData: () => ({
          item: customField,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            customFieldGroups: [inputs.customFieldGroup],
            ...(inputs.list && {
              lists: [inputs.list],
            }),
            ...(inputs.card && {
              cards: [inputs.card],
            }),
          },
        }),
        buildPrevData: () => ({
          item: inputs.record,
        }),
        user: inputs.actorUser,
      });
    }

    return customField;
  },
};
