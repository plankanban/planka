import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { closePopup } from '../../../lib/popup';

import { useModal } from '../../../hooks';
import { isActiveTextElement } from '../../../utils/element-helpers';
import TextFileAddModal from './TextFileAddModal';

import styles from './AttachmentAddZone.module.scss';

const AttachmentAddZone = React.memo(({ children, onCreate }) => {
  const [t] = useTranslation();
  const [modal, openModal, handleModalClose] = useModal();

  const submit = useCallback(
    (file) => {
      onCreate({
        file,
      });
    },
    [onCreate],
  );

  const handleDropAccepted = useCallback(
    (files) => {
      files.forEach((file) => {
        submit(file);
      });
    },
    [submit],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDropAccepted: handleDropAccepted,
  });

  const handleFileCreate = useCallback(
    (file) => {
      submit(file);
    },
    [submit],
  );

  useEffect(() => {
    const handlePaste = (event) => {
      if (!event.clipboardData) {
        return;
      }

      const { files, items } = event.clipboardData;

      if (files.length > 0) {
        [...files].forEach((file) => {
          submit(file);
        });

        return;
      }

      if (items.length === 0) {
        return;
      }

      if (items[0].kind === 'string') {
        if (isActiveTextElement(event.target)) {
          return;
        }

        closePopup();
        event.preventDefault();

        items[0].getAsString((content) => {
          openModal({
            content,
          });
        });

        return;
      }

      [...items].forEach((item) => {
        if (item.kind !== 'file') {
          return;
        }

        submit(item.getAsFile());
      });
    };

    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [openModal, submit]);

  return (
    <>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <div {...getRootProps()}>
        {isDragActive && <div className={styles.dropzone}>{t('common.dropFileToUpload')}</div>}
        {children}
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <input {...getInputProps()} />
      </div>
      {modal && (
        <TextFileAddModal
          content={modal.content}
          onCreate={handleFileCreate}
          onClose={handleModalClose}
        />
      )}
    </>
  );
});

AttachmentAddZone.propTypes = {
  children: PropTypes.element.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default AttachmentAddZone;
