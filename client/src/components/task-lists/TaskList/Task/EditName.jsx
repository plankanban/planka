/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea } from 'semantic-ui-react';
import { useClickAwayListener } from '../../../../lib/hooks';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useField, useNestedRef } from '../../../../hooks';
import { focusEnd } from '../../../../utils/element-helpers';

import styles from './EditName.module.scss';

const EditName = React.memo(({ taskId, onClose }) => {
  const selectTaskById = useMemo(() => selectors.makeSelectTaskById(), []);

  const defaultValue = useSelector((state) => selectTaskById(state, taskId).name);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [value, handleFieldChange] = useField(defaultValue);

  const [fieldRef, handleFieldRef] = useNestedRef();
  const [buttonRef, handleButtonRef] = useNestedRef();

  const submit = useCallback(() => {
    const cleanValue = value.trim();

    if (cleanValue && cleanValue !== defaultValue) {
      dispatch(
        entryActions.updateTask(taskId, {
          name: cleanValue,
        }),
      );
    }

    onClose();
  }, [taskId, onClose, defaultValue, dispatch, value]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submit();
      } else if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose, submit],
  );

  const handleClickAwayCancel = useCallback(() => {
    fieldRef.current.focus();
  }, [fieldRef]);

  const clickAwayProps = useClickAwayListener([fieldRef, buttonRef], submit, handleClickAwayCancel);

  useEffect(() => {
    focusEnd(fieldRef.current);
  }, [fieldRef]);

  return (
    <Form onSubmit={handleSubmit} className={styles.wrapper}>
      <TextArea
        {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
        ref={handleFieldRef}
        as={TextareaAutosize}
        value={value}
        maxLength={1024}
        minRows={2}
        className={styles.field}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
      />
      <div className={styles.controls}>
        <Button
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          ref={handleButtonRef}
          positive
          content={t('action.save')}
        />
      </div>
    </Form>
  );
});

EditName.propTypes = {
  taskId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditName;
