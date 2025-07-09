/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import selectors from '../../../../selectors';
import Linkify from '../../../common/Linkify';

import styles from './Task.module.scss';

const Task = React.memo(({ id }) => {
  const selectTaskById = useMemo(() => selectors.makeSelectTaskById(), []);
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const task = useSelector((state) => selectTaskById(state, id));

  const isCompleted = useSelector((state) => {
    if (task.isCompleted) {
      return true;
    }

    const regex = /\/cards\/([^/]+)/g;
    const matches = task.name.matchAll(regex);

    // eslint-disable-next-line no-restricted-syntax
    for (const [, cardId] of matches) {
      const card = selectCardById(state, cardId);

      if (card && card.isClosed) {
        return true;
      }
    }

    return false;
  });

  return (
    <li className={classNames(styles.wrapper, isCompleted && styles.wrapperCompleted)}>
      <Linkify linkStopPropagation>{task.name}</Linkify>
    </li>
  );
});

Task.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Task;
