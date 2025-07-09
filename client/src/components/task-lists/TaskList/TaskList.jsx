/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Droppable } from 'react-beautiful-dnd';
import { Progress } from 'semantic-ui-react';
import { useDidUpdate } from '../../../lib/hooks';

import selectors from '../../../selectors';
import { isListArchiveOrTrash } from '../../../utils/record-helpers';
import DroppableTypes from '../../../constants/DroppableTypes';
import { BoardMembershipRoles } from '../../../constants/Enums';
import { ClosableContext } from '../../../contexts';
import Task from './Task';
import AddTask from './AddTask';

import styles from './TaskList.module.scss';

const TaskList = React.memo(({ id }) => {
  const selectTaskListById = useMemo(() => selectors.makeSelectTaskListById(), []);
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);
  const selectTasksByTaskListId = useMemo(() => selectors.makeSelectTasksByTaskListId(), []);

  const taskList = useSelector((state) => selectTaskListById(state, id));
  const tasks = useSelector((state) => selectTasksByTaskListId(state, id));

  // TODO: move to selector?
  const completedTasksTotal = useSelector((state) =>
    tasks.reduce((result, task) => {
      if (task.isCompleted) {
        return result + 1;
      }

      const regex = /\/cards\/([^/]+)/g;
      const matches = task.name.matchAll(regex);

      // eslint-disable-next-line no-restricted-syntax
      for (const [, cardId] of matches) {
        const card = selectCardById(state, cardId);

        if (card && card.isClosed) {
          return result + 1;
        }
      }

      return result;
    }, 0),
  );

  const canEdit = useSelector((state) => {
    const { listId } = selectors.selectCurrentCard(state);
    const list = selectListById(state, listId);

    if (isListArchiveOrTrash(list)) {
      return false;
    }

    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const [t] = useTranslation();
  const [isAddOpened, setIsAddOpened] = useState(false);
  const [, , setIsClosableActive] = useContext(ClosableContext);

  const handleAddClick = useCallback(() => {
    setIsAddOpened(true);
  }, []);

  const handleAddClose = useCallback(() => {
    setIsAddOpened(false);
  }, []);

  useDidUpdate(() => {
    setIsClosableActive(isAddOpened);
  }, [isAddOpened]);

  return (
    <>
      {tasks.length > 0 && (
        <>
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
          <span className={styles.count}>
            {completedTasksTotal}/{tasks.length}
          </span>
        </>
      )}
      <Droppable
        droppableId={`task-list:${id}`}
        type={DroppableTypes.TASK}
        isDropDisabled={!taskList.isPersisted || !canEdit}
      >
        {({ innerRef, droppableProps, placeholder }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...droppableProps} ref={innerRef} className={styles.tasks}>
            {tasks.map((task, index) => (
              <Task key={task.id} id={task.id} index={index} />
            ))}
            {placeholder}
          </div>
        )}
      </Droppable>
      {canEdit && (
        <AddTask taskListId={id} isOpened={isAddOpened} onClose={handleAddClose}>
          <button
            type="button"
            disabled={!taskList.isPersisted}
            className={styles.taskButton}
            onClick={handleAddClick}
          >
            <span className={styles.taskButtonText}>
              {tasks.length > 0 ? t('action.addAnotherTask') : t('action.addTask')}
            </span>
          </button>
        </AddTask>
      )}
    </>
  );
});

TaskList.propTypes = {
  id: PropTypes.string.isRequired,
};

export default TaskList;
