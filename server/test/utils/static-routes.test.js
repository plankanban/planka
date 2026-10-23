const fs = require('fs');
const os = require('os');
const path = require('path');
const { expect } = require('chai');

const { resolveStaticPathSegment } = require('../../config/routes');
const LocalFileManager = require('../../api/hooks/file-manager/LocalFileManager');

const BASES = ['protected/user-avatars', 'protected/background-images', 'protected/favicons'];

describe('static route path resolution', () => {
  BASES.forEach((base) => {
    describe(base, () => {
      it('resolves a legitimate file inside the directory', () => {
        expect(resolveStaticPathSegment(base, '/123/original.jpg')).to.deep.equal({
          segment: `${base}/123/original.jpg`,
        });
      });

      it('ignores query and hash and decodes encoded file names', () => {
        expect(resolveStaticPathSegment(base, '/123/my%20file.png?x=1#y')).to.deep.equal({
          segment: `${base}/123/my file.png`,
        });
      });

      [
        '/../../private/attachments/1/a.txt',
        '/../private/attachments/1/a.txt',
        '/123/../../../private/a.txt',
        '/%2e%2e/%2e%2e/private/a.txt',
        '/%2E%2E%2Fprivate/a.txt',
        '/..%2fprivate/a.txt',
        '/123/..%5cprivate/a.txt',
        '/..\\..\\private\\a.txt',
        '/123/a.txt%00.png',
        '/',
        '/..',
        '/.',
      ].forEach((urlPath) => {
        it(`refuses ${urlPath}`, () => {
          const result = resolveStaticPathSegment(base, urlPath);

          expect(result.segment).to.equal(undefined);
          expect(result.status).to.equal(404);
        });
      });

      it('answers malformed encoding with 400', () => {
        expect(resolveStaticPathSegment(base, '/%E0%A4%A')).to.deep.equal({ status: 400 });
      });

      it('keeps a double-encoded sequence literal', () => {
        expect(resolveStaticPathSegment(base, '/%252e%252e/a.txt')).to.deep.equal({
          segment: `${base}/%2e%2e/a.txt`,
        });
      });
    });
  });
});

describe('LocalFileManager.read with a narrower root', () => {
  let tmpDir;
  let previousSails;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'planka-static-'));
    fs.mkdirSync(path.join(tmpDir, 'protected/user-avatars/1'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'private/attachments/1'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'protected/user-avatars/1/a.png'), 'avatar');
    fs.writeFileSync(path.join(tmpDir, 'private/attachments/1/secret.txt'), 'secret');

    previousSails = global.sails;
    global.sails = { config: { custom: { uploadsBasePath: tmpDir } } };
  });

  after(() => {
    global.sails = previousSails;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('serves a file inside the root', async () => {
    const [stream] = await new LocalFileManager().read('protected/user-avatars/1/a.png', {
      withHeaders: true,
      rootPathSegment: 'protected/user-avatars',
    });
    stream.destroy();
  });

  it('rejects a sibling directory of the uploads root', async () => {
    let error;
    try {
      await new LocalFileManager().read('private/attachments/1/secret.txt', {
        rootPathSegment: 'protected/user-avatars',
      });
    } catch (err) {
      error = err;
    }

    expect(error).to.be.an('error');
  });

  it('still allows it without a narrower root', async () => {
    const stream = await new LocalFileManager().read('private/attachments/1/secret.txt');
    stream.destroy();
  });
});
