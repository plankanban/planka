/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Button } from 'semantic-ui-react';
import { usePopup } from '../../../lib/popup';

import { BoardMembershipRoleIcons } from '../../../constants/Icons';
import GroupItemsStep from './GroupItemsStep';
import ActionsStep from './ActionsStep';
import UserAvatar from '../../users/UserAvatar';

import styles from './Group.module.scss';

const MAX_MEMBERS = 6;

const Group = React.memo(({ items, role, groupsTotal }) => {
  const GroupItemsPopup = usePopup(GroupItemsStep);
  const ActionsPopup = usePopup(ActionsStep);

  let visibleTotal = MAX_MEMBERS - groupsTotal;
  let hiddenTotal = items.length - visibleTotal;

  if (hiddenTotal === 1) {
    visibleTotal += 1;
    hiddenTotal -= 1;
  }

  return (
    <div className={styles.wrapper}>
      <Icon name={BoardMembershipRoleIcons[role]} className={styles.icon} />
      {items.slice(0, visibleTotal).map((item) => (
        <span key={item.id} className={styles.user}>
          <ActionsPopup boardMembershipId={item.id}>
            <UserAvatar id={item.user.id} size="large" isDisabled={!item.isPersisted} />
          </ActionsPopup>
        </span>
      ))}
      {hiddenTotal > 0 && (
        <GroupItemsPopup items={items} title={`common.${role}s`}>
          <Button className={styles.othersButton}>+{hiddenTotal < 99 ? hiddenTotal : 99}</Button>
        </GroupItemsPopup>
      )}
    </div>
  );
});

Group.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  role: PropTypes.string.isRequired,
  groupsTotal: PropTypes.number.isRequired,
};

export default Group;
