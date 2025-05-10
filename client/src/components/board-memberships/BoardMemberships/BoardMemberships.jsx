/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import groupBy from 'lodash/groupBy';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Button } from 'semantic-ui-react';
import { usePopup } from '../../../lib/popup';

import selectors from '../../../selectors';
import { isUserAdminOrProjectOwner } from '../../../utils/record-helpers';
import { BoardMembershipRoles } from '../../../constants/Enums';
import Group from './Group';
import AddStep from './AddStep';

import styles from './BoardMemberships.module.scss';

const BoardMemberships = React.memo(() => {
  const boardMemberships = useSelector(selectors.selectMembershipsForCurrentBoard);

  const canAdd = useSelector((state) => {
    const user = selectors.selectCurrentUser(state);

    if (!isUserAdminOrProjectOwner(user)) {
      return !selectors.selectCurrentUserMembershipForCurrentBoard(state);
    }

    return selectors.selectIsCurrentUserManagerForCurrentProject(state);
  });

  const boardMembershipsByRole = useMemo(
    () => groupBy(boardMemberships, 'role'),
    [boardMemberships],
  );

  const AddPopup = usePopup(AddStep);

  return (
    <>
      {boardMemberships.length > 0 && (
        <div className={classNames(styles.segment, styles.groups)}>
          {[BoardMembershipRoles.EDITOR, BoardMembershipRoles.VIEWER].map(
            (role) =>
              boardMembershipsByRole[role] && (
                <Group
                  key={role}
                  items={boardMembershipsByRole[role]}
                  role={role}
                  groupsTotal={Object.keys(boardMembershipsByRole).length}
                />
              ),
          )}
        </div>
      )}
      {canAdd && (
        <AddPopup>
          <Button icon="add user" className={classNames(styles.segment, styles.addButton)} />
        </AddPopup>
      )}
    </>
  );
});

export default BoardMemberships;
