/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
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
