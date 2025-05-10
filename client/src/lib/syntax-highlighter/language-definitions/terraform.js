/*
 * This file derives from https://github.com/highlightjs/highlightjs-terraform
 * Licensed under the MIT License:
 *
 * Copyright (c) 2020 highlightjs-terraform
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * highlight.js terraform syntax highlighting definition
 *
 * @see https://github.com/highlightjs/highlight.js
 *
 * :TODO:
 *
 * @package: highlightjs-terraform
 * @author:  Nikos Tsirmirakis <nikos.tsirmirakis@winopsdba.com>
 * @since:   2019-03-20
 *
 * Description: Terraform (HCL) language definition
 * Category: scripting
 */

export default (hljs) => {
  const NUMBERS = {
    className: 'number',
    begin: '\\b\\d+(\\.\\d+)?',
    relevance: 0,
  };
  const STRINGS = {
    className: 'string',
    begin: '"',
    end: '"',
    contains: [
      {
        className: 'variable',
        begin: '\\${',
        end: '\\}',
        relevance: 9,
        contains: [
          {
            className: 'string',
            begin: '"',
            end: '"',
          },
          {
            className: 'meta',
            begin: '[A-Za-z_0-9]*' + '\\(', // eslint-disable-line no-useless-concat
            end: '\\)',
            contains: [
              NUMBERS,
              {
                className: 'string',
                begin: '"',
                end: '"',
                contains: [
                  {
                    className: 'variable',
                    begin: '\\${',
                    end: '\\}',
                    contains: [
                      {
                        className: 'string',
                        begin: '"',
                        end: '"',
                        contains: [
                          {
                            className: 'variable',
                            begin: '\\${',
                            end: '\\}',
                          },
                        ],
                      },
                      {
                        className: 'meta',
                        begin: '[A-Za-z_0-9]*' + '\\(', // eslint-disable-line no-useless-concat
                        end: '\\)',
                      },
                    ],
                  },
                ],
              },
              'self',
            ],
          },
        ],
      },
    ],
  };

  return {
    aliases: ['tf', 'hcl'],
    keywords: 'resource variable provider output locals module data terraform|10',
    literal: 'false true null',
    contains: [hljs.COMMENT('\\#', '$'), NUMBERS, STRINGS],
  };
};
