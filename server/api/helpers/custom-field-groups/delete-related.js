/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    recordOrRecords: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    let customFieldGroupIdOrIds;
    if (_.isPlainObject(inputs.recordOrRecords)) {
      ({
        recordOrRecords: { id: customFieldGroupIdOrIds },
      } = inputs);
    } else if (_.every(inputs.recordOrRecords, _.isPlainObject)) {
      customFieldGroupIdOrIds = sails.helpers.utils.mapRecords(inputs.recordOrRecords);
    }

    await CustomFieldValue.qm.delete({
      customFieldGroupId: customFieldGroupIdOrIds,
    });

    await CustomField.qm.delete({
      customFieldGroupId: customFieldGroupIdOrIds,
    });
  },
};
