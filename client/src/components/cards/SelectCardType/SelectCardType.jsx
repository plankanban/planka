/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Icon, Menu } from 'semantic-ui-react';

import { CardTypes } from '../../../constants/Enums';
import { CardTypeIcons } from '../../../constants/Icons';

import styles from './SelectCardType.module.scss';

const DESCRIPTION_BY_TYPE = {
  [CardTypes.PROJECT]: 'common.taskAssignmentAndProjectCompletion',
  [CardTypes.STORY]: 'common.referenceDataAndKnowledgeStorage',
};

const SelectCardType = React.memo(({ value, onSelect }) => {
  const [t] = useTranslation();

  const handleSelectClick = useCallback(
    (_, { value: nextValue }) => {
      if (nextValue !== value) {
        onSelect(nextValue);
      }
    },
    [value, onSelect],
  );

  return (
    <Menu secondary vertical className={styles.menu}>
      {[CardTypes.PROJECT, CardTypes.STORY].map((type) => (
        <Menu.Item
          key={type}
          value={type}
          active={type === value}
          className={styles.menuItem}
          onClick={handleSelectClick}
        >
          <Icon name={CardTypeIcons[type]} className={styles.menuItemIcon} />
          <div className={styles.menuItemTitle}>{t(`common.${type}`)}</div>
          <p className={styles.menuItemDescription}>{t(DESCRIPTION_BY_TYPE[type])}</p>
        </Menu.Item>
      ))}
    </Menu>
  );
});

SelectCardType.propTypes = {
  value: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default SelectCardType;
