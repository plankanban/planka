module.exports = {
  inputs: {
    bindings: {
      type: 'ref',
      required: true,
    },
    attributes: {
      type: 'ref',
      required: true,
    },
  },

  async fn({ bindings, attributes }) {
    const values = { password: 'SSO' };

    if ('email' in bindings) {
      [values.email] = attributes[bindings.email];
    }

    if ('full_name' in bindings) {
      [values.name] = attributes[bindings.full_name];
    } else if ('first_name' in bindings && 'last_name' in bindings) {
      values.name = `${attributes[bindings.first_name][0]} ${attributes[bindings.last_name][0]}`;
    }

    if ('username' in bindings) {
      [values.username] = attributes[bindings.username];
    }

    if ('admin' in bindings) {
      values.isAdmin = _.includes(attributes[bindings.admin[0]], bindings.admin[1]);
    }

    return values;
  },
};
