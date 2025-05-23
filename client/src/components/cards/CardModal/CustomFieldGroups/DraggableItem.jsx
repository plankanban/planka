/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';

import classNames from 'classnames';
import selectors from '../../../../selectors';
import { isListArchiveOrTrash } from '../../../../utils/record-helpers';
import { BoardMembershipRoles } from '../../../../constants/Enums';
import Item from './Item';

import styles from './DraggableItem.module.scss';

const DraggableItem = React.memo(({ id, index, className, ...props }) => {
  const selectCustomFieldGroupById = useMemo(() => selectors.makeSelectCustomFieldGroupById(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const customFieldGroup = useSelector((state) => selectCustomFieldGroupById(state, id));

  const canEdit = useSelector((state) => {
    if (customFieldGroup.boardId) {
      return false;
    }

    const { listId } = selectors.selectCurrentCard(state);
    const list = selectListById(state, listId);

    if (isListArchiveOrTrash(list)) {
      return false;
    }

    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  return (
    <Draggable
      draggableId={id}
      index={index}
      isDragDisabled={!customFieldGroup.isPersisted || !canEdit}
    >
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
        const contentNode = (
          <div
            {...draggableProps} // eslint-disable-line react/jsx-props-no-spreading
            ref={innerRef}
            className={classNames(className, isDragging && styles.dragging)}
          >
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Item {...props} id={id} dragHandleProps={dragHandleProps} />
          </div>
        );

        return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
      }}
    </Draggable>
  );
});

DraggableItem.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  className: PropTypes.string,
};

DraggableItem.defaultProps = {
  className: undefined,
};

export default DraggableItem;
