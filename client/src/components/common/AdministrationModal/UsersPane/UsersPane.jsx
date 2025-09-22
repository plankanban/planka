/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Tab, Table } from 'semantic-ui-react';
import { Input } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import { useField, useNestedRef, usePopupInClosableContext } from '../../../../hooks';
import Item from './Item';
import AddStep from './AddStep';

import styles from './UsersPane.module.scss';

const UsersPane = React.memo(() => {
  const activeUsersLimit = useSelector(selectors.selectActiveUsersLimit);
  const users = useSelector(selectors.selectUsersExceptCurrent);
  const activeUsersTotal = useSelector(selectors.selectActiveUsersTotal);

  const canAdd = useSelector((state) => {
    const oidcBootstrap = selectors.selectOidcBootstrap(state);
    return !oidcBootstrap || !oidcBootstrap.isEnforced;
  });

  const [t] = useTranslation();

  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const [isDeactivatedVisible, setIsDeactivatedVisible] = useState(false); // TODO: refactor?

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        if (isDeactivatedVisible) {
          if (!user.isDeactivated) {
            return false;
          }
        } else if (user.isDeactivated) {
          return false;
        }

        return (
          user.email.includes(cleanSearch) ||
          user.name.toLowerCase().includes(cleanSearch) ||
          (user.username && user.username.includes(cleanSearch))
        );
      }),
    [users, isDeactivatedVisible, cleanSearch],
  );

  const handleToggleDeactivatedClick = useCallback(() => {
    setIsDeactivatedVisible(!isDeactivatedVisible);
  }, [isDeactivatedVisible]);

  useEffect(() => {
    searchFieldRef.current.focus();
  }, [searchFieldRef]);

  const AddPopup = usePopupInClosableContext(AddStep);

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
              <Table.HeaderCell>{t('common.role')}</Table.HeaderCell>
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
          content={isDeactivatedVisible ? t('action.showActive') : t('action.showDeactivated')}
          className={styles.toggleDeactivatedButton}
          onClick={handleToggleDeactivatedClick}
        />

        {canAdd && (
          <AddPopup>
            <Button
              positive
              disabled={activeUsersLimit !== null && activeUsersTotal >= activeUsersLimit}
              className={styles.addButton}
            >
              {t('action.addUser')}
              {activeUsersLimit !== null && (
                <span className={styles.addButtonCounter}>
                  {activeUsersTotal}/{activeUsersLimit}
                </span>
              )}
            </Button>
          </AddPopup>
        )}
      </div>
    </Tab.Pane>
  );
});

export default UsersPane;
