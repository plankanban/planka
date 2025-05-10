/*
 * This file derives from https://github.com/sindresorhus/filename-reserved-regex
 * Licensed under the MIT License:
 *
 * Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

function filenameReservedRegex() {
  return /[<>:"/\\|?*\u0000-\u001F]/g; // eslint-disable-line no-control-regex
}

function windowsReservedNameRegex() {
  return /^(con|prn|aux|nul|com\d|lpt\d)$/i;
}

/*
 * This file derives from https://github.com/sindresorhus/filenamify
 * Licensed under the MIT License:
 *
 * Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Doesn't make sense to have longer filenames
const MAX_FILENAME_LENGTH = 100;

const reRelativePath = /^\.+(\\|\/)|^\.+$/;
const reTrailingPeriods = /\.+$/;

function filenamify(string, options = {}) {
  const reControlChars = /[\u0000-\u001F\u0080-\u009F]/g; // eslint-disable-line no-control-regex
  const reRepeatedReservedCharacters = /([<>:"/\\|?*\u0000-\u001F]){2,}/g; // eslint-disable-line no-control-regex

  if (typeof string !== 'string') {
    throw new TypeError('Expected a string');
  }

  const replacement = options.replacement === undefined ? '!' : options.replacement;

  if (filenameReservedRegex().test(replacement) && reControlChars.test(replacement)) {
    throw new Error('Replacement string cannot contain reserved filename characters');
  }

  /* eslint-disable no-param-reassign */
  if (replacement.length > 0) {
    string = string.replace(reRepeatedReservedCharacters, '$1');
  }

  string = string.normalize('NFD');
  string = string.replace(reRelativePath, replacement);
  string = string.replace(filenameReservedRegex(), replacement);
  string = string.replace(reControlChars, replacement);
  string = string.replace(reTrailingPeriods, '');

  if (replacement.length > 0) {
    const startedWithDot = string[0] === '.';

    // We removed the whole filename
    if (!startedWithDot && string[0] === '.') {
      string = replacement + string;
    }

    // We removed the whole extension
    if (string[string.length - 1] === '.') {
      string += replacement;
    }
  }

  string = windowsReservedNameRegex().test(string) ? string + replacement : string;
  const allowedLength =
    typeof options.maxLength === 'number' ? options.maxLength : MAX_FILENAME_LENGTH;
  if (string.length > allowedLength) {
    const extensionIndex = string.lastIndexOf('.');
    if (extensionIndex === -1) {
      string = string.slice(0, allowedLength);
    } else {
      const filename = string.slice(0, extensionIndex);
      const extension = string.slice(extensionIndex);
      string = filename.slice(0, Math.max(1, allowedLength - extension.length)) + extension;
    }
  }
  /* eslint-enable no-param-reassign */

  return string;
}

module.exports = filenamify;
