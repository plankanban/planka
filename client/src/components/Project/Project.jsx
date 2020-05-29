import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Grid } from 'semantic-ui-react';

import BoardsContainer from '../../containers/BoardsContainer';
import ActionsPopup from './ActionsPopup';
import AddMembershipPopup from './AddMembershipPopup';
import EditMembershipPopup from './EditMembershipPopup';
import User from '../User';

import styles from './Project.module.scss';

const Project = React.memo(
  ({
    name,
    background,
    backgroundImage,
    isBackgroundImageUpdating,
    memberships,
    allUsers,
    isEditable,
    onUpdate,
    onBackgroundImageUpdate,
    onDelete,
    onMembershipCreate,
    onMembershipDelete,
  }) => {
    const handleMembershipDelete = useCallback(
      (id) => {
        onMembershipDelete(id);
      },
      [onMembershipDelete],
    );

    useEffect(() => {
      return () => {
        document.body.style.background = null;
      };
    }, []);

    return (
      <div className={styles.wrapper}>
        <Grid className={styles.header}>
          <Grid.Row>
            <Grid.Column>
              {isEditable ? (
                <ActionsPopup
                  project={{
                    name,
                    background,
                    backgroundImage,
                    isBackgroundImageUpdating,
                  }}
                  onUpdate={onUpdate}
                  onBackgroundImageUpdate={onBackgroundImageUpdate}
                  onDelete={onDelete}
                >
                  <Button content={name} disabled={!isEditable} className={styles.name} />
                </ActionsPopup>
              ) : (
                <span className={styles.name}>{name}</span>
              )}
              <span className={styles.users}>
                {memberships.map((membership) => (
                  <span key={membership.id} className={styles.user}>
                    <EditMembershipPopup
                      user={membership.user}
                      isEditable={isEditable}
                      onDelete={() => handleMembershipDelete(membership.id)}
                    >
                      <User
                        name={membership.user.name}
                        avatarUrl={membership.user.avatarUrl}
                        size="large"
                        isDisabled={!membership.isPersisted}
                      />
                    </EditMembershipPopup>
                  </span>
                ))}
              </span>
              {isEditable && (
                <AddMembershipPopup
                  users={allUsers}
                  currentUserIds={memberships.map((membership) => membership.user.id)}
                  onCreate={onMembershipCreate}
                >
                  <Button icon="add user" className={styles.addUser} />
                </AddMembershipPopup>
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <BoardsContainer />
      </div>
    );
  },
);

Project.propTypes = {
  name: PropTypes.string.isRequired,
  /* eslint-disable react/forbid-prop-types */
  background: PropTypes.object,
  backgroundImage: PropTypes.object,
  /* eslint-enable react/forbid-prop-types */
  isBackgroundImageUpdating: PropTypes.bool.isRequired,
  /* eslint-disable react/forbid-prop-types */
  memberships: PropTypes.array.isRequired,
  allUsers: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  isEditable: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onBackgroundImageUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMembershipCreate: PropTypes.func.isRequired,
  onMembershipDelete: PropTypes.func.isRequired,
};

Project.defaultProps = {
  background: undefined,
  backgroundImage: undefined,
};

export default Project;
