/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Tab, Table } from 'semantic-ui-react';
import { Input } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import { useField, useNestedRef } from '../../../../hooks';
import Item from './Item';

import styles from './ApiKeysPane.module.scss';

const ApiKeysPane = React.memo(() => {
  const users = useSelector(selectors.selectUsersExceptCurrent);

  const [t] = useTranslation();

  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const [showOnlyWithKeys, setShowOnlyWithKeys] = useState(true);

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        // Exclude deactivated users
        if (user.isDeactivated) {
          return false;
        }

        if (showOnlyWithKeys && !user.apiKeyPrefix) {
          return false;
        }

        return (
          user.email.includes(cleanSearch) ||
          user.name.toLowerCase().includes(cleanSearch) ||
          (user.username && user.username.includes(cleanSearch)) ||
          (user.apiKeyPrefix && user.apiKeyPrefix.toLowerCase().includes(cleanSearch))
        );
      }),
    [users, cleanSearch, showOnlyWithKeys],
  );

  const handleToggleFilterClick = useCallback(() => {
    setShowOnlyWithKeys(!showOnlyWithKeys);
  }, [showOnlyWithKeys]);

  useEffect(() => {
    searchFieldRef.current.focus();
  }, [searchFieldRef]);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Input
        fluid
        ref={handleSearchFieldRef}
        value={search}
        placeholder={t('common.searchUsers')}
        maxLength={256}
        icon="search"
        onChange={handleSearchChange}
      />
      <Divider />
      <div className={styles.tableWrapper}>
        <Table unstackable basic="very">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell width={4}>{t('common.name')}</Table.HeaderCell>
              <Table.HeaderCell width={4}>{t('common.username')}</Table.HeaderCell>
              <Table.HeaderCell width={4}>{t('common.email')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.apiKeyPrefix')}</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredUsers.map((user) => (
              <Item key={user.id} id={user.id} />
            ))}
          </Table.Body>
        </Table>
      </div>
      <div className={styles.actions}>
        <Button
          content={showOnlyWithKeys ? t('action.showAllUsers') : t('action.showOnlyWithApiKeys')}
          className={styles.toggleFilterButton}
          onClick={handleToggleFilterClick}
        />
      </div>
    </Tab.Pane>
  );
});

export default ApiKeysPane;
