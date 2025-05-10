/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';

import styles from './LabelChip.module.scss';
import globalStyles from '../../../styles.module.scss';

const Sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

const LabelChip = React.memo(({ id, size, onClick }) => {
  const selectLabelById = useMemo(() => selectors.makeSelectLabelById(), []);

  const label = useSelector((state) => selectLabelById(state, id));

  const contentNode = (
    <span
      title={label.name}
      className={classNames(
        styles.wrapper,
        !label.name && styles.wrapperNameless,
        styles[`wrapper${upperFirst(size)}`],
        onClick && styles.wrapperHoverable,
        globalStyles[`background${upperFirst(camelCase(label.color))}`],
      )}
    >
      {label.name || '\u00A0'}
    </span>
  );

  return onClick ? (
    <button
      data-id={id}
      type="button"
      disabled={label.isDisabled}
      className={styles.button}
      onClick={onClick}
    >
      {contentNode}
    </button>
  ) : (
    contentNode
  );
});

LabelChip.propTypes = {
  id: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.values(Sizes)),
  onClick: PropTypes.func,
};

LabelChip.defaultProps = {
  size: Sizes.MEDIUM,
  onClick: undefined,
};

export default LabelChip;
