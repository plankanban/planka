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
    const customFieldGroup = await CustomFieldGroup.qm.getOneById(inputs.id);

    if (!customFieldGroup) {
      throw 'pathNotFound';
    }

    let pathToProject;
    if (customFieldGroup.boardId) {
      pathToProject = await sails.helpers.boards
        .getPathToProjectById(customFieldGroup.boardId)
        .intercept('pathNotFound', (nodes) => ({
          pathNotFound: {
            customFieldGroup,
            ...nodes,
          },
        }));
    } else if (customFieldGroup.cardId) {
      pathToProject = await sails.helpers.cards
        .getPathToProjectById(customFieldGroup.cardId)
        .intercept('pathNotFound', (nodes) => ({
          pathNotFound: {
            customFieldGroup,
            ...nodes,
          },
        }));
    }

    return {
      customFieldGroup,
      ...pathToProject,
    };
  },
};
