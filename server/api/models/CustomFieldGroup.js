/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * CustomFieldGroup.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CustomFieldGroup:
 *       type: object
 *       required:
 *         - id
 *         - boardId
 *         - cardId
 *         - baseCustomFieldGroupId
 *         - position
 *         - name
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the custom field group
 *           example: "1357158568008091264"
 *         boardId:
 *           type: string
 *           nullable: true
 *           description: ID of the board the custom field group belongs to
 *           example: "1357158568008091265"
 *         cardId:
 *           type: string
 *           nullable: true
 *           description: ID of the card the custom field group belongs to
 *           example: "1357158568008091266"
 *         baseCustomFieldGroupId:
 *           type: string
 *           nullable: true
 *           description: ID of the base custom field group used as a template
 *           example: "1357158568008091267"
 *         position:
 *           type: number
 *           description: Position of the custom field group within the board/card
 *           example: 65536
 *         name:
 *           type: string
 *           nullable: true
 *           description: Name/title of the custom field group
 *           example: Properties
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the custom field group was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the custom field group was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    position: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    boardId: {
      model: 'Board',
      columnName: 'board_id',
    },
    cardId: {
      model: 'Card',
      columnName: 'card_id',
    },
    baseCustomFieldGroupId: {
      model: 'BaseCustomFieldGroup',
      columnName: 'base_custom_field_group_id',
    },
  },

  tableName: 'custom_field_group',
};
