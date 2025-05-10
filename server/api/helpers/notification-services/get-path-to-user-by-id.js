/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    pathNotFound: {},
  },

  async fn(inputs) {
    const notificationService = await NotificationService.qm.getOneById(inputs.id);

    if (!notificationService) {
      throw 'pathNotFound';
    }

    let pathToProject;
    if (notificationService.userId) {
      const user = await User.qm.getOneById(notificationService.userId);

      if (!user) {
        throw {
          pathNotFound: {
            notificationService,
          },
        };
      }

      pathToProject = {
        user,
      };
    } else if (notificationService.boardId) {
      pathToProject = await sails.helpers.boards
        .getPathToProjectById(notificationService.boardId)
        .intercept('pathNotFound', (nodes) => ({
          pathNotFound: {
            notificationService,
            ...nodes,
          },
        }));
    }

    return {
      notificationService,
      ...pathToProject,
    };
  },
};
