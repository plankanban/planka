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
    customFieldGroupId: {
      ...idInput,
      required: true,
    },
    position: {
      type: 'number',
      min: 0,
      required: true,
    },
    name: {
      type: 'string',
      maxLength: 128,
      required: true,
    },
    showOnFrontOfCard: {
      type: 'boolean',
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

    const { customFieldGroup, card, list, board, project } = await sails.helpers.customFieldGroups
      .getPathToProjectById(inputs.customFieldGroupId)
      .intercept('pathNotFound', () => Errors.CUSTOM_FIELD_GROUP_NOT_FOUND);

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

    const values = _.pick(inputs, ['position', 'name', 'showOnFrontOfCard']);

    const customField = await sails.helpers.customFields.createOneInCustomFieldGroup.with({
      project,
      board,
      list,
      card,
      values: {
        ...values,
        customFieldGroup,
      },
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: customField,
    };
  },
};
