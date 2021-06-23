import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

import AddPopup from './AddPopup';
import ActionsPopup from './ActionsPopup';
import User from '../User';

import styles from './Memberships.module.scss';

const Memberships = React.memo(
  ({
    items,
    allUsers,
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
    onDelete,
  }) => {
    return (
      <>
        <span className={styles.users}>
          {items.map((item) => (
            <span key={item.id} className={styles.user}>
              <ActionsPopup
                user={item.user}
                leaveButtonContent={leaveButtonContent}
                leaveConfirmationTitle={leaveConfirmationTitle}
                leaveConfirmationContent={leaveConfirmationContent}
                leaveConfirmationButtonContent={leaveConfirmationButtonContent}
                deleteButtonContent={deleteButtonContent}
                deleteConfirmationTitle={deleteConfirmationTitle}
                deleteConfirmationContent={deleteConfirmationContent}
                deleteConfirmationButtonContent={deleteConfirmationButtonContent}
                canLeave={items.length > 1 || canLeaveIfLast}
                canDelete={canEdit}
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
        {canEdit && (
          <AddPopup
            users={allUsers}
            currentUserIds={items.map((item) => item.user.id)}
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
  onDelete: PropTypes.func.isRequired,
};

Memberships.defaultProps = {
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
};

export default Memberships;
