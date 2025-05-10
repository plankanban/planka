/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Input, Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import { useField, useNestedRef } from '../../../hooks';
import Item from './Item';

import styles from './ListsStep.module.scss';

const ListsStep = React.memo(({ currentId, onSelect }) => {
  const lists = useSelector(selectors.selectAvailableListsForCurrentBoard);

  const [t] = useTranslation();
  const [search, handleSearchChange] = useField('');
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  const filteredLists = useMemo(
    () =>
      lists.filter((list) =>
        (list.name ? list.name.toLowerCase() : list.type).includes(cleanSearch),
      ),
    [lists, cleanSearch],
  );

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  useEffect(() => {
    searchFieldRef.current.focus({
      preventScroll: true,
    });
  }, [searchFieldRef]);

  return (
    <>
      <Popup.Header>
        {t('common.lists', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Input
          fluid
          ref={handleSearchFieldRef}
          value={search}
          placeholder={t('common.searchLists')}
          maxLength={128}
          icon="search"
          onChange={handleSearchChange}
        />
        {filteredLists.length > 0 && (
          <div className={styles.items}>
            {filteredLists.map((list) => (
              <Item
                key={list.id}
                id={list.id}
                isActive={list.id === currentId}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </Popup.Content>
    </>
  );
});

ListsStep.propTypes = {
  currentId: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ListsStep;
