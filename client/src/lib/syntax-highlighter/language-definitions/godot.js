/*
 * This file derives from https://github.com/highlightjs/highlightjs-gdscript
 * Licensed under the BSD 3-Clause License:
 *
 * Copyright (c) 2020, highlight.js
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
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
Language: GDScript
Author: Khairul Hidayat <me@khairul.my.id>, Nelson Sylvest*r Fritsch <info@nelsonfritsch.de>, Hugo Locurcio <hugo.locurcio@hugo.pro>
Description: Programming language for Godot Engine
*/

export default (hljs) => {
  const KEYWORDS = {
    keyword:
      'and in not or self void as assert breakpoint class class_name ' +
      'extends is func setget signal tool yield const enum export ' +
      'onready static var break continue if elif else for pass return ' +
      'match while remote sync master puppet remotesync mastersync ' +
      'puppetsync',

    built_in:
      'Color8 ColorN abs acos asin atan atan2 bytes2var ' +
      'cartesian2polar ceil char clamp convert cos cosh db2linear ' +
      'decimals dectime deg2rad dict2inst ease exp floor fmod fposmod ' +
      'funcref get_stack hash inst2dict instance_from_id inverse_lerp ' +
      'is_equal_approx is_inf is_instance_valid is_nan is_zero_approx ' +
      'len lerp lerp_angle linear2db load log max min move_toward ' +
      'nearest_po2 ord parse_json polar2cartesian posmod pow preload ' +
      'print_stack push_error push_warning rad2deg rand_range ' +
      'rand_seed randf randi randomize range_lerp round seed sign sin ' +
      'sinh smoothstep sqrt step_decimals stepify str str2var tan tanh ' +
      'to_json type_exists typeof validate_json var2bytes var2str ' +
      'weakref wrapf wrapi bool int float String NodePath ' +
      'Vector2 Rect2 Transform2D Vector3 Rect3 Plane ' +
      'Quat Basis Transform Color RID Object NodePath ' +
      'Dictionary Array PoolByteArray PoolIntArray ' +
      'PoolRealArray PoolStringArray PoolVector2Array ' +
      'PoolVector3Array PoolColorArray',

    literal: 'true false null',
  };

  return {
    aliases: ['godot', 'gdscript'],
    keywords: KEYWORDS,
    contains: [
      hljs.NUMBER_MODE,
      hljs.HASH_COMMENT_MODE,
      {
        className: 'comment',
        begin: /"""/,
        end: /"""/,
      },
      hljs.QUOTE_STRING_MODE,
      {
        variants: [
          {
            className: 'function',
            beginKeywords: 'func',
          },
          {
            className: 'class',
            beginKeywords: 'class',
          },
        ],
        end: /:/,
        contains: [hljs.UNDERSCORE_TITLE_MODE],
      },
    ],
  };
};
