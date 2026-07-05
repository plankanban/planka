/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /custom-fields/{id}:
 *   patch:
 *     summary: Update custom field
 *     description: Updates a custom field. Can update in the base custom field group (requires project manager permissions) or the custom field group (requires board editor permissions).
 *     tags:
 *       - Custom Fields
 *     operationId: updateCustomField
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the custom field to update
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 description: Position of the custom field within the group
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 description: Name/title of the custom field
 *                 example: Priority
 *               showOnFrontOfCard:
 *                 type: boolean
 *                 description: Whether to show the field on the front of cards
 *                 example: false
 *               type:
 *                 type: string
 *                 enum: [text, number, date, checkbox, dropdown]
 *                 description: >
 *                   Type of the custom field. Changing it deletes all existing values for this
 *                   field on every card. When set to `dropdown`, `config` must be provided too.
 *                 example: dropdown
 *               config:
 *                 type: object
 *                 description: >
 *                   Type-specific configuration (required for `dropdown`). Removing an option
 *                   deletes the values of cards that had it selected.
 *                 example:
 *                   options:
 *                     - id: "1357158568008091270"
 *                       name: High
 *                       color: berry-red
 *     responses:
 *       200:
 *         description: Custom field updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/CustomField'
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
const CUSTOM_FIELD_TYPES = require('../../../utils/custom-field-types');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CUSTOM_FIELD_NOT_FOUND: {
    customFieldNotFound: 'Custom field not found',
  },
  INVALID_CONFIG: {
    invalidConfig: 'Invalid config',
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
    },
    showOnFrontOfCard: {
      type: 'boolean',
    },
    type: {
      type: 'string',
      isIn: CUSTOM_FIELD_TYPES,
    },
    config: {
      type: 'json',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    customFieldNotFound: {
      responseType: 'notFound',
    },
    invalidConfig: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.customFields
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.CUSTOM_FIELD_NOT_FOUND);

    let { customField } = pathToProject;
    const { customFieldGroup, card, list, board, baseCustomFieldGroup, project } = pathToProject;

    const values = _.pick(inputs, ['position', 'name', 'showOnFrontOfCard', 'type']);

    if (!_.isUndefined(inputs.type) || !_.isUndefined(inputs.config)) {
      const type = _.isUndefined(inputs.type) ? customField.type : inputs.type;

      if (type === 'dropdown') {
        values.config = await sails.helpers.customFields.normalizeConfig
          .with({
            type,
            config: inputs.config,
          })
          .intercept('invalidConfig', () => Errors.INVALID_CONFIG);
      } else {
        values.config = {};
      }
    }

    if (customField.baseCustomFieldGroupId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.CUSTOM_FIELD_NOT_FOUND; // Forbidden
      }

      customField = await sails.helpers.customFields.updateOneInBaseCustomFieldGroup.with({
        values,
        project,
        baseCustomFieldGroup,
        record: customField,
        actorUser: currentUser,
        request: this.req,
      });
    } else if (customField.customFieldGroupId) {
      const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
        board.id,
        currentUser.id,
      );

      if (!boardMembership) {
        throw Errors.CUSTOM_FIELD_NOT_FOUND; // Forbidden
      }

      if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }

      customField = await sails.helpers.customFields.updateOneInCustomFieldGroup.with({
        values,
        project,
        board,
        list,
        card,
        customFieldGroup,
        record: customField,
        actorUser: currentUser,
        request: this.req,
      });
    }

    if (!customField) {
      throw Errors.CUSTOM_FIELD_NOT_FOUND;
    }

    return {
      item: customField,
    };
  },
};
