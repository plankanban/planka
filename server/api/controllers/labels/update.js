const Errors = {
  LABEL_NOT_FOUND: {
    notFound: 'Label is not found'
  }
};

module.exports = {
  inputs: {
    id: {
      type: 'number',
      required: true
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true
    },
    color: {
      type: 'string',
      isIn: Label.COLORS,
      required: true
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function(inputs, exits) {
    const { currentUser } = this.req;

    let { label, project } = await sails.helpers
      .getLabelToProjectPath(inputs.id)
      .intercept('notFound', () => Errors.LABEL_NOT_FOUND);

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id
    );

    if (!isUserMemberForProject) {
      throw Errors.LABEL_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['name', 'color']);

    label = await sails.helpers.updateLabel(label, values, this.req);

    return exits.success({
      item: label
    });
  }
};
