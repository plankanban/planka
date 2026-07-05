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
import CustomFieldTypes, {
  CUSTOM_FIELD_TYPE_LABEL_KEYS_BY_TYPE,
} from '../../../constants/CustomFieldTypes';
import OptionsEditor from '../../custom-fields/OptionsEditor';

import styles from './CustomFieldEditor.module.scss';

const CustomFieldEditor = React.forwardRef(({ data, onFieldChange, onOptionsChange }, ref) => {
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

  const typeOptions = Object.values(CustomFieldTypes).map((type) => ({
    value: type,
    text: t(CUSTOM_FIELD_TYPE_LABEL_KEYS_BY_TYPE[type]),
  }));

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
      <div className={styles.text}>{t('common.type')}</div>
      <Dropdown
        fluid
        selection
        name="type"
        options={typeOptions}
        value={data.type}
        className={styles.fieldType}
        onChange={onFieldChange}
      />
      {data.type === CustomFieldTypes.DROPDOWN && (
        <OptionsEditor options={data.config.options || []} onChange={onOptionsChange} />
      )}
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
  onFieldChange: PropTypes.func.isRequired,
  onOptionsChange: PropTypes.func.isRequired,
};

export default React.memo(CustomFieldEditor);
