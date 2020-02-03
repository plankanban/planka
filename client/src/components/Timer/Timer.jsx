import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useForceUpdate, usePrevious } from '../../lib/hooks';

import { formatTimer } from '../../utils/timer';

import styles from './Timer.module.css';

const SIZES = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

// TODO: move to styles
const STYLES = {
  tiny: {
    fontSize: '12px',
    lineHeight: '20px',
    padding: '0px 6px',
  },
  small: {
    fontSize: '12px',
    lineHeight: '20px',
    padding: '2px 6px',
  },
  medium: {
    lineHeight: '20px',
    padding: '6px 12px',
    textDecoration: 'underline',
  },
};

const Timer = React.memo(({ startedAt, total, size, isDisabled, onClick }) => {
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
    <span className={classNames(styles.wrapper, onClick && styles.hoverable)} style={STYLES[size]}>
      {formatTimer({ startedAt, total })}
    </span>
  );

  return onClick ? (
    <button type="button" disabled={isDisabled} className={styles.button} onClick={onClick}>
      {contentNode}
    </button>
  ) : (
    contentNode
  );
});

Timer.propTypes = {
  startedAt: PropTypes.instanceOf(Date),
  total: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
  size: PropTypes.oneOf(Object.values(SIZES)),
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
};

Timer.defaultProps = {
  startedAt: undefined,
  size: SIZES.MEDIUM,
  isDisabled: false,
  onClick: undefined,
};

export default Timer;
