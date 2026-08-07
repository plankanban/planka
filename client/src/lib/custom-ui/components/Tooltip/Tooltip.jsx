/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Popup as SemanticUIPopup } from 'semantic-ui-react';

import styles from './Tooltip.module.css';

const callAll =
  (...callbacks) =>
  (...args) => {
    callbacks.forEach((callback) => {
      if (callback) {
        callback(...args);
      }
    });
  };

const Tooltip = React.forwardRef(
  ({ children, content, disabled, position, 'aria-label': ariaLabel, onClick, ...props }, ref) => {
    const trigger = useMemo(() => {
      const contentAriaLabel = typeof content === 'string' ? content : undefined;

      return React.cloneElement(children, {
        ...props,
        ref,
        'aria-label': children.props['aria-label'] || ariaLabel || contentAriaLabel,
        onClick: callAll(children.props.onClick, onClick),
      });
    }, [children, content, props, ref, ariaLabel, onClick]);

    if (disabled || !content) {
      return trigger;
    }

    return (
      <SemanticUIPopup
        basic
        inverted
        trigger={trigger}
        content={content}
        on={['hover', 'focus']}
        position={position}
        className={styles.wrapper}
      />
    );
  },
);

Tooltip.propTypes = {
  children: PropTypes.element.isRequired,
  content: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  'aria-label': PropTypes.string,
  onClick: PropTypes.func,
  position: PropTypes.string,
};

Tooltip.defaultProps = {
  disabled: false,
  'aria-label': undefined,
  onClick: undefined,
  position: 'top center',
};

export default React.memo(Tooltip);
