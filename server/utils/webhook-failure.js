/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Turns a webhook delivery error into a line an operator can act on.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS
 * ---------------------------------------------------------------------------
 * `send-webhooks.js` logged `${error}`, which for undici's fetch is always the
 * string "TypeError: fetch failed" -- the actual reason (ECONNREFUSED, DNS
 * failure, TLS error, timeout) lives on `error.cause` and was thrown away.
 *
 * MEASURED in production 2026-08-13 by pointing a probe webhook at a closed
 * port. The failure DID reach the log, which is what the LOG_LEVEL work was for:
 *
 *     [E] Webhook zz-log-probe-t1 failed with error: TypeError: fetch failed
 *
 * That line proves delivery failures are visible. It does not tell you whether
 * the endpoint is down, the DNS name is wrong, or the proxy refused you -- and
 * those have completely different fixes. During the 2026-06-26 dispatch outage
 * the distinguishing detail was exactly this: a UND_ERR_INVALID_ARG from mixing
 * two undici copies, which reads as "fetch failed" too.
 *
 * So the cause chain is unwound here, cheaply and defensively: this runs inside
 * a fire-and-forget delivery, and a logger that throws while reporting a failure
 * would turn an observability gap into a crash.
 */

const MAX_CAUSE_DEPTH = 4;

const describeOne = (error) => {
  if (error === null || error === undefined) {
    return '';
  }

  // Node attaches the useful bit as `code` (ECONNREFUSED, ENOTFOUND, UND_ERR_*)
  const code = typeof error === 'object' && error.code ? ` (${error.code})` : '';

  let text;
  try {
    text = String(error);
  } catch (stringifyError) {
    // a thrown toString must not take the delivery path with it
    text = '[unstringifiable error]';
  }

  return `${text}${code}`;
};

/**
 * `TypeError: fetch failed (UND_ERR_SOCKET) <- Error: connect ECONNREFUSED
 * 127.0.0.1:9 (ECONNREFUSED)` -- the outer error keeps its context, the cause
 * supplies the reason.
 */
const describeWebhookFailure = (error) => {
  const parts = [];
  let current = error;
  let depth = 0;

  const seen = new Set();

  while (current !== null && current !== undefined && depth < MAX_CAUSE_DEPTH) {
    if (typeof current === 'object') {
      if (seen.has(current)) {
        break; // a self-referential cause must not spin
      }

      seen.add(current);
    }

    const described = describeOne(current);

    if (described !== '') {
      parts.push(described);
    }

    current = typeof current === 'object' ? current.cause : undefined;
    depth += 1;
  }

  if (parts.length === 0) {
    return 'unknown error';
  }

  return parts.join(' <- ');
};

module.exports = {
  MAX_CAUSE_DEPTH,
  describeWebhookFailure,
};
