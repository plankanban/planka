/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  PROJECT_LABEL_NOT_FOUND: {
    projectLabelNotFound: 'Project label not found',
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
      allowNull: true,
    },
    color: {
      type: 'string',
      isIn: ProjectLabel.COLORS,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    projectLabelNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let projectLabel = await ProjectLabel.qm.getOneById(inputs.id);

    if (!projectLabel) {
      throw Errors.PROJECT_LABEL_NOT_FOUND;
    }

    const project = await Project.qm.getOneById(projectLabel.projectId);

    if (!project) {
      throw Errors.PROJECT_LABEL_NOT_FOUND;
    }

    if (project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.PROJECT_LABEL_NOT_FOUND; // Forbidden
      }
    }

    const values = _.pick(inputs, ['position', 'name', 'color']);

    projectLabel = await sails.helpers.projectLabels.updateOne.with({
      values,
      project,
      record: projectLabel,
      actorUser: currentUser,
      request: this.req,
    });

    if (!projectLabel) {
      throw Errors.PROJECT_LABEL_NOT_FOUND;
    }

    return {
      item: projectLabel,
    };
  },
};
