/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /projects/{projectId}/boards:
 *   post:
 *     summary: Create board
 *     description: Creates a board within a project. Supports importing from Trello. Requires project manager permissions.
 *     tags:
 *       - Boards
 *     operationId: createBoard
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project to create the board in
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - position
 *               - name
 *             properties:
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 description: Position of the board within the project
 *                 example: 65536
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 description: Name/title of the board
 *                 example: Development Board
 *               importType:
 *                 type: string
 *                 enum: [trello]
 *                 description: Type of import
 *                 example: trello
 *               importFile:
 *                 type: string
 *                 format: binary
 *                 description: Import file
 *               requestId:
 *                 type: string
 *                 maxLength: 128
 *                 description: Request ID for tracking
 *                 example: req_123456
 *     responses:
 *       200:
 *         description: Board created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *                 - included
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Board'
 *                 included:
 *                   type: object
 *                   required:
 *                     - boardMemberships
 *                   properties:
 *                     boardMemberships:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BoardMembership'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         description: Import file upload error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - code
 *                 - message
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Error code
 *                   example: E_UNPROCESSABLE_ENTITY
 *                 message:
 *                   type: string
 *                   enum:
 *                     - No import file was uploaded
 *                     - Invalid import file
 *                   description: Specific error message
 *                   example: No import file was uploaded
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  NO_IMPORT_FILE_WAS_UPLOADED: {
    noImportFileWasUploaded: 'No import file was uploaded',
  },
  INVALID_IMPORT_FILE: {
    invalidImportFile: 'Invalid import file',
  },
};

module.exports = {
  inputs: {
    projectId: {
      ...idInput,
      required: true,
    },
    position: {
      type: 'number',
      min: 0,
      required: true,
    },
    name: {
      type: 'string',
      maxLength: 128,
      required: true,
    },
    importType: {
      type: 'string',
      isIn: Object.values(Board.ImportTypes),
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
    },
  },

  exits: {
    projectNotFound: {
      responseType: 'notFound',
    },
    noImportFileWasUploaded: {
      responseType: 'unprocessableEntity',
    },
    invalidImportFile: {
      responseType: 'unprocessableEntity',
    },
    uploadError: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const project = await Project.qm.getOneById(inputs.projectId);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.PROJECT_NOT_FOUND; // Forbidden
    }

    let boardImport;
    if (inputs.importType) {
      let files;
      try {
        files = await sails.helpers.utils.receiveFile(this.req.file('importFile'), false);
      } catch (error) {
        return exits.uploadError(error.message); // TODO: add error
      }

      if (files.length === 0) {
        throw Errors.NO_IMPORT_FILE_WAS_UPLOADED;
      }

      const file = _.last(files);

      if (inputs.importType === Board.ImportTypes.TRELLO) {
        const trelloBoard = await sails.helpers.boards
          .processUploadedTrelloImportFile(file)
          .intercept('invalidFile', () => Errors.INVALID_IMPORT_FILE);

        boardImport = {
          type: inputs.importType,
          board: trelloBoard,
        };
      }
    }

    const values = _.pick(inputs, ['position', 'name']);

    const { board, boardMembership } = await sails.helpers.boards.createOne.with({
      values: {
        ...values,
        project,
      },
      import: boardImport,
      actorUser: currentUser,
      requestId: inputs.requestId,
      request: this.req,
    });

    return exits.success({
      item: board,
      included: {
        boardMemberships: [boardMembership],
      },
    });
  },
};
