/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CUSTOM_FIELD_GROUP_NOT_FOUND: {
    customFieldGroupNotFound: 'Custom field group not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    customFieldGroupNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.customFieldGroups
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.CUSTOM_FIELD_GROUP_NOT_FOUND);

    let { customFieldGroup } = pathToProject;
    const { card, list, board, project } = pathToProject;

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.CUSTOM_FIELD_GROUP_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (customFieldGroup.boardId) {
      customFieldGroup = await sails.helpers.customFieldGroups.deleteOneInBoard.with({
        project,
        board,
        record: customFieldGroup,
        actorUser: currentUser,
        request: this.req,
      });
    } else if (customFieldGroup.cardId) {
      customFieldGroup = await sails.helpers.customFieldGroups.deleteOneInCard.with({
        project,
        board,
        list,
        card,
        record: customFieldGroup,
        actorUser: currentUser,
        request: this.req,
      });
    }

    if (!customFieldGroup) {
      throw Errors.CUSTOM_FIELD_GROUP_NOT_FOUND;
    }

    return {
      item: customFieldGroup,
    };
  },
};
