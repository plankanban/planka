/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    storageLimit: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 256,
      allowNull: true,
    },
    activeUsersLimit: {
      type: 'number',
      min: 0,
      allowNull: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    // eslint-disable-next-line no-restricted-syntax
    for (const fieldName of Object.keys(inputs)) {
      if (!_.isNil(sails.config.custom[fieldName])) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const values = _.pick(inputs, ['storageLimit', 'activeUsersLimit']);

    const internalConfig = await sails.helpers.internalConfig.updateMain.with({
      values,
    });

    return {
      item: internalConfig,
    };
  },
};
