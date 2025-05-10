/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Input, Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useField, useNestedRef, useSteps } from '../../../../hooks';
import { isUserAdminOrProjectOwner } from '../../../../utils/record-helpers';
import User from './User';
import SelectPermissionsStep from '../SelectPermissionsStep';

import styles from './AddStep.module.scss';

const StepTypes = {
  SELECT_PERMISSIONS: 'SELECT_PERMISSIONS',
};

const AddStep = React.memo(({ onClose }) => {
  const users = useSelector((state) => {
    const user = selectors.selectCurrentUser(state);

    if (!isUserAdminOrProjectOwner(user)) {
      return [user];
    }

    return selectors.selectActiveUsers(state);
  });

  const currentUserIds = useSelector(selectors.selectMemberUserIdsForCurrentBoard);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(cleanSearch) ||
          (user.username && user.username.includes(cleanSearch)),
      ),
    [users, cleanSearch],
  );

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  const handleRoleSelect = useCallback(
    (data) => {
      dispatch(
        entryActions.createMembershipInCurrentBoard({
          ...data,
          userId: step.params.userId,
        }),
      );

      onClose();
    },
    [onClose, dispatch, step],
  );

  const handleUserSelect = useCallback(
    (userId) => {
      openStep(StepTypes.SELECT_PERMISSIONS, {
        userId,
      });
    },
    [openStep],
  );

  useEffect(() => {
    searchFieldRef.current.focus({
      preventScroll: true,
    });
  }, [searchFieldRef]);

  if (step && step.type === StepTypes.SELECT_PERMISSIONS) {
    const currentUser = users.find((user) => user.id === step.params.userId);

    if (currentUser) {
      return (
        <SelectPermissionsStep
          buttonContent="action.addMember"
          onSelect={handleRoleSelect}
          onBack={handleBack}
          onClose={onClose}
        />
      );
    }

    openStep(null);
  }

  return (
    <>
      <Popup.Header>
        {t('common.addMember', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Input
          fluid
          ref={handleSearchFieldRef}
          value={search}
          placeholder={t('common.searchUsers')}
          maxLength={128}
          icon="search"
          onChange={handleSearchChange}
        />
        {filteredUsers.length > 0 && (
          <div className={styles.users}>
            {filteredUsers.map((user) => (
              <User
                key={user.id}
                id={user.id}
                isActive={currentUserIds.includes(user.id)}
                onSelect={handleUserSelect}
              />
            ))}
          </div>
        )}
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddStep;
