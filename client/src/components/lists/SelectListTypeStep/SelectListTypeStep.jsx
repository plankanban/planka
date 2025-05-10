/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Icon, Menu } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import { ListTypes } from '../../../constants/Enums';
import { ListTypeIcons } from '../../../constants/Icons';

import styles from './SelectListTypeStep.module.scss';

const DESCRIPTION_BY_TYPE = {
  [ListTypes.ACTIVE]: 'common.cardsOnThisListAreReadyToBeWorkedOn',
  [ListTypes.CLOSED]: 'common.cardsOnThisListAreCompleteAndReadyToBeArchived',
};

const SelectListTypeStep = React.memo(
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

          onClose();
        }
      },
      [defaultValue, withButton, onSelect, onClose],
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
              {[ListTypes.ACTIVE, ListTypes.CLOSED].map((type) => (
                <Menu.Item
                  key={type}
                  value={type}
                  active={type === value}
                  className={styles.menuItem}
                  onClick={handleSelectClick}
                >
                  <Icon name={ListTypeIcons[type]} className={styles.menuItemIcon} />
                  <div className={styles.menuItemTitle}>{t(`common.${type}`)}</div>
                  <p className={styles.menuItemDescription}>{t(DESCRIPTION_BY_TYPE[type])}</p>
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

SelectListTypeStep.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  title: PropTypes.string,
  withButton: PropTypes.bool,
  buttonContent: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

SelectListTypeStep.defaultProps = {
  title: 'common.selectType',
  withButton: false,
  buttonContent: 'action.selectType',
  onBack: undefined,
};

export default SelectListTypeStep;
