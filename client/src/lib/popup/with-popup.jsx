import { ResizeObserver } from '@juggle/resize-observer';
import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Popup as SemanticUIPopup } from 'semantic-ui-react';

import styles from './Popup.module.css';

export default (WrappedComponent, defaultProps) => {
  const Popup = React.memo(({ children, ...props }) => {
    const [isOpened, setIsOpened] = useState(false);

    const wrapper = useRef(null);
    const resizeObserver = useRef(null);

    const handleOpen = useCallback(() => {
      setIsOpened(true);
    }, []);

    const handleClose = useCallback(() => {
      setIsOpened(false);
    }, []);

    const handleMouseDown = useCallback((event) => {
      event.stopPropagation();
    }, []);

    const handleClick = useCallback((event) => {
      event.stopPropagation();
    }, []);

    const handleTriggerClick = useCallback(
      (event) => {
        event.stopPropagation();

        const { onClick } = children;

        if (onClick) {
          onClick(event);
        }
      },
      [children],
    );

    const handleContentRef = useCallback((element) => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }

      if (!element) {
        resizeObserver.current = null;
        return;
      }

      resizeObserver.current = new ResizeObserver(() => {
        if (resizeObserver.current.isInitial) {
          resizeObserver.current.isInitial = false;
          return;
        }

        wrapper.current.positionUpdate();
      });

      resizeObserver.current.isInitial = true;
      resizeObserver.current.observe(element);
    }, []);

    const tigger = React.cloneElement(children, {
      onClick: handleTriggerClick,
    });

    return (
      <SemanticUIPopup
        basic
        wide
        ref={wrapper}
        trigger={tigger}
        on="click"
        open={isOpened}
        position="bottom left"
        popperModifiers={[
          {
            name: 'preventOverflow',
            options: {
              boundariesElement: 'window',
            },
          },
        ]}
        className={styles.wrapper}
        onOpen={handleOpen}
        onClose={handleClose}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        {...defaultProps} // eslint-disable-line react/jsx-props-no-spreading
      >
        <div ref={handleContentRef}>
          <Button icon="close" onClick={handleClose} className={styles.closeButton} />
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <WrappedComponent {...props} onClose={handleClose} />
        </div>
      </SemanticUIPopup>
    );
  });

  Popup.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return Popup;
};
