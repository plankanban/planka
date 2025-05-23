/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
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
    projectNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const project = await Project.qm.getOneById(inputs.id);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    const boardMemberships = await BoardMembership.qm.getByProjectIdAndUserId(
      project.id,
      currentUser.id,
    );

    let boards;
    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      if (!isProjectManager) {
        if (boardMemberships.length === 0) {
          throw Errors.PROJECT_NOT_FOUND; // Forbidden
        }

        const boardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');
        boards = await Board.qm.getByIds(boardIds);
      }
    }

    if (!boards) {
      boards = await Board.qm.getByProjectId(project.id);
    }

    project.isFavorite = await sails.helpers.users.isProjectFavorite(currentUser.id, project.id);

    const projectManagers = await ProjectManager.qm.getByProjectId(project.id);

    const userIds = sails.helpers.utils.mapRecords(projectManagers, 'userId');
    const users = await User.qm.getByIds(userIds);

    const backgroundImages = await BackgroundImage.qm.getByProjectId(project.id);

    const baseCustomFieldGroups = await BaseCustomFieldGroup.qm.getByProjectId(project.id);
    const baseCustomFieldGroupsIds = sails.helpers.utils.mapRecords(baseCustomFieldGroups);

    const customFields =
      await CustomField.qm.getByBaseCustomFieldGroupIds(baseCustomFieldGroupsIds);

    let notificationServices = [];
    if (isProjectManager) {
      boardIds = sails.helpers.utils.mapRecords(boards);
      notificationServices = await NotificationService.qm.getByBoardIds(boardIds);
    }

    return {
      item: project,
      included: {
        projectManagers,
        baseCustomFieldGroups,
        boards,
        boardMemberships,
        customFields,
        notificationServices,
        users: sails.helpers.users.presentMany(users, currentUser),
        backgroundImages: sails.helpers.backgroundImages.presentMany(backgroundImages),
      },
    };
  },
};
