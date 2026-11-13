/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Deletes everything that hangs off a base custom field group.
 *
 * Children before parents -- see the ordering contract in
 * `helpers/cards/delete-related.js`. Same defect as the other five: the
 * `custom_field_group` rows were destroyed before their own children
 * (`custom_field_value`, `custom_field`) were.
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

    const customFieldGroups = await CustomFieldGroup.qm.getByBaseCustomFieldGroupIds(
      baseCustomFieldGroupIdOrIds,
    );

    await sails.helpers.customFieldGroups.deleteRelated(customFieldGroups);

    await CustomFieldGroup.qm.delete({
      baseCustomFieldGroupId: baseCustomFieldGroupIdOrIds,
    });

    await CustomField.qm.delete({
      baseCustomFieldGroupId: baseCustomFieldGroupIdOrIds,
    });
  },
};
