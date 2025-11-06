/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useRef } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { Icon, Loader } from 'semantic-ui-react';
import { useTransitioning } from '../../../lib/hooks';

import selectors from '../../../selectors';
import { BoardViews } from '../../../constants/Enums';
import Home from '../Home';
import GhostError from '../GhostError';
import Board from '../../boards/Board';

import styles from './Static.module.scss';

const Static = React.memo(() => {
  const { cardId, projectId } = useSelector(selectors.selectPath);
  const board = useSelector(selectors.selectCurrentBoard);
  const isFetching = useSelector(selectors.selectIsContentFetching);
  const isFavoritesActive = useSelector(selectors.selectIsFavoritesActiveForCurrentUser);

  const [t] = useTranslation();

  const wrapperRef = useRef(null);

  const handleTransitionEnd = useTransitioning(wrapperRef, styles.wrapperTransitioning, [
    isFavoritesActive,
  ]);

  let wrapperClassNames;
  let contentNode;

  if (isFetching) {
    wrapperClassNames = [styles.wrapperLoader];
    contentNode = <Loader active size="huge" />;
  } else if (projectId === undefined) {
    wrapperClassNames = [isFavoritesActive && styles.wrapperWithFavorites, styles.wrapperVertical];
    contentNode = <Home />;
  } else if (cardId === null) {
    wrapperClassNames = [isFavoritesActive && styles.wrapperWithFavorites, styles.wrapperFlex];
    contentNode = <GhostError message="common.cardNotFound" />;
  } else if (board === null) {
    wrapperClassNames = [isFavoritesActive && styles.wrapperWithFavorites, styles.wrapperFlex];
    contentNode = <GhostError message="common.boardNotFound" />;
  } else if (projectId === null) {
    wrapperClassNames = [isFavoritesActive && styles.wrapperWithFavorites, styles.wrapperFlex];
    contentNode = <GhostError message="common.projectNotFound" />;
  } else if (board === undefined) {
    wrapperClassNames = [
      isFavoritesActive ? styles.wrapperProjectWithFavorites : styles.wrapperProject,
      styles.wrapperFlex,
    ];

    contentNode = (
      <div className={styles.message}>
        <Icon inverted name="hand point up outline" size="huge" className={styles.messageIcon} />
        <h1 className={styles.messageTitle}>
          {t('common.openBoard', {
            context: 'title',
          })}
        </h1>
        <div className={styles.messageContent}>
          <Trans i18nKey="common.createNewOneOrSelectExistingOne" />
        </div>
      </div>
    );
  } else if (board.isFetching) {
    wrapperClassNames = [
      styles.wrapperLoader,
      isFavoritesActive ? styles.wrapperProjectWithFavorites : styles.wrapperProject,
    ];

    contentNode = <Loader active size="big" />;
  } else {
    wrapperClassNames = [
      isFavoritesActive ? styles.wrapperBoardWithFavorites : styles.wrapperBoard,
      [BoardViews.GRID, BoardViews.LIST].includes(board.view) && styles.wrapperVertical,
      styles.wrapperFlex,
    ];

    contentNode = <Board />;
  }

  return (
    <div
      ref={wrapperRef}
      className={classNames(styles.wrapper, ...wrapperClassNames)}
      onTransitionEnd={handleTransitionEnd}
    >
      {contentNode}
    </div>
  );
});

export default Static;
