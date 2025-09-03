/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { ResizeObserver } from '@juggle/resize-observer';
import React, { useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Popup as SemanticUIPopup } from 'semantic-ui-react';

import styles from './Popup.module.css';

export default (Step, { position, onOpen, onClose } = {}) => {
  return useMemo(() => {
    const Popup = React.forwardRef(({ children, ...stepProps }, ref) => {
      const [isOpened, setIsOpened] = useState(false);

      const wrapperRef = useRef(null);
      const resizeObserverRef = useRef(null);

      const open = useCallback(() => {
        setIsOpened(true);

        if (onOpen) {
          onOpen();
        }
      }, []);

      const handleOpen = useCallback(() => {
        open();
      }, [open]);

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
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }

        if (!element) {
          resizeObserverRef.current = null;
          return;
        }

        resizeObserverRef.current = new ResizeObserver(() => {
          if (resizeObserverRef.current.isInitial) {
            resizeObserverRef.current.isInitial = false;
            return;
          }

          wrapperRef.current.positionUpdate();
        });

        resizeObserverRef.current.isInitial = true;
        resizeObserverRef.current.observe(element);
      }, []);

      useImperativeHandle(
        ref,
        () => ({
          open,
        }),
        [open],
      );

      const tigger = React.cloneElement(children, {
        onClick: handleTriggerClick,
      });

      return (
        <SemanticUIPopup
          basic
          wide
          ref={wrapperRef}
          trigger={tigger}
          on="click"
          open={isOpened}
          position={position || 'bottom left'}
          popperModifiers={[
            {
              name: 'preventOverflow',
              enabled: true,
              options: {
                altAxis: true,
                padding: 20,
              },
            },
          ]}
          className={styles.wrapper}
          onOpen={handleOpen}
          onClose={handleClose}
          onUnmount={onClose}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >
          <div ref={handleContentRef}>
            <Button icon="close" onClick={handleClose} className={styles.closeButton} />
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Step {...stepProps} onClose={handleClose} />
          </div>
        </SemanticUIPopup>
      );
    });

    Popup.propTypes = {
      children: PropTypes.node.isRequired,
    };

    return React.memo(Popup);
  }, [position, onOpen, onClose]);
};
