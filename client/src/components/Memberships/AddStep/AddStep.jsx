import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Input, Popup } from '../../../lib/custom-ui';

import { useField, useSteps } from '../../../hooks';
import UserItem from './UserItem';

import styles from './AddStep.module.scss';

const StepTypes = {
  SELECT_PERMISSIONS: 'SELECT_PERMISSIONS',
};

const AddStep = React.memo(
  ({ users, currentUserIds, permissionsSelectStep, title, onCreate, onClose }) => {
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

    const handleUserSelect = useCallback(
      (id) => {
        if (permissionsSelectStep) {
          openStep(StepTypes.SELECT_PERMISSIONS, {
            userId: id,
          });
        } else {
          onCreate({
            userId: id,
          });

          onClose();
        }
      },
      [permissionsSelectStep, onCreate, onClose, openStep],
    );

    const handleRoleSelect = useCallback(
      (data) => {
        onCreate({
          userId: step.params.userId,
          ...data,
        });
      },
      [onCreate, step],
    );

    useEffect(() => {
      searchField.current.focus({
        preventScroll: true,
      });
    }, []);

    if (step) {
      switch (step.type) {
        case StepTypes.SELECT_PERMISSIONS: {
          const currentUser = users.find((user) => user.id === step.params.userId);

          if (currentUser) {
            const PermissionsSelectStep = permissionsSelectStep;

            return (
              <PermissionsSelectStep
                buttonContent="action.addMember"
                onSelect={handleRoleSelect}
                onBack={handleBack}
                onClose={onClose}
              />
            );
          }

          openStep(null);

          break;
        }
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

AddStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  currentUserIds: PropTypes.array.isRequired,
  /* eslint-disable react/forbid-prop-types */
  permissionsSelectStep: PropTypes.elementType,
  title: PropTypes.string,
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

AddStep.defaultProps = {
  permissionsSelectStep: undefined,
  title: 'common.addMember',
};

export default AddStep;
