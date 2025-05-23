/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import debounce from 'lodash/debounce';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';
import { useDidUpdate } from '../../../lib/hooks';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useNestedRef } from '../../../hooks';

import styles from './Filters.module.scss';

const Filters = React.memo(() => {
  const defaultSearch = useSelector(selectors.selectProjectsSearch);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [search, setSearch] = useState(defaultSearch);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce((nextSearch) => {
        dispatch(entryActions.searchProjects(nextSearch));
      }, 400),
    [dispatch],
  );

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  const cancelSearch = useCallback(() => {
    debouncedSearch.cancel();
    setSearch('');
    dispatch(entryActions.searchProjects(''));
    searchFieldRef.current.blur();
  }, [dispatch, debouncedSearch, searchFieldRef]);

  const handleSearchChange = useCallback(
    (_, { value }) => {
      setSearch(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        cancelSearch();
      }
    },
    [cancelSearch],
  );

  const handleSearchBlur = useCallback(() => {
    setIsSearchFocused(false);
  }, []);

  const handleCancelSearchClick = useCallback(() => {
    cancelSearch();
  }, [cancelSearch]);

  useDidUpdate(() => {
    setSearch(defaultSearch);
  }, [defaultSearch]);

  const isSearchActive = search || isSearchFocused;

  return (
    <Input
      ref={handleSearchFieldRef}
      value={search}
      placeholder={t('common.searchProjects')}
      maxLength={128}
      icon={
        isSearchActive ? <Icon link name="cancel" onClick={handleCancelSearchClick} /> : 'search'
      }
      className={classNames(styles.search, !isSearchActive && styles.searchInactive)}
      onFocus={handleSearchFocus}
      onKeyDown={handleSearchKeyDown}
      onChange={handleSearchChange}
      onBlur={handleSearchBlur}
    />
  );
});

export default Filters;
