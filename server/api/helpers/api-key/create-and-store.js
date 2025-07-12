const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const { idInput } = require('../../../utils/inputs');

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
    cycle: { type: 'boolean', defaultsTo: false },
  },

  exits: {
    userNotFound: {},
    alreadyExists: {},
    doesNotExist: {},
  },

  async fn(inputs) {
    const { id, cycle } = inputs;

    const user = await User.findOne({ id });
    if (!user) throw 'userNotFound';
    if (user.apiKeyHash && !cycle) throw 'alreadyExists';
    if (!user.apiKeyHash && cycle) throw 'doesNotExist';

    const prefix = `${Number(id).toString(36).padStart(8, '0')}${crypto
      .randomBytes(4)
      .toString('hex')}`;

    const rawKey = `${prefix}.${uuidv4().replace(
      /-/g,
      '',
    )}${crypto.randomBytes(16).toString('hex')}`;

    const hash = await bcrypt.hash(rawKey, 12);

    await User.updateOne({ id }).set({
      apiKeyPrefix: prefix,
      apiKeyHash: hash,
    });

    return { apiKey: rawKey };
  },
};
