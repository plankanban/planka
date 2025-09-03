/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import TextareaAutosize from 'react-textarea-autosize';
import { TextArea } from 'semantic-ui-react';
import { useDidUpdate, usePrevious, useToggle } from '../../../lib/hooks';

import { useEscapeInterceptor, useField, useNestedRef } from '../../../hooks';

import styles from './NameField.module.scss';

const Sizes = {
  MEDIUM: 'medium',
  LARGE: 'large',
};

const NameField = React.memo(({ defaultValue, size, onUpdate }) => {
  const prevDefaultValue = usePrevious(defaultValue);
  const [value, handleChange, setValue] = useField(defaultValue);
  const [blurFieldState, blurField] = useToggle();

  const [fiedRef, handleFieldRef] = useNestedRef();
  const isFocusedRef = useRef(false);

  const handleEscape = useCallback(() => {
    setValue(defaultValue);
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
        fiedRef.current.blur();
      }
    },
    [fiedRef],
  );

  const handleBlur = useCallback(() => {
    deactivateEscapeInterceptor();
    isFocusedRef.current = false;

    const cleanValue = value.trim();

    if (cleanValue) {
      if (cleanValue !== defaultValue) {
        onUpdate(cleanValue);
      }
    } else {
      setValue(defaultValue);
    }
  }, [defaultValue, onUpdate, value, setValue, deactivateEscapeInterceptor]);

  useDidUpdate(() => {
    if (!isFocusedRef.current && defaultValue !== prevDefaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue, prevDefaultValue]);

  useDidUpdate(() => {
    fiedRef.current.blur();
  }, [blurFieldState]);

  return (
    <TextArea
      ref={handleFieldRef}
      as={TextareaAutosize}
      value={value}
      maxLength={1024}
      className={classNames(styles.field, styles[`field${upperFirst(size)}`])}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});

NameField.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.values(Sizes)),
  onUpdate: PropTypes.func.isRequired,
};

NameField.defaultProps = {
  size: Sizes.MEDIUM,
};

export default NameField;
