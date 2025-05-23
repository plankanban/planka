/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';

import styles from './AddImageZone.module.scss';

const AddImageZone = React.memo(({ children, onCreate }) => {
  const [t] = useTranslation();

  const handleDropAccepted = useCallback(
    (files) => {
      onCreate(files[0]);
    },
    [onCreate],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': [],
    },
    multiple: false,
    noClick: true,
    noKeyboard: true,
    onDropAccepted: handleDropAccepted,
  });

  useEffect(() => {
    const handlePaste = (event) => {
      if (!event.clipboardData) {
        return;
      }

      const file = event.clipboardData.files[0];

      if (file) {
        if (!file.type.startsWith('image/')) {
          return;
        }

        onCreate(file);
        return;
      }

      const item = event.clipboardData.items[0];

      if (!item || !item.type.startsWith('image/')) {
        return;
      }

      if (item.kind === 'file') {
        onCreate(item.getAsFile());
      }
    };

    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [onCreate]);

  return (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <div {...getRootProps()}>
      {isDragActive && <div className={styles.dropzone}>{t('common.dropFileToUpload')}</div>}
      {children}
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <input {...getInputProps()} />
    </div>
  );
});

AddImageZone.propTypes = {
  children: PropTypes.node.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default AddImageZone;
