module.exports = {
  sync: true,

  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    return inputs.record.toJSON ? inputs.record.toJSON() : inputs.record;
  },
};
