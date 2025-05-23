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
    let baseCustomFieldGroupIdOrIds;
    if (_.isPlainObject(inputs.recordOrRecords)) {
      ({
        recordOrRecords: { id: baseCustomFieldGroupIdOrIds },
      } = inputs);
    } else if (_.every(inputs.recordOrRecords, _.isPlainObject)) {
      baseCustomFieldGroupIdOrIds = sails.helpers.utils.mapRecords(inputs.recordOrRecords);
    }

    const customFieldGroups = await CustomFieldGroup.qm.delete({
      baseCustomFieldGroupId: baseCustomFieldGroupIdOrIds,
    });

    await sails.helpers.customFieldGroups.deleteRelated(customFieldGroups);

    await CustomField.qm.delete({
      baseCustomFieldGroupId: baseCustomFieldGroupIdOrIds,
    });
  },
};
