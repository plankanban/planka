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

const EndlessContent = React.memo(() => {
  const board = useSelector(selectors.selectCurrentBoard);
  const { isCardsFetching, isAllCardsFetched } = useSelector(selectors.selectCurrentList);
  const cardIds = useSelector(selectors.selectFilteredCardIdsForCurrentList);

  const dispatch = useDispatch();

  const handleCardsFetch = useCallback(() => {
    dispatch(entryActions.fetchCardsInCurrentList());
  }, [dispatch]);

  const handleCardCreate = useCallback(
    (data, autoOpen) => {
      dispatch(entryActions.createCardInCurrentList(data, autoOpen));
    },
    [dispatch],
  );

  const viewProps = {
    cardIds,
    isCardsFetching,
    isAllCardsFetched,
    onCardsFetch: handleCardsFetch,
    onCardCreate: handleCardCreate,
  };

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

  return <View {...viewProps} />; // eslint-disable-line react/jsx-props-no-spreading
});

export default EndlessContent;
