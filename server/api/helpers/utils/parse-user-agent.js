/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const UAParser = require('ua-parser-js');

const clip = (value, max = 64) => {
  if (!value) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
};

module.exports = {
  sync: true,

  inputs: {
    userAgent: {
      type: 'string',
      allowNull: true,
    },
  },

  fn(inputs) {
    if (!inputs.userAgent) {
      return {
        browserName: null,
        browserVersion: null,
        osName: null,
        osVersion: null,
        deviceType: null,
        deviceVendor: null,
        deviceModel: null,
      };
    }

    try {
      const parsed = new UAParser(inputs.userAgent).getResult();
      return {
        browserName: clip(parsed.browser.name),
        browserVersion: clip(parsed.browser.version),
        osName: clip(parsed.os.name),
        osVersion: clip(parsed.os.version),
        deviceType: clip(parsed.device.type) || 'desktop',
        deviceVendor: clip(parsed.device.vendor),
        deviceModel: clip(parsed.device.model),
      };
    } catch (error) {
      return {
        browserName: null,
        browserVersion: null,
        osName: null,
        osVersion: null,
        deviceType: null,
        deviceVendor: null,
        deviceModel: null,
      };
    }
  },
};
