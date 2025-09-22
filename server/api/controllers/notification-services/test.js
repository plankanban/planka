/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /notification-services/{id}/test:
 *   post:
 *     summary: Test notification service
 *     description: Sends a test notification to verify the notification service is working. Users can test their own services, project managers can test board services.
 *     tags:
 *       - Notification Services
 *     operationId: testNotificationService
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the notification service to test
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/NotificationService'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOTIFICATION_SERVICE_NOT_FOUND: {
    notificationServiceNotFound: 'Notification service not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    notificationServiceNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { notificationService, user, project } = await sails.helpers.notificationServices
      .getPathToUserById(inputs.id)
      .intercept('pathNotFound', () => Errors.NOTIFICATION_SERVICE_NOT_FOUND);

    if (notificationService.userId) {
      if (user.id !== currentUser.id) {
        throw Errors.NOTIFICATION_SERVICE_NOT_FOUND; // Forbidden
      }
    } else if (notificationService.boardId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.NOTIFICATION_SERVICE_NOT_FOUND; // Forbidden
      }
    }

    /* eslint-disable no-underscore-dangle */
    await sails.helpers.utils.sendNotifications.with({
      services: [_.pick(notificationService, ['url', 'format'])],
      title: this.req.i18n.__('Test Title'),
      bodyByFormat: {
        text: this.req.i18n.__('This is a test text message!'),
        markdown: this.req.i18n.__('This is a *test* **markdown** `message`!'),
        html: this.req.i18n.__('This is a <i>test</i> <b>html</b> <code>message</code>!'),
      },
    });
    /* eslint-enable no-underscore-dangle */

    return {
      item: notificationService,
    };
  },
};
