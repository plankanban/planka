import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const DragScroller = React.memo(({ children, ...props }) => {
  const wrapper = useRef(null);
  const prevPosition = useRef(null);

  const handleMouseDown = useCallback(
    (event) => {
      if (event.target !== wrapper.current && !event.target.dataset.dragScroller) {
        return;
      }

      prevPosition.current = event.clientX;
    },
    [wrapper],
  );

  const handleWindowMouseMove = useCallback(
    (event) => {
      if (!prevPosition.current) {
        return;
      }

      event.preventDefault();

      const position = event.clientX;

      wrapper.current.scrollLeft -= -prevPosition.current + position;
      prevPosition.current = position;
    },
    [wrapper, prevPosition],
  );

  const handleWindowMouseUp = useCallback(() => {
    prevPosition.current = null;
  }, [prevPosition]);

  useEffect(() => {
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('mousemove', handleWindowMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('mousemove', handleWindowMouseMove);
    };
  }, [handleWindowMouseUp, handleWindowMouseMove]);

  return (
    /* eslint-disable jsx-a11y/no-static-element-interactions, react/jsx-props-no-spreading */
    <div {...props} ref={wrapper} onMouseDown={handleMouseDown}>
      {/* eslint-enable jsx-a11y/no-static-element-interactions, react/jsx-props-no-spreading */}
      {children}
    </div>
  );
});

DragScroller.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DragScroller;
