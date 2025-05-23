/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

class Scoper {
  constructor(project, board, { notificationService }) {
    this.project = project;
    this.board = board;
    this.notificationService = notificationService;

    this.adminUserIds = null;
    this.projectManagerUserIds = null;
    this.boardMemberships = null;

    this.userIdsWithFullProjectVisibility = null;
    this.boardMembershipsForWholeProject = null;
    this.boardMemberUserIdsForWholeProject = null;
    this.boardMemberUserIds = null;

    this.projectRelatedUserIds = null;
    this.boardRelatedUserIds = null;
    this.notificationServiceRelatedUserIds = null;
  }

  replaceProject(project) {
    if (this.project && project.id !== this.project.id) {
      this.projectManagerUserIds = null;

      this.boardMembershipsForWholeProject = null;
      this.boardMemberUserIdsForWholeProject = null;
    }

    this.project = project;

    this.userIdsWithFullProjectVisibility = null;

    this.projectRelatedUserIds = null;
    this.boardRelatedUserIds = null;
  }

  replaceBoard(board) {
    if (this.board && board.id !== this.board.id) {
      this.boardMemberships = null;

      this.boardMemberUserIds = null;

      this.boardRelatedUserIds = null;
    }

    this.board = board;
  }

  clone() {
    return _.cloneDeep(this);
  }

  cloneForProject(project) {
    const scoper = this.clone();
    scoper.replaceProject(project);

    return scoper;
  }

  cloneForBoard(board) {
    const scoper = this.clone();
    scoper.replaceBoard(board);

    return scoper;
  }

  async getAdminUserIds() {
    if (!this.adminUserIds) {
      this.adminUserIds = await sails.helpers.users.getAllIds(User.Roles.ADMIN);
    }

    return this.adminUserIds;
  }

  async getProjectManagerUserIds() {
    if (!this.projectManagerUserIds) {
      this.projectManagerUserIds = await sails.helpers.projects.getManagerUserIds(this.project.id);
    }

    return this.projectManagerUserIds;
  }

  async getBoardMemberships() {
    if (!this.boardMemberships) {
      this.boardMemberships = await BoardMembership.qm.getByBoardId(this.board.id);
    }

    return this.boardMemberships;
  }

  async getUserIdsWithFullProjectVisibility() {
    if (!this.userIdsWithFullProjectVisibility) {
      const projectManagerUserIds = await this.getProjectManagerUserIds();

      if (this.project.ownerProjectManagerId) {
        this.userIdsWithFullProjectVisibility = projectManagerUserIds;
      } else {
        const adminUserIds = await this.getAdminUserIds();

        this.userIdsWithFullProjectVisibility = _.union(adminUserIds, projectManagerUserIds);
      }
    }

    return this.userIdsWithFullProjectVisibility;
  }

  async getBoardMembershipsForWholeProject() {
    if (!this.boardMembershipsForWholeProject) {
      this.boardMembershipsForWholeProject = await BoardMembership.qm.getByProjectId(
        this.project.id,
      );
    }

    return this.boardMembershipsForWholeProject;
  }

  async getBoardMemberUserIdsForWholeProject() {
    if (!this.boardMemberUserIdsForWholeProject) {
      const boardMembershipsForWholeProject = await this.getBoardMembershipsForWholeProject();

      this.boardMemberUserIdsForWholeProject = sails.helpers.utils.mapRecords(
        boardMembershipsForWholeProject,
        'userId',
        true,
      );
    }

    return this.boardMemberUserIdsForWholeProject;
  }

  async getBoardMemberUserIds() {
    if (!this.boardMemberUserIds) {
      const boardMemberships = await this.getBoardMemberships();

      this.boardMemberUserIds = sails.helpers.utils.mapRecords(boardMemberships, 'userId');
    }

    return this.boardMemberUserIds;
  }

  async getProjectRelatedUserIds() {
    if (!this.projectRelatedUserIds) {
      const userIdsWithFullProjectVisibility = await this.getUserIdsWithFullProjectVisibility();
      const boardMemberUserIdsForWholeProject = await this.getBoardMemberUserIdsForWholeProject();

      this.projectRelatedUserIds = _.union(
        userIdsWithFullProjectVisibility,
        boardMemberUserIdsForWholeProject,
      );
    }

    return this.projectRelatedUserIds;
  }

  async getBoardRelatedUserIds() {
    if (!this.boardRelatedUserIds) {
      const userIdsWithFullProjectVisibility = await this.getUserIdsWithFullProjectVisibility();
      const boardMemberUserIds = await this.getBoardMemberUserIds();

      this.boardRelatedUserIds = _.union(userIdsWithFullProjectVisibility, boardMemberUserIds);
    }

    return this.boardRelatedUserIds;
  }

  async getNotificationServiceRelatedUserIds() {
    if (!this.notificationServiceRelatedUserIds) {
      this.notificationServiceRelatedUserIds = await this.getProjectManagerUserIds();
    }

    return this.notificationServiceRelatedUserIds;
  }
}

module.exports = {
  sync: true,

  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
    },
    notificationService: {
      type: 'ref',
    },
  },

  exits: {
    boardMustBePresent: {},
  },

  fn(inputs) {
    if (inputs.notificationService && !inputs.board) {
      throw 'boardMustBePresent';
    }

    return new Scoper(inputs.record, inputs.board, {
      notificationService: inputs.notificationService,
    });
  },
};
