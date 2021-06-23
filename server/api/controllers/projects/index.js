module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const managerProjectIds = await sails.helpers.users.getManagerProjectIds(currentUser.id);

    const boardMemberships = await sails.helpers.users.getBoardMemberships(currentUser.id);
    const membershipBoardIds = await sails.helpers.utils.mapRecords(boardMemberships, 'boardId');

    const membershipBoards = await sails.helpers.boards.getMany({
      id: membershipBoardIds,
      projectId: {
        '!=': managerProjectIds,
      },
    });

    const membershipProjectIds = sails.helpers.utils.mapRecords(
      membershipBoards,
      'projectId',
      true,
    );

    const projectIds = [...managerProjectIds, ...membershipProjectIds];
    const projects = await sails.helpers.projects.getMany(projectIds);

    const projectManagers = await sails.helpers.projects.getProjectManagers(projectIds);

    const userIds = sails.helpers.utils.mapRecords(projectManagers, 'userId', true);
    const users = await sails.helpers.users.getMany(userIds);

    const managerBoards = await sails.helpers.projects.getBoards(managerProjectIds);
    const boards = [...managerBoards, ...membershipBoards];

    return {
      items: projects,
      included: {
        users,
        projectManagers,
        boards,
        boardMemberships,
      },
    };
  },
};
