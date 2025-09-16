/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{cardId}/custom-field-value/customFieldGroupId:{customFieldGroupId}:customFieldId:${customFieldId}:
 *   delete:
 *     summary: Delete custom field value
 *     description: Deletes a custom field value for a specific card. Requires board editor permissions.
 *     tags:
 *       - Custom Field Values
 *     operationId: deleteCustomFieldValue
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         description: ID of the card to delete the custom field value from
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: customFieldGroupId
 *         in: path
 *         required: true
 *         description: ID of the custom field group the value belongs to
 *         schema:
 *           type: string
 *           example: "1357158568008091265"
 *       - name: customFieldId
 *         in: path
 *         required: true
 *         description: ID of the custom field the value belongs to
 *         schema:
 *           type: string
 *           example: "1357158568008091266"
 *     responses:
 *       200:
 *         description: Custom field value deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/CustomFieldValue'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
