/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /background-images/{id}:
 *   delete:
 *     summary: Delete background image
 *     description: Deletes a background image. Requires project manager permissions.
 *     tags:
 *       - Background Images
 *     operationId: deleteBackgroundImage
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the background image to delete
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Background image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/BackgroundImage'
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
  BACKGROUND_IMAGE_NOT_FOUND: {
    backgroundImageNotFound: 'Background image not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    backgroundImageNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.backgroundImages
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.BACKGROUND_IMAGE_NOT_FOUND);

    let { backgroundImage } = pathToProject;
    const { project } = pathToProject;

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.BACKGROUND_IMAGE_NOT_FOUND; // Forbidden
    }

    backgroundImage = await sails.helpers.backgroundImages.deleteOne.with({
      project,
      record: backgroundImage,
      actorUser: currentUser,
      request: this.req,
    });

    if (!backgroundImage) {
      throw Errors.BACKGROUND_IMAGE_NOT_FOUND;
    }

    return {
      item: sails.helpers.backgroundImages.presentOne(backgroundImage),
    };
  },
};
