import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './Deadline.module.css';

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
  },
};

const FORMATS = {
  tiny: 'longDate',
  small: 'longDate',
  medium: 'longDateTime',
};

const Deadline = React.memo(({
  value, size, isDisabled, onClick,
}) => {
  const [t] = useTranslation();

  const style = {
    ...STYLES[size],
  };

  const contentNode = (
    <span className={classNames(styles.wrapper, onClick && styles.hoverable)} style={style}>
      {t(`format:${FORMATS[size]}`, {
        value,
        postProcess: 'formatDate',
      })}
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

Deadline.propTypes = {
  value: PropTypes.instanceOf(Date).isRequired,
  size: PropTypes.oneOf(Object.values(SIZES)),
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
};

Deadline.defaultProps = {
  size: SIZES.MEDIUM,
  isDisabled: false,
  onClick: undefined,
};

export default Deadline;
