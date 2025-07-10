/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Progress } from 'semantic-ui-react';
import { useToggle } from '../../../../lib/hooks';

import selectors from '../../../../selectors';
import Task from './Task';

import styles from './TaskList.module.scss';

const TaskList = React.memo(({ id }) => {
  const selectTasksByTaskListId = useMemo(() => selectors.makeSelectTasksByTaskListId(), []);

  const tasks = useSelector((state) => selectTasksByTaskListId(state, id));

  // TODO: move to selector?
  const completedTasksTotal = useMemo(
    () => tasks.reduce((result, task) => (task.isCompleted ? result + 1 : result), 0),
    [tasks],
  );

  const [isOpened, toggleOpened] = useToggle();

  const handleToggleClick = useCallback(
    (event) => {
      event.stopPropagation();
      toggleOpened();
    },
    [toggleOpened],
  );

  if (tasks.length === 0) {
    return null;
  }

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                   jsx-a11y/no-static-element-interactions */}
      <div className={styles.button} onClick={handleToggleClick}>
        <span className={styles.progressWrapper}>
          <Progress
            autoSuccess
            value={completedTasksTotal}
            total={tasks.length}
            color="blue"
            size="tiny"
            className={styles.progress}
          />
        </span>
        <span
          className={classNames(styles.count, isOpened ? styles.countOpened : styles.countClosed)}
        >
          {completedTasksTotal}/{tasks.length}
        </span>
      </div>
      {isOpened && (
        <ul className={styles.tasks}>
          {tasks.map((task) => (
            <Task key={task.id} id={task.id} />
          ))}
        </ul>
      )}
    </>
  );
});

TaskList.propTypes = {
  id: PropTypes.string.isRequired,
};

export default TaskList;
