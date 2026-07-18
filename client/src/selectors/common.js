/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export const selectIsSocketDisconnected = ({ socket: { isDisconnected } }) => isDisconnected;

export const selectIsInitializing = ({ common: { isInitializing } }) => isInitializing;

export const selectBootstrap = ({ common: { bootstrap } }) => bootstrap;

export const selectOidcBootstrap = (state) => selectBootstrap(state).oidc;

export const selectActiveUsersLimit = (state) => selectBootstrap(state).activeUsersLimit;

export const selectGoogleMapsApiKey = (state) => selectBootstrap(state).googleMapsApiKey || null;

export const selectIsLocationEnabled = (state) => selectBootstrap(state).isLocationEnabled || false;

export const selectAccessToken = ({ auth: { accessToken } }) => accessToken;

export const selectAuthenticateForm = ({ ui: { authenticateForm } }) => authenticateForm;

export const selectUserCreateForm = ({ ui: { userCreateForm } }) => userCreateForm;

export const selectProjectCreateForm = ({ ui: { projectCreateForm } }) => projectCreateForm;

export const selectSmtpTestState = ({ ui: { smtpTestState } }) => smtpTestState;

export const selectLocationSearch = ({ ui: { locationSearch } }) => locationSearch;

export default {
  selectIsSocketDisconnected,
  selectIsInitializing,
  selectBootstrap,
  selectOidcBootstrap,
  selectActiveUsersLimit,
  selectGoogleMapsApiKey,
  selectIsLocationEnabled,
  selectAccessToken,
  selectAuthenticateForm,
  selectUserCreateForm,
  selectProjectCreateForm,
  selectSmtpTestState,
  selectLocationSearch,
};
