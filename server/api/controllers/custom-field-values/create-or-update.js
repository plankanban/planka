/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /cards/{cardId}/custom-field-values/customFieldGroupId:{customFieldGroupId}:customFieldId:{customFieldId}:
 *   patch:
 *     summary: Create or update custom field value
 *     description: Creates or updates a custom field value for a card. Requires board editor permissions.
 *     tags:
 *       - Custom Field Values
 *     operationId: updateCustomFieldValue
 *     parameters:
 *       - name: cardId
 *         in: path
 *         required: true
 *         description: ID of the card to set the custom field value for
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 512
 *                 description: >
 *                   Content/value of the custom field. Its expected format depends on the
 *                   custom field's `type`: free text for `text`, a numeric string for `number`
 *                   (e.g. `"12.5"`), an ISO 8601 date (`YYYY-MM-DD`) for `date`, `"true"` or
 *                   `"false"` for `checkbox`, and the `id` of one of the field's
 *                   `config.options` for `dropdown`.
 *                 example: High Priority
 *     responses:
 *       200:
 *         description: Custom field value created or updated successfully
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
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
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
  INVALID_CONTENT: {
    invalidContent: 'Invalid content',
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
    invalidContent: {
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

    const isContentValid = sails.helpers.customFieldValues.validateContent(
      customField,
      inputs.content,
    );

    if (!isContentValid) {
      throw Errors.INVALID_CONTENT;
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
