/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import { ListTypes } from '../../../constants/Enums';
import { ListTypeIcons } from '../../../constants/Icons';

import styles from './Item.module.scss';

const Item = React.memo(({ id, isActive, onSelect }) => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const list = useSelector((state) => selectListById(state, id));

  const [t] = useTranslation();

  const handleSelectClick = useCallback(() => {
    if (!isActive && list.isPersisted) {
      onSelect(id);
    }
  }, [id, isActive, onSelect, list.isPersisted]);

  return (
    <div className={styles.wrapper}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                   jsx-a11y/no-static-element-interactions */}
      <span
        className={classNames(styles.name, isActive && styles.nameActive)}
        onClick={handleSelectClick}
      >
        {list.type !== ListTypes.ACTIVE && (
          <Icon name={ListTypeIcons[list.type]} className={styles.nameIcon} />
        )}
        {list.name || t(`common.${list.type}`)}
      </span>
    </div>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Item;
