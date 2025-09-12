/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all accessible projects
 *     description: Retrieves all projects the current user has access to, including managed projects, membership projects, and shared projects (for admins).
 *     tags:
 *       - Projects
 *     operationId: getProjects
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
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
 *                       - $ref: '#/components/schemas/Project'
 *                       - type: object
 *                         properties:
 *                           isFavorite:
 *                             type: boolean
 *                             description: Whether the project is marked as favorite by the current user
 *                             example: true
 *                 included:
 *                   type: object
 *                   required:
 *                     - users
 *                     - projectManagers
 *                     - backgroundImages
 *                     - baseCustomFieldGroups
 *                     - boards
 *                     - boardMemberships
 *                     - customFields
 *                     - notificationServices
 *                   properties:
 *                     users:
 *                       type: array
 *                       description: Related users
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     projectManagers:
 *                       type: array
 *                       description: Related project managers
 *                       items:
 *                         $ref: '#/components/schemas/ProjectManager'
 *                     backgroundImages:
 *                       type: array
 *                       description: Related background images
 *                       items:
 *                         $ref: '#/components/schemas/BackgroundImage'
 *                     baseCustomFieldGroups:
 *                       type: array
 *                       description: Related base custom field groups
 *                       items:
 *                         $ref: '#/components/schemas/BaseCustomFieldGroup'
 *                     boards:
 *                       type: array
 *                       description: Related boards
 *                       items:
 *                         $ref: '#/components/schemas/Board'
 *                     boardMemberships:
 *                       type: array
 *                       description: Related board memberships (for current user)
 *                       items:
 *                         $ref: '#/components/schemas/BoardMembership'
 *                     customFields:
 *                       type: array
 *                       description: Related custom fields
 *                       items:
 *                         $ref: '#/components/schemas/CustomField'
 *                     notificationServices:
 *                       type: array
 *                       description: Related notification services (for managed projects)
 *                       items:
 *                         $ref: '#/components/schemas/NotificationService'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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
