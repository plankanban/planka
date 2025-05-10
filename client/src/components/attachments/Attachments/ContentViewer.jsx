/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Frame from 'react-frame-component';
import { Loader } from 'semantic-ui-react';
import syntaxHighlighter from '../../../lib/syntax-highlighter';

import Markdown from '../../common/Markdown';

import styles from './ContentViewer.module.scss';

const Languages = {
  PLAINTEXT: 'plaintext',
  MARKDOWN: 'markdown',
};

const ContentViewer = React.memo(({ src, filename, className }) => {
  const [content, setContent] = useState(null);

  const frameStyles = useMemo(
    () => [
      ...Array.from(document.styleSheets).flatMap((styleSheet) =>
        Array.from(styleSheet.cssRules).map((cssRule) => cssRule.cssText),
      ),
      'body{background:rgb(248,248,248);min-width:fit-content;overflow-x:visible}',
      '.frame-content{padding:40px}',
      '.frame-content>pre{margin:0}',
      '.hljs{padding:0}',
      '::-webkit-scrollbar{height:10px}',
    ],
    [],
  );

  const languages = useMemo(
    () => syntaxHighlighter.detectLanguagesByFilename(filename),
    [filename],
  );

  useEffect(() => {
    async function fetchFile() {
      await syntaxHighlighter.loadLanguages(languages);

      let response;
      try {
        response = await fetch(src, {
          credentials: 'include',
        });
      } catch {
        return;
      }

      const text = await response.text();
      setContent(text);
    }

    fetchFile();
  }, [src, languages]);

  if (content === null) {
    return <Loader active size="big" />;
  }

  let contentNode;
  if (languages.includes(Languages.PLAINTEXT)) {
    contentNode = (
      <pre>
        <code>{content}</code>
      </pre>
    );
  } else if (languages.includes(Languages.MARKDOWN)) {
    contentNode = <Markdown>{content}</Markdown>;
  } else {
    const hljsResult = syntaxHighlighter.highlight(content, languages);

    contentNode = (
      <pre>
        <code
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: hljsResult.value }}
          className={`hljs language-${hljsResult.language}`}
        />
      </pre>
    );
  }

  return (
    <Frame
      head={<style>{frameStyles.join('')}</style>}
      className={classNames(styles.wrapper, className)}
    >
      {contentNode}
    </Frame>
  );
});

ContentViewer.propTypes = {
  src: PropTypes.string.isRequired,
  filename: PropTypes.string.isRequired,
  className: PropTypes.string,
};

ContentViewer.defaultProps = {
  className: undefined,
};

export default ContentViewer;
