import React, { useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import SimpleMDE from 'react-simplemde-editor';
import { useClickAwayListener } from '../../lib/hooks';

import { useNestedRef } from '../../hooks';

import styles from './DescriptionEdit.module.scss';

const DescriptionEdit = React.forwardRef(({ children, defaultValue, onUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [value, setValue] = useState(null);

  const editorWrapperRef = useRef(null);
  const codemirrorRef = useRef(null);
  const [buttonRef, handleButtonRef] = useNestedRef();

  const open = useCallback(() => {
    setIsOpened(true);
    setValue(defaultValue || '');
  }, [defaultValue, setValue]);

  const close = useCallback(() => {
    const cleanValue = value.trim() || null;

    if (cleanValue !== defaultValue) {
      onUpdate(cleanValue);
    }

    setIsOpened(false);
    setValue(null);
  }, [defaultValue, onUpdate, value, setValue]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleChildrenClick = useCallback(() => {
    if (!window.getSelection().toString()) {
      open();
    }
  }, [open]);

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        close();
      }
    },
    [close],
  );

  const handleSubmit = useCallback(() => {
    close();
  }, [close]);

  const handleAwayClick = useCallback(() => {
    if (!isOpened) {
      return;
    }

    close();
  }, [isOpened, close]);

  const handleClickAwayCancel = useCallback(() => {
    codemirrorRef.current.focus();
  }, []);

  const clickAwayProps = useClickAwayListener(
    [editorWrapperRef, buttonRef],
    handleAwayClick,
    handleClickAwayCancel,
  );

  const handleGetCodemirrorInstance = useCallback((codemirror) => {
    codemirrorRef.current = codemirror;
  }, []);

  const mdEditorOptions = useMemo(
    () => ({
      autoDownloadFontAwesome: false,
      autofocus: true,
      spellChecker: false,
      status: false,
      toolbar: [
        'bold',
        'italic',
        'heading',
        'strikethrough',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        'table',
        '|',
        'link',
        'image',
        '|',
        'undo',
        'redo',
        '|',
        'guide',
      ],
    }),
    [],
  );

  if (!isOpened) {
    return React.cloneElement(children, {
      onClick: handleChildrenClick,
    });
  }

  return (
    <Form onSubmit={handleSubmit}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <div {...clickAwayProps} ref={editorWrapperRef}>
        <SimpleMDE
          value={value}
          options={mdEditorOptions}
          placeholder={t('common.enterDescription')}
          className={styles.field}
          getCodemirrorInstance={handleGetCodemirrorInstance}
          onKeyDown={handleFieldKeyDown}
          onChange={setValue}
        />
      </div>
      <div className={styles.controls}>
        <Button positive ref={handleButtonRef} content={t('action.save')} />
      </div>
    </Form>
  );
});

DescriptionEdit.propTypes = {
  children: PropTypes.element.isRequired,
  defaultValue: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
};

DescriptionEdit.defaultProps = {
  defaultValue: undefined,
};

export default React.memo(DescriptionEdit);
