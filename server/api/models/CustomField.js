/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * CustomField.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CustomField:
 *       type: object
 *       required:
 *         - id
 *         - baseCustomFieldGroupId
 *         - customFieldGroupId
 *         - position
 *         - name
 *         - showOnFrontOfCard
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the custom field
 *           example: "1357158568008091264"
 *         baseCustomFieldGroupId:
 *           type: string
 *           nullable: true
 *           description: ID of the base custom field group the custom field belongs to
 *           example: "1357158568008091265"
 *         customFieldGroupId:
 *           type: string
 *           nullable: true
 *           description: ID of the custom field group the custom field belongs to
 *           example: "1357158568008091266"
 *         position:
 *           type: number
 *           description: Position of the custom field within the group
 *           example: 65536
 *         name:
 *           type: string
 *           description: Name/title of the custom field
 *           example: Priority
 *         showOnFrontOfCard:
 *           type: boolean
 *           default: false
 *           description: Whether to show the field on the front of cards
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the custom field was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the custom field was last updated
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
      required: true,
    },
    showOnFrontOfCard: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'show_on_front_of_card',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    baseCustomFieldGroupId: {
      model: 'BaseCustomFieldGroup',
      columnName: 'base_custom_field_group_id',
    },
    customFieldGroupId: {
      model: 'CustomFieldGroup',
      columnName: 'custom_field_group_id',
    },
  },

  tableName: 'custom_field',
};
