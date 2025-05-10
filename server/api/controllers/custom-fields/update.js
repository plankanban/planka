/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CUSTOM_FIELD_NOT_FOUND: {
    customFieldNotFound: 'Custom field not found',
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
    },
    showOnFrontOfCard: {
      type: 'boolean',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    customFieldNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.customFields
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.CUSTOM_FIELD_NOT_FOUND);

    let { customField } = pathToProject;
    const { customFieldGroup, card, list, board, baseCustomFieldGroup, project } = pathToProject;

    const values = _.pick(inputs, ['position', 'name', 'showOnFrontOfCard']);

    if (customField.baseCustomFieldGroupId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.CUSTOM_FIELD_NOT_FOUND; // Forbidden
      }

      customField = await sails.helpers.customFields.updateOneInBaseCustomFieldGroup.with({
        values,
        project,
        baseCustomFieldGroup,
        record: customField,
        actorUser: currentUser,
        request: this.req,
      });
    } else if (customField.customFieldGroupId) {
      const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
        board.id,
        currentUser.id,
      );

      if (!boardMembership) {
        throw Errors.CUSTOM_FIELD_NOT_FOUND; // Forbidden
      }

      if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }

      customField = await sails.helpers.customFields.updateOneInCustomFieldGroup.with({
        values,
        project,
        board,
        list,
        card,
        customFieldGroup,
        record: customField,
        actorUser: currentUser,
        request: this.req,
      });
    }

    if (!customField) {
      throw Errors.CUSTOM_FIELD_NOT_FOUND;
    }

    return {
      item: customField,
    };
  },
};
