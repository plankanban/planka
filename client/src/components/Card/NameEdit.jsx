import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea } from 'semantic-ui-react';

import { useClosableForm, useField } from '../../hooks';
import { focusEnd } from '../../utils/element-helpers';

import styles from './NameEdit.module.scss';

const NameEdit = React.forwardRef(({ children, defaultValue, onUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [value, handleFieldChange, setValue] = useField(defaultValue);

  const field = useRef(null);

  const open = useCallback(() => {
    setIsOpened(true);
    setValue(defaultValue);
  }, [defaultValue, setValue]);

  const close = useCallback(() => {
    setIsOpened(false);
    setValue(null);
  }, [setValue]);

  const submit = useCallback(() => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      field.current.ref.current.select();
      return;
    }

    if (cleanValue !== defaultValue) {
      onUpdate(cleanValue);
    }

    close();
  }, [defaultValue, onUpdate, value, close]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleFieldKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();

          submit();

          break;
        case 'Escape':
          close();

          break;
        default:
      }
    },
    [close, submit],
  );

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut] = useClosableForm(
    close,
    isOpened,
  );

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  useEffect(() => {
    if (isOpened) {
      focusEnd(field.current.ref.current);
    }
  }, [isOpened]);

  if (!isOpened) {
    return children;
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className={styles.fieldWrapper}>
        <TextArea
          ref={field}
          as={TextareaAutosize}
          value={value}
          minRows={3}
          maxRows={8}
          spellCheck={false}
          className={styles.field}
          onKeyDown={handleFieldKeyDown}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
        />
      </div>
      <div className={styles.controls}>
        {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
        <Button
          positive
          content={t('action.save')}
          className={styles.submitButton}
          onMouseOver={handleControlMouseOver}
          onMouseOut={handleControlMouseOut}
        />
      </div>
    </Form>
  );
});

NameEdit.propTypes = {
  children: PropTypes.element.isRequired,
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default React.memo(NameEdit);
