/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

export const selectIsSocketDisconnected = ({ socket: { isDisconnected } }) => isDisconnected;

export const selectIsInitializing = ({ common: { isInitializing } }) => isInitializing;

export const selectConfig = ({ common: { config } }) => config;

export const selectOidcConfig = (state) => selectConfig(state).oidc;

export const selectActiveUsersLimit = (state) => selectConfig(state).activeUsersLimit;

export const selectAccessToken = ({ auth: { accessToken } }) => accessToken;

export const selectAuthenticateForm = ({ ui: { authenticateForm } }) => authenticateForm;

export const selectUserCreateForm = ({ ui: { userCreateForm } }) => userCreateForm;

export const selectProjectCreateForm = ({ ui: { projectCreateForm } }) => projectCreateForm;

export default {
  selectIsSocketDisconnected,
  selectIsInitializing,
  selectConfig,
  selectOidcConfig,
  selectActiveUsersLimit,
  selectAccessToken,
  selectAuthenticateForm,
  selectUserCreateForm,
  selectProjectCreateForm,
};
