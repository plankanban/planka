/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Icon, Checkbox } from 'semantic-ui-react';
import { useForceUpdate } from '../../../lib/hooks';

import getDateFormat from '../../../utils/get-date-format';

import styles from './DueDateChip.module.scss';

const Sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

const Statuses = {
  DUE_SOON: 'dueSoon',
  OVERDUE: 'overdue',
  COMPLETED: 'completed',
};

const LONG_DATE_FORMAT_BY_SIZE = {
  [Sizes.TINY]: 'longDate',
  [Sizes.SMALL]: 'longDate',
  [Sizes.MEDIUM]: 'longDateTime',
};

const FULL_DATE_FORMAT_BY_SIZE = {
  [Sizes.TINY]: 'fullDate',
  [Sizes.SMALL]: 'fullDate',
  [Sizes.MEDIUM]: 'fullDateTime',
};

const STATUS_ICON_PROPS_BY_STATUS = {
  [Statuses.DUE_SOON]: {
    name: 'hourglass half',
    color: 'orange',
  },
  [Statuses.OVERDUE]: {
    name: 'hourglass end',
    color: 'red',
  },
  [Statuses.COMPLETED]: {
    name: 'checkmark',
    color: 'green',
  },
};

const getStatus = (date, isCompleted) => {
  if (isCompleted) {
    return Statuses.COMPLETED;
  }

  const secondsLeft = Math.floor((date.getTime() - new Date().getTime()) / 1000);

  if (secondsLeft <= 0) {
    return Statuses.OVERDUE;
  }

  if (secondsLeft <= 24 * 60 * 60) {
    return Statuses.DUE_SOON;
  }

  return null;
};

const DueDateChip = React.memo(
  ({
    value,
    size,
    isDisabled,
    withStatus,
    withStatusIcon,
    onClick,
    isCompleted,
    onUpdateCompletion,
  }) => {
    const [t] = useTranslation();
    const forceUpdate = useForceUpdate();

    const statusRef = useRef(null);
    statusRef.current = withStatus ? getStatus(value, isCompleted) : null;

    const intervalRef = useRef(null);

    const dateFormat = getDateFormat(
      value,
      LONG_DATE_FORMAT_BY_SIZE[size],
      FULL_DATE_FORMAT_BY_SIZE[size],
    );

    useEffect(() => {
      if (
        withStatus &&
        statusRef.current !== Statuses.OVERDUE &&
        statusRef.current !== Statuses.COMPLETED
      ) {
        intervalRef.current = setInterval(() => {
          const status = getStatus(value, isCompleted);

          if (status !== statusRef.current) {
            forceUpdate();
          }

          if (status === Statuses.OVERDUE || status === Statuses.COMPLETED) {
            clearInterval(intervalRef.current);
          }
        }, 1000);
      }

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [value, withStatus, forceUpdate, isCompleted]);

    const handleToggleChange = useCallback(
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isDisabled && onUpdateCompletion) {
          onUpdateCompletion(!isCompleted);
        }
      },
      [onUpdateCompletion, isCompleted, isDisabled],
    );

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

    if (onUpdateCompletion) {
      return (
        <div
          className={classNames(
            styles.wrapperGroup,
            statusRef.current && styles[`wrapper${upperFirst(statusRef.current)}`],
          )}
        >
          <button
            type="button"
            aria-label="Toggle completion"
            className={classNames(
              styles.wrapper,
              styles[`wrapper${upperFirst(size)}`],
              styles.wrapperCheckbox,
            )}
            onClick={handleToggleChange}
            disabled={isDisabled}
          >
            <Checkbox
              className={styles.checkbox}
              checked={isCompleted}
              disabled={isDisabled}
              onChange={handleToggleChange}
            />
          </button>
          {onClick ? (
            <button
              type="button"
              disabled={isDisabled}
              className={classNames(
                styles.wrapper,
                styles[`wrapper${upperFirst(size)}`],
                styles.wrapperButton,
              )}
              onClick={onClick}
            >
              {contentNode}
            </button>
          ) : (
            <span
              className={classNames(
                styles.wrapper,
                styles[`wrapper${upperFirst(size)}`],
                statusRef.current && styles[`wrapper${upperFirst(statusRef.current)}`],
              )}
            >
              {contentNode}
            </span>
          )}
        </div>
      );
    }

    return onClick ? (
      <button type="button" disabled={isDisabled} className={styles.button} onClick={onClick}>
        {contentNode}
      </button>
    ) : (
      contentNode
    );
  },
);

DueDateChip.propTypes = {
  value: PropTypes.instanceOf(Date).isRequired,
  size: PropTypes.oneOf(Object.values(Sizes)),
  isDisabled: PropTypes.bool,
  withStatus: PropTypes.bool.isRequired,
  withStatusIcon: PropTypes.bool,
  onClick: PropTypes.func,
  isCompleted: PropTypes.bool,
  onUpdateCompletion: PropTypes.func,
};

DueDateChip.defaultProps = {
  size: Sizes.MEDIUM,
  isDisabled: false,
  withStatusIcon: false,
  onClick: undefined,
  isCompleted: false,
  onUpdateCompletion: undefined,
};

export default DueDateChip;
