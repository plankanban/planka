const Errors = {
  PROJECT_MEMBERSHIP_NOT_FOUND: {
    notFound: 'Project membership is not found'
  }
};

module.exports = {
  inputs: {
    id: {
      type: 'number',
      required: true
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function(inputs, exits) {
    let projectMembership = await ProjectMembership.findOne(inputs.id);

    if (!projectMembership) {
      throw Errors.PROJECT_MEMBERSHIP_NOT_FOUND;
    }

    projectMembership = await sails.helpers.deleteProjectMembership(
      projectMembership,
      this.req
    );

    if (!projectMembership) {
      throw Errors.PROJECT_MEMBERSHIP_NOT_FOUND;
    }

    return exits.success({
      item: projectMembership
    });
  }
};
