const path = require('path');
const sharp = require('sharp');

const getConfig = require('../../get-config');

const processUserAvatar = async (user, userAvatarsPath) => {
  const rootPath = path.join(userAvatarsPath, user.avatar.dirname);

  let image = sharp(path.join(rootPath, `original.${user.avatar.extension}`), {
    animated: true,
  });

  let metadata;
  try {
    metadata = await image.metadata();
  } catch (error) {
    return;
  }

  let { width, pageHeight: height = metadata.height } = metadata;
  if (metadata.orientation && metadata.orientation > 4) {
    [image, width, height] = [image.rotate(), height, width];
  }

  try {
    await image
      .resize(
        100,
        100,
        width < 100 || height < 100
          ? {
              kernel: sharp.kernel.nearest,
            }
          : undefined,
      )
      .toFile(path.join(rootPath, `square-100.${user.avatar.extension}`));
  } catch (error) {} // eslint-disable-line no-empty
};

const processProjectBackgroundImage = async (project, projectBackgroundImagesPath) => {
  const rootPath = path.join(projectBackgroundImagesPath, project.background_image.dirname);

  let image = sharp(path.join(rootPath, `original.${project.background_image.extension}`), {
    animated: true,
  });

  let metadata;
  try {
    metadata = await image.metadata();
  } catch (error) {
    return;
  }

  let { width, pageHeight: height = metadata.height } = metadata;
  if (metadata.orientation && metadata.orientation > 4) {
    [image, width, height] = [image.rotate(), height, width];
  }

  try {
    await image
      .resize(
        336,
        200,
        width < 336 || height < 200
          ? {
              kernel: sharp.kernel.nearest,
            }
          : undefined,
      )
      .toFile(path.join(rootPath, `cover-336.${project.background_image.extension}`));
  } catch (error) {} // eslint-disable-line no-empty
};

const processAttachmentImage = async (attachment, attachmentsPath) => {
  const rootPath = path.join(attachmentsPath, attachment.dirname);
  const thumbnailsPath = path.join(rootPath, 'thumbnails');

  let image = sharp(path.join(rootPath, attachment.filename), {
    animated: true,
  });

  let metadata;
  try {
    metadata = await image.metadata();
  } catch (error) {
    return;
  }

  let { width, pageHeight: height = metadata.height } = metadata;
  if (metadata.orientation && metadata.orientation > 4) {
    [image, width, height] = [image.rotate(), height, width];
  }

  const isPortrait = height > width;

  try {
    await image
      .resize(
        256,
        isPortrait ? 320 : undefined,
        width < 256 || (isPortrait && height < 320)
          ? {
              kernel: sharp.kernel.nearest,
            }
          : undefined,
      )
      .toFile(path.join(thumbnailsPath, `cover-256.${attachment.image.thumbnailsExtension}`));
  } catch (error) {} // eslint-disable-line no-empty
};

module.exports.up = async (knex) => {
  const config = await getConfig();
  const users = await knex('user_account').whereNotNull('avatar');

  // eslint-disable-next-line no-restricted-syntax
  for (const user of users) {
    // eslint-disable-next-line no-await-in-loop
    await processUserAvatar(user, config.custom.userAvatarsPath);
  }

  const projects = await knex('project').whereNotNull('background_image');

  // eslint-disable-next-line no-restricted-syntax
  for (const project of projects) {
    // eslint-disable-next-line no-await-in-loop
    await processProjectBackgroundImage(project, config.custom.projectBackgroundImagesPath);
  }

  const attachments = await knex('attachment').whereNotNull('image');

  // eslint-disable-next-line no-restricted-syntax
  for (const attachment of attachments) {
    // eslint-disable-next-line no-await-in-loop
    await processAttachmentImage(attachment, config.custom.attachmentsPath);
  }
};

module.exports.down = () => Promise.resolve();
