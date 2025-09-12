/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /notifications/{id}:
 *   patch:
 *     summary: Update notification
 *     description: Updates a notification. Users can only update their own notifications.
 *     tags:
 *       - Notifications
 *     operationId: updateNotification
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the notification to update
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
 *               isRead:
 *                 type: boolean
 *                 description: Whether the notification has been read
 *                 example: true
 *     responses:
 *       200:
 *         description: Notification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOTIFICATION_NOT_FOUND: {
    notificationNotFound: 'Notification not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    isRead: {
      type: 'boolean',
    },
  },

  exits: {
    notificationNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let notification = await Notification.qm.getOneById(inputs.id, {
      userId: currentUser.id,
    });

    if (!notification) {
      throw Errors.NOTIFICATION_NOT_FOUND;
    }

    const values = _.pick(inputs, ['isRead']);

    notification = await sails.helpers.notifications.updateOne.with({
      values,
      record: notification,
      actorUser: currentUser,
      request: this.req,
    });

    if (!notification) {
      throw Errors.NOTIFICATION_NOT_FOUND;
    }

    return {
      item: notification,
    };
  },
};
