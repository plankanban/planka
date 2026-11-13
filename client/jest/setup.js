/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// The default `node` test environment has no `window`, but modules such as
// `src/constants/Config.js` read `window.BASE_PATH` at import time. A minimal
// stub keeps pure-logic tests (models, selectors, utils) runnable without
// pulling in the full jsdom environment.
if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis;
}

// Config.js reads window.matchMedia at import time; the node environment has no
// implementation, so pure-logic tests need a minimal one.
if (typeof globalThis.window.matchMedia !== 'function') {
  globalThis.window.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  });
}
