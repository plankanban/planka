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
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
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

    const values = _.pick(inputs, ['name']);

    baseCustomFieldGroup = await sails.helpers.baseCustomFieldGroups.updateOne.with({
      values,
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
