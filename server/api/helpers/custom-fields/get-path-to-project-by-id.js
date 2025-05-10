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
    const customField = await CustomField.qm.getOneById(inputs.id);

    if (!customField) {
      throw 'pathNotFound';
    }

    let pathToProject;
    if (customField.baseCustomFieldGroupId) {
      pathToProject = await sails.helpers.baseCustomFieldGroups
        .getPathToProjectById(customField.baseCustomFieldGroupId)
        .intercept('pathNotFound', (nodes) => ({
          pathNotFound: {
            customField,
            ...nodes,
          },
        }));
    } else if (customField.customFieldGroupId) {
      pathToProject = await sails.helpers.customFieldGroups
        .getPathToProjectById(customField.customFieldGroupId)
        .intercept('pathNotFound', (nodes) => ({
          pathNotFound: {
            customField,
            ...nodes,
          },
        }));
    }

    return {
      customField,
      ...pathToProject,
    };
  },
};
