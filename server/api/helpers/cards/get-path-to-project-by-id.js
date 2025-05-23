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
    const card = await Card.qm.getOneById(inputs.id);

    if (!card) {
      throw 'pathNotFound';
    }

    const pathToProject = await sails.helpers.lists
      .getPathToProjectById(card.listId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          card,
          ...nodes,
        },
      }));

    return {
      card,
      ...pathToProject,
    };
  },
};
