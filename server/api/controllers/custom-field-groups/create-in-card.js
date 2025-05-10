/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  BASE_CUSTOM_FIELD_GROUP_NOT_FOUND: {
    baseCustomFieldGroupNotFound: 'Base custom field group not found',
  },
  BASE_CUSTOM_FIELD_GROUP_OR_NAME_MUST_BE_PRESENT: {
    baseCustomFieldGroupOrNameMustBePresent: 'Base custom field group or name must be present',
  },
};

module.exports = {
  inputs: {
    cardId: {
      ...idInput,
      required: true,
    },
    baseCustomFieldGroupId: idInput,
    position: {
      type: 'number',
      min: 0,
      required: true,
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
    cardNotFound: {
      responseType: 'notFound',
    },
    baseCustomFieldGroupNotFound: {
      responseType: 'notFound',
    },
    baseCustomFieldGroupOrNameMustBePresent: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, list, board, project } = await sails.helpers.cards
      .getPathToProjectById(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    let baseCustomFieldGroup;
    if (inputs.baseCustomFieldGroupId) {
      baseCustomFieldGroup = await BaseCustomFieldGroup.qm.getOneById(
        inputs.baseCustomFieldGroupId,
        {
          projectId: project.id,
        },
      );

      if (!baseCustomFieldGroup) {
        throw Errors.BASE_CUSTOM_FIELD_GROUP_NOT_FOUND;
      }
    }

    const values = _.pick(inputs, ['position', 'name']);

    const customFieldGroup = await sails.helpers.customFieldGroups.createOneInCard
      .with({
        project,
        board,
        list,
        values: {
          ...values,
          card,
          baseCustomFieldGroup,
        },
        actorUser: currentUser,
        request: this.req,
      })
      .intercept(
        'baseCustomFieldGroupOrNameMustBeInValues',
        () => Errors.BASE_CUSTOM_FIELD_GROUP_OR_NAME_MUST_BE_PRESENT,
      );

    return {
      item: customFieldGroup,
    };
  },
};
