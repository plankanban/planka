/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Icon, Input } from 'semantic-ui-react';
import { useClickAwayListener, useDidUpdate, useToggle } from '../../../../lib/hooks';
import { usePopup } from '../../../../lib/popup';

import entryActions from '../../../../entry-actions';
import { useClosable, useForm, useNestedRef } from '../../../../hooks';
import { ListTypes } from '../../../../constants/Enums';
import { ListTypeIcons } from '../../../../constants/Icons';
import SelectListTypeStep from '../../../lists/SelectListTypeStep';

import styles from './AddList.module.scss';

const DEFAULT_DATA = {
  name: '',
  type: ListTypes.ACTIVE,
};

const AddList = React.memo(({ onClose }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();
  const [isClosableActiveRef, activateClosable, deactivateClosable] = useClosable();

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');
  const [submitButtonRef, handleSubmitButtonRef] = useNestedRef();
  const [selectTypeButtonRef, handleSelectTypeButtonRef] = useNestedRef();

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameFieldRef.current.select();
      return;
    }

    dispatch(entryActions.createListInCurrentBoard(cleanData));
    setData(DEFAULT_DATA);
    focusNameField();
  }, [dispatch, data, setData, focusNameField, nameFieldRef]);

  const handleTypeSelect = useCallback(
    (type) => {
      setData((prevData) => ({
        ...prevData,
        type,
      }));
    },
    [setData],
  );

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  const handleSelectTypeClose = useCallback(() => {
    deactivateClosable();
    nameFieldRef.current.focus();
  }, [deactivateClosable, nameFieldRef]);

  const handleAwayClick = useCallback(() => {
    if (isClosableActiveRef.current) {
      return;
    }

    onClose();
  }, [onClose, isClosableActiveRef]);

  const handleClickAwayCancel = useCallback(() => {
    nameFieldRef.current.focus();
  }, [nameFieldRef]);

  const clickAwayProps = useClickAwayListener(
    [nameFieldRef, submitButtonRef, selectTypeButtonRef],
    handleAwayClick,
    handleClickAwayCancel,
  );

  useEffect(() => {
    nameFieldRef.current.focus();
  }, [nameFieldRef]);

  useDidUpdate(() => {
    nameFieldRef.current.focus();
  }, [focusNameFieldState]);

  const SelectListTypePopup = usePopup(SelectListTypeStep, {
    onOpen: activateClosable,
    onClose: handleSelectTypeClose,
  });

  return (
    <Form className={styles.wrapper} onSubmit={handleSubmit}>
      <Input
        {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
        ref={handleNameFieldRef}
        name="name"
        value={data.name}
        placeholder={t('common.enterListTitle')}
        maxLength={128}
        className={styles.field}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
      />
      <div className={styles.controls}>
        <Button
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          positive
          ref={handleSubmitButtonRef}
          content={t('action.addList')}
          className={styles.button}
        />
        <SelectListTypePopup defaultValue={data.type} onSelect={handleTypeSelect}>
          <Button
            {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
            ref={handleSelectTypeButtonRef}
            type="button"
            className={classNames(styles.button, styles.selectTypeButton)}
          >
            <Icon name={ListTypeIcons[data.type]} className={styles.selectTypeButtonIcon} />
            {t(`common.${data.type}`)}
          </Button>
        </SelectListTypePopup>
      </div>
    </Form>
  );
});

AddList.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddList;
