/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeSelectCustomFieldGroupById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ CustomFieldGroup }, id) => {
      const customFieldGroupModel = CustomFieldGroup.withId(id);

      if (!customFieldGroupModel) {
        return customFieldGroupModel;
      }

      return {
        ...customFieldGroupModel.ref,
        name: customFieldGroupModel.name || customFieldGroupModel.baseCustomFieldGroup.name,
        isPersisted: !isLocalId(customFieldGroupModel.id),
      };
    },
  );

export const selectCustomFieldGroupById = makeSelectCustomFieldGroupById();

export const makeSelectCustomFieldIdsByGroupId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ CustomFieldGroup }, id) => {
      if (!id) {
        return id;
      }

      const customFieldGroupModel = CustomFieldGroup.withId(id);

      if (!customFieldGroupModel) {
        return customFieldGroupModel;
      }

      return customFieldGroupModel
        .getCustomFieldsModelArray()
        .map((customFieldModel) => customFieldModel.id);
    },
  );

export const selectCustomFieldIdsByGroupId = makeSelectCustomFieldIdsByGroupId();

export const makeSelectCustomFieldsByGroupId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ CustomFieldGroup }, id) => {
      if (!id) {
        return id;
      }

      const customFieldGroupModel = CustomFieldGroup.withId(id);

      if (!customFieldGroupModel) {
        return customFieldGroupModel;
      }

      return customFieldGroupModel
        .getCustomFieldsModelArray()
        .map((customFieldModel) => customFieldModel.ref);
    },
  );

export const selectCustomFieldsByGroupId = makeSelectCustomFieldsByGroupId();

export default {
  makeSelectCustomFieldGroupById,
  selectCustomFieldGroupById,
  makeSelectCustomFieldIdsByGroupId,
  selectCustomFieldIdsByGroupId,
  makeSelectCustomFieldsByGroupId,
  selectCustomFieldsByGroupId,
};
