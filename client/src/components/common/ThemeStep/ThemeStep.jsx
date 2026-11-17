/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Icon, Menu } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import { useTheme } from '../../../hooks';
import { Themes } from '../../../constants/Enums';
import { ThemeIcons } from '../../../constants/Icons';

import styles from './ThemeStep.module.scss';

const TITLES = {
  [Themes.LIGHT]: 'common.light',
  [Themes.DARK]: 'common.dark',
  [Themes.SYSTEM]: 'common.systemDefault',
};

const ThemeStep = React.memo(({ onClose }) => {
  const [theme, setTheme] = useTheme();
  const [t] = useTranslation();

  const handleSelectClick = useCallback(
    (_, { value }) => {
      setTheme(value);
      onClose();
    },
    [setTheme, onClose],
  );

  return (
    <>
      <Popup.Header>{t('common.theme')}</Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          {[Themes.LIGHT, Themes.DARK, Themes.SYSTEM].map((value) => (
            <Menu.Item
              key={value}
              value={value}
              active={value === theme}
              className={styles.menuItem}
              onClick={handleSelectClick}
            >
              <Icon name={ThemeIcons[value]} className={styles.menuItemIcon} />
              {t(TITLES[value])}
              {value === theme && <Icon name="check" className={styles.menuItemCheck} />}
            </Menu.Item>
          ))}
        </Menu>
      </Popup.Content>
    </>
  );
});

ThemeStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ThemeStep;
