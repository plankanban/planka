module.exports = {
  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const projectIds = await sails.helpers.getMembershipProjectIdsForUser(currentUser.id);

    const projects = await sails.helpers.getProjects(projectIds);

    const { userIds, projectMemberships } = await sails.helpers.getMembershipUserIdsForProject(
      projectIds,
      true,
    );

    const users = await sails.helpers.getUsers(userIds);

    const boards = await sails.helpers.getBoardsForProject(projectIds);

    return exits.success({
      items: projects,
      included: {
        users,
        projectMemberships,
        boards,
      },
    });
  },
};
