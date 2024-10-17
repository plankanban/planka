import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../../lib/hooks';

import { useClosableForm, useForm } from '../../../hooks';

import styles from './CommentAdd.module.scss';

const DEFAULT_DATA = {
  text: '',
};

const CommentAdd = React.memo(({ onCreate }) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [selectTextFieldState, selectTextField] = useToggle();

  const textField = useRef(null);

  const close = useCallback(() => {
    setIsOpened(false);
  }, []);

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      text: data.text.trim(),
    };

    if (!cleanData.text) {
      textField.current.ref.current.select();
      return;
    }

    onCreate(cleanData);

    setData(DEFAULT_DATA);
    selectTextField();
  }, [onCreate, data, setData, selectTextField]);

  const handleFieldFocus = useCallback(() => {
    setIsOpened(true);
  }, []);

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        submit();
      }
    },
    [submit],
  );

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut] = useClosableForm(close);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  useDidUpdate(() => {
    textField.current.ref.current.focus();
  }, [selectTextFieldState]);

  return (
    <Form onSubmit={handleSubmit}>
      <TextArea
        ref={textField}
        as={TextareaAutosize}
        name="text"
        value={data.text}
        placeholder={t('common.writeComment')}
        minRows={isOpened ? 3 : 1}
        spellCheck={false}
        className={styles.field}
        onFocus={handleFieldFocus}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
      />
      {isOpened && (
        <div className={styles.controls}>
          <Button
            positive
            content={t('action.addComment')}
            onMouseOver={handleControlMouseOver}
            onMouseOut={handleControlMouseOut}
          />
        </div>
      )}
    </Form>
  );
});

CommentAdd.propTypes = {
  onCreate: PropTypes.func.isRequired,
};

export default CommentAdd;
