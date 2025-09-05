/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { POSITION_GAP } = require('../../../constants');

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      required: true,
    },
    boardId: {
      type: 'ref',
      required: true,
    },
    withBaseCustomFieldGroups: {
      type: 'boolean',
      required: true,
    },
  },

  async fn(inputs) {
    const cardIds = _.isString(inputs.idOrIds) ? [inputs.idOrIds] : inputs.idOrIds;

    const boardCustomFieldGroups = await CustomFieldGroup.qm.getByBoardId(inputs.boardId);
    const boardCustomFieldGroupIds = sails.helpers.utils.mapRecords(boardCustomFieldGroups);

    const boardCustomFields =
      await CustomField.qm.getByCustomFieldGroupIds(boardCustomFieldGroupIds);

    const cardsCustomFieldGroups = await CustomFieldGroup.qm.getByCardIds(cardIds);
    const customFieldGroupsByCardId = _.groupBy(cardsCustomFieldGroups, 'cardId');

    let basedBoardCustomFieldGroups;
    let basedCardCustomFieldGroups;
    let baseCustomFieldGroupById;
    let customFieldsByBaseCustomFieldGroupId;

    if (inputs.withBaseCustomFieldGroups) {
      basedBoardCustomFieldGroups = boardCustomFieldGroups.filter(
        ({ baseCustomFieldGroupId }) => baseCustomFieldGroupId,
      );

      basedCardCustomFieldGroups = cardsCustomFieldGroups.filter(
        ({ baseCustomFieldGroupId }) => baseCustomFieldGroupId,
      );

      const basedCustomFieldGroups = [
        ...basedBoardCustomFieldGroups,
        ...basedCardCustomFieldGroups,
      ];

      const baseCustomFieldGroupIds = sails.helpers.utils.mapRecords(
        basedCustomFieldGroups,
        'baseCustomFieldGroupId',
        true,
      );

      const baseCustomFieldGroups = await BaseCustomFieldGroup.qm.getByIds(baseCustomFieldGroupIds);
      baseCustomFieldGroupById = _.keyBy(baseCustomFieldGroups, 'id');

      const baseCustomFields = await CustomField.qm.getByBaseCustomFieldGroupIds(
        Object.keys(baseCustomFieldGroupById),
      );

      customFieldsByBaseCustomFieldGroupId = _.groupBy(baseCustomFields, 'baseCustomFieldGroupId');
    }

    let idsTotal = (boardCustomFieldGroups.length + boardCustomFields.length) * cardIds.length;

    if (inputs.withBaseCustomFieldGroups) {
      idsTotal += basedBoardCustomFieldGroups.reduce((result, customFieldGroup) => {
        const customFieldsItem =
          customFieldsByBaseCustomFieldGroupId[customFieldGroup.baseCustomFieldGroupId];

        return result + (customFieldsItem ? customFieldsItem.length : 0) * cardIds.length;
      }, 0);

      idsTotal += basedCardCustomFieldGroups.reduce((result, customFieldGroup) => {
        const customFieldsItem =
          customFieldsByBaseCustomFieldGroupId[customFieldGroup.baseCustomFieldGroupId];

        return result + (customFieldsItem ? customFieldsItem.length : 0);
      }, 0);
    }

    const ids = await sails.helpers.utils.generateIds(idsTotal);

    const nextCustomFieldGroupIdByCustomFieldGroupIdByCardId = {};
    const nextCustomFieldGroupsValues = (
      await Promise.all(
        cardIds.map(async (cardId) => {
          const customFieldGroupIdByCustomFieldGroupId = {};
          const customFieldGroupsValues = boardCustomFieldGroups.map((customFieldGroup, index) => {
            const id = ids.shift();
            customFieldGroupIdByCustomFieldGroupId[customFieldGroup.id] = id;

            const values = {
              ..._.pick(customFieldGroup, ['baseCustomFieldGroupId', 'name']),
              id,
              cardId,
              position: POSITION_GAP * (index + 1),
            };

            if (inputs.withBaseCustomFieldGroups && customFieldGroup.baseCustomFieldGroupId) {
              values.baseCustomFieldGroupId = null;

              if (!customFieldGroup.name) {
                values.name =
                  baseCustomFieldGroupById[customFieldGroup.baseCustomFieldGroupId].name;
              }
            }

            return values;
          });

          nextCustomFieldGroupIdByCustomFieldGroupIdByCardId[cardId] =
            customFieldGroupIdByCustomFieldGroupId;

          if (customFieldGroupsValues.length > 0) {
            const cardCustomFieldGroups = customFieldGroupsByCardId[cardId];

            if (cardCustomFieldGroups && cardCustomFieldGroups.length > 0) {
              const { position } = customFieldGroupsValues[customFieldGroupsValues.length - 1];

              await Promise.all(
                cardCustomFieldGroups.map((customFieldGroup) =>
                  CustomFieldGroup.qm.updateOne(customFieldGroup.id, {
                    position: customFieldGroup.position + position,
                  }),
                ),
              );
            }
          }

          return customFieldGroupsValues;
        }),
      )
    ).flat();

    await CustomFieldGroup.qm.create(nextCustomFieldGroupsValues);

    if (inputs.withBaseCustomFieldGroups) {
      await CustomFieldGroup.qm.update(
        {
          cardId: cardIds,
          baseCustomFieldGroupId: {
            '!=': null,
          },
        },
        {
          baseCustomFieldGroupId: null,
        },
      );

      const unnamedCustomFieldGroups = basedCardCustomFieldGroups.filter(({ name }) => !name);

      await Promise.all(
        unnamedCustomFieldGroups.map((customFieldGroup) =>
          CustomFieldGroup.qm.updateOne(customFieldGroup.id, {
            name: baseCustomFieldGroupById[customFieldGroup.baseCustomFieldGroupId].name,
          }),
        ),
      );
    }

    const nextCustomFieldIdByCustomFieldIdByCardId = {};
    const nextCustomFieldsValues = cardIds.flatMap((cardId) => {
      const customFieldIdByCustomFieldId = {};
      const customFieldsValues = boardCustomFields.map((customField) => {
        const id = ids.shift();
        customFieldIdByCustomFieldId[customField.id] = id;

        return {
          ..._.pick(customField, ['name', 'showOnFrontOfCard', 'position']),
          id,
          customFieldGroupId:
            nextCustomFieldGroupIdByCustomFieldGroupIdByCardId[cardId][
              customField.customFieldGroupId
            ],
        };
      });

      nextCustomFieldIdByCustomFieldIdByCardId[cardId] = customFieldIdByCustomFieldId;
      return customFieldsValues;
    });

    if (inputs.withBaseCustomFieldGroups) {
      cardIds.forEach((cardId) => {
        basedBoardCustomFieldGroups.forEach((customFieldGroup) => {
          const customFieldsItem =
            customFieldsByBaseCustomFieldGroupId[customFieldGroup.baseCustomFieldGroupId];

          if (!customFieldsItem) {
            return;
          }

          customFieldsItem.forEach((customField) => {
            const id = ids.shift();

            nextCustomFieldIdByCustomFieldIdByCardId[cardId][
              `${customFieldGroup.id}:${customField.id}`
            ] = id;

            nextCustomFieldsValues.push({
              ..._.pick(customField, ['name', 'showOnFrontOfCard', 'position']),
              id,
              customFieldGroupId:
                nextCustomFieldGroupIdByCustomFieldGroupIdByCardId[cardId][customFieldGroup.id],
            });
          });
        });
      });

      basedCardCustomFieldGroups.forEach((customFieldGroup) => {
        const customFieldsItem =
          customFieldsByBaseCustomFieldGroupId[customFieldGroup.baseCustomFieldGroupId];

        if (!customFieldsItem) {
          return;
        }

        customFieldsItem.forEach((customField) => {
          const id = ids.shift();

          nextCustomFieldIdByCustomFieldIdByCardId[customFieldGroup.cardId][
            `${customFieldGroup.id}:${customField.id}`
          ] = id;

          nextCustomFieldsValues.push({
            ..._.pick(customField, ['name', 'showOnFrontOfCard', 'position']),
            id,
            customFieldGroupId: customFieldGroup.id,
          });
        });
      });
    }

    await CustomField.qm.create(nextCustomFieldsValues);

    const customFieldGroupIds = boardCustomFieldGroupIds;
    if (inputs.withBaseCustomFieldGroups) {
      customFieldGroupIds.push(...sails.helpers.utils.mapRecords(basedCardCustomFieldGroups));
    }

    const customFieldValues = await CustomFieldValue.qm.getByCardIds(cardIds, {
      customFieldGroupIdOrIds: customFieldGroupIds,
    });

    await Promise.all(
      customFieldValues.map((customFieldValue) => {
        const updateValues = {
          customFieldGroupId:
            nextCustomFieldGroupIdByCustomFieldGroupIdByCardId[customFieldValue.cardId][
              customFieldValue.customFieldGroupId
            ],
        };

        const nextCustomFieldIdByCustomFieldId =
          nextCustomFieldIdByCustomFieldIdByCardId[customFieldValue.cardId];

        if (nextCustomFieldIdByCustomFieldId) {
          const nextCustomFieldId =
            nextCustomFieldIdByCustomFieldId[
              `${customFieldValue.customFieldGroupId}:${customFieldValue.customFieldId}`
            ] || nextCustomFieldIdByCustomFieldId[customFieldValue.customFieldId];

          if (nextCustomFieldId) {
            updateValues.customFieldId = nextCustomFieldId;
          }
        }

        return CustomFieldValue.qm.updateOne(customFieldValue.id, updateValues);
      }),
    );
  },
};
