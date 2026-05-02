/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import debounce from 'lodash/debounce';
import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';
import { useDidUpdate } from '../../../lib/hooks';
import { usePopup } from '../../../lib/popup';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useNestedRef } from '../../../hooks';
import { BoardViews } from '../../../constants/Enums';
import UserAvatar from '../../users/UserAvatar';
import BoardMembershipsStep from '../../board-memberships/BoardMembershipsStep';
import LabelChip from '../../labels/LabelChip';
import LabelsStep from '../../labels/LabelsStep';
import ListsFilterStep from '../../lists/ListsFilterStep';

import styles from './Filters.module.scss';

const FilterListChip = React.memo(({ id, onClick }) => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);
  const list = useSelector((state) => selectListById(state, id));
  const [t] = useTranslation();

  const handleClick = useCallback(() => {
    onClick(id);
  }, [id, onClick]);

  if (!list) {
    return null;
  }

  return (
    <button type="button" className={styles.filterButton} onClick={handleClick}>
      <span className={styles.filterLabel}>{list.name || t(`common.${list.type}`)}</span>
    </button>
  );
});

FilterListChip.propTypes = {
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

const Filters = React.memo(() => {
  const board = useSelector(selectors.selectCurrentBoard);
  const userIds = useSelector(selectors.selectFilterUserIdsForCurrentBoard);
  const labelIds = useSelector(selectors.selectFilterLabelIdsForCurrentBoard);
  const listIds = useSelector(selectors.selectFilterListIdsForCurrentBoard);
  const currentUserId = useSelector(selectors.selectCurrentUserId);

  const withCurrentUserSelector = useSelector(
    (state) => !!selectors.selectCurrentUserMembershipForCurrentBoard(state),
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [search, setSearch] = useState(board.search);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce((nextSearch) => {
        dispatch(entryActions.searchInCurrentBoard(nextSearch));
      }, 400),
    [dispatch],
  );

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  const cancelSearch = useCallback(() => {
    debouncedSearch.cancel();
    setSearch('');
    dispatch(entryActions.searchInCurrentBoard(''));
    searchFieldRef.current.blur();
  }, [dispatch, debouncedSearch, searchFieldRef]);

  const handleUserSelect = useCallback(
    (userId) => {
      dispatch(entryActions.addUserToFilterInCurrentBoard(userId));
    },
    [dispatch],
  );

  const handleCurrentUserSelect = useCallback(() => {
    dispatch(entryActions.addUserToFilterInCurrentBoard(currentUserId));
  }, [currentUserId, dispatch]);

  const handleUserDeselect = useCallback(
    (userId) => {
      dispatch(entryActions.removeUserFromFilterInCurrentBoard(userId));
    },
    [dispatch],
  );

  const handleUserClick = useCallback(
    ({
      currentTarget: {
        dataset: { id: userId },
      },
    }) => {
      dispatch(entryActions.removeUserFromFilterInCurrentBoard(userId));
    },
    [dispatch],
  );

  const handleLabelSelect = useCallback(
    (labelId) => {
      dispatch(entryActions.addLabelToFilterInCurrentBoard(labelId));
    },
    [dispatch],
  );

  const handleLabelDeselect = useCallback(
    (labelId) => {
      dispatch(entryActions.removeLabelFromFilterInCurrentBoard(labelId));
    },
    [dispatch],
  );

  const handleListSelect = useCallback(
    (listId) => {
      dispatch(entryActions.addListToFilterInCurrentBoard(listId));
    },
    [dispatch],
  );

  const handleListDeselect = useCallback(
    (listId) => {
      dispatch(entryActions.removeListFromFilterInCurrentBoard(listId));
    },
    [dispatch],
  );

  const handleLabelClick = useCallback(
    ({
      currentTarget: {
        dataset: { id: labelId },
      },
    }) => {
      dispatch(entryActions.removeLabelFromFilterInCurrentBoard(labelId));
    },
    [dispatch],
  );

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
    setSearch(board.search);
  }, [board.search]);

  const BoardMembershipsPopup = usePopup(BoardMembershipsStep);
  const LabelsPopup = usePopup(LabelsStep);
  const ListsFilterPopup = usePopup(ListsFilterStep);

  const isSearchActive = search || isSearchFocused;
  const isListView = board.view === BoardViews.LIST;

  return (
    <>
      <span className={styles.filter}>
        <BoardMembershipsPopup
          currentUserIds={userIds}
          title="common.filterByMembers"
          onUserSelect={handleUserSelect}
          onUserDeselect={handleUserDeselect}
        >
          <button type="button" className={styles.filterButton}>
            <span className={styles.filterTitle}>{`${t('common.members')}:`}</span>
            {userIds.length === 0 && <span className={styles.filterLabel}>{t('common.all')}</span>}
          </button>
        </BoardMembershipsPopup>
        {userIds.length === 0 && withCurrentUserSelector && (
          <button type="button" className={styles.filterButton} onClick={handleCurrentUserSelect}>
            <span className={styles.filterLabel}>
              <Icon fitted name="target" className={styles.filterLabelIcon} />
            </span>
          </button>
        )}
        {userIds.map((userId) => (
          <span key={userId} className={styles.filterItem}>
            <UserAvatar id={userId} size="tiny" onClick={handleUserClick} />
          </span>
        ))}
      </span>
      <span className={styles.filter}>
        <LabelsPopup
          currentIds={labelIds}
          title="common.filterByLabels"
          onSelect={handleLabelSelect}
          onDeselect={handleLabelDeselect}
        >
          <button type="button" className={styles.filterButton}>
            <span className={styles.filterTitle}>{`${t('common.labels')}:`}</span>
            {labelIds.length === 0 && <span className={styles.filterLabel}>{t('common.all')}</span>}
          </button>
        </LabelsPopup>
        {labelIds.map((labelId) => (
          <span key={labelId} className={styles.filterItem}>
            <LabelChip id={labelId} size="small" onClick={handleLabelClick} />
          </span>
        ))}
      </span>
      {isListView && (
        <span className={styles.filter}>
          <ListsFilterPopup
            currentIds={listIds}
            title="common.filterByLists"
            onSelect={handleListSelect}
            onDeselect={handleListDeselect}
          >
            <button type="button" className={styles.filterButton}>
              <span className={styles.filterTitle}>{`${t('common.lists')}:`}</span>
              {listIds.length === 0 && (
                <span className={styles.filterLabel}>{t('common.all')}</span>
              )}
            </button>
          </ListsFilterPopup>
          {listIds.map((listId) => (
            <FilterListChip key={listId} id={listId} onClick={handleListDeselect} />
          ))}
        </span>
      )}
      <span className={styles.filter}>
        <Input
          ref={handleSearchFieldRef}
          value={search}
          placeholder={t('common.searchCards')}
          maxLength={128}
          icon={
            isSearchActive ? (
              <Icon link name="cancel" onClick={handleCancelSearchClick} />
            ) : (
              'search'
            )
          }
          className={classNames(styles.search, !isSearchActive && styles.searchInactive)}
          onFocus={handleSearchFocus}
          onKeyDown={handleSearchKeyDown}
          onChange={handleSearchChange}
          onBlur={handleSearchBlur}
        />
      </span>
    </>
  );
});

export default Filters;
