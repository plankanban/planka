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
  CUSTOM_FIELD_VALUE_NOT_FOUND: {
    customFieldValueNotFound: 'Custom field value not found',
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
    customFieldValueNotFound: {
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

    let customFieldValue =
      await CustomFieldValue.qm.getOneByCardIdAndCustomFieldGroupIdAndCustomFieldId(
        card.id,
        customFieldGroup.id,
        inputs.customFieldId,
      );

    if (!customFieldValue) {
      throw Errors.CUSTOM_FIELD_VALUE_NOT_FOUND;
    }

    customFieldValue = await sails.helpers.customFieldValues.deleteOne.with({
      project,
      board,
      list,
      card,
      customFieldGroup,
      record: customFieldValue,
      actorUser: currentUser,
      request: this.req,
    });

    if (!customFieldValue) {
      throw Errors.CUSTOM_FIELD_VALUE_NOT_FOUND;
    }

    return {
      item: customFieldValue,
    };
  },
};
