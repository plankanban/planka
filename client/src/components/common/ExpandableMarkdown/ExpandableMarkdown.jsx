/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from 'semantic-ui-react';
import { useToggle } from '../../../lib/hooks';

import Markdown from '../Markdown';

import styles from './ExpandableMarkdown.module.scss';

const MAX_VISIBLE_PART_HEIGHT = 800;

const ExpandableMarkdown = React.memo(({ children }) => {
  const [t] = useTranslation();
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isExpanded, toggleExpanded] = useToggle();

  const contentRef = useRef(null);

  const handleToggleExpandClick = useCallback(
    (event) => {
      event.stopPropagation();
      event.target.blur();

      toggleExpanded();
    },
    [toggleExpanded],
  );

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setIsOverflowing(contentRef.current.scrollHeight > MAX_VISIBLE_PART_HEIGHT);
    });

    resizeObserver.observe(contentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const isPartHidden = isOverflowing && !isExpanded;

  return (
    <>
      <div
        className={classNames(
          styles.wrapper,
          isExpanded && styles.wrapperExpanded,
          isPartHidden && styles.wrapperPartHidden,
        )}
        style={{ maxHeight: `${MAX_VISIBLE_PART_HEIGHT}px` }}
      >
        <div ref={contentRef}>
          <Markdown>{children}</Markdown>
        </div>
      </div>
      {isOverflowing && (
        <Button fluid className={styles.toggleButton} onClick={handleToggleExpandClick}>
          <Icon name={isExpanded ? 'angle up' : 'angle down'} />
          {isExpanded ? t('action.showLess') : t('action.showMore')}
        </Button>
      )}
    </>
  );
});

ExpandableMarkdown.propTypes = {
  children: PropTypes.string.isRequired,
};

export default ExpandableMarkdown;
