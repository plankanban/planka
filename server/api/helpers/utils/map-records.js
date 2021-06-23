module.exports = {
  sync: true,

  inputs: {
    records: {
      type: 'ref',
      custom: (value) => _.isArray(value),
      required: true,
    },
    attribute: {
      type: 'string',
      defaultsTo: 'id',
    },
    unique: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  fn(inputs) {
    let result = _.map(inputs.records, inputs.attribute);
    if (inputs.unique) {
      result = _.uniq(result);
    }

    return result;
  },
};
