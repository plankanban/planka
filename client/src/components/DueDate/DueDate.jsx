import upperFirst from 'lodash/upperFirst';
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';
import { useForceUpdate } from '../../lib/hooks';

import getDateFormat from '../../utils/get-date-format';

import styles from './DueDate.module.scss';

const SIZES = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

const STATUSES = {
  DUE_SOON: 'dueSoon',
  OVERDUE: 'overdue',
  COMPLETED: 'completed',
};

const LONG_DATE_FORMAT_BY_SIZE = {
  tiny: 'longDate',
  small: 'longDate',
  medium: 'longDateTime',
};

const FULL_DATE_FORMAT_BY_SIZE = {
  tiny: 'fullDate',
  small: 'fullDate',
  medium: 'fullDateTime',
};

const STATUS_ICON_PROPS_BY_STATUS = {
  [STATUSES.DUE_SOON]: {
    name: 'hourglass half',
    color: 'orange',
  },
  [STATUSES.OVERDUE]: {
    name: 'hourglass end',
    color: 'red',
  },
  [STATUSES.COMPLETED]: {
    name: 'checkmark',
    color: 'green',
  },
};

const getStatus = (dateTime, isCompleted) => {
  if (isCompleted) {
    return STATUSES.COMPLETED;
  }

  const secondsLeft = Math.floor((dateTime.getTime() - new Date().getTime()) / 1000);

  if (secondsLeft <= 0) {
    return STATUSES.OVERDUE;
  }

  if (secondsLeft <= 24 * 60 * 60) {
    return STATUSES.DUE_SOON;
  }

  return null;
};

const DueDate = React.memo(({ value, size, isCompleted, isDisabled, withStatusIcon, onClick }) => {
  const [t] = useTranslation();
  const forceUpdate = useForceUpdate();

  const statusRef = useRef(null);
  statusRef.current = getStatus(value, isCompleted);

  const intervalRef = useRef(null);

  const dateFormat = getDateFormat(
    value,
    LONG_DATE_FORMAT_BY_SIZE[size],
    FULL_DATE_FORMAT_BY_SIZE[size],
  );

  useEffect(() => {
    if ([null, STATUSES.DUE_SOON].includes(statusRef.current)) {
      intervalRef.current = setInterval(() => {
        const status = getStatus(value, isCompleted);

        if (status !== statusRef.current) {
          forceUpdate();
        }

        if (status === STATUSES.OVERDUE) {
          clearInterval(intervalRef.current);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [value, isCompleted, forceUpdate]);

  const contentNode = (
    <span
      className={classNames(
        styles.wrapper,
        styles[`wrapper${upperFirst(size)}`],
        !withStatusIcon && statusRef.current && styles[`wrapper${upperFirst(statusRef.current)}`],
        onClick && styles.wrapperHoverable,
      )}
    >
      {t(`format:${dateFormat}`, {
        value,
        postProcess: 'formatDate',
      })}
      {withStatusIcon && statusRef.current && (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Icon {...STATUS_ICON_PROPS_BY_STATUS[statusRef.current]} className={styles.statusIcon} />
      )}
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

DueDate.propTypes = {
  value: PropTypes.instanceOf(Date).isRequired,
  size: PropTypes.oneOf(Object.values(SIZES)),
  isCompleted: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool,
  withStatusIcon: PropTypes.bool,
  onClick: PropTypes.func,
  onCompletionToggle: PropTypes.func,
};

DueDate.defaultProps = {
  size: SIZES.MEDIUM,
  isDisabled: false,
  withStatusIcon: false,
  onClick: undefined,
  onCompletionToggle: undefined,
};

export default DueDate;
