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
    baseCustomFieldGroupMustBeInValues: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (!values.baseCustomFieldGroup) {
      throw 'baseCustomFieldGroupMustBeInValues';
    }

    const scoper = sails.helpers.projects.makeScoper.with({
      record: inputs.project,
    });

    const customFieldGroupRelatedUserIds = await scoper.getProjectRelatedUserIds();

    if (!_.isUndefined(values.position)) {
      const customFields = await CustomField.qm.getByBaseCustomFieldGroupId(
        values.baseCustomFieldGroup.id,
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
            baseCustomFieldGroupId: reposition.record.baseCustomFieldGroupId,
          },
          {
            position: reposition.position,
          },
        );

        customFieldGroupRelatedUserIds.forEach((userId) => {
          sails.sockets.broadcast(`user:${userId}`, 'customFieldUpdate', {
            item: {
              id: reposition.record.id,
              position: reposition.position,
            },
          });
        });

        // TODO: send webhooks
      }
    }

    const customField = await CustomField.qm.createOne({
      ...values,
      baseCustomFieldGroupId: values.baseCustomFieldGroup.id,
    });

    customFieldGroupRelatedUserIds.forEach((userId) => {
      sails.sockets.broadcast(
        `user:${userId}`,
        'customFieldCreate',
        {
          item: customField,
        },
        inputs.request,
      );
    });

    const webhooks = await Webhook.qm.getAll();

    sails.helpers.utils.sendWebhooks.with({
      webhooks,
      event: Webhook.Events.CUSTOM_FIELD_CREATE,
      buildData: () => ({
        item: customField,
        included: {
          projects: [inputs.project],
          baseCustomFieldGroups: [values.baseCustomFieldGroup],
        },
      }),
      user: inputs.actorUser,
    });

    return customField;
  },
};
