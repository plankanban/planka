/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    customField: {
      type: 'ref',
      required: true,
    },
    validContentValues: {
      type: 'json', // array of allowed content values, or undefined/null to delete all values
    },
  },

  async fn(inputs) {
    const criteria = {
      customFieldId: inputs.customField.id,
    };

    if (inputs.validContentValues) {
      criteria.content = {
        nin: inputs.validContentValues,
      };
    }

    return CustomFieldValue.qm.delete(criteria);
  },
};
