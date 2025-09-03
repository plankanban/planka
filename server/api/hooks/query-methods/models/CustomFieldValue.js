/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const defaultFind = (criteria, { customFieldGroupIdOrIds }) => {
  if (customFieldGroupIdOrIds) {
    criteria.customFieldGroupId = customFieldGroupIdOrIds; // eslint-disable-line no-param-reassign
  }

  return CustomFieldValue.find(criteria).sort('id');
};

/* Query methods */

const create = (arrayOfValues) => CustomFieldValue.createEach(arrayOfValues).fetch();

const createOrUpdateOne = async (values) => {
  const query = `
    INSERT INTO custom_field_value (card_id, custom_field_group_id, custom_field_id, content, created_at)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (card_id, custom_field_group_id, custom_field_id)
    DO UPDATE SET content = EXCLUDED.content, updated_at = EXCLUDED.created_at
    RETURNING *
  `;

  const queryResult = await sails.sendNativeQuery(query, [
    values.cardId,
    values.customFieldGroupId,
    values.customFieldId,
    values.content,
    new Date().toISOString(),
  ]);

  const [row] = queryResult.rows;

  return {
    id: row.id,
    cardId: row.card_id,
    customFieldGroupId: row.custom_field_group_id,
    customFieldId: row.custom_field_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const getByIds = (ids) => defaultFind(ids);

const getByCardId = (cardId, { customFieldGroupIdOrIds } = {}) =>
  defaultFind(
    {
      cardId,
    },
    { customFieldGroupIdOrIds },
  );

const getByCardIds = (cardIds, { customFieldGroupIdOrIds } = {}) =>
  defaultFind(
    {
      cardId: cardIds,
    },
    { customFieldGroupIdOrIds },
  );

const getByCustomFieldGroupId = (customFieldGroupId) =>
  defaultFind({
    customFieldGroupId,
  });

const getOneByCardIdAndCustomFieldGroupIdAndCustomFieldId = (
  cardId,
  customFieldGroupId,
  customFieldId,
) =>
  CustomFieldValue.findOne({
    cardId,
    customFieldGroupId,
    customFieldId,
  });

const updateOne = (criteria, values) => CustomFieldValue.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => CustomFieldValue.destroy(criteria).fetch();

const deleteOne = (criteria) => CustomFieldValue.destroyOne(criteria);

module.exports = {
  create,
  createOrUpdateOne,
  getByIds,
  getByCardId,
  getByCardIds,
  getByCustomFieldGroupId,
  getOneByCardIdAndCustomFieldGroupIdAndCustomFieldId,
  updateOne,
  deleteOne,
  delete: delete_,
};
