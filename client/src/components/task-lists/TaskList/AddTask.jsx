/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Dropdown, Form, Icon, TextArea } from 'semantic-ui-react';
import { useClickAwayListener, useDidUpdate, useToggle } from '../../../lib/hooks';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useForm, useNestedRef } from '../../../hooks';
import { focusEnd } from '../../../utils/element-helpers';
import { isModifierKeyPressed } from '../../../utils/event-helpers';

import styles from './AddTask.module.scss';

const DEFAULT_DATA = {
  name: '',
  linkedCardId: null,
};

const MULTIPLE_REGEX = /\s*\r?\n\s*/;

const AddTask = React.memo(({ children, taskListId, isOpened, onClose }) => {
  const cards = useSelector(selectors.selectCardsExceptCurrentForCurrentBoard);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [isLinkingToCard, toggleLinkingToCard] = useToggle();
  const [focusFieldState, focusField] = useToggle();

  const [fieldRef, handleFieldRef] = useNestedRef();
  const [submitButtonRef, handleSubmitButtonRef] = useNestedRef();
  const [toggleLinkingButtonRef, handleToggleLinkingButtonRef] = useNestedRef();

  const submit = useCallback(
    (isMultiple = false) => {
      const cleanData = {
        ...data,
        name: data.name.trim(),
      };

      if (isLinkingToCard) {
        if (!cleanData.linkedCardId) {
          fieldRef.current.querySelector('.search').focus();
          return;
        }

        delete cleanData.name;
      } else {
        if (!cleanData.name) {
          fieldRef.current.select();
          return;
        }

        delete cleanData.linkedCardId;
      }

      if (!isLinkingToCard && isMultiple) {
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
      focusField();
    },
    [taskListId, dispatch, data, setData, isLinkingToCard, focusField, fieldRef],
  );

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        if (!isLinkingToCard) {
          event.preventDefault();
          submit(isModifierKeyPressed(event));
        }
      } else if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose, isLinkingToCard, submit],
  );

  const handleToggleLinkingClick = useCallback(() => {
    toggleLinkingToCard();
  }, [toggleLinkingToCard]);

  const handleClickAwayCancel = useCallback(() => {
    if (isLinkingToCard) {
      fieldRef.current.querySelector('.search').focus();
    } else {
      focusEnd(fieldRef.current);
    }
  }, [isLinkingToCard, fieldRef]);

  const clickAwayProps = useClickAwayListener(
    [fieldRef, submitButtonRef, toggleLinkingButtonRef],
    onClose,
    handleClickAwayCancel,
  );

  useEffect(() => {
    if (isOpened) {
      if (isLinkingToCard) {
        fieldRef.current.querySelector('.search').focus();
      } else {
        focusEnd(fieldRef.current);
      }
    }
  }, [isOpened, isLinkingToCard, fieldRef]);

  useDidUpdate(() => {
    fieldRef.current.focus();
  }, [focusFieldState]);

  if (!isOpened) {
    return children;
  }

  return (
    <Form className={styles.wrapper} onSubmit={handleSubmit}>
      {isLinkingToCard ? (
        <Dropdown
          fluid
          selection
          search
          ref={handleFieldRef}
          name="linkedCardId"
          options={cards.map((card) => ({
            text: card.name,
            value: card.id,
          }))}
          value={data.linkedCardId}
          placeholder={t('common.searchCards')}
          minCharacters={1}
          closeOnBlur={false}
          closeOnEscape={false}
          noResultsMessage={t('common.noCardsFound')}
          className={styles.field}
          onKeyDown={handleFieldKeyDown}
          onChange={handleFieldChange}
        />
      ) : (
        <TextArea
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          ref={handleFieldRef}
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
      )}
      <div className={styles.controls}>
        <Button
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          positive
          ref={handleSubmitButtonRef}
          content={t('action.addTask')}
        />
        <Button
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          ref={handleToggleLinkingButtonRef}
          type="button"
          className={styles.toggleLinkingButton}
          onClick={handleToggleLinkingClick}
        >
          <Icon
            name={isLinkingToCard ? 'align left' : 'exchange'}
            className={styles.toggleLinkingButtonIcon}
          />
          {isLinkingToCard ? t('common.description') : t('common.linkToCard')}
        </Button>
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
