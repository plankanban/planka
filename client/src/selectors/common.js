export const accessTokenSelector = ({ auth: { accessToken } }) => accessToken;

export const isCoreInitializingSelector = ({ core: { isInitializing } }) => isInitializing;
