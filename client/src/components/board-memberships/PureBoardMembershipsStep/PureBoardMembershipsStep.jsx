/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import orderBy from 'lodash/orderBy';
import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Menu } from 'semantic-ui-react';
import { Input, Popup } from '../../../lib/custom-ui';

import { useField, useNestedRef } from '../../../hooks';
import Item from './Item';

import styles from './PureBoardMembershipsStep.module.scss';

const PureBoardMembershipsStep = React.memo(
  ({
    items,
    currentUserIds,
    title,
    clearButtonContent,
    onUserSelect,
    onUserDeselect,
    onClear,
    onBack,
  }) => {
    const [t] = useTranslation();
    const [search, handleSearchChange] = useField('');
    const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

    const filteredItems = useMemo(
      () =>
        orderBy(
          items.filter(
            ({ user }) =>
              user.name.toLowerCase().includes(cleanSearch) ||
              (user.username && user.username.includes(cleanSearch)),
          ),
          ({ user }) => user.name.toLowerCase(),
        ),
      [items, cleanSearch],
    );

    const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

    useEffect(() => {
      searchFieldRef.current.focus({
        preventScroll: true,
      });
    }, [searchFieldRef]);

    return (
      <>
        <Popup.Header onBack={onBack}>
          {t(title, {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <Input
            fluid
            ref={handleSearchFieldRef}
            value={search}
            placeholder={t('common.searchMembers')}
            maxLength={128}
            icon="search"
            onChange={handleSearchChange}
          />
          {filteredItems.length > 0 && (
            <Menu secondary vertical className={styles.menu}>
              {filteredItems.map((boardMembership) => (
                <Item
                  key={boardMembership.id}
                  id={boardMembership.id}
                  isActive={currentUserIds.includes(boardMembership.user.id)}
                  onUserSelect={onUserSelect}
                  onUserDeselect={onUserDeselect}
                />
              ))}
            </Menu>
          )}
          {currentUserIds.length > 0 && onClear && (
            <Button
              fluid
              content={t(clearButtonContent)}
              className={styles.clearButton}
              onClick={onClear}
            />
          )}
        </Popup.Content>
      </>
    );
  },
);

PureBoardMembershipsStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  items: PropTypes.array.isRequired,
  currentUserIds: PropTypes.array,
  /* eslint-enable react/forbid-prop-types */
  title: PropTypes.string,
  clearButtonContent: PropTypes.string,
  onUserSelect: PropTypes.func.isRequired,
  onUserDeselect: PropTypes.func,
  onClear: PropTypes.func,
  onBack: PropTypes.func,
};

PureBoardMembershipsStep.defaultProps = {
  currentUserIds: [],
  title: 'common.members',
  clearButtonContent: 'action.clear',
  onUserDeselect: undefined,
  onClear: undefined,
  onBack: undefined,
};

export default PureBoardMembershipsStep;
