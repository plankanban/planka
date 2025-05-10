/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea } from 'semantic-ui-react';
import { useClickAwayListener, useDidUpdate, useToggle } from '../../../lib/hooks';

import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';
import { focusEnd } from '../../../utils/element-helpers';
import { isModifierKeyPressed } from '../../../utils/event-helpers';

import styles from './AddTask.module.scss';

const DEFAULT_DATA = {
  name: '',
};

const MULTIPLE_REGEX = /\s*\r?\n\s*/;

const AddTask = React.memo(({ children, taskListId, isOpened, onClose }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();

  const [nameFieldRef, handleNameFieldRef] = useNestedRef();
  const [buttonRef, handleButtonRef] = useNestedRef();

  const submit = useCallback(
    (isMultiple = false) => {
      const cleanData = {
        ...data,
        name: data.name.trim(),
      };

      if (!cleanData.name) {
        nameFieldRef.current.select();
        return;
      }

      if (isMultiple) {
        cleanData.name.split(MULTIPLE_REGEX).forEach((name) => {
          dispatch(
            entryActions.createTask(taskListId, {
              ...cleanData,
              name,
            }),
          );
        });
      } else {
        dispatch(entryActions.createTask(taskListId, cleanData));
      }

      setData(DEFAULT_DATA);
      focusNameField();
    },
    [taskListId, dispatch, data, setData, focusNameField, nameFieldRef],
  );

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submit(isModifierKeyPressed(event));
      } else if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose, submit],
  );

  const handleClickAwayCancel = useCallback(() => {
    nameFieldRef.current.focus();
  }, [nameFieldRef]);

  const clickAwayProps = useClickAwayListener(
    [nameFieldRef, buttonRef],
    onClose,
    handleClickAwayCancel,
  );

  useEffect(() => {
    if (isOpened) {
      focusEnd(nameFieldRef.current);
    }
  }, [isOpened, nameFieldRef]);

  useDidUpdate(() => {
    nameFieldRef.current.focus();
  }, [focusNameFieldState]);

  if (!isOpened) {
    return children;
  }

  return (
    <Form className={styles.wrapper} onSubmit={handleSubmit}>
      <TextArea
        {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
        ref={handleNameFieldRef}
        as={TextareaAutosize}
        name="name"
        value={data.name}
        placeholder={t('common.enterTaskDescription')}
        maxLength={1024}
        minRows={2}
        spellCheck={false}
        className={styles.field}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
      />
      <div className={styles.controls}>
        <Button
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          positive
          ref={handleButtonRef}
          content={t('action.addTask')}
        />
      </div>
    </Form>
  );
});

AddTask.propTypes = {
  children: PropTypes.element.isRequired,
  taskListId: PropTypes.string.isRequired,
  isOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddTask;
