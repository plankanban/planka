/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';
import { useToggle } from '../../../../lib/hooks';

import selectors from '../../../../selectors';
import { usePopupInClosableContext } from '../../../../hooks';
import { BoardMembershipRoles } from '../../../../constants/Enums';
import EditStep from './EditStep';
import TaskList from '../../../task-lists/TaskList';

import styles from './Item.module.scss';

const Item = React.memo(({ id, index }) => {
  const selectTaskListById = useMemo(() => selectors.makeSelectTaskListById(), []);

  const taskList = useSelector((state) => selectTaskListById(state, id));

  const canEdit = useSelector((state) => {
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const [isCompletedVisible, toggleCompletedVisible] = useToggle();

  const handleToggleCompletedVisibleClick = useCallback(() => {
    toggleCompletedVisible();
  }, [toggleCompletedVisible]);

  const EditPopup = usePopupInClosableContext(EditStep);

  const withActions = taskList.hideCompletedTasks || canEdit;

  return (
    <Draggable
      draggableId={`task-list:${id}`}
      index={index}
      isDragDisabled={!taskList.isPersisted || !canEdit}
    >
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
        const contentNode = (
          <div
            {...draggableProps} // eslint-disable-line react/jsx-props-no-spreading
            ref={innerRef}
            className={classNames(styles.wrapper, styles.wrapperDragging)}
          >
            <div className={styles.moduleWrapper}>
              <Icon name="check square outline" className={styles.moduleIcon} />
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <div {...dragHandleProps}>
                <div
                  className={classNames(
                    styles.moduleHeader,
                    withActions && styles.moduleHeaderWithActions,
                    taskList.hideCompletedTasks && canEdit && styles.both,
                  )}
                >
                  {taskList.isPersisted && withActions && (
                    <div className={classNames(styles.actions)}>
                      {taskList.hideCompletedTasks && (
                        <Button
                          className={styles.button}
                          onClick={handleToggleCompletedVisibleClick}
                        >
                          <Icon
                            fitted
                            name={isCompletedVisible ? 'eye slash' : 'eye'}
                            size="small"
                          />
                        </Button>
                      )}
                      {canEdit && (
                        <EditPopup taskListId={taskList.id}>
                          <Button className={styles.button}>
                            <Icon fitted name="pencil" size="small" />
                          </Button>
                        </EditPopup>
                      )}
                    </div>
                  )}
                  <span className={styles.moduleHeaderTitle}>{taskList.name}</span>
                </div>
              </div>
              <TaskList id={id} isCompletedVisible={isCompletedVisible} />
            </div>
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
};

export default Item;
