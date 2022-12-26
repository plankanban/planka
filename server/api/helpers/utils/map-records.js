const recordsValidator = (value) => _.isArray(value);

module.exports = {
  sync: true,

  inputs: {
    records: {
      type: 'ref',
      custom: recordsValidator,
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
