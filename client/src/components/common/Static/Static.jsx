/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { Button, Icon, Loader } from 'semantic-ui-react';
import { usePopup } from '../../../lib/popup';

import selectors from '../../../selectors';
import { BoardViews } from '../../../constants/Enums';
import Home from '../Home';
import GhostError from '../GhostError';
import Board from '../../boards/Board';
import AddBoardStep from '../../boards/AddBoardStep';

import styles from './Static.module.scss';

const Static = React.memo(() => {
  const { cardId, projectId } = useSelector(selectors.selectPath);
  const board = useSelector(selectors.selectCurrentBoard);
  const isFetching = useSelector(selectors.selectIsContentFetching);

  const canAddBoard = useSelector((state) =>
    selectors.selectIsCurrentUserManagerForCurrentProject(state),
  );

  const [t] = useTranslation();

  const AddBoardPopup = usePopup(AddBoardStep);

  let wrapperClassNames;
  let contentNode;

  if (isFetching) {
    wrapperClassNames = [styles.wrapperLoader];
    contentNode = <Loader active size="huge" />;
  } else if (projectId === undefined) {
    wrapperClassNames = [styles.wrapperVertical];
    contentNode = <Home />;
  } else if (cardId === null) {
    wrapperClassNames = [styles.wrapperFlex];
    contentNode = <GhostError message="common.cardNotFound" />;
  } else if (board === null) {
    wrapperClassNames = [styles.wrapperFlex];
    contentNode = <GhostError message="common.boardNotFound" />;
  } else if (projectId === null) {
    wrapperClassNames = [styles.wrapperFlex];
    contentNode = <GhostError message="common.projectNotFound" />;
  } else if (board === undefined) {
    wrapperClassNames = [styles.wrapperFlex];

    contentNode = (
      <div className={styles.message}>
        <Icon name="hand point up outline" size="huge" className={styles.messageIcon} />
        <h1 className={styles.messageTitle}>
          {t('common.openBoard', {
            context: 'title',
          })}
        </h1>
        <div className={styles.messageContent}>
          <Trans i18nKey="common.createNewOneOrSelectExistingOne" />
        </div>
        {canAddBoard && (
          <AddBoardPopup>
            <Button basic positive size="large" className={styles.button}>
              <Icon name="plus" />
              {t('action.createBoard')}
            </Button>
          </AddBoardPopup>
        )}
      </div>
    );
  } else if (board.isFetching) {
    wrapperClassNames = [styles.wrapperLoader];

    contentNode = <Loader active size="big" />;
  } else {
    wrapperClassNames = [
      [BoardViews.GRID, BoardViews.LIST].includes(board.view) && styles.wrapperVertical,
      styles.wrapperFlex,
    ];

    contentNode = <Board />;
  }

  return <div className={classNames(styles.wrapper, ...wrapperClassNames)}>{contentNode}</div>;
});

export default Static;
