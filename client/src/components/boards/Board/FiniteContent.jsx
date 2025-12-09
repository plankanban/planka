/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { BoardViews } from '../../../constants/Enums';
import GridView from './GridView';
import ListView from './ListView';

const FiniteContent = React.memo(() => {
  const board = useSelector(selectors.selectCurrentBoard);
  const cardIds = useSelector(selectors.selectFilteredCardIdsForCurrentBoard);
  const canAddCard = useSelector((state) => !!selectors.selectFirstKanbanListId(state));

  const dispatch = useDispatch();

  const handleCardCreate = useCallback(
    (data, autoOpen) => {
      dispatch(entryActions.createCardInCurrentContext(data, undefined, autoOpen));
    },
    [dispatch],
  );

  const handleCardPaste = useCallback(() => {
    dispatch(entryActions.pasteCardInCurrentContext());
  }, [dispatch]);

  let View;
  switch (board.view) {
    case BoardViews.GRID:
      View = GridView;

      break;
    case BoardViews.LIST:
      View = ListView;

      break;
    default:
  }

  return (
    <View
      cardIds={cardIds}
      onCardCreate={canAddCard ? handleCardCreate : undefined}
      onCardPaste={canAddCard ? handleCardPaste : undefined}
    />
  );
});

export default FiniteContent;
