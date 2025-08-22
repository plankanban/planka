/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const { URL } = require('url');
const icoToPng = require('ico-to-png');
const sharp = require('sharp');

const FETCH_TIMEOUT = 4000;
const MAX_RESPONSE_LENGTH = 1024 * 1024;

const FAVICON_TAGS_REGEX = /<link [^>]*rel="([^"]* )?icon( [^"]*)?"[^>]*>/gi;
const HREF_REGEX = /href="(.*?)"/i;
const SIZES_REGEX = /sizes="(.*?)"/i;

const fetchWithTimeout = (url) => {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), FETCH_TIMEOUT);

  return fetch(url, {
    signal: abortController.signal,
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

    if (receivedLength > MAX_RESPONSE_LENGTH) {
      reader.cancel();

      return {
        ok: false,
        buffer: Buffer.concat(chunks),
      };
    }
  }

  return {
    ok: true,
    buffer: Buffer.concat(chunks),
  };
};

const isWantedFaviconTag = (faviconTag) => {
  const sizesMatch = faviconTag.match(SIZES_REGEX);

  if (!sizesMatch) {
    return false;
  }

  const sizes = sizesMatch[1].split('x');
  return parseInt(sizes[0], 10) >= 32 && parseInt(sizes[1], 10) >= 32;
};

module.exports = {
  inputs: {
    url: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    const { hostname, origin } = new URL(inputs.url);

    let response;
    let readedResponse;

    try {
      response = await fetchWithTimeout(origin);

      if (!response.ok) {
        return;
      }

      readedResponse = await readResponse(response);
    } catch (error) {
      return;
    }

    const content = readedResponse.buffer.toString();
    const faviconTagsMatch = content.match(FAVICON_TAGS_REGEX);

    let faviconUrl;
    if (faviconTagsMatch && faviconTagsMatch.length > 0) {
      let faviconTag;
      if (faviconTagsMatch.length > 1) {
        faviconTag = faviconTagsMatch.find(isWantedFaviconTag);
      }

      if (!faviconTag) {
        [faviconTag] = faviconTagsMatch;
      }

      const hrefMatch = faviconTag.match(HREF_REGEX);

      if (hrefMatch) {
        faviconUrl = new URL(hrefMatch[1], response.url).href;
      }
    }

    if (!faviconUrl) {
      faviconUrl = new URL('/favicon.ico', response.url).href;
    }

    try {
      response = await fetchWithTimeout(faviconUrl);

      if (!response.ok) {
        return;
      }

      readedResponse = await readResponse(response);
    } catch (error) {
      return;
    }

    if (!readedResponse.ok) {
      return;
    }

    const availableStorage = await sails.helpers.utils.getAvailableStorage();

    if (availableStorage !== null && readedResponse.buffer.length >= availableStorage) {
      return;
    }

    let image = sharp(readedResponse.buffer);

    let metadata;
    try {
      metadata = await image.metadata();
    } catch (error) {
      /* empty */
    }

    if (!metadata || metadata.format === 'magick') {
      try {
        const buffer = await icoToPng(readedResponse.buffer, 32);

        image = sharp(buffer);
        metadata = await image.metadata();
      } catch (error) {
        return;
      }
    }

    const fileManager = sails.hooks['file-manager'].getInstance();
    const { width, height } = metadata;

    try {
      const buffer = await image
        .resize(
          32,
          32,
          width < 32 || height < 32
            ? {
                kernel: sharp.kernel.nearest,
              }
            : undefined,
        )
        .png()
        .toBuffer();

      await fileManager.save(
        `${sails.config.custom.faviconsPathSegment}/${hostname}.png`,
        buffer,
        'image/png',
      );
    } catch (error) {
      /* empty */
    }
  },
};
