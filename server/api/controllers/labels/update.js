const Errors = {
  LABEL_NOT_FOUND: {
    labelNotFound: 'Label not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    color: {
      type: 'string',
      isIn: Label.COLORS,
      required: true,
    },
  },

  exits: {
    labelNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const labelToProjectPath = await sails.helpers
      .getLabelToProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.LABEL_NOT_FOUND);

    let { label } = labelToProjectPath;
    const { project } = labelToProjectPath;

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
    );

    if (!isUserMemberForProject) {
      throw Errors.LABEL_NOT_FOUND; // Forbidden
    }

    const values = _.pick(inputs, ['name', 'color']);
    label = await sails.helpers.updateLabel(label, values, this.req);

    return exits.success({
      item: label,
    });
  },
};
