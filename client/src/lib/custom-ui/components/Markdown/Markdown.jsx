import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

import './Markdown.module.scss'; // FIXME: import as styles?

const Markdown = React.memo(({ linkStopPropagation, ...props }) => {
  const handleLinkClick = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const linkRenderer = useCallback(
    /* eslint-disable jsx-a11y/anchor-has-content,
                      jsx-a11y/click-events-have-key-events,
                      jsx-a11y/no-static-element-interactions,
                      react/jsx-props-no-spreading */
    ({ node, ...linkProps }) => <a {...linkProps} onClick={handleLinkClick} />,
    /* eslint-enable jsx-a11y/anchor-has-content,
                     jsx-a11y/click-events-have-key-events,
                     jsx-a11y/no-static-element-interactions,
                     react/jsx-props-no-spreading */
    [handleLinkClick],
  );

  let components;
  if (linkStopPropagation) {
    components = {
      a: linkRenderer,
    };
  }

  return (
    /* eslint-disable react/jsx-props-no-spreading */
    <ReactMarkdown
      {...props}
      components={components}
      remarkPlugins={[remarkGfm, remarkBreaks]}
      className="markdown-body"
    />
    /* eslint-enable react/jsx-props-no-spreading */
  );
});

Markdown.propTypes = {
  linkStopPropagation: PropTypes.bool,
};

Markdown.defaultProps = {
  linkStopPropagation: false,
};

export default Markdown;
