/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useForceUpdate, usePrevious } from '../../../lib/hooks';

import { formatStopwatch } from '../../../utils/stopwatch';

import styles from './StopwatchChip.module.scss';

const Sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

const StopwatchChip = React.memo(({ value, as, size, isDisabled, onClick }) => {
  const prevStartedAt = usePrevious(value.startedAt);
  const forceUpdate = useForceUpdate();

  const intervalRef = useRef(null);

  const onStart = useCallback(() => {
    intervalRef.current = setInterval(() => {
      forceUpdate();
    }, 1000);
  }, [forceUpdate]);

  const onStop = useCallback(() => {
    clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (prevStartedAt) {
      if (!value.startedAt) {
        onStop();
      }
    } else if (value.startedAt) {
      onStart();
    }
  }, [value.startedAt, prevStartedAt, onStart, onStop]);

  useEffect(
    () => () => {
      onStop();
    },
    [onStop],
  );

  const contentNode = (
    <span
      className={classNames(
        styles.wrapper,
        styles[`wrapper${upperFirst(size)}`],
        value.startedAt && styles.wrapperActive,
        onClick && styles.wrapperHoverable,
      )}
    >
      {formatStopwatch(value)}
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

StopwatchChip.propTypes = {
  value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  as: PropTypes.elementType,
  size: PropTypes.oneOf(Object.values(Sizes)),
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
};

StopwatchChip.defaultProps = {
  as: 'button',
  size: Sizes.MEDIUM,
  isDisabled: false,
  onClick: undefined,
};

export default StopwatchChip;
