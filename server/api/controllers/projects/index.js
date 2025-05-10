/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  async fn() {
    const { currentUser } = this.req;

    let sharedProjects;
    let sharedProjectIds;

    const managerProjectIds = await sails.helpers.users.getManagerProjectIds(currentUser.id);
    const fullyVisibleProjectIds = [...managerProjectIds];

    if (currentUser.role === User.Roles.ADMIN) {
      sharedProjects = await Project.qm.getShared({
        exceptIdOrIds: managerProjectIds,
      });

      sharedProjectIds = sails.helpers.utils.mapRecords(sharedProjects);
      fullyVisibleProjectIds.push(...sharedProjectIds);
    }

    const boardMemberships = await BoardMembership.qm.getByUserId(currentUser.id);
    const membershipBoardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');

    const membershipBoards = await Board.qm.getByIds(membershipBoardIds, {
      exceptProjectIdOrIds: fullyVisibleProjectIds,
    });

    const membershipProjectIds = sails.helpers.utils.mapRecords(
      membershipBoards,
      'projectId',
      true,
    );

    const projectIds = [...managerProjectIds, ...membershipProjectIds];
    const projects = await Project.qm.getByIds(projectIds);

    if (sharedProjectIds) {
      projectIds.push(...sharedProjectIds);
      projects.push(...sharedProjects);
    }

    const fullyVisibleBoards = await Board.qm.getByProjectIds(fullyVisibleProjectIds);
    const boards = [...fullyVisibleBoards, ...membershipBoards];

    const projectFavorites = await ProjectFavorite.qm.getByProjectIdsAndUserId(
      projectIds,
      currentUser.id,
    );

    const projectManagers = await ProjectManager.qm.getByProjectIds(projectIds);

    const userIds = sails.helpers.utils.mapRecords(projectManagers, 'userId', true);
    const users = await User.qm.getByIds(userIds);

    const backgroundImages = await BackgroundImage.qm.getByProjectIds(projectIds);

    const baseCustomFieldGroups = await BaseCustomFieldGroup.qm.getByProjectIds(projectIds);
    const baseCustomFieldGroupsIds = sails.helpers.utils.mapRecords(baseCustomFieldGroups);

    const customFields =
      await CustomField.qm.getByBaseCustomFieldGroupIds(baseCustomFieldGroupsIds);

    let notificationServices = [];
    if (managerProjectIds.length > 0) {
      const managerProjectIdsSet = new Set(managerProjectIds);

      const managerBoardIds = boards.flatMap((board) =>
        managerProjectIdsSet.has(board.projectId) ? board.id : [],
      );

      notificationServices = await NotificationService.qm.getByBoardIds(managerBoardIds);
    }

    const isFavoriteByProjectId = projectFavorites.reduce(
      (result, projectFavorite) => ({
        ...result,
        [projectFavorite.projectId]: true,
      }),
      {},
    );

    projects.forEach((project) => {
      // eslint-disable-next-line no-param-reassign
      project.isFavorite = isFavoriteByProjectId[project.id] || false;
    });

    return {
      items: projects,
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
