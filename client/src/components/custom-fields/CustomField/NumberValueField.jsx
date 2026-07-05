/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDidUpdate, usePrevious, useToggle } from '../../../lib/hooks';
import { Input } from '../../../lib/custom-ui';

import { useEscapeInterceptor, useField, useNestedRef } from '../../../hooks';

import styles from './ValueField.module.scss';

const NumberValueField = React.memo(({ defaultValue, onUpdate, ...props }) => {
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

    const trimmedValue = value.trim();

    if (trimmedValue !== '' && Number.isNaN(Number(trimmedValue))) {
      setValue(defaultValue || '');
      return;
    }

    const cleanValue = trimmedValue || null;

    if (cleanValue !== (defaultValue || null)) {
      onUpdate(cleanValue);
    }
  }, [defaultValue, onUpdate, value, deactivateEscapeInterceptor, setValue]);

  useDidUpdate(() => {
    if (!isFocusedRef.current && defaultValue !== prevDefaultValue) {
      setValue(defaultValue || '');
    }
  }, [defaultValue, prevDefaultValue]);

  useDidUpdate(() => {
    fieldRef.current.blur();
  }, [blurFieldState]);

  return (
    <Input
      {...props} // eslint-disable-line react/jsx-props-no-spreading
      fluid
      type="number"
      ref={handleFieldRef}
      value={value}
      className={styles.field}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});

NumberValueField.propTypes = {
  defaultValue: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
};

NumberValueField.defaultProps = {
  defaultValue: undefined,
};

export default NumberValueField;
