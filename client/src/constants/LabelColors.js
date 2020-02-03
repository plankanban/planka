import fromPairs from 'lodash/fromPairs';

const PAIRS = [
  ['green', '#61bd4f'],
  ['yellow', '#f2d600'],
  ['orange', '#ff9f1a'],
  ['red', '#eb5a46'],
  ['purple', '#c377e0'],
  ['blue', '#0079bf'],
  ['sky', '#00c2e0'],
  ['lime', '#51e898'],
  ['pink', '#ff78cb'],
  ['black', '#355263'],
];

const KEYS = PAIRS.map(pair => pair[0]);

const MAP = fromPairs(PAIRS);

export default {
  PAIRS,
  KEYS,
  MAP,
};
