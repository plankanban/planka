/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * CustomFieldValue.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CustomFieldValue:
 *       type: object
 *       required:
 *         - id
 *         - cardId
 *         - customFieldGroupId
 *         - customFieldId
 *         - content
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the custom field value
 *           example: "1357158568008091264"
 *         cardId:
 *           type: string
 *           description: ID of the card the value belongs to
 *           example: "1357158568008091265"
 *         customFieldGroupId:
 *           type: string
 *           description: ID of the custom field group the value belongs to
 *           example: "1357158568008091266"
 *         customFieldId:
 *           type: string
 *           description: ID of the custom field the value belongs to
 *           example: "1357158568008091267"
 *         content:
 *           type: string
 *           description: Content/value of the custom field
 *           example: High Priority
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the custom field value was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the custom field value was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    content: {
      type: 'string',
      required: true,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    cardId: {
      model: 'Card',
      required: true,
      columnName: 'card_id',
    },
    customFieldGroupId: {
      model: 'CustomFieldGroup',
      required: true,
      columnName: 'custom_field_group_id',
    },
    customFieldId: {
      model: 'CustomField',
      required: true,
      columnName: 'custom_field_id',
    },
  },

  tableName: 'custom_field_value',
};
