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
import { useField, useNestedRef } from '../../../../hooks';
import User from './User';

import styles from './AddStep.module.scss';

const AddStep = React.memo(({ onClose }) => {
  const users = useSelector(selectors.selectActiveAdminOrProjectOwnerUsers);
  const currentUserIds = useSelector(selectors.selectManagerUserIdsForCurrentProject);

  const dispatch = useDispatch();
  const [t] = useTranslation();
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

  const handleUserSelect = useCallback(
    (userId) => {
      dispatch(
        entryActions.createManagerInCurrentProject({
          userId,
        }),
      );

      onClose();
    },
    [onClose, dispatch],
  );

  useEffect(() => {
    searchFieldRef.current.focus({
      preventScroll: true,
    });
  }, [searchFieldRef]);

  return (
    <>
      <Popup.Header>
        {t('common.addManager', {
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
