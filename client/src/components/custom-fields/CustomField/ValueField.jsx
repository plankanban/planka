/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDidUpdate, usePrevious, useToggle } from '../../../lib/hooks';
import { Input } from '../../../lib/custom-ui';

import { useEscapeInterceptor, useField, useNestedRef } from '../../../hooks';
import { CustomFieldTypes } from '../../../constants/Enums';

import styles from './ValueField.module.scss';

const ValueField = React.memo(({ defaultValue, type, onUpdate, ...props }) => {
  const prevDefaultValue = usePrevious(defaultValue);
  const [value, handleChange, setValue] = useField(defaultValue || '');
  const [blurFieldState, blurField] = useToggle();

  const [fieldRef, handleFieldRef] = useNestedRef('inputRef');
  const isFocusedRef = useRef(false);

  const handleEscape = useCallback(() => {
    setValue(defaultValue || '');
    blurField();
  }, [defaultValue, setValue, blurField]);

  const [activateEscapeInterceptor, deactivateEscapeInterceptor] =
    useEscapeInterceptor(handleEscape);

  const handleFocus = useCallback(() => {
    activateEscapeInterceptor();
    isFocusedRef.current = true;
  }, [activateEscapeInterceptor]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        fieldRef.current.blur();
      }
    },
    [fieldRef],
  );

  const handleBlur = useCallback(() => {
    deactivateEscapeInterceptor();
    isFocusedRef.current = false;

    const cleanValue = value.trim() || null;

    if (cleanValue !== null) {
      if (type === CustomFieldTypes.NUMBER) {
        if (!Number.isFinite(Number(cleanValue))) {
          setValue(defaultValue || '');
          return;
        }
      } else if (type === CustomFieldTypes.DATE) {
        const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
        if (!DATE_REGEX.test(cleanValue) || Number.isNaN(Date.parse(cleanValue))) {
          setValue(defaultValue || '');
          return;
        }
      }
    }

    if (cleanValue !== defaultValue) {
      onUpdate(cleanValue);
    }
  }, [defaultValue, type, onUpdate, value, setValue, deactivateEscapeInterceptor]);

  useDidUpdate(() => {
    if (!isFocusedRef.current && defaultValue !== prevDefaultValue) {
      setValue(defaultValue || '');
    }
  }, [defaultValue, prevDefaultValue]);

  useDidUpdate(() => {
    fieldRef.current.blur();
  }, [blurFieldState]);

  let inputType = 'text';
  if (type === CustomFieldTypes.NUMBER) inputType = 'number';
  else if (type === CustomFieldTypes.DATE) inputType = 'date';

  return (
    <Input
      {...props} // eslint-disable-line react/jsx-props-no-spreading
      fluid
      ref={handleFieldRef}
      type={inputType}
      value={value}
      maxLength={type === CustomFieldTypes.TEXT ? 512 : undefined}
      className={styles.field}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});

ValueField.propTypes = {
  defaultValue: PropTypes.string,
  type: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
};

ValueField.defaultProps = {
  defaultValue: undefined,
  type: CustomFieldTypes.TEXT,
};

export default ValueField;
