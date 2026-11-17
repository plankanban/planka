/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './Scrollbar.module.scss';

const MIN_THUMB_WIDTH = 40;

// The board scrolls the window sideways, which drag and drop relies on, but the
// window's own scrollbar would run underneath the sidebar. This one stands in for
// it, spanning the content area only, and drives the same window scroll.
const Scrollbar = React.memo(({ contentRef }) => {
  const trackRef = useRef(null);
  const dragRef = useRef(null);

  const [state, setState] = useState({
    isVisible: false,
    thumbWidth: 0,
    thumbLeft: 0,
  });

  const getMetrics = useCallback(() => {
    const trackWidth = trackRef.current.clientWidth;
    const maxScroll = document.documentElement.scrollWidth - window.innerWidth;

    const thumbWidth = Math.max(
      MIN_THUMB_WIDTH,
      (trackWidth * trackWidth) / (trackWidth + Math.max(maxScroll, 0)),
    );

    return { trackWidth, maxScroll, thumbWidth };
  }, []);

  const update = useCallback(() => {
    const { trackWidth, maxScroll, thumbWidth } = getMetrics();

    if (maxScroll <= 0) {
      setState((prevState) =>
        prevState.isVisible ? { ...prevState, isVisible: false } : prevState,
      );
      return;
    }

    setState({
      isVisible: true,
      thumbWidth,
      thumbLeft: (window.scrollX / maxScroll) * (trackWidth - thumbWidth),
    });
  }, [getMetrics]);

  const scrollToThumbLeft = useCallback(
    (thumbLeft) => {
      const { trackWidth, maxScroll, thumbWidth } = getMetrics();

      window.scrollTo({
        left: (thumbLeft / (trackWidth - thumbWidth)) * maxScroll,
      });
    },
    [getMetrics],
  );

  const handleThumbMouseDown = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      dragRef.current = {
        startX: event.clientX,
        startThumbLeft: state.thumbLeft,
      };
    },
    [state.thumbLeft],
  );

  const handleTrackMouseDown = useCallback(
    (event) => {
      event.preventDefault();

      const { left } = trackRef.current.getBoundingClientRect();
      scrollToThumbLeft(event.clientX - left - state.thumbWidth / 2);
    },
    [state.thumbWidth, scrollToThumbLeft],
  );

  useEffect(() => {
    const handleWindowMouseMove = (event) => {
      if (!dragRef.current) {
        return;
      }

      const { startX, startThumbLeft } = dragRef.current;
      scrollToThumbLeft(startThumbLeft + event.clientX - startX);
    };

    const handleWindowMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [scrollToThumbLeft]);

  useEffect(() => {
    update();

    // The lists grow past their wrapper as they are added, so both are watched
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(contentRef.current);

    const listsElement = contentRef.current.querySelector('[data-drag-scroller]');
    if (listsElement) {
      resizeObserver.observe(listsElement);
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [contentRef, update]);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={trackRef}
      aria-hidden="true"
      className={classNames(styles.track, !state.isVisible && styles.trackHidden)}
      onMouseDown={handleTrackMouseDown}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className={styles.thumb}
        style={{
          width: state.thumbWidth,
          transform: `translateX(${state.thumbLeft}px)`,
        }}
        onMouseDown={handleThumbMouseDown}
      />
    </div>
  );
});

Scrollbar.propTypes = {
  contentRef: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Scrollbar;
