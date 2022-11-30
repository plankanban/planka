import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea, Icon } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../lib/hooks';
import { useClosableForm, useForm } from '../../hooks';
import styles from './CardAdd.module.scss';

const DEFAULT_DATA = {
  name: '',
};
const CardAdd = React.memo(({ isOpened, onCreate, onClose }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();

  const nameField = useRef(null);

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.ref.current.select();
      return;
    }

    onCreate(cleanData);

    setData(DEFAULT_DATA);
    focusNameField();
  }, [onCreate, data, setData, focusNameField]);

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

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut] = useClosableForm(onClose);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);
  useEffect(() => {
    if (isOpened) {
      nameField.current.ref.current.focus();
    }
  }, [isOpened]);
  useDidUpdate(() => {
    nameField.current.ref.current.focus();
  }, [focusNameFieldState]);
  const copyfun = () => {
    navigator.clipboard.writeText(data.name);
  };
  return (
    <Form
      className={classNames(styles.wrapper, !isOpened && styles.wrapperClosed)}
      onSubmit={handleSubmit}
    >
      <div className={styles.fieldWrapper}>
        <TextArea
          ref={nameField}
          as={TextareaAutosize}
          name="name"
          value={data.name}
          placeholder={t('common.enterCardTitle')}
          minRows={3}
          spellCheck={false}
          className={styles.field}
          onKeyDown={handleFieldKeyDown}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
        />
      </div>
      <div className={styles.controls}>
        <Button
          onClick={copyfun}
          onMouseOver={handleControlMouseOver}
          onMouseOut={handleControlMouseOut}
        >
          <Icon fitted name="copy" size="small" />
        </Button>
        {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
        <Button
          positive
          content={t('action.addCard')}
          className={styles.submitButton}
          onMouseOver={handleControlMouseOver}
          onMouseOut={handleControlMouseOut}
        />
      </div>
    </Form>
  );
});

CardAdd.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CardAdd;
