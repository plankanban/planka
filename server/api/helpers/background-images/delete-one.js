/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    project: {
      type: 'ref',
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

  async fn(inputs) {
    const scoper = sails.helpers.projects.makeScoper.with({
      record: inputs.project,
    });

    if (inputs.project.backgroundType === Project.BackgroundTypes.IMAGE) {
      if (inputs.record.id === inputs.project.backgroundImageId) {
        await sails.helpers.projects.updateOne.with({
          scoper,
          webhooks,
          record: inputs.project,
          values: {
            backgroundType: null,
          },
          actorUser: inputs.actorUser,
        });
      }
    }

    const backgroundImage = await BackgroundImage.qm.deleteOne(inputs.record.id);

    if (backgroundImage) {
      sails.helpers.backgroundImages.removeRelatedFiles(backgroundImage);

      const projectRelatedUserIds = await scoper.getProjectRelatedUserIds();

      projectRelatedUserIds.forEach((userId) => {
        sails.sockets.broadcast(
          `user:${userId}`,
          'backgroundImageDelete',
          {
            item: sails.helpers.backgroundImages.presentOne(backgroundImage),
          },
          inputs.request,
        );
      });

      const webhooks = await Webhook.qm.getAll();

      sails.helpers.utils.sendWebhooks.with({
        webhooks,
        event: Webhook.Events.BACKGROUND_IMAGE_DELETE,
        buildData: () => ({
          item: sails.helpers.backgroundImages.presentOne(backgroundImage),
          included: {
            projects: [inputs.project],
          },
        }),
        user: inputs.actorUser,
      });
    }

    return backgroundImage;
  },
};
