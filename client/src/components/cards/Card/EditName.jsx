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
import { useClickAwayListener } from '../../../lib/hooks';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useField, useNestedRef } from '../../../hooks';
import { focusEnd } from '../../../utils/element-helpers';

import styles from './EditName.module.scss';

const EditName = React.memo(({ cardId, onClose }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const defaultValue = useSelector((state) => selectCardById(state, cardId).name);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [value, handleFieldChange] = useField(defaultValue);

  const [fieldRef, handleFieldRef] = useNestedRef();
  const [buttonRef, handleButtonRef] = useNestedRef();

  const submit = useCallback(() => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      fieldRef.current.select();
      return;
    }

    if (cleanValue !== defaultValue) {
      dispatch(
        entryActions.updateCard(cardId, {
          name: cleanValue,
        }),
      );
    }

    onClose();
  }, [cardId, onClose, defaultValue, dispatch, value, fieldRef]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleFieldKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          submit();

          break;
        case 'Escape':
          onClose();

          break;
        default:
      }
    },
    [onClose, submit],
  );

  const handleClickAwayCancel = useCallback(() => {
    fieldRef.current.focus();
  }, [fieldRef]);

  const clickAwayProps = useClickAwayListener(
    [fieldRef, buttonRef],
    onClose,
    handleClickAwayCancel,
  );

  useEffect(() => {
    focusEnd(fieldRef.current);
  }, [fieldRef]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={styles.fieldWrapper}>
        <TextArea
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          ref={handleFieldRef}
          as={TextareaAutosize}
          value={value}
          maxLength={1024}
          minRows={3}
          maxRows={8}
          className={styles.field}
          onKeyDown={handleFieldKeyDown}
          onChange={handleFieldChange}
        />
      </div>
      <div>
        <Button
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          positive
          ref={handleButtonRef}
          content={t('action.save')}
          className={styles.submitButton}
        />
      </div>
    </Form>
  );
});

EditName.propTypes = {
  cardId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditName;
