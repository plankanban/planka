const fs = require('fs');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const ignore = require('ignore');

const OUT_DIR = 'dist';

const ig = ignore();
if (fs.existsSync('.buildignore')) {
  const patterns = fs.readFileSync('.buildignore', 'utf8');
  ig.add(patterns);
}

if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const build = (src, dest) => {
  const dirents = fs.readdirSync(src, { withFileTypes: true });

  // eslint-disable-next-line no-restricted-syntax
  for (const dirent of dirents) {
    const srcPath = path.join(src, dirent.name);

    if (ig.ignores(srcPath)) {
      continue; // eslint-disable-line no-continue
    }

    const destPath = path.join(dest, dirent.name);

    if (dirent.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      build(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

build('./', OUT_DIR);
