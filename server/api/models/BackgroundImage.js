/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * BackgroundImage.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BackgroundImage:
 *       type: object
 *       required:
 *         - id
 *         - projectId
 *         - size
 *         - url
 *         - thumbnailUrls
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the background image
 *           example: "1357158568008091264"
 *         projectId:
 *           type: string
 *           description: ID of the project the background image belongs to
 *           example: "1357158568008091265"
 *         size:
 *           type: string
 *           description: File size of the background image in bytes
 *           example: 1024576
 *         url:
 *           type: string
 *           format: uri
 *           description: URL to access the full-size background image
 *           example: https://storage.example.com/background-images/1357158568008091264/original.jpg
 *         thumbnailUrls:
 *           type: object
 *           required:
 *             - outside360
 *           description: URLs for different thumbnail sizes of the background image
 *           properties:
 *             outside360:
 *               type: string
 *               format: uri
 *               description: URL for 360px thumbnail version
 *               example: https://storage.example.com/background-images/1357158568008091264/outside-360.jpg
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the background image was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the background image was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    extension: {
      type: 'string',
      required: true,
    },
    size: {
      type: 'string',
      required: true,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    uploadedFileId: {
      model: 'UploadedFile',
      required: true,
      columnName: 'uploaded_file_id',
    },
    projectId: {
      model: 'Project',
      required: true,
      columnName: 'project_id',
    },
  },

  tableName: 'background_image',
};
