/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../lib/custom-ui';

import { useNestedRef } from '../../../hooks';

import styles from './CustomFieldGroupEditor.module.scss';

const CustomFieldGroupEditor = React.forwardRef(({ data, onFieldChange }, ref) => {
  const [t] = useTranslation();

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const focusNameField = useCallback(() => {
    nameFieldRef.current.focus({
      preventScroll: true,
    });
  }, [nameFieldRef]);

  const selectNameField = useCallback(() => {
    nameFieldRef.current.select();
  }, [nameFieldRef]);

  useImperativeHandle(
    ref,
    () => ({
      focusNameField,
      selectNameField,
    }),
    [focusNameField, selectNameField],
  );

  useEffect(() => {
    focusNameField();
  }, [focusNameField]);

  return (
    <>
      <div className={styles.text}>{t('common.title')}</div>
      <Input
        fluid
        ref={handleNameFieldRef}
        name="name"
        value={data.name}
        maxLength={128}
        className={styles.field}
        onChange={onFieldChange}
      />
    </>
  );
});

CustomFieldGroupEditor.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onFieldChange: PropTypes.func.isRequired,
};

export default React.memo(CustomFieldGroupEditor);
