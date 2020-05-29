import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-textarea-autosize';
import { TextArea } from 'semantic-ui-react';
import { useDidUpdate, usePrevious } from '../../lib/hooks';

import { useField } from '../../hooks';

import styles from './NameField.module.scss';

const NameField = React.memo(({ defaultValue, onUpdate }) => {
  const prevDefaultValue = usePrevious(defaultValue);
  const [value, handleChange, setValue] = useField(defaultValue);

  const isFocused = useRef(false);

  const handleFocus = useCallback(() => {
    isFocused.current = true;
  }, []);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      event.target.blur();
    }
  }, []);

  const handleBlur = useCallback(() => {
    isFocused.current = false;

    const cleanValue = value.trim();

    if (cleanValue) {
      if (cleanValue !== defaultValue) {
        onUpdate(cleanValue);
      }
    } else {
      setValue(defaultValue);
    }
  }, [defaultValue, onUpdate, value, setValue]);

  useDidUpdate(() => {
    if (!isFocused.current && defaultValue !== prevDefaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue, prevDefaultValue, setValue]);

  return (
    <TextArea
      as={TextareaAutosize}
      value={value}
      spellCheck={false}
      className={styles.field}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});

NameField.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default NameField;
