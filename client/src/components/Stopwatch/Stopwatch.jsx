import upperFirst from 'lodash/upperFirst';
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useForceUpdate, usePrevious } from '../../lib/hooks';

import { formatStopwatch } from '../../utils/stopwatch';

import styles from './Stopwatch.module.scss';

const SIZES = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

const Stopwatch = React.memo(({ as, startedAt, total, size, isDisabled, onClick }) => {
  const prevStartedAt = usePrevious(startedAt);
  const forceUpdate = useForceUpdate();

  const interval = useRef(null);

  const start = useCallback(() => {
    interval.current = setInterval(() => {
      forceUpdate();
    }, 1000);
  }, [forceUpdate]);

  const stop = useCallback(() => {
    clearInterval(interval.current);
  }, []);

  useEffect(() => {
    if (prevStartedAt) {
      if (!startedAt) {
        stop();
      }
    } else if (startedAt) {
      start();
    }
  }, [startedAt, prevStartedAt, start, stop]);

  useEffect(
    () => () => {
      stop();
    },
    [stop],
  );

  const contentNode = (
    <span
      className={classNames(
        styles.wrapper,
        styles[`wrapper${upperFirst(size)}`],
        startedAt && styles.wrapperActive,
        onClick && styles.wrapperHoverable,
      )}
    >
      {formatStopwatch({ startedAt, total })}
    </span>
  );

  const ElementType = as;

  return onClick ? (
    <ElementType type="button" disabled={isDisabled} className={styles.button} onClick={onClick}>
      {contentNode}
    </ElementType>
  ) : (
    contentNode
  );
});

Stopwatch.propTypes = {
  as: PropTypes.elementType,
  startedAt: PropTypes.instanceOf(Date),
  total: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
  size: PropTypes.oneOf(Object.values(SIZES)),
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
};

Stopwatch.defaultProps = {
  as: 'button',
  startedAt: undefined,
  size: SIZES.MEDIUM,
  isDisabled: false,
  onClick: undefined,
};

export default Stopwatch;
