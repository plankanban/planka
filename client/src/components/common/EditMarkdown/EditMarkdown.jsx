/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { useClickAwayListener } from '../../../lib/hooks';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useNestedRef } from '../../../hooks';
import MarkdownEditor from '../MarkdownEditor';

import styles from './EditMarkdown.module.scss';

const MAX_LENGTH = 1048576;

const EditMarkdown = React.memo(({ defaultValue, draftValue, onUpdate, onClose }) => {
  const defaultMode = useSelector((state) => selectors.selectCurrentUser(state).defaultEditorMode);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [value, setValue] = useState(() => draftValue || defaultValue || '');

  const fieldRef = useRef(null);
  const [submitButtonRef, handleSubmitButtonRef] = useNestedRef();
  const [cancelButtonRef, handleCancelButtonRef] = useNestedRef();

  const handleModeChange = useCallback(
    (mode) => {
      dispatch(
        entryActions.updateCurrentUser({
          defaultEditorMode: mode,
        }),
      );
    },
    [dispatch],
  );

  const isExceeded = value.length > MAX_LENGTH;

  const submit = useCallback(() => {
    const cleanValue = value.trim() || null;

    if (!isExceeded && cleanValue !== defaultValue) {
      onUpdate(cleanValue);
    }

    onClose(isExceeded ? cleanValue : null);
  }, [onUpdate, onClose, defaultValue, value, isExceeded]);

  const handleChange = useCallback((nextValue) => {
    setValue(nextValue);
  }, []);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleCancel = useCallback(() => {
    submit();
  }, [submit]);

  const handleCancelClick = useCallback(() => {
    onClose(null);
  }, [onClose]);

  const handleClickAwayCancel = useCallback(() => {
    fieldRef.current.focus();
  }, [fieldRef]);

  const clickAwayProps = useClickAwayListener(
    [fieldRef, submitButtonRef, cancelButtonRef],
    submit,
    handleClickAwayCancel,
  );

  return (
    <>
      <MarkdownEditor
        {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
        ref={fieldRef}
        defaultValue={value}
        defaultMode={defaultMode}
        isError={isExceeded}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onModeChange={handleModeChange}
      />
      <Form onSubmit={handleSubmit}>
        <div className={styles.controls}>
          <Button
            {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
            positive
            ref={handleSubmitButtonRef}
            content={
              isExceeded
                ? t('common.contentExceedsLimit', {
                    limit: '1MB',
                  })
                : t('action.save')
            }
            disabled={isExceeded}
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
    </>
  );
});

EditMarkdown.propTypes = {
  defaultValue: PropTypes.string,
  draftValue: PropTypes.string,
  // placeholder: PropTypes.string.isRequired, // TODO: remove?
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

EditMarkdown.defaultProps = {
  defaultValue: undefined,
  draftValue: undefined,
};

export default EditMarkdown;
