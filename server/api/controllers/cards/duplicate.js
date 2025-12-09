/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{id}/duplicate:
 *   post:
 *     summary: Duplicate card
 *     description: Creates a duplicate of a card with all its contents (tasks, attachments, etc.). Requires board editor permissions.
 *     tags:
 *       - Cards
 *     operationId: duplicateCard
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the card to duplicate
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               boardId:
 *                 type: string
 *                 description: ID of the board to duplicate the card to
 *                 example: "1357158568008091265"
 *               listId:
 *                 type: string
 *                 description: ID of the list to duplicate the card to
 *                 example: "1357158568008091266"
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 description: Position for the duplicated card within the list
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 1024
 *                 nullable: true
 *                 description: Name/title for the duplicated card
 *                 example: Implement user authentication (copy)
 *     responses:
 *       200:
 *         description: Card duplicated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *                 - included
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Card'
 *                 included:
 *                   type: object
 *                   required:
 *                     - cardMemberships
 *                     - cardLabels
 *                     - taskLists
 *                     - tasks
 *                     - attachments
 *                     - customFieldGroups
 *                     - customFields
 *                     - customFieldValues
 *                   properties:
 *                     cardMemberships:
 *                       type: array
 *                       description: Related card-membership associations
 *                       items:
 *                         $ref: '#/components/schemas/CardMembership'
 *                     cardLabels:
 *                       type: array
 *                       description: Related card-label associations
 *                       items:
 *                         $ref: '#/components/schemas/CardLabel'
 *                     taskLists:
 *                       type: array
 *                       description: Related task lists
 *                       items:
 *                         $ref: '#/components/schemas/TaskList'
 *                     tasks:
 *                       type: array
 *                       description: Related tasks
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *                     attachments:
 *                       type: array
 *                       description: Related attachments
 *                       items:
 *                         $ref: '#/components/schemas/Attachment'
 *                     customFieldGroups:
 *                       type: array
 *                       description: Related custom field groups
 *                       items:
 *                         $ref: '#/components/schemas/CustomFieldGroup'
 *                     customFields:
 *                       type: array
 *                       description: Related custom fields
 *                       items:
 *                         $ref: '#/components/schemas/CustomField'
 *                     customFieldValues:
 *                       type: array
 *                       description: Related custom field values
 *                       items:
 *                         $ref: '#/components/schemas/CustomFieldValue'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
  LIST_MUST_BE_PRESENT: {
    listMustBePresent: 'List must be present',
  },
  POSITION_MUST_BE_PRESENT: {
    positionMustBePresent: 'Position must be present',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    boardId: idInput,
    listId: idInput,
    position: {
      type: 'number',
      min: 0,
      allowNull: true,
    },
    name: {
      type: 'string',
      maxLength: 1024,
      allowNull: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    boardNotFound: {
      responseType: 'notFound',
    },
    listNotFound: {
      responseType: 'notFound',
    },
    listMustBePresent: {
      responseType: 'unprocessableEntity',
    },
    positionMustBePresent: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, list, board, project } = await sails.helpers.cards
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    let boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!isProjectManager) {
      if (!boardMembership) {
        throw Errors.CARD_NOT_FOUND; // Forbidden
      }

      if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    let nextProject;
    let nextBoard;

    if (!_.isUndefined(inputs.boardId)) {
      ({ board: nextBoard, project: nextProject } = await sails.helpers.boards
        .getPathToProjectById(inputs.boardId)
        .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND));

      boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
        nextBoard.id,
        currentUser.id,
      );

      if (!boardMembership) {
        throw Errors.BOARD_NOT_FOUND; // Forbidden
      }
    }

    if (!boardMembership) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let nextList;
    if (!_.isUndefined(inputs.listId)) {
      nextList = await List.qm.getOneById(inputs.listId, {
        boardId: (nextBoard || board).id,
      });

      if (!nextList) {
        throw Errors.LIST_NOT_FOUND;
      }
    }

    const values = _.pick(inputs, ['position', 'name']);

    const {
      card: nextCard,
      cardMemberships,
      cardLabels,
      taskLists,
      tasks,
      attachments,
      customFieldGroups,
      customFields,
      customFieldValues,
    } = await sails.helpers.cards.duplicateOne
      .with({
        project,
        board,
        list,
        record: card,
        values: {
          ...values,
          project: nextProject,
          board: nextBoard,
          list: nextList,
          creatorUser: currentUser,
        },
        request: this.req,
      })
      .intercept('positionMustBeInValues', () => Errors.POSITION_MUST_BE_PRESENT)
      .intercept('listMustBeInValues', () => Errors.LIST_MUST_BE_PRESENT);

    return {
      item: nextCard,
      included: {
        cardMemberships,
        cardLabels,
        taskLists,
        tasks,
        customFieldGroups,
        customFields,
        customFieldValues,
        attachments: sails.helpers.attachments.presentMany(attachments),
      },
    };
  },
};
