/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import Paths from '../../../constants/Paths';

import styles from './SelectBoardStep.module.scss';

const Item = React.memo(({ id, onClose }) => {
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
  const [t] = useTranslation();

  const handleSettingsClick = useCallback(() => {
    onClose();
    dispatch(entryActions.openBoardSettingsModal(id));
  }, [id, onClose, dispatch]);

  return (
    <div className={classNames(styles.item, isActive && styles.itemActive)}>
      {board.isPersisted ? (
        <Link
          to={Paths.BOARDS.replace(':id', id)}
          title={board.name}
          className={styles.itemLink}
          onClick={onClose}
        >
          <Icon fitted name={isActive ? 'check' : 'columns'} className={styles.itemIcon} />
          <span className={styles.itemName}>{board.name}</span>
          {notificationsTotal > 0 && <span className={styles.badge}>{notificationsTotal}</span>}
        </Link>
      ) : (
        <span className={styles.itemLink}>
          <Icon fitted name="columns" className={styles.itemIcon} />
          <span className={styles.itemName}>{board.name}</span>
        </span>
      )}
      {board.isPersisted && canEdit && (
        <button
          type="button"
          aria-label={t('common.openBoardSettings')}
          title={t('common.openBoardSettings')}
          className={styles.settingsButton}
          onClick={handleSettingsClick}
        >
          <Icon fitted name="setting" />
        </button>
      )}
    </div>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Item;
