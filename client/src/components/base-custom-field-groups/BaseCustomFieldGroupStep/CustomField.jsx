/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';

import styles from './CustomField.module.scss';

const CustomField = React.memo(({ id, index, onEdit }) => {
  const selectCustomFieldById = useMemo(() => selectors.makeSelectCustomFieldById(), []);

  const customField = useSelector((state) => selectCustomFieldById(state, id));

  const handleEditClick = useCallback(() => {
    onEdit(id);
  }, [id, onEdit]);

  return (
    <Draggable draggableId={id} index={index} isDragDisabled={!customField.isPersisted}>
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
        const contentNode = (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...draggableProps} ref={innerRef} className={styles.wrapper}>
            <span
              {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
              className={styles.name}
            >
              {customField.showOnFrontOfCard && <Icon name="pin" className={styles.nameIcon} />}
              {customField.name}
            </span>
            <Button
              icon="pencil"
              size="small"
              floated="right"
              disabled={!customField.isPersisted}
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

CustomField.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default CustomField;
