/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeSelectCardRelationsByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel) {
        return cardModel;
      }
      // debugger;

      return {
        ...cardModel.ref.cardRelations,
        isPersisted: !isLocalId(cardModel.id),
      };
    },
  );

export const selectCardRelationsByCardId = makeSelectCardRelationsByCardId();

export default {
  makeSelectCardRelationsByCardId,
  selectCardRelationsByCardId,
};
