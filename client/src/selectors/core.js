/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export const selectIsContentFetching = ({ core: { isContentFetching } }) => isContentFetching;

export const selectIsLogouting = ({ core: { isLogouting } }) => isLogouting;

export const selectIsFavoritesEnabled = ({ core: { isFavoritesEnabled } }) => isFavoritesEnabled;

export const selectIsEditModeEnabled = ({ core: { isEditModeEnabled } }) => isEditModeEnabled;

export const selectConfig = ({ core: { config } }) => config;

export const selectRecentCardId = ({ core: { recentCardId } }) => recentCardId;

export const selectPrevCardId = ({ core: { prevCardIds } }) => prevCardIds.at(-1);

export const selectHomeView = ({ core: { homeView } }) => homeView;

export const selectProjectsSearch = ({ core: { projectsSearch } }) => projectsSearch;

export const selectProjectsOrder = ({ core: { projectsOrder } }) => projectsOrder;

export const selectIsHiddenProjectsVisible = ({ core: { isHiddenProjectsVisible } }) =>
  isHiddenProjectsVisible;

export default {
  selectIsContentFetching,
  selectIsLogouting,
  selectIsFavoritesEnabled,
  selectIsEditModeEnabled,
  selectConfig,
  selectRecentCardId,
  selectPrevCardId,
  selectHomeView,
  selectProjectsSearch,
  selectProjectsOrder,
  selectIsHiddenProjectsVisible,
};
