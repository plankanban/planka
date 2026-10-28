/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const dns = require('dns');
const { URL } = require('url');
const { Agent, ProxyAgent } = require('undici');
const icoToPng = require('ico-to-png');
const sharp = require('sharp');

const { isPrivateAddress } = require('../../../utils/ip-address');

const FETCH_TIMEOUT = 4000;
const MAX_RESPONSE_LENGTH = 1024 * 1024;
const MAX_REDIRECTS = 5;

const FAVICON_TAGS_REGEX = /<link [^>]*rel="([^"]* )?icon( [^"]*)?"[^>]*>/gi;
const HREF_REGEX = /href="(.*?)"/i;
const SIZES_REGEX = /sizes="(.*?)"/i;

// Resolves the host and refuses to connect if any of its addresses is internal,
// so the address that is connected to is the one that was validated.
const lookup = (hostname, options, callback) => {
  const lookupOptions = typeof options === 'object' && options !== null ? options : {};

  dns.lookup(hostname, { ...lookupOptions, all: true }, (error, addresses) => {
    if (error) {
      callback(error);
      return;
    }

    if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
      callback(new Error(`Address of ${hostname} is not allowed`));
      return;
    }

    if (lookupOptions.all) {
      callback(null, addresses);
      return;
    }

    callback(null, addresses[0].address, addresses[0].family);
  });
};

let agent;

const getDispatcher = () => {
  if (sails.config.custom.outgoingProxy) {
    return new ProxyAgent(sails.config.custom.outgoingProxy);
  }

  if (!agent) {
    agent = new Agent({ connect: { lookup } });
  }

  return agent;
};

const fetchWithTimeout = async (url) => {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), FETCH_TIMEOUT);

  const dispatcher = getDispatcher();
  let currentUrl = url;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    // eslint-disable-next-line no-await-in-loop
    if (!(await sails.helpers.utils.isSafeRemoteUrl(currentUrl))) {
      throw new Error('URL is not allowed');
    }

    // eslint-disable-next-line no-await-in-loop
    const response = await fetch(currentUrl, {
      dispatcher,
      signal: abortController.signal,
      redirect: 'manual',
    });

    const location =
      response.status >= 300 && response.status < 400 && response.headers.get('location');

    if (!location) {
      return response;
    }

    response.body.cancel().catch(() => {});
    currentUrl = new URL(location, currentUrl).href;
  }

  throw new Error('Too many redirects');
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

    image = image
      .resize(
        32,
        32,
        width < 32 || height < 32
          ? {
              kernel: sharp.kernel.nearest,
            }
          : undefined,
      )
      .png();

    try {
      await fileManager.save(
        `${sails.config.custom.faviconsPathSegment}/${hostname}.png`,
        image,
        'image/png',
      );
    } catch (error) {
      /* empty */
    }
  },
};
