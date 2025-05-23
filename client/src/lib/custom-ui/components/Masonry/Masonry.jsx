/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import styles from './Masonry.module.scss';

const pixelsToNumber = (pixels) => {
  return Number(pixels.replace('px', ''));
};

const Masonry = React.memo(({ children, columns, spacing }) => {
  const [maxColumnHeight, setMaxColumnHeight] = useState(0);

  const wrapperRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const handleChildResize = useCallback(() => {
    const { current: wrapperElement } = wrapperRef;
    const columnHeights = new Array(columns).fill(0);

    wrapperElement.childNodes.forEach((childElement) => {
      if (childElement.nodeType !== Node.ELEMENT_NODE || childElement.dataset.lineBreak) {
        return;
      }

      const childComputedStyle = window.getComputedStyle(childElement);

      const childHeight =
        Math.ceil(pixelsToNumber(childComputedStyle.height)) +
        pixelsToNumber(childComputedStyle.marginTop) +
        pixelsToNumber(childComputedStyle.marginBottom);

      const index = columnHeights.indexOf(Math.min(...columnHeights));

      columnHeights[index] += childHeight;
      childElement.style.order = index + 1; // eslint-disable-line no-param-reassign
    });

    ReactDOM.flushSync(() => {
      setMaxColumnHeight(Math.max(...columnHeights));
    });
  }, [columns]);

  const handleWrapperRef = useCallback(
    (element) => {
      wrapperRef.current = element;

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      if (!element) {
        resizeObserverRef.current = null;
        return;
      }

      resizeObserverRef.current = new ResizeObserver(handleChildResize);

      element.childNodes.forEach((childElement) => {
        if (!childElement.dataset.lineBreak) {
          resizeObserverRef.current.observe(childElement);
        }
      });
    },
    [children, handleChildResize], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const styledChildren = React.Children.map(
    children,
    (child) =>
      child &&
      React.cloneElement(child, {
        style: {
          margin: `${spacing / 2}px`,
          width: `calc(${(100 / columns).toFixed(2)}% - ${spacing}px)`,
        },
      }),
  );

  const lineBreaks = [...Array(columns > 0 ? columns - 1 : 0)].map((_, index) => (
    <span
      data-line-break
      key={index} // eslint-disable-line react/no-array-index-key
      className={styles.lineBreak}
      style={{
        order: index + 1,
      }}
    />
  ));

  return (
    <div
      ref={handleWrapperRef}
      className={styles.wrapper}
      style={{
        height: `${maxColumnHeight}px`,
        margin: `-${spacing / 2}px`,
      }}
    >
      {styledChildren}
      {lineBreaks}
    </div>
  );
});

Masonry.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.number.isRequired,
  spacing: PropTypes.number.isRequired,
};

export default Masonry;
