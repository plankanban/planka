import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import { usePopup } from '../../lib/popup';

import AddStep from './AddStep';
import ActionsStep from './ActionsStep';
import User from '../User';

import styles from './Memberships.module.scss';

const Memberships = React.memo(
  ({
    items,
    allUsers,
    permissionsSelectStep,
    addTitle,
    leaveButtonContent,
    leaveConfirmationTitle,
    leaveConfirmationContent,
    leaveConfirmationButtonContent,
    deleteButtonContent,
    deleteConfirmationTitle,
    deleteConfirmationContent,
    deleteConfirmationButtonContent,
    canEdit,
    canLeaveIfLast,
    onCreate,
    onUpdate,
    onDelete,
  }) => {
    const AddPopup = usePopup(AddStep);
    const ActionsPopup = usePopup(ActionsStep);

    // Number of display slots available for showing user icons
    const userDisplaySlots = 5;
    const shownUsers = items.slice(0, userDisplaySlots);
    const remainingUsers = items.slice(userDisplaySlots);

    return (
      <>
        <span className={styles.users}>
          {shownUsers.map((item) => (
            <span key={item.id} className={styles.user}>
              <ActionsPopup
                membership={item}
                permissionsSelectStep={permissionsSelectStep}
                leaveButtonContent={leaveButtonContent}
                leaveConfirmationTitle={leaveConfirmationTitle}
                leaveConfirmationContent={leaveConfirmationContent}
                leaveConfirmationButtonContent={leaveConfirmationButtonContent}
                deleteButtonContent={deleteButtonContent}
                deleteConfirmationTitle={deleteConfirmationTitle}
                deleteConfirmationContent={deleteConfirmationContent}
                deleteConfirmationButtonContent={deleteConfirmationButtonContent}
                canEdit={canEdit}
                canLeave={items.length > 1 || canLeaveIfLast}
                onUpdate={(data) => onUpdate(item.id, data)}
                onDelete={() => onDelete(item.id)}
              >
                <User
                  name={item.user.name}
                  avatarUrl={item.user.avatarUrl}
                  size="large"
                  isDisabled={!item.isPersisted}
                />
              </ActionsPopup>
            </span>
          ))}
        </span>
        {remainingUsers.length > 0 && (
          <span className={styles.moreUsersIndicator}>+ {remainingUsers.length} other Members</span>
        )}
        {canEdit && (
          <AddPopup
            users={allUsers}
            currentUserIds={items.map((item) => item.user.id)}
            permissionsSelectStep={permissionsSelectStep}
            title={addTitle}
            onCreate={onCreate}
          >
            <Button icon="add user" className={styles.addUser} />
          </AddPopup>
        )}
      </>
    );
  },
);

Memberships.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  items: PropTypes.array.isRequired,
  allUsers: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  permissionsSelectStep: PropTypes.elementType,
  addTitle: PropTypes.string,
  leaveButtonContent: PropTypes.string,
  leaveConfirmationTitle: PropTypes.string,
  leaveConfirmationContent: PropTypes.string,
  leaveConfirmationButtonContent: PropTypes.string,
  deleteButtonContent: PropTypes.string,
  deleteConfirmationTitle: PropTypes.string,
  deleteConfirmationContent: PropTypes.string,
  deleteConfirmationButtonContent: PropTypes.string,
  canEdit: PropTypes.bool,
  canLeaveIfLast: PropTypes.bool,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
};

Memberships.defaultProps = {
  permissionsSelectStep: undefined,
  addTitle: undefined,
  leaveButtonContent: undefined,
  leaveConfirmationTitle: undefined,
  leaveConfirmationContent: undefined,
  leaveConfirmationButtonContent: undefined,
  deleteButtonContent: undefined,
  deleteConfirmationTitle: undefined,
  deleteConfirmationContent: undefined,
  deleteConfirmationButtonContent: undefined,
  canEdit: true,
  canLeaveIfLast: true,
  onUpdate: undefined,
};

export default Memberships;
