/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /boards/{id}:
 *   get:
 *     summary: Get board details
 *     description: Retrieves comprehensive board information, including lists, cards, and other related data.
 *     tags:
 *       - Boards
 *     operationId: getBoard
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the board to retrieve
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: subscribe
 *         in: query
 *         required: false
 *         description: Whether to subscribe to real-time updates for this board (only for socket connections)
 *         schema:
 *           type: boolean
 *           example: true
 *     responses:
 *       200:
 *         description: Board details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *                 - included
 *               properties:
 *                 item:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Board'
 *                     - type: object
 *                       properties:
 *                         isSubscribed:
 *                           type: boolean
 *                           description: Whether the current user is subscribed to the board
 *                           example: true
 *                 included:
 *                   type: object
 *                   required:
 *                     - users
 *                     - projects
 *                     - boardMemberships
 *                     - labels
 *                     - lists
 *                     - cards
 *                     - cardMemberships
 *                     - cardLabels
 *                     - taskLists
 *                     - tasks
 *                     - attachments
 *                     - customFieldGroups
 *                     - customFields
 *                     - customFieldValues
 *                   properties:
 *                     users:
 *                       type: array
 *                       description: Related users
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     projects:
 *                       type: array
 *                       description: Parent project
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *                     boardMemberships:
 *                       type: array
 *                       description: Related board memberships
 *                       items:
 *                         $ref: '#/components/schemas/BoardMembership'
 *                     labels:
 *                       type: array
 *                       description: Related labels
 *                       items:
 *                         $ref: '#/components/schemas/Label'
 *                     lists:
 *                       type: array
 *                       description: Related lists
 *                       items:
 *                         $ref: '#/components/schemas/List'
 *                     cards:
 *                       type: array
 *                       description: Related cards
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Card'
 *                           - type: object
 *                             properties:
 *                               isSubscribed:
 *                                 type: boolean
 *                                 description: Whether the current user is subscribed to the card
 *                                 example: true
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    subscribe: {
      type: 'boolean',
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { board, project } = await sails.helpers.boards
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
          board.id,
          currentUser.id,
        );

        if (!boardMembership) {
          throw Errors.BOARD_NOT_FOUND; // Forbidden
        }
      }
    }

    board.isSubscribed = await sails.helpers.users.isBoardSubscriber(currentUser.id, board.id);

    const boardMemberships = await BoardMembership.qm.getByBoardId(board.id);
    const labels = await Label.qm.getByBoardId(board.id);
    const lists = await List.qm.getByBoardId(board.id);

    const finiteLists = lists.filter((list) => sails.helpers.lists.isFinite(list));
    const finiteListIds = sails.helpers.utils.mapRecords(finiteLists);

    const cards = await Card.qm.getByListIds(finiteListIds);
    const cardIds = sails.helpers.utils.mapRecords(cards);

    const userIds = _.union(
      sails.helpers.utils.mapRecords(boardMemberships, 'userId'),
      sails.helpers.utils.mapRecords(cards, 'creatorUserId', true, true),
    );

    const users = await User.qm.getByIds(userIds);
    const cardMemberships = await CardMembership.qm.getByCardIds(cardIds);
    const cardLabels = await CardLabel.qm.getByCardIds(cardIds);

    const taskLists = await TaskList.qm.getByCardIds(cardIds);
    const taskListIds = sails.helpers.utils.mapRecords(taskLists);

    const tasks = await Task.qm.getByTaskListIds(taskListIds);
    const attachments = await Attachment.qm.getByCardIds(cardIds);

    const boardCustomFieldGroups = await CustomFieldGroup.qm.getByBoardId(board.id);
    const cardCustomFieldGroups = await CustomFieldGroup.qm.getByCardIds(cardIds);

    const customFieldGroups = [...boardCustomFieldGroups, ...cardCustomFieldGroups];
    const customFieldGroupIds = sails.helpers.utils.mapRecords(customFieldGroups);

    const customFields = await CustomField.qm.getByCustomFieldGroupIds(customFieldGroupIds);
    const customFieldValues = await CustomFieldValue.qm.getByCardIds(cardIds);

    const cardSubscriptions = await CardSubscription.qm.getByCardIdsAndUserId(
      cardIds,
      currentUser.id,
    );

    const isSubscribedByCardId = cardSubscriptions.reduce(
      (result, cardSubscription) => ({
        ...result,
        [cardSubscription.cardId]: true,
      }),
      {},
    );

    cards.forEach((card) => {
      // eslint-disable-next-line no-param-reassign
      card.isSubscribed = isSubscribedByCardId[card.id] || false;
    });

    if (inputs.subscribe && this.req.isSocket) {
      sails.sockets.join(this.req, `board:${board.id}`);
    }

    return {
      item: board,
      included: {
        boardMemberships,
        labels,
        lists,
        cards,
        cardMemberships,
        cardLabels,
        taskLists,
        tasks,
        customFieldGroups,
        customFields,
        customFieldValues,
        users: sails.helpers.users.presentMany(users, currentUser),
        projects: [project],
        attachments: sails.helpers.attachments.presentMany(attachments),
      },
    };
  },
};
