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
    request: {
      type: 'ref',
    },
  },

  exits: {
    positionMustBeInValues: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (sails.helpers.lists.isFinite(values.list)) {
      if (_.isUndefined(values.position)) {
        throw 'positionMustBeInValues';
      }

      const cards = await Card.qm.getByListId(values.list.id);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        cards,
      );

      values.position = position;

      if (repositions.length > 0) {
        // eslint-disable-next-line no-restricted-syntax
        for (const reposition of repositions) {
          // eslint-disable-next-line no-await-in-loop
          await Card.qm.updateOne(
            {
              id: reposition.record.id,
              listId: reposition.record.listId,
            },
            {
              position: reposition.position,
            },
          );

          sails.sockets.broadcast(`board:${values.board.id}`, 'cardUpdate', {
            item: {
              id: reposition.record.id,
              position: reposition.position,
            },
          });

          // TODO: send webhooks
        }
      }
    } else {
      delete values.position;
    }

    const card = await Card.qm.createOne({
      ...values,
      boardId: values.board.id,
      listId: values.list.id,
      creatorUserId: values.creatorUser.id,
      listChangedAt: new Date().toISOString(),
    });

    if (values.customFields) {
      const customFieldGroups = await CustomFieldGroup.qm.getByBoardId(values.board.id);
      const customFieldGroupMap = _.keyBy(customFieldGroups, 'name');
      const customFieldGroupIds = customFieldGroups.map((g) => g.id);
      const customFields = await CustomField.qm.getByCustomFieldGroupIds(customFieldGroupIds);
      const customFieldMap = _.keyBy(customFields, (f) => `${f.customFieldGroupId}:${f.name}`);

      const createValuePromises = [];
      Object.entries(values.customFields).forEach(([groupName, fields]) => {
        const group = customFieldGroupMap[groupName];
        if (!group) return;
        Object.entries(fields).forEach(([fieldName, content]) => {
          const field = customFieldMap[`${group.id}:${fieldName}`];
          if (!field) return;
          createValuePromises.push(
            CustomFieldValue.create({
              cardId: card.id,
              customFieldGroupId: group.id,
              customFieldId: field.id,
              content: String(content),
            }),
          );
        });
      });
      await Promise.all(createValuePromises);
    }

    sails.sockets.broadcast(
      `board:${card.boardId}`,
      'cardCreate',
      {
        item: card,
      },
      inputs.request,
    );

    sails.helpers.utils.sendWebhooks.with({
      event: 'cardCreate',
      buildData: () => ({
        item: card,
        included: {
          projects: [inputs.project],
          boards: [values.board],
          lists: [values.list],
        },
      }),
      user: values.creatorUser,
    });

    if (values.creatorUser.subscribeToOwnCards) {
      try {
        await CardSubscription.qm.createOne({
          cardId: card.id,
          userId: card.creatorUserId,
        });
      } catch (error) {
        if (error.code !== 'E_UNIQUE') {
          throw error;
        }
      }

      sails.sockets.broadcast(`user:${card.creatorUserId}`, 'cardUpdate', {
        item: {
          id: card.id,
          isSubscribed: true,
        },
      });

      // TODO: send webhooks
    }

    await sails.helpers.actions.createOne.with({
      values: {
        card,
        type: Action.Types.CREATE_CARD,
        data: {
          card: _.pick(card, ['name']),
          list: _.pick(values.list, ['id', 'type', 'name']),
        },
        user: values.creatorUser,
      },
      project: inputs.project,
      board: values.board,
      list: values.list,
    });

    return card;
  },
};
