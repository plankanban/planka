const { expect } = require('chai');

const { MAX_CAUSE_DEPTH, describeWebhookFailure } = require('../../utils/webhook-failure');

describe('utils/webhook-failure', () => {
  it('unwraps the cause undici hides behind "fetch failed"', () => {
    // This is the exact shape produced in production 2026-08-13 by pointing a
    // webhook at a closed port: the outer error says nothing useful.
    const cause = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:9'), {
      code: 'ECONNREFUSED',
    });
    const error = Object.assign(new TypeError('fetch failed'), { cause });

    const described = describeWebhookFailure(error);

    expect(described).to.contain('fetch failed');
    expect(described).to.contain('ECONNREFUSED');
    expect(described).to.contain('127.0.0.1:9');
  });

  it('keeps the error code, which is the part that names the fault', () => {
    // UND_ERR_INVALID_ARG is what the 2026-06-26 dispatch outage actually was,
    // and it reads as a bare "fetch failed" without this.
    const error = Object.assign(new TypeError('fetch failed'), {
      cause: Object.assign(new Error('invalid onRequestStart'), {
        code: 'UND_ERR_INVALID_ARG',
      }),
    });

    expect(describeWebhookFailure(error)).to.contain('UND_ERR_INVALID_ARG');
  });

  it('handles an error with no cause', () => {
    expect(describeWebhookFailure(new Error('plain'))).to.equal('Error: plain');
  });

  it('never returns an empty description', () => {
    [null, undefined, '', 0].forEach((value) => {
      expect(describeWebhookFailure(value)).to.not.equal('');
    });
  });

  it('stops rather than spinning on a self-referential cause', () => {
    const error = new Error('loop');
    error.cause = error;

    expect(() => describeWebhookFailure(error)).to.not.throw();
    expect(describeWebhookFailure(error)).to.equal('Error: loop');
  });

  it('bounds a long cause chain', () => {
    let error = new Error('root');
    for (let i = 0; i < 20; i += 1) {
      error = Object.assign(new Error(`level-${i}`), { cause: error });
    }

    const described = describeWebhookFailure(error);

    expect(described.split(' <- ')).to.have.lengthOf(MAX_CAUSE_DEPTH);
  });

  it('survives an error whose toString throws', () => {
    // This runs inside a fire-and-forget delivery; reporting a failure must not
    // become a second failure.
    const hostile = {
      toString() {
        throw new Error('nope');
      },
    };

    expect(() => describeWebhookFailure(hostile)).to.not.throw();
    expect(describeWebhookFailure(hostile)).to.contain('unstringifiable');
  });
});
