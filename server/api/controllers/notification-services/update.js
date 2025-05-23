/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
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
    url: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 512,
    },
    format: {
      type: 'string',
      isIn: Object.values(NotificationService.Formats),
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

    const values = _.pick(inputs, ['url', 'format']);

    if (notificationService.userId) {
      if (user.id !== currentUser.id) {
        throw Errors.NOTIFICATION_SERVICE_NOT_FOUND; // Forbidden
      }

      notificationService = await sails.helpers.notificationServices.updateOneInUser.with({
        values,
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

      notificationService = await sails.helpers.notificationServices.updateOneInBoard.with({
        values,
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
