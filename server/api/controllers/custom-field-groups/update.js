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
  NAME_MUST_NOT_BE_NULL: {
    nameMustNotBeNull: 'Name must not be null',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    position: {
      type: 'number',
      min: 0,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
      allowNull: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    customFieldGroupNotFound: {
      responseType: 'notFound',
    },
    nameMustNotBeNull: {
      responseType: 'unprocessableEntity',
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

    const values = _.pick(inputs, ['position', 'name']);

    if (customFieldGroup.boardId) {
      customFieldGroup = await sails.helpers.customFieldGroups.updateOneInBoard
        .with({
          values,
          project,
          board,
          record: customFieldGroup,
          actorUser: currentUser,
          request: this.req,
        })
        .intercept('nameInValuesMustNotBeNull', () => Errors.NAME_MUST_NOT_BE_NULL);
    } else if (customFieldGroup.cardId) {
      customFieldGroup = await sails.helpers.customFieldGroups.updateOneInCard
        .with({
          values,
          project,
          board,
          list,
          card,
          record: customFieldGroup,
          actorUser: currentUser,
          request: this.req,
        })
        .intercept('nameInValuesMustNotBeNull', () => Errors.NAME_MUST_NOT_BE_NULL);
    }

    if (!customFieldGroup) {
      throw Errors.CUSTOM_FIELD_GROUP_NOT_FOUND;
    }

    return {
      item: customFieldGroup,
    };
  },
};
