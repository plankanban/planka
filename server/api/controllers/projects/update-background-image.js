const Errors = {
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
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
    projectNotFound: {
      responseType: 'notFound',
    },
    uploadError: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    let project = await Project.findOne(inputs.id);

    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    this.req
      .file('file')
      .upload(sails.helpers.createProjectBackgroundImageReceiver(), async (error, files) => {
        if (error) {
          return exits.uploadError(error.message);
        }

        if (files.length === 0) {
          return exits.uploadError('No file was uploaded');
        }

        project = await sails.helpers.updateProject(
          project,
          {
            backgroundImageDirname: files[0].extra.dirname,
          },
          this.req,
        );

        if (!project) {
          throw Errors.PROJECT_NOT_FOUND;
        }

        return exits.success({
          item: project.toJSON(),
        });
      });
  },
};
