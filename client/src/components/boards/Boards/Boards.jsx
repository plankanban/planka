/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Button } from 'semantic-ui-react';
import { closePopup, usePopup } from '../../../lib/popup';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import DroppableTypes from '../../../constants/DroppableTypes';
import Item from './Item';
import AddStep from './AddStep';

import styles from './Boards.module.scss';
import globalStyles from '../../../styles.module.scss';

const Boards = React.memo(() => {
  const boardIds = useSelector(selectors.selectBoardIdsForCurrentProject);

  const canAdd = useSelector((state) => {
    const isEditModeEnabled = selectors.selectIsEditModeEnabled(state); // TODO: move out?

    if (!isEditModeEnabled) {
      return isEditModeEnabled;
    }

    return selectors.selectIsCurrentUserManagerForCurrentProject(state);
  });

  const dispatch = useDispatch();

  const tabsWrapperRef = useRef(null);

  const handleDragStart = useCallback(() => {
    document.body.classList.add(globalStyles.dragging);
    closePopup();
  }, []);

  const handleDragEnd = useCallback(
    ({ draggableId, source, destination }) => {
      document.body.classList.remove(globalStyles.dragging);

      if (!destination || source.index === destination.index) {
        return;
      }

      dispatch(entryActions.moveBoard(draggableId, destination.index));
    },
    [dispatch],
  );

  const handleWheel = useCallback(({ deltaY }) => {
    tabsWrapperRef.current.scrollBy({
      left: deltaY,
    });
  }, []);

  const AddPopup = usePopup(AddStep);

  return (
    <div className={styles.wrapper} onWheel={handleWheel}>
      <div ref={tabsWrapperRef} className={styles.tabsWrapper}>
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Droppable droppableId="boards" type={DroppableTypes.BOARD} direction="horizontal">
            {({ innerRef, droppableProps, placeholder }) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <div {...droppableProps} ref={innerRef} className={styles.tabs}>
                {boardIds.map((boardId, index) => (
                  <Item key={boardId} id={boardId} index={index} />
                ))}
                {placeholder}
                {canAdd && (
                  <AddPopup>
                    <Button icon="plus" className={styles.addButton} />
                  </AddPopup>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
});

export default Boards;
