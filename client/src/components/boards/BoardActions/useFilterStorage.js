/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// LocalStorage helpers behind the two filter-recall behaviours:
//
//   • "last filter" — clearing the whole filter via the X leaves a
//     snapshot here, so the next click of the restore button can put
//     it back.
//   • "saved filters" — named filter recipes, per user and per board.
//
// NOTHING IN HERE IS EVER APPLIED ON ITS OWN. There is no effect that
// reads a stored filter when a board opens; every read below happens
// inside a click handler, or to decide whether a button is worth
// rendering. That restraint is what makes localStorage the right home
// for this: two windows on the same board hold their own live filter
// (which still lives on the Board model in redux-orm and still travels
// over the existing entry actions) and neither one is ever overwritten
// by what the other stashed away.
//
// The keys and the `{ userIds, labelIds, search }` core of the payload
// are deliberately identical to PLANKA Pro's, so a user's saved filters
// survive an upgrade: same origin, same database, same user ids.
// Community's own filter dimensions are stored alongside as extra
// fields, which Pro simply reads as absent.

const LAST_KEY_PREFIX = 'planka:filter:last';
const SAVED_KEY_PREFIX = 'planka:filter:saved';

const buildKey = (prefix, userId, boardId) => {
  if (!userId || !boardId) {
    return null;
  }

  return `${prefix}:${userId}:${boardId}`;
};

// Stable-ish id for a saved filter. It doesn't need to be globally
// unique — just unique inside one (user, board) bucket. Time plus a
// short random suffix is plenty, and reads cleanly when inspecting
// localStorage by hand.
const createSavedFilterId = () => {
  const time = Date.now().toString(36);

  const random = Math.floor(Math.random() * 1e6)
    .toString(36)
    .padStart(4, '0');

  return `f-${time}-${random}`;
};

// A filter worth remembering. Every dimension Community can filter on
// counts, including the ones Pro has no equivalent for — otherwise a
// "cards without a member" filter could never be saved.
const isFilterMeaningful = (filter) =>
  !!filter &&
  ((filter.userIds && filter.userIds.length > 0) ||
    (filter.labelIds && filter.labelIds.length > 0) ||
    (filter.excludedLabelIds && filter.excludedLabelIds.length > 0) ||
    (filter.listIds && filter.listIds.length > 0) ||
    !!filter.noMember ||
    (filter.search && filter.search.length > 0));

// One shape for both buckets. `userIds` / `labelIds` / `search` are the
// fields Pro reads; the rest are Community-only and additive.
const normalizeFilter = (filter) => ({
  userIds: filter.userIds || [],
  labelIds: filter.labelIds || [],
  search: filter.search || '',
  excludedLabelIds: filter.excludedLabelIds || [],
  listIds: filter.listIds || [],
  noMember: !!filter.noMember,
});

export const readLastFilter = (userId, boardId) => {
  const key = buildKey(LAST_KEY_PREFIX, userId, boardId);

  if (!key) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    return isFilterMeaningful(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const writeLastFilter = (userId, boardId, filter) => {
  const key = buildKey(LAST_KEY_PREFIX, userId, boardId);

  if (!key) {
    return;
  }

  try {
    if (isFilterMeaningful(filter)) {
      window.localStorage.setItem(key, JSON.stringify(normalizeFilter(filter)));
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Storage may be full, blocked (private mode), or otherwise
    // unavailable. The feature degrades silently — worst case the user
    // just doesn't get the recall behaviour.
  }
};

export const clearLastFilter = (userId, boardId) => {
  const key = buildKey(LAST_KEY_PREFIX, userId, boardId);

  if (!key) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // See writeLastFilter.
  }
};

// A list of { id, name, ...filter } per (user, board). The id is local
// to this bucket and lets us address one entry for removal. Order:
// most recently saved first, so the user's last save is easy to spot.
export const readSavedFilters = (userId, boardId) => {
  const key = buildKey(SAVED_KEY_PREFIX, userId, boardId);

  if (!key) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (entry) =>
        entry &&
        typeof entry.id === 'string' &&
        typeof entry.name === 'string' &&
        isFilterMeaningful(entry),
    );
  } catch {
    return [];
  }
};

const writeSavedFilters = (userId, boardId, entries) => {
  const key = buildKey(SAVED_KEY_PREFIX, userId, boardId);

  if (!key) {
    return;
  }

  try {
    if (entries.length > 0) {
      window.localStorage.setItem(key, JSON.stringify(entries));
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // See writeLastFilter.
  }
};

export const addSavedFilter = (userId, boardId, { name, ...filter }) => {
  if (!userId || !boardId) {
    return null;
  }

  const cleanName = name.trim();

  if (!cleanName) {
    return null;
  }

  const cleanFilter = normalizeFilter(filter);

  if (!isFilterMeaningful(cleanFilter)) {
    return null;
  }

  const entry = {
    id: createSavedFilterId(),
    name: cleanName,
    ...cleanFilter,
  };

  const current = readSavedFilters(userId, boardId);

  // Newest first, and re-saving under an existing name overwrites that
  // entry rather than adding a duplicate.
  writeSavedFilters(userId, boardId, [entry, ...current.filter((item) => item.name !== cleanName)]);

  return entry;
};

export const removeSavedFilter = (userId, boardId, id) => {
  const current = readSavedFilters(userId, boardId);

  writeSavedFilters(
    userId,
    boardId,
    current.filter((entry) => entry.id !== id),
  );
};
