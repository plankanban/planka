/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { POSITION_GAP } = require('../../../constants');

module.exports = {
  inputs: {
    fromRecord: {
      type: 'ref',
      required: true,
    },
    toRecord: {
      type: 'ref',
      required: true,
    },
    detachBoardCustomFieldGroups: {
      type: 'boolean',
      defaultsTo: true,
    },
    detachBaseCustomFieldGroups: {
      type: 'boolean',
      defaultsTo: true,
    },
  },

  async fn(inputs) {
    const boardCustomFieldGroups = inputs.detachBoardCustomFieldGroups
      ? await CustomFieldGroup.qm.getByBoardId(inputs.fromRecord.boardId)
      : [];

    const cardCustomFieldGroups = await CustomFieldGroup.qm.getByCardId(inputs.fromRecord.id);

    const customFieldGroups = [...boardCustomFieldGroups, ...cardCustomFieldGroups];
    const customFieldGroupIds = sails.helpers.utils.mapRecords(customFieldGroups);

    const customFields = await CustomField.qm.getByCustomFieldGroupIds(customFieldGroupIds);

    let customFieldGroupsByBaseCustomFieldGroupId;
    let baseCustomFieldGroupById;
    let customFieldsByBaseCustomFieldGroupId;
    let nextCustomFieldsTotal = customFields.length;

    if (inputs.detachBaseCustomFieldGroups) {
      customFieldGroupsByBaseCustomFieldGroupId = _.groupBy(
        customFieldGroups.filter(({ baseCustomFieldGroupId }) => baseCustomFieldGroupId),
        'baseCustomFieldGroupId',
      );

      const baseCustomFieldGroupIds = Object.keys(customFieldGroupsByBaseCustomFieldGroupId);

      if (baseCustomFieldGroupIds.length > 0) {
        const baseCustomFieldGroups =
          await BaseCustomFieldGroup.qm.getByIds(baseCustomFieldGroupIds);

        baseCustomFieldGroupById = _.keyBy(baseCustomFieldGroups, 'id');

        const baseCustomFields = await CustomField.qm.getByBaseCustomFieldGroupIds(
          Object.keys(baseCustomFieldGroupById),
        );

        customFieldsByBaseCustomFieldGroupId = _.groupBy(
          baseCustomFields,
          'baseCustomFieldGroupId',
        );

        nextCustomFieldsTotal += Object.entries(customFieldGroupsByBaseCustomFieldGroupId).reduce(
          (result, [baseCustomFieldGroupId, customFieldGroupsItem]) => {
            const customFieldsItem = customFieldsByBaseCustomFieldGroupId[baseCustomFieldGroupId];

            if (!customFieldsItem) {
              return result;
            }

            return result + customFieldsItem.length * customFieldGroupsItem.length;
          },
          0,
        );
      }
    }

    const customFieldValues = await CustomFieldValue.qm.getByCardId(inputs.fromRecord.id);

    const ids = await sails.helpers.utils.generateIds(
      customFieldGroups.length + nextCustomFieldsTotal,
    );

    const nextCustomFieldGroupIdByCustomFieldGroupId = {};
    const nextCustomFieldGroupsValues = customFieldGroups.map((customFieldGroup, index) => {
      const id = ids.shift();
      nextCustomFieldGroupIdByCustomFieldGroupId[customFieldGroup.id] = id;

      const values = {
        ..._.pick(customFieldGroup, ['position']),
        id,
        cardId: inputs.toRecord.id,
        position: customFieldGroup.boardId
          ? POSITION_GAP * (index + 1)
          : customFieldGroup.position + POSITION_GAP * boardCustomFieldGroups.length,
      };

      if (inputs.detachBaseCustomFieldGroups) {
        values.name =
          customFieldGroup.name ||
          baseCustomFieldGroupById[customFieldGroup.baseCustomFieldGroupId].name;
      } else {
        Object.assign(values, {
          name: customFieldGroup.name,
          baseCustomFieldGroupId: customFieldGroup.baseCustomFieldGroupId,
        });
      }

      return values;
    });

    const nextCustomFieldGroups = await CustomFieldGroup.qm.create(nextCustomFieldGroupsValues);

    const nextCustomFieldIdByCustomFieldId = {};
    const nextCustomFieldsValues = customFields.map((customField) => {
      const id = ids.shift();
      nextCustomFieldIdByCustomFieldId[customField.id] = id;

      return {
        ..._.pick(customField, ['position', 'name', 'showOnFrontOfCard']),
        id,
        customFieldGroupId:
          nextCustomFieldGroupIdByCustomFieldGroupId[customField.customFieldGroupId],
      };
    });

    if (inputs.detachBaseCustomFieldGroups) {
      Object.entries(customFieldGroupsByBaseCustomFieldGroupId).forEach(
        ([baseCustomFieldGroupId, customFieldGroupsItem]) => {
          const customFieldsItem = customFieldsByBaseCustomFieldGroupId[baseCustomFieldGroupId];

          if (!customFieldsItem) {
            return;
          }

          customFieldGroupsItem.forEach((customFieldGroup) => {
            customFieldsItem.forEach((customField) => {
              const groupedId = `${customFieldGroup.id}:${customField.id}`;
              const id = ids.shift();

              nextCustomFieldIdByCustomFieldId[groupedId] = id;

              nextCustomFieldsValues.push({
                ..._.pick(customField, ['position', 'name', 'showOnFrontOfCard']),
                id,
                customFieldGroupId: nextCustomFieldGroupIdByCustomFieldGroupId[customFieldGroup.id],
              });
            });
          });
        },
      );
    }

    const nextCustomFields = await CustomField.qm.create(nextCustomFieldsValues);

    const nextCustomFieldValuesValues = customFieldValues.map((customFieldValue) => {
      const groupedId = `${customFieldValue.customFieldGroupId}:${customFieldValue.customFieldId}`;

      return {
        ..._.pick(customFieldValue, ['content']),
        cardId: inputs.toRecord.id,
        customFieldGroupId:
          nextCustomFieldGroupIdByCustomFieldGroupId[customFieldValue.customFieldGroupId] ||
          customFieldValue.customFieldGroupId,
        customFieldId:
          nextCustomFieldIdByCustomFieldId[groupedId] ||
          nextCustomFieldIdByCustomFieldId[customFieldValue.customFieldId] ||
          customFieldValue.customFieldId,
      };
    });

    const nextCustomFieldValues = await CustomFieldValue.qm.create(nextCustomFieldValuesValues);

    return {
      customFieldGroups: nextCustomFieldGroups,
      customFields: nextCustomFields,
      customFieldValues: nextCustomFieldValues,
    };
  },
};
