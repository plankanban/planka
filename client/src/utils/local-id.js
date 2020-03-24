export const createLocalId = () => `local:${Date.now()}`;

export const isLocalId = (id) => id.startsWith('local:');
