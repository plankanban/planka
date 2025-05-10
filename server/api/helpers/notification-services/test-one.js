/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/* eslint-disable no-underscore-dangle */

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    i18n: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { i18n } = inputs;

    await sails.helpers.utils.sendNotifications.with({
      services: [_.pick(inputs.record, ['url', 'format'])],
      title: i18n.__('Test Title'),
      bodyByFormat: {
        text: i18n.__('This is a test text message!'),
        markdown: i18n.__('This is a *test* **markdown** `message`!'),
        html: i18n.__('This is a <i>test</i> <b>html</b> <code>message</code>'),
      },
    });
  },
};
