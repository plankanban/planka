module.exports = {
  inputs: {
    color: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs, exits) {
    switch (inputs.color) {
      case 'green':
        return exits.success('bright-moss');
      case 'yellow':
        return exits.success('egg-yellow');
      case 'orange':
        return exits.success('pumpkin-orange');
      case 'red':
        return exits.success('berry-red');
      case 'purple':
        return exits.success('red-burgundy');
      case 'blue':
        return exits.success('lagoon-blue');
      case 'sky':
        return exits.success('morning-sky');
      case 'lime':
        return exits.success('sunny-grass');
      case 'pink':
        return exits.success('pink-tulip');
      case 'black':
        return exits.success('dark-granite');
      default:
        return exits.success('berry-red');
    }
  },
};
