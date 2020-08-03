import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea } from 'semantic-ui-react';

import { useForm } from '../../../hooks';

import styles from './CommentAdd.module.scss';

const DEFAULT_DATA = {
  text: '',
};

const CommentAdd = React.memo(({ onCreate }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);

  const textField = useRef(null);

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
  }, [onCreate, data, setData]);

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        submit();
      }
    },
    [submit],
  );

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  return (
    <Form onSubmit={handleSubmit}>
      <TextArea
        ref={textField}
        as={TextareaAutosize}
        name="text"
        value={data.text}
        placeholder={t('common.writeComment')}
        minRows={3}
        spellCheck={false}
        className={styles.field}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
      />
      <div className={styles.controls}>
        <Button positive content={t('action.addComment')} disabled={!data.text} />
      </div>
    </Form>
  );
});

CommentAdd.propTypes = {
  onCreate: PropTypes.func.isRequired,
};

export default CommentAdd;
