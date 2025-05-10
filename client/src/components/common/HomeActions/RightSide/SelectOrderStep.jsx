/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Icon, Menu } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import { ProjectOrders } from '../../../../constants/Enums';
import { ProjectOrderIcons } from '../../../../constants/Icons';

import styles from './SelectOrderStep.module.scss';

const SelectOrderStep = React.memo(({ value, onSelect, onClose }) => {
  const [t] = useTranslation();

  const handleSelectClick = useCallback(
    (_, { value: nextValue }) => {
      if (nextValue !== value) {
        onSelect(nextValue);
      }

      onClose();
    },
    [value, onSelect, onClose],
  );

  return (
    <>
      <Popup.Header>
        {t('common.selectOrder', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          {[
            ProjectOrders.BY_DEFAULT,
            ProjectOrders.ALPHABETICALLY,
            ProjectOrders.BY_CREATION_TIME,
          ].map((order) => (
            <Menu.Item
              key={order}
              value={order}
              active={order === value}
              className={styles.menuItem}
              onClick={handleSelectClick}
            >
              <Icon name={ProjectOrderIcons[order]} className={styles.menuItemIcon} />
              {t(`common.${order}`)}
            </Menu.Item>
          ))}
        </Menu>
      </Popup.Content>
    </>
  );
});

SelectOrderStep.propTypes = {
  value: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SelectOrderStep;
