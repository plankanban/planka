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
  CUSTOM_FIELD_GROUP_NOT_FOUND: {
    customFieldGroupNotFound: 'Custom field group not found',
  },
  CUSTOM_FIELD_NOT_FOUND: {
    customFieldNotFound: 'Custom field not found',
  },
};

module.exports = {
  inputs: {
    cardId: {
      ...idInput,
      required: true,
    },
    customFieldGroupId: {
      ...idInput,
      required: true,
    },
    customFieldId: {
      ...idInput,
      required: true,
    },
    content: {
      type: 'string',
      maxLength: 512,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    customFieldGroupNotFound: {
      responseType: 'notFound',
    },
    customFieldNotFound: {
      responseType: 'notFound',
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

    const customFieldGroup = await CustomFieldGroup.qm.getOneById(inputs.customFieldGroupId);

    if (!customFieldGroup) {
      throw Errors.CUSTOM_FIELD_GROUP_NOT_FOUND;
    }

    if (customFieldGroup.boardId) {
      if (customFieldGroup.boardId !== board.id) {
        throw Errors.CUSTOM_FIELD_GROUP_NOT_FOUND;
      }
    } else if (customFieldGroup.cardId) {
      if (customFieldGroup.cardId !== card.id) {
        throw Errors.CUSTOM_FIELD_GROUP_NOT_FOUND;
      }
    }

    const customField = await CustomField.qm.getOneById(inputs.customFieldId);

    if (!customField) {
      throw Errors.CUSTOM_FIELD_NOT_FOUND;
    }

    if (customFieldGroup.baseCustomFieldGroupId) {
      if (customField.baseCustomFieldGroupId !== customFieldGroup.baseCustomFieldGroupId) {
        throw Errors.CUSTOM_FIELD_NOT_FOUND;
      }
    } else if (customField.customFieldGroupId !== customFieldGroup.id) {
      throw Errors.CUSTOM_FIELD_NOT_FOUND;
    }

    const values = _.pick(inputs, ['content']);

    const customFieldValue = await sails.helpers.customFieldValues.createOrUpdateOne.with({
      project,
      board,
      list,
      values: {
        ...values,
        card,
        customFieldGroup,
        customField,
      },
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: customFieldValue,
    };
  },
};
