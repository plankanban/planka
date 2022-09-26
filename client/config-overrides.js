const fs = require('fs');
const path = require('path');

const BASE_URL_PLACEHOLDER = 'BASE_URL_PLACEHOLDER';

const replaceInFile = (file, search, replace) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      throw new Error(`${err}`);
    }
    const res = data.replaceAll(search, replace);
    fs.writeFile(file, res, 'utf8', (err) => {
      if (err) {
        throw new Error(`${err}`);
      }
    });
  });
};

const replaceBaseUrl = (compiler) => {
  compiler.hooks.assetEmitted.tap("Test", (file, info) => {
    if (info.content.indexOf(BASE_URL_PLACEHOLDER) >= 0) {
      if (/\.css$/.exec(info.targetPath)) {
        // For CSS 'url(...)' import we can use relative import
        const relPath = path.relative(path.dirname(info.targetPath), info.outputPath);
        replaceInFile(info.targetPath, BASE_URL_PLACEHOLDER, `${relPath}/`);
      } else if (/\.js$/.exec(info.targetPath)) {
        // For JS 'import ... from "some-asset"' we can get the variable injected in the window object
        replaceInFile(info.targetPath, `"${BASE_URL_PLACEHOLDER}"`, '`${window.BASE_URL}/`');
      } else if (/index\.html$/.exec(info.targetPath)) {
        // For the main html file, we set a placeholder for sails to inject the correct value as runtime
        replaceInFile(info.targetPath, BASE_URL_PLACEHOLDER, '<%= BASE_URL %>');
      }
    }
  });
};

module.exports = function override(config, env) {
  config.plugins.forEach(plugin => {
    if (plugin.constructor.name === 'InterpolateHtmlPlugin') {
      plugin.replacements.PUBLIC_URL = BASE_URL_PLACEHOLDER;
    }
  });
  config.plugins.push({ apply: replaceBaseUrl });
  config.output.publicPath = BASE_URL_PLACEHOLDER;
  return config;
};
