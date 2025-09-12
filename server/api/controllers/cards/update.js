/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{id}:
 *   patch:
 *     summary: Update card
 *     description: Updates a card. Board editors can update all fields, viewers can only subscribe/unsubscribe.
 *     tags:
 *       - Cards
 *     operationId: updateCard
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the card to update
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
 *                 description: ID of the board to move the card to
 *                 example: "1357158568008091265"
 *               listId:
 *                 type: string
 *                 description: ID of the list to move the card to
 *                 example: "1357158568008091266"
 *               coverAttachmentId:
 *                 type: string
 *                 nullable: true
 *                 description: ID of the attachment used as cover
 *                 example: "1357158568008091267"
 *               type:
 *                 type: string
 *                 enum: [project, story]
 *                 description: Type of the card
 *                 example: project
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 description: Position of the card within the list
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 1024
 *                 description: Name/title of the card
 *                 example: Implement user authentication
 *               description:
 *                 type: string
 *                 maxLength: 1048576
 *                 nullable: true
 *                 description: Detailed description of the card
 *                 example: Add JWT-based authentication system...
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Due date for the card
 *                 example: 2024-01-01T00:00:00.000Z
 *               isDueCompleted:
 *                 type: boolean
 *                 nullable: true
 *                 description: Whether the due date is completed
 *                 example: false
 *               stopwatch:
 *                 type: object
 *                 required:
 *                   - startedAt
 *                   - total
 *                 nullable: true
 *                 description: Stopwatch data for time tracking
 *                 properties:
 *                   startedAt:
 *                     type: string
 *                     format: date-time
 *                     description: When the stopwatch was started
 *                     example: 2024-01-01T00:00:00.000Z
 *                   total:
 *                     type: number
 *                     description: Total time in seconds
 *                     example: 3600
 *               isSubscribed:
 *                 type: boolean
 *                 description: Whether the current user is subscribed to the card
 *     responses:
 *       200:
 *         description: Card updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Card'
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

const { isDueDate, isStopwatch } = require('../../../utils/validators');
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
  COVER_ATTACHMENT_NOT_FOUND: {
    coverAttachmentNotFound: 'Cover attachment not found',
  },
  LIST_MUST_BE_PRESENT: {
    listMustBePresent: 'List must be present',
  },
  COVER_ATTACHMENT_MUST_CONTAIN_IMAGE: {
    coverAttachmentMustContainImage: 'Cover attachment must contain image',
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
    coverAttachmentId: {
      ...idInput,
      allowNull: true,
    },
    type: {
      type: 'string',
      isIn: Object.values(Card.Types),
    },
    position: {
      type: 'number',
      min: 0,
      allowNull: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1024,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1048576,
      allowNull: true,
    },
    dueDate: {
      type: 'string',
      custom: isDueDate,
      allowNull: true,
    },
    isDueCompleted: {
      type: 'boolean',
      allowNull: true,
    },
    stopwatch: {
      type: 'json',
      custom: isStopwatch,
    },
    isSubscribed: {
      type: 'boolean',
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
    coverAttachmentNotFound: {
      responseType: 'notFound',
    },
    listMustBePresent: {
      responseType: 'unprocessableEntity',
    },
    coverAttachmentMustContainImage: {
      responseType: 'unprocessableEntity',
    },
    positionMustBePresent: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.cards
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    let { card } = pathToProject;
    const { list, board, project } = pathToProject;

    let boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    const availableInputKeys = ['id', 'isSubscribed'];
    if (boardMembership.role === BoardMembership.Roles.EDITOR) {
      availableInputKeys.push(
        'boardId',
        'listId',
        'coverAttachmentId',
        'type',
        'position',
        'name',
        'description',
        'dueDate',
        'isDueCompleted',
        'stopwatch',
      );
    }

    if (_.difference(Object.keys(inputs), availableInputKeys).length > 0) {
      throw Errors.NOT_ENOUGH_RIGHTS;
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

      if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
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

    let nextCoverAttachment;
    if (inputs.coverAttachmentId) {
      nextCoverAttachment = await Attachment.qm.getOneById(inputs.coverAttachmentId, {
        cardId: card.id,
      });

      if (!nextCoverAttachment || nextCoverAttachment.type !== Attachment.Types.FILE) {
        throw Errors.COVER_ATTACHMENT_NOT_FOUND;
      }
    }

    const values = _.pick(inputs, [
      'coverAttachmentId',
      'type',
      'position',
      'name',
      'description',
      'dueDate',
      'isDueCompleted',
      'stopwatch',
      'isSubscribed',
    ]);

    card = await sails.helpers.cards.updateOne
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
          coverAttachment: nextCoverAttachment,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept('positionMustBeInValues', () => Errors.POSITION_MUST_BE_PRESENT)
      .intercept('listMustBeInValues', () => Errors.LIST_MUST_BE_PRESENT)
      .intercept(
        'coverAttachmentInValuesMustContainImage',
        () => Errors.COVER_ATTACHMENT_MUST_CONTAIN_IMAGE,
      );

    if (!card) {
      throw Errors.CARD_NOT_FOUND;
    }

    return {
      item: card,
    };
  },
};
