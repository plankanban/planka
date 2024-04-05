import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Input, Popup } from '../../../lib/custom-ui';

import { useField, useSteps } from '../../../hooks';
import UserItem from './UserItem';
import DeleteStep from '../../DeleteStep';

import styles from './EditStep.module.scss';

const StepTypes = {
  EDIT_PERMISSIONS: 'EDIT_PERMISSIONS',
  DELETE: 'DELETE',
};

const EditStep = React.memo(
  ({ users, currentUserIds, permissionsSelectStep, title, onUpdate, onDelete, onClose }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();
    const [search, handleSearchChange] = useField('');
    const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

    const filteredUsers = useMemo(
      () =>
        users.filter(
          (user) =>
            user.email.includes(cleanSearch) ||
            user.name.toLowerCase().includes(cleanSearch) ||
            (user.username && user.username.includes(cleanSearch)),
        ),
      [users, cleanSearch],
    );

    const searchField = useRef(null);

    const handleEditPermissionsClick = useCallback(() => {
      openStep(StepTypes.EDIT_PERMISSIONS);
    }, [openStep]);

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    const handleUserSelect = useCallback(
      (id) => {
        openStep(StepTypes.EDIT_PERMISSIONS, {
          userId: id,
        });
      },
      [openStep],
    );

    const handleRoleSelect = useCallback(
      (data) => {
        onUpdate({
          userId: step.params.userId,
          ...data,
        });
      },
      [onUpdate, step],
    );

    useEffect(() => {
      searchField.current.focus({
        preventScroll: true,
      });
    }, []);

    if (step) {
      switch (step.type) {
        case StepTypes.EDIT_PERMISSIONS: {
          const currentUser = users.find((user) => user.id === step.params.userId);

          if (currentUser) {
            const PermissionsSelectStep = permissionsSelectStep;

            return (
              <PermissionsSelectStep
                defaultData={pick(membership, ['roke', 'canComment'])}
                title="common.editPermissions"
                buttonContent="action.save"
                onSelect={handleRoleSelect}
                onBack={handleBack}
                onClose={onClose}
              />
            );
          }
          break;
        }
        case StepTypes.DELETE:
          return (
            <DeleteStep
              title={membership.user.isCurrent ? leaveConfirmationTitle : deleteConfirmationTitle}
              content={
                membership.user.isCurrent ? leaveConfirmationContent : deleteConfirmationContent
              }
              buttonContent={
                membership.user.isCurrent
                  ? leaveConfirmationButtonContent
                  : deleteConfirmationButtonContent
              }
              onConfirm={onDelete}
              onBack={handleBack}
            />
          );
        default:
      }
    }

    return (
      <>
        <Popup.Header>
          {t(title, {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <Input
            fluid
            ref={searchField}
            value={search}
            placeholder={t('common.searchUsers')}
            icon="search"
            onChange={handleSearchChange}
          />
          {filteredUsers.length > 0 && (
            <div className={styles.users}>
              {filteredUsers.map((user) => (
                <UserItem
                  key={user.id}
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                  isActive={currentUserIds.includes(user.id)}
                  onSelect={() => handleUserSelect(user.id)}
                />
              ))}
            </div>
          )}
        </Popup.Content>
      </>
    );
  },
);

EditStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  currentUserIds: PropTypes.array.isRequired,
  /* eslint-disable react/forbid-prop-types */
  permissionsSelectStep: PropTypes.elementType,
  title: PropTypes.string,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

EditStep.defaultProps = {
  permissionsSelectStep: undefined,
  title: 'common.editMember',
  onUpdate: undefined,
};

export default EditStep;
