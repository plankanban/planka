/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import Paths from '../../../constants/Paths';

import styles from './Item.module.scss';

const Item = React.memo(({ id, index }) => {
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);

  const selectNotificationsTotalByBoardId = useMemo(
    () => selectors.makeSelectNotificationsTotalByBoardId(),
    [],
  );

  const board = useSelector((state) => selectBoardById(state, id));
  const notificationsTotal = useSelector((state) => selectNotificationsTotalByBoardId(state, id));
  const isActive = useSelector((state) => id === selectors.selectPath(state).boardId);

  const canEdit = useSelector((state) => {
    const isEditModeEnabled = selectors.selectIsEditModeEnabled(state); // TODO: move out?

    if (!isEditModeEnabled) {
      return isEditModeEnabled;
    }

    return selectors.selectIsCurrentUserManagerForCurrentProject(state);
  });

  const dispatch = useDispatch();

  const handleEditClick = useCallback(() => {
    dispatch(entryActions.openBoardSettingsModal(id));
  }, [id, dispatch]);

  return (
    <Draggable draggableId={id} index={index} isDragDisabled={!board.isPersisted || !canEdit}>
      {({ innerRef, draggableProps, dragHandleProps }) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <div {...draggableProps} {...dragHandleProps} ref={innerRef} className={styles.wrapper}>
          <div className={classNames(styles.tab, isActive && styles.tabActive)}>
            {board.isPersisted ? (
              <>
                <Link
                  to={Paths.BOARDS.replace(':id', id)}
                  title={board.name}
                  className={styles.link}
                >
                  {notificationsTotal > 0 && (
                    <span className={styles.notifications}>{notificationsTotal}</span>
                  )}
                  <span className={styles.name}>{board.name}</span>
                </Link>
                {canEdit && (
                  <Button className={styles.editButton} onClick={handleEditClick}>
                    <Icon fitted name="pencil" size="small" />
                  </Button>
                )}
              </>
            ) : (
              <span className={classNames(styles.name, styles.link)}>{board.name}</span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default Item;
