module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const managerProjectIds = await sails.helpers.users.getManagerProjectIds(currentUser.id);
    const managerProjects = await sails.helpers.projects.getMany(managerProjectIds);

    let boardMemberships = await sails.helpers.users.getBoardMemberships(currentUser.id);

    let membershipBoardIds = sails.helpers.utils.mapRecords(boardMemberships, 'boardId');

    let membershipBoards = await sails.helpers.boards.getMany({
      id: membershipBoardIds,
      projectId: {
        '!=': managerProjectIds,
      },
    });

    let membershipProjectIds = sails.helpers.utils.mapRecords(membershipBoards, 'projectId', true);
    const membershipProjects = await sails.helpers.projects.getMany(membershipProjectIds);

    membershipProjectIds = sails.helpers.utils.mapRecords(membershipProjects);

    membershipBoards = membershipBoards.filter((membershipBoard) =>
      membershipProjectIds.includes(membershipBoard.projectId),
    );

    membershipBoardIds = sails.helpers.utils.mapRecords(membershipBoards);

    boardMemberships = boardMemberships.filter((boardMembership) =>
      membershipBoardIds.includes(boardMembership.boardId),
    );

    const projectIds = [...managerProjectIds, ...membershipProjectIds];
    const projects = [...managerProjects, ...membershipProjects];

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
