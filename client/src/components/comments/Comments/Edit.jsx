/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Mention, MentionsInput } from 'react-mentions';
import { Button, Form } from 'semantic-ui-react';
import { useClickAwayListener } from '../../../lib/hooks';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';
import { focusEnd } from '../../../utils/element-helpers';
import { isModifierKeyPressed } from '../../../utils/event-helpers';
import UserAvatar from '../../users/UserAvatar';

import styles from './Edit.module.scss';

const Edit = React.memo(({ commentId, onClose }) => {
  const selectCommentById = useMemo(() => selectors.makeSelectCommentById(), []);

  const comment = useSelector((state) => selectCommentById(state, commentId));
  const boardMemberships = useSelector(selectors.selectMembershipsForCurrentBoard);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultData = useMemo(
    () => ({
      text: comment.text,
    }),
    [comment.text],
  );

  const [data, , setData] = useForm(() => ({
    text: '',
    ...defaultData,
  }));

  const textFieldRef = useRef(null);
  const textMentionsRef = useRef(null);
  const textInputRef = useRef(null);
  const [submitButtonRef, handleSubmitButtonRef] = useNestedRef();
  const [cancelButtonRef, handleCancelButtonRef] = useNestedRef();

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      text: data.text.trim(),
    };

    if (cleanData.text && !dequal(cleanData, defaultData)) {
      dispatch(entryActions.updateComment(commentId, cleanData));
    }

    onClose();
  }, [commentId, onClose, dispatch, defaultData, data]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleFieldChange = useCallback(
    (_, text) => {
      setData({
        text,
      });
    },
    [setData],
  );

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        if (isModifierKeyPressed(event)) {
          submit();
        }
      } else if (event.key === 'Escape') {
        if (textMentionsRef.current.isOpened()) {
          textMentionsRef.current.clearSuggestions();
          return;
        }

        onClose();
      }
    },
    [onClose, submit],
  );

  const handleCancelClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleClickAwayCancel = useCallback(() => {
    textInputRef.current.focus();
  }, []);

  const clickAwayProps = useClickAwayListener(
    [textFieldRef, submitButtonRef, cancelButtonRef],
    submit,
    handleClickAwayCancel,
  );

  const suggestionRenderer = useCallback(
    (entry, _, highlightedDisplay) => (
      <div className={styles.suggestion}>
        <UserAvatar id={entry.id} size="tiny" />
        {highlightedDisplay}
      </div>
    ),
    [],
  );

  useEffect(() => {
    focusEnd(textInputRef.current);
  }, []);

  return (
    <Form onSubmit={handleSubmit}>
      <div ref={textFieldRef} className={styles.field}>
        <MentionsInput
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          allowSpaceInQuery
          allowSuggestionsAboveCursor
          ref={textMentionsRef}
          inputRef={textInputRef}
          value={data.text}
          maxLength={1048576}
          rows={3}
          className="mentions-input"
          style={{
            control: {
              minHeight: '79px',
            },
          }}
          onChange={handleFieldChange}
          onKeyDown={handleFieldKeyDown}
        >
          <Mention
            appendSpaceOnAdd
            data={boardMemberships.map(({ user }) => ({
              id: user.id,
              display: user.username || user.name,
            }))}
            displayTransform={(_, display) => `@${display}`}
            renderSuggestion={suggestionRenderer}
            className={styles.mention}
          />
        </MentionsInput>
      </div>
      <div className={styles.controls}>
        <Button
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          positive
          ref={handleSubmitButtonRef}
          content={t('action.save')}
        />
        <Button
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          ref={handleCancelButtonRef}
          type="button"
          content={t('action.cancel')}
          onClick={handleCancelClick}
        />
      </div>
    </Form>
  );
});

Edit.propTypes = {
  commentId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Edit;
