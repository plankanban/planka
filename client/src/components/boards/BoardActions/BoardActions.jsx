/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import { BoardContexts } from '../../../constants/Enums';
import { BoardContextIcons } from '../../../constants/Icons';
import Filters from './Filters';
import RightSide from './RightSide';
import BoardMemberships from '../../board-memberships/BoardMemberships';

import styles from './BoardActions.module.scss';

const BoardActions = React.memo(() => {
  const boardContext = useSelector((state) => selectors.selectCurrentBoard(state).context);

  const withContextTitle = boardContext !== BoardContexts.BOARD;

  const withMemberships = useSelector((state) => {
    if (withContextTitle) {
      return false;
    }

    const boardMemberships = selectors.selectMembershipsForCurrentBoard(state);

    if (boardMemberships.length > 0) {
      return true;
    }

    return selectors.selectIsCurrentUserManagerForCurrentProject(state);
  });

  const [t] = useTranslation();

  return (
    <div className={styles.wrapper}>
      <div className={styles.actions}>
        {withContextTitle && (
          <div className={styles.action}>
            <div className={styles.contextTitle}>
              <Icon name={BoardContextIcons[boardContext]} className={styles.contextTitleIcon} />
              {t(`common.${boardContext}`)}
            </div>
          </div>
        )}
        {withMemberships && (
          <div className={styles.action}>
            <BoardMemberships />
          </div>
        )}
        <div className={styles.action}>
          <Filters />
        </div>
        <div className={classNames(styles.action, styles.actionRightSide)}>
          <RightSide />
        </div>
      </div>
    </div>
  );
});

export default BoardActions;
