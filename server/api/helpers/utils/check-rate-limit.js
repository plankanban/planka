/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// A fixed-window counter, held in the process that serves the request.
//
// PLANKA needs no Redis and the stock deployment is a single container, so the
// count lives in memory rather than in shared storage. Run several processes
// and each keeps its own, which multiplies the effective ceiling by their
// number — enough to blunt a script, not a substitute for a limiter in front of
// the app. That trade is stated where the limits are configured.
//
// The verdict comes back in the return value rather than as an exit: an exit
// reaches an `await` as an Error wrapping its name, which is easy to catch
// wrongly and easy to catch wrongly in silence.

const buckets = new Map();

// Beyond this many live keys, sweep what has expired before adding more. An
// attacker can mint keys freely — one per made-up account name — so the map
// must not be allowed to grow with them.
const SWEEP_THRESHOLD = 10000;

const sweep = (now) => {
  buckets.forEach((bucket, key) => {
    if (bucket.expiresAt <= now) {
      buckets.delete(key);
    }
  });
};

module.exports = {
  inputs: {
    key: {
      type: 'string',
      required: true,
    },
    windowSeconds: {
      type: 'number',
      required: true,
    },
    max: {
      type: 'number',
      required: true,
    },
  },

  sync: true,

  fn(inputs) {
    const now = Date.now();

    if (buckets.size > SWEEP_THRESHOLD) {
      sweep(now);
    }

    const bucket = buckets.get(inputs.key);

    if (!bucket || bucket.expiresAt <= now) {
      buckets.set(inputs.key, {
        count: 1,
        expiresAt: now + inputs.windowSeconds * 1000,
      });

      return { count: 1, isExceeded: inputs.max < 1 };
    }

    bucket.count += 1;

    return { count: bucket.count, isExceeded: bucket.count > inputs.max };
  },
};
