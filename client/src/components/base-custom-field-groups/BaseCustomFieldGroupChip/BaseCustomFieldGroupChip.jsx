/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';

import styles from './BaseCustomFieldGroupChip.module.scss';

const Sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

const BaseCustomFieldGroupChip = React.memo(({ id, size, onClick }) => {
  const selectBaseCustomFieldGroupById = useMemo(
    () => selectors.makeSelectBaseCustomFieldGroupById(),
    [],
  );

  const baseCustomFieldGroup = useSelector((state) => selectBaseCustomFieldGroupById(state, id));

  const contentNode = (
    <span
      title={baseCustomFieldGroup.name}
      className={classNames(
        styles.wrapper,
        styles[`wrapper${upperFirst(size)}`],
        onClick && styles.wrapperHoverable,
      )}
    >
      {baseCustomFieldGroup.name}
    </span>
  );

  return onClick ? (
    <button
      type="button"
      disabled={!baseCustomFieldGroup.isPersisted}
      className={styles.button}
      onClick={onClick}
    >
      {contentNode}
    </button>
  ) : (
    contentNode
  );
});

BaseCustomFieldGroupChip.propTypes = {
  id: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.values(Sizes)),
  onClick: PropTypes.func,
};

BaseCustomFieldGroupChip.defaultProps = {
  size: Sizes.MEDIUM,
  onClick: undefined,
};

export default BaseCustomFieldGroupChip;
