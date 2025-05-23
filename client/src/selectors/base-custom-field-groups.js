/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeSelectBaseCustomFieldGroupById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ BaseCustomFieldGroup }, id) => {
      const baseCustomFieldGroupModel = BaseCustomFieldGroup.withId(id);

      if (!baseCustomFieldGroupModel) {
        return baseCustomFieldGroupModel;
      }

      return {
        ...baseCustomFieldGroupModel.ref,
        isPersisted: !isLocalId(baseCustomFieldGroupModel.id),
      };
    },
  );

export const selectBaseCustomFieldGroupById = makeSelectBaseCustomFieldGroupById();

export const makeSelectCustomFieldsByBaseGroupId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ BaseCustomFieldGroup }, id) => {
      if (!id) {
        return id;
      }

      const baseCustomFieldGroupModel = BaseCustomFieldGroup.withId(id);

      if (!baseCustomFieldGroupModel) {
        return baseCustomFieldGroupModel;
      }

      return baseCustomFieldGroupModel.getCustomFieldsQuerySet().toRefArray();
    },
  );

export const selectCustomFieldsByBaseGroupId = makeSelectCustomFieldsByBaseGroupId();

export default {
  makeSelectBaseCustomFieldGroupById,
  selectBaseCustomFieldGroupById,
  makeSelectCustomFieldsByBaseGroupId,
  selectCustomFieldsByBaseGroupId,
};
