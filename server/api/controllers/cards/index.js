/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /lists/{listId}/cards:
 *   get:
 *     summary: Get cards in list
 *     description: Retrieves cards from an endless list with filtering, search, and pagination support.
 *     tags:
 *       - Cards
 *     operationId: getCards
 *     parameters:
 *       - name: listId
 *         in: path
 *         required: true
 *         description: ID of the list to get cards from (must be an endless list)
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: before
 *         in: query
 *         required: false
 *         description: Pagination cursor (JSON object with id and listChangedAt)
 *         schema:
 *           type: string
 *           example: '{"id": "1357158568008091269", "listChangedAt": "2024-01-01T00:00:00.000Z"}'
 *       - name: search
 *         in: query
 *         required: false
 *         description: Search term to filter cards
 *         schema:
 *           type: string
 *           maxLength: 128
 *           example: bug fix
 *       - name: filterUserIds
 *         in: query
 *         required: false
 *         description: Comma-separated user IDs to filter by members
 *         schema:
 *           type: string
 *           example: 1357158568008091265,1357158568008091266
 *       - name: filterLabelIds
 *         in: query
 *         required: false
 *         description: Comma-separated label IDs to filter by labels
 *         schema:
 *           type: string
 *           example: 1357158568008091267,1357158568008091268
 *     responses:
 *       200:
 *         description: Cards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *                 - included
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Card'
 *                       - type: object
 *                         properties:
 *                           isSubscribed:
 *                             type: boolean
 *                             description: Whether the current user is subscribed to the card
 *                             example: true
 *                 included:
 *                   type: object
 *                   required:
 *                     - users
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
 *                       description: Realted Task lists
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

const moment = require('moment');

const { isId } = require('../../../utils/validators');
const { idInput, idsInput } = require('../../../utils/inputs');

const Errors = {
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
};

const isBefore = (value) => {
  if (!_.isPlainObject(value) || _.size(value) !== 2) {
    return false;
  }

  if (!moment(value.listChangedAt, moment.ISO_8601, true).isValid()) {
    return false;
  }

  if (!isId(value.id)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    listId: {
      ...idInput,
      required: true,
    },
    before: {
      type: 'json',
      custom: isBefore,
    },
    search: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
    filterUserIds: idsInput,
    filterLabelIds: idsInput,
  },

  exits: {
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { list, project } = await sails.helpers.lists
      .getPathToProjectById(inputs.listId)
      .intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
          list.boardId,
          currentUser.id,
        );

        if (!boardMembership) {
          throw Errors.LIST_NOT_FOUND; // Forbidden
        }
      }
    }

    let filterUserIds;
    if (inputs.filterUserIds) {
      const boardMemberships = await BoardMembership.qm.getByBoardId(list.boardId);

      const availableUserIdsSet = new Set(
        sails.helpers.utils.mapRecords(boardMemberships, 'userId'),
      );

      filterUserIds = _.uniq(inputs.filterUserIds.split(','));
      filterUserIds = filterUserIds.filter((userId) => availableUserIdsSet.has(userId));
    }

    let filterLabelIds;
    if (inputs.filterLabelIds) {
      const labels = await Label.qm.getByBoardId(list.boardId);
      const availableLabelIdsSet = new Set(sails.helpers.utils.mapRecords(labels));

      filterLabelIds = _.uniq(inputs.filterLabelIds.split(','));
      filterLabelIds = filterLabelIds.filter((labelId) => availableLabelIdsSet.has(labelId));
    }

    const cards = await Card.qm.getByEndlessListId(list.id, {
      filterUserIds,
      filterLabelIds,
      before: inputs.before,
      search: inputs.search,
    });

    const cardIds = sails.helpers.utils.mapRecords(cards);

    const userIds = sails.helpers.utils.mapRecords(cards, 'creatorUserId', true, true);
    const users = await User.qm.getByIds(userIds);

    const cardSubscriptions = await CardSubscription.qm.getByCardIdsAndUserId(
      cardIds,
      currentUser.id,
    );

    const cardMemberships = await CardMembership.qm.getByCardIds(cardIds);
    const cardLabels = await CardLabel.qm.getByCardIds(cardIds);

    const taskLists = await TaskList.qm.getByCardIds(cardIds);
    const taskListIds = sails.helpers.utils.mapRecords(taskLists);

    const tasks = await Task.qm.getByTaskListIds(taskListIds);
    const attachments = await Attachment.qm.getByCardIds(cardIds);

    const customFieldGroups = await CustomFieldGroup.qm.getByCardIds(cardIds);
    const customFieldGroupIds = sails.helpers.utils.mapRecords(customFieldGroups);

    const customFields = await CustomField.qm.getByCustomFieldGroupIds(customFieldGroupIds);
    const customFieldValues = await CustomFieldValue.qm.getByCardIds(cardIds);

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

    return {
      items: cards,
      included: {
        cardMemberships,
        cardLabels,
        taskLists,
        tasks,
        customFieldGroups,
        customFields,
        customFieldValues,
        users: sails.helpers.users.presentMany(users, currentUser),
        attachments: sails.helpers.attachments.presentMany(attachments),
      },
    };
  },
};
