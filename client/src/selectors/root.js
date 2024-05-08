export const selectIsInitializing = ({ root: { isInitializing } }) => isInitializing;

export const selectConfig = ({ root: { config } }) => config;

export const selectOidcConfig = (state) => selectConfig(state).oidc;

export default {
  selectIsInitializing,
  selectConfig,
  selectOidcConfig,
};
