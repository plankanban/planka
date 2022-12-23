const path = require('path');
const rimraf = require('rimraf');

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      custom: (value) => {
        if (!_.isPlainObject(value)) {
          return false;
        }

        if (value.background && !_.isPlainObject(value.background)) {
          return false;
        }

        if (value.backgroundImage && !_.isPlainObject(value.backgroundImage)) {
          return false;
        }

        return true;
      },
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    backgroundImageMustBeNotNullInValues: {},
  },

  async fn(inputs) {
    if (inputs.values.backgroundImage) {
      // eslint-disable-next-line no-param-reassign
      inputs.values.background = {
        type: 'image',
      };
    } else if (
      _.isNull(inputs.values.backgroundImage) &&
      inputs.record.background &&
      inputs.record.background.type === 'image'
    ) {
      inputs.values.background = null; // eslint-disable-line no-param-reassign
    }

    let project;
    if (inputs.values.background && inputs.values.background.type === 'image') {
      if (_.isNull(inputs.values.backgroundImage)) {
        throw 'backgroundImageMustBeNotNullInValues';
      }

      if (_.isUndefined(inputs.values.backgroundImage)) {
        project = await Project.updateOne({
          id: inputs.record.id,
          backgroundImage: {
            '!=': null,
          },
        }).set(inputs.values);

        if (!project) {
          delete inputs.values.background; // eslint-disable-line no-param-reassign
        }
      }
    }

    if (!project) {
      project = await Project.updateOne(inputs.record.id).set(inputs.values);
    }

    if (project) {
      if (
        inputs.record.backgroundImage &&
        (!project.backgroundImage ||
          project.backgroundImage.dirname !== inputs.record.backgroundImage.dirname)
      ) {
        try {
          rimraf.sync(
            path.join(
              sails.config.custom.projectBackgroundImagesPath,
              inputs.record.backgroundImage.dirname,
            ),
          );
        } catch (error) {
          console.warn(error.stack); // eslint-disable-line no-console
        }
      }

      const userIds = await sails.helpers.projects.getManagerAndBoardMemberUserIds(project.id);

      userIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'projectUpdate',
          {
            item: project,
          },
          inputs.request,
        );
      });
    }

    return project;
  },
};
