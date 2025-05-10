/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Menu } from 'semantic-ui-react';

import selectors from '../../../selectors';
import UserAvatar from '../../users/UserAvatar';

import styles from './Item.module.scss';

const Item = React.memo(({ id, isActive, onUserSelect, onUserDeselect }) => {
  const selectBoardMembershipById = useMemo(() => selectors.makeSelectBoardMembershipById(), []);
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

  const boardMembership = useSelector((state) => selectBoardMembershipById(state, id));
  const user = useSelector((state) => selectUserById(state, boardMembership.userId));

  const handleToggleClick = useCallback(() => {
    if (isActive) {
      if (onUserDeselect) {
        onUserDeselect(boardMembership.userId);
      }
    } else {
      onUserSelect(boardMembership.userId);
    }
  }, [isActive, onUserSelect, onUserDeselect, boardMembership.userId]);

  return (
    <Menu.Item
      active={isActive}
      disabled={!boardMembership.isPersisted}
      className={classNames(styles.menuItem, isActive && styles.menuItemActive)}
      onClick={handleToggleClick}
    >
      <span className={styles.user}>
        <UserAvatar id={boardMembership.userId} />
      </span>
      <div className={classNames(styles.menuItemText, isActive && styles.menuItemTextActive)}>
        {user.name}
      </div>
    </Menu.Item>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onUserSelect: PropTypes.func.isRequired,
  onUserDeselect: PropTypes.func,
};

Item.defaultProps = {
  onUserDeselect: undefined,
};

export default Item;
