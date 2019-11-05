const Errors = {
  LABEL_NOT_FOUND: {
    notFound: 'Label is not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    notFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const labelToProjectPath = await sails.helpers
      .getLabelToProjectPath(inputs.id)
      .intercept('notFound', () => Errors.LABEL_NOT_FOUND);

    let { label } = labelToProjectPath;
    const { project } = labelToProjectPath;

    const isUserMemberForProject = await sails.helpers.isUserMemberForProject(
      project.id,
      currentUser.id,
    );

    if (!isUserMemberForProject) {
      throw Errors.LABEL_NOT_FOUND; // Forbidden
    }

    label = await sails.helpers.deleteLabel(label, this.req);

    if (!label) {
      throw Errors.LABEL_NOT_FOUND;
    }

    return exits.success({
      item: label,
    });
  },
};
