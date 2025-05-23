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
    const comment = await Comment.qm.getOneById(inputs.id);

    if (!comment) {
      throw 'pathNotFound';
    }

    const pathToProject = await sails.helpers.cards
      .getPathToProjectById(comment.cardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          comment,
          ...nodes,
        },
      }));

    return {
      comment,
      ...pathToProject,
    };
  },
};
