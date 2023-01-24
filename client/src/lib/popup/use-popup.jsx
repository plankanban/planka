import { ResizeObserver } from '@juggle/resize-observer';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Popup as SemanticUIPopup } from 'semantic-ui-react';

import styles from './Popup.module.css';

export default (Step, props) => {
  return useMemo(() => {
    const Popup = React.memo(({ children, onClose, ...stepProps }) => {
      const [isOpened, setIsOpened] = useState(false);

      const wrapper = useRef(null);
      const resizeObserver = useRef(null);

      const handleOpen = useCallback(() => {
        setIsOpened(true);
      }, []);

      const handleClose = useCallback(() => {
        setIsOpened(false);

        if (onClose) {
          onClose();
        }
      }, [onClose]);

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
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          {...props} // eslint-disable-line react/jsx-props-no-spreading
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
      onClose: PropTypes.func,
    };

    Popup.defaultProps = {
      onClose: undefined,
    };

    return Popup;
  }, [props]);
};
