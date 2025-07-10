/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  TASK_LIST_NOT_FOUND: {
    taskListNotFound: 'Task list not found',
  },
  LINKED_CARD_NOT_FOUND: {
    linkedCardNotFound: 'Linked card not found',
  },
};

module.exports = {
  inputs: {
    taskListId: {
      ...idInput,
      required: true,
    },
    linkedCardId: idInput,
    position: {
      type: 'number',
      min: 0,
      required: true,
    },
    name: {
      type: 'string',
      maxLength: 1024,
      // required: true,
    },
    isCompleted: {
      type: 'boolean',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    taskListNotFound: {
      responseType: 'notFound',
    },
    linkedCardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { taskList, card, list, board, project } = await sails.helpers.taskLists
      .getPathToProjectById(inputs.taskListId)
      .intercept('pathNotFound', () => Errors.TASK_LIST_NOT_FOUND);

    let boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.TASK_LIST_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let linkedCard;
    if (!_.isUndefined(inputs.linkedCardId)) {
      const path = await sails.helpers.cards
        .getPathToProjectById(inputs.linkedCardId)
        .intercept('pathNotFound', () => Errors.LINKED_CARD_NOT_FOUND);

      ({ card: linkedCard } = path);

      if (currentUser.role !== User.Roles.ADMIN || path.project.ownerProjectManagerId) {
        const isProjectManager = await sails.helpers.users.isProjectManager(
          currentUser.id,
          path.project.id,
        );

        if (!isProjectManager) {
          boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
            linkedCard.boardId,
            currentUser.id,
          );

          if (!boardMembership) {
            throw Errors.LINKED_CARD_NOT_FOUND; // Forbidden
          }
        }
      }
    }

    const values = _.pick(inputs, ['position', 'name', 'isCompleted']);

    const task = await sails.helpers.tasks.createOne.with({
      project,
      board,
      list,
      card,
      values: {
        ...values,
        taskList,
        linkedCard,
      },
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: task,
    };
  },
};
