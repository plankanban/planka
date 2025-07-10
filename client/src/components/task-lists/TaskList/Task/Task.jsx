/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useContext, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';
import { Button, Checkbox, Icon } from 'semantic-ui-react';
import { useDidUpdate } from '../../../../lib/hooks';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { usePopupInClosableContext } from '../../../../hooks';
import { isListArchiveOrTrash } from '../../../../utils/record-helpers';
import { BoardMembershipRoles } from '../../../../constants/Enums';
import { ClosableContext } from '../../../../contexts';
import Paths from '../../../../constants/Paths';
import EditName from './EditName';
import SelectAssigneeStep from './SelectAssigneeStep';
import ActionsStep from './ActionsStep';
import Linkify from '../../../common/Linkify';
import UserAvatar from '../../../users/UserAvatar';

import styles from './Task.module.scss';

const Task = React.memo(({ id, index }) => {
  const selectTaskById = useMemo(() => selectors.makeSelectTaskById(), []);
  const selectLinkedCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const task = useSelector((state) => selectTaskById(state, id));

  const linkedCard = useSelector(
    (state) => task.linkedCardId && selectLinkedCardById(state, task.linkedCardId),
  );

  const { canEdit, canToggle } = useSelector((state) => {
    const { listId } = selectors.selectCurrentCard(state);
    const list = selectListById(state, listId);

    if (isListArchiveOrTrash(list)) {
      return {
        canEdit: false,
        canToggle: false,
      };
    }

    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    const isEditor = !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;

    return {
      canEdit: isEditor,
      canToggle: isEditor,
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const [isEditNameOpened, setIsEditNameOpened] = useState(false);
  const [, , setIsClosableActive] = useContext(ClosableContext);

  const handleToggleChange = useCallback(() => {
    dispatch(
      entryActions.updateTask(id, {
        isCompleted: !task.isCompleted,
      }),
    );
  }, [id, task.isCompleted, dispatch]);

  const handleUserSelect = useCallback(
    (userId) => {
      dispatch(
        entryActions.updateTask(id, {
          assigneeUserId: userId,
        }),
      );
    },
    [id, dispatch],
  );

  const handleUserDeselect = useCallback(() => {
    dispatch(
      entryActions.updateTask(id, {
        assigneeUserId: null,
      }),
    );
  }, [id, dispatch]);

  const isEditable = task.isPersisted && canEdit;

  const handleClick = useCallback(() => {
    if (!task.linkedCardId && isEditable) {
      setIsEditNameOpened(true);
    }
  }, [task.linkedCardId, isEditable]);

  const handleNameEdit = useCallback(() => {
    setIsEditNameOpened(true);
  }, []);

  const handleEditNameClose = useCallback(() => {
    setIsEditNameOpened(false);
  }, []);

  const handleLinkClick = useCallback((event) => {
    event.stopPropagation();
  }, []);

  useDidUpdate(() => {
    setIsClosableActive(isEditNameOpened);
  }, [isEditNameOpened]);

  const SelectAssigneePopup = usePopupInClosableContext(SelectAssigneeStep);
  const ActionsPopup = usePopupInClosableContext(ActionsStep);

  return (
    <Draggable
      draggableId={`task:${id}`}
      index={index}
      isDragDisabled={isEditNameOpened || !isEditable}
    >
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => {
        const contentNode = (
          <div
            {...draggableProps} // eslint-disable-line react/jsx-props-no-spreading
            {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
            ref={innerRef}
            className={classNames(styles.wrapper, isDragging && styles.wrapperDragging)}
          >
            <span className={styles.checkboxWrapper}>
              <Checkbox
                checked={task.isCompleted}
                disabled={!!task.linkedCardId || !task.isPersisted || !canToggle}
                className={styles.checkbox}
                onChange={handleToggleChange}
              />
            </span>
            {isEditNameOpened ? (
              <EditName taskId={id} onClose={handleEditNameClose} />
            ) : (
              <div className={classNames(canEdit && styles.contentHoverable)}>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                             jsx-a11y/no-static-element-interactions */}
                <span
                  className={classNames(
                    styles.text,
                    task.linkedCardId && styles.textLinked,
                    canEdit && styles.textEditable,
                    canEdit && !task.linkedCardId && styles.textPointable,
                  )}
                  onClick={handleClick}
                >
                  <span
                    className={classNames(styles.task, task.isCompleted && styles.taskCompleted)}
                  >
                    {task.linkedCardId ? (
                      <>
                        <Icon name="exchange" size="small" className={styles.icon} />
                        <span
                          className={classNames(
                            styles.name,
                            task.isCompleted && styles.nameCompleted,
                          )}
                        >
                          <Link
                            to={Paths.CARDS.replace(':id', task.linkedCardId)}
                            onClick={handleLinkClick}
                          >
                            {linkedCard ? linkedCard.name : task.name}
                          </Link>
                        </span>
                      </>
                    ) : (
                      <span
                        className={classNames(
                          styles.name,
                          task.isCompleted && styles.nameCompleted,
                        )}
                      >
                        <Linkify linkStopPropagation>{task.name}</Linkify>
                      </span>
                    )}
                  </span>
                </span>
                {(task.assigneeUserId || isEditable) && (
                  <div className={classNames(styles.actions, isEditable && styles.actionsEditable)}>
                    {isEditable ? (
                      <>
                        {!task.linkedCardId && (
                          <SelectAssigneePopup
                            currentUserId={task.assigneeUserId}
                            onUserSelect={handleUserSelect}
                            onUserDeselect={handleUserDeselect}
                          >
                            {task.assigneeUserId ? (
                              <UserAvatar
                                id={task.assigneeUserId}
                                size="tiny"
                                className={styles.assigneeUserAvatar}
                              />
                            ) : (
                              <Button className={styles.button}>
                                <Icon fitted name="add user" size="small" />
                              </Button>
                            )}
                          </SelectAssigneePopup>
                        )}
                        <ActionsPopup taskId={id} onNameEdit={handleNameEdit}>
                          <Button className={styles.button}>
                            <Icon fitted name="pencil" size="small" />
                          </Button>
                        </ActionsPopup>
                      </>
                    ) : (
                      <UserAvatar
                        id={task.assigneeUserId}
                        size="tiny"
                        className={styles.assigneeUserAvatar}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );

        return isDragging ? ReactDOM.createPortal(contentNode, document.body) : contentNode;
      }}
    </Draggable>
  );
});

Task.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default Task;
