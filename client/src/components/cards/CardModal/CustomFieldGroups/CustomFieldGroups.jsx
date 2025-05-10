/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { closePopup } from '../../../../lib/popup';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import DroppableTypes from '../../../../constants/DroppableTypes';
import Item from './Item';
import DraggableItem from './DraggableItem';

import styles from './CustomFieldGroups.module.scss';
import globalStyles from '../../../../styles.module.scss';

const CustomFieldGroups = React.memo(() => {
  const boardCustomFieldGroupIds = useSelector(selectors.selectCustomFieldGroupIdsForCurrentBoard);
  const cardCustomFieldGroupIds = useSelector(selectors.selectCustomFieldGroupIdsForCurrentCard);

  const dispatch = useDispatch();

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

      dispatch(entryActions.moveCustomFieldGroup(draggableId, destination.index));
    },
    [dispatch],
  );

  return (
    <>
      {boardCustomFieldGroupIds.map((customFieldGroupId) => (
        <div key={customFieldGroupId} className={styles.item}>
          <Item id={customFieldGroupId} />
        </div>
      ))}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="card" type={DroppableTypes.CUSTOM_FIELD_GROUP} direction="vertical">
          {({ innerRef, droppableProps, placeholder }) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <div {...droppableProps} ref={innerRef}>
              {cardCustomFieldGroupIds.map((customFieldGroupId, index) => (
                <DraggableItem
                  key={customFieldGroupId}
                  id={customFieldGroupId}
                  index={index}
                  className={styles.item}
                />
              ))}
              {placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
});

export default CustomFieldGroups;
