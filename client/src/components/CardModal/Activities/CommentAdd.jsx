import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../../lib/hooks';

import { useClosableForm, useForm } from '../../../hooks';

import styles from './CommentAdd.module.scss';
import Tag from '../../Tag/Tag';
import useMention from '../../../hooks/use-mention';

const DEFAULT_DATA = {
  text: '',
};

const CommentAdd = React.memo(({ onCreate, boardMemberships }) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [selectTextFieldState, selectTextField] = useToggle();
  const [cursor, setCursor] = useState(0);
  const textField = useRef(null);
  const { mention, onChange, onSelectMention, isMentioning } = useMention();

  const close = useCallback(() => {
    if (isMentioning) return;
    setIsOpened(false);
  }, [isMentioning]);

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

  const calculatePosition = (position) => Math.min(position, 22) * 8;

  const handleFieldKeyDown = useCallback(
    (ev) => {
      if (ev.ctrlKey && ev.key === 'Enter') {
        submit();
      }
      setCursor(calculatePosition(ev.target.selectionStart));
      onChange(ev);
    },
    [submit, onChange],
  );

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut] = useClosableForm(close);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleChange = (ev, updatedData) => {
    handleFieldChange(ev, updatedData);
    onChange(ev);
  };

  const handleMention = (user) => {
    setData({
      text: onSelectMention(data.text, user),
    });
  };

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
        onChange={handleChange}
        onBlur={handleFieldBlur}
      />
      {isMentioning && (
        <div
          style={{
            marginLeft: `${cursor}px`,
            position: 'absolute',
            left: `${cursor}px`,
            bottom: '120px',
          }}
        >
          {' '}
          <Tag
            search={mention}
            boardMemberships={boardMemberships}
            handleUserSelect={handleMention}
          />
        </div>
      )}
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
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default CommentAdd;
