import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeSelectListById = () =>
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

export const selectListById = makeSelectListById();

export const makeSelectCardIdsByListId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ List }, id) => {
      const listModel = List.withId(id);

      if (!listModel) {
        return listModel;
      }

      const cardsModelArray = listModel.getFilteredOrderedCardsModelArray();
      return {
        cardIds: cardsModelArray.cardModels.map((cardModel) => cardModel.id),
        cardIdsFull: cardsModelArray.cardModelsFull.map((cardModel) => cardModel.id),
        isFiltered: cardsModelArray.isFiltered,
      };
    },
  );

export const selectCardIdsByListId = makeSelectCardIdsByListId();

export default {
  makeSelectListById,
  selectListById,
  makeSelectCardIdsByListId,
  selectCardIdsByListId,
};
