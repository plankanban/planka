/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  CUSTOM_FIELD_GROUP_NOT_FOUND: {
    customFieldGroupNotFound: 'Custom field group not found',
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
    customFieldGroupNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { customFieldGroup, board, project } = await sails.helpers.customFieldGroups
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.CUSTOM_FIELD_GROUP_NOT_FOUND);

    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
          board.id,
          currentUser.id,
        );

        if (!boardMembership) {
          throw Errors.CUSTOM_FIELD_GROUP_NOT_FOUND; // Forbidden
        }
      }
    }

    const customFields = await CustomField.qm.getByCustomFieldGroupId(customFieldGroup.id);

    const customFieldValues = customFieldGroup.cardId
      ? await CustomFieldValue.qm.getByCustomFieldGroupId(customFieldGroup.id)
      : [];

    return {
      item: customFieldGroup,
      included: {
        customFields,
        customFieldValues,
      },
    };
  },
};
