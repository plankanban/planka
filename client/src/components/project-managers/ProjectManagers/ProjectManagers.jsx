/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'semantic-ui-react';

import selectors from '../../../selectors';
import { usePopupInClosableContext } from '../../../hooks';
import { isUserAdminOrProjectOwner } from '../../../utils/record-helpers';
import AddStep from './AddStep';
import ActionsStep from './ActionsStep';
import UserAvatar from '../../users/UserAvatar';

import styles from './ProjectManagers.module.scss';

const ProjectManagers = React.memo(() => {
  const projectManagers = useSelector(selectors.selectManagersForCurrentProject);

  const canAdd = useSelector((state) => {
    const user = selectors.selectCurrentUser(state);

    if (!isUserAdminOrProjectOwner(user)) {
      return false;
    }

    return !selectors.selectCurrentProject(state).ownerProjectManagerId;
  });

  const AddPopup = usePopupInClosableContext(AddStep);
  const ActionsPopup = usePopupInClosableContext(ActionsStep);

  return (
    <div className={styles.wrapper}>
      {projectManagers.map((projectManager) => (
        <span key={projectManager.id} className={styles.user}>
          <ActionsPopup projectManagerId={projectManager.id}>
            <UserAvatar
              id={projectManager.user.id}
              size="large"
              isDisabled={!projectManager.isPersisted}
            />
          </ActionsPopup>
        </span>
      ))}
      {canAdd && (
        <AddPopup>
          <Button icon="add user" className={styles.addButton} />
        </AddPopup>
      )}
    </div>
  );
});

export default ProjectManagers;
