/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
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

    const prevCustomFieldValue =
      await CustomFieldValue.qm.getOneByCardIdAndCustomFieldGroupIdAndCustomFieldId(
        values.card.id,
        values.customFieldGroup.id,
        values.customField.id,
      );

    const customFieldValue = await CustomFieldValue.qm.createOrUpdateOne({
      ...values,
      cardId: values.card.id,
      customFieldGroupId: values.customFieldGroup.id,
      customFieldId: values.customField.id,
    });

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'customFieldValueUpdate',
      {
        item: customFieldValue,
      },
      inputs.request,
    );

    const webhooks = await Webhook.qm.getAll();

    // TODO: with prevData?
    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.CUSTOM_FIELD_VALUE_UPDATE,
      buildData: () => ({
        item: customFieldValue,
        included: {
          projects: [inputs.project],
          boards: [inputs.board],
          lists: [inputs.list],
          cards: [values.card],
          customFieldGroups: [values.customFieldGroup],
          customFields: [values.customField],
        },
      }),
      user: inputs.actorUser,
    });

    const content = _.isString(customFieldValue.content) ? customFieldValue.content.trim() : '';
    const prevContent =
      prevCustomFieldValue && _.isString(prevCustomFieldValue.content)
        ? prevCustomFieldValue.content.trim()
        : null;

    if (
      sails.config.custom.trackedCustomFieldNames.includes(values.customField.name) &&
      content !== '' &&
      content !== prevContent
    ) {
      try {
        await sails.helpers.actions.createOne.with({
          webhooks,
          values: {
            type: Action.Types.UPDATE_CUSTOM_FIELD_VALUE,
            data: {
              card: _.pick(values.card, ['name']),
              customFieldId: values.customField.id,
              customFieldName: values.customField.name,
              customFieldGroupId: values.customFieldGroup.id,
              customFieldGroupName: values.customFieldGroup.name,
              content: customFieldValue.content,
            },
            user: inputs.actorUser,
            card: values.card,
          },
          project: inputs.project,
          board: inputs.board,
          list: inputs.list,
          request: inputs.request,
        });
      } catch (error) {
        sails.log.warn(
          `Failed to record ${Action.Types.UPDATE_CUSTOM_FIELD_VALUE} action for card ${values.card.id}: ${error}`,
        );
      }
    }

    return customFieldValue;
  },
};
