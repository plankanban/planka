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

import styles from './ListsFilterStep.module.scss';

const ListsFilterStep = React.memo(({ currentIds, title, onSelect, onDeselect, onBack }) => {
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
                isActive={currentIds.includes(list.id)}
                onSelect={onSelect}
                onDeselect={onDeselect}
              />
            ))}
          </div>
        )}
      </Popup.Content>
    </>
  );
});

ListsFilterStep.propTypes = {
  currentIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  title: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

ListsFilterStep.defaultProps = {
  title: 'common.filterByLists',
  onBack: undefined,
};

export default ListsFilterStep;
