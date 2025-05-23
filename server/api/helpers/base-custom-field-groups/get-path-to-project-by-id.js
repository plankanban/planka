/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    pathNotFound: {},
  },

  async fn(inputs) {
    const baseCustomFieldGroup = await BaseCustomFieldGroup.qm.getOneById(inputs.id);

    if (!baseCustomFieldGroup) {
      throw 'pathNotFound';
    }

    const project = await Project.qm.getOneById(baseCustomFieldGroup.projectId);

    if (!project) {
      throw {
        pathNotFound: {
          baseCustomFieldGroup,
        },
      };
    }

    return {
      baseCustomFieldGroup,
      project,
    };
  },
};
