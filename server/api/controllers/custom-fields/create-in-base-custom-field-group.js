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
    baseCustomFieldGroupId: {
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
    showOnFrontOfCard: {
      type: 'boolean',
    },
  },

  exits: {
    baseCustomFieldGroupNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { baseCustomFieldGroup, project } = await sails.helpers.baseCustomFieldGroups
      .getPathToProjectById(inputs.baseCustomFieldGroupId)
      .intercept('pathNotFound', () => Errors.BASE_CUSTOM_FIELD_GROUP_NOT_FOUND);

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      throw Errors.BASE_CUSTOM_FIELD_GROUP_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['position', 'name', 'showOnFrontOfCard']);

    const customField = await sails.helpers.customFields.createOneInBaseCustomFieldGroup.with({
      project,
      values: {
        ...values,
        baseCustomFieldGroup,
      },
      actorUser: currentUser,
      request: this.req,
    });

    return {
      item: customField,
    };
  },
};
