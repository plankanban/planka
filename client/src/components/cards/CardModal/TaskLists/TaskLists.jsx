/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { closePopup } from '../../../../lib/popup';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import parseDndId from '../../../../utils/parse-dnd-id';
import DroppableTypes from '../../../../constants/DroppableTypes';
import Item from './Item';

import globalStyles from '../../../../styles.module.scss';

const TaskLists = React.memo(() => {
  const taskListIds = useSelector(selectors.selectTaskListIdsForCurrentCard);

  const dispatch = useDispatch();
  const [completedVisibilities, setCompletedVisibilities] = useState({});

  const handleCompletedVisibleToggle = useCallback((taskListId) => {
    setCompletedVisibilities((prevCompletedVisibilities) => ({
      ...prevCompletedVisibilities,
      [taskListId]: !prevCompletedVisibilities[taskListId],
    }));
  }, []);

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
        case DroppableTypes.TASK: {
          const taskListId = parseDndId(destination.droppableId);
          const isCompletedVisible = !!completedVisibilities[taskListId];

          dispatch(entryActions.moveTask(id, taskListId, destination.index, isCompletedVisible));

          break;
        }
        default:
      }
    },
    [completedVisibilities, dispatch],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Droppable droppableId="card" type={DroppableTypes.TASK_LIST} direction="vertical">
        {({ innerRef, droppableProps, placeholder }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...droppableProps} ref={innerRef}>
            {taskListIds.map((taskListId, index) => (
              <Item
                key={taskListId}
                id={taskListId}
                index={index}
                isCompletedVisible={!!completedVisibilities[taskListId]}
                onCompletedVisibleToggle={handleCompletedVisibleToggle}
              />
            ))}
            {placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
});

export default TaskLists;
