const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isNil(value.background) && !_.isPlainObject(value.background)) {
    return false;
  }

  if (!_.isNil(value.backgroundImage) && !_.isPlainObject(value.backgroundImage)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: valuesValidator,
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    backgroundImageInValuesMustNotBeNull: {},
  },

  async fn(inputs) {
    const { values } = inputs;

    if (values.backgroundImage) {
      values.background = {
        type: 'image',
      };
    } else if (
      _.isNull(values.backgroundImage) &&
      inputs.record.background &&
      inputs.record.background.type === 'image'
    ) {
      values.background = null;
    }

    let project;
    if (values.background && values.background.type === 'image') {
      if (_.isNull(values.backgroundImage)) {
        throw 'backgroundImageInValuesMustNotBeNull';
      }

      if (_.isUndefined(values.backgroundImage)) {
        project = await Project.updateOne({
          id: inputs.record.id,
          backgroundImage: {
            '!=': null,
          },
        }).set({ ...values });

        if (!project) {
          delete values.background;
        }
      }
    }

    if (!project) {
      project = await Project.updateOne(inputs.record.id).set({ ...values });
    }

    if (project) {
      if (
        inputs.record.backgroundImage &&
        (!project.backgroundImage ||
          project.backgroundImage.dirname !== inputs.record.backgroundImage.dirname)
      ) {
        const fileManager = sails.hooks['file-manager'].getInstance();

        try {
          await fileManager.deleteDir(
            `${sails.config.custom.projectBackgroundImagesPathSegment}/${inputs.record.backgroundImage.dirname}`,
          );
        } catch (error) {
          console.warn(error.stack); // eslint-disable-line no-console
        }
      }

      const projectRelatedUserIds = await sails.helpers.projects.getManagerAndBoardMemberUserIds(
        project.id,
      );

      projectRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'projectUpdate',
          {
            item: project,
          },
          inputs.request,
        );
      });

      sails.helpers.utils.sendWebhooks.with({
        event: 'projectUpdate',
        data: {
          item: project,
        },
        prevData: {
          item: inputs.record,
        },
        user: inputs.actorUser,
      });
    }

    return project;
  },
};
