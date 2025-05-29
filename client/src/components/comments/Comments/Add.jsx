/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { MentionsInput, Mention } from 'react-mentions';
import { useClickAwayListener, useDidUpdate, useToggle } from '../../../lib/hooks';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useEscapeInterceptor, useForm, useNestedRef } from '../../../hooks';
import { isModifierKeyPressed } from '../../../utils/event-helpers';
import UserAvatar, { Sizes } from '../../users/UserAvatar/UserAvatar';

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

  const textFieldRef = useRef(null);
  const mentionsInputRef = useRef(null);
  const [buttonRef, handleButtonRef] = useNestedRef();

  const mentionsInputStyle = {
    control: {
      minHeight: isOpened ? '60px' : '36px',
    },
  };

  const renderSuggestion = useCallback(
    (suggestion, search, highlightedDisplay) => (
      <div className={styles.suggestion}>
        <UserAvatar id={suggestion.id} size={Sizes.TINY} />
        <span className={styles.suggestionText}>{highlightedDisplay}</span>
      </div>
    ),
    [],
  );

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      text: data.text.trim(),
    };

    if (!cleanData.text) {
      textFieldRef.current?.focus();
      return;
    }

    dispatch(entryActions.createCommentInCurrentCard(cleanData));
    setData(DEFAULT_DATA);
    selectTextField();
  }, [dispatch, data, setData, selectTextField, textFieldRef]);

  const handleEscape = useCallback(() => {
    if (mentionsInputRef?.current?.isOpened()) {
      mentionsInputRef?.current.clearSuggestions();
      return;
    }
    setIsOpened(false);
    textFieldRef.current?.blur();
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
    textFieldRef.current?.focus();
  }, [textFieldRef]);

  const clickAwayProps = useClickAwayListener(
    [textFieldRef, buttonRef],
    handleAwayClick,
    handleClickAwayCancel,
  );

  const users = useSelector(selectors.selectMembershipsForCurrentBoard);

  const handleFormFieldChange = useCallback(
    (event, newValue) => {
      handleFieldChange(null, {
        name: 'text',
        value: newValue,
      });
    },
    [handleFieldChange],
  );

  useDidUpdate(() => {
    if (isOpened) {
      activateEscapeInterceptor();
    } else {
      deactivateEscapeInterceptor();
    }
  }, [isOpened]);

  useDidUpdate(() => {
    textFieldRef.current?.focus();
  }, [selectTextFieldState]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={styles.field}>
        <MentionsInput
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...clickAwayProps}
          ref={mentionsInputRef}
          inputRef={textFieldRef}
          value={data.text}
          placeholder={t('common.writeComment')}
          className="mentions-input"
          style={mentionsInputStyle}
          onFocus={handleFieldFocus}
          onChange={handleFormFieldChange}
          onKeyDown={handleFieldKeyDown}
          allowSpaceInQuery
          singleLine={false}
          rows={isOpened ? 3 : 1}
          maxLength={1048576}
        >
          <Mention
            trigger="@"
            data={users.map((membership) => ({
              id: membership.user.id,
              display: membership.user.username || membership.user.name,
            }))}
            markup="@[__display__](__id__)"
            appendSpaceOnAdd
            displayTransform={(id, display) => `@${display}`}
            renderSuggestion={renderSuggestion}
          />
        </MentionsInput>
      </div>
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
