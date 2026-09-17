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
import { Input, Tooltip } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useNestedRef } from '../../../hooks';
import { BoardViews, LabelFilterModes } from '../../../constants/Enums';
import UserAvatar from '../../users/UserAvatar';
import BoardMembershipsStep from '../../board-memberships/BoardMembershipsStep';
import LabelChip from '../../labels/LabelChip';
import LabelsStep from '../../labels/LabelsStep';
import ListsFilterStep from '../../lists/ListsFilterStep';
import SaveFilterStep from './SaveFilterStep';
import SavedFiltersStep from './SavedFiltersStep';
import {
  addSavedFilter,
  clearLastFilter,
  readLastFilter,
  readSavedFilters,
  removeSavedFilter,
  writeLastFilter,
} from './useFilterStorage';

import styles from './Filters.module.scss';

// Membership comparison — order carries no meaning for a filter selection.
const sameIds = (a, b) => a.length === b.length && a.every((id) => b.includes(id));

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
  const excludedLabelIds = useSelector(selectors.selectFilterExcludedLabelIdsForCurrentBoard);
  const listIds = useSelector(selectors.selectFilterListIdsForCurrentBoard);
  const currentUserId = useSelector(selectors.selectCurrentUserId);

  const withCurrentUserSelector = useSelector(
    (state) => !!selectors.selectCurrentUserMembershipForCurrentBoard(state),
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [search, setSearch] = useState(board.search);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  // Cache-buster for the two localStorage buckets below. Bumping it after a
  // write re-runs the memos that read them, which is all the syncing they
  // need — nothing here watches storage, so another window's snapshot never
  // arrives uninvited.
  const [storageRev, setStorageRev] = useState(0);

  const debouncedSearch = useMemo(
    () =>
      debounce((nextSearch) => {
        dispatch(entryActions.searchInCurrentBoard(nextSearch));
      }, 400),
    [dispatch],
  );

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  const labelModes = useMemo(
    () => ({
      ...labelIds.reduce(
        (result, labelId) => ({
          ...result,
          [labelId]: LabelFilterModes.INCLUDE,
        }),
        {},
      ),
      ...excludedLabelIds.reduce(
        (result, labelId) => ({
          ...result,
          [labelId]: LabelFilterModes.EXCLUDE,
        }),
        {},
      ),
    }),
    [labelIds, excludedLabelIds],
  );

  // Everything the board is currently filtered by, in the shape the storage
  // helpers read and write.
  const currentFilter = useMemo(
    () => ({
      userIds,
      labelIds,
      search: board.search || '',
      excludedLabelIds,
      listIds,
      noMember: !!board.filterNoMember,
    }),
    [board.filterNoMember, board.search, excludedLabelIds, labelIds, listIds, userIds],
  );

  const hasFilter =
    userIds.length > 0 ||
    labelIds.length > 0 ||
    excludedLabelIds.length > 0 ||
    listIds.length > 0 ||
    !!board.filterNoMember ||
    currentFilter.search.length > 0;

  const savedFilters = useMemo(
    () => readSavedFilters(currentUserId, board.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [board.id, currentUserId, storageRev],
  );

  // Only looked up while the board is unfiltered, and only to decide whether
  // the restore button is worth showing. Reading it never applies it.
  const lastFilter = useMemo(
    () => (hasFilter ? null : readLastFilter(currentUserId, board.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [board.id, currentUserId, hasFilter, storageRev],
  );

  // Which saved filter, if any, matches the board exactly. Drives both the
  // highlight in the list and the second-click-to-deactivate behaviour.
  const activeSavedFilterId = useMemo(() => {
    const match = savedFilters.find(
      (item) =>
        sameIds(item.userIds || [], currentFilter.userIds) &&
        sameIds(item.labelIds || [], currentFilter.labelIds) &&
        sameIds(item.excludedLabelIds || [], currentFilter.excludedLabelIds) &&
        sameIds(item.listIds || [], currentFilter.listIds) &&
        !!item.noMember === currentFilter.noMember &&
        (item.search || '') === currentFilter.search,
    );

    return match && match.id;
  }, [currentFilter, savedFilters]);

  // Taking a filter apart chip by chip says "these values are not what I
  // want", so every such deselect drops the recall snapshot. Only the clear
  // button, which sets the snapshot on its way out, preserves it.
  const invalidateLastFilter = useCallback(() => {
    clearLastFilter(currentUserId, board.id);
    setStorageRev((prevStorageRev) => prevStorageRev + 1);
  }, [board.id, currentUserId]);

  const cancelSearch = useCallback(() => {
    debouncedSearch.cancel();
    setSearch('');
    dispatch(entryActions.searchInCurrentBoard(''));
    invalidateLastFilter();
    searchFieldRef.current.blur();
  }, [dispatch, debouncedSearch, invalidateLastFilter, searchFieldRef]);

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
      invalidateLastFilter();
    },
    [dispatch, invalidateLastFilter],
  );

  const handleUserClick = useCallback(
    ({
      currentTarget: {
        dataset: { id: userId },
      },
    }) => {
      dispatch(entryActions.removeUserFromFilterInCurrentBoard(userId));
      invalidateLastFilter();
    },
    [dispatch, invalidateLastFilter],
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
      invalidateLastFilter();
    },
    [dispatch, invalidateLastFilter],
  );

  const handleLabelClick = useCallback(
    ({
      currentTarget: {
        dataset: { id: labelId },
      },
    }) => {
      dispatch(entryActions.updateLabelFilterInCurrentBoard(labelId, LabelFilterModes.NONE));
      invalidateLastFilter();
    },
    [dispatch, invalidateLastFilter],
  );

  const handleLabelModeChange = useCallback(
    (labelId, mode) => {
      dispatch(entryActions.updateLabelFilterInCurrentBoard(labelId, mode));

      // Switching a label between include and exclude is still filtering;
      // only dropping it altogether counts as a deselect.
      if (mode === LabelFilterModes.NONE) {
        invalidateLastFilter();
      }
    },
    [dispatch, invalidateLastFilter],
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

  const handleNoMemberClick = useCallback(() => {
    if (board.filterNoMember) {
      dispatch(entryActions.removeNoMemberFromFilterInCurrentBoard());
      invalidateLastFilter();
    } else {
      dispatch(entryActions.setNoMemberToFilterInCurrentBoard());
    }
  }, [board.filterNoMember, dispatch, invalidateLastFilter]);

  // Take the board back to unfiltered, one existing entry action per
  // dimension — the same path the controls above use, so other sessions see
  // it exactly as they always have.
  const clearCurrentFilter = useCallback(() => {
    userIds.forEach((userId) => {
      dispatch(entryActions.removeUserFromFilterInCurrentBoard(userId));
    });

    [...labelIds, ...excludedLabelIds].forEach((labelId) => {
      dispatch(entryActions.updateLabelFilterInCurrentBoard(labelId, LabelFilterModes.NONE));
    });

    listIds.forEach((listId) => {
      dispatch(entryActions.removeListFromFilterInCurrentBoard(listId));
    });

    if (board.filterNoMember) {
      dispatch(entryActions.removeNoMemberFromFilterInCurrentBoard());
    }

    debouncedSearch.cancel();
    setSearch('');

    if (board.search) {
      dispatch(entryActions.searchInCurrentBoard(''));
    }
  }, [
    board.filterNoMember,
    board.search,
    debouncedSearch,
    dispatch,
    excludedLabelIds,
    labelIds,
    listIds,
    userIds,
  ]);

  // The mirror image, used by both the restore button and the saved-filter
  // list. "No member" goes first because setting it clears the member
  // selection, which would otherwise undo the users we just added.
  const applyFilter = useCallback(
    (filter) => {
      if (filter.noMember) {
        dispatch(entryActions.setNoMemberToFilterInCurrentBoard());
      }

      (filter.userIds || []).forEach((userId) => {
        dispatch(entryActions.addUserToFilterInCurrentBoard(userId));
      });

      (filter.labelIds || []).forEach((labelId) => {
        dispatch(entryActions.updateLabelFilterInCurrentBoard(labelId, LabelFilterModes.INCLUDE));
      });

      (filter.excludedLabelIds || []).forEach((labelId) => {
        dispatch(entryActions.updateLabelFilterInCurrentBoard(labelId, LabelFilterModes.EXCLUDE));
      });

      (filter.listIds || []).forEach((listId) => {
        dispatch(entryActions.addListToFilterInCurrentBoard(listId));
      });

      if (filter.search) {
        debouncedSearch.cancel();
        setSearch(filter.search);
        dispatch(entryActions.searchInCurrentBoard(filter.search));
      }
    },
    [debouncedSearch, dispatch],
  );

  // Clearing everything at once leaves the snapshot behind, so the very next
  // click of the restore button can put it back.
  const handleClearClick = useCallback(() => {
    writeLastFilter(currentUserId, board.id, currentFilter);
    clearCurrentFilter();
    setStorageRev((prevStorageRev) => prevStorageRev + 1);
  }, [board.id, clearCurrentFilter, currentFilter, currentUserId]);

  const handleRestoreClick = useCallback(() => {
    if (lastFilter) {
      applyFilter(lastFilter);
    }
  }, [applyFilter, lastFilter]);

  // Saved filters replace rather than merge. Picking the one already on the
  // board turns it off instead, so the same row toggles both ways.
  const handleSavedFilterApply = useCallback(
    (item) => {
      clearCurrentFilter();

      if (item.id !== activeSavedFilterId) {
        applyFilter(item);
      }
    },
    [activeSavedFilterId, applyFilter, clearCurrentFilter],
  );

  const handleSavedFilterRemove = useCallback(
    (id) => {
      removeSavedFilter(currentUserId, board.id, id);
      setStorageRev((prevStorageRev) => prevStorageRev + 1);
    },
    [board.id, currentUserId],
  );

  const handleSaveFilter = useCallback(
    (name) => {
      addSavedFilter(currentUserId, board.id, {
        name,
        ...currentFilter,
      });

      setStorageRev((prevStorageRev) => prevStorageRev + 1);
    },
    [board.id, currentFilter, currentUserId],
  );

  useDidUpdate(() => {
    setSearch(board.search);
  }, [board.search]);

  const BoardMembershipsPopup = usePopup(BoardMembershipsStep);
  const LabelsPopup = usePopup(LabelsStep);
  const ListsFilterPopup = usePopup(ListsFilterStep);
  const SaveFilterPopup = usePopup(SaveFilterStep);
  const SavedFiltersPopup = usePopup(SavedFiltersStep);

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
        <button
          type="button"
          className={classNames(styles.filterButton, styles.filterLabel)}
          onClick={handleNoMemberClick}
        >
          {t('common.noMember')}
        </button>
        {userIds.length === 0 && withCurrentUserSelector && (
          <Tooltip content={t('action.filterByCurrentUser')}>
            <button type="button" className={styles.filterButton} onClick={handleCurrentUserSelect}>
              <span className={styles.filterLabel}>
                <Icon fitted name="target" className={styles.filterLabelIcon} />
              </span>
            </button>
          </Tooltip>
        )}
        {userIds.map((userId) => (
          <span key={userId} className={styles.filterItem}>
            <UserAvatar id={userId} size="tiny" onClick={handleUserClick} />
          </span>
        ))}
      </span>
      <span className={styles.filter}>
        <LabelsPopup
          currentIds={[]}
          currentModes={labelModes}
          isFilterModeEnabled
          title="common.filterByLabels"
          onModeChange={handleLabelModeChange}
        >
          <button type="button" className={styles.filterButton}>
            <span className={styles.filterTitle}>{`${t('common.labels')}:`}</span>
            {labelIds.length === 0 && excludedLabelIds.length === 0 && (
              <span className={styles.filterLabel}>{t('common.all')}</span>
            )}
          </button>
        </LabelsPopup>
        {labelIds.map((labelId) => (
          <span key={labelId} className={styles.filterItem}>
            <LabelChip id={labelId} size="small" onClick={handleLabelClick} />
          </span>
        ))}
        {excludedLabelIds.map((labelId) => (
          <span key={labelId} className={styles.filterItem}>
            <LabelChip id={labelId} size="small" isExcluded onClick={handleLabelClick} />
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
      <span className={styles.filter}>
        {hasFilter && (
          <Tooltip content={t('common.clearFilter')}>
            <button type="button" className={styles.filterButton} onClick={handleClearClick}>
              <span className={styles.filterLabel}>
                <Icon fitted name="close" className={styles.filterLabelIcon} />
              </span>
            </button>
          </Tooltip>
        )}
        {/* Takes the place of the clear button once the filter is gone, and
            only while there is something to put back. */}
        {!hasFilter && !!lastFilter && (
          <Tooltip content={t('common.restoreFilter')}>
            <button type="button" className={styles.filterButton} onClick={handleRestoreClick}>
              <span className={styles.filterLabel}>
                <Icon fitted name="undo" className={styles.filterLabelIcon} />
              </span>
            </button>
          </Tooltip>
        )}
        {/* No Tooltip around either popup trigger: usePopup clones its
            immediate child to attach the click handler, so anything wrapped
            around the button swallows the open. */}
        {hasFilter && (
          <SaveFilterPopup onSave={handleSaveFilter}>
            <button
              type="button"
              title={t('common.saveFilter', {
                context: 'title',
              })}
              className={styles.filterButton}
            >
              <span className={styles.filterLabel}>
                <Icon fitted name="bookmark outline" className={styles.filterLabelIcon} />
              </span>
            </button>
          </SaveFilterPopup>
        )}
        <SavedFiltersPopup
          items={savedFilters}
          activeId={activeSavedFilterId}
          onApply={handleSavedFilterApply}
          onRemove={handleSavedFilterRemove}
        >
          <button
            type="button"
            title={t('common.savedFilters', {
              context: 'title',
            })}
            className={styles.filterButton}
          >
            <span className={styles.filterLabel}>
              <Icon fitted name="bookmark" className={styles.filterLabelIcon} />
            </span>
          </button>
        </SavedFiltersPopup>
      </span>
    </>
  );
});

export default Filters;
