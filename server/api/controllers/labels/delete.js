const Errors = {
  LABEL_NOT_FOUND: {
    notFound: 'Label is not found'
  }
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
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

    label = await sails.helpers.deleteLabel(label, this.req);

    if (!label) {
      throw Errors.LABEL_NOT_FOUND;
    }

    return exits.success({
      item: label
    });
  }
};
