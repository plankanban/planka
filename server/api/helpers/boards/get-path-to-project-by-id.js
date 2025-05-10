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
    const board = await Board.qm.getOneById(inputs.id);

    if (!board) {
      throw 'pathNotFound';
    }

    const project = await Project.qm.getOneById(board.projectId);

    if (!project) {
      throw {
        pathNotFound: {
          board,
        },
      };
    }

    return {
      board,
      project,
    };
  },
};
