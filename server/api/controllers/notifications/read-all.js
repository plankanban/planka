/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /notifications/read-all:
 *   post:
 *     summary: Mark all notifications as read
 *     description: Marks all notifications for the current user as read.
 *     tags:
 *       - Notifications
 *     operationId: readAllNotifications
 *     responses:
 *       200:
 *         description: Notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const notifications = await sails.helpers.notifications.readAllForUser.with({
      user: currentUser,
      request: this.req,
    });

    return {
      items: notifications,
    };
  },
};
