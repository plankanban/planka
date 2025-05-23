/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Icon, Menu } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import { UserRoles } from '../../../../constants/Enums';
import { UserRoleIcons } from '../../../../constants/Icons';

import styles from './SelectRoleStep.module.scss';

const DESCRIPTION_BY_ROLE = {
  [UserRoles.ADMIN]: 'common.canManageSystemWideSettingsAndActAsProjectOwner',
  [UserRoles.PROJECT_OWNER]: 'common.canCreateOwnProjectsAndBeInvitedToWorkInOthers',
  [UserRoles.BOARD_USER]: 'common.canBeInvitedToWorkInBoards',
};

const SelectRoleStep = React.memo(
  ({ defaultValue, title, withButton, buttonContent, onSelect, onBack, onClose }) => {
    const [t] = useTranslation();
    const [value, setValue] = useState(defaultValue);

    const handleSelectClick = useCallback(
      (_, { value: nextValue }) => {
        if (withButton) {
          setValue(nextValue);
        } else {
          if (nextValue !== defaultValue) {
            onSelect(nextValue);
          }

          onBack();
        }
      },
      [defaultValue, withButton, onSelect, onBack],
    );

    const handleSubmit = useCallback(() => {
      if (value !== defaultValue) {
        onSelect(value);
      }

      onClose();
    }, [defaultValue, onSelect, onClose, value]);

    return (
      <>
        <Popup.Header onBack={onBack}>
          {t(title, {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <Form onSubmit={handleSubmit}>
            <Menu secondary vertical className={styles.menu}>
              {[UserRoles.ADMIN, UserRoles.PROJECT_OWNER, UserRoles.BOARD_USER].map((role) => (
                <Menu.Item
                  key={role}
                  value={role}
                  active={role === value}
                  className={styles.menuItem}
                  onClick={handleSelectClick}
                >
                  <Icon name={UserRoleIcons[role]} className={styles.menuItemIcon} />
                  <div className={styles.menuItemTitle}>{t(`common.${role}`)}</div>
                  <p className={styles.menuItemDescription}>{t(DESCRIPTION_BY_ROLE[role])}</p>
                </Menu.Item>
              ))}
            </Menu>
            {withButton && <Button positive content={t(buttonContent)} />}
          </Form>
        </Popup.Content>
      </>
    );
  },
);

SelectRoleStep.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  title: PropTypes.string,
  withButton: PropTypes.bool,
  buttonContent: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

SelectRoleStep.defaultProps = {
  title: 'common.selectRole',
  withButton: false,
  buttonContent: 'action.selectRole',
  onBack: undefined,
};

export default SelectRoleStep;
