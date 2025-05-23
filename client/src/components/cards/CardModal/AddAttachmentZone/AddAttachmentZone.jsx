/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { closePopup } from '../../../../lib/popup';

import entryActions from '../../../../entry-actions';
import { useModal } from '../../../../hooks';
import { isUrl } from '../../../../utils/validator';
import { isActiveTextElement } from '../../../../utils/element-helpers';
import { AttachmentTypes } from '../../../../constants/Enums';
import AddTextFileModal from './AddTextFileModal';

import styles from './AddAttachmentZone.module.scss';

const AddAttachmentZone = React.memo(({ children }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [modal, openModal, handleModalClose] = useModal();

  const submitFile = useCallback(
    (file) => {
      dispatch(
        entryActions.createAttachmentInCurrentCard({
          file,
          type: AttachmentTypes.FILE,
          name: file.name,
        }),
      );
    },
    [dispatch],
  );

  const submitLink = useCallback(
    (url) => {
      dispatch(
        entryActions.createAttachmentInCurrentCard({
          url,
          type: AttachmentTypes.LINK,
          name: url,
        }),
      );
    },
    [dispatch],
  );

  const handleDropAccepted = useCallback(
    (files) => {
      files.forEach((file) => {
        submitFile(file);
      });
    },
    [submitFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDropAccepted: handleDropAccepted,
  });

  const handleFileCreate = useCallback(
    (file) => {
      submitFile(file);
    },
    [submitFile],
  );

  useEffect(() => {
    const handlePaste = (event) => {
      if (!event.clipboardData) {
        return;
      }

      const { files, items } = event.clipboardData;

      if (files.length > 0) {
        [...files].forEach((file) => {
          submitFile(file);
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

        items[0].getAsString((content) => {
          if (isUrl(content)) {
            submitLink(content);
          } else {
            closePopup();

            openModal({
              content,
            });
          }
        });

        return;
      }

      [...items].forEach((item) => {
        if (item.kind !== 'file') {
          return;
        }

        submitFile(item.getAsFile());
      });
    };

    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [openModal, submitFile, submitLink]);

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
        <AddTextFileModal
          content={modal.content}
          onCreate={handleFileCreate}
          onClose={handleModalClose}
        />
      )}
    </>
  );
});

AddAttachmentZone.propTypes = {
  children: PropTypes.element.isRequired,
};

export default AddAttachmentZone;
