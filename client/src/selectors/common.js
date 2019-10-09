export const accessTokenSelector = ({ auth: { accessToken } }) => accessToken;

export const isAppInitializingSelector = ({ app: { isInitializing } }) => isInitializing;
