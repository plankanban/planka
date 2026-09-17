/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// Local, per-user+card snapshot of an in-progress description edit, so an
// uncontrolled browser crash/close doesn't lose the draft. It never leaves the
// browser (no server write) and is keyed by user id so a shared machine can't
// surface one user's draft to another. Normal editor closes clear it — only a
// crash leaves it behind for recovery on the next open. The stored baseline is
// the description as it stood while the draft was being written, which lets the
// recovery flow detect that the card moved on underneath a stale draft.

const PREFIX = 'planka:descriptionDraft:';
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_SIZE = 2 * 1024 * 1024; // localStorage can't hold huge (image-heavy) drafts

const keyOf = (userId, cardId) => `${PREFIX}${userId}:${cardId}`;

export const saveDraftSnapshot = (userId, cardId, value, baseline) => {
  if (!userId || !cardId) {
    return;
  }

  try {
    if (!value || value.length > MAX_SIZE) {
      window.localStorage.removeItem(keyOf(userId, cardId));
      return;
    }

    window.localStorage.setItem(
      keyOf(userId, cardId),
      JSON.stringify({ value, baseline: baseline || null, savedAt: Date.now() }),
    );
  } catch {
    /* quota exceeded / serialization — snapshotting is best-effort */
  }
};

export const loadDraftSnapshot = (userId, cardId) => {
  if (!userId || !cardId) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(keyOf(userId, cardId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.value !== 'string' ||
      Date.now() - (parsed.savedAt || 0) > MAX_AGE
    ) {
      window.localStorage.removeItem(keyOf(userId, cardId));
      return null;
    }

    return parsed; // { value, baseline, savedAt }
  } catch {
    return null;
  }
};

export const clearDraftSnapshot = (userId, cardId) => {
  if (!userId || !cardId) {
    return;
  }

  try {
    window.localStorage.removeItem(keyOf(userId, cardId));
  } catch {
    /* ignore */
  }
};
