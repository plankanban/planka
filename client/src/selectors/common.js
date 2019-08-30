export const dbSelector = ({ db }) => db;

export const maxIdSelector = ({ db }, modelName) => db[modelName].meta.maxId;

export const accessTokenSelector = ({ auth: { accessToken } }) => accessToken;

export const isAppInitializingSelector = ({ app: { isInitializing } }) => isInitializing;
