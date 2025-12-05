/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const BOARD_FILTERS_KEY = 'planka-board-filters';

export const getBoardFiltersFromStorage = (boardId) => {
  try {
    const storedFilters = localStorage.getItem(BOARD_FILTERS_KEY);
    if (!storedFilters) return { labels: [], users: [] };

    const filters = JSON.parse(storedFilters);
    return filters[boardId] || { labels: [], users: [] };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load board filters from localStorage:', error);
    return { labels: [], users: [] };
  }
};

export const saveBoardFiltersToStorage = (boardId, filters) => {
  try {
    const storedFilters = localStorage.getItem(BOARD_FILTERS_KEY);
    const allFilters = storedFilters ? JSON.parse(storedFilters) : {};

    allFilters[boardId] = filters;
    localStorage.setItem(BOARD_FILTERS_KEY, JSON.stringify(allFilters));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to save board filters to localStorage:', error);
  }
};

export const addLabelToBoardFilters = (boardId, labelId) => {
  const filters = getBoardFiltersFromStorage(boardId);
  if (!filters.labels.includes(labelId)) {
    filters.labels.push(labelId);
    saveBoardFiltersToStorage(boardId, filters);
  }
  return filters.labels;
};

export const removeLabelFromBoardFilters = (boardId, labelId) => {
  const filters = getBoardFiltersFromStorage(boardId);
  filters.labels = filters.labels.filter((id) => id !== labelId);
  saveBoardFiltersToStorage(boardId, filters);
  return filters.labels;
};

export const addUserToBoardFilters = (boardId, userId) => {
  const filters = getBoardFiltersFromStorage(boardId);
  if (!filters.users.includes(userId)) {
    filters.users.push(userId);
    saveBoardFiltersToStorage(boardId, filters);
  }
  return filters.users;
};

export const removeUserFromBoardFilters = (boardId, userId) => {
  const filters = getBoardFiltersFromStorage(boardId);
  filters.users = filters.users.filter((id) => id !== userId);
  saveBoardFiltersToStorage(boardId, filters);
  return filters.users;
};

export const clearBoardFilters = (boardId) => {
  try {
    const storedFilters = localStorage.getItem(BOARD_FILTERS_KEY);
    if (storedFilters) {
      const allFilters = JSON.parse(storedFilters);
      delete allFilters[boardId];
      localStorage.setItem(BOARD_FILTERS_KEY, JSON.stringify(allFilters));
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to clear board filters from localStorage:', error);
  }
};
