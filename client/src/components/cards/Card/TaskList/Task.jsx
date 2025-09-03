/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import Paths from '../../../../constants/Paths';
import Linkify from '../../../common/Linkify';

import styles from './Task.module.scss';

const Task = React.memo(({ id }) => {
  const selectTaskById = useMemo(() => selectors.makeSelectTaskById(), []);
  const selectLinkedCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const task = useSelector((state) => selectTaskById(state, id));

  const linkedCard = useSelector(
    (state) => task.linkedCardId && selectLinkedCardById(state, task.linkedCardId),
  );

  const handleLinkClick = useCallback((event) => {
    event.stopPropagation();
  }, []);

  return (
    <li className={styles.wrapper}>
      {task.linkedCardId ? (
        <>
          <Icon name="exchange" size="small" className={styles.icon} />
          <span className={classNames(styles.name, task.isCompleted && styles.nameCompleted)}>
            <Link to={Paths.CARDS.replace(':id', task.linkedCardId)} onClick={handleLinkClick}>
              {linkedCard ? linkedCard.name : task.name}
            </Link>
          </span>
        </>
      ) : (
        <span className={classNames(styles.name, task.isCompleted && styles.nameCompleted)}>
          <Linkify linkStopPropagation>{task.name}</Linkify>
        </span>
      )}
    </li>
  );
});

Task.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Task;
