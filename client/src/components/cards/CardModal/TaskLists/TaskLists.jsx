/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Checkbox } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';
import { closePopup } from '../../../../lib/popup';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import parseDndId from '../../../../utils/parse-dnd-id';
import DroppableTypes from '../../../../constants/DroppableTypes';
import Item from './Item';

import globalStyles from '../../../../styles.module.scss';

const HIDE_CHECKED_KEY = 'planka_hide_checked_tasks';

const TaskLists = React.memo(() => {
  const [t] = useTranslation();
  const taskListIds = useSelector(selectors.selectTaskListIdsForCurrentCard);
  const [hideChecked, setHideChecked] = useState(() => {
    const stored = localStorage.getItem(HIDE_CHECKED_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(HIDE_CHECKED_KEY, hideChecked);
  }, [hideChecked]);

  const dispatch = useDispatch();

  const handleDragStart = useCallback(() => {
    document.body.classList.add(globalStyles.dragging);
    closePopup();
  }, []);

  const handleDragEnd = useCallback(
    ({ draggableId, type, source, destination }) => {
      document.body.classList.remove(globalStyles.dragging);

      if (!destination) {
        return;
      }

      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
      }

      const id = parseDndId(draggableId);

      switch (type) {
        case DroppableTypes.TASK_LIST:
          dispatch(entryActions.moveTaskList(id, destination.index));

          break;
        case DroppableTypes.TASK:
          dispatch(
            entryActions.moveTask(id, parseDndId(destination.droppableId), destination.index),
          );

          break;
        default:
      }
    },
    [dispatch],
  );

  return (
    <>
      {taskListIds.length > 0 && (
        <div style={{ margin: '8px 0' }}>
          <Checkbox
            label={t('common.taskList_hideChecked')}
            checked={hideChecked}
            onChange={() => setHideChecked((prev) => !prev)}
            toggle
          />
        </div>
      )}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="card" type={DroppableTypes.TASK_LIST} direction="vertical">
          {({ innerRef, droppableProps, placeholder }) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <div {...droppableProps} ref={innerRef}>
              {taskListIds.map((taskListId, index) => (
                <Item key={taskListId} id={taskListId} index={index} hideChecked={hideChecked} />
              ))}
              {placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
});

export default TaskLists;
