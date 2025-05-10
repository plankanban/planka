/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea } from 'semantic-ui-react';
import { useClickAwayListener, useDidUpdate, useToggle } from '../../../lib/hooks';

import entryActions from '../../../entry-actions';
import { useEscapeInterceptor, useForm, useNestedRef } from '../../../hooks';
import { isModifierKeyPressed } from '../../../utils/event-helpers';

import styles from './Add.module.scss';

const DEFAULT_DATA = {
  text: '',
};

const Add = React.memo(() => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [selectTextFieldState, selectTextField] = useToggle();

  const [textFieldRef, handleTextFieldRef] = useNestedRef();
  const [buttonRef, handleButtonRef] = useNestedRef();

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      text: data.text.trim(),
    };

    if (!cleanData.text) {
      textFieldRef.current.select();
      return;
    }

    dispatch(entryActions.createCommentInCurrentCard(cleanData));
    setData(DEFAULT_DATA);
    selectTextField();
  }, [dispatch, data, setData, selectTextField, textFieldRef]);

  const handleEscape = useCallback(() => {
    setIsOpened(false);
    textFieldRef.current.blur();
  }, [textFieldRef]);

  const [activateEscapeInterceptor, deactivateEscapeInterceptor] =
    useEscapeInterceptor(handleEscape);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleFieldFocus = useCallback(() => {
    setIsOpened(true);
  }, []);

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (isModifierKeyPressed(event) && event.key === 'Enter') {
        submit();
      }
    },
    [submit],
  );

  const handleAwayClick = useCallback(() => {
    setIsOpened(false);
  }, []);

  const handleClickAwayCancel = useCallback(() => {
    textFieldRef.current.focus();
  }, [textFieldRef]);

  const clickAwayProps = useClickAwayListener(
    [textFieldRef, buttonRef],
    handleAwayClick,
    handleClickAwayCancel,
  );

  useDidUpdate(() => {
    if (isOpened) {
      activateEscapeInterceptor();
    } else {
      deactivateEscapeInterceptor();
    }
  }, [isOpened]);

  useDidUpdate(() => {
    textFieldRef.current.focus();
  }, [selectTextFieldState]);

  return (
    <Form onSubmit={handleSubmit}>
      <TextArea
        {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
        ref={handleTextFieldRef}
        as={TextareaAutosize}
        name="text"
        value={data.text}
        placeholder={t('common.writeComment')}
        maxLength={1048576}
        minRows={isOpened ? 3 : 1}
        spellCheck={false}
        className={styles.field}
        onFocus={handleFieldFocus}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
      />
      {isOpened && (
        <div className={styles.controls}>
          <Button
            {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
            positive
            ref={handleButtonRef}
            content={t('action.addComment')}
            className={styles.button}
          />
        </div>
      )}
    </Form>
  );
});

export default Add;
