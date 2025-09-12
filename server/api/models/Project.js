/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Project.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - id
 *         - ownerProjectManagerId
 *         - backgroundImageId
 *         - name
 *         - description
 *         - backgroundType
 *         - backgroundGradient
 *         - isHidden
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the project
 *           example: "1357158568008091264"
 *         ownerProjectManagerId:
 *           type: string
 *           nullable: true
 *           description: ID of the project manager who owns the project
 *           example: "1357158568008091265"
 *         backgroundImageId:
 *           type: string
 *           nullable: true
 *           description: ID of the background image used as background
 *           example: "1357158568008091266"
 *         name:
 *           type: string
 *           description: Name/title of the project
 *           example: Development Project
 *         description:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the project
 *           example: A project for developing new features...
 *         backgroundType:
 *           type: string
 *           enum: [gradient, image]
 *           nullable: true
 *           description: Type of background for the project
 *           example: gradient
 *         backgroundGradient:
 *           type: string
 *           enum: [old-lime, ocean-dive, tzepesch-style, jungle-mesh, strawberry-dust, purple-rose, sun-scream, warm-rust, sky-change, green-eyes, blue-xchange, blood-orange, sour-peel, green-ninja, algae-green, coral-reef, steel-grey, heat-waves, velvet-lounge, purple-rain, blue-steel, blueish-curve, prism-light, green-mist, red-curtain]
 *           nullable: true
 *           description: Gradient background for the project
 *           example: ocean-dive
 *         isHidden:
 *           type: boolean
 *           default: false
 *           description: Whether the project is hidden
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the project was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the project was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

const Types = {
  PRIVATE: 'private',
  SHARED: 'shared',
};

const BackgroundTypes = {
  GRADIENT: 'gradient',
  IMAGE: 'image',
};

const BACKGROUND_GRADIENTS = [
  'old-lime',
  'ocean-dive',
  'tzepesch-style',
  'jungle-mesh',
  'strawberry-dust',
  'purple-rose',
  'sun-scream',
  'warm-rust',
  'sky-change',
  'green-eyes',
  'blue-xchange',
  'blood-orange',
  'sour-peel',
  'green-ninja',
  'algae-green',
  'coral-reef',
  'steel-grey',
  'heat-waves',
  'velvet-lounge',
  'purple-rain',
  'blue-steel',
  'blueish-curve',
  'prism-light',
  'green-mist',
  'red-curtain',
];

module.exports = {
  Types,
  BackgroundTypes,
  BACKGROUND_GRADIENTS,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    backgroundType: {
      type: 'string',
      isIn: Object.values(BackgroundTypes),
      allowNull: true,
      columnName: 'background_type',
    },
    backgroundGradient: {
      type: 'string',
      isIn: BACKGROUND_GRADIENTS,
      allowNull: true,
      columnName: 'background_gradient',
    },
    isHidden: {
      type: 'boolean',
      defaultsTo: false, // TODO: implement via normalizeValues?
      columnName: 'is_hidden',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    ownerProjectManagerId: {
      model: 'ProjectManager',
      columnName: 'owner_project_manager_id',
    },
    backgroundImageId: {
      model: 'BackgroundImage',
      columnName: 'background_image_id',
    },
    managerUsers: {
      collection: 'User',
      via: 'projectId',
      through: 'ProjectManager',
    },
    boards: {
      collection: 'Board',
      via: 'projectId',
    },
  },
};
