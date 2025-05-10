/*
 * This file derives from https://github.com/highlightjs/highlightjs-GN
 * Licensed under the MIT License:
 *
 * Copyright (c) 2019 Petr Hosek
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
 * highlight.js GN syntax highlighting definition
 *
 * @see https://github.com/highlightjs/highlight.js
 *
 * @package: highlightjs-GN
 * @author:  Petr Hosek <petrhosek@gmail.com>
 * @since:   2019-05-28
 *
 * Description: GN is a meta-build system that generates build files for Ninja.
 * Category: common
 */

export default (hljs) => {
  const SUBST = {
    className: 'subst',
    relevance: 2,
    variants: [
      {
        begin: '\\$[A-Za-z0-9_]+',
      },
      {
        begin: '\\${',
        end: '}',
        contains: [
          {
            className: 'variable',
            begin: hljs.UNDERSCORE_IDENT_RE,
            relevance: 0,
          },
        ],
      },
    ],
  };

  const LINK = {
    className: 'link',
    relevance: 5,
    begin: ':\\w+',
  };

  const NUMBER = {
    className: 'number',
    relevance: 0,
    begin: hljs.NUMBER_RE,
  };

  const STRING = {
    className: 'string',
    relevance: 0,
    begin: '"',
    end: '"',
    illegal: '\\n',
    contains: [hljs.BACKSLASH_ESCAPE, SUBST, LINK],
  };

  const KEYWORDS = {
    keyword: 'if else',
    literal:
      'true false ' +
      'current_cpu current_os current_toolchain ' +
      'default_toolchain host_cpu host_os ' +
      'root_build_dir root_gen_dir root_out_dir ' +
      'target_cpu target_gen_dir target_out_dir ' +
      'target_os target_name invoker',
    type:
      'action action_foreach copy executable group ' +
      'shared_library source_set static_library ' +
      'loadable_module generated_file',
    built_in:
      'assert config declare_args defined exec_script ' +
      'foreach get_label_info get_path_info ' +
      'get_target_outputs getenv import print ' +
      'process_file_template read_file rebase_path ' +
      'set_default_toolchain set_defaults ' +
      'set_sources_assignment_filter template tool ' +
      'toolchain toolchain_args propagates_configs ' +
      'write_file forward_variables_from target ' +
      'get_name_info not_needed',
    symbol:
      'all_dependent_configs allow_circular_includes_from ' +
      'args asmflags cflags cflags_c cflags_cc cflags_objc ' +
      'cflags_objcc check_includes complete_static_lib ' +
      'configs data data_deps defines depfile deps ' +
      'include_dirs inputs ldflags lib_dirs libs ' +
      'output_extension output_name outputs public ' +
      'public_configs public_deps script sources testonly ' +
      'visibility contents output_conversion rebase ' +
      'data_keys walk_keys',
  };

  return {
    aliases: ['gn', 'gni'],
    keywords: KEYWORDS,
    contains: [NUMBER, STRING, hljs.HASH_COMMENT_MODE],
  };
};
