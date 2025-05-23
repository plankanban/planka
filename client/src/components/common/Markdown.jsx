/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import transform from '@diplodoc/transform';
import { defaultOptions as defaultSanitizeOptions } from '@diplodoc/transform/lib/sanitize';
import { colorClassName } from '@gravity-ui/markdown-editor';

import plugins from '../../configs/markdown-plugins';

const Markdown = React.memo(({ children }) => {
  const html = useMemo(() => {
    try {
      return transform(children, {
        plugins,
        breaks: true,
        linkify: true,
        sanitizeOptions: {
          ...defaultSanitizeOptions,
          allowedSchemesByTag: { img: ['http', 'https', 'data'] },
        },
        defaultClassName: colorClassName,
      }).result.html;
    } catch (error) {
      return error.toString();
    }
  }, [children]);

  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={{ __html: html }} className="yfm" />;
});

Markdown.propTypes = {
  children: PropTypes.string.isRequired,
};

export default Markdown;
