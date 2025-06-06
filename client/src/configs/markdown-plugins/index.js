/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import sup from '@diplodoc/transform/lib/plugins/sup';
import monospace from '@diplodoc/transform/lib/plugins/monospace';
import code from '@diplodoc/transform/lib/plugins/code';
import imsize from '@diplodoc/transform/lib/plugins/imsize';
import video from '@diplodoc/transform/lib/plugins/video';
import table from '@diplodoc/transform/lib/plugins/table';
import note from '@diplodoc/transform/lib/plugins/notes';
import cut from '@diplodoc/transform/lib/plugins/cut';
import meta from '@diplodoc/transform/lib/plugins/meta';
import deflist from '@diplodoc/transform/lib/plugins/deflist';
/* eslint-disable import/no-unresolved */
import ins from '@gravity-ui/markdown-editor/markdown-it/ins';
import mark from '@gravity-ui/markdown-editor/markdown-it/mark';
import sub from '@gravity-ui/markdown-editor/markdown-it/sub';
import emoji from '@gravity-ui/markdown-editor/markdown-it/emoji';
import color from '@gravity-ui/markdown-editor/markdown-it/color';
import { emojiDefs } from '@gravity-ui/markdown-editor/_/bundle/emoji';
/* eslint-enable import/no-unresolved */

import link from './link';
import mention from './mention';

export default [
  ins,
  mark,
  sub,
  (md) => md.use(emoji, { defs: emojiDefs }),
  color,
  sup,
  monospace,
  code,
  (md) => md.use(imsize, { enableInlineStyling: true }),
  video,
  table,
  (md) => md.use(note, { notesAutotitle: false, log: console }),
  cut,
  meta,
  deflist,
  link,
  mention,
];
