export const nextLocalId = (maxId = 0) => maxId + Date.now() / 10000000000000;

export const isLocalId = (id) => id % 1 !== 0;
