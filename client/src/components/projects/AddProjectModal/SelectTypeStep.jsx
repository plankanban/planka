/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Icon, Menu } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import { ProjectTypes } from '../../../constants/Enums';
import { ProjectTypeIcons } from '../../../constants/Icons';

import styles from './SelectTypeStep.module.scss';

const DESCRIPTION_BY_TYPE = {
  [ProjectTypes.PRIVATE]: 'common.forPersonalProjects',
  [ProjectTypes.SHARED]: 'common.forTeamBasedProjects',
};

const SelectTypeStep = React.memo(({ value, onSelect, onClose }) => {
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
        {t('common.selectType', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          {[ProjectTypes.PRIVATE, ProjectTypes.SHARED].map((type) => (
            <Menu.Item
              key={type}
              value={type}
              active={type === value}
              className={styles.menuItem}
              onClick={handleSelectClick}
            >
              <Icon name={ProjectTypeIcons[type]} className={styles.menuItemIcon} />
              <div className={styles.menuItemTitle}>{t(`common.${type}`)}</div>
              <p className={styles.menuItemDescription}>{t(DESCRIPTION_BY_TYPE[type])}</p>
            </Menu.Item>
          ))}
        </Menu>
      </Popup.Content>
    </>
  );
});

SelectTypeStep.propTypes = {
  value: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SelectTypeStep;
