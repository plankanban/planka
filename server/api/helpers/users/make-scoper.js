/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

class Scoper {
  constructor(user) {
    this.user = user;

    this.projectManagers = null;

    this.separatedUserIds = null;
    this.userRelatedProjectManagerAndBoardMemberUserIds = null;

    this.privateUserRelatedUserIds = null;
    this.publicUserRelatedUserIds = null;
  }

  async getProjectManagers() {
    if (!this.projectManagers) {
      this.projectManagers = await ProjectManager.qm.getByUserId(this.user.id);
    }

    return this.projectManagers;
  }

  async getSeparatedUserIds() {
    if (!this.separatedUserIds) {
      const users = await User.qm.getAll({
        roleOrRoles: [User.Roles.ADMIN, User.Roles.PROJECT_OWNER],
      });

      const adminUserIds = [];
      const projectOwnerUserIds = [];

      users.forEach((user) => {
        if (user.role === User.Roles.ADMIN) {
          adminUserIds.push(user.id);
        } else {
          projectOwnerUserIds.push(user.id);
        }
      });

      this.separatedUserIds = {
        adminUserIds,
        projectOwnerUserIds,
      };
    }

    return this.separatedUserIds;
  }

  async getUserRelatedProjectManagerAndBoardMemberUserIds() {
    if (!this.userRelatedProjectManagerAndBoardMemberUserIds) {
      const projectManagers = await this.getProjectManagers();
      const projectIds = sails.helpers.utils.mapRecords(projectManagers, 'projectId');

      const relatedProjectManagers = await ProjectManager.qm.getByProjectIds(projectIds, {
        exceptUserIdOrIds: this.user.id,
      });

      const relatedProjectManagerUserIds = sails.helpers.utils.mapRecords(
        relatedProjectManagers,
        'userId',
      );

      const relatedProjectBoardMemberships = await BoardMembership.qm.getByProjectIds(projectIds);

      const relatedProjectBoardMemberUserIds = sails.helpers.utils.mapRecords(
        relatedProjectBoardMemberships,
        'userId',
      );

      const boardMemberships = await BoardMembership.qm.getByUserId(this.user.id, {
        exceptProjectIdOrIds: projectIds,
      });

      const boardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');

      const relatedBoardMemberships = await BoardMembership.qm.getByBoardIds(boardIds, {
        exceptUserIdOrIds: this.user.id,
      });

      const relatedBoardMemberUserIds = sails.helpers.utils.mapRecords(
        relatedBoardMemberships,
        'userId',
      );

      this.userRelatedProjectManagerAndBoardMemberUserIds = _.union(
        relatedProjectManagerUserIds,
        relatedProjectBoardMemberUserIds,
        relatedBoardMemberUserIds,
      );
    }

    return this.userRelatedProjectManagerAndBoardMemberUserIds;
  }

  async getPrivateUserRelatedUserIds() {
    if (!this.privateUserRelatedUserIds) {
      const { adminUserIds } = await this.getSeparatedUserIds();

      this.privateUserRelatedUserIds = _.union([this.user.id], adminUserIds);
    }

    return this.privateUserRelatedUserIds;
  }

  async getPublicUserRelatedUserIds(skipRelatedProjectManagerAndBoardMemberUserIds = false) {
    if (!this.publicUserRelatedUserIds) {
      const privateUserRelatedUserIds = await this.getPrivateUserRelatedUserIds();
      const privateUserRelatedUserIdsSet = new Set(privateUserRelatedUserIds);

      const { projectOwnerUserIds } = await this.getSeparatedUserIds();

      let userRelatedProjectManagerAndBoardMemberUserIds;
      if (!skipRelatedProjectManagerAndBoardMemberUserIds) {
        userRelatedProjectManagerAndBoardMemberUserIds =
          await this.getUserRelatedProjectManagerAndBoardMemberUserIds();
      }

      const externalPublicUserRelatedUserIds = _.union(
        projectOwnerUserIds,
        userRelatedProjectManagerAndBoardMemberUserIds,
      );

      this.publicUserRelatedUserIds = externalPublicUserRelatedUserIds.filter(
        (userId) => !privateUserRelatedUserIdsSet.has(userId),
      );
    }

    return this.publicUserRelatedUserIds;
  }
}

module.exports = {
  sync: true,

  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    return new Scoper(inputs.record);
  },
};
