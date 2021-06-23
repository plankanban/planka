const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
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

    const project = await Project.findOne(inputs.id);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    let boards = await sails.helpers.projects.getBoards(project.id);
    let boardIds = sails.helpers.utils.mapRecords(boards);

    const boardMemberships = await sails.helpers.boardMemberships.getMany({
      boardId: boardIds,
      userId: currentUser.id,
    });

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      if (boardMemberships.length === 0) {
        throw Errors.PROJECT_NOT_FOUND; // Forbidden
      }

      boardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');
      boards = boards.filter((board) => boardIds.includes(board.id));
    }

    const projectManagers = await sails.helpers.projects.getProjectManagers(project.id);

    const userIds = sails.helpers.utils.mapRecords(projectManagers, 'userId');
    const users = await sails.helpers.users.getMany(userIds);

    return {
      item: project,
      included: {
        users,
        projectManagers,
        boards,
        boardMemberships,
      },
    };
  },
};
