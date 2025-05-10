/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BASE_CUSTOM_FIELD_GROUP_NOT_FOUND: {
    baseCustomFieldGroupNotFound: 'Base custom field group not found',
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
    baseCustomFieldGroupNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.baseCustomFieldGroups
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.BASE_CUSTOM_FIELD_GROUP_NOT_FOUND);

    let { baseCustomFieldGroup } = pathToProject;
    const { project } = pathToProject;

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.BASE_CUSTOM_FIELD_GROUP_NOT_FOUND; // Forbidden
    }

    baseCustomFieldGroup = await sails.helpers.baseCustomFieldGroups.deleteOne.with({
      project,
      record: baseCustomFieldGroup,
      actorUser: currentUser,
      request: this.req,
    });

    if (!baseCustomFieldGroup) {
      throw Errors.BASE_CUSTOM_FIELD_GROUP_NOT_FOUND;
    }

    return {
      item: baseCustomFieldGroup,
    };
  },
};
