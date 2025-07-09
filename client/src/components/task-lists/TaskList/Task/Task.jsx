/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useContext, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
import { Button, Checkbox, Icon } from 'semantic-ui-react';
import { useDidUpdate } from '../../../../lib/hooks';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { usePopupInClosableContext } from '../../../../hooks';
import { isListArchiveOrTrash } from '../../../../utils/record-helpers';
import { BoardMembershipRoles } from '../../../../constants/Enums';
import { ClosableContext } from '../../../../contexts';
import EditName from './EditName';
import SelectAssigneeStep from './SelectAssigneeStep';
import ActionsStep from './ActionsStep';
import Linkify from '../../../common/Linkify';
import UserAvatar from '../../../users/UserAvatar';

import styles from './Task.module.scss';

const Task = React.memo(({ id, index }) => {
  const selectTaskById = useMemo(() => selectors.makeSelectTaskById(), []);
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const task = useSelector((state) => selectTaskById(state, id));

  const isLinkedCardCompleted = useSelector((state) => {
    const regex = /\/cards\/([^/]+)/g;
    const matches = task.name.matchAll(regex);

    // eslint-disable-next-line no-restricted-syntax
    for (const [, cardId] of matches) {
      const card = selectCardById(state, cardId);

      if (card && card.isClosed) {
        return true;
      }
    }

    return false;
  });

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
  const isCompleted = task.isCompleted || isLinkedCardCompleted;
  const isToggleDisabled = !task.isPersisted || !canToggle || isLinkedCardCompleted;

  const handleClick = useCallback(() => {
    if (isEditable) {
      setIsEditNameOpened(true);
    }
  }, [isEditable]);

  const handleNameEdit = useCallback(() => {
    setIsEditNameOpened(true);
  }, []);

  const handleEditNameClose = useCallback(() => {
    setIsEditNameOpened(false);
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
                checked={isCompleted}
                disabled={isToggleDisabled}
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
                  className={classNames(styles.text, canEdit && styles.textEditable)}
                  onClick={handleClick}
                >
                  <span className={classNames(styles.task, isCompleted && styles.taskCompleted)}>
                    <Linkify linkStopPropagation>{task.name}</Linkify>
                  </span>
                </span>
                {(task.assigneeUserId || isEditable) && (
                  <div className={classNames(styles.actions, isEditable && styles.actionsEditable)}>
                    {isEditable ? (
                      <>
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
