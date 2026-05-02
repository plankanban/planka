/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Dropdown, Radio } from 'semantic-ui-react';
import { Input } from '../../../lib/custom-ui';

import { useNestedRef } from '../../../hooks';
import { CustomFieldTypes } from '../../../constants/Enums';

import styles from './CustomFieldEditor.module.scss';

const CustomFieldEditor = React.forwardRef(({ data, isTypeEditable, onFieldChange }, ref) => {
  const [t] = useTranslation();

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const selectNameField = useCallback(() => {
    nameFieldRef.current.select();
  }, [nameFieldRef]);

  useImperativeHandle(
    ref,
    () => ({
      selectNameField,
    }),
    [selectNameField],
  );

  useEffect(() => {
    nameFieldRef.current.focus();
  }, [nameFieldRef]);

  const typeOptions = [
    { value: CustomFieldTypes.TEXT, text: t('common.customFieldType_text') },
    { value: CustomFieldTypes.NUMBER, text: t('common.customFieldType_number') },
    { value: CustomFieldTypes.DATE, text: t('common.customFieldType_date') },
  ];

  const handleTypeChange = useCallback(
    (_, { value }) => {
      onFieldChange(_, { name: 'type', value });
    },
    [onFieldChange],
  );

  return (
    <>
      <div className={styles.text}>{t('common.title')}</div>
      <Input
        fluid
        ref={handleNameFieldRef}
        name="name"
        value={data.name}
        maxLength={128}
        className={styles.fieldName}
        onChange={onFieldChange}
      />
      <div className={classNames(styles.text, styles.fieldLabel)}>{t('common.fieldType')}</div>
      <Dropdown
        fluid
        selection
        name="type"
        options={typeOptions}
        value={data.type || CustomFieldTypes.TEXT}
        disabled={!isTypeEditable}
        className={classNames(styles.field, styles.fieldDropdown)}
        onChange={handleTypeChange}
      />
      <Radio
        toggle
        name="showOnFrontOfCard"
        checked={data.showOnFrontOfCard}
        label={t('common.showOnFrontOfCard')}
        className={classNames(styles.field, styles.fieldRadio)}
        onChange={onFieldChange}
      />
    </>
  );
});

CustomFieldEditor.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isTypeEditable: PropTypes.bool,
  onFieldChange: PropTypes.func.isRequired,
};

CustomFieldEditor.defaultProps = {
  isTypeEditable: true,
};

export default React.memo(CustomFieldEditor);
