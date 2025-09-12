/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Retrieves all unread notifications for the current user, including creator users.
 *     tags:
 *       - Notifications
 *     operationId: getNotifications
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
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
 *                     $ref: '#/components/schemas/Notification'
 *                 included:
 *                   type: object
 *                   required:
 *                     - users
 *                   properties:
 *                     users:
 *                       type: array
 *                       description: Related users
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const notifications = await Notification.qm.getUnreadByUserId(currentUser.id);

    const userIds = sails.helpers.utils.mapRecords(notifications, 'creatorUserId', true, true);
    const users = await User.qm.getByIds(userIds);

    return {
      items: notifications,
      included: {
        users: sails.helpers.users.presentMany(users, currentUser),
      },
    };
  },
};
