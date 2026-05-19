/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const supabase = require('../../../utils/supabase');

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
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    webhooks: {
      type: 'ref',
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    positionMustBeInValues: {},
    boardInValuesMustBelongToProject: {},
    listMustBeInValues: {},
    listInValuesMustBelongToBoard: {},
    coverAttachmentInValuesMustContainImage: {},
  },

  // TODO: use normalizeValues and refactor
  async fn(inputs) {
    const { isSubscribed, ...values } = inputs.values;

    if (values.project && values.project.id === inputs.project.id) {
      delete values.project;
    }

    const project = values.project || inputs.project;

    if (values.board) {
      if (values.board.projectId !== project.id) {
        throw 'boardInValuesMustBelongToProject';
      }

      if (values.board.id === inputs.board.id) {
        delete values.board;
      } else {
        values.boardId = values.board.id;
      }
    }

    const board = values.board || inputs.board;

    const isListInRequest = !!values.list;

    if (values.list) {
      if (values.list.boardId !== board.id) {
        throw 'listInValuesMustBelongToBoard';
      }

      if (values.list.id === inputs.list.id) {
        delete values.list;
      } else {
        values.listId = values.list.id;
      }
    } else if (values.board) {
      throw 'listMustBeInValues';
    }

    const list = values.list || inputs.list;

    if (sails.helpers.lists.isFinite(list)) {
      if (values.list && _.isUndefined(values.position)) {
        throw 'positionMustBeInValues';
      }
    } else {
      values.position = null;
    }

    if (values.coverAttachment) {
      if (!values.coverAttachment.data.image) {
        throw 'coverAttachmentInValuesMustContainImage';
      }

      if (values.coverAttachment.id === inputs.record.coverAttachmentId) {
        delete values.coverAttachment;
      } else {
        values.coverAttachmentId = values.coverAttachment.id;
      }
    }

    const dueDate = _.isUndefined(values.dueDate) ? inputs.record.dueDate : values.dueDate;

    if (dueDate) {
      const isDueCompleted = _.isUndefined(values.isDueCompleted)
        ? inputs.record.isDueCompleted
        : values.isDueCompleted;

      if (_.isNull(isDueCompleted)) {
        values.isDueCompleted = false;
      }
    } else {
      values.isDueCompleted = null;
    }

    let card;
    if (_.isEmpty(values)) {
      card = inputs.record;
    } else {
      const { webhooks = await Webhook.qm.getAll() } = inputs;

      if (!_.isNil(values.position)) {
        const cards = await Card.qm.getByListId(list.id, {
          exceptIdOrIds: inputs.record.id,
        });

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

            sails.sockets.broadcast(`board:${board.id}`, 'cardUpdate', {
              item: {
                id: reposition.record.id,
                position: reposition.position,
              },
            });

            // TODO: send webhooks
          }
        }
      }

      let prevLabels;
      if (values.board) {
        prevLabels = await sails.helpers.cards.getLabels(inputs.record.id);

        const boardMemberUserIds = await sails.helpers.boards.getMemberUserIds(values.board.id);

        await CardSubscription.qm.delete({
          cardId: inputs.record.id,
          userId: {
            '!=': boardMemberUserIds,
          },
        });

        await CardMembership.qm.delete({
          cardId: inputs.record.id,
          userId: {
            '!=': boardMemberUserIds,
          },
        });

        await CardLabel.qm.delete({
          cardId: inputs.record.id,
        });

        const taskLists = await TaskList.qm.getByCardId(inputs.record.id);
        const taskListIds = sails.helpers.utils.mapRecords(taskLists);

        await Task.qm.update(
          {
            taskListId: taskListIds,
            assigneeUserId: {
              '!=': boardMemberUserIds,
            },
          },
          {
            assigneeUserId: null,
          },
        );

        await sails.helpers.cards.detachCustomFields(
          inputs.record.id,
          inputs.board.id,
          !!values.project,
        );
      }

      if (values.list) {
        if (values.board || inputs.list.type === List.Types.TRASH) {
          values.prevListId = null;
        } else if (sails.helpers.lists.isArchiveOrTrash(values.list)) {
          values.prevListId = inputs.list.id;
        } else if (inputs.list.type === List.Types.ARCHIVE) {
          values.prevListId = null;
        }

        const typeState = List.TYPE_STATE_BY_TYPE[values.list.type];

        if (inputs.record.isClosed) {
          if (typeState === List.TypeStates.OPENED) {
            values.isClosed = false;
          }
        } else if (typeState === List.TypeStates.CLOSED) {
          values.isClosed = true;
        }

        values.listChangedAt = new Date().toISOString();
      }

      const updateResult = await Card.qm.updateOne(inputs.record.id, values);

      ({ card } = updateResult);
      const { tasks } = updateResult;

      if (!card) {
        return card;
      }

      // Mirror update to Supabase (fire-and-forget).
      supabase
        .patchCard(card.id, {
          name: card.name,
          description: card.description,
          list_id: card.listId ? String(card.listId) : null,
          list_name: values.list ? values.list.name : undefined,
          list_type: values.list ? values.list.type : undefined,
          position: typeof card.position === 'number' ? card.position : null,
          is_closed: !!card.isClosed,
          prev_list_id: card.prevListId ? String(card.prevListId) : null,
        })
        .catch(() => undefined);

      if (values.list) {
        supabase
          .logEvent({
            cardId: card.id,
            eventType: 'move',
            data: {
              from_list: _.pick(inputs.list, ['id', 'type', 'name']),
              to_list: _.pick(values.list, ['id', 'type', 'name']),
            },
            userEmail: inputs.actorUser && inputs.actorUser.email,
            userId: inputs.actorUser && inputs.actorUser.id,
          })
          .catch(() => undefined);
      } else {
        const changed = _.pick(values, [
          'name',
          'description',
          'dueDate',
          'isDueCompleted',
          'isClosed',
        ]);
        if (Object.keys(changed).length > 0) {
          supabase
            .logEvent({
              cardId: card.id,
              eventType: 'update',
              data: { changed },
              userEmail: inputs.actorUser && inputs.actorUser.email,
              userId: inputs.actorUser && inputs.actorUser.id,
            })
            .catch(() => undefined);
        }
      }

      if (values.board) {
        const labels = await Label.qm.getByBoardId(card.boardId);
        const labelByName = _.keyBy(labels, 'name');

        const labelIds = await Promise.all(
          prevLabels.map(async (label) => {
            if (labelByName[label.name]) {
              return labelByName[label.name].id;
            }

            const { id } = await sails.helpers.labels.createOne.with({
              project,
              webhooks,
              values: {
                ..._.omit(label, ['id', 'boardId', 'createdAt', 'updatedAt']),
                board,
              },
              actorUser: inputs.actorUser,
            });

            return id;
          }),
        );

        await Promise.all(
          labelIds.map((labelId) => {
            try {
              return CardLabel.qm.createOne({
                labelId,
                cardId: card.id,
              });
            } catch (error) {
              if (error.code !== 'E_UNIQUE') {
                throw error;
              }
            }

            return Promise.resolve();
          }),
        );

        sails.sockets.broadcast(
          `board:${inputs.board.id}`,
          'cardUpdate',
          {
            item: {
              id: card.id,
              boardId: null,
            },
          },
          inputs.request,
        );

        sails.sockets.broadcast(
          `board:${card.boardId}`,
          'cardUpdate',
          {
            item: card,
          },
          inputs.request,
        );

        // TODO: add transfer action
      } else {
        sails.sockets.broadcast(
          `board:${card.boardId}`,
          'cardUpdate',
          {
            item: card,
          },
          inputs.request,
        );

        if (values.list) {
          await sails.helpers.actions.createOne.with({
            webhooks,
            values: {
              card,
              type: Action.Types.MOVE_CARD,
              data: {
                card: _.pick(card, ['name']),
                fromList: _.pick(inputs.list, ['id', 'type', 'name']),
                toList: _.pick(values.list, ['id', 'type', 'name']),
              },
              user: inputs.actorUser,
            },
            project: inputs.project,
            board: inputs.board,
            list: values.list,
          });

          // Keeps the per-card "Chamado finalizado em" field in sync with the
          // card's list type when transitioning into/out of `closed`.
          await sails.helpers.cards.syncFinalizedAt
            .with({
              card,
              boardId: inputs.board.id,
              fromType: inputs.list.type,
              toType: values.list.type,
              request: inputs.request,
            })
            .tolerate(() => undefined);
        }

        if (isListInRequest && list.labelId) {
          const targetLabel = await Label.qm.getOneById(list.labelId);

          if (targetLabel) {
            const existingCardLabels = await CardLabel.qm.getByCardId(card.id);

            if (list.type === List.Types.STATUS) {
              // eslint-disable-next-line no-restricted-syntax
              for (const cardLabel of existingCardLabels) {
                if (cardLabel.labelId === targetLabel.id) {
                  // eslint-disable-next-line no-continue
                  continue;
                }

                // eslint-disable-next-line no-await-in-loop
                await sails.helpers.cardLabels.deleteOne.with({
                  record: cardLabel,
                  project: inputs.project,
                  board: inputs.board,
                  list,
                  card,
                  actorUser: inputs.actorUser,
                  request: inputs.request,
                });
              }
            }

            const alreadyLinked = existingCardLabels.some(
              (cardLabel) => cardLabel.labelId === targetLabel.id,
            );

            if (!alreadyLinked) {
              await sails.helpers.cardLabels.createOne.with({
                project: inputs.project,
                board: inputs.board,
                list,
                values: { card, label: targetLabel },
                actorUser: inputs.actorUser,
                request: inputs.request,
              });
            }
          }
        }

        // Log card name change
        if (!_.isUndefined(values.name) && values.name !== inputs.record.name) {
          await sails.helpers.actions.createOne.with({
            webhooks,
            values: {
              card,
              type: Action.Types.UPDATE_CARD_NAME,
              data: {
                fromName: inputs.record.name,
                toName: values.name,
              },
              user: inputs.actorUser,
            },
            project: inputs.project,
            board: inputs.board,
            list: inputs.list,
          });
        }

        // Log description change (just record that it changed; not the diff)
        if (
          !_.isUndefined(values.description) &&
          values.description !== inputs.record.description
        ) {
          await sails.helpers.actions.createOne.with({
            webhooks,
            values: {
              card,
              type: Action.Types.UPDATE_CARD_DESCRIPTION,
              data: {
                hasContent: !!(values.description && String(values.description).trim()),
              },
              user: inputs.actorUser,
            },
            project: inputs.project,
            board: inputs.board,
            list: inputs.list,
          });
        }

        // Log due date change
        if (
          !_.isUndefined(values.dueDate) &&
          String(values.dueDate || '') !== String(inputs.record.dueDate || '')
        ) {
          await sails.helpers.actions.createOne.with({
            webhooks,
            values: {
              card,
              type: Action.Types.UPDATE_CARD_DUE_DATE,
              data: {
                fromDueDate: inputs.record.dueDate,
                toDueDate: values.dueDate,
              },
              user: inputs.actorUser,
            },
            project: inputs.project,
            board: inputs.board,
            list: inputs.list,
          });
        }
      }

      if (tasks) {
        const taskListIds = sails.helpers.utils.mapRecords(tasks, 'taskListId', true);
        const taskLists = await TaskList.qm.getByIds(taskListIds);
        const taskListById = _.keyBy(taskLists, 'id');

        const cardIds = sails.helpers.utils.mapRecords(taskLists, 'cardId', true);
        const cards = await Card.qm.getByIds(cardIds);
        const cardById = _.keyBy(cards, 'id');

        const boardIdByTaskId = tasks.reduce(
          (result, task) => ({
            ...result,
            [task.id]: cardById[taskListById[task.taskListId].cardId].boardId,
          }),
          {},
        );

        tasks.forEach((task) => {
          sails.sockets.broadcast(`board:${boardIdByTaskId[task.id]}`, 'taskUpdate', {
            item: task,
          });
        });

        // TODO: send webhooks
      }

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.CARD_UPDATE,
        buildData: () => ({
          item: card,
          included: {
            projects: [project],
            boards: [board],
            lists: [list],
          },
        }),
        buildPrevData: () => ({
          item: inputs.record,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
          },
        }),
        user: inputs.actorUser,
      });
    }

    if (!_.isUndefined(isSubscribed)) {
      const wasSubscribed = await sails.helpers.users.isCardSubscriber(
        inputs.actorUser.id,
        card.id,
      );

      if (isSubscribed !== wasSubscribed) {
        if (isSubscribed) {
          try {
            await CardSubscription.qm.createOne({
              cardId: card.id,
              userId: inputs.actorUser.id,
            });
          } catch (error) {
            if (error.code !== 'E_UNIQUE') {
              throw error;
            }
          }
        } else {
          await CardSubscription.qm.deleteOne({
            cardId: card.id,
            userId: inputs.actorUser.id,
          });
        }

        sails.sockets.broadcast(
          `user:${inputs.actorUser.id}`,
          'cardUpdate',
          {
            item: {
              isSubscribed,
              id: card.id,
            },
          },
          inputs.request,
        );

        // TODO: send webhooks
      }
    }

    return card;
  },
};
