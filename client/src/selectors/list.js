import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeListByIdSelector = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return {
        ...listModel.ref,
        isPersisted: !isLocalId(id),
      };
    },
  );

export const listByIdSelector = makeListByIdSelector();

export const makeCardIdsByListIdSelector = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      return listModel.getOrderedFilteredCardsModelArray().map((cardModel) => cardModel.id);
    },
  );

export const cardIdsByListIdSelector = makeCardIdsByListIdSelector();
