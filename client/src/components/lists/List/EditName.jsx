/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import TextareaAutosize from 'react-textarea-autosize';
import { TextArea } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useField, useNestedRef } from '../../../hooks';
import { focusEnd } from '../../../utils/element-helpers';

import styles from './EditName.module.scss';

const EditName = React.memo(({ listId, onClose }) => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const defaultValue = useSelector((state) => selectListById(state, listId).name);

  const dispatch = useDispatch();
  const [value, handleFieldChange] = useField(defaultValue);

  const [fieldRef, handleFieldRef] = useNestedRef();

  const submit = useCallback(() => {
    const cleanValue = value.trim();

    if (cleanValue && cleanValue !== defaultValue) {
      dispatch(
        entryActions.updateList(listId, {
          name: cleanValue,
        }),
      );
    }

    onClose();
  }, [listId, defaultValue, dispatch, value, onClose]);

  const handleFieldClick = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const handleFieldKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          submit();

          break;
        case 'Escape':
          submit();

          break;
        default:
      }
    },
    [submit],
  );

  const handleFieldBlur = useCallback(() => {
    submit();
  }, [submit]);

  useEffect(() => {
    focusEnd(fieldRef.current);
  }, [fieldRef]);

  return (
    <TextArea
      ref={handleFieldRef}
      as={TextareaAutosize}
      value={value}
      maxLength={128}
      className={styles.field}
      onClick={handleFieldClick}
      onKeyDown={handleFieldKeyDown}
      onChange={handleFieldChange}
      onBlur={handleFieldBlur}
    />
  );
});

EditName.propTypes = {
  listId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditName;
