/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
import { Button } from 'semantic-ui-react';

import selectors from '../../../selectors';

import styles from './Item.module.scss';

const Item = React.memo(({ id, index, onEdit }) => {
  const selectCustomFieldGroupById = useMemo(() => selectors.makeSelectCustomFieldGroupById(), []);

  const customFieldGroup = useSelector((state) => selectCustomFieldGroupById(state, id));

  const handleEditClick = useCallback(() => {
    onEdit(id);
  }, [id, onEdit]);

  return (
    <Draggable draggableId={id} index={index} isDragDisabled={!customFieldGroup.isPersisted}>
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
        const contentNode = (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...draggableProps} ref={innerRef} className={styles.wrapper}>
            <span
              {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
              className={styles.name}
            >
              {customFieldGroup.name}
            </span>
            <Button
              icon="pencil"
              size="small"
              floated="right"
              disabled={!customFieldGroup.isPersisted}
              className={styles.editButton}
              onClick={handleEditClick}
            />
          </div>
        );

        return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
      }}
    </Draggable>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default Item;
