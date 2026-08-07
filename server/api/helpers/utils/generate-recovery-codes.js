/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const CODE_COUNT = 10;
const GROUP_LENGTH = 5;
const BCRYPT_ROUNDS = 10;

// Largest multiple of CHARS.length that fits in one byte — anything above it
// would skew the character distribution via the modulo, so we rejection-sample.
const MAX_UNBIASED_BYTE = Math.floor(256 / CHARS.length) * CHARS.length;

const pickUnbiasedByte = () => {
  // Loop bounded statistically: ~11% of bytes get rejected, so the expected
  // number of draws per character is ~1.125.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [byte] = crypto.randomBytes(1);
    if (byte < MAX_UNBIASED_BYTE) {
      return byte;
    }
  }
};

const generateCode = () => {
  let left = '';
  let right = '';
  for (let i = 0; i < GROUP_LENGTH; i += 1) {
    left += CHARS[pickUnbiasedByte() % CHARS.length];
    right += CHARS[pickUnbiasedByte() % CHARS.length];
  }
  return `${left}-${right}`;
};

module.exports = {
  inputs: {},

  async fn() {
    const plain = [];
    const hashed = [];

    for (let i = 0; i < CODE_COUNT; i += 1) {
      const code = generateCode();
      plain.push(code);
      // eslint-disable-next-line no-await-in-loop
      hashed.push(await bcrypt.hash(code, BCRYPT_ROUNDS));
    }

    return { plain, hashed };
  },
};
