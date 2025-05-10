/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon, Menu } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { BoardViews } from '../../../../constants/Enums';
import { BoardViewIcons } from '../../../../constants/Icons';

import styles from './DefaultView.module.scss';

const DESCRIPTION_BY_VIEW = {
  [BoardViews.KANBAN]: 'common.visualTaskManagementWithLists',
  [BoardViews.GRID]: 'common.dynamicAndUnevenlySpacedLayout',
  [BoardViews.LIST]: 'common.sequentialDisplayOfCards',
};

const DefaultView = React.memo(() => {
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);

  const boardId = useSelector((state) => selectors.selectCurrentModal(state).params.id);
  const board = useSelector((state) => selectBoardById(state, boardId));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleSelectClick = useCallback(
    (_, { value: defaultView }) => {
      dispatch(
        entryActions.updateBoard(boardId, {
          defaultView,
        }),
      );
    },
    [boardId, dispatch],
  );

  return (
    <Menu secondary vertical className={styles.menu}>
      {[BoardViews.KANBAN, BoardViews.GRID, BoardViews.LIST].map((view) => (
        <Menu.Item
          key={view}
          value={view}
          active={view === board.defaultView}
          className={styles.menuItem}
          onClick={handleSelectClick}
        >
          <Icon name={BoardViewIcons[view]} className={styles.menuItemIcon} />
          <div className={styles.menuItemTitle}>{t(`common.${view}`)}</div>
          <p className={styles.menuItemDescription}>{t(DESCRIPTION_BY_VIEW[view])}</p>
        </Menu.Item>
      ))}
    </Menu>
  );
});

export default DefaultView;
