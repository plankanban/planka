/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    type: {
      type: 'string',
      isIn: Object.values(Project.Types),
      required: true,
    },
    name: {
      type: 'string',
      maxLength: 128,
      required: true,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1024,
      allowNull: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const values = _.pick(inputs, ['type', 'name', 'description']);

    const { project, projectManager } = await sails.helpers.projects.createOne.with({
      values,
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: project,
      included: {
        projectManagers: [projectManager],
      },
    };
  },
};
