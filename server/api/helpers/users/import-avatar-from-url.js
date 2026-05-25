/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const os = require('os');
const path = require('path');
const fs = require('fs/promises');
const { v4: uuid } = require('uuid');
const { ProxyAgent } = require('undici');
const { rimraf } = require('rimraf');

const { MAX_SIZE_TO_PROCESS_AS_IMAGE } = require('../../../constants');

const FETCH_TIMEOUT = 8000;

const fetchWithTimeout = (url) => {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), FETCH_TIMEOUT);

  return fetch(url, {
    signal: abortController.signal,
    dispatcher: sails.config.custom.outgoingProxy
      ? new ProxyAgent(sails.config.custom.outgoingProxy)
      : undefined,
  });
};

const readResponse = async (response) => {
  const reader = response.body.getReader();

  const chunks = [];
  let receivedLength = 0;

  for (;;) {
    const { value, done } = await reader.read(); // eslint-disable-line no-await-in-loop

    if (done) {
      break;
    }

    chunks.push(value);
    receivedLength += value.length;

    if (receivedLength > MAX_SIZE_TO_PROCESS_AS_IMAGE) {
      reader.cancel();
      return null;
    }
  }

  return Buffer.concat(chunks);
};

module.exports = {
  inputs: {
    url: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    let response;
    let buffer;

    try {
      response = await fetchWithTimeout(inputs.url);

      if (!response.ok) {
        return null;
      }

      buffer = await readResponse(response);
    } catch (error) {
      sails.log.warn(`Error while fetching OIDC avatar: ${error}`);
      return null;
    }

    if (!buffer) {
      return null;
    }

    const tempPath = path.join(os.tmpdir(), `oidc-avatar-${uuid()}`);

    try {
      await fs.writeFile(tempPath, buffer);
    } catch (error) {
      sails.log.warn(`Error while writing OIDC avatar to temp file: ${error}`);
      return null;
    }

    try {
      return await sails.helpers.users.processUploadedAvatarFile({
        fd: tempPath,
        size: buffer.length,
        type: response.headers.get('content-type') || 'application/octet-stream',
      });
    } catch (error) {
      sails.log.warn(`OIDC avatar is not a valid image: ${inputs.url}`);
      await rimraf(tempPath);
      return null;
    }
  },
};
