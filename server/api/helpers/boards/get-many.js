module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      custom: (value) => _.isArray(value) || _.isPlainObject(value),
    },
  },

  async fn(inputs) {
    return Board.find(inputs.criteria).sort('position');
  },
};
