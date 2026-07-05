/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from 'semantic-ui-react';
import { Input } from '../../../lib/custom-ui';

import LABEL_COLORS from '../../../constants/LabelColors';

import styles from './OptionsEditor.module.scss';
import globalStyles from '../../../styles.module.scss';

const OptionsEditor = React.memo(({ options, onChange }) => {
  const [t] = useTranslation();

  const handleNameChange = useCallback(
    (index, event) => {
      const nextOptions = options.slice();
      nextOptions[index] = {
        ...nextOptions[index],
        name: event.target.value,
      };

      onChange(nextOptions);
    },
    [options, onChange],
  );

  const handleColorClick = useCallback(
    (index, color) => {
      const nextOptions = options.slice();
      nextOptions[index] = {
        ...nextOptions[index],
        color: nextOptions[index].color === color ? null : color,
      };

      onChange(nextOptions);
    },
    [options, onChange],
  );

  const handleAddClick = useCallback(() => {
    onChange([
      ...options,
      {
        id: null,
        name: '',
        color: null,
      },
    ]);
  }, [options, onChange]);

  const handleRemoveClick = useCallback(
    (index) => {
      onChange(options.filter((_option, currentIndex) => currentIndex !== index));
    },
    [options, onChange],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.text}>{t('common.options')}</div>
      {options.map((option, index) => (
        <div
          /* eslint-disable-next-line react/no-array-index-key */
          key={index}
          className={styles.option}
        >
          <div className={styles.optionRow}>
            <Input
              fluid
              value={option.name}
              maxLength={128}
              className={styles.optionNameField}
              onChange={(event) => handleNameChange(index, event)}
            />
            <Button
              type="button"
              className={styles.removeButton}
              onClick={() => handleRemoveClick(index)}
            >
              <Icon fitted name="close" />
            </Button>
          </div>
          <div className={styles.colorButtons}>
            {LABEL_COLORS.map((color) => (
              <Button
                key={color}
                type="button"
                className={classNames(
                  styles.colorButton,
                  color === option.color && styles.colorButtonActive,
                  globalStyles[`background${upperFirst(camelCase(color))}`],
                )}
                onClick={() => handleColorClick(index, color)}
              />
            ))}
          </div>
        </div>
      ))}
      <Button type="button" className={styles.addButton} onClick={handleAddClick}>
        {t('action.addOption')}
      </Button>
    </div>
  );
});

OptionsEditor.propTypes = {
  options: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func.isRequired,
};

export default OptionsEditor;
