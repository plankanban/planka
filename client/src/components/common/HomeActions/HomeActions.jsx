/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import classNames from 'classnames';

import Filters from './Filters';
import RightSide from './RightSide';

import styles from './HomeActions.module.scss';

const HomeActions = React.memo(() => (
  <div className={styles.wrapper}>
    <div className={styles.content}>
      <div className={styles.actions}>
        <div className={classNames(styles.action, styles.actionFilters)}>
          <Filters />
        </div>
        <div className={classNames(styles.action, styles.actionRightSide)}>
          <RightSide />
        </div>
      </div>
    </div>
  </div>
));

export default HomeActions;
