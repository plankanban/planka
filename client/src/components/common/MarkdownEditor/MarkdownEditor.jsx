/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  useMarkdownEditor,
  wysiwygToolbarConfigs,
  MarkdownEditorView,
} from '@gravity-ui/markdown-editor';
/* eslint-disable import/no-unresolved */
import { full as toolbarsPreset } from '@gravity-ui/markdown-editor/_/modules/toolbars/presets';
import { ActionName } from '@gravity-ui/markdown-editor/_/bundle/config/action-names';
/* eslint-enable import/no-unresolved */

import { EditorModes } from '../../../constants/Enums';

import styles from './MarkdownEditor.module.scss';

const removedActionNamesSet = new Set([
  ActionName.checkbox,
  ActionName.file,
  ActionName.filePopup,
  ActionName.tabs,
]);

removedActionNamesSet.forEach((actionName) => {
  delete toolbarsPreset.items[actionName];

  Object.entries(toolbarsPreset.orders).forEach(([orderName, order]) => {
    order.forEach((actions, actionsIndex) => {
      toolbarsPreset.orders[orderName][actionsIndex] = actions.filter(
        (action) => action.id || action !== actionName,
      );
    });
  });
});

const commandMenuActions = wysiwygToolbarConfigs.wCommandMenuConfig.filter(
  (action) => !removedActionNamesSet.has(action.id),
);

export const fileToBase64Data = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const fileUploadHandler = async (file) => {
  const base64Data = await fileToBase64Data(file);
  return { url: base64Data };
};

const MarkdownEditor = React.forwardRef(
  (
    { defaultValue, defaultMode, isError, onChange, onSubmit, onCancel, onModeChange, ...props },
    ref,
  ) => {
    const wrapperRef = useRef(null);

    const handleWrapperRef = useCallback(
      (element) => {
        wrapperRef.current = element;

        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element; // eslint-disable-line no-param-reassign
        }
      },
      [ref],
    );

    const editor = useMarkdownEditor({
      md: {
        breaks: true,
        linkify: true,
      },
      handlers: {
        uploadFile: fileUploadHandler,
      },
      wysiwygConfig: {
        extensionOptions: {
          commandMenu: {
            actions: commandMenuActions,
          },
        },
      },
      initial: {
        markup: defaultValue,
        mode: defaultMode,
      },
    });

    useEffect(() => {
      const handleChange = () => {
        onChange(editor.getValue());
      };

      const handleSubmit = () => {
        onSubmit();
      };

      const handleCancel = () => {
        onCancel();
      };

      const handleModeChange = ({ mode: nextMode }) => {
        if (onModeChange) {
          onModeChange(nextMode);
        }
      };

      editor.on('change', handleChange);
      editor.on('submit', handleSubmit);
      editor.on('cancel', handleCancel);
      editor.on('change-editor-mode', handleModeChange);

      return () => {
        editor.off('change', handleChange);
        editor.off('submit', handleSubmit);
        editor.off('cancel', handleCancel);
        editor.off('change-editor-mode', handleModeChange);
      };
    }, [onChange, onSubmit, onCancel, onModeChange, editor]);

    useEffect(() => {
      const { current: wrapperElement } = wrapperRef;

      const handlePaste = (event) => {
        event.stopPropagation();
      };

      wrapperElement.addEventListener('paste', handlePaste);

      return () => {
        wrapperElement.removeEventListener('paste', handlePaste);
      };
    }, []);

    return (
      <div
        {...props} // eslint-disable-line react/jsx-props-no-spreading
        ref={handleWrapperRef}
        className={classNames(styles.wrapper, isError && styles.wrapperError)}
      >
        <MarkdownEditorView
          autofocus
          stickyToolbar
          editor={editor}
          toolbarsPreset={toolbarsPreset}
          className={styles.editor}
        />
      </div>
    );
  },
);

MarkdownEditor.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  defaultMode: PropTypes.oneOf(Object.values(EditorModes)),
  isError: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onModeChange: PropTypes.func,
};

MarkdownEditor.defaultProps = {
  defaultMode: EditorModes.WYSIWYG,
  isError: false,
  onModeChange: undefined,
};

export default React.memo(MarkdownEditor);
