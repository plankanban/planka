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
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { isSubscribed, ...values } = inputs.values;

    let board;
    if (_.isEmpty(values)) {
      board = inputs.record;
    } else {
      const scoper = sails.helpers.projects.makeScoper.with({
        record: inputs.project,
      });

      if (!_.isUndefined(values.position)) {
        const boards = await Board.qm.getByProjectId(inputs.record.projectId, {
          exceptIdOrIds: inputs.record.id,
        });

        const { position, repositions } = sails.helpers.utils.insertToPositionables(
          values.position,
          boards,
        );

        values.position = position;

        if (repositions.length > 0) {
          await scoper.getUserIdsWithFullProjectVisibility();
          const clonedScoper = scoper.clone();

          // eslint-disable-next-line no-restricted-syntax
          for (const reposition of repositions) {
            // eslint-disable-next-line no-await-in-loop
            await Board.qm.updateOne(
              {
                id: reposition.record.id,
                projectId: reposition.record.projectId,
              },
              {
                position: reposition.position,
              },
            );

            clonedScoper.replaceBoard(reposition.record);
            // eslint-disable-next-line no-await-in-loop
            const boardRelatedUserIds = await clonedScoper.getBoardRelatedUserIds();

            boardRelatedUserIds.forEach((userId) => {
              sails.sockets.broadcast(`user:${userId}`, 'boardUpdate', {
                item: {
                  id: reposition.record.id,
                  position: reposition.position,
                },
              });
            });

            // TODO: send webhooks
          }
        }
      }

      board = await Board.qm.updateOne(inputs.record.id, values);

      if (!board) {
        return board;
      }

      scoper.board = board;
      const boardRelatedUserIds = await scoper.getBoardRelatedUserIds();

      boardRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'boardUpdate',
          {
            item: board,
          },
          inputs.request,
        );
      });

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.BOARD_UPDATE,
        buildData: () => ({
          item: board,
          included: {
            projects: [inputs.project],
          },
        }),
        buildPrevData: () => ({
          item: inputs.record,
        }),
        user: inputs.actorUser,
      });
    }

    if (!_.isUndefined(isSubscribed)) {
      const wasSubscribed = await sails.helpers.users.isBoardSubscriber(
        inputs.actorUser.id,
        board.id,
      );

      if (isSubscribed !== wasSubscribed) {
        if (isSubscribed) {
          try {
            await BoardSubscription.qm.createOne({
              boardId: board.id,
              userId: inputs.actorUser.id,
            });
          } catch (error) {
            if (error.code !== 'E_UNIQUE') {
              throw error;
            }
          }
        } else {
          await BoardSubscription.qm.deleteOne({
            boardId: board.id,
            userId: inputs.actorUser.id,
          });
        }

        sails.sockets.broadcast(
          `user:${inputs.actorUser.id}`,
          'boardUpdate',
          {
            item: {
              isSubscribed,
              id: board.id,
            },
          },
          inputs.request,
        );

        // TODO: send webhooks
      }
    }

    return board;
  },
};
