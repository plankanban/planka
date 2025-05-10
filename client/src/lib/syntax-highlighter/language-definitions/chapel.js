/*
 * This file derives from https://github.com/chapel-lang/highlightjs-chapel
 * Licensed under the BSD 3-Clause License:
 *
 * Copyright (c) 2006, Ivan Sagalaev.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * * Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
Language: Chapel
Author: Brad Chamberlain <bradcray@gmail.com>
Contributors:
Description: A parallel language for productive programming at scale
Website: https://chapel-lang.org
*/

export default (hljs) => ({
  name: 'Chapel',
  aliases: ['chapel', 'chpl'],
  disableAutodetect: true,
  keywords: {
    keyword:
      'align as atomic begin bool borrowed break by bytes catch class cobegin coforall complex config const continue defer delete dmapped do domain else enum export except extern for forall forwarding if imag import in include index inline inout int iter label lambda let lifetime local locale module new noinit nothing on only otherwise out override owned param private proc prototype public real record reduce ref require return scan select serial shared single sparse string subdomain sync then this throw throws try try! type uint union unmanaged use var void when where while with yield zip',

    // What other built-ins should we add here?
    built_in: 'here Locales write writef writeln',
    literal: 'false true nil none',
  },
  contains: [
    // Our line comments are like C's
    hljs.C_LINE_COMMENT_MODE,

    // Like C's block comment mode, but supporting nested comments:
    hljs.COMMENT('/\\*', '\\*/', { contains: ['self'] }),

    // The following is similar to C's C_NUMBER_MODE, but it
    // requires a digit after '9.' like Chapel does to avoid
    // mis-coloring '0..10' and disambiguate calls like
    // '9.square()'
    {
      className: 'number',
      begin:
        // eslint-disable-next-line no-multi-str
        '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d+)?|\\.\\d\
+)([eE][-+]?\\d+)?)',
      relevance: 0,
    },
    // More could/should be done here to handle escapes and
    // the like, but for some reason, inheriting the C string
    // definitions didn't work well for me, so I went with this
    // basic approach for now.
    {
      className: 'string',
      variants: [
        {
          begin: '(b)?"',
          end: '"',
        },
        {
          begin: "(b)?'",
          end: "'",
        },
        {
          begin: '(b)?"""',
          end: '"""',
        },
        {
          begin: "(b)?'''",
          end: "'''",
        },
      ],
    },
  ],
});
