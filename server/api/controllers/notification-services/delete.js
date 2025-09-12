/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /notification-services/{id}:
 *   delete:
 *     summary: Delete notification service
 *     description: Deletes a notification service. Users can delete their own services, project managers can delete board services.
 *     tags:
 *       - Notification Services
 *     operationId: deleteNotificationService
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the notification service to delete
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Notification service deleted successfully
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

    const pathToProject = await sails.helpers.notificationServices
      .getPathToUserById(inputs.id)
      .intercept('pathNotFound', () => Errors.NOTIFICATION_SERVICE_NOT_FOUND);

    let { notificationService } = pathToProject;
    const { user, board, project } = pathToProject;

    if (notificationService.userId) {
      if (user.id !== currentUser.id) {
        throw Errors.NOTIFICATION_SERVICE_NOT_FOUND; // Forbidden
      }

      notificationService = await sails.helpers.notificationServices.deleteOneInUser.with({
        user,
        record: notificationService,
        actorUser: currentUser,
        request: this.req,
      });
    } else if (notificationService.boardId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.NOTIFICATION_SERVICE_NOT_FOUND; // Forbidden
      }

      notificationService = await sails.helpers.notificationServices.deleteOneInBoard.with({
        project,
        board,
        record: notificationService,
        actorUser: currentUser,
        request: this.req,
      });
    }

    if (!notificationService) {
      throw Errors.NOTIFICATION_SERVICE_NOT_FOUND;
    }

    return {
      item: notificationService,
    };
  },
};
